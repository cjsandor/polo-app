/**
 * Match Events API Slice
 * RTK Query endpoints for match event operations
 */

import { api } from "../index";
import type {
    CreateMatchEventData,
    EventType,
    MatchEvent,
} from "../../types/database";

export const matchEventsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get events for a match
        getMatchEvents: builder.query<MatchEvent[], string>({
            query: (matchId) => ({
                method: "select",
                table: "match_events",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams(*),
                            player:players(*)
                        `)
                        .eq("match_id", matchId)
                        .order("sequence", { ascending: true }),
            }),
            providesTags: (result, error, matchId) => [
                { type: "MatchEvent", id: matchId },
                "MatchEvent",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get events for a match by chukker
        getMatchEventsByChukker: builder.query<
            MatchEvent[],
            { matchId: string; chukker: number }
        >({
            query: ({ matchId, chukker }) => ({
                method: "select",
                table: "match_events",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams(*),
                            player:players(*)
                        `)
                        .eq("match_id", matchId)
                        .eq("chukker", chukker)
                        .order("sequence", { ascending: true }),
            }),
            providesTags: (result, error, { matchId, chukker }) => [
                { type: "MatchEvent", id: `${matchId}-chukker-${chukker}` },
                "MatchEvent",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get events by type for a match
        getMatchEventsByType: builder.query<
            MatchEvent[],
            { matchId: string; eventType: EventType }
        >({
            query: ({ matchId, eventType }) => ({
                method: "select",
                table: "match_events",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams(*),
                            player:players(*)
                        `)
                        .eq("match_id", matchId)
                        .eq("event_type", eventType)
                        .order("sequence", { ascending: true }),
            }),
            providesTags: (result, error, { matchId, eventType }) => [
                { type: "MatchEvent", id: `${matchId}-type-${eventType}` },
                "MatchEvent",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get goal events for a match (for score calculation)
        getGoalEvents: builder.query<MatchEvent[], string>({
            query: (matchId) => ({
                method: "select",
                table: "match_events",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams(*),
                            player:players(*)
                        `)
                        .eq("match_id", matchId)
                        .in("event_type", ["goal", "penalty_goal"])
                        .order("sequence", { ascending: true }),
            }),
            providesTags: (result, error, matchId) => [
                { type: "MatchEvent", id: `${matchId}-goals` },
                "MatchEvent",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get latest events for a match (for live updates)
        getLatestMatchEvents: builder.query<
            MatchEvent[],
            { matchId: string; limit?: number }
        >({
            query: ({ matchId, limit = 10 }) => ({
                method: "select",
                table: "match_events",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams(*),
                            player:players(*)
                        `)
                        .eq("match_id", matchId)
                        .order("sequence", { ascending: false })
                        .limit(limit),
            }),
            providesTags: (result, error, { matchId }) => [
                { type: "MatchEvent", id: `${matchId}-latest` },
                "MatchEvent",
            ],
            transformResponse: (response: any) =>
                response.data?.reverse() || [],
        }),

        // Create match event
        createMatchEvent: builder.mutation<MatchEvent, CreateMatchEventData>({
            query: (eventData) => ({
                method: "insert",
                table: "match_events",
                data: {
                    ...eventData,
                    occurred_at: eventData.occurred_at ||
                        new Date().toISOString(),
                },
                returning: "representation",
            }),
            // Optimistic update for goals
            async onQueryStarted(eventData, { dispatch, queryFulfilled }) {
                if (
                    ["goal", "penalty_goal", "own_goal"].includes(
                        eventData.event_type,
                    )
                ) {
                    // Update match score optimistically
                    const patchResult = dispatch(
                        matchEventsApi.util.updateQueryData(
                            "getMatchEvents",
                            eventData.match_id,
                            (draft) => {
                                // Add the new event optimistically
                                const newEvent = {
                                    ...eventData,
                                    id: `temp-${Date.now()}`,
                                    occurred_at: eventData.occurred_at ||
                                        new Date().toISOString(),
                                    inserted_at: new Date().toISOString(),
                                    sequence: draft.length + 1,
                                } as MatchEvent;
                                draft.push(newEvent);
                            },
                        ),
                    );

                    try {
                        await queryFulfilled;
                    } catch {
                        patchResult.undo();
                    }
                }
            },
            invalidatesTags: (result, error, eventData) => [
                { type: "MatchEvent", id: eventData.match_id },
                { type: "MatchEvent", id: `${eventData.match_id}-latest` },
                { type: "MatchEvent", id: `${eventData.match_id}-goals` },
                { type: "Match", id: eventData.match_id },
                "MatchEvent",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update match event
        updateMatchEvent: builder.mutation<
            MatchEvent,
            { id: string; updates: Partial<CreateMatchEventData> }
        >({
            query: ({ id, updates }) => ({
                method: "update",
                table: "match_events",
                data: updates,
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "MatchEvent", id },
                "MatchEvent",
                "Match",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Delete match event
        deleteMatchEvent: builder.mutation<void, string>({
            query: (id) => ({
                method: "delete",
                table: "match_events",
                query: (builder) => builder.eq("id", id),
            }),
            invalidatesTags: ["MatchEvent", "Match"],
        }),

        // Bulk create match events (for importing/syncing)
        bulkCreateMatchEvents: builder.mutation<
            MatchEvent[],
            CreateMatchEventData[]
        >({
            query: (events) => ({
                method: "insert",
                table: "match_events",
                data: events.map((event) => ({
                    ...event,
                    occurred_at: event.occurred_at || new Date().toISOString(),
                })),
                returning: "representation",
            }),
            invalidatesTags: (result, error, events) => {
                const matchIds = [...new Set(events.map((e) => e.match_id))];
                return [
                    ...matchIds.map((matchId) => ({
                        type: "MatchEvent" as const,
                        id: matchId,
                    })),
                    ...matchIds.map((matchId) => ({
                        type: "Match" as const,
                        id: matchId,
                    })),
                    "MatchEvent",
                ];
            },
            transformResponse: (response: any) => response.data,
        }),

        // Get event statistics for a match
        getMatchEventStats: builder.query<
            {
                total_events: number;
                goals_home: number;
                goals_away: number;
                fouls_home: number;
                fouls_away: number;
                events_by_chukker: Record<number, number>;
                events_by_type: Record<EventType, number>;
            },
            string
        >({
            query: (matchId) => ({
                method: "rpc",
                rpcName: "get_match_event_stats",
                rpcParams: { match_id: matchId },
            }),
            providesTags: (result, error, matchId) => [
                { type: "MatchEvent", id: `${matchId}-stats` },
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Undo last event (for live scorekeeping)
        undoLastEvent: builder.mutation<void, string>({
            query: (matchId) => ({
                method: "rpc",
                rpcName: "undo_last_match_event",
                rpcParams: { match_id: matchId },
            }),
            invalidatesTags: (result, error, matchId) => [
                { type: "MatchEvent", id: matchId },
                { type: "Match", id: matchId },
                "MatchEvent",
            ],
        }),
    }),
});

export const {
    useGetMatchEventsQuery,
    useGetMatchEventsByChukkerQuery,
    useGetMatchEventsByTypeQuery,
    useGetGoalEventsQuery,
    useGetLatestMatchEventsQuery,
    useCreateMatchEventMutation,
    useUpdateMatchEventMutation,
    useDeleteMatchEventMutation,
    useBulkCreateMatchEventsMutation,
    useGetMatchEventStatsQuery,
    useUndoLastEventMutation,
} = matchEventsApi;
