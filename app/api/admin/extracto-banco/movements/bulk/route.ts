import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { updateStatementConfig } from "@/lib/bank-statement-config";
import {
  bankMovementSelect,
  findExistingMovementReferences,
  serializeMovement,
} from "@/lib/bank-movements";

export const runtime = "nodejs";

type BulkMovementPayload = {
  movementDate: string;
  concept: string;
  reference: string;
  operationCode?: string;
  amount: number;
  runningBalance?: number | null;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { movements, updateInitialBalance, initialBalance, initialBalanceDate } =
    body as {
      movements?: BulkMovementPayload[];
      updateInitialBalance?: boolean;
      initialBalance?: number;
      initialBalanceDate?: string;
    };

  if (!movements?.length) {
    return NextResponse.json(
      { error: "No hay movimientos para importar" },
      { status: 400 }
    );
  }

  if (updateInitialBalance && initialBalance !== undefined && initialBalanceDate) {
    const balanceDate = new Date(initialBalanceDate);
    if (Number.isNaN(balanceDate.getTime())) {
      return NextResponse.json(
        { error: "Fecha de saldo inicial inválida" },
        { status: 400 }
      );
    }

    await updateStatementConfig({
      initialBalance,
      initialBalanceDate: balanceDate,
    });
  }

  const references = movements
    .map((movement) => movement.reference?.trim() ?? "")
    .filter(Boolean);

  const existingReferences = await findExistingMovementReferences(references);

  const seenInBatch = new Set<string>();
  const toInsert: Prisma.BankMovementCreateManyInput[] = [];
  let skipped = 0;

  for (const movement of movements) {
    const movementDate = new Date(movement.movementDate);
    if (Number.isNaN(movementDate.getTime()) || !movement.concept?.trim()) {
      skipped += 1;
      continue;
    }

    const reference = movement.reference?.trim() ?? "";
    if (reference) {
      if (existingReferences.has(reference) || seenInBatch.has(reference)) {
        skipped += 1;
        continue;
      }
      seenInBatch.add(reference);
    }

    const operationCode =
      movement.operationCode?.trim() ??
      (reference ? reference.slice(-4) : "");

    toInsert.push({
      movementDate,
      branchCode: "",
      branchDescription: "",
      operationCode,
      reference,
      concept: movement.concept.trim(),
      amount: movement.amount,
      runningBalance: movement.runningBalance ?? null,
    });
  }

  if (toInsert.length === 0) {
    return NextResponse.json({
      imported: 0,
      skipped,
      movements: [],
    });
  }

  await prisma.bankMovement.createMany({ data: toInsert });

  const insertedReferences = toInsert
    .map((row) => row.reference)
    .filter((ref): ref is string => Boolean(ref));

  const created =
    insertedReferences.length > 0
      ? await prisma.bankMovement.findMany({
          where: { reference: { in: insertedReferences } },
          orderBy: [{ movementDate: "desc" }, { createdAt: "desc" }],
          select: bankMovementSelect,
        })
      : [];

  return NextResponse.json({
    imported: toInsert.length,
    skipped,
    movements: created.map(serializeMovement),
  });
}
