import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../config/constants";
import type { Tournament } from "../../types/database";

export interface TournamentCardProps {
  tournament: Tournament;
  onPress: () => void;
}

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

const TournamentCardComponent: React.FC<TournamentCardProps> = ({ tournament, onPress }) => {
  const status = getTournamentStatus(tournament.start_date, tournament.end_date);

  return (
    <TouchableOpacity style={styles.tournamentCard} onPress={onPress}>
      <View style={styles.tournamentInfo}>
        <View style={styles.tournamentLogo}>
          <Ionicons name="trophy" size={32} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.tournamentDetails}>
          <Text style={styles.tournamentName}>{tournament.name}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDateRange(tournament.start_date, tournament.end_date)}
            </Text>
          </View>
          {tournament.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{tournament.location}</Text>
            </View>
          )}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.tournamentActions}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
};

export const TournamentCard = React.memo(TournamentCardComponent);

const styles = StyleSheet.create({
  tournamentCard: {
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
});

export default TournamentCard;
