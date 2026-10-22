import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Icon } from './Icon';
import { fontStack, palette, radius, type } from '../theme/tokens';

/** Detail sheet: bottom sheet on compact, focused dialog on wide screens. */
export function DetailDrawer({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  if (!visible) return null;
  const regular = width >= 700;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose} accessibilityLabel="Dismiss">
        <Pressable
          onPress={(e) => (e as unknown as { stopPropagation: () => void }).stopPropagation?.()}
          style={[styles.card, regular ? styles.regular : styles.compact]}
        >
          {!regular ? <View style={styles.grabber} /> : null}
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
            <Pressable onPress={onClose} style={styles.x} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Icon name="x" size={16} color={palette.text2} strokeWidth={2.2} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function KeyVal({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.k}>{k}</Text>
      <Text style={styles.v}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'flex-end', alignItems: 'center' },
  card: { backgroundColor: palette.card, paddingHorizontal: 22, paddingBottom: 24, paddingTop: 10, width: '100%' },
  regular: { maxWidth: 520, borderRadius: radius.sheet, alignSelf: 'center', marginVertical: 40, maxHeight: '86%' },
  compact: { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, maxHeight: '90%' },
  grabber: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: palette.borderStrong, marginBottom: 10, marginTop: 2 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 },
  title: { ...type.title3, color: palette.text, fontFamily: fontStack, flex: 1 } as never,
  x: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.filled, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 8 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: palette.separator },
  k: { ...type.footnote, color: palette.text2, fontFamily: fontStack, flexShrink: 0 } as never,
  v: { ...type.footnote, fontWeight: '600', color: palette.text, textAlign: 'right', flex: 1, fontFamily: fontStack } as never,
});
