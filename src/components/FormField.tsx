import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { fontStack, minTouch, palette, radius, type } from '../theme/tokens';

export function FormField({ label, value, onChange, error, placeholder, secure, keyboard, hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  placeholder?: string;
  secure?: boolean;
  keyboard?: 'default' | 'numeric' | 'email-address';
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.f}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={palette.text3 as never}
        secureTextEntry={secure}
        keyboardType={keyboard ?? 'default'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        style={[styles.input, focused && { borderColor: palette.tint }, error ? { borderColor: palette.error } : null]}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? (
        <View style={styles.errRow} accessibilityRole="alert">
          <Icon name="alertCircle" size={13} color={palette.error} />
          <Text style={styles.err}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, tone = 'primary', disabled }: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'neutral' | 'danger';
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const bg = tone === 'primary' ? palette.tint : tone === 'danger' ? palette.error : palette.filled;
  const fg = tone === 'neutral' ? palette.tint : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={8}
      style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 }]}
    >
      <Text style={[styles.btnT, { color: fg as never }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  f: { marginBottom: 14 },
  label: { ...type.footnote, color: palette.text, fontWeight: '600', marginBottom: 6, fontFamily: fontStack } as never,
  input: {
    borderWidth: 1,
    borderColor: palette.borderStrong,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    minHeight: minTouch,
    fontSize: 14,
    color: palette.text,
    backgroundColor: palette.card,
    fontFamily: fontStack,
    outlineStyle: 'none',
  } as never,
  hint: { ...type.caption1, color: palette.text3, marginTop: 4, fontFamily: fontStack } as never,
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  err: { ...type.caption1, color: palette.error, fontWeight: '600', flex: 1, fontFamily: fontStack } as never,
  btn: { borderRadius: radius.button, minHeight: minTouch, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  btnT: { ...type.headline, fontFamily: fontStack } as never,
});
