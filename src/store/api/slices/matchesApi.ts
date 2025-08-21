/**
 * Matches API Slice
 * RTK Query endpoints for match-related operations
 */

import { api } from "../index";
import type {
    CreateMatchData,
    Match,
    MatchStatus,
    MatchWithDetails,
    UpdateMatchData,
} from "../../types/database";

export const matchesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all matches
        getMatches: builder.query<Match[], void>({
            query: () => ({
                method: "select",
                table: "matches",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            home_team:teams!matches_home_team_id_fkey(*),
                            away_team:teams!matches_away_team_id_fkey(*),
                            field:fields(*),
                            tournament:tournaments(*)
                        `)
                        .order("scheduled_time", { ascending: false }),
            }),
            providesTags: ["Match"],
            transformResponse: (response: any) => response.data,
        }),

        // Get matches by status
        getMatchesByStatus: builder.query<Match[], MatchStatus>({
            query: (status) => ({
                method: "select",
                table: "matches",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            home_team:teams!matches_home_team_id_fkey(*),
                            away_team:teams!matches_away_team_id_fkey(*),
                            field:fields(*),
                            tournament:tournaments(*)
                        `)
                        .eq("status", status)
                        .order("scheduled_time", { ascending: true }),
            }),
            providesTags: (result, error, status) => [
                { type: "Match", id: `status-${status}` },
                "Match",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get live matches
        getLiveMatches: builder.query<Match[], void>({
            query: () => ({
                method: "select",
                table: "matches",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            home_team:teams!matches_home_team_id_fkey(*),
                            away_team:teams!matches_away_team_id_fkey(*),
                            field:fields(*),
                            tournament:tournaments(*)
                        `)
                        .eq("status", "live")
                        .order("scheduled_time", { ascending: true }),
            }),
            providesTags: [{ type: "Match", id: "live" }, "Match"],
            transformResponse: (response: any) => response.data,
        }),

        // Get match by ID with full details
        getMatchById: builder.query<MatchWithDetails, string>({
            query: (id) => ({
                method: "select",
                table: "matches",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            home_team:teams!matches_home_team_id_fkey(*),
                            away_team:teams!matches_away_team_id_fkey(*),
                            field:fields(*),
                            tournament:tournaments(*),
                            match_lineups(*,
                                player:players(*),
                                team:teams(*)
                            ),
                            match_events(*,
                                team:teams(*),
                                player:players(*)
                            )
                        `)
                        .eq("id", id)
                        .single(),
            }),
            providesTags: (result, error, id) => [{ type: "Match", id }],
            transformResponse: (response: any) => response.data,
        }),

        // Get matches for a specific team
        getMatchesForTeam: builder.query<Match[], string>({
            query: (teamId) => ({
                method: "select",
                table: "matches",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            home_team:teams!matches_home_team_id_fkey(*),
                            away_team:teams!matches_away_team_id_fkey(*),
                            field:fields(*),
                            tournament:tournaments(*)
                        `)
                        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
                        .order("scheduled_time", { ascending: false }),
            }),
            providesTags: (result, error, teamId) => [
                { type: "Match", id: `team-${teamId}` },
                "Match",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get upcoming matches (next 7 days)
        getUpcomingMatches: builder.query<Match[], void>({
            query: () => {
                const today = new Date().toISOString().split("T")[0];
                const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0];

                return {
                    method: "select",
                    table: "matches",
                    query: (builder) =>
                        builder
                            .select(`
                                *,
                                home_team:teams!matches_home_team_id_fkey(*),
                                away_team:teams!matches_away_team_id_fkey(*),
                                field:fields(*),
                                tournament:tournaments(*)
                            `)
                            .gte("scheduled_time", today)
                            .lte("scheduled_time", nextWeek)
                            .eq("status", "scheduled")
                            .order("scheduled_time", { ascending: true }),
                };
            },
            providesTags: [{ type: "Match", id: "upcoming" }, "Match"],
            transformResponse: (response: any) => response.data,
        }),

        // Create new match
        createMatch: builder.mutation<Match, CreateMatchData>({
            query: (matchData) => ({
                method: "insert",
                table: "matches",
                data: matchData,
                returning: "representation",
            }),
            invalidatesTags: ["Match"],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Create match lineups (bulk insert)
        createMatchLineups: builder.mutation<
            void,
            {
                rows: Array<{
                    match_id: string;
                    team_id: string;
                    player_id: string;
                    position?: number;
                    starter?: boolean;
                }>;
            }
        >({
            query: ({ rows }) => ({
                method: "insert",
                table: "match_lineups",
                data: rows,
                returning: "minimal",
            }),
            invalidatesTags: (result, error, { rows }) => [
                ...(rows?.length
                    ? ([{ type: "Match", id: rows[0].match_id }] as const)
                    : ([] as const)),
                "Match",
            ],
        }),

        // Delete match lineups for a match
        deleteMatchLineups: builder.mutation<void, string>({
            query: (matchId) => ({
                method: "delete",
                table: "match_lineups",
                query: (builder) => builder.eq("match_id", matchId),
            }),
            invalidatesTags: (result, error, matchId) => [
                { type: "Match", id: matchId },
            ],
        }),

        // Update match
        updateMatch: builder.mutation<
            Match,
            { id: string; updates: UpdateMatchData }
        >({
            query: ({ id, updates }) => ({
                method: "update",
                table: "matches",
                data: updates,
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Match", id },
                "Match",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Delete match
        deleteMatch: builder.mutation<void, string>({
            query: (id) => ({
                method: "delete",
                table: "matches",
                query: (builder) => builder.eq("id", id),
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Match", id },
                "Match",
            ],
        }),

        // Update match score (optimistic update)
        updateMatchScore: builder.mutation<
            Match,
            { id: string; homeScore: number; awayScore: number }
        >({
            query: ({ id, homeScore, awayScore }) => ({
                method: "update",
                table: "matches",
                data: {
                    home_score: homeScore,
                    away_score: awayScore,
                    updated_at: new Date().toISOString(),
                },
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            // Optimistic update
            async onQueryStarted(
                { id, homeScore, awayScore },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    matchesApi.util.updateQueryData(
                        "getMatchById",
                        id,
                        (draft) => {
                            if (draft) {
                                draft.home_score = homeScore;
                                draft.away_score = awayScore;
                            }
                        },
                    ),
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: "Match", id },
                { type: "Match", id: "live" },
                "Match",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update match status
        updateMatchStatus: builder.mutation<
            Match,
            { id: string; status: MatchStatus; currentChukker?: number }
        >({
            query: ({ id, status, currentChukker }) => ({
                method: "update",
                table: "matches",
                data: {
                    status,
                    ...(currentChukker !== undefined &&
                        { current_chukker: currentChukker }),
                    updated_at: new Date().toISOString(),
                },
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            // Optimistic update
            async onQueryStarted(
                { id, status, currentChukker },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    matchesApi.util.updateQueryData(
                        "getMatchById",
                        id,
                        (draft) => {
                            if (draft) {
                                draft.status = status;
                                if (currentChukker !== undefined) {
                                    draft.current_chukker = currentChukker;
                                }
                            }
                        },
                    ),
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: "Match", id },
                { type: "Match", id: "live" },
                { type: "Match", id: "upcoming" },
                "Match",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),
    }),
});

export const {
    useGetMatchesQuery,
    useGetMatchesByStatusQuery,
    useGetLiveMatchesQuery,
    useGetMatchByIdQuery,
    useGetMatchesForTeamQuery,
    useGetUpcomingMatchesQuery,
    useCreateMatchMutation,
    useCreateMatchLineupsMutation,
    useDeleteMatchLineupsMutation,
    useUpdateMatchMutation,
    useDeleteMatchMutation,
    useUpdateMatchScoreMutation,
    useUpdateMatchStatusMutation,
} = matchesApi;
