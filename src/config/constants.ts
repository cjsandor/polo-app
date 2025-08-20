/**
 * Application Constants
 * Centralized configuration and constants
 */

// Performance targets (from requirements)
export const PERFORMANCE = {
    APP_LAUNCH_TARGET_MS: 2000,
    SCREEN_TRANSITION_TARGET_MS: 300,
    REALTIME_LATENCY_TARGET_MS: 500,
    BATTERY_TARGET_PERCENT_PER_HOUR: 5,
    REALTIME_BATCH_DELAY_MS: 500,
} as const;

// Cache configuration
export const CACHE = {
    LISTS_TTL_MS: 5 * 60 * 1000, // 5 minutes
    DETAILS_TTL_MS: 1 * 60 * 1000, // 1 minute
    OFFLINE_MATCHES_LIMIT: 50,
    IMAGE_CACHE_SIZE_MB: 100,
} as const;

// Polo-specific constants
export const POLO = {
    MAX_PLAYERS_PER_TEAM: 4,
    MIN_HANDICAP: -2,
    MAX_HANDICAP: 10,
    MAX_JERSEY_NUMBER: 99,
    MIN_CHUKKER: 1,
    MAX_CHUKKER: 8,
    STANDARD_CHUKKERS: [4, 6, 8],
    DEFAULT_CHUKKERS: 6,
    POSITIONS: {
        1: "Back",
        2: "Half Back",
        3: "Half Forward",
        4: "Forward",
    },
} as const;

// UI Configuration
export const UI = {
    ANIMATION_DURATION_MS: 300,
    DEBOUNCE_SEARCH_MS: 300,
    PULL_TO_REFRESH_THRESHOLD: 100,
    LIST_ITEM_HEIGHT: 80,
    HAPTIC_FEEDBACK: true,
} as const;

// Theme colors (placeholder - will be defined in theme system)
export const COLORS = {
    PRIMARY: "#2E7D32",
    SECONDARY: "#4CAF50",
    ACCENT: "#FF6B35",
    SUCCESS: "#4CAF50",
    WARNING: "#FF9800",
    ERROR: "#F44336",
    INFO: "#2196F3",
} as const;

// Storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: "@polo_app/auth_token",
    USER_PREFERENCES: "@polo_app/user_preferences",
    OFFLINE_DATA: "@polo_app/offline_data",
    PUSH_TOKEN: "@polo_app/push_token",
    FOLLOWED_TEAMS: "@polo_app/followed_teams",
} as const;

// API Configuration
export const API = {
    TIMEOUT_MS: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
} as const;

// Validation patterns
export const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[+]?[(]?[\d\s\-\(\)]{10,}$/,
    PASSWORD_MIN_LENGTH: 8,
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR:
        "Network connection error. Please check your internet connection.",
    UNAUTHORIZED: "You need to sign in to access this feature.",
    FORBIDDEN: "You don't have permission to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    SERVER_ERROR: "Server error. Please try again later.",
    VALIDATION_ERROR: "Please check your input and try again.",
    OFFLINE_ERROR: "This feature requires an internet connection.",
} as const;

// Feature flags (for gradual rollout)
export const FEATURE_FLAGS = {
    PUSH_NOTIFICATIONS: true,
    REALTIME_UPDATES: true,
    OFFLINE_SUPPORT: true,
    ADVANCED_SEARCH: true,
    ANALYTICS: false, // disabled by default for privacy
} as const;
