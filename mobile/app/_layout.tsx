import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "../src/theme";
import { getDb } from "../src/lib/db";

// Initialize DB on app start (side-effect)
getDb();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="transaksi/baru" options={{ title: "Transaksi Baru", presentation: "modal" }} />
          <Stack.Screen name="transaksi/[id]" options={{ title: "Edit Transaksi" }} />
          <Stack.Screen name="rekening/baru" options={{ title: "Rekening Baru", presentation: "modal" }} />
          <Stack.Screen name="rekening/[id]" options={{ title: "Edit Rekening" }} />
          <Stack.Screen name="target/baru" options={{ title: "Target Baru", presentation: "modal" }} />
          <Stack.Screen name="target/[id]" options={{ title: "Edit Target" }} />
          <Stack.Screen name="hutang/baru" options={{ title: "Hutang/Piutang Baru", presentation: "modal" }} />
          <Stack.Screen name="kategori/baru" options={{ title: "Kategori Baru", presentation: "modal" }} />
          <Stack.Screen name="anggaran/set" options={{ title: "Atur Anggaran", presentation: "modal" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
