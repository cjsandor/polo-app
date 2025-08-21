/**
 * Admin Stack Layout
 * Navigation for admin section (modal presentation)
 */

import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuthContext } from "../../../src/contexts/AuthContext";

export default function AdminLayout() {
  const { isAdmin } = useAuthContext();

  // Redirect non-admin users
  if (!isAdmin) {
    return <Redirect href="/(app)/(tabs)/matches" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#212121",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: true,
        gestureEnabled: true,
        animation: "slide_from_bottom",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Admin Dashboard",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="matches"
        options={{
          title: "Manage Matches",
          headerShown: false,
          headerBackTitle: "Admin",
        }}
      />
      <Stack.Screen
        name="tournaments"
        options={{
          title: "Manage Tournaments",
          headerShown: false,
          headerBackTitle: "Admin",
        }}
      />
      <Stack.Screen
        name="fields"
        options={{
          title: "Manage Fields",
          headerShown: false,
          headerBackTitle: "Admin",
        }}
      />
      <Stack.Screen
        name="players"
        options={{
          title: "Manage Players",
          headerShown: false,
          headerBackTitle: "Admin",
        }}
      />
    </Stack>
  );
}
