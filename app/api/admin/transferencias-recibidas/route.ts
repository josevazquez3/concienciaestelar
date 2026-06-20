import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import {
  bankMovementSelect,
  serializeMovement,
} from "@/lib/bank-movements";
import {
  buildTransferenciasRecibidasWhere,
  isTransferenciaRecibida,
} from "@/lib/transferencias-recibidas";

export async function GET(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;

  const where = buildTransferenciasRecibidasWhere(search);

  const movements = await prisma.bankMovement.findMany({
    where,
    orderBy: [{ movementDate: "desc" }, { createdAt: "desc" }],
    select: bankMovementSelect,
  });

  const serialized = movements
    .map(serializeMovement)
    .filter((movement) =>
      isTransferenciaRecibida(movement.concept, movement.amount)
    );
  const totalImporte = serialized.reduce((sum, movement) => sum + movement.amount, 0);

  return NextResponse.json({
    movements: serialized,
    count: serialized.length,
    totalImporte,
  });
}
