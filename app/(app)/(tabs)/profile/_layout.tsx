/**
 * Profile Stack Layout
 * Navigation for profile section
 */

import React from "react";
import { Stack } from "expo-router";

export default function ProfileLayout() {
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
          title: "Profile",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: true,
          headerBackTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Profile",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="followed-teams"
        options={{
          title: "Followed Teams",
          headerShown: true,
          headerBackTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerShown: true,
          headerBackTitle: "Settings",
        }}
      />
    </Stack>
  );
}
