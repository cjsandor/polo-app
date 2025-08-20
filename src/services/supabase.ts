/**
 * Supabase Client Configuration
 * Centralized Supabase client with auth persistence and typed interfaces
 */

import { createClient } from "@supabase/supabase-js";
import { storageAdapter } from "../utils/storageAdapter";
import { config } from "../config/env";
import type { Database } from "../types/database";

// Create typed Supabase client with AsyncStorage persistence
export const supabase = createClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
        auth: {
            storage: storageAdapter,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
        global: {
            headers: {
                "x-application-name": config.appName,
            },
        },
    },
);

// Auth helper functions
export const auth = {
    /**
     * Get current user session
     */
    getSession: async () => {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();
        return { session, error };
    },

    /**
     * Get current user
     */
    getUser: async () => {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();
        return { user, error };
    },

    /**
     * Sign in with email and password
     */
    signIn: async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    },

    /**
     * Sign up with email and password
     */
    signUp: async (email: string, password: string, metadata?: any) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
    },

    /**
     * Sign out current user
     */
    signOut: async () => {
        return await supabase.auth.signOut();
    },

    /**
     * Reset password
     */
    resetPassword: async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "polotracker://reset-password",
        });
    },

    /**
     * Update password
     */
    updatePassword: async (password: string) => {
        return await supabase.auth.updateUser({
            password,
        });
    },

    /**
     * Update user metadata
     */
    updateUser: async (updates: any) => {
        return await supabase.auth.updateUser(updates);
    },
};

// Database helper functions
export const db = {
    // Profiles
    profiles: {
        get: (userId: string) =>
            supabase.from("profiles").select("*").eq("id", userId).single(),

        upsert: (profile: any) => supabase.from("profiles").upsert(profile),

        update: (userId: string, updates: any) =>
            supabase.from("profiles").update(updates).eq("id", userId),
    },

    // Teams
    teams: {
        list: () => supabase.from("teams").select("*").order("name"),

        getById: (id: string) =>
            supabase
                .from("teams")
                .select(
                    `
          *,
          home_field:fields(*),
          players(*)
        `,
                )
                .eq("id", id)
                .single(),

        search: (query: string) =>
            supabase
                .from("teams")
                .select("*")
                .ilike("name", `%${query}%`)
                .order("name"),

        create: (team: any) => supabase.from("teams").insert(team),

        update: (id: string, updates: any) =>
            supabase.from("teams").update(updates).eq("id", id),

        delete: (id: string) => supabase.from("teams").delete().eq("id", id),
    },

    // Players
    players: {
        list: () =>
            supabase
                .from("players")
                .select(
                    `
          *,
          team:teams!players_team_id_fkey(*)
        `,
                )
                .order("name"),

        getById: (id: string) =>
            supabase
                .from("players")
                .select(
                    `
          *,
          team:teams!players_team_id_fkey(*)
        `,
                )
                .eq("id", id)
                .single(),

        getByTeam: (teamId: string) =>
            supabase
                .from("players")
                .select("*")
                .eq("team_id", teamId)
                .order("position", { nullsLast: true }),

        search: (query: string) =>
            supabase
                .from("players")
                .select(
                    `
          *,
          team:teams(*)
        `,
                )
                .ilike("name", `%${query}%`)
                .order("name"),

        create: (player: any) => supabase.from("players").insert(player),

        update: (id: string, updates: any) =>
            supabase.from("players").update(updates).eq("id", id),

        delete: (id: string) => supabase.from("players").delete().eq("id", id),
    },

    // Matches
    matches: {
        list: () =>
            supabase
                .from("matches")
                .select(
                    `
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          field:fields(*),
          tournament:tournaments(*)
        `,
                )
                .order("scheduled_time", { ascending: false }),

        getById: (id: string) =>
            supabase
                .from("matches")
                .select(
                    `
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
        `,
                )
                .eq("id", id)
                .single(),

        getByStatus: (status: string) =>
            supabase
                .from("matches")
                .select(
                    `
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          field:fields(*),
          tournament:tournaments(*)
        `,
                )
                .eq("status", status)
                .order("scheduled_time"),

        getLive: () =>
            supabase
                .from("matches")
                .select(
                    `
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          field:fields(*),
          tournament:tournaments(*)
        `,
                )
                .eq("status", "live")
                .order("scheduled_time"),

        create: (match: any) => supabase.from("matches").insert(match),

        update: (id: string, updates: any) =>
            supabase.from("matches").update(updates).eq("id", id),

        delete: (id: string) => supabase.from("matches").delete().eq("id", id),
    },

    // Match Events
    matchEvents: {
        getByMatch: (matchId: string) =>
            supabase
                .from("match_events")
                .select(
                    `
          *,
          team:teams(*),
          player:players(*)
        `,
                )
                .eq("match_id", matchId)
                .order("sequence"),

        create: (event: any) => supabase.from("match_events").insert(event),

        update: (id: string, updates: any) =>
            supabase.from("match_events").update(updates).eq("id", id),

        delete: (id: string) =>
            supabase.from("match_events").delete().eq("id", id),
    },

    // Tournaments
    tournaments: {
        list: () =>
            supabase.from("tournaments").select("*").order("start_date", {
                ascending: false,
            }),

        getById: (id: string) =>
            supabase
                .from("tournaments")
                .select(
                    `
          *,
          matches(*,
            home_team:teams!matches_home_team_id_fkey(*),
            away_team:teams!matches_away_team_id_fkey(*)
          )
        `,
                )
                .eq("id", id)
                .single(),

        create: (tournament: any) =>
            supabase.from("tournaments").insert(tournament),

        update: (id: string, updates: any) =>
            supabase.from("tournaments").update(updates).eq("id", id),

        delete: (id: string) =>
            supabase.from("tournaments").delete().eq("id", id),
    },

    // Fields
    fields: {
        list: () => supabase.from("fields").select("*").order("name"),

        getById: (id: string) =>
            supabase.from("fields").select("*").eq("id", id).single(),

        create: (field: any) => supabase.from("fields").insert(field),

        update: (id: string, updates: any) =>
            supabase.from("fields").update(updates).eq("id", id),

        delete: (id: string) => supabase.from("fields").delete().eq("id", id),
    },
};

