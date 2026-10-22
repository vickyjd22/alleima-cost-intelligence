import React from 'react';
import { Platform } from 'react-native';
import { Button } from './ui';
import { useToast } from './Toast';

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
}

/** Real client-side CSV download of SAMPLE rows (web); honest no-op elsewhere. */
export function ExportButton({ filename, headers, rows }: { filename: string; headers: string[]; rows: (string | number)[][] }) {
  const { show } = useToast();
  function download(): void {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      show('CSV export is available in the web build.');
      return;
    }
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    show(`Exported ${rows.length} sample rows to CSV.`);
  }
  return <Button label={`Export CSV (${rows.length})`} icon="download" variant="secondary" size="sm" onPress={download} />;
}
