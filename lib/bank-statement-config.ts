import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const STATEMENT_CONFIG_ID = "default";

export type StatementConfigRecord = {
  initialBalance: number;
  initialBalanceDate: string;
};

export function decimalToNumber(
  value: Prisma.Decimal | number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  return Number(value.toString());
}

export async function getStatementConfig(): Promise<StatementConfigRecord> {
  const config = await prisma.bankStatementConfig.upsert({
    where: { id: STATEMENT_CONFIG_ID },
    create: { id: STATEMENT_CONFIG_ID },
    update: {},
  });

  return {
    initialBalance: decimalToNumber(config.initialBalance) ?? 0,
    initialBalanceDate: config.initialBalanceDate.toISOString(),
  };
}

export async function updateStatementConfig(input: {
  initialBalance: number;
  initialBalanceDate: Date;
}): Promise<StatementConfigRecord> {
  const config = await prisma.bankStatementConfig.upsert({
    where: { id: STATEMENT_CONFIG_ID },
    create: {
      id: STATEMENT_CONFIG_ID,
      initialBalance: input.initialBalance,
      initialBalanceDate: input.initialBalanceDate,
    },
    update: {
      initialBalance: input.initialBalance,
      initialBalanceDate: input.initialBalanceDate,
    },
  });

  return {
    initialBalance: decimalToNumber(config.initialBalance) ?? 0,
    initialBalanceDate: config.initialBalanceDate.toISOString(),
  };
}

export function formatAmountForInput(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatStatementDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function parseArsAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let normalized = trimmed.replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma > lastDot) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = normalized.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseMovementDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateTimeMatch = trimmed.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{2,4}))?$/
  );
  if (dateTimeMatch) {
    const day = Number(dateTimeMatch[1]);
    const month = Number(dateTimeMatch[2]);
    const year = Number(dateTimeMatch[3]);
    const timeRaw = dateTimeMatch[4] ?? "0000";
    const hours = Number(timeRaw.slice(0, 2));
    const minutes = Number(timeRaw.slice(2, 4) || "0");
    const date = new Date(year, month - 1, day, hours, minutes);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const iso = new Date(trimmed);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

export function formatMovementDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value: string): Date | null {
  if (!value.trim()) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}
