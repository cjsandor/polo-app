/**
 * Tournaments Screen
 * Displays tournaments with search functionality
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Components
import { LoadingSpinner } from "../../../../src/components/ui/LoadingSpinner";
import { Header } from "../../../../src/components/ui/Header";
import { SearchBar } from "../../../../src/components/ui/SearchBar";

// API Hooks
import { useGetTournamentsQuery } from "../../../../src/store/api/slices/tournamentsApi";

// Types & Constants
import type { Tournament } from "../../../../src/types/database";
import { COLORS } from "../../../../src/config/constants";
import { TournamentCard } from "../../../../src/components/cards/TournamentCard";

export default function TournamentsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // API Query
  const { data: tournaments, isLoading, refetch } = useGetTournamentsQuery();

  const filteredTournaments = tournaments?.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTournamentPress = useCallback(
    (tournament: Tournament) => {
      router.push(`/(app)/(tabs)/tournaments/${tournament.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderTournamentCard = ({ item }: { item: Tournament }) => (
    <TournamentCard
      tournament={item}
      onPress={() => handleTournamentPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="trophy-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchQuery
          ? "No tournaments match your search"
          : "No tournaments found"}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh" size={20} color={COLORS.PRIMARY} />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Tournaments" />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search tournaments..."
      />

      {/* Content */}
      <View style={styles.content}>
        {isLoading && !tournaments ? (
          <LoadingSpinner text="Loading tournaments..." />
        ) : (
          <FlatList
            data={filteredTournaments || []}
            renderItem={renderTournamentCard}
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
}

export const options = {
  title: "Tournaments",
  tabBarLabel: "Tournaments",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
