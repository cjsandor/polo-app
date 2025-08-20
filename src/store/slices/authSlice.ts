/**
 * Auth Slice
 * Manages authentication state with Redux Toolkit
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile, TeamAdmin } from "../../types/database";

export interface AuthState {
    // Auth state
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Team permissions
    teamRoles: TeamAdmin[];

    // Loading states
    loading: boolean;
    initializing: boolean;

    // Error handling
    error: string | null;
    lastAuthAction: string | null;
}

const initialState: AuthState = {
    user: null,
    session: null,
    profile: null,
    isAuthenticated: false,
    isAdmin: false,
    teamRoles: [],
    loading: false,
    initializing: true,
    error: null,
    lastAuthAction: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Session management
        setSession: (
            state,
            action: PayloadAction<
                { user: User | null; session: Session | null }
            >,
        ) => {
            state.user = action.payload.user;
            state.session = action.payload.session;
            state.isAuthenticated = !!action.payload.user;
            state.initializing = false;
            state.error = null;
        },

        // Profile management
        setProfile: (state, action: PayloadAction<Profile | null>) => {
            state.profile = action.payload;
        },

        updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
            }
        },

        // Admin status
        setIsAdmin: (state, action: PayloadAction<boolean>) => {
            state.isAdmin = action.payload;
        },

        // Team roles
        setTeamRoles: (state, action: PayloadAction<TeamAdmin[]>) => {
            state.teamRoles = action.payload;
        },

        addTeamRole: (state, action: PayloadAction<TeamAdmin>) => {
            const existingIndex = state.teamRoles.findIndex(
                (role) => role.team_id === action.payload.team_id,
            );

            if (existingIndex >= 0) {
                state.teamRoles[existingIndex] = action.payload;
            } else {
                state.teamRoles.push(action.payload);
            }
        },

        removeTeamRole: (state, action: PayloadAction<string>) => {
            state.teamRoles = state.teamRoles.filter(
                (role) => role.team_id !== action.payload,
            );
        },

        // Loading states
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setInitializing: (state, action: PayloadAction<boolean>) => {
            state.initializing = action.payload;
        },

        // Error handling
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },

        clearError: (state) => {
            state.error = null;
        },

        // Auth actions tracking
        setLastAuthAction: (state, action: PayloadAction<string>) => {
            state.lastAuthAction = action.payload;
        },

        // Sign out
        signOut: (state) => {
            state.user = null;
            state.session = null;
            state.profile = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
            state.teamRoles = [];
            state.loading = false;
            state.error = null;
            state.lastAuthAction = "signOut";
        },

        // Reset auth state (for testing/debugging)
        resetAuthState: () => initialState,
    },
});

// Export actions
export const {
    setSession,
    setProfile,
    updateProfile,
    setIsAdmin,
    setTeamRoles,
    addTeamRole,
    removeTeamRole,
    setLoading,
    setInitializing,
    setError,
    clearError,
    setLastAuthAction,
    signOut,
    resetAuthState,
} = authSlice.actions;

// Selector functions
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectProfile = (state: { auth: AuthState }) => state.auth.profile;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
    state.auth.isAuthenticated;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.isAdmin;
export const selectTeamRoles = (state: { auth: AuthState }) =>
    state.auth.teamRoles;
export const selectAuthLoading = (state: { auth: AuthState }) =>
    state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Complex selectors
export const selectCanManageTeam =
    (teamId: string) => (state: { auth: AuthState }) => {
        if (state.auth.isAdmin) return true;

        return state.auth.teamRoles.some(
            (role) =>
                role.team_id === teamId &&
                (role.role === "manager" || role.role === "scorekeeper"),
        );
    };

export const selectManagedTeams = (state: { auth: AuthState }) => {
    return state.auth.teamRoles
        .filter((role) =>
            role.role === "manager" || role.role === "scorekeeper"
        )
        .map((role) => role.team_id);
};

export const selectIsTeamManager =
    (teamId: string) => (state: { auth: AuthState }) => {
        return state.auth.teamRoles.some(
            (role) => role.team_id === teamId && role.role === "manager",
        );
    };

export const selectIsTeamScorekeeper =
    (teamId: string) => (state: { auth: AuthState }) => {
        return state.auth.teamRoles.some(
            (role) =>
                role.team_id === teamId &&
                (role.role === "manager" || role.role === "scorekeeper"),
        );
    };

// Export reducer
export default authSlice.reducer;
