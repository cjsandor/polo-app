/**
 * Profiles API Slice
 * RTK Query endpoints for user profile operations
 */

import { api } from "../index";
import type { Profile, UserRole } from "../../types/database";

export const profilesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get current user profile
        getCurrentProfile: builder.query<Profile, void>({
            query: () => ({
                method: "rpc",
                rpcName: "get_current_user_profile",
            }),
            providesTags: ["Profile"],
            transformResponse: (response: any) => response.data,
        }),

        // Get profile by ID
        getProfileById: builder.query<Profile, string>({
            query: (id) => ({
                method: "select",
                table: "profiles",
                query: (builder) => builder.eq("id", id).single(),
            }),
            providesTags: (result, error, id) => [{ type: "Profile", id }],
            transformResponse: (response: any) => response.data,
        }),

        // Get all profiles (admin only)
        getAllProfiles: builder.query<Profile[], void>({
            query: () => ({
                method: "select",
                table: "profiles",
                query: (builder) =>
                    builder.order("created_at", { ascending: false }),
            }),
            providesTags: ["Profile"],
            transformResponse: (response: any) => response.data,
        }),

        // Search profiles by name
        searchProfiles: builder.query<Profile[], string>({
            query: (searchTerm) => ({
                method: "select",
                table: "profiles",
                query: (builder) =>
                    builder
                        .ilike("full_name", `%${searchTerm}%`)
                        .order("full_name", { ascending: true }),
            }),
            providesTags: (result, error, searchTerm) => [
                { type: "Profile", id: `search-${searchTerm}` },
                "Profile",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get profiles by role
        getProfilesByRole: builder.query<Profile[], UserRole>({
            query: (role) => ({
                method: "select",
                table: "profiles",
                query: (builder) =>
                    builder
                        .eq("role", role)
                        .order("full_name", { ascending: true }),
            }),
            providesTags: (result, error, role) => [
                { type: "Profile", id: `role-${role}` },
                "Profile",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Update current user profile
        updateCurrentProfile: builder.mutation<
            Profile,
            Partial<Pick<Profile, "full_name" | "avatar_url">>
        >({
            query: (updates) => ({
                method: "rpc",
                rpcName: "update_current_user_profile",
                rpcParams: updates,
            }),
            invalidatesTags: ["Profile"],
            transformResponse: (response: any) => response.data,
        }),

        // Update profile (admin only)
        updateProfile: builder.mutation<
            Profile,
            { id: string; updates: Partial<Profile> }
        >({
            query: ({ id, updates }) => ({
                method: "update",
                table: "profiles",
                data: updates,
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Profile", id },
                "Profile",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update user role (admin only)
        updateUserRole: builder.mutation<
            Profile,
            { id: string; role: UserRole }
        >({
            query: ({ id, role }) => ({
                method: "update",
                table: "profiles",
                data: { role },
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Profile", id },
                "Profile",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Delete profile (admin only)
        deleteProfile: builder.mutation<void, string>({
            query: (id) => ({
                method: "delete",
                table: "profiles",
                query: (builder) => builder.eq("id", id),
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Profile", id },
                "Profile",
            ],
        }),

        // Get user's followed teams
        getUserFollows: builder.query<
            Array<{
                team_id: string;
                team_name: string;
                followed_at: string;
            }>,
            string
        >({
            query: (userId) => ({
                method: "select",
                table: "follows",
                query: (builder) =>
                    builder
                        .select(`
                            team_id,
                            created_at,
                            team:teams(name)
                        `)
                        .eq("user_id", userId)
                        .order("created_at", { ascending: false }),
            }),
            providesTags: (result, error, userId) => [
                { type: "Follow", id: userId },
            ],
            transformResponse: (response: any) =>
                response.data?.map((item: any) => ({
                    team_id: item.team_id,
                    team_name: item.team?.name,
                    followed_at: item.created_at,
                })) || [],
        }),

        // Get user's push token
        getUserPushToken: builder.query<
            { expo_token: string; platform?: string } | null,
            string
        >({
            query: (userId) => ({
                method: "select",
                table: "push_tokens",
                query: (builder) => builder.eq("user_id", userId).single(),
            }),
            providesTags: (result, error, userId) => [
                { type: "PushToken", id: userId },
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Update user's push token
        updatePushToken: builder.mutation<
            void,
            { userId: string; expoToken: string; platform?: string }
        >({
            query: ({ userId, expoToken, platform }) => ({
                method: "upsert",
                table: "push_tokens",
                data: {
                    user_id: userId,
                    expo_token: expoToken,
                    platform,
                },
                returning: "minimal",
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: "PushToken", id: userId },
            ],
        }),

        // Delete user's push token
        deletePushToken: builder.mutation<void, string>({
            query: (userId) => ({
                method: "delete",
                table: "push_tokens",
                query: (builder) => builder.eq("user_id", userId),
            }),
            invalidatesTags: (result, error, userId) => [
                { type: "PushToken", id: userId },
            ],
        }),

        // Get user activity stats
        getUserStats: builder.query<
            {
                matches_followed: number;
                teams_followed: number;
                account_created: string;
                last_activity: string;
                favorite_teams: Array<{
                    team_name: string;
                    matches_watched: number;
                }>;
            },
            string
        >({
            query: (userId) => ({
                method: "rpc",
                rpcName: "get_user_stats",
                rpcParams: { user_id: userId },
            }),
            providesTags: (result, error, userId) => [
                { type: "Profile", id: `stats-${userId}` },
            ],
            transformResponse: (response: any) => response.data,
        }),
    }),
});

export const {
    useGetCurrentProfileQuery,
    useGetProfileByIdQuery,
    useGetAllProfilesQuery,
    useSearchProfilesQuery,
    useGetProfilesByRoleQuery,
    useUpdateCurrentProfileMutation,
    useUpdateProfileMutation,
    useUpdateUserRoleMutation,
    useDeleteProfileMutation,
    useGetUserFollowsQuery,
    useGetUserPushTokenQuery,
    useUpdatePushTokenMutation,
    useDeletePushTokenMutation,
    useGetUserStatsQuery,
} = profilesApi;
