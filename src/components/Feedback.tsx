import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { tokens } from '../theme/tokens';

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
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.back}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.msg}>{message}</Text>
          <View style={styles.row}>
            <Pressable onPress={onCancel} style={styles.secondary}>
              <Text style={styles.secT}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.primary}>
              <Text style={styles.priT}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function StateView({ kind, message }: { kind: 'loading' | 'error' | 'empty' | 'offline'; message: string }) {
  return (
    <View style={styles.state}>
      <Text style={styles.stateT}>
        {kind === 'loading' ? 'Loading… ' : kind === 'offline' ? 'Offline — queued. ' : ''}
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(16,24,40,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxWidth: 420, width: '100%' },
  title: { fontSize: 16, fontWeight: '700', color: tokens.color.text },
  msg: { color: tokens.color.text2, marginTop: 8, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  secondary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: tokens.color.border },
  secT: { fontWeight: '700', color: tokens.color.text2 },
  primary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: tokens.color.primary },
  priT: { fontWeight: '700', color: '#fff' },
  state: { padding: 16, backgroundColor: tokens.color.card, borderRadius: 12, borderWidth: 1, borderColor: tokens.color.border, alignItems: 'center' },
  stateT: { color: tokens.color.text2, fontSize: 13 },
});
