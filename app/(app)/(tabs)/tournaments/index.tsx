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
import { COLORS, UI } from "../../../../src/config/constants";

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

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.toLocaleDateString("en-US", { ...options, year: "numeric" })} - ${end.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
    } else if (start.getMonth() !== end.getMonth()) {
      return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
    } else {
      return `${start.toLocaleDateString("en-US", options)} - ${end.getDate()}, ${end.getFullYear()}`;
    }
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

  const renderTournamentCard = ({ item }: { item: Tournament }) => {
    const status = getTournamentStatus(item.start_date, item.end_date);

    return (
      <TouchableOpacity
        style={styles.tournamentCard}
        onPress={() => handleTournamentPress(item)}
      >
        <View style={styles.tournamentInfo}>
          {/* Tournament Icon */}
          <View style={styles.tournamentLogo}>
            <Ionicons name="trophy" size={32} color={COLORS.PRIMARY} />
          </View>

          {/* Tournament Details */}
          <View style={styles.tournamentDetails}>
            <Text style={styles.tournamentName}>{item.name}</Text>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDateRange(item.start_date, item.end_date)}
              </Text>
            </View>

            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            )}

            <View style={styles.statusBadge}>
              <View
                style={[styles.statusDot, { backgroundColor: status.color }]}
              />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Icon */}
        <View style={styles.tournamentActions}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

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
  tournamentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  tournamentInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tournamentLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  tournamentDetails: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
  tournamentActions: {
    flexDirection: "row",
    alignItems: "center",
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
