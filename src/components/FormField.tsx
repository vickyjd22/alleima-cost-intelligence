import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useAppleTheme, type, radius, minTouch, fontStack } from '../theme/tokens';

/**
 * HIG form controls:
 * - 44pt minimum touch/button height, 10pt continuous corners.
 * - iOS grouped-field look; focus ring via tint border; inline error with
 *   icon + message (never color-only); `accessibilityLabel` passthrough.
 */
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
  const { palette } = useAppleTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.f}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
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
        style={[
          styles.input,
          { backgroundColor: palette.card, borderColor: palette.separator, color: palette.text },
          focused ? { borderColor: palette.tint, borderWidth: 1.5 } : null,
          error ? { borderColor: palette.error, borderWidth: 1.5 } : null,
        ]}
      />
      {hint && !error ? <Text style={[styles.hint, { color: palette.text2 }]}>{hint}</Text> : null}
      {error ? (
        <Text style={[styles.err, { color: palette.error }]} accessibilityRole="alert">
          ⚠ {error}
        </Text>
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
  const { palette } = useAppleTheme();
  const bg = tone === 'primary' ? palette.tint : tone === 'danger' ? palette.error : palette.filled;
  const fg = tone === 'neutral' ? palette.tint : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.btnT, { color: fg as never }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  f: { marginBottom: 12 },
  label: { ...type.subhead, fontWeight: '600', marginBottom: 6, fontFamily: fontStack as never } as never,
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    minHeight: minTouch,
    fontSize: 17,
    fontFamily: fontStack as never,
  } as never,
  hint: { ...type.footnote, marginTop: 4, fontFamily: fontStack as never } as never,
  err: { ...type.footnote, fontWeight: '600', marginTop: 4, fontFamily: fontStack as never } as never,
  btn: {
    borderRadius: radius.button,
    minHeight: minTouch,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnT: { ...type.headline, fontFamily: fontStack as never } as never,
});