// Realtime subscriptions
export const realtime = {
    /**
     * Subscribe to match events for a specific match
     */
    subscribeToMatchEvents: (
        matchId: string,
        callback: (payload: any) => void,
    ) => {
        return supabase
            .channel(`match_events:${matchId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "match_events",
                    filter: `match_id=eq.${matchId}`,
                },
                callback,
            )
            .subscribe();
    },

    /**
     * Subscribe to match updates
     */
    subscribeToMatch: (matchId: string, callback: (payload: any) => void) => {
        return supabase
            .channel(`matches:${matchId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "matches",
                    filter: `id=eq.${matchId}`,
                },
                callback,
            )
            .subscribe();
    },

    /**
     * Subscribe to all live matches
     */
    subscribeToLiveMatches: (callback: (payload: any) => void) => {
        return supabase
            .channel("live_matches")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "matches",
                    filter: "status=eq.live",
                },
                callback,
            )
            .subscribe();
    },

    /**
     * Unsubscribe from all channels
     */
    unsubscribeAll: () => {
        return supabase.removeAllChannels();
    },
};

// Utility functions
export const utils = {
    /**
     * Check if user has admin role
     */
    isAdmin: async (userId?: string) => {
        if (!userId) {
            const { user } = await auth.getUser();
            userId = user?.id;
        }

        if (!userId) return false;

        const { data } = await supabase.rpc("is_admin", { uid: userId });
        return data || false;
    },

    /**
     * Get user's team admin roles
     */
    getUserTeamRoles: async (userId?: string) => {
        if (!userId) {
            const { user } = await auth.getUser();
            userId = user?.id;
        }

        if (!userId) return [];

        const { data } = await supabase
            .from("team_admins")
            .select(
                `
        *,
        team:teams(*)
      `,
            )
            .eq("user_id", userId);

        return data || [];
    },

    /**
     * Check if user can manage a specific team
     */
    canManageTeam: async (teamId: string, userId?: string) => {
        if (!userId) {
            const { user } = await auth.getUser();
            userId = user?.id;
        }

        if (!userId) return false;

        // Check if user is admin
        const isAdmin = await utils.isAdmin(userId);
        if (isAdmin) return true;

        // Check if user has team admin role
        const { data } = await supabase
            .from("team_admins")
            .select("role")
            .eq("user_id", userId)
            .eq("team_id", teamId)
            .single();

        return data?.role === "manager" || data?.role === "scorekeeper";
    },
};
