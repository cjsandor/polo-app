/**
 * Player Detail Screen
 * - Player profile header
 * - Team link
 * - Stats summary
 * - Recent matches (placeholder)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { LoadingSpinner } from "../../../src/components/ui/LoadingSpinner";
import { COLORS, POLO } from "../../../src/config/constants";
import {
  useGetPlayerByIdQuery,
  useGetPlayerStatsQuery,
} from "../../../src/store/api/slices/playersApi";

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: player,
    isLoading: playerLoading,
    refetch,
  } = useGetPlayerByIdQuery(id as string, { skip: !id });
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetPlayerStatsQuery(id as string, { skip: !id });

  const isLoading = playerLoading || statsLoading;

  if (isLoading && !player) {
    return <LoadingSpinner text="Loading player..." />;
  }

  if (!player) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="person-outline" size={48} color="#bbb" />
        <Text style={styles.emptyText}>Player not found</Text>
        <TouchableOpacity
          style={styles.refreshPill}
          onPress={() => {
            refetch();
            refetchStats();
          }}
        >
          <Ionicons name="refresh" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.refreshPillText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getPositionText = (position?: number) => {
    if (!position) return "Unknown";
    return POLO.POSITIONS[position as keyof typeof POLO.POSITIONS] || "Unknown";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarLg}>
          <Ionicons name="person" size={28} color={COLORS.PRIMARY} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.metaRowInline}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.metaText}>
              {getPositionText(player.position)}
            </Text>
            {typeof player.jersey_number === "number" && (
              <Text style={styles.metaText}> • #{player.jersey_number}</Text>
            )}
          </View>
        </View>
        {typeof player.handicap === "number" && (
          <View style={styles.handicapBadge}>
            <Text style={styles.handicapText}>
              {player.handicap >= 0 ? "+" : ""}
              {player.handicap}
            </Text>
          </View>
        )}
      </View>

      {/* Team Link */}
      {player.team && (
        <TouchableOpacity
          style={styles.teamLink}
          onPress={() => router.push(`/teams/${player.team?.id}`)}
        >
          <Ionicons name="shield-outline" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.teamLinkText}>{player.team.name}</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsRow}>
          <StatBox label="Matches" value={stats?.total_matches ?? 0} />
          <StatBox label="Goals" value={stats?.goals ?? 0} />
          <StatBox label="Assists" value={stats?.assists ?? 0} />
        </View>
      </View>

      {/* Placeholder for recent matches or gallery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Matches</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptySubtext}>Coming soon</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const StatBox: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
    marginBottom: 2,
  },
  handicapBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  handicapText: {
    color: "#fff",
    fontWeight: "800",
  },
  teamLink: {
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  teamLinkText: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
    fontWeight: "700",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#999",
  },
  metaRowInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
  },
  refreshPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.PRIMARY}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  refreshPillText: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
});
