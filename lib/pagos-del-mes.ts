import "server-only";

import { prisma } from "@/lib/prisma";
import {
  padronClienteSelect,
  serializePadronCliente,
} from "@/lib/clientes-padron-shared";
import { bankMovementSelect, serializeMovement } from "@/lib/bank-movements";
import { buildTransferenciasRecibidasWhere } from "@/lib/transferencias-recibidas";
import {
  buildPagosDelMesRows,
  filterPagosDelMesRows,
  type PagoDelMesRow,
} from "@/lib/pagos-del-mes-shared";

export {
  buildPagosDelMesRows,
  filterPagosDelMesRows,
  MESES_ES,
  PAGOS_DEL_MES_HEADERS,
  type PagoDelMesRow,
} from "@/lib/pagos-del-mes-shared";

export async function listPagosDelMes(options: {
  month: number;
  year: number;
  allMonths: boolean;
  search?: string;
}): Promise<{
  rows: PagoDelMesRow[];
  count: number;
  pagosCount: number;
  faltantesCount: number;
}> {
  const [clientes, movements] = await Promise.all([
    prisma.padronCliente.findMany({
      orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
      select: padronClienteSelect,
    }),
    prisma.bankMovement.findMany({
      where: buildTransferenciasRecibidasWhere(),
      orderBy: [{ movementDate: "desc" }, { createdAt: "desc" }],
      select: bankMovementSelect,
    }),
  ]);

  const serializedMovements = movements.map(serializeMovement);
  const serializedClientes = clientes.map(serializePadronCliente);

  const rows = buildPagosDelMesRows(serializedClientes, serializedMovements, {
    allMonths: options.allMonths,
    month: options.month,
    year: options.year,
  });

  const filtered = filterPagosDelMesRows(rows, options.search);
  const pagosCount = filtered.filter((row) => row.pago).length;

  return {
    rows: filtered,
    count: filtered.length,
    pagosCount,
    faltantesCount: filtered.length - pagosCount,
  };
}
