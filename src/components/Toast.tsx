import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { create } from 'zustand';
import { type, radius, fontStack } from '../theme/tokens';

interface ToastState {
  msg: string | null;
  show: (msg: string) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  msg: null,
  show: (msg) => {
    set({ msg });
    setTimeout(() => set({ msg: null }), 3200);
  },
  hide: () => set({ msg: null }),
}));

/** HIG notification banner: dark translucent pill above the tab bar, footnote weight, safe-area aware. */
export function ToastHost() {
  const { msg } = useToast();
  if (!msg) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Text style={styles.t} numberOfLines={2}>{msg}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' },
  toast: {
    backgroundColor: 'rgba(28,28,30,0.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: 520,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  t: { color: '#fff', ...type.footnote, fontWeight: '600', textAlign: 'center', fontFamily: fontStack as never } as never,
});
