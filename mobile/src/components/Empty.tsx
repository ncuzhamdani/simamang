import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import { Icon } from "./Icon";

export function Empty({
  title,
  description,
  icon = "list",
  action,
}: {
  title: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Icon name={icon} size={22} color={colors.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.desc}>{description}</Text>}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20, gap: spacing.xs },
  icon: {
    width: 48, height: 48, borderRadius: radius.lg,
    backgroundColor: colors.surface[100], borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  title: { fontWeight: "600", color: colors.text },
  desc: { color: colors.muted, fontSize: 13, textAlign: "center", maxWidth: 320 },
});
