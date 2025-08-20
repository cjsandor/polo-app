/**
 * Not Found Screen
 * 404 error screen for invalid routes
 */

import React from "react";
import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../src/config/constants";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
        <Ionicons
          name="help-circle-outline"
          size={64}
          color="#757575"
          style={styles.icon}
        />
        <Text style={[styles.title, { color: "#212121" }]}>Page Not Found</Text>
        <Text style={[styles.subtitle, { color: "#757575" }]}>
          The page you're looking for doesn't exist.
        </Text>
        <Link
          href="/(app)/(tabs)/matches"
          style={[styles.link, { color: COLORS.PRIMARY }]}
        >
          Go to Matches
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  link: {
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
