import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { parseDateInput, parseMovementDate } from "@/lib/bank-statement-config";
import { updateMovementRecord } from "@/lib/bank-movements";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existing = await prisma.bankMovement.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 });
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

  let parsedDate: Date | undefined;
  if (movementDate !== undefined) {
    const date =
      parseDateInput(movementDate) ?? parseMovementDate(movementDate);
    if (!date) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }
    parsedDate = date;
  }

  if (amount !== undefined && !Number.isFinite(amount)) {
    return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
  }

  try {
    const updated = await updateMovementRecord(params.id, {
      movementDate: parsedDate,
      branchCode,
      branchDescription,
      operationCode,
      reference,
      concept,
      amount,
      runningBalance,
      bankAccountId,
    });
    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existing = await prisma.bankMovement.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 });
  }

  await prisma.bankMovement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
