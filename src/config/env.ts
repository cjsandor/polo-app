/**
 * Environment Configuration
 * Provides typed access to environment variables with validation
 */

import Constants from "expo-constants";

interface Config {
    supabaseUrl: string;
    supabaseAnonKey: string;
    environment: "development" | "staging" | "production";
    isProduction: boolean;
    isDevelopment: boolean;
    appName: string;
    version: string;
}

/**
 * Get configuration from Expo Constants
 * This provides access to variables defined in app.config.ts
 */
const getConfig = (): Config => {
    const extra = Constants.expoConfig?.extra || {};

    // Validate required environment variables
    if (!extra.supabaseUrl || !extra.supabaseAnonKey) {
        throw new Error(
            "Missing required Supabase configuration. " +
                "Please check your .env.local file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.",
        );
    }

    const environment = extra.environment || "development";

    return {
        supabaseUrl: extra.supabaseUrl,
        supabaseAnonKey: extra.supabaseAnonKey,
        environment,
        isProduction: environment === "production",
        isDevelopment: environment === "development",
        appName: extra.appName || "Polo Match Tracker",
        version: extra.version || "1.0.0",
    };
};

// Export singleton config instance
export const config = getConfig();

// Export individual values for convenience
export const {
    supabaseUrl,
    supabaseAnonKey,
    environment,
    isProduction,
    isDevelopment,
    appName,
    version,
} = config;

// Environment validation utility
export const validateEnvironment = (): boolean => {
    try {
        getConfig();
        return true;
    } catch (error) {
        console.error("Environment validation failed:", error);
        return false;
    }
};

// Development helpers
export const __DEV__ = isDevelopment;
export const __PROD__ = isProduction;
