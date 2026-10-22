import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppleTheme, type, radius, fontStack } from '../theme/tokens';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: number;
}

/**
 * HIG inset-grouped table: caption-2 section headers, hairline separators,
 * 44pt rows, horizontal scroll only on narrow screens. Empty state uses a
 * glyph + headline + footnote (never a bare blank card).
 */
export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  emptyText = 'No records.',
  emptyHint,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  emptyHint?: string;
}) {
  const { palette } = useAppleTheme();
  if (rows.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: palette.card, borderColor: palette.separator }]}>
        <Text style={[styles.emptyGlyph, { color: palette.text3 }]}>▦</Text>
        <Text style={[styles.emptyTitle, { color: palette.text }]}>{emptyText}</Text>
        {emptyHint ? <Text style={[styles.emptyHint, { color: palette.text2 }]}>{emptyHint}</Text> : null}
      </View>
    );
  }
  return (
    <ScrollView horizontal style={[styles.card, { backgroundColor: palette.card, borderColor: palette.separator }]}>
      <View>
        <View style={[styles.headRow, { borderBottomColor: palette.separator, backgroundColor: palette.filled }]}>
          {columns.map((c) => (
            <Text key={c.key} style={[styles.head, { width: c.width ?? 140, color: palette.text2 }]}>
              {c.header.toUpperCase()}
            </Text>
          ))}
        </View>
        {rows.map((r, i) => (
          <View
            key={r.id ?? String(i)}
            style={[styles.row, i < rows.length - 1 ? { borderBottomColor: palette.separator, borderBottomWidth: StyleSheet.hairlineWidth } : null]}
          >
            {columns.map((c) => (
              <View key={c.key} style={{ width: c.width ?? 140, paddingRight: 8 }}>
                {c.render(r)}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.group, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  headRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8 },
  head: { ...type.caption2, letterSpacing: 0.4, fontFamily: fontStack as never } as never,
  row: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, minHeight: 44, alignItems: 'center' },
  empty: {
    padding: 32,
    borderRadius: radius.group,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 6,
  },
  emptyGlyph: { fontSize: 32 },
  emptyTitle: { ...type.headline, fontFamily: fontStack as never } as never,
  emptyHint: { ...type.footnote, textAlign: 'center', fontFamily: fontStack as never } as never,
});
