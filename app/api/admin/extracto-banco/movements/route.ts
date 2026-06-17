import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import {
  getStatementConfig,
  parseDateInput,
  parseMovementDate,
} from "@/lib/bank-statement-config";
import {
  buildMovementWhere,
  computeTotalBalance,
  createMovement,
  parseMovementsCsv,
  serializeMovement,
  bankMovementSelect,
  type BankMovementInput,
} from "@/lib/bank-movements";

export async function GET(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const from = parseDateInput(searchParams.get("from") ?? "");
  const to = parseDateInput(searchParams.get("to") ?? "");
  const bankAccountId = searchParams.get("accountId") ?? undefined;

  const where = buildMovementWhere({
    search,
    from: from ?? undefined,
    to: to ?? undefined,
    bankAccountId: bankAccountId || undefined,
  });

  const [config, movements, allForTotal] = await Promise.all([
    getStatementConfig(),
    prisma.bankMovement.findMany({
      where,
      orderBy: [{ movementDate: "desc" }, { createdAt: "desc" }],
      select: bankMovementSelect,
    }),
    prisma.bankMovement.findMany({
      orderBy: [{ movementDate: "desc" }, { createdAt: "desc" }],
      select: bankMovementSelect,
    }),
  ]);

  const serialized = movements.map(serializeMovement);
  const totalBalance = computeTotalBalance(
    allForTotal.map(serializeMovement),
    config.initialBalance
  );

  return NextResponse.json({
    config,
    movements: serialized,
    totalBalance,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const {
    movementDate,
    branchCode,
    branchDescription,
    operationCode,
    reference,
    concept,
    amount,
    runningBalance,
    bankAccountId,
  } = body as {
    movementDate?: string;
    branchCode?: string;
    branchDescription?: string;
    operationCode?: string;
    reference?: string;
    concept?: string;
    amount?: number;
    runningBalance?: number | null;
    bankAccountId?: string | null;
  };

  const parsedDate = movementDate
    ? parseDateInput(movementDate) ?? parseMovementDate(movementDate)
    : null;
  if (!parsedDate) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  if (!concept?.trim()) {
    return NextResponse.json({ error: "Concepto obligatorio" }, { status: 400 });
  }

  if (amount === undefined || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
  }

  const input: BankMovementInput = {
    movementDate: parsedDate,
    branchCode,
    branchDescription,
    operationCode,
    reference,
    concept,
    amount,
    runningBalance: runningBalance ?? null,
    bankAccountId: bankAccountId ?? null,
  };

  const created = await createMovement(input);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { csv } = body as { csv?: string };

  if (!csv?.trim()) {
    return NextResponse.json(
      { error: "No se recibió contenido para importar" },
      { status: 400 }
    );
  }

  const accounts = await prisma.bankAccount.findMany({
    select: { id: true, name: true, operatingCode: true, active: true },
  });

  const { rows, errors } = parseMovementsCsv(csv, accounts);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No hay filas válidas para importar" },
      { status: 400 }
    );
  }

  const created = await prisma.$transaction(async (tx) => {
    const results = [];
    for (const row of rows) {
      const movement = await tx.bankMovement.create({
        data: {
          movementDate: row.movementDate,
          branchCode: row.branchCode ?? "",
          branchDescription: row.branchDescription ?? "",
          operationCode: row.operationCode ?? "",
          reference: row.reference ?? "",
          concept: row.concept,
          amount: row.amount,
          runningBalance: row.runningBalance ?? null,
          bankAccountId: row.bankAccountId ?? null,
        },
        select: bankMovementSelect,
      });
      results.push(movement);
    }
    return results;
  });

  return NextResponse.json({
    imported: created.length,
    movements: created.map(serializeMovement),
  });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const { ids } = body as { ids?: string[] };

  if (!ids?.length) {
    return NextResponse.json({ error: "Sin movimientos seleccionados" }, { status: 400 });
  }

  const result = await prisma.bankMovement.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ deleted: result.count });
}
