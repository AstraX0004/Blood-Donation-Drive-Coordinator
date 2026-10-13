import * as XLSX from 'xlsx';

// Download rows as a real Excel (.xlsx) file with one worksheet.
export function downloadExcel(filename: string, rows: Record<string, any>[], sheetName = 'Data') {
  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  // Auto-size columns to content width
  const cols = rows.length ? Object.keys(rows[0]) : [];
  ws['!cols'] = cols.map(k => ({
    wch: Math.min(50, Math.max(k.length + 2, ...rows.map(r => String(r[k] ?? '').length + 2))),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, name);
}

// Multi-sheet workbook download, e.g. { Registrations: [...], Donors: [...] }
export function downloadWorkbook(filename: string, sheets: Record<string, Record<string, any>[]>) {
  const name = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  const wb = XLSX.utils.book_new();
  for (const [sheetName, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  }
  XLSX.writeFile(wb, name);
}
