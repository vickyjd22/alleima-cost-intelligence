import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { useAppleTheme, type, radius, minTouch, fontStack } from '../theme/tokens';

/**
 * HIG sheet: bottom sheet on compact, centered card on regular width.
 * Grabber handle, 16pt top corners, 44pt dismiss control, scrim dismiss.
 */
export function DetailDrawer({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const { palette } = useAppleTheme();
  const { width } = useWindowDimensions();
  if (!visible) return null;
  const regular = width >= 700;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.back} onPress={onClose} accessibilityLabel="Dismiss">
        <Pressable
          onPress={(e) => (e as unknown as { stopPropagation: () => void }).stopPropagation?.()}
          style={[
            styles.card,
            regular ? styles.regular : styles.compact,
            { backgroundColor: palette.card },
            styles.lightShadow,
          ]}
        >
          {!regular ? <View style={[styles.grabber, { backgroundColor: palette.separator }]} /> : null}
          <View style={styles.head}>
            <Text style={[styles.title, { color: palette.text }]} accessibilityRole="header">{title}</Text>
            <Pressable
              onPress={onClose}
              style={[styles.x, { backgroundColor: palette.filled }]}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
            >
              <Text style={[styles.xT, { color: palette.text2 }]}>✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function KeyVal({ k, v }: { k: string; v: string }) {
  const { palette } = useAppleTheme();
  return (
    <View style={[styles.kv, { borderBottomColor: palette.separator }]}>
      <Text style={[styles.k, { color: palette.text2 }]}>{k}</Text>
      <Text style={[styles.v, { color: palette.text }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'center' },
  card: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8, width: '100%' },
  regular: { maxWidth: 480, borderRadius: radius.sheet, alignSelf: 'center', marginVertical: 40, maxHeight: '85%' },
  compact: { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, maxHeight: '88%' },
  lightShadow: {
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 24, shadowOffset: { width: 0, height: -4 }, elevation: 8,
  } as never,
  grabber: { width: 36, height: 5, borderRadius: 2.5, alignSelf: 'center', marginBottom: 8, marginTop: 4 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { ...type.title3, fontFamily: fontStack as never } as never,
  x: { width: minTouch - 14, height: minTouch - 14, borderRadius: (minTouch - 14) / 2, alignItems: 'center', justifyContent: 'center' },
  xT: { fontSize: 14, fontWeight: '600' },
  content: { paddingBottom: 8 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  k: { ...type.subhead, fontFamily: fontStack as never } as never,
  v: { ...type.subhead, fontWeight: '600', textAlign: 'right', flex: 1, fontFamily: fontStack as never } as never,
});
