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
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Components
import { LoadingSpinner } from "../../../../src/components/ui/LoadingSpinner";

// API Hooks
import {
  useGetTeamsQuery,
  useFollowTeamMutation,
  useUnfollowTeamMutation,
  useGetFollowedTeamsQuery,
} from "../../../../src/store/api/slices/teamsApi";
import { useAuthContext } from "../../../../src/contexts/AuthContext";

// Types & Constants
import type { Team } from "../../../../src/types/database";
import { COLORS, UI } from "../../../../src/config/constants";

export default function TeamsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuthContext();

  // API Query
  const { data: teams, isLoading, refetch } = useGetTeamsQuery();
  const { data: followedTeams } = useGetFollowedTeamsQuery(user?.id || "", {
    skip: !user?.id,
  });
  const [followTeam] = useFollowTeamMutation();
  const [unfollowTeam] = useUnfollowTeamMutation();

  const filteredTeams = teams?.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamPress = useCallback(
    (team: Team) => {
      router.push(`/teams/${team.id}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderTeamCard = ({ item }: { item: Team }) => {
    const isFollowing = !!followedTeams?.some((t) => t.id === item.id);
    const onToggleFollow = async () => {
      if (!user?.id) return;
      if (isFollowing) {
        await unfollowTeam({ userId: user.id, teamId: item.id });
      } else {
        await followTeam({ userId: user.id, teamId: item.id });
      }
    };
    return (
      <TeamCard
        team={item}
        onPress={() => handleTeamPress(item)}
        isFollowing={isFollowing}
        onToggleFollow={onToggleFollow}
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
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

// Team Card Component
const TeamCard: React.FC<{
  team: Team;
  onPress: () => void;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}> = ({ team, onPress, isFollowing = false, onToggleFollow }) => {
  return (
    <TouchableOpacity style={styles.teamCard} onPress={onPress}>
      <View style={styles.teamInfo}>
        {/* Team Logo */}
        <View style={styles.teamLogo}>
          <Ionicons name="shield" size={32} color={COLORS.PRIMARY} />
        </View>

        {/* Team Details */}
        <View style={styles.teamDetails}>
          <Text style={styles.teamName}>{team.name}</Text>
          {team.home_field?.name && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{team.home_field.name}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {team.players?.length || 0} Players
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.teamActions}>
        <TouchableOpacity style={styles.followButton} onPress={onToggleFollow}>
          <Ionicons
            name={isFollowing ? "heart" : "heart-outline"}
            size={20}
            color={COLORS.PRIMARY}
          />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
};

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
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  teamCard: {
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
  teamInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
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
  teamActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}15`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
