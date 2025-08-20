/**
 * Admin Dashboard Screen
 * Main admin dashboard with management options
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AdminDashboardScreen() {
  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <Text style={[styles.title, { color: "#212121" }]}>Admin Dashboard</Text>
      <Text style={[styles.subtitle, { color: "#757575" }]}>
        Manage matches, tournaments, teams, and more
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});
