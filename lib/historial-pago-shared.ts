import { isTransferenciaRecibida } from "@/lib/transferencias-recibidas-shared";

export const HISTORIAL_PAGO_HEADERS = [
  "Fecha",
  "Referencia",
  "Concepto",
  "Importe",
  "Saldo",
] as const;

const TRANSFERENCIA_RECIBIDA_PREFIX = /^transferencias?\s+recibid[ao]s?\s+/i;

export type ClienteHistorialPago = {
  name: string;
  transferCount: number;
  totalImporte: number;
};

export function normalizeClientName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function extractClientNameFromConcept(concept: string): string | null {
  const trimmed = concept.trim();
  const match = trimmed.match(TRANSFERENCIA_RECIBIDA_PREFIX);
  if (!match) return null;

  const name = trimmed.slice(match[0].length).trim();
  return name || null;
}

export function conceptMatchesClient(concept: string, clientName: string): boolean {
  const extracted = extractClientNameFromConcept(concept);
  if (!extracted) return false;
  return normalizeClientName(extracted) === normalizeClientName(clientName);
}

export function buildClientesFromConcepts(
  concepts: Array<{ concept: string; amount: number }>
): ClienteHistorialPago[] {
  const byName = new Map<string, ClienteHistorialPago>();

  for (const row of concepts) {
    if (!isTransferenciaRecibida(row.concept, row.amount)) continue;

    const name = extractClientNameFromConcept(row.concept);
    if (!name) continue;

    const key = normalizeClientName(name);
    const existing = byName.get(key);

    if (existing) {
      existing.transferCount += 1;
      existing.totalImporte += row.amount;
      continue;
    }

    byName.set(key, {
      name,
      transferCount: 1,
      totalImporte: row.amount,
    });
  }

  return Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es")
  );
}

export function filterClientesBySearch(
  clientes: ClienteHistorialPago[],
  search?: string
): ClienteHistorialPago[] {
  const query = search?.trim().toLowerCase();
  if (!query) return clientes;

  return clientes.filter((cliente) =>
    cliente.name.toLowerCase().includes(query)
  );
}

export function filterMovementsByClient<T extends { concept: string; amount: number }>(
  movements: T[],
  clientName: string
): T[] {
  return movements.filter(
    (movement) =>
      isTransferenciaRecibida(movement.concept, movement.amount) &&
      conceptMatchesClient(movement.concept, clientName)
  );
}
