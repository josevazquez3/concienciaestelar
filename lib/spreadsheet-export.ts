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

export function pdfFilename(baseName: string): string {
  return `${baseName}-${new Date().toISOString().slice(0, 10)}.pdf`;
}

export async function downloadPdfTable(
  filename: string,
  title: string,
  headers: readonly string[],
  rows: string[][]
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 14, 14);

  autoTable(doc, {
    head: [headers as unknown as string[]],
    body: rows,
    startY: 20,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [27, 42, 74] },
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
