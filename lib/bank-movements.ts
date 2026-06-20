import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  decimalToNumber,
  formatArs,
  formatMovementDateTime,
  parseArsAmount,
  parseMovementDate,
} from "@/lib/bank-statement-config";

export const bankMovementSelect = {
  id: true,
  movementDate: true,
  branchCode: true,
  branchDescription: true,
  operationCode: true,
  reference: true,
  concept: true,
  conceptEdited: true,
  amount: true,
  runningBalance: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BankMovementSelect;

export type BankMovementRecord = {
  id: string;
  movementDate: string;
  branchCode: string;
  branchDescription: string;
  operationCode: string;
  reference: string;
  concept: string;
  conceptEdited: boolean;
  amount: number;
  runningBalance: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BankMovementInput = {
  movementDate: Date;
  branchCode?: string;
  branchDescription?: string;
  operationCode?: string;
  reference?: string;
  concept: string;
  amount: number;
  runningBalance?: number | null;
};

export function serializeMovement(
  movement: Prisma.BankMovementGetPayload<{ select: typeof bankMovementSelect }>
): BankMovementRecord {
  return {
    id: movement.id,
    movementDate: movement.movementDate.toISOString(),
    branchCode: movement.branchCode,
    branchDescription: movement.branchDescription,
    operationCode: movement.operationCode,
    reference: movement.reference,
    concept: movement.concept,
    conceptEdited: movement.conceptEdited,
    amount: decimalToNumber(movement.amount) ?? 0,
    runningBalance: decimalToNumber(movement.runningBalance),
    createdAt: movement.createdAt.toISOString(),
    updatedAt: movement.updatedAt.toISOString(),
  };
}

export function buildMovementWhere(filters: {
  search?: string;
  from?: Date;
  to?: Date;
}): Prisma.BankMovementWhereInput {
  const where: Prisma.BankMovementWhereInput = {};

  if (filters.from || filters.to) {
    where.movementDate = {};
    if (filters.from) {
      where.movementDate.gte = filters.from;
    }
    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      where.movementDate.lte = end;
    }
  }

  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { concept: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
      { operationCode: { contains: search, mode: "insensitive" } },
      { branchCode: { contains: search, mode: "insensitive" } },
      { branchDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

export function computeTotalBalance(
  movements: BankMovementRecord[],
  initialBalance: number
): number {
  if (movements.length === 0) return initialBalance;

  const withBalance = movements.filter((m) => m.runningBalance !== null);
  if (withBalance.length > 0) {
    const latest = [...withBalance].sort(
      (a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
    )[0];
    return latest.runningBalance ?? initialBalance;
  }

  const net = movements.reduce((sum, movement) => sum + movement.amount, 0);
  return initialBalance + net;
}

export const MOVEMENT_CSV_HEADERS = [
  "Fecha",
  "Suc.",
  "Desc. Sucursal",
  "Cód. Op.",
  "Referencia",
  "Concepto",
  "Importe",
  "Saldo",
] as const;

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function movementsToCsv(
  movements: Pick<
    BankMovementRecord,
    | "movementDate"
    | "branchCode"
    | "branchDescription"
    | "operationCode"
    | "reference"
    | "concept"
    | "amount"
    | "runningBalance"
  >[]
): string {
  const lines = [
    MOVEMENT_CSV_HEADERS.join(","),
    ...movements.map((movement) =>
      [
        escapeCsvValue(formatMovementDateTime(movement.movementDate)),
        escapeCsvValue(movement.branchCode),
        escapeCsvValue(movement.branchDescription),
        escapeCsvValue(movement.operationCode),
        escapeCsvValue(movement.reference),
        escapeCsvValue(movement.concept),
        escapeCsvValue(formatArs(movement.amount)),
        escapeCsvValue(
          movement.runningBalance === null
            ? ""
            : formatArs(movement.runningBalance)
        ),
      ].join(",")
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

function parseCsvRow(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current.trim());
  return values;
}

export function parseMovementsCsv(text: string): {
  rows: BankMovementInput[];
  errors: string[];
} {
  const errors: string[] = [];
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], errors: ["El archivo está vacío."] };
  }

  const header = parseCsvRow(lines[0]).map((cell) => cell.toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("fecha"));
  const branchIdx = header.findIndex((h) => h === "suc." || h === "suc");
  const branchDescIdx = header.findIndex(
    (h) => h.includes("desc") && h.includes("sucursal")
  );
  const opIdx = header.findIndex(
    (h) => h.includes("cód") || h.includes("cod") || h.includes("op")
  );
  const refIdx = header.findIndex((h) => h.includes("referencia"));
  const conceptIdx = header.findIndex((h) => h.includes("concepto"));
  const amountIdx = header.findIndex(
    (h) => h.includes("importe") || h.includes("monto")
  );
  const balanceIdx = header.findIndex((h) => h.includes("saldo"));

  const useHeader = dateIdx >= 0 && conceptIdx >= 0 && amountIdx >= 0;

  const dataLines = useHeader ? lines.slice(1) : lines;
  const rows: BankMovementInput[] = [];

  dataLines.forEach((line, index) => {
    const cells = parseCsvRow(line);
    const lineNo = useHeader ? index + 2 : index + 1;

    const dateRaw = (useHeader ? cells[dateIdx] : cells[0]) ?? "";
    const branchCode = (useHeader ? cells[branchIdx] : cells[1]) ?? "";
    const branchDescription =
      (useHeader ? cells[branchDescIdx] : cells[2]) ?? "";
    const operationCode = (useHeader ? cells[opIdx] : cells[3]) ?? "";
    const reference = (useHeader ? cells[refIdx] : cells[4]) ?? "";
    const concept = (useHeader ? cells[conceptIdx] : cells[5]) ?? "";
    const amountRaw = (useHeader ? cells[amountIdx] : cells[6]) ?? "";
    const balanceRaw = useHeader ? (cells[balanceIdx] ?? "") : (cells[7] ?? "");

    if (!dateRaw && !concept && !amountRaw) return;

    const movementDate = parseMovementDate(dateRaw);
    if (!movementDate) {
      errors.push(`Fila ${lineNo}: fecha inválida.`);
      return;
    }

    const amount = parseArsAmount(amountRaw);
    if (amount === null) {
      errors.push(`Fila ${lineNo}: importe inválido.`);
      return;
    }

    if (!concept.trim()) {
      errors.push(`Fila ${lineNo}: concepto obligatorio.`);
      return;
    }

    const runningBalance = balanceRaw.trim()
      ? parseArsAmount(balanceRaw)
      : null;

    rows.push({
      movementDate,
      branchCode: branchCode.trim(),
      branchDescription: branchDescription.trim(),
      operationCode: operationCode.trim(),
      reference: reference.trim(),
      concept: concept.trim(),
      amount,
      runningBalance,
    });
  });

  return { rows, errors };
}

export async function createMovement(
  input: BankMovementInput
): Promise<BankMovementRecord> {
  const created = await prisma.bankMovement.create({
    data: {
      movementDate: input.movementDate,
      branchCode: input.branchCode?.trim() ?? "",
      branchDescription: input.branchDescription?.trim() ?? "",
      operationCode: input.operationCode?.trim() ?? "",
      reference: input.reference?.trim() ?? "",
      concept: input.concept.trim(),
      amount: input.amount,
      runningBalance: input.runningBalance ?? null,
    },
    select: bankMovementSelect,
  });

  return serializeMovement(created);
}

export async function updateMovementRecord(
  id: string,
  input: Partial<BankMovementInput>
): Promise<BankMovementRecord> {
  const existing = await prisma.bankMovement.findUnique({
    where: { id },
    select: { concept: true },
  });

  if (!existing) {
    throw new Error("Movimiento no encontrado");
  }

  const updated = await prisma.bankMovement.update({
    where: { id },
    data: {
      ...(input.movementDate ? { movementDate: input.movementDate } : {}),
      ...(input.branchCode !== undefined
        ? { branchCode: input.branchCode.trim() }
        : {}),
      ...(input.branchDescription !== undefined
        ? { branchDescription: input.branchDescription.trim() }
        : {}),
      ...(input.operationCode !== undefined
        ? { operationCode: input.operationCode.trim() }
        : {}),
      ...(input.reference !== undefined
        ? { reference: input.reference.trim() }
        : {}),
      ...(input.concept !== undefined
        ? {
            concept: input.concept.trim(),
            ...(input.concept.trim() !== existing.concept
              ? { conceptEdited: true }
              : {}),
          }
        : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.runningBalance !== undefined
        ? { runningBalance: input.runningBalance }
        : {}),
    },
    select: bankMovementSelect,
  });

  return serializeMovement(updated);
}

export type MovementDuplicateReason = "existing" | "file";

export type MovementDuplicateInfo = {
  isDuplicate: boolean;
  duplicateReason?: MovementDuplicateReason;
};

export async function findExistingMovementReferences(
  references: string[]
): Promise<Set<string>> {
  const unique = Array.from(
    new Set(references.map((ref) => ref.trim()).filter(Boolean))
  );

  if (unique.length === 0) return new Set();

  const existing = await prisma.bankMovement.findMany({
    where: { reference: { in: unique } },
    select: { reference: true },
  });

  return new Set(existing.map((row) => row.reference));
}

export function annotateMovementDuplicates<T extends { ideOperacion: string }>(
  movements: T[],
  existingReferences: Set<string>
): Array<T & MovementDuplicateInfo> {
  const seenInFile = new Set<string>();

  return movements.map((movement) => {
    const reference = movement.ideOperacion.trim();

    if (!reference) {
      return { ...movement, isDuplicate: false };
    }

    if (seenInFile.has(reference)) {
      return { ...movement, isDuplicate: true, duplicateReason: "file" };
    }

    seenInFile.add(reference);

    if (existingReferences.has(reference)) {
      return { ...movement, isDuplicate: true, duplicateReason: "existing" };
    }

    return { ...movement, isDuplicate: false };
  });
}
