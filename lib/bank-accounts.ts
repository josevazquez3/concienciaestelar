export const bankAccountSelectFields = {
  id: true,
  code: true,
  operatingCode: true,
  name: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type BankAccountRecord = {
  id: string;
  code: string;
  operatingCode: string;
  name: string;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function validateBankAccountCode(code: string): boolean {
  const trimmed = code.trim();
  return trimmed.length >= 1 && trimmed.length <= 20;
}

export function validateBankAccountOperatingCode(value: string): boolean {
  return value.trim().length <= 80;
}

export function validateBankAccountName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 120;
}

export function parseBankAccountStatus(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (["activa", "activo", "true", "1", "si", "sí"].includes(normalized)) {
    return true;
  }
  if (["inactiva", "inactivo", "false", "0", "no"].includes(normalized)) {
    return false;
  }
  return null;
}

export function formatBankAccountStatus(active: boolean): string {
  return active ? "Activa" : "Inactiva";
}

export const BANK_ACCOUNT_CSV_HEADERS = [
  "Código",
  "Cód. operativo",
  "Nombre de la cuenta",
  "Estado",
] as const;

export function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function bankAccountsToCsv(
  accounts: Pick<BankAccountRecord, "code" | "operatingCode" | "name" | "active">[]
): string {
  const lines = [
    BANK_ACCOUNT_CSV_HEADERS.join(","),
    ...accounts.map((account) =>
      [
        escapeCsvValue(account.code),
        escapeCsvValue(account.operatingCode),
        escapeCsvValue(account.name),
        escapeCsvValue(formatBankAccountStatus(account.active)),
      ].join(",")
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

export function parseBankAccountsCsv(text: string): {
  rows: Array<{
    code: string;
    operatingCode: string;
    name: string;
    active: boolean;
  }>;
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

  const parseRow = (line: string): string[] => {
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
  };

  const header = parseRow(lines[0]).map((cell) => cell.toLowerCase());
  const codeIdx = header.findIndex((h) => h.includes("código") || h === "codigo");
  const operatingIdx = header.findIndex(
    (h) => h.includes("operativo") || h.includes("cód. operativo") || h === "cod operativo"
  );
  const nameIdx = header.findIndex((h) => h.includes("nombre"));
  const statusIdx = header.findIndex((h) => h.includes("estado"));

  const useHeader =
    codeIdx >= 0 && nameIdx >= 0 && (operatingIdx >= 0 || statusIdx >= 0);

  const dataLines = useHeader ? lines.slice(1) : lines;
  const rows: Array<{
    code: string;
    operatingCode: string;
    name: string;
    active: boolean;
  }> = [];

  dataLines.forEach((line, index) => {
    const cells = parseRow(line);
    const lineNo = useHeader ? index + 2 : index + 1;

    const code = (useHeader ? cells[codeIdx] : cells[0]) ?? "";
    const operatingCode = (useHeader ? cells[operatingIdx] : cells[1]) ?? "";
    const name = (useHeader ? cells[nameIdx] : cells[2]) ?? "";
    const statusRaw = useHeader ? (cells[statusIdx] ?? "") : (cells[3] ?? "");

    if (!code.trim() && !name.trim()) return;

    if (!validateBankAccountCode(code)) {
      errors.push(`Fila ${lineNo}: código inválido.`);
      return;
    }
    if (!validateBankAccountName(name)) {
      errors.push(`Fila ${lineNo}: nombre inválido.`);
      return;
    }
    if (!validateBankAccountOperatingCode(operatingCode)) {
      errors.push(`Fila ${lineNo}: código operativo demasiado largo.`);
      return;
    }

    const active = parseBankAccountStatus(statusRaw);
    if (active === null) {
      errors.push(`Fila ${lineNo}: estado inválido (“${statusRaw}”).`);
      return;
    }

    rows.push({
      code: code.trim(),
      operatingCode: operatingCode.trim(),
      name: name.trim(),
      active,
    });
  });

  return { rows, errors };
}
