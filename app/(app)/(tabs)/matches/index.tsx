/**
 * Matches Screen
 * Displays matches in tabs: Upcoming, Live, Completed
 */

import React, { useState, useCallback, useEffect } from "react";
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
import { MatchCard } from "../../../../src/components/ui/MatchCard";
import { LoadingSpinner } from "../../../../src/components/ui/LoadingSpinner";

// API Hooks
import {
  useLazyGetUpcomingMatchesQuery,
  useLazyGetLiveMatchesQuery,
  useLazyGetMatchesByStatusQuery,
} from "../../../../src/store/api/slices/matchesApi";

// Types & Constants
import type { Match } from "../../../../src/types/database";
import { COLORS } from "../../../../src/config/constants";
import { useIsAdmin, useIsAuthenticated } from "../../../../src/store/hooks";

type TabType = "upcoming" | "live" | "completed";

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "upcoming", label: "Upcoming", icon: "calendar-outline" },
  { key: "live", label: "Live", icon: "play-circle" },
  { key: "completed", label: "Completed", icon: "checkmark-circle" },
];

export default function MatchesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const isAuthenticated = useIsAuthenticated();

  // API Queries (lazy)
  const [
    fetchUpcomingMatches,
    { data: upcomingMatches, isFetching: upcomingLoading },
  ] = useLazyGetUpcomingMatchesQuery();

  const [fetchLiveMatches, { data: liveMatches, isFetching: liveLoading }] =
    useLazyGetLiveMatchesQuery();

  const [
    fetchCompletedMatches,
    { data: completedMatches, isFetching: completedLoading },
  ] = useLazyGetMatchesByStatusQuery();

  // Trigger appropriate query when tab becomes active
  useEffect(() => {
    switch (activeTab) {
      case "upcoming":
        fetchUpcomingMatches();
        break;
      case "live":
        fetchLiveMatches();
        break;
      case "completed":
        fetchCompletedMatches("completed");
        break;
    }
  }, [
    activeTab,
    fetchUpcomingMatches,
    fetchLiveMatches,
    fetchCompletedMatches,
  ]);

  const getCurrentData = (): {
    data: Match[] | undefined;
    isLoading: boolean;
  } => {
    switch (activeTab) {
      case "upcoming":
        return {
          data: upcomingMatches,
          isLoading: upcomingLoading,
        };
      case "live":
        return {
          data: liveMatches,
          isLoading: liveLoading,
        };
      case "completed":
        return {
          data: completedMatches,
          isLoading: completedLoading,
        };
    }
  };

  const { data: currentData, isLoading } = getCurrentData();

  const handleMatchPress = useCallback(
    (match: Match) => {
      router.push(`/(app)/(tabs)/matches/${match.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    switch (activeTab) {
      case "upcoming":
        fetchUpcomingMatches();
        break;
      case "live":
        fetchLiveMatches();
        break;
      case "completed":
        fetchCompletedMatches("completed");
        break;
    }
  }, [activeTab, fetchUpcomingMatches, fetchLiveMatches, fetchCompletedMatches]);

  const renderTabButton = (tab: (typeof TABS)[0]) => {
    const isActive = activeTab === tab.key;
    const matchCount =
      tab.key === "upcoming"
        ? upcomingMatches?.length
        : tab.key === "live"
          ? liveMatches?.length
          : completedMatches?.length;

    return (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tab.key)}
      >
        <View style={styles.tabContent}>
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={isActive ? COLORS.PRIMARY : "#666"}
          />
          <Text style={[styles.tabText, isActive && styles.activeTabText]}>
            {tab.label}
          </Text>
          {matchCount !== undefined && matchCount > 0 && (
            <View style={[styles.badge, isActive && styles.activeBadge]}>
              <Text
                style={[styles.badgeText, isActive && styles.activeBadgeText]}
              >
                {matchCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMatchCard = ({ item }: { item: Match }) => (
    <MatchCard match={item} onPress={() => handleMatchPress(item)} />
  );

  const renderEmptyState = () => {
    let message = "No matches found";
    let icon = "calendar-outline";

    switch (activeTab) {
      case "upcoming":
        message = "No upcoming matches";
        icon = "calendar-outline";
        break;
      case "live":
        message = "No live matches";
        icon = "play-circle-outline";
        break;
      case "completed":
        message = "No completed matches";
        icon = "checkmark-circle-outline";
        break;
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name={icon as any} size={64} color="#ccc" />
        <Text style={styles.emptyText}>{message}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <View style={styles.headerButtons}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/(app)/(tabs)/matches/create")}
            >
              <Ionicons name="add" size={24} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          )}
          {!isAuthenticated && (
            <TouchableOpacity
              style={[
                styles.headerButton,
                isAdmin && styles.headerButtonSpacer,
              ]}
              onPress={() => router.push("/(auth)/sign-in")}
              accessibilityLabel="Log in"
            >
              <Ionicons
                name="log-in-outline"
                size={24}
                color={COLORS.PRIMARY}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>{TABS.map(renderTabButton)}</View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading && !currentData ? (
          <LoadingSpinner text={`Loading ${activeTab} matches...`} />
        ) : (
          <FlatList
            data={currentData || []}
            renderItem={renderMatchCard}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButtonSpacer: {
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: `${COLORS.PRIMARY}15`,
  },
  tabContent: {
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 4,
  },
  activeTabText: {
    color: COLORS.PRIMARY,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  activeBadge: {
    backgroundColor: COLORS.PRIMARY,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
  },
  activeBadgeText: {
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
