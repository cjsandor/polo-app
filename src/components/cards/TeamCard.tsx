import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../config/constants";
import type { Team } from "../../types/database";

export interface TeamCardProps {
  team: Team;
  onPress: () => void;
}

const TeamCardComponent: React.FC<TeamCardProps> = ({ team, onPress }) => (
  <TouchableOpacity style={styles.teamCard} onPress={onPress}>
    <View style={styles.teamInfo}>
      <View style={styles.teamLogo}>
        <Ionicons name="shield" size={32} color={COLORS.PRIMARY} />
      </View>
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
          <Text style={styles.detailText}>{team.players?.length || 0} Players</Text>
        </View>
      </View>
    </View>
    <View style={styles.teamActions}>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </View>
  </TouchableOpacity>
);

export const TeamCard = React.memo(TeamCardComponent);

const styles = StyleSheet.create({
  teamCard: {
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
});

export default TeamCard;
