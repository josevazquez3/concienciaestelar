import { formatDateArgentina } from "@/lib/date-format";

export const PADRON_CLIENTES_HEADERS = [
  "Nombres",
  "Apellidos",
  "DNI o Pasaporte",
  "Fecha de Nacimiento",
  "Correo electrónico",
  "Nº de Celular",
  "Lugar de residencia",
] as const;

export type PadronClienteRecord = {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento: string | null;
  email: string;
  celular: string;
  residencia: string;
  createdAt: string;
  updatedAt: string;
};

export type PadronClienteInput = {
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento: Date | null;
  email: string;
  celular: string;
  residencia: string;
};

type PadronField = keyof PadronClienteInput;

const COLUMN_ALIASES: Record<PadronField, string[]> = {
  nombres: ["nombres", "nombre", "first name", "firstname"],
  apellidos: [
    "apellidos",
    "apellido",
    "last name",
    "lastname",
    "surname",
    "family name",
  ],
  documento: [
    "dni o pasaporte",
    "dni/pasaporte",
    "dni",
    "pasaporte",
    "documento",
    "identificacion",
    "identificacion personal",
    "cedula",
    "cuit",
    "cuil",
    "n documento",
    "num documento",
    "numero documento",
  ],
  fechaNacimiento: [
    "fecha de nacimiento",
    "fecha nacimiento",
    "fecha nac",
    "nacimiento",
    "birth date",
    "birthdate",
    "birthday",
    "f nac",
  ],
  email: [
    "correo electronico",
    "correo",
    "email",
    "e-mail",
    "mail",
    "correo e",
  ],
  celular: [
    "n de celular",
    "no de celular",
    "numero de celular",
    "num celular",
    "celular",
    "telefono",
    "tel",
    "mobile",
    "phone",
    "whatsapp",
    "contacto",
  ],
  residencia: [
    "lugar de residencia",
    "residencia",
    "domicilio",
    "direccion",
    "address",
    "localidad",
    "ciudad",
    "ubicacion",
  ],
};

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function headerMatchesAlias(header: string, alias: string): boolean {
  const normalized = normalizeHeader(header);
  const normalizedAlias = normalizeHeader(alias);
  if (!normalized || !normalizedAlias) return false;

  if (normalized === normalizedAlias) return true;

  if (normalizedAlias.length <= 3) {
    return new RegExp(`\\b${normalizedAlias}\\b`).test(normalized);
  }

  return (
    normalized.includes(normalizedAlias) ||
    normalizedAlias.includes(normalized)
  );
}

function findCombinedNameColumn(headers: string[]): number {
  const combinedAliases = [
    "nombre y apellido",
    "nombre completo",
    "full name",
    "name",
  ];

  for (let i = 0; i < headers.length; i += 1) {
    for (const alias of combinedAliases) {
      if (headerMatchesAlias(headers[i], alias)) {
        return i;
      }
    }
  }

  return -1;
}

function splitFullName(fullName: string): { nombres: string; apellidos: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nombres: "", apellidos: "" };
  if (parts.length === 1) return { nombres: parts[0], apellidos: "" };
  return {
    nombres: parts.slice(0, -1).join(" "),
    apellidos: parts[parts.length - 1],
  };
}

function findColumnIndex(
  headers: string[],
  field: PadronField,
  usedIndexes: Set<number>
): number {
  const aliases = COLUMN_ALIASES[field];

  for (let i = 0; i < headers.length; i += 1) {
    if (usedIndexes.has(i)) continue;

    for (const alias of aliases) {
      if (headerMatchesAlias(headers[i], alias)) {
        return i;
      }
    }
  }

  return -1;
}

function detectColumnMap(headers: string[]): Partial<Record<PadronField, number>> {
  const map: Partial<Record<PadronField, number>> = {};
  const usedIndexes = new Set<number>();

  const combinedNameIdx = findCombinedNameColumn(headers);
  if (combinedNameIdx >= 0) {
    map.nombres = combinedNameIdx;
    map.apellidos = combinedNameIdx;
    usedIndexes.add(combinedNameIdx);
  }

  for (const field of Object.keys(COLUMN_ALIASES) as PadronField[]) {
    if (map[field] !== undefined) continue;
    const idx = findColumnIndex(headers, field, usedIndexes);
    if (idx >= 0) {
      map[field] = idx;
      usedIndexes.add(idx);
    }
  }

  return map;
}

