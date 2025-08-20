/**
 * Tabs Layout
 * Main bottom tab navigation
 */

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "../../../src/contexts/AuthContext";
import { COLORS } from "../../../src/config/constants";

export default function TabsLayout() {
  const { isAdmin } = useAuthContext();

  const getTabIcon = (name: string, focused: boolean) => {
    const iconMap: Record<string, string> = {
      matches: focused ? "football" : "football-outline",
      teams: focused ? "people" : "people-outline",
      players: focused ? "person" : "person-outline",
      profile: focused ? "settings" : "settings-outline",
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
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: "#757575",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color, size }) => {
          const routeName = route.name.split("/")[0]; // Get base route name
          const iconName = getTabIcon(routeName, focused);
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="matches/index"
        options={{
          title: "Matches",
          tabBarBadge: undefined, // Can add live match count here
        }}
      />
      <Tabs.Screen
        name="teams/index"
        options={{
          title: "Teams",
        }}
      />
      <Tabs.Screen
        name="players/index"
        options={{
          title: "Players",
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="admin/index"
          options={{
            title: "Admin",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "shield" : "shield-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      )}
    </Tabs>
  );
}
