type SpreadsheetCell = string | number | boolean | null;

export async function downloadXlsx(
  filename: string,
  sheetName: string,
  headers: readonly string[],
  rows: SpreadsheetCell[][]
): Promise<void> {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet([[...headers], ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function xlsxFilename(baseName: string): string {
  return `${baseName}-${new Date().toISOString().slice(0, 10)}.xlsx`;
}
