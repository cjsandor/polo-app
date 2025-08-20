/**
 * Storage Utilities
 * Wrapper around AsyncStorage with error handling and type safety
 */

import { storageAdapter } from "./storageAdapter";
import { STORAGE_KEYS } from "../config/constants";

export class Storage {
    /**
     * Store data with error handling
     */
    static async setItem<T>(key: string, value: T): Promise<boolean> {
        try {
            const serializedValue = JSON.stringify(value);
            await storageAdapter.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error(`Error storing item with key ${key}:`, error);
            return false;
        }
    }

    /**
     * Retrieve data with error handling
     */
    static async getItem<T>(key: string): Promise<T | null> {
        try {
            const serializedValue = await storageAdapter.getItem(key);
            if (serializedValue === null) {
                return null;
            }
            return JSON.parse(serializedValue) as T;
        } catch (error) {
            console.error(`Error retrieving item with key ${key}:`, error);
            return null;
        }
    }

    /**
     * Remove item with error handling
     */
    static async removeItem(key: string): Promise<boolean> {
        try {
            await storageAdapter.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item with key ${key}:`, error);
            return false;
        }
    }

    /**
     * Clear all storage
     */
    static async clear(): Promise<boolean> {
        try {
            await storageAdapter.clear();
            return true;
        } catch (error) {
            console.error("Error clearing storage:", error);
            return false;
        }
    }

    /**
     * Get all keys
     */
    static async getAllKeys(): Promise<string[]> {
        // Note: Not all storage adapters support getAllKeys
        // For web/localStorage, we'd need to iterate through keys
        try {
            // This is a simplified implementation
            // In a real scenario, you might want to maintain a key registry
            return [];
        } catch (error) {
            console.error("Error getting all keys:", error);
            return [];
        }
    }

    /**
     * Get multiple items
     */
    static async getMultiple(keys: string[]): Promise<Record<string, any>> {
        try {
            const result: Record<string, any> = {};

            // Get items one by one since not all storage adapters support multiGet
            await Promise.all(
                keys.map(async (key) => {
                    const value = await storageAdapter.getItem(key);
                    if (value !== null) {
                        try {
                            result[key] = JSON.parse(value);
                        } catch {
                            result[key] = value;
                        }
                    }
                }),
            );

            return result;
        } catch (error) {
            console.error("Error getting multiple items:", error);
            return {};
        }
    }
}

// Specific storage utilities for common use cases
export const AuthStorage = {
    setUserPreferences: (preferences: any) =>
        Storage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences),

    getUserPreferences: () =>
        Storage.getItem<any>(STORAGE_KEYS.USER_PREFERENCES),

    setPushToken: (token: string) =>
        Storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token),

    getPushToken: () => Storage.getItem<string>(STORAGE_KEYS.PUSH_TOKEN),

    setFollowedTeams: (teamIds: string[]) =>
        Storage.setItem(STORAGE_KEYS.FOLLOWED_TEAMS, teamIds),

    getFollowedTeams: () =>
        Storage.getItem<string[]>(STORAGE_KEYS.FOLLOWED_TEAMS),

    clearUserData: async () => {
        const keys = Object.values(STORAGE_KEYS);
        const promises = keys.map((key) => Storage.removeItem(key));
        await Promise.all(promises);
    },
};

// Offline data storage utilities
export const OfflineStorage = {
    setOfflineData: (data: any) =>
        Storage.setItem(STORAGE_KEYS.OFFLINE_DATA, data),

    getOfflineData: () => Storage.getItem<any>(STORAGE_KEYS.OFFLINE_DATA),

    clearOfflineData: () => Storage.removeItem(STORAGE_KEYS.OFFLINE_DATA),

    // Cache specific data types
    cacheMatches: async (matches: any[]) => {
        const offlineData = (await OfflineStorage.getOfflineData()) || {};
        offlineData.matches = matches;
        offlineData.lastUpdated = Date.now();
        return Storage.setItem(STORAGE_KEYS.OFFLINE_DATA, offlineData);
    },

    getCachedMatches: async () => {
        const offlineData = await OfflineStorage.getOfflineData();
        return offlineData?.matches || [];
    },

    cacheTeams: async (teams: any[]) => {
        const offlineData = (await OfflineStorage.getOfflineData()) || {};
        offlineData.teams = teams;
        offlineData.lastUpdated = Date.now();
        return Storage.setItem(STORAGE_KEYS.OFFLINE_DATA, offlineData);
    },

    getCachedTeams: async () => {
        const offlineData = await OfflineStorage.getOfflineData();
        return offlineData?.teams || [];
    },

    cachePlayers: async (players: any[]) => {
        const offlineData = (await OfflineStorage.getOfflineData()) || {};
        offlineData.players = players;
        offlineData.lastUpdated = Date.now();
        return Storage.setItem(STORAGE_KEYS.OFFLINE_DATA, offlineData);
    },

    getCachedPlayers: async () => {
        const offlineData = await OfflineStorage.getOfflineData();
        return offlineData?.players || [];
    },

    getLastCacheUpdate: async () => {
        const offlineData = await OfflineStorage.getOfflineData();
        return offlineData?.lastUpdated || 0;
    },
};

// Storage debugging utilities
export const StorageDebug = {
    getAllStoredData: async () => {
        const keys = await Storage.getAllKeys();
        return Storage.getMultiple(keys);
    },

    getStorageSize: async () => {
        try {
            const keys = await Storage.getAllKeys();
            const items = await Storage.getMultiple(keys);

            let totalSize = 0;
            const sizeByKey: Record<string, number> = {};

            Object.entries(items).forEach(([key, value]) => {
                if (value !== null) {
                    const valueStr = typeof value === "string"
                        ? value
                        : JSON.stringify(value);
                    const size = new Blob([valueStr]).size;
                    sizeByKey[key] = size;
                    totalSize += size;
                }
            });

            return {
                totalSize,
                sizeByKey,
                totalKeys: keys.length,
            };
        } catch (error) {
            console.error("Error calculating storage size:", error);
            return {
                totalSize: 0,
                sizeByKey: {},
                totalKeys: 0,
            };
        }
    },

    logStorageContents: async () => {
        const data = await StorageDebug.getAllStoredData();
        console.log("Storage Contents:", data);
    },
};
