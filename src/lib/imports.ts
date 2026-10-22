/** Import centre: CSV parse → validate → preview. Commit happens server-side after approval. */

export interface ImportPreview<T> {
  rows: T[];
  errors: { row: number; message: string }[];
  duplicates: number[];
}

export function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
}

export function previewCostCentres(csv: string): ImportPreview<Record<string, string>> {
  const grid = parseCsv(csv);
  const header = grid[0] ?? [];
  const rows: Record<string, string>[] = [];
  const errors: { row: number; message: string }[] = [];
  const seen = new Set<string>();
  const duplicates: number[] = [];
  grid.slice(1).forEach((cols, i) => {
    const rec: Record<string, string> = {};
    header.forEach((h, j) => {
      rec[h] = cols[j] ?? '';
    });
    const code = rec['code'] ?? '';
    if (!code.startsWith('8204')) errors.push({ row: i + 2, message: `code ${code} must start with 8204` });
    if (seen.has(code)) duplicates.push(i + 2);
    seen.add(code);
    rows.push(rec);
  });
  return { rows, errors, duplicates };
}
