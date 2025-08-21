/**
 * Admin Dashboard Screen
 * Main admin dashboard with management options
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../../src/config/constants";

export default function AdminDashboardScreen() {
  const router = useRouter();

  const Tile: React.FC<{
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }> = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <View style={styles.tileIcon}>
        <Ionicons name={icon as any} size={22} color={COLORS.PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tileTitle}>{title}</Text>
        <Text style={styles.tileSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9e9e9e" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: "#212121" }]}>
          Admin Dashboard
        </Text>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push("/(app)/(tabs)/matches/create")}
        >
          <Ionicons name="add" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.quickActionText}>New Match</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.subtitle, { color: "#757575" }]}>
        Manage matches, tournaments, teams, and more
      </Text>

      <ScrollView contentContainerStyle={styles.content}>
        <Tile
          icon="football-outline"
          title="Matches"
          subtitle="Create, edit, and monitor matches"
          onPress={() => router.push("/(app)/(tabs)/admin/matches")}
        />
        <Tile
          icon="trophy-outline"
          title="Tournaments"
          subtitle="Manage tournaments and schedules"
          onPress={() => router.push("/(app)/(tabs)/admin/tournaments")}
        />
        <Tile
          icon="location-outline"
          title="Fields"
          subtitle="Manage fields and availability"
          onPress={() => router.push("/(app)/(tabs)/admin/fields")}
        />
        <Tile
          icon="people-outline"
          title="Players"
          subtitle="Manage players and rosters"
          onPress={() => router.push("/(app)/(tabs)/admin/players")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "left",
  },
  content: {
    marginTop: 24,
    width: "100%",
    gap: 12,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eeeeee",
    marginBottom: 12,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
  },
  tileSubtitle: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.PRIMARY}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  quickActionText: {
    marginLeft: 6,
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
});
