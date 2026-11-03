import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { Button } from './ui';
import { fontStack, focus, minTouch, palette, radius, type } from '../theme/tokens';

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
        style={[styles.input, focused && styles.inputFocus, error ? { borderColor: palette.error } : null]}
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

/**
 * Legacy API kept for existing call sites (admin/finance/cost-centres). Phase 7
 * consolidation: this now delegates to the single canonical `Button` so there is
 * one button implementation and one visual language. Props are unchanged.
 */
export function PrimaryButton({ label, onPress, tone = 'primary', disabled }: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'neutral' | 'danger';
  disabled?: boolean;
}) {
  const variant = tone === 'danger' ? 'danger' : tone === 'neutral' ? 'secondary' : 'primary';
  return (
    <View style={{ marginTop: 6 }}>
      <Button label={label} onPress={onPress} variant={variant} disabled={disabled} fullWidth />
    </View>
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
  inputFocus: {
    borderColor: palette.tint,
    outlineStyle: 'solid',
    outlineColor: focus.ring,
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
  } as never,
  hint: { ...type.caption1, color: palette.text3, marginTop: 4, fontFamily: fontStack } as never,
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  err: { ...type.caption1, color: palette.error, fontWeight: '600', flex: 1, fontFamily: fontStack } as never,
});
