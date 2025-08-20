/**
 * Redux Store Configuration
 * Configures the main Redux store with RTK Query and persistence
 */

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from "redux-persist";
import { storageAdapter } from "../utils/storageAdapter";

// Import slices and API
import { api } from "./api";
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";
import preferencesSlice from "./slices/preferencesSlice";

// Import API slices to inject endpoints
import "./api/slices/matchesApi";
import "./api/slices/teamsApi";
import "./api/slices/playersApi";
import "./api/slices/matchEventsApi";
import "./api/slices/tournamentsApi";
import "./api/slices/fieldsApi";
import "./api/slices/profilesApi";

// Persist configuration for auth slice
const authPersistConfig = {
    key: "auth",
    storage: storageAdapter,
    whitelist: ["user", "profile", "isAdmin"], // Only persist specific fields
};

// Persist configuration for preferences slice
const preferencesPersistConfig = {
    key: "preferences",
    storage: storageAdapter,
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);
const persistedPreferencesReducer = persistReducer(
    preferencesPersistConfig,
    preferencesSlice,
);

// Configure store
export const store = configureStore({
    reducer: {
        // API slice
        [api.reducerPath]: api.reducer,

        // Persisted slices
        auth: persistedAuthReducer,
        preferences: persistedPreferencesReducer,

        // Non-persisted slices
        ui: uiSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }).concat(api.middleware),
    devTools: process.env.NODE_ENV !== "production",
});

// Enable refetching on focus/reconnect
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Clear persisted data (for logout, debugging, etc.)
export const clearPersistedData = async () => {
    try {
        await Promise.all([
            storageAdapter.removeItem("persist:auth"),
            storageAdapter.removeItem("persist:preferences"),
        ]);
        console.log("Persisted data cleared successfully");
    } catch (error) {
        console.error("Error clearing persisted data:", error);
    }
};

// Store debugging utilities
export const storeDebug = {
    getState: () => store.getState(),

    getPersistedKeys: async () => {
        try {
            // Since storageAdapter doesn't support getAllKeys universally,
            // we'll return the known persisted keys
            return ["persist:auth", "persist:preferences"];
        } catch (error) {
            console.error("Error getting persisted keys:", error);
            return [];
        }
    },

    logState: () => {
        console.log("Current Redux State:", store.getState());
    },

    logAPICache: () => {
        const state = store.getState();
        console.log("RTK Query Cache:", state.api);
    },
};
