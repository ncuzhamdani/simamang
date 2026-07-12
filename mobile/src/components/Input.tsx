import React from "react";
import { StyleSheet, Text, TextInput, View, TextInputProps } from "react-native";
import { colors, radius, spacing } from "../theme";

export function Input({
  label,
  hint,
  error,
  containerStyle,
  ...rest
}: TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: any;
}) {
  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.surface[400]}
        {...rest}
        style={[styles.input, error ? { borderColor: colors.danger } : null, rest.style]}
      />
      {(hint || error) && (
        <Text style={{ marginTop: 4, fontSize: 11, color: error ? colors.danger : colors.muted }}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "500", color: colors.muted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
});
