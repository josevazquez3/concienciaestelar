import {
  conceptMatchesClient,
  normalizeClientName,
} from "@/lib/historial-pago-shared";
import { isTransferenciaRecibida } from "@/lib/transferencias-recibidas-shared";

export const PAGOS_DEL_MES_HEADERS = [
  "Nombres",
  "Apellidos",
  "Mes",
  "Pgo",
] as const;

export const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export type PagoDelMesRow = {
  id: string;
  clienteId: string;
  nombres: string;
  apellidos: string;
  mes: string;
  mesKey: string;
  pago: boolean;
  movementId: string | null;
};

export type PagosDelMesMovement = {
  id: string;
  movementDate: string;
  concept: string;
  amount: number;
};

export type PagosDelMesCliente = {
  id: string;
  nombres: string;
  apellidos: string;
};

export function padronDisplayName(nombres: string, apellidos: string): string {
  return `${nombres} ${apellidos}`.trim().replace(/\s+/g, " ");
}

export function formatMesAnioFromDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${year}`;
}

export function mesKeyFromParts(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function mesKeyFromDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return mesKeyFromParts(d.getMonth() + 1, d.getFullYear());
}

export function mesLabelFromKey(mesKey: string): string {
  const [year, month] = mesKey.split("-");
  return `${month}/${year}`;
}

export function padronMatchesTransfer(
  nombres: string,
  apellidos: string,
  concept: string,
  amount: number
): boolean {
  const fullName = padronDisplayName(nombres, apellidos);
  if (!fullName) return false;
  if (!isTransferenciaRecibida(concept, amount)) return false;
  return conceptMatchesClient(concept, fullName);
}

function buildRowForClienteMonth(
  cliente: PagosDelMesCliente,
  movements: PagosDelMesMovement[],
  mesKey: string
): PagoDelMesRow {
  const matching = movements.filter((movement) => {
    if (mesKeyFromDate(movement.movementDate) !== mesKey) return false;
    return padronMatchesTransfer(
      cliente.nombres,
      cliente.apellidos,
      movement.concept,
      movement.amount
    );
  });

  const movement = matching[0] ?? null;

  return {
    id: `${cliente.id}-${mesKey}`,
    clienteId: cliente.id,
    nombres: cliente.nombres,
    apellidos: cliente.apellidos,
    mes: mesLabelFromKey(mesKey),
    mesKey,
    pago: matching.length > 0,
    movementId: movement?.id ?? null,
  };
}

function sortRows(rows: PagoDelMesRow[]): PagoDelMesRow[] {
  return [...rows].sort((a, b) => {
    const monthCmp = b.mesKey.localeCompare(a.mesKey);
    if (monthCmp !== 0) return monthCmp;
    return padronDisplayName(a.nombres, a.apellidos).localeCompare(
      padronDisplayName(b.nombres, b.apellidos),
      "es"
    );
  });
}

export function buildPagosDelMesRows(
  clientes: PagosDelMesCliente[],
  movements: PagosDelMesMovement[],
  options: { allMonths: boolean; month: number; year: number }
): PagoDelMesRow[] {
  const transferMovements = movements.filter((movement) =>
    isTransferenciaRecibida(movement.concept, movement.amount)
  );

  if (options.allMonths) {
    const monthKeys = new Set<string>();
    for (const movement of transferMovements) {
      monthKeys.add(mesKeyFromDate(movement.movementDate));
    }
    monthKeys.add(mesKeyFromParts(options.month, options.year));

    const rows: PagoDelMesRow[] = [];
    for (const mesKey of Array.from(monthKeys)) {
      for (const cliente of clientes) {
        rows.push(buildRowForClienteMonth(cliente, transferMovements, mesKey));
      }
    }
    return sortRows(rows);
  }

  const mesKey = mesKeyFromParts(options.month, options.year);
  return sortRows(
    clientes.map((cliente) =>
      buildRowForClienteMonth(cliente, transferMovements, mesKey)
    )
  );
}

export function filterPagosDelMesRows(
  rows: PagoDelMesRow[],
  search?: string
): PagoDelMesRow[] {
  const query = search?.trim().toLowerCase();
  if (!query) return rows;

  return rows.filter((row) => {
    const fullName = normalizeClientName(
      padronDisplayName(row.nombres, row.apellidos)
    );
    return (
      row.nombres.toLowerCase().includes(query) ||
      row.apellidos.toLowerCase().includes(query) ||
      fullName.includes(query) ||
      row.mes.includes(query)
    );
  });
}
