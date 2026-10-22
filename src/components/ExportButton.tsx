import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
}

/** Real client-side CSV download of SAMPLE rows (web anchor; mock on native). */
export function ExportButton({ filename, headers, rows }: { filename: string; headers: string[]; rows: (string | number)[][] }) {
  function download(): void {
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Pressable onPress={download} style={styles.btn}>
      <Text style={styles.t}>Export CSV ({rows.length})</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderColor: tokens.color.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  t: { fontSize: 12, fontWeight: '700', color: tokens.color.primary },
});
