/**
 * Teams Stack Layout
 * Navigation for teams section
 */

import React from "react";
import { Stack } from "expo-router";

export default function TeamsLayout() {
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
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Teams",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Team Details",
          headerShown: true,
          headerBackTitle: "Teams",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Team",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Team",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
    </Stack>
  );
}
