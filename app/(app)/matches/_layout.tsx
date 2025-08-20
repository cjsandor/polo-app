/**
 * Matches Stack Layout
 * Navigation for matches section
 */

import React from "react";
import { Stack } from "expo-router";

export default function MatchesLayout() {
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
          title: "Matches",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Match Details",
          headerShown: true,
          headerBackTitle: "Matches",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Match",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Match",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
    </Stack>
  );
}
