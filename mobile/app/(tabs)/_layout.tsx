import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { colors } from "../../src/theme";
import { Icon } from "../../src/components/Icon";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View>
      <Icon name={name} size={22} color={focused ? colors.brand[600] : colors.muted} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 66,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerTitle: "SiMamang",
          tabBarIcon: ({ focused }) => <TabIcon name="layout" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transaksi"
        options={{
          title: "Transaksi",
          tabBarIcon: ({ focused }) => <TabIcon name="list" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="anggaran"
        options={{
          title: "Anggaran",
          tabBarIcon: ({ focused }) => <TabIcon name="piggy-bank" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lainnya"
        options={{
          title: "Lainnya",
          tabBarIcon: ({ focused }) => <TabIcon name="more-horizontal" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
