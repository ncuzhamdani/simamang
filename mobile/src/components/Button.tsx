import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ActivityIndicator, ViewStyle, StyleProp } from "react-native";
import { colors, radius, spacing } from "../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  onPress,
  children,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  leftIcon,
  style,
}: {
  onPress?: () => void;
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = {
    primary: colors.brand[600],
    secondary: colors.surface[100],
    ghost: "transparent",
    danger: colors.danger,
  }[variant];
  const text = variant === "secondary" || variant === "ghost" ? colors.text : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        { backgroundColor: bg, opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
        variant === "secondary" && styles.secondary,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.text, { color: text, fontSize: size === "sm" ? 13 : 14 }]}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  sm: { paddingHorizontal: spacing.md, paddingVertical: 6 },
  md: { paddingHorizontal: spacing.lg, paddingVertical: 10 },
  secondary: { borderWidth: 1, borderColor: colors.border },
  text: { fontWeight: "600" },
});
