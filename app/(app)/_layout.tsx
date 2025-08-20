/**
 * App Layout
 * Protected app layout with auth guard
 */

import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthContext } from "../../src/contexts/AuthContext";
import { useAppDispatch } from "../../src/store/hooks";
import { setActiveTab } from "../../src/store/slices/uiSlice";
import { LoadingSpinner } from "../../src/components/ui/LoadingSpinner";

export default function AppLayout() {
  const { loading } = useAuthContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Set initial active tab
    dispatch(setActiveTab("matches"));
  }, [dispatch]);

  // Optionally show a very brief loading during init
  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="matches" options={{ headerShown: false }} />
      <Stack.Screen name="teams" options={{ headerShown: false }} />
      <Stack.Screen name="players" options={{ headerShown: false }} />
      <Stack.Screen
        name="(admin)"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Admin Dashboard",
        }}
      />
    </Stack>
  );
}
