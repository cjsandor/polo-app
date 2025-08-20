/**
 * Auth Layout
 * Authentication screens layout
 */

import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuthContext } from "../../src/contexts/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuthContext();

  // Redirect to app if already authenticated
  if (isAuthenticated && !loading) {
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
        headerShadowVisible: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: "Sign In",
          headerShown: false, // Custom header in component
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: "Sign Up",
          headerShown: false, // Custom header in component
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Reset Password",
          headerShown: true,
          headerBackTitle: "Sign In",
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: "New Password",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
