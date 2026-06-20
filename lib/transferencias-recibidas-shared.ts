export const TRANSFERENCIAS_RECIBIDAS_HEADERS = [
  "Fecha",
  "Referencia",
  "Concepto",
  "Importe",
  "Saldo",
] as const;

export function isTransferenciaRecibida(
  concept: string,
  amount: number | string | { toString(): string }
): boolean {
  const numericAmount =
    typeof amount === "number" ? amount : Number(amount.toString());

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return false;
  }

  return /^transferencias?\s+recibid/i.test(concept.trim());
}
