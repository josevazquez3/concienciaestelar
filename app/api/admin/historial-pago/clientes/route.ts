import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { decimalToNumber } from "@/lib/bank-statement-config";
import { buildTransferenciasRecibidasWhere } from "@/lib/transferencias-recibidas";
import {
  buildClientesFromConcepts,
  filterClientesBySearch,
} from "@/lib/historial-pago";

export async function GET(request: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;

  const movements = await prisma.bankMovement.findMany({
    where: buildTransferenciasRecibidasWhere(),
    select: { concept: true, amount: true },
  });

  const clientes = buildClientesFromConcepts(
    movements.map((movement) => ({
      concept: movement.concept,
      amount: decimalToNumber(movement.amount) ?? 0,
    }))
  );

  const filtered = filterClientesBySearch(clientes, search);

  return NextResponse.json({
    clientes: filtered,
    count: filtered.length,
  });
}
