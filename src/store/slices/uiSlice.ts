/**
 * UI Slice
 * Manages UI state like loading indicators, modals, notifications, etc.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define notification types
export interface Notification {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    duration?: number; // in milliseconds, 0 = permanent
    timestamp: number;
    actions?: Array<{
        label: string;
        action: string;
        style?: "default" | "primary" | "destructive";
    }>;
}

// Define modal types
export interface Modal {
    id: string;
    type: string;
    props?: Record<string, any>;
    closeable?: boolean;
    backdrop?: boolean;
}

export interface UIState {
    // Loading states
    globalLoading: boolean;
    loadingStates: Record<string, boolean>;

    // Notifications
    notifications: Notification[];

    // Modals
    modals: Modal[];

    // Navigation
    activeTab: string;
    navigationHistory: string[];

    // Network status
    isOnline: boolean;
    lastOnline: number;

    // App state
    isAppActive: boolean;
    isAppInBackground: boolean;

    // Pull to refresh states
    refreshingStates: Record<string, boolean>;

    // Search and filters
    searchQueries: Record<string, string>;
    activeFilters: Record<string, any>;

    // Keyboard and input
    keyboardVisible: boolean;
    keyboardHeight: number;

    // Theme and display
    theme: "light" | "dark" | "system";
    safeAreaInsets: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };

    // Error boundaries
    errorBoundaryStates: Record<string, boolean>;
}

const initialState: UIState = {
    globalLoading: false,
    loadingStates: {},
    notifications: [],
    modals: [],
    activeTab: "matches",
    navigationHistory: [],
    isOnline: true,
    lastOnline: Date.now(),
    isAppActive: true,
    isAppInBackground: false,
    refreshingStates: {},
    searchQueries: {},
    activeFilters: {},
    keyboardVisible: false,
    keyboardHeight: 0,
    theme: "system",
    safeAreaInsets: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    errorBoundaryStates: {},
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        // Loading states
        setGlobalLoading: (state, action: PayloadAction<boolean>) => {
            state.globalLoading = action.payload;
        },

        setLoading: (
            state,
            action: PayloadAction<{ key: string; loading: boolean }>,
        ) => {
            state.loadingStates[action.payload.key] = action.payload.loading;
        },

        clearAllLoading: (state) => {
            state.globalLoading = false;
            state.loadingStates = {};
        },

        // Notifications
        addNotification: (
            state,
            action: PayloadAction<Omit<Notification, "id" | "timestamp">>,
        ) => {
            const notification: Notification = {
                ...action.payload,
                id: Date.now().toString() +
                    Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
            };
            state.notifications.push(notification);
        },

        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload,
            );
        },

        clearAllNotifications: (state) => {
            state.notifications = [];
        },

        // Modals
        showModal: (state, action: PayloadAction<Omit<Modal, "id">>) => {
            const modal: Modal = {
                ...action.payload,
                id: Date.now().toString() +
                    Math.random().toString(36).substr(2, 9),
            };
            state.modals.push(modal);
        },

        hideModal: (state, action: PayloadAction<string>) => {
            state.modals = state.modals.filter((modal) =>
                modal.id !== action.payload
            );
        },

        hideAllModals: (state) => {
            state.modals = [];
        },

        // Navigation
        setActiveTab: (state, action: PayloadAction<string>) => {
            state.activeTab = action.payload;

            // Add to history if different from current
            if (
                state.navigationHistory[state.navigationHistory.length - 1] !==
                    action.payload
            ) {
                state.navigationHistory.push(action.payload);

                // Keep history limited to 10 items
                if (state.navigationHistory.length > 10) {
                    state.navigationHistory.shift();
                }
            }
        },

        clearNavigationHistory: (state) => {
            state.navigationHistory = [];
        },

        // Network status
        setOnlineStatus: (state, action: PayloadAction<boolean>) => {
            state.isOnline = action.payload;
            if (action.payload) {
                state.lastOnline = Date.now();
            }
        },

        // App state
        setAppActive: (state, action: PayloadAction<boolean>) => {
            state.isAppActive = action.payload;
        },

        setAppInBackground: (state, action: PayloadAction<boolean>) => {
            state.isAppInBackground = action.payload;
        },

        // Pull to refresh
        setRefreshing: (
            state,
            action: PayloadAction<{ key: string; refreshing: boolean }>,
        ) => {
            state.refreshingStates[action.payload.key] =
                action.payload.refreshing;
        },

        clearAllRefreshing: (state) => {
            state.refreshingStates = {};
        },

        // Search and filters
        setSearchQuery: (
            state,
            action: PayloadAction<{ key: string; query: string }>,
        ) => {
            state.searchQueries[action.payload.key] = action.payload.query;
        },

        clearSearchQuery: (state, action: PayloadAction<string>) => {
            delete state.searchQueries[action.payload];
        },

        setFilter: (
            state,
            action: PayloadAction<{ key: string; filter: any }>,
        ) => {
            state.activeFilters[action.payload.key] = action.payload.filter;
        },

        clearFilter: (state, action: PayloadAction<string>) => {
            delete state.activeFilters[action.payload];
        },

        clearAllFilters: (state) => {
            state.activeFilters = {};
        },

        // Keyboard
        setKeyboardVisible: (
            state,
            action: PayloadAction<{ visible: boolean; height?: number }>,
        ) => {
            state.keyboardVisible = action.payload.visible;
            if (action.payload.height !== undefined) {
                state.keyboardHeight = action.payload.height;
            }
        },

        // Theme
        setTheme: (
            state,
            action: PayloadAction<"light" | "dark" | "system">,
        ) => {
            state.theme = action.payload;
        },

        // Safe area insets
        setSafeAreaInsets: (
            state,
            action: PayloadAction<Partial<UIState["safeAreaInsets"]>>,
        ) => {
            state.safeAreaInsets = {
                ...state.safeAreaInsets,
                ...action.payload,
            };
        },

        // Error boundaries
        setErrorBoundaryState: (
            state,
            action: PayloadAction<{ key: string; hasError: boolean }>,
        ) => {
            state.errorBoundaryStates[action.payload.key] =
                action.payload.hasError;
        },

        clearErrorBoundaryState: (state, action: PayloadAction<string>) => {
            delete state.errorBoundaryStates[action.payload];
        },

        // Reset UI state
        resetUIState: () => initialState,
    },
});

// Export actions
export const {
    setGlobalLoading,
    setLoading,
    clearAllLoading,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showModal,
    hideModal,
    hideAllModals,
    setActiveTab,
    clearNavigationHistory,
    setOnlineStatus,
    setAppActive,
    setAppInBackground,
    setRefreshing,
    clearAllRefreshing,
    setSearchQuery,
    clearSearchQuery,
    setFilter,
    clearFilter,
    clearAllFilters,
    setKeyboardVisible,
    setTheme,
    setSafeAreaInsets,
    setErrorBoundaryState,
    clearErrorBoundaryState,
    resetUIState,
} = uiSlice.actions;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectGlobalLoading = (state: { ui: UIState }) =>
    state.ui.globalLoading;
export const selectLoading = (key: string) => (state: { ui: UIState }) =>
    state.ui.loadingStates[key] || false;
export const selectNotifications = (state: { ui: UIState }) =>
    state.ui.notifications;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectActiveTab = (state: { ui: UIState }) => state.ui.activeTab;
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline;
export const selectIsAppActive = (state: { ui: UIState }) =>
    state.ui.isAppActive;
export const selectRefreshing = (key: string) => (state: { ui: UIState }) =>
    state.ui.refreshingStates[key] || false;
export const selectSearchQuery = (key: string) => (state: { ui: UIState }) =>
    state.ui.searchQueries[key] || "";
export const selectFilter = (key: string) => (state: { ui: UIState }) =>
    state.ui.activeFilters[key];
export const selectKeyboardVisible = (state: { ui: UIState }) =>
    state.ui.keyboardVisible;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSafeAreaInsets = (state: { ui: UIState }) =>
    state.ui.safeAreaInsets;

export default uiSlice.reducer;
