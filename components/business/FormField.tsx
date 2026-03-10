import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, AuthColors, Fonts } from '../../utils/constants';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numeric?: boolean;
}

export default function FormField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  numeric,
}: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="sentences"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={numeric ? 'numeric' : 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: AuthColors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.mono,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
});
