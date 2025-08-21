/**
 * RTK Query API Configuration
 * Base API slice with Supabase integration
 */

import { createApi } from "@reduxjs/toolkit/query/react";
// Temporarily using debug version to identify issues
import { supabaseBaseQuery } from "./baseQuery-debug";
import { CACHE } from "../../config/constants";

// Define tag types for cache invalidation
export const tagTypes = [
    "Profile",
    "Team",
    "Player",
    "Match",
    "MatchEvent",
    "Tournament",
    "Field",
    "Follow",
    "PushToken",
] as const;

export type TagType = typeof tagTypes[number];

// Create the main API slice
export const api = createApi({
    reducerPath: "api",
    baseQuery: supabaseBaseQuery,
    tagTypes,
    keepUnusedDataFor: CACHE.LISTS_TTL_MS / 1000, // Convert to seconds for RTK Query
    refetchOnMountOrArgChange: CACHE.DETAILS_TTL_MS / 1000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: () => ({}), // Endpoints will be injected by individual API slices
});

// Export hooks that will be enhanced by injected endpoints
export const {
    // These will be populated by the injected endpoints
    util: { getRunningQueriesThunk },
} = api;

// Utility functions for cache management
export const apiUtils = {
    /**
     * Invalidate specific tags to force refetch
     */
    invalidateTags: (tags: { type: TagType; id?: string | number }[]) => {
        return api.util.invalidateTags(tags);
    },

    /**
     * Prefetch data for better performance
     */
    prefetch: (endpoint: string, args: any, options?: any) => {
        return api.util.prefetch(endpoint, args, options);
    },

    /**
     * Get cached data without triggering a request
     */
    selectCachedResult: (endpoint: string, args: any) => {
        return api.endpoints[endpoint]?.select(args);
    },

    /**
     * Reset the entire API cache
     */
    resetApiState: () => {
        return api.util.resetApiState();
    },

    /**
     * Get current cache status
     */
    getCacheStatus: () => {
        // This would be called from a component to get access to store state
        // The actual implementation would need access to store.getState()
        return {
            queries: Object.keys(api.endpoints).length,
            mutations: 0, // Would need to count actual mutations
            subscriptions: 0, // Would need to count actual subscriptions
        };
    },
};

// Note: API slices will be imported and inject endpoints when used
// This prevents circular dependency issues

// Export the API slice for use in store configuration
export { api as default };
