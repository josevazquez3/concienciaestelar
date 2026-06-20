const EXCEL_EXTENSIONS = [".xlsx", ".xls"] as const;

export const SPREADSHEET_ACCEPT =
  ".csv,.xlsx,.xls,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export const EXTRACTO_IMPORT_ACCEPT = `${SPREADSHEET_ACCEPT},.pdf,application/pdf`;

function isExcelFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return EXCEL_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isCsvFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "text/plain"
  );
}

export async function readSpreadsheetAsCsv(file: File): Promise<string> {
  if (isCsvFile(file)) {
    return file.text();
  }

  if (isExcelFile(file)) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("El archivo Excel no contiene hojas.");
    }

    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_csv(sheet, { FS: ",", RS: "\r\n" });
  }

  throw new Error(
    "Formato no soportado. Usá un archivo CSV (.csv) o Excel (.xlsx, .xls)."
  );
}