function isValidEmail(value: string): boolean {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeDocumento(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const excelFloatMatch = trimmed.match(/^(\d+)\.0+$/);
  if (excelFloatMatch) {
    return excelFloatMatch[1];
  }

  return trimmed.replace(/\D/g, "");
}

function isValidDocumento(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^\d+$/.test(trimmed);
}

export function formatBirthDate(date: Date | null): string {
  return formatDateArgentina(date);
}

export function parseBirthDate(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  const slashMatch = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    let year = Number(slashMatch[3]);
    if (year < 100) {
      year += year >= 50 ? 1900 : 2000;
    }
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const serial = Number(value);
  if (Number.isFinite(serial) && serial > 20000 && serial < 100000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  return null;
}

function cellValue(cells: string[], index?: number): string {
  if (index === undefined || index < 0) return "";
  return (cells[index] ?? "").trim();
}

function rowHasData(values: string[]): boolean {
  return values.some((value) => value.trim().length > 0);
}

type PadronClienteDbRow = {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento: Date | null;
  email: string;
  celular: string;
  residencia: string;
  createdAt: Date;
  updatedAt: Date;
};

export const padronClienteSelect = {
  id: true,
  nombres: true,
  apellidos: true,
  documento: true,
  fechaNacimiento: true,
  email: true,
  celular: true,
  residencia: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function serializePadronCliente(cliente: PadronClienteDbRow): PadronClienteRecord {
  return {
    id: cliente.id,
    nombres: cliente.nombres,
    apellidos: cliente.apellidos,
    documento: cliente.documento,
    fechaNacimiento: cliente.fechaNacimiento
      ? cliente.fechaNacimiento.toISOString()
      : null,
    email: cliente.email,
    celular: cliente.celular,
    residencia: cliente.residencia,
    createdAt: cliente.createdAt.toISOString(),
    updatedAt: cliente.updatedAt.toISOString(),
  };
}

export function padronExportRows(clientes: PadronClienteRecord[]): string[][] {
  return clientes.map((cliente) => [
    cliente.nombres,
    cliente.apellidos,
    cliente.documento,
    cliente.fechaNacimiento ? formatBirthDate(new Date(cliente.fechaNacimiento)) : "",
    cliente.email,
    cliente.celular,
    cliente.residencia,
  ]);
}

export function parsePadronCsv(text: string): {
  rows: PadronClienteInput[];
  errors: string[];
  warnings: string[];
  mappedColumns: string[];
  ignoredColumns: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      rows: [],
      errors: ["El archivo está vacío."],
      warnings: [],
      mappedColumns: [],
      ignoredColumns: [],
    };
  }

  const headerCells = parseCsvRow(lines[0]);
  const columnMap = detectColumnMap(headerCells);

  if (columnMap.nombres === undefined && columnMap.apellidos === undefined) {
    return {
      rows: [],
      errors: [
        "No se encontraron columnas reconocibles. El archivo debe incluir al menos Nombres o Apellidos.",
      ],
      warnings: [],
      mappedColumns: [],
      ignoredColumns: headerCells.filter(Boolean),
    };
  }

  const mappedColumns = (Object.keys(columnMap) as PadronField[])
    .filter((field) => columnMap[field] !== undefined)
    .map((field) => headerCells[columnMap[field]!]);

  const mappedIndexes = new Set(
    (Object.values(columnMap) as number[]).filter((index) => index >= 0)
  );
  const ignoredColumns = headerCells.filter(
    (_, index) => !mappedIndexes.has(index) && headerCells[index]?.trim()
  );

  if (ignoredColumns.length > 0) {
    warnings.push(
      `Se ignoraron ${ignoredColumns.length} columna(s) no necesarias: ${ignoredColumns.join(", ")}.`
    );
  }

  const rows: PadronClienteInput[] = [];

  lines.slice(1).forEach((line, index) => {
    const cells = parseCsvRow(line);
    const lineNo = index + 2;

    if (!rowHasData(cells)) return;

    let nombres = cellValue(cells, columnMap.nombres);
    let apellidos = cellValue(cells, columnMap.apellidos);
    const documentoRaw = cellValue(cells, columnMap.documento);
    const documento = normalizeDocumento(documentoRaw);
    const fechaRaw = cellValue(cells, columnMap.fechaNacimiento);
    const email = cellValue(cells, columnMap.email).toLowerCase();
    const celular = cellValue(cells, columnMap.celular);
    const residencia = cellValue(cells, columnMap.residencia);

    if (
      columnMap.nombres !== undefined &&
      columnMap.nombres === columnMap.apellidos
    ) {
      const split = splitFullName(nombres || apellidos);
      nombres = split.nombres;
      apellidos = split.apellidos;
    } else if (nombres && !apellidos && nombres.includes(" ")) {
      const split = splitFullName(nombres);
      nombres = split.nombres;
      apellidos = split.apellidos;
    } else if (!nombres && apellidos && apellidos.includes(" ")) {
      const split = splitFullName(apellidos);
      nombres = split.nombres;
      apellidos = split.apellidos;
    }

    if (!nombres && !apellidos) {
      warnings.push(`Fila ${lineNo}: sin nombres ni apellidos, omitida.`);
      return;
    }

    if (!nombres && apellidos) {
      nombres = apellidos;
      apellidos = "";
    }

    if (documentoRaw && !documento) {
      warnings.push(
        `Fila ${lineNo}: DNI o Pasaporte omitido (solo se aceptan números).`
      );
    }

    if (email && !isValidEmail(email)) {
      errors.push(`Fila ${lineNo}: correo electrónico inválido.`);
      return;
    }

    const fechaNacimiento = fechaRaw ? parseBirthDate(fechaRaw) : null;
    if (fechaRaw && !fechaNacimiento) {
      errors.push(
        `Fila ${lineNo}: fecha de nacimiento inválida (usá DD/MM/YYYY).`
      );
      return;
    }

    rows.push({
      nombres,
      apellidos,
      documento,
      fechaNacimiento,
      email,
      celular,
      residencia,
    });
  });

  return { rows, errors, warnings, mappedColumns, ignoredColumns };
}

export function validatePadronInput(input: PadronClienteInput): string | null {
  if (!input.nombres.trim() && !input.apellidos.trim()) {
    return "Indicá al menos nombres o apellidos.";
  }
  if (input.documento.trim() && !isValidDocumento(input.documento)) {
    return "DNI o Pasaporte debe contener solo números.";
  }
  if (input.email.trim() && !isValidEmail(input.email.trim())) {
    return "Correo electrónico inválido.";
  }
  return null;
}

export function sanitizePadronInput(input: PadronClienteInput): PadronClienteInput {
  let nombres = input.nombres.trim();
  let apellidos = input.apellidos.trim();

  if (!nombres && apellidos) {
    nombres = apellidos;
    apellidos = "";
  }

  return {
    ...input,
    nombres,
    apellidos,
    documento: normalizeDocumento(input.documento),
    email: input.email.trim().toLowerCase(),
    celular: input.celular.trim(),
    residencia: input.residencia.trim(),
  };
}
