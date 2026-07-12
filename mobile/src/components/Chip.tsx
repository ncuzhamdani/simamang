import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";

type Tone = "neutral" | "success" | "danger" | "info" | "warning";

const map: Record<Tone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: colors.surface[100], fg: colors.surface[700], border: colors.surface[200] },
  success: { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0" },
  danger: { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca" },
  info: { bg: "#f0f9ff", fg: "#0369a1", border: "#bae6fd" },
  warning: { bg: "#fffbeb", fg: "#b45309", border: "#fde68a" },
};

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const m = map[tone];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.full,
        backgroundColor: m.bg,
        borderWidth: 1,
        borderColor: m.border,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "600", color: m.fg }}>{children}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({});
