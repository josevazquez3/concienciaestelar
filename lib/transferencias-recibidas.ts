import type { Prisma } from "@prisma/client";

export const TRANSFERENCIAS_RECIBIDAS_HEADERS = [
  "Fecha",
  "Referencia",
  "Concepto",
  "Importe",
  "Saldo",
] as const;

export function isTransferenciaRecibida(
  concept: string,
  amount: number | Prisma.Decimal | string
): boolean {
  const numericAmount =
    typeof amount === "number" ? amount : Number(amount.toString());

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return false;
  }

  return /^transferencias?\s+recibid/i.test(concept.trim());
}

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
