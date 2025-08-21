/**
 * Create Match Screen
 * Simple form to create a new match
 */

import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { SafeModal } from "../../../../src/components/ui/SafeModal";
import { COLORS } from "../../../../src/config/constants";
import {
  useCreateMatchMutation,
  useCreateMatchLineupsMutation,
  useDeleteMatchLineupsMutation,
  useUpdateMatchMutation,
  useGetMatchByIdQuery,
} from "../../../../src/store/api/slices/matchesApi";
import { useGetTeamsQuery } from "../../../../src/store/api/slices/teamsApi";
import { useGetFieldsQuery } from "../../../../src/store/api/slices/fieldsApi";
import { useGetTournamentsQuery } from "../../../../src/store/api/slices/tournamentsApi";
import { useGetPlayersByTeamQuery } from "../../../../src/store/api/slices/playersApi";
import type {
  CreateMatchData,
  Team,
  Field,
  Tournament,
  Player,
} from "../../../../src/types/database";

type SelectorType =
  | "home"
  | "away"
  | "field"
  | "tournament"
  | "homePlayers"
  | "awayPlayers"
  | null;

export default function CreateMatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const matchId = params.id as string | undefined;
  const isEditMode = !!matchId;

  // Queries
  const { data: teams } = useGetTeamsQuery();
  const { data: fields } = useGetFieldsQuery();
  const { data: tournaments } = useGetTournamentsQuery();

  // Form state
  const [tournamentId, setTournamentId] = useState<string | undefined>();
  const [homeTeamId, setHomeTeamId] = useState<string | undefined>();
  const [awayTeamId, setAwayTeamId] = useState<string | undefined>();
  const [fieldId, setFieldId] = useState<string | undefined>();
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [totalChukkers, setTotalChukkers] = useState<string>("6");
  const [selectedHomePlayers, setSelectedHomePlayers] = useState<string[]>([]);
  const [selectedAwayPlayers, setSelectedAwayPlayers] = useState<string[]>([]);

  // Selector modal
  const [selectorOpen, setSelectorOpen] = useState<SelectorType>(null);
  const [search, setSearch] = useState("");

  // Track if we're still loading initial data to prevent resetting
  const [isInitialLoad, setIsInitialLoad] = useState(isEditMode);

  const [createMatch, { isLoading: isCreating }] = useCreateMatchMutation();
  const [updateMatch, { isLoading: isUpdating }] = useUpdateMatchMutation();
  const [createLineups] = useCreateMatchLineupsMutation();
  const [deleteLineups] = useDeleteMatchLineupsMutation();
  const isLoading = isCreating || isUpdating;

  // Fetch existing match data when in edit mode
  const { data: existingMatch, isLoading: isLoadingMatch } =
    useGetMatchByIdQuery(matchId!, {
      skip: !matchId,
    });

  // Fetch players for selected teams
  const { data: homePlayers } = useGetPlayersByTeamQuery(homeTeamId!, {
    skip: !homeTeamId,
  });
  const { data: awayPlayers } = useGetPlayersByTeamQuery(awayTeamId!, {
    skip: !awayTeamId,
  });

  // Load existing match data when in edit mode
  useEffect(() => {
    if (existingMatch && isEditMode) {
      // Load basic match details
      if (existingMatch.tournament_id) {
        setTournamentId(existingMatch.tournament_id);
      }
      if (existingMatch.home_team_id) {
        setHomeTeamId(existingMatch.home_team_id);
      }
      if (existingMatch.away_team_id) {
        setAwayTeamId(existingMatch.away_team_id);
      }
      if (existingMatch.field_id) {
        setFieldId(existingMatch.field_id);
      }
      if (existingMatch.scheduled_time) {
        setScheduledTime(new Date(existingMatch.scheduled_time));
      }
      if (existingMatch.total_chukkers) {
        setTotalChukkers(existingMatch.total_chukkers.toString());
      }

      // Load existing lineups - do this after setting team IDs
      setTimeout(() => {
        if (
          existingMatch.match_lineups &&
          Array.isArray(existingMatch.match_lineups)
        ) {
          const homeLineup = existingMatch.match_lineups.filter(
            (l) => l.team_id === existingMatch.home_team_id
          );
          const awayLineup = existingMatch.match_lineups.filter(
            (l) => l.team_id === existingMatch.away_team_id
          );

          if (homeLineup.length > 0) {
            const homePlayerIds = homeLineup.map((l) => l.player_id);
            setSelectedHomePlayers(homePlayerIds);
          }

          if (awayLineup.length > 0) {
            const awayPlayerIds = awayLineup.map((l) => l.player_id);
            setSelectedAwayPlayers(awayPlayerIds);
          }
        }
        // Mark initial load as complete
        setIsInitialLoad(false);
      }, 100); // Small delay to ensure team IDs are set first
    }
  }, [existingMatch, isEditMode]);

  // Reset player selections when teams change (but not during initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      setSelectedHomePlayers([]);
    }
  }, [homeTeamId]);

  useEffect(() => {
    if (!isInitialLoad) {
      setSelectedAwayPlayers([]);
    }
  }, [awayTeamId]);

  // Calculate handicaps based on selected players
  const homeHandicap = useMemo(() => {
    if (!homePlayers || selectedHomePlayers.length === 0) return 0;
    const totalHandicap = selectedHomePlayers.reduce((sum, playerId) => {
      const player = homePlayers.find((p) => p.id === playerId);
      return sum + (player?.handicap || 0);
    }, 0);
    return totalHandicap;
  }, [homePlayers, selectedHomePlayers]);

  const awayHandicap = useMemo(() => {
    if (!awayPlayers || selectedAwayPlayers.length === 0) return 0;
    const totalHandicap = selectedAwayPlayers.reduce((sum, playerId) => {
      const player = awayPlayers.find((p) => p.id === playerId);
      return sum + (player?.handicap || 0);
    }, 0);
    return totalHandicap;
  }, [awayPlayers, selectedAwayPlayers]);

  const filteredTeams = useMemo(() => {
    if (!teams) return [] as Team[];
    if (!search) return teams;
    const q = search.toLowerCase();
    return teams.filter((t) => t.name.toLowerCase().includes(q));
  }, [teams, search]);

  const filteredFields = useMemo(() => {
    if (!fields) return [] as Field[];
    if (!search) return fields;
    const q = search.toLowerCase();
    return fields.filter((f) => (f.name || "").toLowerCase().includes(q));
  }, [fields, search]);

  const filteredTournaments = useMemo(() => {
    if (!tournaments) return [] as Tournament[];
    if (!search) return tournaments;
    const q = search.toLowerCase();
    return tournaments.filter((t) => t.name.toLowerCase().includes(q));
  }, [tournaments, search]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setScheduledTime(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDateTime = new Date(scheduledTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setScheduledTime(newDateTime);
    }
  };

  const validate = (): string | null => {
    if (!homeTeamId) return "Select a home team";
    if (!awayTeamId) return "Select an away team";
    if (homeTeamId === awayTeamId) return "Home and away teams must differ";
    if (selectedHomePlayers.length === 0) return "Select players for home team";
    if (selectedAwayPlayers.length === 0) return "Select players for away team";
    if (selectedHomePlayers.length > 4) return "Maximum 4 players per team";
    if (selectedAwayPlayers.length > 4) return "Maximum 4 players per team";
    const ch = Number(totalChukkers);
    if (![4, 6, 8].includes(ch)) return "Total chukkers must be 4, 6, or 8";
    return null;
  };

  const onSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert("Invalid form", error);
      return;
    }

    const payload: CreateMatchData = {
      tournament_id: tournamentId || undefined,
      home_team_id: homeTeamId!,
      away_team_id: awayTeamId!,
      scheduled_time: scheduledTime.toISOString(),
      field_id: fieldId || undefined,
      total_chukkers: Number(totalChukkers),
      home_handicap_goals: homeHandicap,
      away_handicap_goals: awayHandicap,
    };

    try {
      let matchResult;

      if (isEditMode && matchId) {
        // Update existing match
        matchResult = await updateMatch({
          id: matchId,
          updates: payload,
        }).unwrap();
      } else {
        // Create new match
        matchResult = await createMatch(payload).unwrap();
      }

      // Build lineup rows from selected players
      const homeRows = selectedHomePlayers.map((playerId) => {
        const player = (homePlayers || []).find((p) => p.id === playerId);
        return {
          match_id: matchResult.id,
          team_id: homeTeamId!,
          player_id: playerId,
          position: player?.position,
          starter: true,
        };
      });
      const awayRows = selectedAwayPlayers.map((playerId) => {
        const player = (awayPlayers || []).find((p) => p.id === playerId);
        return {
          match_id: matchResult.id,
          team_id: awayTeamId!,
          player_id: playerId,
          position: player?.position,
          starter: true,
        };
      });

      const rows = [...homeRows, ...awayRows];
      if (rows.length > 0) {
        try {
          if (isEditMode) {
            // Delete existing lineups first, then create new ones
            await deleteLineups(matchResult.id).unwrap();
          }
          await createLineups({ rows }).unwrap();
        } catch (e: any) {
          Alert.alert(
            "Partial success",
            `Match ${isEditMode ? "updated" : "created"}, but saving lineups failed. You can add them later.`
          );
        }
      }

      const successMessage = isEditMode
        ? "Match updated successfully"
        : "Match created successfully";
      Alert.alert("Success", successMessage, [
        {
          text: "View",
          onPress: () =>
            router.replace(`/(app)/(tabs)/matches/${matchResult.id}`),
        },
        {
          text: "Done",
          onPress: () => router.replace("/(app)/(tabs)/matches"),
          style: "cancel",
        },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message || `Failed to ${isEditMode ? "update" : "create"} match`
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {isEditMode ? "Edit Match" : "Create Match"}
      </Text>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onSubmit}
        disabled={isLoading}
      >
        <Ionicons name="checkmark" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  const SelectorModal: React.FC<
    { type: NonNullable<SelectorType> } & { onClose: () => void }
  > = ({ type, onClose }) => {
    const isTeam = type === "home" || type === "away";
    const isField = type === "field";
    const isTournament = type === "tournament";
    const isPlayerSelector = type === "homePlayers" || type === "awayPlayers";

    const data = isTeam
      ? filteredTeams
      : isField
        ? filteredFields
        : isTournament
          ? filteredTournaments
          : isPlayerSelector
            ? (type === "homePlayers" ? homePlayers : awayPlayers) || []
            : [];

    const selectedPlayers =
      type === "homePlayers"
        ? selectedHomePlayers
        : type === "awayPlayers"
          ? selectedAwayPlayers
          : [];

    const onPick = (id: string) => {
      if (type === "home") setHomeTeamId(id);
      if (type === "away") setAwayTeamId(id);
      if (type === "field") setFieldId(id);
      if (type === "tournament") setTournamentId(id);
      setSearch("");
      if (!isPlayerSelector) {
        onClose();
      }
    };

    const togglePlayer = (playerId: string) => {
      if (type === "homePlayers") {
        setSelectedHomePlayers((prev) =>
          prev.includes(playerId)
            ? prev.filter((id) => id !== playerId)
            : [...prev, playerId]
        );
      } else if (type === "awayPlayers") {
        setSelectedAwayPlayers((prev) =>
          prev.includes(playerId)
            ? prev.filter((id) => id !== playerId)
            : [...prev, playerId]
        );
      }
    };

    const renderItem = ({ item }: { item: any }) => {
      if (isPlayerSelector) {
        const isSelected = selectedPlayers.includes(item.id);
        const player = item as Player;
        return (
          <TouchableOpacity
            style={[styles.selectItem, isSelected && styles.selectedItem]}
            onPress={() => togglePlayer(item.id)}
          >
            <View style={styles.playerItemContent}>
              <View>
                <Text
                  style={[
                    styles.selectItemText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.playerHandicap,
                    isSelected && styles.selectedText,
                  ]}
                >
                  Handicap: {player.handicap || 0}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.PRIMARY}
                />
              )}
            </View>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={styles.selectItem}
          onPress={() => onPick(item.id)}
        >
          <Text style={styles.selectItemText}>{item.name}</Text>
        </TouchableOpacity>
      );
    };

    return (
      <SafeModal
        visible
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isPlayerSelector
                  ? `Select Players (${selectedPlayers.length}/4)`
                  : `Select ${isTeam ? "Team" : isField ? "Field" : "Tournament"}`}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            {!isPlayerSelector && (
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor="#999"
                />
              </View>
            )}
            {isPlayerSelector && (
              <View style={styles.playerSelectorInfo}>
                <Text style={styles.playerSelectorInfoText}>
                  Total Handicap:{" "}
                  {type === "homePlayers" ? homeHandicap : awayHandicap}
                </Text>
              </View>
            )}
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </SafeModal>
    );
  };

  // Show loading state when fetching existing match data
  if (isEditMode && isLoadingMatch) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading match data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Tournament (optional)</Text>
        <TouchableOpacity
          style={styles.inputLike}
          onPress={() => setSelectorOpen("tournament")}
        >
          <Text style={styles.inputText}>
            {tournamentId
              ? tournaments?.find((t) => t.id === tournamentId)?.name
              : "Select tournament"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Home Team</Text>
        <TouchableOpacity
          style={styles.inputLike}
          onPress={() => setSelectorOpen("home")}
        >
          <Text style={styles.inputText}>
            {homeTeamId
              ? teams?.find((t) => t.id === homeTeamId)?.name
              : "Select home team"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        {homeTeamId && (
          <>
            <Text style={styles.label}>
              Home Team Players{" "}
              {selectedHomePlayers.length > 0 &&
                `(${selectedHomePlayers.length} selected)`}
            </Text>
            <TouchableOpacity
              style={styles.inputLike}
              onPress={() => setSelectorOpen("homePlayers")}
            >
              <Text style={styles.inputText}>
                {selectedHomePlayers.length > 0
                  ? `${selectedHomePlayers.length} players selected (Handicap: ${homeHandicap})`
                  : "Select players"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#999" />
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.label}>Away Team</Text>
        <TouchableOpacity
          style={styles.inputLike}
          onPress={() => setSelectorOpen("away")}
        >
          <Text style={styles.inputText}>
            {awayTeamId
              ? teams?.find((t) => t.id === awayTeamId)?.name
              : "Select away team"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        {awayTeamId && (
          <>
            <Text style={styles.label}>
              Away Team Players{" "}
              {selectedAwayPlayers.length > 0 &&
                `(${selectedAwayPlayers.length} selected)`}
            </Text>
            <TouchableOpacity
              style={styles.inputLike}
              onPress={() => setSelectorOpen("awayPlayers")}
            >
              <Text style={styles.inputText}>
                {selectedAwayPlayers.length > 0
                  ? `${selectedAwayPlayers.length} players selected (Handicap: ${awayHandicap})`
                  : "Select players"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#999" />
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.label}>Field (optional)</Text>
        <TouchableOpacity
          style={styles.inputLike}
          onPress={() => setSelectorOpen("field")}
        >
          <Text style={styles.inputText}>
            {fieldId
              ? fields?.find((f) => f.id === fieldId)?.name
              : "Select field"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Scheduled Date & Time</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={[styles.inputLike, styles.dateTimeInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={18} color="#666" />
            <Text style={styles.inputText}>{formatDate(scheduledTime)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inputLike, styles.dateTimeInput]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={18} color="#666" />
            <Text style={styles.inputText}>{formatTime(scheduledTime)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
            is24Hour={false}
          />
        )}

        {Platform.OS === "ios" && (showDatePicker || showTimePicker) && (
          <TouchableOpacity
            style={styles.datePickerDone}
            onPress={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
          >
            <Text style={styles.datePickerDoneText}>Done</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Total Chukkers (4, 6, or 8)</Text>
        <TextInput
          style={styles.textInput}
          value={totalChukkers}
          onChangeText={setTotalChukkers}
          placeholder="6"
          placeholderTextColor="#999"
          keyboardType="number-pad"
        />

        {(selectedHomePlayers.length > 0 || selectedAwayPlayers.length > 0) && (
          <View style={styles.handicapSummary}>
            <Text style={styles.handicapSummaryTitle}>
              Calculated Handicaps
            </Text>
            <View style={styles.handicapRow}>
              <Text style={styles.handicapLabel}>Home Team:</Text>
              <Text style={styles.handicapValue}>{homeHandicap} goals</Text>
            </View>
            <View style={styles.handicapRow}>
              <Text style={styles.handicapLabel}>Away Team:</Text>
              <Text style={styles.handicapValue}>{awayHandicap} goals</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && { opacity: 0.6 }]}
          onPress={onSubmit}
          disabled={isLoading}
        >
          <Ionicons name="save" size={18} color="#fff" />
          <Text style={styles.submitButtonText}>
            {isLoading
              ? "Saving..."
              : isEditMode
                ? "Update Match"
                : "Create Match"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {selectorOpen && (
        <SelectorModal
          type={selectorOpen}
          onClose={() => setSelectorOpen(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 12,
  },
  inputLike: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputText: {
    color: "#333",
    fontSize: 14,
  },
  textInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
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
  selectedItem: {
    backgroundColor: "#f0f8ff",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  selectedText: {
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  playerItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerHandicap: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  playerSelectorInfo: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  playerSelectorInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
    textAlign: "center",
  },
  handicapSummary: {
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY + "30",
  },
  handicapSummaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.PRIMARY,
    marginBottom: 12,
  },
  handicapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  handicapLabel: {
    fontSize: 14,
    color: "#555",
  },
  handicapValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  datePickerDone: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  datePickerDoneText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
