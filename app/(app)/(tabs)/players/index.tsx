/**
 * Players Screen
 * Displays players with search, filters, and detailed information
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Components
import { LoadingSpinner } from "../../../../src/components/ui/LoadingSpinner";

// API Hooks
import {
  useGetPlayersQuery,
  useSearchPlayersQuery,
} from "../../../../src/store/api/slices/playersApi";

// Types & Constants
import type { Player } from "../../../../src/types/database";
import { COLORS } from "../../../../src/config/constants";
import { PlayerCard } from "../../../../src/components/cards/PlayerCard";

export default function PlayersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [handicapFilter, setHandicapFilter] = useState<
    "all" | "neg" | "1-3" | "4-6" | "7+"
  >("all");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const router = useRouter();

  // API Query
  const { data: allPlayers, isLoading, refetch } = useGetPlayersQuery();
  const { data: searchResults, isLoading: searching } = useSearchPlayersQuery(
    debouncedQuery,
    { skip: debouncedQuery.length < 2 }
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filteredPlayers = useMemo(() => {
    const base = debouncedQuery.length >= 2 ? searchResults : allPlayers;
    if (!base) return [];

    return base.filter((player) => {
      const h = player.handicap ?? null;
      const matchesHandicap =
        handicapFilter === "all" ||
        (handicapFilter === "neg" && (h ?? 0) <= 0) ||
        (handicapFilter === "1-3" && h !== null && h >= 1 && h <= 3) ||
        (handicapFilter === "4-6" && h !== null && h >= 4 && h <= 6) ||
        (handicapFilter === "7+" && h !== null && h >= 7);

      return matchesHandicap;
    });
  }, [allPlayers, searchResults, debouncedQuery, handicapFilter]);

  const handlePlayerPress = useCallback(
    (player: Player) => {
      router.push(`/(app)/(tabs)/players/${player.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderPlayerCard = ({ item }: { item: Player }) => (
    <PlayerCard player={item} onPress={() => handlePlayerPress(item)} />
  );

  const renderHandicapFilter = () => {
    return (
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Handicap:</Text>
        <View style={styles.handicapFilters}>
          {(
            [
              { key: "all", label: "All" },
              { key: "neg", label: "≤ 0" },
              { key: "1-3", label: "1-3" },
              { key: "4-6", label: "4-6" },
              { key: "7+", label: "7+" },
            ] as const
          ).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.handicapFilter,
                handicapFilter === key && styles.activeHandicapFilter,
              ]}
              onPress={() => setHandicapFilter(key)}
            >
              <Text
                style={[
                  styles.handicapFilterText,
                  handicapFilter === key && styles.activeHandicapFilterText,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="person-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchQuery || handicapFilter !== "all"
          ? "No players match your criteria"
          : "No players found"}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh" size={20} color={COLORS.PRIMARY} />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Players</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search players or teams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      {renderHandicapFilter()}

      {/* Content */}
      <View style={styles.content}>
        {(isLoading || searching) && !(allPlayers || searchResults) ? (
          <LoadingSpinner text="Loading players..." />
        ) : (
          <FlatList
            data={filteredPlayers}
            renderItem={renderPlayerCard}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.PRIMARY]}
                tintColor={COLORS.PRIMARY}
              />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  handicapFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  handicapFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    marginBottom: 8,
  },
  activeHandicapFilter: {
    backgroundColor: COLORS.PRIMARY,
  },
  handicapFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeHandicapFilterText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}15`,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
    marginLeft: 8,
  },
});
