import type { Prisma } from "@prisma/client";
import { buildTransferenciasRecibidasWhere } from "@/lib/transferencias-recibidas";

export {
  buildClientesFromConcepts,
  conceptMatchesClient,
  extractClientNameFromConcept,
  filterClientesBySearch,
  filterMovementsByClient,
  HISTORIAL_PAGO_HEADERS,
  normalizeClientName,
  type ClienteHistorialPago,
} from "@/lib/historial-pago-shared";

export function buildHistorialPagoWhere(
  clientName: string,
  search?: string
): Prisma.BankMovementWhereInput {
  const base = buildTransferenciasRecibidasWhere();

  const clientFilter: Prisma.BankMovementWhereInput = {
    OR: [
      {
        concept: {
          startsWith: `Transferencia recibida ${clientName}`,
          mode: "insensitive",
        },
      },
      {
        concept: {
          startsWith: `Transferencias recibidas ${clientName}`,
          mode: "insensitive",
        },
      },
    ],
  };

  const query = search?.trim();
  if (!query) {
    return { AND: [base, clientFilter] };
  }

  return {
    AND: [
      base,
      clientFilter,
      {
        OR: [
          { concept: { contains: query, mode: "insensitive" } },
          { reference: { contains: query, mode: "insensitive" } },
        ],
      },
    ],
  };
}
