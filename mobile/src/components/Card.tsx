import React, { ReactNode } from "react";
import { StyleSheet, View, Text, ViewStyle, StyleProp } from "react-native";
import { colors, radius, shadow, spacing } from "../theme";

export function Card({
  children,
  title,
  description,
  action,
  style,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      {(title || action) && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {title && <Text style={styles.title}>{title}</Text>}
            {description && <Text style={styles.desc}>{description}</Text>}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  desc: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
