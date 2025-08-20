/**
 * Players Stack Layout
 * Navigation for players section
 */

import React from "react";
import { Stack } from "expo-router";

export default function PlayersLayout() {
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
          title: "Players",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Player Details",
          headerShown: true,
          headerBackTitle: "Players",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Create Player",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Player",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
    </Stack>
  );
}
