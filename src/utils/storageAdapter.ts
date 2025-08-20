/**
 * Storage Adapter
 * Provides a unified storage interface that works across web, mobile, and SSR environments
 */

import { Platform } from "react-native";

// Storage interface compatible with both AsyncStorage and localStorage
export interface StorageAdapter {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
}

// Lazy-load AsyncStorage to avoid issues with web bundling
let AsyncStorage: any = null;

const getAsyncStorage = () => {
    if (!AsyncStorage && Platform.OS !== "web") {
        try {
            AsyncStorage = require("@react-native-async-storage/async-storage").default;
        } catch (error) {
            console.warn("Failed to load AsyncStorage:", error);
        }
    }
    return AsyncStorage;
};

// Create storage adapter that determines platform at runtime
export const storageAdapter: StorageAdapter = {
    async getItem(key: string): Promise<string | null> {
        try {
            // Check platform at runtime, not module load time
            if (Platform.OS === "web") {
                // Web implementation
                if (typeof window !== "undefined" && window.localStorage) {
                    return localStorage.getItem(key);
                }
                return null;
            } else {
                // Native implementation
                const AS = getAsyncStorage();
                if (AS) {
                    return await AS.getItem(key);
                }
                return null;
            }
        } catch (error) {
            console.warn("Storage getItem failed:", error);
            return null;
        }
    },

    async setItem(key: string, value: string): Promise<void> {
        try {
            if (Platform.OS === "web") {
                // Web implementation
                if (typeof window !== "undefined" && window.localStorage) {
                    localStorage.setItem(key, value);
                }
            } else {
                // Native implementation
                const AS = getAsyncStorage();
                if (AS) {
                    await AS.setItem(key, value);
                }
            }
        } catch (error) {
            console.warn("Storage setItem failed:", error);
        }
    },

    async removeItem(key: string): Promise<void> {
        try {
            if (Platform.OS === "web") {
                // Web implementation
                if (typeof window !== "undefined" && window.localStorage) {
                    localStorage.removeItem(key);
                }
            } else {
                // Native implementation
                const AS = getAsyncStorage();
                if (AS) {
                    await AS.removeItem(key);
                }
            }
        } catch (error) {
            console.warn("Storage removeItem failed:", error);
        }
    },

    async clear(): Promise<void> {
        try {
            if (Platform.OS === "web") {
                // Web implementation
                if (typeof window !== "undefined" && window.localStorage) {
                    localStorage.clear();
                }
            } else {
                // Native implementation
                const AS = getAsyncStorage();
                if (AS) {
                    await AS.clear();
                }
            }
        } catch (error) {
            console.warn("Storage clear failed:", error);
        }
    },
};

// Default export for Supabase auth storage
export default storageAdapter;