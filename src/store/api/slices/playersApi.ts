/**
 * Players API Slice
 * RTK Query endpoints for player-related operations
 */

import { api } from "../index";
import type {
    CreatePlayerData,
    Player,
    PlayerWithDetails,
    UpdatePlayerData,
} from "../../types/database";

export const playersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all players
        getPlayers: builder.query<Player[], void>({
            query: () => ({
                method: "select",
                table: "players",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams!players_team_id_fkey(*)
                        `)
                        .order("name", { ascending: true }),
            }),
            providesTags: ["Player"],
            transformResponse: (response: any) => response.data,
        }),

        // Get player by ID with details
        getPlayerById: builder.query<PlayerWithDetails, string>({
            query: (id) => ({
                method: "select",
                table: "players",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams!players_team_id_fkey(*)
                        `)
                        .eq("id", id)
                        .single(),
            }),
            providesTags: (result, error, id) => [{ type: "Player", id }],
            transformResponse: (response: any) => response.data,
        }),

        // Get players by team
        getPlayersByTeam: builder.query<Player[], string>({
            query: (teamId) => ({
                method: "select",
                table: "players",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams!players_team_id_fkey(*)
                        `)
                        .eq("team_id", teamId)
                        .order("position", { ascending: true, nullsLast: true })
                        .order("name", { ascending: true }),
            }),
            providesTags: (result, error, teamId) => [
                { type: "Player", id: `team-${teamId}` },
                "Player",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Search players by name
        searchPlayers: builder.query<Player[], string>({
            query: (searchTerm) => ({
                method: "select",
                table: "players",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams!players_team_id_fkey(*)
                        `)
                        .ilike("name", `%${searchTerm}%`)
                        .order("name", { ascending: true }),
            }),
            providesTags: (result, error, searchTerm) => [
                { type: "Player", id: `search-${searchTerm}` },
                "Player",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get players by position
        getPlayersByPosition: builder.query<Player[], number>({
            query: (position) => ({
                method: "select",
                table: "players",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams!players_team_id_fkey(*)
                        `)
                        .eq("position", position)
                        .order("handicap", {
                            ascending: false,
                            nullsLast: true,
                        })
                        .order("name", { ascending: true }),
            }),
            providesTags: (result, error, position) => [
                { type: "Player", id: `position-${position}` },
                "Player",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get players by handicap range
        getPlayersByHandicap: builder.query<
            Player[],
            { min: number; max: number }
        >({
            query: ({ min, max }) => ({
                method: "select",
                table: "players",
                query: (builder) =>
                    builder
                        .select(`
                            *,
                            team:teams!players_team_id_fkey(*)
                        `)
                        .gte("handicap", min)
                        .lte("handicap", max)
                        .order("handicap", { ascending: false })
                        .order("name", { ascending: true }),
            }),
            providesTags: (result, error, { min, max }) => [
                { type: "Player", id: `handicap-${min}-${max}` },
                "Player",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get available players (no team assigned)
        getAvailablePlayers: builder.query<Player[], void>({
            query: () => ({
                method: "select",
                table: "players",
                query: (builder) =>
                    builder
                        .select("*")
                        .is("team_id", null)
                        .order("name", { ascending: true }),
            }),
            providesTags: [{ type: "Player", id: "available" }, "Player"],
            transformResponse: (response: any) => response.data,
        }),

        // Get followed players for a user
        getFollowedPlayers: builder.query<Player[], string>({
            query: (userId) => ({
                method: "select",
                table: "follows",
                query: (builder) =>
                    builder
                        .select(`
                            player:players(
                                *,
                                team:teams(*)
                            )
                        `)
                        .eq("user_id", userId),
            }),
            providesTags: (result, error, userId) => [
                { type: "Follow", id: `players-${userId}` },
                "Player",
            ],
            transformResponse: (response: any) =>
                response.data?.map((item: any) => item.player) || [],
        }),

        // Create new player
        createPlayer: builder.mutation<Player, CreatePlayerData>({
            query: (playerData) => ({
                method: "insert",
                table: "players",
                data: playerData,
                returning: "representation",
            }),
            invalidatesTags: ["Player"],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update player
        updatePlayer: builder.mutation<
            Player,
            { id: string; updates: UpdatePlayerData }
        >({
            query: ({ id, updates }) => ({
                method: "update",
                table: "players",
                data: updates,
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id, updates }) => [
                { type: "Player", id },
                // Invalidate team-specific cache if team changed
                ...(updates.team_id
                    ? [
                        {
                            type: "Player",
                            id: `team-${updates.team_id}`,
                        } as const,
                    ]
                    : []),
                "Player",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Delete player
        deletePlayer: builder.mutation<void, string>({
            query: (id) => ({
                method: "delete",
                table: "players",
                query: (builder) => builder.eq("id", id),
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Player", id },
                "Player",
            ],
        }),

        // Transfer player to different team
        transferPlayer: builder.mutation<
            Player,
            { id: string; newTeamId: string | null }
        >({
            query: ({ id, newTeamId }) => ({
                method: "update",
                table: "players",
                data: { team_id: newTeamId },
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id, newTeamId }) => [
                { type: "Player", id },
                { type: "Player", id: "available" },
                ...(newTeamId
                    ? [{ type: "Player", id: `team-${newTeamId}` } as const]
                    : []),
                "Player",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update player handicap
        updatePlayerHandicap: builder.mutation<
            Player,
            { id: string; handicap: number }
        >({
            query: ({ id, handicap }) => ({
                method: "update",
                table: "players",
                data: { handicap },
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            // Optimistic update
            async onQueryStarted(
                { id, handicap },
                { dispatch, queryFulfilled },
            ) {
                const patchResult = dispatch(
                    playersApi.util.updateQueryData(
                        "getPlayerById",
                        id,
                        (draft) => {
                            if (draft) {
                                draft.handicap = handicap;
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
                { type: "Player", id },
                "Player",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Get player statistics
        getPlayerStats: builder.query<
            {
                total_matches: number;
                goals: number;
                assists: number;
                average_handicap: number;
                wins: number;
                losses: number;
            },
            string
        >({
            query: (playerId) => ({
                method: "rpc",
                rpcName: "get_player_stats",
                rpcParams: { player_id: playerId },
            }),
            providesTags: (result, error, playerId) => [
                { type: "Player", id: `stats-${playerId}` },
            ],
            transformResponse: (response: any) => response.data?.[0] || {
                total_matches: 0,
                goals: 0,
                assists: 0,
                average_handicap: 0,
                wins: 0,
                losses: 0,
            },
        }),

        // Get player recent matches
        getPlayerRecentMatches: builder.query<
            Array<{
                match_id: string;
                tournament_name: string | null;
                scheduled_time: string;
                status: string;
                home_team_id: string;
                home_team_name: string;
                away_team_id: string;
                away_team_name: string;
                home_score: number;
                away_score: number;
                player_team_id: string;
                player_goals: number;
                field_name: string | null;
                is_winner: boolean;
            }>,
            { playerId: string; limit?: number }
        >({
            query: ({ playerId, limit = 5 }) => ({
                method: "rpc",
                rpcName: "get_player_recent_matches",
                rpcParams: { p_player_id: playerId, p_limit: limit },
            }),
            providesTags: (result, error, { playerId }) => [
                { type: "Player", id: `recent-${playerId}` },
            ],
            transformResponse: (response: any) => response.data || [],
        }),
    }),
});

export const {
    useGetPlayersQuery,
    useGetPlayerByIdQuery,
    useGetPlayersByTeamQuery,
    useSearchPlayersQuery,
    useGetPlayersByPositionQuery,
    useGetPlayersByHandicapQuery,
    useGetAvailablePlayersQuery,
    useGetFollowedPlayersQuery,
    useCreatePlayerMutation,
    useUpdatePlayerMutation,
    useDeletePlayerMutation,
    useTransferPlayerMutation,
    useUpdatePlayerHandicapMutation,
    useGetPlayerStatsQuery,
    useGetPlayerRecentMatchesQuery,
} = playersApi;
