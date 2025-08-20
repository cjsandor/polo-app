/**
 * Teams API Slice
 * RTK Query endpoints for team-related operations
 */

import { api } from "../index";
import type {
    CreateTeamData,
    Team,
    TeamWithDetails,
    UpdateTeamData,
} from "../../types/database";

export const teamsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all teams
        getTeams: builder.query<Team[], void>({
            query: () => ({
                method: "select",
                table: "teams",
                query: (builder) =>
                    builder
                        .select("*, home_field:fields(*), players!players_team_id_fkey(*)")
                        .order("name", { ascending: true }),
            }),
            providesTags: ["Team"],
            transformResponse: (response: any) => response.data,
        }),

        // Get team by ID with details
        getTeamById: builder.query<TeamWithDetails, string>({
            query: (id) => ({
                method: "select",
                table: "teams",
                query: (builder) =>
                    builder
                        .select("*, home_field:fields(*), players!players_team_id_fkey(*)")
                        .eq("id", id)
                        .single(),
            }),
            providesTags: (result, error, id) => [{ type: "Team", id }],
            transformResponse: (response: any) => response.data,
        }),

        // Search teams by name
        searchTeams: builder.query<Team[], string>({
            query: (searchTerm) => ({
                method: "select",
                table: "teams",
                query: (builder) =>
                    builder
                        .select("*, home_field:fields(*), players!players_team_id_fkey(*)")
                        .ilike("name", `%${searchTerm}%`)
                        .order("name", { ascending: true }),
            }),
            providesTags: (result, error, searchTerm) => [
                { type: "Team", id: `search-${searchTerm}` },
                "Team",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get teams with player count
        getTeamsWithPlayerCount: builder.query<
            (Team & { player_count: number })[],
            void
        >({
            query: () => ({
                method: "select",
                table: "teams",
                query: (builder) =>
                    builder
                        .select("*, home_field:fields(*), players!players_team_id_fkey(count)")
                        .order("name", { ascending: true }),
            }),
            providesTags: ["Team", "Player"],
            transformResponse: (response: any) => response.data,
        }),

        // Get followed teams for a user
        getFollowedTeams: builder.query<Team[], string>({
            query: (userId) => ({
                method: "select",
                table: "follows",
                query: (builder) =>
                    builder
                        .select(
                            "team:teams(*, home_field:fields(*), players!players_team_id_fkey(*))",
                        )
                        .eq("user_id", userId),
            }),
            providesTags: (result, error, userId) => [
                { type: "Follow", id: userId },
                "Team",
            ],
            transformResponse: (response: any) =>
                response.data?.map((item: any) => item.team) || [],
        }),

        // Create new team
        createTeam: builder.mutation<Team, CreateTeamData>({
            query: (teamData) => ({
                method: "insert",
                table: "teams",
                data: teamData,
                returning: "representation",
            }),
            invalidatesTags: ["Team"],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update team
        updateTeam: builder.mutation<
            Team,
            { id: string; updates: UpdateTeamData }
        >({
            query: ({ id, updates }) => ({
                method: "update",
                table: "teams",
                data: updates,
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Team", id },
                "Team",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Delete team
        deleteTeam: builder.mutation<void, string>({
            query: (id) => ({
                method: "delete",
                table: "teams",
                query: (builder) => builder.eq("id", id),
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Team", id },
                "Team",
            ],
        }),

        // Follow team
        followTeam: builder.mutation<void, { userId: string; teamId: string }>({
            query: ({ userId, teamId }) => ({
                method: "insert",
                table: "follows",
                data: {
                    user_id: userId,
                    team_id: teamId,
                },
            }),
            invalidatesTags: (result, error, { userId, teamId }) => [
                { type: "Follow", id: userId },
                { type: "Team", id: teamId },
            ],
        }),

        // Unfollow team
        unfollowTeam: builder.mutation<
            void,
            { userId: string; teamId: string }
        >({
            query: ({ userId, teamId }) => ({
                method: "delete",
                table: "follows",
                query: (builder) =>
                    builder.eq("user_id", userId).eq("team_id", teamId),
            }),
            invalidatesTags: (result, error, { userId, teamId }) => [
                { type: "Follow", id: userId },
                { type: "Team", id: teamId },
            ],
        }),

        // Get team statistics
        getTeamStats: builder.query<
            {
                total_matches: number;
                wins: number;
                losses: number;
                draws: number;
                goals_for: number;
                goals_against: number;
            },
            string
        >({
            query: (teamId) => ({
                method: "rpc",
                rpcName: "get_team_stats",
                rpcParams: { team_id: teamId },
            }),
            providesTags: (result, error, teamId) => [
                { type: "Team", id: `stats-${teamId}` },
            ],
            transformResponse: (response: any) => response.data,
        }),
    }),
});

export const {
    useGetTeamsQuery,
    useGetTeamByIdQuery,
    useSearchTeamsQuery,
    useGetTeamsWithPlayerCountQuery,
    useGetFollowedTeamsQuery,
    useCreateTeamMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
    useFollowTeamMutation,
    useUnfollowTeamMutation,
    useGetTeamStatsQuery,
} = teamsApi;
