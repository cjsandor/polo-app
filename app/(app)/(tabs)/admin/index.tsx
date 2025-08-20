/**
 * Admin Tab Screen
 * Quick access to admin functions from tabs
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { COLORS } from "../../../../src/config/constants";

export default function AdminTabScreen() {
  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <Text style={[styles.title, { color: "#212121" }]}>
        Admin Quick Access
      </Text>
      <Link
        href="/(app)/(admin)/"
        style={[styles.link, { color: COLORS.PRIMARY }]}
      >
        Open Admin Dashboard
      </Link>
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
    marginBottom: 20,
  },
  link: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
