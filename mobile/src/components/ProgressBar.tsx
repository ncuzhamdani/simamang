import React from "react";
import { View } from "react-native";
import { colors, radius } from "../theme";

export function ProgressBar({
  value,
  color = colors.brand[500],
  height = 8,
}: {
  value: number; // 0..1
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, backgroundColor: colors.surface[100], borderRadius: radius.full, overflow: "hidden" }}>
      <View style={{ width: `${pct * 100}%`, height: "100%", backgroundColor: color }} />
    </View>
  );
}
