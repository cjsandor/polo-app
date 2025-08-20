/**
 * API Helper Utilities
 * Common utilities for API operations and data transformation
 */

import type {
    EventType,
    Match,
    MatchEvent,
    MatchStatus,
    Player,
    Team,
} from "../types/database";

// Score calculation utilities
export const scoreUtils = {
    /**
     * Calculate match score from goal events
     */
    calculateScoreFromEvents: (
        events: MatchEvent[],
        homeTeamId: string,
        awayTeamId: string,
    ) => {
        let homeScore = 0;
        let awayScore = 0;

        events.forEach((event) => {
            if (
                event.event_type === "goal" ||
                event.event_type === "penalty_goal"
            ) {
                if (event.team_id === homeTeamId) {
                    homeScore++;
                } else if (event.team_id === awayTeamId) {
                    awayScore++;
                }
            } else if (event.event_type === "own_goal") {
                // Own goal adds score to the opposing team
                if (event.team_id === homeTeamId) {
                    awayScore++;
                } else if (event.team_id === awayTeamId) {
                    homeScore++;
                }
            }
        });

        return { homeScore, awayScore };
    },

    /**
     * Get score by chukker
     */
    getScoreByChukker: (
        events: MatchEvent[],
        homeTeamId: string,
        awayTeamId: string,
        chukker: number,
    ) => {
        const chukkerEvents = events.filter((e) => e.chukker === chukker);
        return scoreUtils.calculateScoreFromEvents(
            chukkerEvents,
            homeTeamId,
            awayTeamId,
        );
    },

    /**
     * Get cumulative score by chukker
     */
    getCumulativeScoreByChukker: (
        events: MatchEvent[],
        homeTeamId: string,
        awayTeamId: string,
        maxChukker: number,
    ) => {
        const scores = [];
        let cumulativeHome = 0;
        let cumulativeAway = 0;

        for (let chukker = 1; chukker <= maxChukker; chukker++) {
            const { homeScore, awayScore } = scoreUtils.getScoreByChukker(
                events,
                homeTeamId,
                awayTeamId,
                chukker,
            );

            cumulativeHome += homeScore;
            cumulativeAway += awayScore;

            scores.push({
                chukker,
                homeScore: cumulativeHome,
                awayScore: cumulativeAway,
                chukkerGoals: { home: homeScore, away: awayScore },
            });
        }

        return scores;
    },
};

// Match utilities
export const matchUtils = {
    /**
     * Check if match is currently live
     */
    isLive: (match: Match): boolean => {
        return match.status === "live";
    },

    /**
     * Check if match is upcoming
     */
    isUpcoming: (match: Match): boolean => {
        return match.status === "scheduled" &&
            new Date(match.scheduled_time) > new Date();
    },

    /**
     * Check if match is completed
     */
    isCompleted: (match: Match): boolean => {
        return match.status === "completed";
    },

    /**
     * Get match duration in minutes
     */
    getMatchDuration: (match: Match): number | null => {
        if (!match.started_at) return null;

        const endTime = match.ended_at ? new Date(match.ended_at) : new Date();
        const startTime = new Date(match.started_at);

        return Math.floor(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60),
        );
    },

    /**
     * Get current match time display
     */
    getCurrentMatchTime: (match: Match): string => {
        const duration = matchUtils.getMatchDuration(match);
        if (!duration) return "00:00";

        const minutes = Math.floor(duration % 60);
        const hours = Math.floor(duration / 60);

        return hours > 0
            ? `${hours}:${minutes.toString().padStart(2, "0")}`
            : `${minutes}:00`;
    },

    /**
     * Get match winner
     */
    getWinner: (
        match: Match,
    ): { winner: "home" | "away" | "draw" | null; margin?: number } => {
        if (!matchUtils.isCompleted(match)) return { winner: null };

        const homeScore = match.home_score || 0;
        const awayScore = match.away_score || 0;

        if (homeScore > awayScore) {
            return { winner: "home", margin: homeScore - awayScore };
        } else if (awayScore > homeScore) {
            return { winner: "away", margin: awayScore - homeScore };
        } else {
            return { winner: "draw" };
        }
    },

    /**
     * Get match phase description
     */
    getMatchPhase: (match: Match): string => {
        if (match.status === "scheduled") return "Upcoming";
        if (match.status === "completed") return "Final";
        if (match.status === "cancelled") return "Cancelled";
        if (match.status === "postponed") return "Postponed";
        if (match.status === "abandoned") return "Abandoned";

        if (match.status === "live") {
            const chukker = match.current_chukker;
            if (!chukker) return "Live";

            const totalChukkers = match.total_chukkers || 6;
            if (chukker <= totalChukkers) {
                return `Chukker ${chukker}`;
            } else {
                return `Overtime ${chukker - totalChukkers}`;
            }
        }

        return match.status;
    },
};

