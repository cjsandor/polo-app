/**
 * Team Detail Screen
 * - Roster with player positions/handicaps
 * - Team statistics summary
 * - Recent matches list
 * - Follow/Unfollow team
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { LoadingSpinner } from "../../../../src/components/ui/LoadingSpinner";
import { MatchCard } from "../../../../src/components/ui/MatchCard";
import { COLORS, POLO } from "../../../../src/config/constants";
import type { Match, Player } from "../../../../src/types/database";
import {
  useGetTeamByIdQuery,
  useGetTeamStatsQuery,
  useFollowTeamMutation,
  useUnfollowTeamMutation,
  useGetFollowedTeamsQuery,
} from "../../../../src/store/api/slices/teamsApi";
import { useGetMatchesForTeamQuery } from "../../../../src/store/api/slices/matchesApi";
import { useAuthContext } from "../../../../src/contexts/AuthContext";

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthContext();

  const {
    data: team,
    isLoading: teamLoading,
    refetch: refetchTeam,
  } = useGetTeamByIdQuery(id as string, { skip: !id });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetTeamStatsQuery(id as string, { skip: !id });

  const {
    data: matches,
    isLoading: matchesLoading,
    refetch: refetchMatches,
  } = useGetMatchesForTeamQuery(id as string, { skip: !id });

  const { data: followedTeams } = useGetFollowedTeamsQuery(user?.id || "", {
    skip: !user?.id,
  });

  const [followTeam] = useFollowTeamMutation();
  const [unfollowTeam] = useUnfollowTeamMutation();

  const isFollowing = useMemo(() => {
    if (!followedTeams || !team) return false;
    return followedTeams.some((t) => t.id === team.id);
  }, [followedTeams, team]);

  const handleToggleFollow = async () => {
    if (!user?.id || !team?.id) return;
    if (isFollowing) {
      await unfollowTeam({ userId: user.id, teamId: team.id });
    } else {
      await followTeam({ userId: user.id, teamId: team.id });
    }
  };

  const isLoading = teamLoading || statsLoading || matchesLoading;

  if (isLoading && !team) {
    return <LoadingSpinner text="Loading team..." />;
  }

  if (!team) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="shield-outline" size={48} color="#bbb" />
        <Text style={styles.emptyText}>Team not found</Text>
        <TouchableOpacity
          style={styles.refreshPill}
          onPress={() => {
            refetchTeam();
            refetchStats();
            refetchMatches();
          }}
        >
          <Ionicons name="refresh" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.refreshPillText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderPlayer = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={styles.playerRow}
      onPress={() => router.push(`/(app)/(tabs)/players/${item.id}`)}
    >
      <View style={styles.playerAvatarSm}>
        <Ionicons name="person" size={16} color={COLORS.PRIMARY} />
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.metaRowInline}>
          {typeof item.position === "number" && (
            <Text style={styles.metaTiny}>Pos {item.position}</Text>
          )}
          {typeof item.handicap === "number" && (
            <Text style={styles.metaTiny}>
              {" "}
              • H{item.handicap >= 0 ? "+" : ""}
              {item.handicap}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <View style={styles.teamLogoLarge}>
            <Ionicons name="shield-outline" size={28} color={COLORS.PRIMARY} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teamNameLarge}>{team.name}</Text>
            {team.home_field?.name && (
              <View style={styles.metaRowInline}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{team.home_field.name}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={handleToggleFollow}>
          <Ionicons
            name={isFollowing ? "heart" : "heart-outline"}
            size={18}
            color={COLORS.PRIMARY}
          />
          <Text style={styles.followText}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsRow}>
          <StatBox label="Matches" value={stats?.total_matches ?? 0} />
          <StatBox label="Wins" value={stats?.wins ?? 0} />
          <StatBox label="Losses" value={stats?.losses ?? 0} />
          <StatBox label="Draws" value={stats?.draws ?? 0} />
        </View>
      </View>

      {/* Roster */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roster</Text>
        <FlatList
          data={team.players || []}
          keyExtractor={(p) => p.id}
          renderItem={renderPlayer}
          ListEmptyComponent={() => (
            <View style={styles.emptyBox}>
              <Text style={styles.emptySubtext}>No players listed</Text>
            </View>
          )}
        />
      </View>

      {/* Recent Matches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Matches</Text>
        {matchesLoading ? (
          <LoadingSpinner text="Loading matches..." />
        ) : (
          <FlatList
            data={(matches || []).slice(0, 5)}
            keyExtractor={(m) => m.id}
            renderItem={({ item }: { item: Match }) => (
              <MatchCard
                match={item}
                onPress={() => router.push(`/(app)/(tabs)/matches/${item.id}`)}
              />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyBox}>
                <Text style={styles.emptySubtext}>No recent matches</Text>
              </View>
            )}
          />
        )}
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
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  teamLogoLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  teamNameLarge: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
    marginBottom: 2,
  },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.PRIMARY}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  followText: {
    color: COLORS.PRIMARY,
    fontWeight: "700",
    marginLeft: 6,
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
  playerRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 8,
  },
  playerAvatarSm: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
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
  metaTiny: {
    fontSize: 11,
    color: "#777",
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#999",
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
