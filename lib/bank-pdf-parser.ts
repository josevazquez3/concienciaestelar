import { parseArsAmount } from "@/lib/bank-statement-shared";

export type ParsedPdfMovement = {
  fecha: string;
  descripcion: string;
  ideOperacion: string;
  valor: number;
  saldo: number;
  movementDate: Date;
};

export type ParsedPdfExtract = {
  movements: ParsedPdfMovement[];
  saldoInicial: number | null;
  saldoFinal: number | null;
  periodo: string | null;
};

const DATE_LINE_RE = /^\d{2}-\d{2}-\d{4}/;
const ROW_RE =
  /^(\d{2})-(\d{2})-(\d{4})\s+(.+?)\s+(\d{10,})\s+\$\s*(-?[\d.\s]+,\d{2})\s+\$\s*([\d.\s]+,\d{2})\s*$/;

function cleanPdfText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\s*-- \d+ of \d+ --\s*/g, "\n")
    .replace(/\n\d+\/\d+\n/g, "\n")
    .replace(/\n\d+\/\d+$/gm, "\n");
}

function stripPageArtifacts(line: string): string {
  let cleaned = line
    .replace(/\s+-- \d+ of \d+ --.*$/, "")
    .replace(/\s+Fecha de generación:.*$/, "")
    .trim();

  const movementCore = cleaned.match(
    /^(.*\$\s*-?[\d.\s]+,\d{2}\s+\$\s*-?[\d.\s]+,\d{2})/
  );
  if (movementCore) {
    cleaned = movementCore[1];
  }

  return cleaned.trim();
}

function extractPesosSection(text: string): string {
  const pesosStart = text.indexOf("RESUMEN DE CUENTA EN PESOS");
  if (pesosStart === -1) {
    return text;
  }

  const afterPesos = text.slice(pesosStart);
  const dollarsStart = afterPesos.indexOf("RESUMEN DE CUENTA EN DÓLARES");
  const generationCut = afterPesos.search(/\nFecha de generación:/);

  let end = afterPesos.length;
  if (dollarsStart > 0) end = Math.min(end, dollarsStart);

  const section = afterPesos.slice(0, end);
  const detailStart = section.indexOf("DETALLE DE MOVIMIENTOS");
  if (detailStart === -1) return section;

  return section.slice(detailStart);
}

function mergeMovementLines(lines: string[]): string[] {
  const merged: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (
      line.startsWith("Fecha Descripción") ||
      line === "operación Valor Saldo" ||
      line.startsWith("Fecha de generación") ||
      line.startsWith("Mercado Libre") ||
      line.startsWith("Estas operaciones")
    ) {
      continue;
    }

    if (DATE_LINE_RE.test(line)) {
      merged.push(line);
      continue;
    }

    if (merged.length > 0) {
      merged[merged.length - 1] += ` ${line}`;
    }
  }

  return merged;
}

function parseMovementLine(line: string): ParsedPdfMovement | null {
  const cleaned = stripPageArtifacts(line);
  const match = cleaned.match(ROW_RE);
  if (!match) return null;

  const day = match[1];
  const month = match[2];
  const year = match[3];
  const descripcion = match[4].replace(/\s+/g, " ").trim();
  const ideOperacion = match[5];
  const valor = parseArsAmount(match[6]);
  const saldo = parseArsAmount(match[7]);

  if (valor === null || saldo === null) return null;

  const movementDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    12,
    0,
    0
  );

  if (Number.isNaN(movementDate.getTime())) return null;

  return {
    fecha: `${day}/${month}/${year}`,
    descripcion,
    ideOperacion,
    valor,
    saldo,
    movementDate,
  };
}

export function parseMercadoPagoPdfText(text: string): ParsedPdfExtract {
  const cleaned = cleanPdfText(text);
  const section = extractPesosSection(cleaned);

  const saldoInicialMatch = section.match(/Saldo inicial:\s*\$\s*([\d.\s,]+)/i);
  const saldoFinalMatch = section.match(/Saldo final:\s*\$\s*([\d.\s,]+)/i);
  const periodoMatch = section.match(/Del\s+(.+?)(?:\s+Periodo:|\tPeriodo:)/i);

  const lines = section.split("\n");
  const merged = mergeMovementLines(lines);
  const movements: ParsedPdfMovement[] = [];

  for (const line of merged) {
    const movement = parseMovementLine(line);
    if (movement) movements.push(movement);
  }

  return {
    movements,
    saldoInicial: saldoInicialMatch
      ? parseArsAmount(saldoInicialMatch[1])
      : null,
    saldoFinal: saldoFinalMatch ? parseArsAmount(saldoFinalMatch[1]) : null,
    periodo: periodoMatch?.[1]?.trim() ?? null,
  };
}

export function parsedPdfToMovementInputs(
  rows: ParsedPdfMovement[]
): Array<{
  movementDate: Date;
  concept: string;
  reference: string;
  operationCode: string;
  amount: number;
  runningBalance: number;
}> {
  return rows.map((row) => ({
    movementDate: row.movementDate,
    concept: row.descripcion,
    reference: row.ideOperacion,
    operationCode: row.ideOperacion.slice(-4),
    amount: row.valor,
    runningBalance: row.saldo,
  }));
}
