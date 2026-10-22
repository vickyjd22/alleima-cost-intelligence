import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { Button } from './ui';
import { fontStack, palette, radius, shadowPop, type } from '../theme/tokens';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.back} onPress={onCancel} accessibilityLabel="Dismiss">
        <Pressable
          onPress={(e) => (e as unknown as { stopPropagation: () => void }).stopPropagation?.()}
          style={styles.card}
        >
          <View style={styles.icon}>
            <Icon name="shieldCheck" size={22} color={palette.tint} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.msg}>{message}</Text>
          <View style={styles.row}>
            <Button label="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button label={confirmLabel} onPress={onConfirm} style={{ flex: 1 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function StateView({ kind, message }: { kind: 'loading' | 'error' | 'empty' | 'offline'; message: string }) {
  const tone = kind === 'error' ? palette.error : kind === 'offline' ? palette.warning : palette.tint;
  return (
    <View style={styles.state}>
      <Icon name={kind === 'offline' ? 'cloud' : kind === 'error' ? 'alertCircle' : 'info'} size={18} color={tone} />
      <Text style={styles.stateT}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: palette.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: palette.card, borderRadius: radius.card, padding: 24, maxWidth: 440, width: '100%', gap: 8, ...shadowPop } as never,
  icon: { width: 44, height: 44, borderRadius: 13, backgroundColor: palette.tintSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title: { ...type.title3, color: palette.text, fontFamily: fontStack } as never,
  msg: { ...type.subhead, color: palette.text2, fontFamily: fontStack, marginBottom: 12 } as never,
  row: { flexDirection: 'row', gap: 10 },
  state: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: palette.card, borderRadius: radius.group, borderWidth: 1, borderColor: palette.border },
  stateT: { ...type.footnote, color: palette.text2, flex: 1, fontFamily: fontStack } as never,
});
