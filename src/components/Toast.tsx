import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { create } from 'zustand';
import { Icon } from './Icon';
import { fontStack, palette, radius, type } from '../theme/tokens';

interface ToastState {
  msg: string | null;
  show: (msg: string) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  msg: null,
  show: (msg) => {
    set({ msg });
    setTimeout(() => set({ msg: null }), 3400);
  },
  hide: () => set({ msg: null }),
}));

/** Notification banner: deep navy card, readable at a glance, above the tab bar. */
export function ToastHost() {
  const { msg } = useToast();
  if (!msg) return null;
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.toast} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <View style={styles.icon}>
          <Icon name="checkCircle" size={16} color="#6EE7B7" strokeWidth={2} />
        </View>
        <Text style={styles.t} numberOfLines={2}>{msg}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center', zIndex: 100 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.sidebar,
    borderRadius: radius.group,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: 560,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: palette.sidebar,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  } as never,
  icon: { width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(110,231,183,0.14)', alignItems: 'center', justifyContent: 'center' },
  t: { color: '#fff', ...type.footnote, fontWeight: '500', flexShrink: 1, fontFamily: fontStack } as never,
});
