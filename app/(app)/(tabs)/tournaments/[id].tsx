/**
 * Tournament Detail Screen
 * - Tournament standings with W-L records
 * - Overview of matches within the tournament
 * - Tournament statistics
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { LoadingSpinner } from "../../../../src/components/ui/LoadingSpinner";
import { MatchCard } from "../../../../src/components/ui/MatchCard";
import { COLORS } from "../../../../src/config/constants";
import type { Match } from "../../../../src/types/database";
import {
  useGetTournamentByIdQuery,
  useGetTournamentStandingsQuery,
  useGetTournamentStatsQuery,
} from "../../../../src/store/api/slices/tournamentsApi";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: tournament,
    isLoading: tournamentLoading,
    refetch: refetchTournament,
  } = useGetTournamentByIdQuery(id as string, { skip: !id });

  const {
    data: standings,
    isLoading: standingsLoading,
    refetch: refetchStandings,
  } = useGetTournamentStandingsQuery(id as string, { skip: !id });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetTournamentStatsQuery(id as string, { skip: !id });

  const isLoading = tournamentLoading || standingsLoading || statsLoading;

  const sortedStandings = useMemo(() => {
    if (!standings) return [];
    return [...standings].sort((a, b) => {
      // Sort by points, then goal difference, then goals for
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference)
        return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });
  }, [standings]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    if (start.getTime() === end.getTime()) {
      return start.toLocaleDateString("en-US", options);
    }

    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
  };

  const getTournamentStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { text: "Upcoming", color: "#4CAF50" };
    } else if (now > end) {
      return { text: "Completed", color: "#757575" };
    } else {
      return { text: "Live", color: "#FF5722" };
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      refetchTournament(),
      refetchStandings(),
      refetchStats(),
    ]);
  };

  if (isLoading && !tournament) {
    return <LoadingSpinner text="Loading tournament..." />;
  }

  if (!tournament) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="trophy-outline" size={48} color="#bbb" />
        <Text style={styles.emptyText}>Tournament not found</Text>
        <TouchableOpacity style={styles.refreshPill} onPress={handleRefresh}>
          <Ionicons name="refresh" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.refreshPillText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const status = getTournamentStatus(
    tournament.start_date,
    tournament.end_date
  );

  const renderStandingRow = (item: any, index: number) => {
    const position = index + 1;
    const isTopPosition = position <= 3;

    return (
      <TouchableOpacity
        key={item.team_id}
        style={[
          styles.standingRow,
          isTopPosition && styles.standingRowHighlight,
        ]}
        onPress={() => router.push(`/(app)/(tabs)/teams/${item.team_id}`)}
      >
        <View style={styles.standingPosition}>
          <Text
            style={[
              styles.positionText,
              isTopPosition && styles.positionTextHighlight,
            ]}
          >
            {position}
          </Text>
        </View>

        <View style={styles.standingTeam}>
          <Text style={styles.teamName} numberOfLines={1}>
            {item.team_name}
          </Text>
        </View>

        <View style={styles.standingStats}>
          <View style={styles.statColumn}>
            <Text style={styles.statHeader}>P</Text>
            <Text style={styles.statValue}>{item.matches_played}</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statHeader}>W</Text>
            <Text style={[styles.statValue, styles.winsText]}>{item.wins}</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statHeader}>L</Text>
            <Text style={[styles.statValue, styles.lossesText]}>
              {item.losses}
            </Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statHeader}>GD</Text>
            <Text style={styles.statValue}>
              {item.goal_difference > 0 ? "+" : ""}
              {item.goal_difference}
            </Text>
          </View>
          <View style={[styles.statColumn, styles.pointsColumn]}>
            <Text style={styles.statHeader}>Pts</Text>
            <Text style={[styles.statValue, styles.pointsText]}>
              {item.points}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <MatchCard
      match={item}
      onPress={() => router.push(`/(app)/(tabs)/matches/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.tournamentIcon}>
              <Ionicons name="trophy" size={40} color={COLORS.PRIMARY} />
            </View>

            <Text style={styles.tournamentName}>{tournament.name}</Text>

            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.metaText}>
                  {formatDateRange(tournament.start_date, tournament.end_date)}
                </Text>
              </View>

              {tournament.location && (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>{tournament.location}</Text>
                </View>
              )}

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${status.color}20` },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: status.color }]}
                />
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.text}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>
                {stats.participating_teams}
              </Text>
              <Text style={styles.statItemLabel}>Teams</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>
                {stats.completed_matches}/{stats.total_matches}
              </Text>
              <Text style={styles.statItemLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{stats.total_goals}</Text>
              <Text style={styles.statItemLabel}>Goals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>
                {stats.average_goals_per_match?.toFixed(1) || "0"}
              </Text>
              <Text style={styles.statItemLabel}>Avg/Match</Text>
            </View>
          </View>
        )}

        {/* Standings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Standings</Text>
            <Text style={styles.sectionSubtitle}>W-L Record</Text>
          </View>

          {standingsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            </View>
          ) : sortedStandings.length > 0 ? (
            <View style={styles.standingsTable}>
              {sortedStandings.map((standing, index) =>
                renderStandingRow(standing, index)
              )}
            </View>
          ) : (
            <View style={styles.emptyStandings}>
              <Text style={styles.emptyText}>No standings available yet</Text>
            </View>
          )}
        </View>

        {/* Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Matches</Text>
            <Text style={styles.sectionSubtitle}>
              {tournament.matches?.length || 0} total matches
            </Text>
          </View>

          {tournament.matches && tournament.matches.length > 0 ? (
            <FlatList
              data={tournament.matches}
              renderItem={renderMatch}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.matchesList}
            />
          ) : (
            <View style={styles.emptyMatches}>
              <Ionicons name="football-outline" size={32} color="#ccc" />
              <Text style={styles.emptyText}>No matches scheduled yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: "center",
  },
  tournamentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  metaInfo: {
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  standingsTable: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  standingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  standingRowHighlight: {
    backgroundColor: "#f8f9fa",
  },
  standingPosition: {
    width: 30,
    alignItems: "center",
  },
  positionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  positionTextHighlight: {
    color: COLORS.PRIMARY,
  },
  standingTeam: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  standingStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statColumn: {
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 30,
  },
  statHeader: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  winsText: {
    color: "#4CAF50",
  },
  lossesText: {
    color: "#f44336",
  },
  pointsColumn: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#e0e0e0",
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  matchesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyStandings: {
    padding: 32,
    alignItems: "center",
  },
  emptyMatches: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  refreshPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}15`,
    marginTop: 16,
  },
  refreshPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
    marginLeft: 8,
  },
});

