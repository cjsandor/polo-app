/**
 * Preferences Slice
 * Manages user preferences and app settings
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PreferencesState {
    // Notification preferences
    notifications: {
        enabled: boolean;
        pushEnabled: boolean;
        matchStartReminders: boolean;
        goalNotifications: boolean;
        teamFollowUpdates: boolean;
        soundEnabled: boolean;
        vibrationEnabled: boolean;
    };

    // Display preferences
    display: {
        theme: "light" | "dark" | "system";
        fontSize: "small" | "medium" | "large";
        reducedMotion: boolean;
        highContrast: boolean;
    };

    // Match preferences
    matches: {
        defaultView: "list" | "grid" | "calendar";
        showHandicapGoals: boolean;
        showChukkerDetails: boolean;
        autoRefreshLiveMatches: boolean;
        refreshInterval: number; // in seconds
    };

    // Data and sync preferences
    data: {
        cacheEnabled: boolean;
        autoSyncEnabled: boolean;
        wifiOnlySync: boolean;
        backgroundRefreshEnabled: boolean;
        offlineMode: boolean;
    };

    // Privacy preferences
    privacy: {
        analyticsEnabled: boolean;
        crashReportingEnabled: boolean;
        locationSharingEnabled: boolean;
    };

    // Followed teams and players
    follows: {
        teamIds: string[];
        playerIds: string[];
        autoFollowMatchTeams: boolean;
    };

    // Language and region
    locale: {
        language: "en" | "es" | "fr" | "pt";
        region: string;
        timeFormat: "12h" | "24h";
        dateFormat: "mdy" | "dmy" | "ymd";
        timezone: string;
    };

    // App behavior
    behavior: {
        confirmBeforeLeaving: boolean;
        rememberLastTab: boolean;
        autoLockTimeout: number; // in minutes, 0 = never
        hapticFeedbackEnabled: boolean;
    };

    // Onboarding and tutorial
    onboarding: {
        completed: boolean;
        currentStep: number;
        skippedSteps: string[];
        tutorialsSeen: string[];
    };

    // Last app state
    lastState: {
        lastActiveTab: string;
        lastViewedMatch?: string;
        lastViewedTeam?: string;
        lastViewedPlayer?: string;
        lastUpdated: number;
    };
}

const initialState: PreferencesState = {
    notifications: {
        enabled: true,
        pushEnabled: true,
        matchStartReminders: true,
        goalNotifications: true,
        teamFollowUpdates: true,
        soundEnabled: true,
        vibrationEnabled: true,
    },
    display: {
        theme: "system",
        fontSize: "medium",
        reducedMotion: false,
        highContrast: false,
    },
    matches: {
        defaultView: "list",
        showHandicapGoals: true,
        showChukkerDetails: true,
        autoRefreshLiveMatches: true,
        refreshInterval: 30,
    },
    data: {
        cacheEnabled: true,
        autoSyncEnabled: true,
        wifiOnlySync: false,
        backgroundRefreshEnabled: true,
        offlineMode: false,
    },
    privacy: {
        analyticsEnabled: false,
        crashReportingEnabled: true,
        locationSharingEnabled: false,
    },
    follows: {
        teamIds: [],
        playerIds: [],
        autoFollowMatchTeams: false,
    },
    locale: {
        language: "en",
        region: "US",
        timeFormat: "12h",
        dateFormat: "mdy",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    behavior: {
        confirmBeforeLeaving: true,
        rememberLastTab: true,
        autoLockTimeout: 0,
        hapticFeedbackEnabled: true,
    },
    onboarding: {
        completed: false,
        currentStep: 0,
        skippedSteps: [],
        tutorialsSeen: [],
    },
    lastState: {
        lastActiveTab: "matches",
        lastUpdated: Date.now(),
    },
};

const preferencesSlice = createSlice({
    name: "preferences",
    initialState,
    reducers: {
        // Notification preferences
        updateNotificationPreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState["notifications"]>>,
        ) => {
            state.notifications = { ...state.notifications, ...action.payload };
        },

        toggleNotifications: (state) => {
            state.notifications.enabled = !state.notifications.enabled;
        },

        // Display preferences
        updateDisplayPreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState["display"]>>,
        ) => {
            state.display = { ...state.display, ...action.payload };
        },

        setTheme: (
            state,
            action: PayloadAction<"light" | "dark" | "system">,
        ) => {
            state.display.theme = action.payload;
        },

        setFontSize: (
            state,
            action: PayloadAction<"small" | "medium" | "large">,
        ) => {
            state.display.fontSize = action.payload;
        },

        // Match preferences
        updateMatchPreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState["matches"]>>,
        ) => {
            state.matches = { ...state.matches, ...action.payload };
        },

        setDefaultMatchView: (
            state,
            action: PayloadAction<"list" | "grid" | "calendar">,
        ) => {
            state.matches.defaultView = action.payload;
        },

        // Data preferences
        updateDataPreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState["data"]>>,
        ) => {
            state.data = { ...state.data, ...action.payload };
        },

        toggleOfflineMode: (state) => {
            state.data.offlineMode = !state.data.offlineMode;
        },

        // Privacy preferences
        updatePrivacyPreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState["privacy"]>>,
        ) => {
            state.privacy = { ...state.privacy, ...action.payload };
        },

        // Follows
        followTeam: (state, action: PayloadAction<string>) => {
            if (!state.follows.teamIds.includes(action.payload)) {
                state.follows.teamIds.push(action.payload);
            }
        },

        unfollowTeam: (state, action: PayloadAction<string>) => {
            state.follows.teamIds = state.follows.teamIds.filter((id) =>
                id !== action.payload
            );
        },

        followPlayer: (state, action: PayloadAction<string>) => {
            if (!state.follows.playerIds.includes(action.payload)) {
                state.follows.playerIds.push(action.payload);
            }
        },

        unfollowPlayer: (state, action: PayloadAction<string>) => {
            state.follows.playerIds = state.follows.playerIds.filter((id) =>
                id !== action.payload
            );
        },

        setFollowedTeams: (state, action: PayloadAction<string[]>) => {
            state.follows.teamIds = action.payload;
        },

        setFollowedPlayers: (state, action: PayloadAction<string[]>) => {
            state.follows.playerIds = action.payload;
        },

        // Locale preferences
        updateLocalePreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState["locale"]>>,
        ) => {
            state.locale = { ...state.locale, ...action.payload };
        },

        setLanguage: (
            state,
            action: PayloadAction<"en" | "es" | "fr" | "pt">,
        ) => {
            state.locale.language = action.payload;
        },

        // Behavior preferences
        updateBehaviorPreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState["behavior"]>>,
        ) => {
            state.behavior = { ...state.behavior, ...action.payload };
        },

        toggleHapticFeedback: (state) => {
            state.behavior.hapticFeedbackEnabled = !state.behavior
                .hapticFeedbackEnabled;
        },

        // Onboarding
        completeOnboarding: (state) => {
            state.onboarding.completed = true;
            state.onboarding.currentStep = 0;
        },

        setOnboardingStep: (state, action: PayloadAction<number>) => {
            state.onboarding.currentStep = action.payload;
        },

        skipOnboardingStep: (state, action: PayloadAction<string>) => {
            if (!state.onboarding.skippedSteps.includes(action.payload)) {
                state.onboarding.skippedSteps.push(action.payload);
            }
        },

        markTutorialSeen: (state, action: PayloadAction<string>) => {
            if (!state.onboarding.tutorialsSeen.includes(action.payload)) {
                state.onboarding.tutorialsSeen.push(action.payload);
            }
        },

        // Last state
        updateLastState: (
            state,
            action: PayloadAction<Partial<PreferencesState["lastState"]>>,
        ) => {
            state.lastState = {
                ...state.lastState,
                ...action.payload,
                lastUpdated: Date.now(),
            };
        },

        setLastActiveTab: (state, action: PayloadAction<string>) => {
            state.lastState.lastActiveTab = action.payload;
            state.lastState.lastUpdated = Date.now();
        },

        // Reset preferences
        resetPreferences: () => initialState,

        // Import/export preferences
        importPreferences: (
            state,
            action: PayloadAction<Partial<PreferencesState>>,
        ) => {
            return { ...state, ...action.payload };
        },
    },
});

// Export actions
export const {
    updateNotificationPreferences,
    toggleNotifications,
    updateDisplayPreferences,
    setTheme,
    setFontSize,
    updateMatchPreferences,
    setDefaultMatchView,
    updateDataPreferences,
    toggleOfflineMode,
    updatePrivacyPreferences,
    followTeam,
    unfollowTeam,
    followPlayer,
    unfollowPlayer,
    setFollowedTeams,
    setFollowedPlayers,
    updateLocalePreferences,
    setLanguage,
    updateBehaviorPreferences,
    toggleHapticFeedback,
    completeOnboarding,
    setOnboardingStep,
    skipOnboardingStep,
    markTutorialSeen,
    updateLastState,
    setLastActiveTab,
    resetPreferences,
    importPreferences,
} = preferencesSlice.actions;

// Selectors
export const selectPreferences = (state: { preferences: PreferencesState }) =>
    state.preferences;
export const selectNotificationPreferences = (
    state: { preferences: PreferencesState },
) => state.preferences.notifications;
export const selectDisplayPreferences = (
    state: { preferences: PreferencesState },
) => state.preferences.display;
export const selectMatchPreferences = (
    state: { preferences: PreferencesState },
) => state.preferences.matches;
export const selectDataPreferences = (
    state: { preferences: PreferencesState },
) => state.preferences.data;
export const selectPrivacyPreferences = (
    state: { preferences: PreferencesState },
) => state.preferences.privacy;
export const selectFollows = (state: { preferences: PreferencesState }) =>
    state.preferences.follows;
export const selectLocalePreferences = (
    state: { preferences: PreferencesState },
) => state.preferences.locale;
export const selectBehaviorPreferences = (
    state: { preferences: PreferencesState },
) => state.preferences.behavior;
export const selectOnboardingState = (
    state: { preferences: PreferencesState },
) => state.preferences.onboarding;
export const selectLastState = (state: { preferences: PreferencesState }) =>
    state.preferences.lastState;

// Complex selectors
export const selectIsTeamFollowed =
    (teamId: string) => (state: { preferences: PreferencesState }) => {
        return state.preferences.follows.teamIds.includes(teamId);
    };

export const selectIsPlayerFollowed =
    (playerId: string) => (state: { preferences: PreferencesState }) => {
        return state.preferences.follows.playerIds.includes(playerId);
    };

export const selectShouldShowTutorial =
    (tutorialId: string) => (state: { preferences: PreferencesState }) => {
        return !state.preferences.onboarding.tutorialsSeen.includes(tutorialId);
    };

export default preferencesSlice.reducer;
