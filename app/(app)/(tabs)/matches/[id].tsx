/**
 * Match Detail Screen
 * - Scoreboard header with handicap visualization
 * - Chukker progress indicator
 * - Team lineups display
 */

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import { LoadingSpinner } from "../../../../src/components/ui/LoadingSpinner";
import { SafeModal } from "../../../../src/components/ui/SafeModal";
import { COLORS, POLO } from "../../../../src/config/constants";
import type {
  MatchLineup,
  MatchWithDetails,
} from "../../../../src/types/database";
import {
  useGetMatchByIdQuery,
  useUpdateMatchStatusMutation,
} from "../../../../src/store/api/slices/matchesApi";
import {
  useGetGoalEventsQuery,
  useCreateMatchEventMutation,
  useUndoLastEventMutation,
} from "../../../../src/store/api/slices/matchEventsApi";
import { useIsAdmin } from "../../../../src/store/hooks";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdmin = useIsAdmin();

  const {
    data: match,
    isLoading: matchLoading,
    refetch: refetchMatch,
  } = useGetMatchByIdQuery(id as string, { skip: !id });

  // Debug log match data
  React.useEffect(() => {
    if (match) {
      console.log("Match data loaded:", {
        id: match.id,
        lineups_count: match.match_lineups?.length || 0,
        first_lineup: match.match_lineups?.[0],
        has_player_data: match.match_lineups?.[0]?.player ? "YES" : "NO",
      });
    }
  }, [match]);

  const { data: goalEvents, isLoading: goalsLoading } = useGetGoalEventsQuery(
    id as string,
    { skip: !id }
  );

  const isLoading = matchLoading || goalsLoading;

  const [createEvent, { isLoading: creatingEvent }] =
    useCreateMatchEventMutation();
  const [undoLast, { isLoading: undoing }] = useUndoLastEventMutation();
  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateMatchStatusMutation();

  // Player picker modal state
  const [pickerVisible, setPickerVisible] = useState<null | {
    teamId: string;
    teamLabel: string;
  }>(null);

  const homeTotal = useMemo(() => {
    if (!match) return 0;
    return (match.home_score || 0) + (match.home_handicap_goals || 0);
  }, [match]);

  const awayTotal = useMemo(() => {
    if (!match) return 0;
    return (match.away_score || 0) + (match.away_handicap_goals || 0);
  }, [match]);

  // Count goals per player
  const goalsByPlayer = useMemo(() => {
    if (!goalEvents) return {};

    const counts: Record<string, number> = {};
    goalEvents.forEach((event) => {
      if (
        event.player_id &&
        (event.event_type === "goal" || event.event_type === "penalty_goal")
      ) {
        counts[event.player_id] = (counts[event.player_id] || 0) + 1;
      }
    });
    return counts;
  }, [goalEvents]);

  const groupLineups = (lineups: MatchLineup[] | undefined) => {
    const byTeam: Record<string, MatchLineup[]> = {};
    (lineups || []).forEach((lu) => {
      const teamId = lu.team_id;
      if (!byTeam[teamId]) byTeam[teamId] = [];
      byTeam[teamId].push(lu);
    });
    Object.values(byTeam).forEach((arr) =>
      arr.sort((a, b) => (a.position || 99) - (b.position || 99))
    );
    return byTeam;
  };

  const renderAdminControls = () => {
    if (!isAdmin || !match) return null;

    const onAddGoal = async (team: "home" | "away", playerId?: string) => {
      try {
        await createEvent({
          match_id: match.id,
          event_type: "goal",
          team_id:
            team === "home"
              ? match.home_team?.id || match.home_team_id
              : match.away_team?.id || match.away_team_id,
          player_id: playerId,
          chukker: Math.max(1, match.current_chukker || 1),
        }).unwrap();
        // refetch handled by invalidation
      } catch (e) {
        // noop
      }
    };

    const onUndo = async () => {
      try {
        await undoLast(match.id).unwrap();
      } catch {}
    };

    const onStartNextChukker = async () => {
      const next = (match.current_chukker || 0) + 1;
      const clamped = Math.min(next, match.total_chukkers);
      try {
        await updateStatus({
          id: match.id,
          status: "live",
          currentChukker: clamped,
        }).unwrap();
      } catch {}
    };

    const onEndMatch = async () => {
      try {
        await updateStatus({ id: match.id, status: "completed" }).unwrap();
      } catch {}
    };

    const openPicker = (team: "home" | "away") => {
      const teamId =
        team === "home"
          ? match.home_team?.id || match.home_team_id
          : match.away_team?.id || match.away_team_id;
      const teamLabel =
        team === "home"
          ? match.home_team?.name || "Home"
          : match.away_team?.name || "Away";
      setPickerVisible({ teamId: teamId!, teamLabel });
    };

    const byTeam = groupLineups(match.match_lineups);
    const pickerList = pickerVisible ? byTeam[pickerVisible.teamId] || [] : [];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Controls</Text>
        <View style={styles.adminRow}>
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => openPicker("home")}
            disabled={creatingEvent}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={COLORS.PRIMARY}
            />
            <Text style={styles.adminBtnText}>Home Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => openPicker("away")}
            disabled={creatingEvent}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={COLORS.PRIMARY}
            />
            <Text style={styles.adminBtnText}>Away Goal</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.adminRow}>
          <TouchableOpacity
            style={styles.adminBtnGhost}
            onPress={onUndo}
            disabled={undoing}
          >
            <Ionicons name="arrow-undo" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.adminBtnGhostText}>Undo Last</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminBtnGhost}
            onPress={onStartNextChukker}
            disabled={updatingStatus}
          >
            <Ionicons name="play" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.adminBtnGhostText}>
              {match.current_chukker
                ? `Next Chukker (${(match.current_chukker || 0) + 1})`
                : "Start Match"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminBtnDanger}
            onPress={onEndMatch}
            disabled={updatingStatus}
          >
            <Ionicons name="stop" size={18} color="#fff" />
            <Text style={styles.adminBtnDangerText}>End Match</Text>
          </TouchableOpacity>
        </View>

        {/* Player Picker Modal */}
        <SafeModal
          visible={!!pickerVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPickerVisible(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select Scorer ({pickerVisible?.teamLabel})
                </Text>
                <TouchableOpacity onPress={() => setPickerVisible(null)}>
                  <Ionicons name="close" size={22} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={pickerList}
                keyExtractor={(lu) => `${lu.team_id}-${lu.player_id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectItem}
                    onPress={async () => {
                      const isHome =
                        (pickerVisible?.teamLabel || "") ===
                        (match.home_team?.name || "Home");
                      await onAddGoal(isHome ? "home" : "away", item.player_id);
                      setPickerVisible(null);
                    }}
                  >
                    <Text style={styles.selectItemText}>
                      {item.player?.name || "Player"}
                    </Text>
                  </TouchableOpacity>
                )}
                ListHeaderComponent={() => (
                  <TouchableOpacity
                    style={[styles.selectItem, { backgroundColor: "#fafafa" }]}
                    onPress={async () => {
                      const isHome =
                        (pickerVisible?.teamLabel || "") ===
                        (match.home_team?.name || "Home");
                      await onAddGoal(isHome ? "home" : "away");
                      setPickerVisible(null);
                    }}
                  >
                    <Text
                      style={[styles.selectItemText, { fontWeight: "700" }]}
                    >
                      No Player
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </SafeModal>
      </View>
    );
  };

  const renderHeader = () => {
    if (!match) return null;

    return (
      <View style={styles.headerContainer}>
        {/* Status Row */}
        <View style={styles.statusRow}>
          {match.status === "live" && (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <Text style={styles.statusText}>
            {match.status.toUpperCase()}
            {match.status !== "scheduled" && match.current_chukker
              ? ` • Chukker ${match.current_chukker}/${match.total_chukkers}`
              : ""}
          </Text>
        </View>

        {/* Scoreboard */}
        <View style={styles.scoreboard}>
          {/* Home */}
          <View style={styles.teamColumn}>
            <View style={styles.teamLogoLarge}>
              <Ionicons
                name="shield-outline"
                size={28}
                color={COLORS.PRIMARY}
              />
            </View>
            <Text style={styles.teamNameLarge} numberOfLines={1}>
              {match.home_team?.name || "Home"}
            </Text>
            <Text style={styles.handicapText}>
              +{match.home_handicap_goals || 0}
            </Text>
          </View>

          {/* Score */}
          <View style={styles.centerScore}>
            <Text style={styles.scoreText}>{homeTotal}</Text>
            <Text style={styles.vs}>-</Text>
            <Text style={styles.scoreText}>{awayTotal}</Text>
          </View>

          {/* Away */}
          <View style={styles.teamColumn}>
            <View style={styles.teamLogoLarge}>
              <Ionicons
                name="shield-outline"
                size={28}
                color={COLORS.PRIMARY}
              />
            </View>
            <Text style={styles.teamNameLarge} numberOfLines={1}>
              {match.away_team?.name || "Away"}
            </Text>
            <Text style={styles.handicapText}>
              +{match.away_handicap_goals || 0}
            </Text>
          </View>
        </View>

        {/* Chukker Progress */}
        <View style={styles.chukkerRow}>
          {Array.from({ length: match.total_chukkers }).map((_, idx) => {
            const ch = idx + 1;
            const active = (match.current_chukker || 0) >= ch;
            return (
              <View
                key={ch}
                style={[styles.chukkerDot, active && styles.chukkerDotActive]}
              >
                <Text
                  style={[
                    styles.chukkerDotText,
                    active && styles.chukkerDotTextActive,
                  ]}
                >
                  {ch}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Field / Tournament */}
        <View style={styles.metaRow}>
          {match.field?.name && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{match.field.name}</Text>
            </View>
          )}
          {match.tournament?.name && (
            <View style={styles.metaItem}>
              <Ionicons name="trophy-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{match.tournament.name}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.refreshPill}
            onPress={() => {
              refetchMatch();
            }}
          >
            <Ionicons name="refresh" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.refreshPillText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Lineups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lineups</Text>
          <View style={styles.lineupsContainer}>
            {renderLineupColumn(
              match,
              match.home_team?.id || match.home_team_id
            )}
            <View style={styles.lineupsDivider} />
            {renderLineupColumn(
              match,
              match.away_team?.id || match.away_team_id
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderLineupColumn = (
    match: MatchWithDetails,
    teamId: string | undefined
  ) => {
    const byTeam = groupLineups(match.match_lineups);
    const list = teamId ? byTeam[teamId] || [] : [];

    // Debug log to check lineup data
    if (list.length > 0 && !list[0].player) {
      console.log("Warning: Lineup missing player data:", list[0]);
    }

    return (
      <View style={styles.lineupColumn}>
        {list.length === 0 ? (
          <Text style={styles.emptySubtext}>No lineup</Text>
        ) : (
          list.map((lu) => {
            const goalCount = goalsByPlayer[lu.player_id] || 0;
            return (
              <View
                key={`${lu.team_id}-${lu.player_id}`}
                style={styles.lineupRow}
              >
                <View style={styles.playerAvatarSm}>
                  <Ionicons name="person" size={16} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.lineupInfo}>
                  <View style={styles.playerNameRow}>
                    <Text style={styles.playerNameSm} numberOfLines={1}>
                      {lu.player?.name || `Player ID: ${lu.player_id}`}
                    </Text>
                    {goalCount > 0 && (
                      <View style={styles.goalBadge}>
                        <Ionicons name="football" size={10} color="#fff" />
                        <Text style={styles.goalBadgeText}>{goalCount}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.metaRowInline}>
                    {typeof lu.position === "number" && (
                      <Text style={styles.metaTiny}>Pos {lu.position}</Text>
                    )}
                    {typeof lu.player?.handicap === "number" && (
                      <Text style={styles.metaTiny}>
                        {" "}
                        • H{lu.player?.handicap >= 0 ? "+" : ""}
                        {lu.player?.handicap}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  if (isLoading && !match) {
    return <LoadingSpinner text="Loading match..." />;
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="football-outline" size={48} color="#bbb" />
        <Text style={styles.emptyText}>Match not found</Text>
        <TouchableOpacity
          style={styles.refreshPill}
          onPress={() => {
            refetchMatch();
          }}
        >
          <Ionicons name="refresh" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.refreshPillText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderAdminControls()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginRight: 6,
  },
  liveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  scoreboard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  teamColumn: {
    alignItems: "center",
    flex: 1,
  },
  teamLogoLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  teamNameLarge: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  handicapText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  centerScore: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
  },
  vs: {
    fontSize: 16,
    color: "#999",
    marginVertical: 2,
  },
  chukkerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  chukkerDot: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
    paddingVertical: 6,
    alignItems: "center",
  },
  chukkerDotActive: {
    backgroundColor: `${COLORS.PRIMARY}22`,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  chukkerDotText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  chukkerDotTextActive: {
    color: COLORS.PRIMARY,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  refreshPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.PRIMARY}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshPillText: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  lineupsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    padding: 12,
  },
  lineupColumn: {
    flex: 1,
  },
  lineupsDivider: {
    width: 1,
    backgroundColor: "#eee",
    marginHorizontal: 8,
  },
  lineupRow: {
    flexDirection: "row",
    alignItems: "center",
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
  lineupInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playerNameSm: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  goalBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 2,
  },
  metaRowInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaTiny: {
    fontSize: 11,
    color: "#777",
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
  emptySubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
  },
  adminRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
  },
  adminBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.PRIMARY}15`,
    borderRadius: 12,
    paddingVertical: 10,
  },
  adminBtnText: {
    marginLeft: 6,
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
  adminBtnGhost: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 10,
  },
  adminBtnGhostText: {
    marginLeft: 6,
    color: COLORS.PRIMARY,
    fontWeight: "700",
  },
  adminBtnDanger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d32f2f",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  adminBtnDangerText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  selectItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectItemText: {
    color: "#333",
  },
});
