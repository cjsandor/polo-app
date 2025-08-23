/**
 * Match Card Component
 * Displays match information in a card format
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Match } from "../../types/database";
import { COLORS } from "../../config/constants";

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const { width } = useWindowDimensions();
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";
  const isUpcoming = match.status === "scheduled";

  const getStatusColor = () => {
    switch (match.status) {
      case "live":
        return COLORS.SUCCESS;
      case "completed":
        return COLORS.PRIMARY;
      case "cancelled":
      case "abandoned":
        return COLORS.ERROR;
      case "postponed":
        return COLORS.WARNING;
      default:
        return "#666";
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case "live":
        return `LIVE - C${match.current_chukker}`;
      case "completed":
        return "FINAL";
      case "cancelled":
        return "CANCELLED";
      case "abandoned":
        return "ABANDONED";
      case "postponed":
        return "POSTPONED";
      default:
        return formatTime(match.scheduled_time);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `Today ${timeString}`;
    if (isTomorrow) return `Tomorrow ${timeString}`;

    return `${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })} ${timeString}`;
  };

  const formatScore = () => {
    if (!isCompleted && !isLive) return null;

    const homeTotal = match.home_score + match.home_handicap_goals;
    const awayTotal = match.away_score + match.away_handicap_goals;

    return `${homeTotal} - ${awayTotal}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Status Bar */}
      <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]}>
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Teams */}
        <View style={styles.teamsContainer}>
          {/* Home Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamInfo}>
              <View style={styles.teamLogo}>
                <Ionicons
                  name="shield-outline"
                  size={24}
                  color={COLORS.PRIMARY}
                />
              </View>
              <Text
                style={[styles.teamName, { maxWidth: width * 0.25 }]}
                numberOfLines={1}
              >
                {match.home_team?.name || "Home Team"}
              </Text>
            </View>
            {formatScore() && (
              <Text style={styles.teamScore}>
                {match.home_score + match.home_handicap_goals}
              </Text>
            )}
          </View>

          {/* VS or Score */}
          <View style={styles.centerSection}>
            {formatScore() ? (
              <Text style={styles.scoreText}>{formatScore()}</Text>
            ) : (
              <Text style={styles.vsText}>VS</Text>
            )}
          </View>

          {/* Away Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamInfo}>
              <View style={styles.teamLogo}>
                <Ionicons
                  name="shield-outline"
                  size={24}
                  color={COLORS.PRIMARY}
                />
              </View>
              <Text
                style={[styles.teamName, { maxWidth: width * 0.25 }]}
                numberOfLines={1}
              >
                {match.away_team?.name || "Away Team"}
              </Text>
            </View>
            {formatScore() && (
              <Text style={styles.teamScore}>
                {match.away_score + match.away_handicap_goals}
              </Text>
            )}
          </View>
        </View>

        {/* Match Details */}
        <View style={styles.detailsContainer}>
          {match.field?.name && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{match.field.name}</Text>
            </View>
          )}
          {match.tournament?.name && (
            <View style={styles.detailRow}>
              <Ionicons name="trophy-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{match.tournament.name}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="football-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {match.total_chukkers} Chukkers
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
    overflow: "hidden",
  },
  statusBar: {
    height: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 12,
    top: -1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 6,
  },
  liveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    position: "absolute",
    right: 12,
    top: -1,
  },
  content: {
    padding: 16,
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  teamSection: {
    flex: 1,
    alignItems: "center",
  },
  teamInfo: {
    alignItems: "center",
    marginBottom: 8,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  teamScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  centerSection: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  vsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },
  arrowContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});
