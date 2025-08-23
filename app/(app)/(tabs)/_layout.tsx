/**
 * Tabs Layout
 * Main bottom tab navigation
 */

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../../src/contexts/AuthContext";
import { COLORS } from "../../../src/config/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { isAdmin } = useAuthContext();
  const insets = useSafeAreaInsets();

  const getTabIcon = (name: string, focused: boolean) => {
    const iconMap: Record<string, string> = {
      matches: focused ? "football" : "football-outline",
      tournaments: focused ? "trophy" : "trophy-outline",
      teams: focused ? "people" : "people-outline",
      players: focused ? "person" : "person-outline",
      admin: focused ? "shield" : "shield-outline",
    };

    return iconMap[name] || "circle-outline";
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E0E0E0",
          borderTopWidth: 1,
          height: 55 + insets.bottom,
          paddingBottom: insets.bottom || 10,
          paddingTop: 10,
          paddingHorizontal: 0,
          elevation: 0,
          justifyContent: "space-between",
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: "#757575",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          marginBottom: 0,
          textAlign: "center",
          alignSelf: "center",
        },
        tabBarIconStyle: {
          marginTop: 0,
          alignSelf: "center",
          width: 24,
        },
        tabBarItemStyle: {
          flex: 1,
          paddingVertical: 5,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarLabel: (() => {
          const baseName = route.name.replace("/index", "").split("/")[0];
          const labels: Record<string, string> = {
            matches: "Home",
            tournaments: "Tournaments",
            teams: "Teams",
            players: "Players",
            admin: "Admin",
          };
          return labels[baseName] || labels[route.name] || route.name;
        })(),
        tabBarIcon: ({ focused, color, size }) => {
          const routeName = route.name.replace("/index", "").split("/")[0]; // Get base route name
          const iconName = getTabIcon(routeName, focused);
          return <Ionicons name={iconName as any} size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="matches/index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarBadge: undefined, // Can add live match count here
        }}
      />
      <Tabs.Screen
        name="tournaments/index"
        options={{
          title: "Tournaments",
          tabBarLabel: "Tournaments",
        }}
      />
      <Tabs.Screen
        name="teams/index"
        options={{
          title: "Teams",
          tabBarLabel: "Teams",
        }}
      />
      <Tabs.Screen
        name="players/index"
        options={{
          title: "Players",
          tabBarLabel: "Players",
        }}
      />

      {isAdmin && (
        <Tabs.Screen
          name="admin/index"
          options={{
            title: "Admin",
            tabBarLabel: "Admin",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "shield" : "shield-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        />
      )}
      {/* Hidden admin subscreens - not shown in tabs */}
      <Tabs.Screen
        name="admin/matches"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="admin/tournaments"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="admin/fields"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="admin/players"
        options={{
          tabBarButton: () => null,
        }}
      />

      {/* Hidden detail screens - not shown in tabs */}
      <Tabs.Screen
        name="matches/[id]"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="matches/create"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="teams/[id]"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="tournaments/[id]"
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="players/[id]"
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
