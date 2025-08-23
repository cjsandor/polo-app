import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, POLO } from "../../config/constants";
import type { Player } from "../../types/database";

export interface PlayerCardProps {
  player: Player;
  onPress: () => void;
}

const PlayerCardComponent: React.FC<PlayerCardProps> = ({ player, onPress }) => {
  const getPositionText = (position?: number) => {
    if (!position) return "Unknown";
    return POLO.POSITIONS[position as keyof typeof POLO.POSITIONS] || "Unknown";
  };

  const getHandicapColor = (handicap?: number) => {
    if (handicap === null || handicap === undefined) return "#999";
    if (handicap < 0) return COLORS.ERROR;
    if (handicap >= 6) return COLORS.SUCCESS;
    return COLORS.PRIMARY;
  };

  return (
    <TouchableOpacity style={styles.playerCard} onPress={onPress}>
      <View style={styles.playerInfo}>
        <View style={styles.playerAvatar}>
          <Ionicons name="person" size={24} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.playerDetails}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerName}>{player.name}</Text>
            {player.handicap !== null && player.handicap !== undefined && (
              <View
                style={[
                  styles.handicapBadge,
                  { backgroundColor: getHandicapColor(player.handicap) },
                ]}
              >
                <Text style={styles.handicapText}>
                  {player.handicap >= 0 ? "+" : ""}
                  {player.handicap}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.playerMeta}>
            {player.team && (
              <View style={styles.metaRow}>
                <Ionicons name="shield-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{player.team.name}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{getPositionText(player.position)}</Text>
            </View>
            {player.jersey_number && (
              <View style={styles.metaRow}>
                <Ionicons name="shirt-outline" size={14} color="#666" />
                <Text style={styles.metaText}>#{player.jersey_number}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

export const PlayerCard = React.memo(PlayerCardComponent);

const styles = StyleSheet.create({
  playerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playerDetails: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  handicapBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  handicapText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  playerMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});

export default PlayerCard;
