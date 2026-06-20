import type { Prisma } from "@prisma/client";

export {
  isTransferenciaRecibida,
  TRANSFERENCIAS_RECIBIDAS_HEADERS,
} from "@/lib/transferencias-recibidas-shared";

export function buildTransferenciasRecibidasWhere(
  search?: string
): Prisma.BankMovementWhereInput {
  const base: Prisma.BankMovementWhereInput = {
    amount: { gt: 0 },
    OR: [
      { concept: { startsWith: "Transferencia recibida", mode: "insensitive" } },
      { concept: { startsWith: "Transferencias recibidas", mode: "insensitive" } },
    ],
  };

  const query = search?.trim();
  if (!query) return base;

  return {
    AND: [
      base,
      {
        OR: [
          { concept: { contains: query, mode: "insensitive" } },
          { reference: { contains: query, mode: "insensitive" } },
        ],
      },
    ],
  };
}
