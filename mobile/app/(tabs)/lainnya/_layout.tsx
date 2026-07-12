import { Stack } from "expo-router";
import { colors } from "../../../src/theme";

export default function LainnyaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Lainnya" }} />
      <Stack.Screen name="rekening" options={{ title: "Rekening" }} />
      <Stack.Screen name="kategori" options={{ title: "Kategori" }} />
      <Stack.Screen name="target" options={{ title: "Target Keuangan" }} />
      <Stack.Screen name="hutang" options={{ title: "Hutang & Piutang" }} />
      <Stack.Screen name="pengaturan" options={{ title: "Pengaturan" }} />
    </Stack>
  );
}
