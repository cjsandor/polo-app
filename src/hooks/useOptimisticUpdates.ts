/**
 * Optimistic Updates Hooks
 * Custom hooks for handling optimistic updates in the app
 */

import { useCallback } from "react";
import { useAppDispatch } from "../store/hooks";
import { api } from "../store/api";
import type { Match, MatchEvent } from "../types/database";

/**
 * Hook for optimistic match score updates
 */
export const useOptimisticMatchScore = () => {
    const dispatch = useAppDispatch();

    const updateScoreOptimistically = useCallback(
        (matchId: string, homeScore: number, awayScore: number) => {
            // Update the cache optimistically
            dispatch(
                api.util.updateQueryData("getMatchById", matchId, (draft) => {
                    if (draft) {
                        draft.home_score = homeScore;
                        draft.away_score = awayScore;
                        draft.updated_at = new Date().toISOString();
                    }
                }),
            );

            // Also update in match lists
            dispatch(
                api.util.updateQueryData(
                    "getLiveMatches",
                    undefined,
                    (draft) => {
                        const match = draft.find((m) => m.id === matchId);
                        if (match) {
                            match.home_score = homeScore;
                            match.away_score = awayScore;
                            match.updated_at = new Date().toISOString();
                        }
                    },
                ),
            );
        },
        [dispatch],
    );

    const revertScoreUpdate = useCallback(
        (matchId: string) => {
            // This would be called if the optimistic update fails
            dispatch(api.util.invalidateTags([{ type: "Match", id: matchId }]));
        },
        [dispatch],
    );

    return {
        updateScoreOptimistically,
        revertScoreUpdate,
    };
};

/**
 * Hook for optimistic match event creation
 */
export const useOptimisticMatchEvent = () => {
    const dispatch = useAppDispatch();

    const addEventOptimistically = useCallback(
        (matchId: string, event: Partial<MatchEvent>) => {
            const optimisticEvent: MatchEvent = {
                id: `temp-${Date.now()}`,
                match_id: matchId,
                event_type: event.event_type!,
                chukker: event.chukker!,
                occurred_at: event.occurred_at || new Date().toISOString(),
                team_id: event.team_id || null,
                player_id: event.player_id || null,
                details: event.details || null,
                sequence: 0, // Will be set by the server
                created_by: event.created_by || null,
                inserted_at: new Date().toISOString(),
            };

            // Add to match events cache
            dispatch(
                api.util.updateQueryData("getMatchEvents", matchId, (draft) => {
                    optimisticEvent.sequence = draft.length + 1;
                    draft.push(optimisticEvent);
                }),
            );

            // If it's a goal, update the score
            if (["goal", "penalty_goal"].includes(event.event_type!)) {
                dispatch(
                    api.util.updateQueryData(
                        "getMatchById",
                        matchId,
                        (draft) => {
                            if (draft && event.team_id) {
                                if (event.team_id === draft.home_team_id) {
                                    draft.home_score = (draft.home_score || 0) +
                                        1;
                                } else if (
                                    event.team_id === draft.away_team_id
                                ) {
                                    draft.away_score = (draft.away_score || 0) +
                                        1;
                                }
                                draft.updated_at = new Date().toISOString();
                            }
                        },
                    ),
                );
            }

            return optimisticEvent.id;
        },
        [dispatch],
    );

    const revertEventCreation = useCallback(
        (matchId: string, tempEventId: string) => {
            // Remove the optimistic event
            dispatch(
                api.util.updateQueryData("getMatchEvents", matchId, (draft) => {
                    const index = draft.findIndex((event) =>
                        event.id === tempEventId
                    );
                    if (index !== -1) {
                        draft.splice(index, 1);
                    }
                }),
            );

            // Invalidate the match to refresh scores
            dispatch(api.util.invalidateTags([{ type: "Match", id: matchId }]));
        },
        [dispatch],
    );

    return {
        addEventOptimistically,
        revertEventCreation,
    };
};

/**
 * Hook for optimistic match status updates
 */
export const useOptimisticMatchStatus = () => {
    const dispatch = useAppDispatch();

    const updateStatusOptimistically = useCallback(
        (
            matchId: string,
            status: Match["status"],
            currentChukker?: number,
        ) => {
            dispatch(
                api.util.updateQueryData("getMatchById", matchId, (draft) => {
                    if (draft) {
                        draft.status = status;
                        if (currentChukker !== undefined) {
                            draft.current_chukker = currentChukker;
                        }
                        draft.updated_at = new Date().toISOString();
                    }
                }),
            );

            // Update in various match lists
            const listQueries = [
                "getMatches",
                "getLiveMatches",
                "getUpcomingMatches",
            ] as const;

            listQueries.forEach((queryName) => {
                dispatch(
                    api.util.updateQueryData(queryName, undefined, (draft) => {
                        const match = draft.find((m) => m.id === matchId);
                        if (match) {
                            match.status = status;
                            if (currentChukker !== undefined) {
                                match.current_chukker = currentChukker;
                            }
                            match.updated_at = new Date().toISOString();
                        }
                    }),
                );
            });
        },
        [dispatch],
    );

    return { updateStatusOptimistically };
};

/**
 * Hook for batch optimistic updates
 */
export const useBatchOptimisticUpdates = () => {
    const dispatch = useAppDispatch();

    const performBatchUpdates = useCallback(
        (updates: Array<() => void>) => {
            // Execute all updates in a batch
            updates.forEach((update) => update());
        },
        [],
    );

    const revertBatchUpdates = useCallback(
        (tags: Array<{ type: string; id?: string }>) => {
            // Invalidate all affected tags to refresh data
            dispatch(api.util.invalidateTags(tags));
        },
        [dispatch],
    );

    return {
        performBatchUpdates,
        revertBatchUpdates,
    };
};