// Team utilities
export const teamUtils = {
    /**
     * Calculate team handicap from players
     */
    calculateTeamHandicap: (players: Player[]): number => {
        return players.reduce(
            (total, player) => total + (player.handicap || 0),
            0,
        );
    },

    /**
     * Get team record from matches
     */
    getTeamRecord: (matches: Match[], teamId: string) => {
        let wins = 0;
        let losses = 0;
        let draws = 0;

        matches.forEach((match) => {
            if (match.status !== "completed") return;

            const isHome = match.home_team_id === teamId;
            const homeScore = match.home_score || 0;
            const awayScore = match.away_score || 0;

            if (homeScore === awayScore) {
                draws++;
            } else if (
                (isHome && homeScore > awayScore) ||
                (!isHome && awayScore > homeScore)
            ) {
                wins++;
            } else {
                losses++;
            }
        });

        return { wins, losses, draws, played: wins + losses + draws };
    },
};

// Event utilities
export const eventUtils = {
    /**
     * Get event display name
     */
    getEventDisplayName: (eventType: EventType): string => {
        const eventNames: Record<EventType, string> = {
            goal: "Goal",
            own_goal: "Own Goal",
            penalty_goal: "Penalty Goal",
            foul: "Foul",
            substitution: "Substitution",
            knock_in: "Knock In",
            throw_in: "Throw In",
            timeout: "Timeout",
            injury: "Injury",
            chukker_start: "Chukker Start",
            chukker_end: "Chukker End",
            yellow_card: "Yellow Card",
            red_card: "Red Card",
        };

        return eventNames[eventType] || eventType;
    },

    /**
     * Get event icon name (for UI)
     */
    getEventIcon: (eventType: EventType): string => {
        const eventIcons: Record<EventType, string> = {
            goal: "football",
            own_goal: "football",
            penalty_goal: "football",
            foul: "warning",
            substitution: "swap-horizontal",
            knock_in: "play",
            throw_in: "play",
            timeout: "pause",
            injury: "medical",
            chukker_start: "play-circle",
            chukker_end: "stop-circle",
            yellow_card: "card",
            red_card: "card",
        };

        return eventIcons[eventType] || "help-circle";
    },

    /**
     * Check if event affects score
     */
    affectsScore: (eventType: EventType): boolean => {
        return ["goal", "penalty_goal", "own_goal"].includes(eventType);
    },
};

// Search utilities
export const searchUtils = {
    /**
     * Create search query for PostgreSQL full-text search
     */
    createSearchQuery: (term: string): string => {
        return term
            .trim()
            .split(/\s+/)
            .map((word) => `${word}:*`)
            .join(" | ");
    },

    /**
     * Highlight search terms in text
     */
    highlightSearchTerms: (text: string, searchTerm: string): string => {
        if (!searchTerm.trim()) return text;

        const regex = new RegExp(
            `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi",
        );
        return text.replace(regex, "<mark>$1</mark>");
    },

    /**
     * Score search relevance (simple implementation)
     */
    scoreRelevance: (text: string, searchTerm: string): number => {
        if (!searchTerm.trim()) return 0;

        const lowerText = text.toLowerCase();
        const lowerTerm = searchTerm.toLowerCase();

        // Exact match gets highest score
        if (lowerText.includes(lowerTerm)) return 10;

        // Count word matches
        const textWords = lowerText.split(/\s+/);
        const termWords = lowerTerm.split(/\s+/);

        let matches = 0;
        termWords.forEach((termWord) => {
            textWords.forEach((textWord) => {
                if (textWord.includes(termWord)) {
                    matches++;
                }
            });
        });

        return matches;
    },
};

// Cache utilities
export const cacheUtils = {
    /**
     * Generate cache key for paginated data
     */
    generatePaginationKey: (
        base: string,
        page: number,
        limit: number,
    ): string => {
        return `${base}-page-${page}-limit-${limit}`;
    },

    /**
     * Check if cached data is stale
     */
    isStale: (timestamp: number, maxAgeMs: number): boolean => {
        return Date.now() - timestamp > maxAgeMs;
    },

    /**
     * Merge paginated results
     */
    mergePaginatedResults: <T>(
        existing: T[],
        incoming: T[],
        idField = "id" as keyof T,
    ): T[] => {
        const existingIds = new Set(existing.map((item) => item[idField]));
        const newItems = incoming.filter((item) =>
            !existingIds.has(item[idField])
        );
        return [...existing, ...newItems];
    },
};

// Export all utilities
export {
    cacheUtils,
    eventUtils,
    matchUtils,
    scoreUtils,
    searchUtils,
    teamUtils,
};
