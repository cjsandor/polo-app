/**
 * Admin Matches Management
 * List matches with quick filters and actions; link to create/edit
 */

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useGetMatchesQuery,
  useDeleteMatchMutation,
} from "../../../src/store/api/slices/matchesApi";
import type { Match } from "../../../src/types/database";
import { COLORS } from "../../../src/config/constants";

export default function AdminMatchesScreen() {
  const router = useRouter();
  const { data: matches, isLoading, refetch } = useGetMatchesQuery();
  const [deleteMatch] = useDeleteMatchMutation();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "live" | "completed"
  >("all");

  const filtered = useMemo(() => {
    if (!matches) return [] as Match[];
    if (statusFilter === "all") return matches;
    return matches.filter((m) => m.status === statusFilter);
  }, [matches, statusFilter]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.replace("/(app)/(tabs)/admin")}
          accessibilityLabel="Back to Admin"
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Matches</Text>
      </View>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.push("/(app)/(tabs)/matches/create")}
        accessibilityLabel="Create match"
      >
        <Ionicons name="add" size={22} color={COLORS.PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filters}>
      {(["all", "scheduled", "live", "completed"] as const).map((key) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.filterPill,
            statusFilter === key && styles.filterPillActive,
          ]}
          onPress={() => setStatusFilter(key)}
        >
          <Text
            style={[
              styles.filterText,
              statusFilter === key && styles.filterTextActive,
            ]}
          >
            {key}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: Match }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.home_team?.name || "Home"} vs {item.away_team?.name || "Away"}
        </Text>
        <Text style={styles.rowSub}>
          {item.status.toUpperCase()} • Ch {item.current_chukker}/
          {item.total_chukkers}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.rowAction}
        onPress={() => router.push(`/(app)/(tabs)/matches/${item.id}`)}
      >
        <Ionicons name="open-outline" size={18} color="#616161" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.rowAction}
        onPress={() =>
          router.push(`/(app)/(tabs)/matches/create?id=${item.id}`)
        }
      >
        <Ionicons name="create-outline" size={18} color="#616161" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.rowAction}
        onPress={async () => {
          try {
            await deleteMatch(item.id).unwrap();
          } catch (e) {
            // ignore for now
          }
        }}
      >
        <Ionicons name="trash-outline" size={18} color="#d32f2f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="football-outline" size={48} color="#bdbdbd" />
            <Text style={styles.emptyText}>No matches found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#eeeeee",
  },
  filterPillActive: {
    backgroundColor: `${COLORS.PRIMARY}22`,
  },
  filterText: {
    color: "#616161",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  filterTextActive: {
    color: COLORS.PRIMARY,
  },
  list: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212121",
  },
  rowSub: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  rowAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#9e9e9e",
    marginTop: 8,
  },
});
