import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from './ui';
import { fontStack, palette, radius, shadowCard, type } from '../theme/tokens';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: number;
  align?: 'left' | 'right';
}

/**
 * Inset data table: quiet header, hairline separators, generous row height and
 * a real empty state. Horizontal scrolling is contained so the page never
 * breaks on compact screens.
 */
export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  emptyText = 'Nothing here yet',
  emptyHint,
  onRowPress,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  emptyHint?: string;
  onRowPress?: (row: T) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <EmptyState icon="fileSearch" title={emptyText} description={emptyHint} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headRow}>
            {columns.map((c) => (
              <View key={c.key} style={{ width: c.width ?? 150, paddingRight: 10, alignItems: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
                <Text style={styles.head} numberOfLines={1}>{c.header.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          {rows.map((r, i) => {
            const key = r.id ?? String(i);
            return (
              <Pressable
                key={key}
                onPress={onRowPress ? () => onRowPress(r) : undefined}
                onHoverIn={() => setHovered(key)}
                onHoverOut={() => setHovered((h) => (h === key ? null : h))}
                style={[
                  styles.row,
                  i < rows.length - 1 && styles.rowBorder,
                  hovered === key && { backgroundColor: palette.cardMuted },
                  onRowPress ? ({ cursor: 'pointer' } as never) : null,
                ]}
              >
                {columns.map((c) => (
                  <View
                    key={c.key}
                    style={{
                      width: c.width ?? 150,
                      paddingRight: 10,
                      alignItems: c.align === 'right' ? 'flex-end' : 'flex-start',
                      justifyContent: 'center',
                    }}
                  >
                    {c.render(r)}
                  </View>
                ))}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    ...shadowCard,
  } as never,
  headRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: palette.cardMuted,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  head: { ...type.caption2, letterSpacing: 0.7, color: palette.text3, fontFamily: fontStack } as never,
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 52,
    alignItems: 'center',
    backgroundColor: palette.card,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: palette.separator },
  emptyCard: {
    backgroundColor: palette.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
});
