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

const screenOptions = ({ route }: { route: any }) => {
  const baseName = route.name.replace("/index", "").split("/")[0];
  const tab = TAB_CONFIG.find((t) => t.key === baseName);

  return {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: "#FFFFFF",
      borderTopColor: "#E0E0E0",
      borderTopWidth: 1,
      height: 65,
      paddingBottom: 10,
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
    tabBarLabel: tab?.label || route.name,
    tabBarIcon: ({
      focused,
      color,
      size,
    }: {
      focused: boolean;
      color: string;
      size: number;
    }) => {
      const iconName = getTabIcon(baseName, focused);
      const iconSize = tab?.iconSize || size;
      return <Ionicons name={iconName as any} size={iconSize} color={color} />;
    },
  };
};

export default function TabsLayout() {
  const { isAdmin } = useAuthContext();
  const tabs = React.useMemo(
    () => TAB_CONFIG.filter((tab) => !tab.adminOnly || isAdmin),
    [isAdmin]
  );

  return (
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

