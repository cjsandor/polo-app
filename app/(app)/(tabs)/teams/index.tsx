/**
 * Teams Screen
 * Displays teams with search and follow functionality
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
import { useGetTeamsQuery } from "../../../../src/store/api/slices/teamsApi";

// Types & Constants
import type { Team } from "../../../../src/types/database";
import { COLORS } from "../../../../src/config/constants";
import { TeamCard } from "../../../../src/components/cards/TeamCard";

export default function TeamsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // API Query
  const { data: teams, isLoading, refetch } = useGetTeamsQuery();

  const filteredTeams = teams?.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamPress = useCallback(
    (team: Team) => {
      router.push(`/(app)/(tabs)/teams/${team.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderTeamCard = ({ item }: { item: Team }) => {
    return (
      <TeamCard
        team={item}
        onPress={() => handleTeamPress(item)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchQuery ? "No teams match your search" : "No teams found"}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh" size={20} color={COLORS.PRIMARY} />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Teams" />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search teams..."
      />

      {/* Content */}
      <View style={styles.content}>
        {isLoading && !teams ? (
          <LoadingSpinner text="Loading teams..." />
        ) : (
          <FlatList
            data={filteredTeams || []}
            renderItem={renderTeamCard}
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
