/**
 * Tournaments API Slice
 * RTK Query endpoints for tournament-related operations
 */

import { api } from "../index";
import type {
    CreateTournamentData,
    Tournament,
    TournamentWithDetails,
    UpdateTournamentData,
} from "../../types/database";

export const tournamentsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all tournaments
        getTournaments: builder.query<Tournament[], void>({
            query: () => ({
                method: "select",
                table: "tournaments",
                query: (builder) =>
                    builder.order("start_date", { ascending: false }),
            }),
            providesTags: ["Tournament"],
            transformResponse: (response: any) => response.data,
        }),

        // Get tournament by ID with details
        getTournamentById: builder.query<TournamentWithDetails, string>({
            query: (id) => ({
                method: "select",
                table: "tournaments",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            matches(*,
                                home_team:teams!matches_home_team_id_fkey(*),
                                away_team:teams!matches_away_team_id_fkey(*)
                            )
                        `)
                        .eq("id", id)
                        .single(),
            }),
            providesTags: (result, error, id) => [{ type: "Tournament", id }],
            transformResponse: (response: any) => response.data,
        }),

        // Get current tournaments (ongoing)
        getCurrentTournaments: builder.query<Tournament[], void>({
            query: () => {
                const today = new Date().toISOString().split("T")[0];
                return {
                    method: "select",
                    table: "tournaments",
                    query: (builder) =>
                        builder
                            .lte("start_date", today)
                            .gte("end_date", today)
                            .order("start_date", { ascending: true }),
                };
            },
            providesTags: [{ type: "Tournament", id: "current" }, "Tournament"],
            transformResponse: (response: any) => response.data,
        }),

        // Get upcoming tournaments
        getUpcomingTournaments: builder.query<Tournament[], void>({
            query: () => {
                const today = new Date().toISOString().split("T")[0];
                return {
                    method: "select",
                    table: "tournaments",
                    query: (builder) =>
                        builder
                            .gt("start_date", today)
                            .order("start_date", { ascending: true }),
                };
            },
            providesTags: [
                { type: "Tournament", id: "upcoming" },
                "Tournament",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get tournaments by year
        getTournamentsByYear: builder.query<Tournament[], number>({
            query: (year) => ({
                method: "select",
                table: "tournaments",
                query: (builder) => {
                    const startOfYear = `${year}-01-01`;
                    const endOfYear = `${year}-12-31`;
                    return builder
                        .gte("start_date", startOfYear)
                        .lte("start_date", endOfYear)
                        .order("start_date", { ascending: false });
                },
            }),
            providesTags: (result, error, year) => [
                { type: "Tournament", id: `year-${year}` },
                "Tournament",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Search tournaments by name
        searchTournaments: builder.query<Tournament[], string>({
            query: (searchTerm) => ({
                method: "select",
                table: "tournaments",
                query: (builder) =>
                    builder
                        .ilike("name", `%${searchTerm}%`)
                        .order("start_date", { ascending: false }),
            }),
            providesTags: (result, error, searchTerm) => [
                { type: "Tournament", id: `search-${searchTerm}` },
                "Tournament",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get tournaments by location
        getTournamentsByLocation: builder.query<Tournament[], string>({
            query: (location) => ({
                method: "select",
                table: "tournaments",
                query: (builder) =>
                    builder
                        .ilike("location", `%${location}%`)
                        .order("start_date", { ascending: false }),
            }),
            providesTags: (result, error, location) => [
                { type: "Tournament", id: `location-${location}` },
                "Tournament",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Create new tournament
        createTournament: builder.mutation<Tournament, CreateTournamentData>({
            query: (tournamentData) => ({
                method: "insert",
                table: "tournaments",
                data: tournamentData,
                returning: "representation",
            }),
            invalidatesTags: ["Tournament"],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update tournament
        updateTournament: builder.mutation<
            Tournament,
            { id: string; updates: UpdateTournamentData }
        >({
            query: ({ id, updates }) => ({
                method: "update",
                table: "tournaments",
                data: updates,
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Tournament", id },
                "Tournament",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Delete tournament
        deleteTournament: builder.mutation<void, string>({
            query: (id) => ({
                method: "delete",
                table: "tournaments",
                query: (builder) => builder.eq("id", id),
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Tournament", id },
                "Tournament",
            ],
        }),

        // Get tournament standings
        getTournamentStandings: builder.query<
            Array<{
                team_id: string;
                team_name: string;
                matches_played: number;
                wins: number;
                losses: number;
                draws: number;
                goals_for: number;
                goals_against: number;
                goal_difference: number;
                points: number;
            }>,
            string
        >({
            query: (tournamentId) => ({
                method: "rpc",
                rpcName: "get_tournament_standings",
                rpcParams: { tournament_id: tournamentId },
            }),
            providesTags: (result, error, tournamentId) => [
                { type: "Tournament", id: `standings-${tournamentId}` },
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get tournament statistics
        getTournamentStats: builder.query<
            {
                total_matches: number;
                completed_matches: number;
                total_goals: number;
                average_goals_per_match: number;
                participating_teams: number;
                total_players: number;
                duration_days: number;
            },
            string
        >({
            query: (tournamentId) => ({
                method: "rpc",
                rpcName: "get_tournament_stats",
                rpcParams: { tournament_id: tournamentId },
            }),
            providesTags: (result, error, tournamentId) => [
                { type: "Tournament", id: `stats-${tournamentId}` },
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get tournament matches by round/stage
        getTournamentMatchesByRound: builder.query<
            Array<any>,
            { tournamentId: string; round?: string; stage?: string }
        >({
            query: ({ tournamentId, round, stage }) => ({
                method: "select",
                table: "matches",
                query: (builder) => {
                    let query = builder
                        .select(`
                            *,
                            home_team:teams!matches_home_team_id_fkey(*),
                            away_team:teams!matches_away_team_id_fkey(*),
                            field:fields(*)
                        `)
                        .eq("tournament_id", tournamentId);

                    if (round) {
                        query = query.eq("details->>round", round);
                    }
                    if (stage) {
                        query = query.eq("details->>stage", stage);
                    }

                    return query.order("scheduled_time", { ascending: true });
                },
            }),
            providesTags: (result, error, { tournamentId, round, stage }) => [
                {
                    type: "Tournament",
                    id: `matches-${tournamentId}-${round || "all"}-${
                        stage || "all"
                    }`,
                },
                "Match",
            ],
            transformResponse: (response: any) => response.data,
        }),
    }),
});

export const {
    useGetTournamentsQuery,
    useGetTournamentByIdQuery,
    useGetCurrentTournamentsQuery,
    useGetUpcomingTournamentsQuery,
    useGetTournamentsByYearQuery,
    useSearchTournamentsQuery,
    useGetTournamentsByLocationQuery,
    useCreateTournamentMutation,
    useUpdateTournamentMutation,
    useDeleteTournamentMutation,
    useGetTournamentStandingsQuery,
    useGetTournamentStatsQuery,
    useGetTournamentMatchesByRoundQuery,
} = tournamentsApi;
