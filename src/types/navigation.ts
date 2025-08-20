/**
 * Navigation Types
 * TypeScript definitions for Expo Router navigation
 */

export type RootStackParamList = {
    "(app)": undefined;
    "(auth)": undefined;
    "+not-found": undefined;
};

export type AppTabsParamList = {
    "(tabs)": undefined;
    "matches": undefined;
    "teams": undefined;
    "players": undefined;
    "profile": undefined;
};

export type MatchesStackParamList = {
    "index": undefined;
    "[id]": { id: string };
    "create": undefined;
    "edit": { id: string };
};

export type TeamsStackParamList = {
    "index": undefined;
    "[id]": { id: string };
    "create": undefined;
    "edit": { id: string };
};

export type PlayersStackParamList = {
    "index": undefined;
    "[id]": { id: string };
    "create": undefined;
    "edit": { id: string };
};

export type ProfileStackParamList = {
    "index": undefined;
    "settings": undefined;
    "edit": undefined;
    "followed-teams": undefined;
    "notifications": undefined;
};

export type AdminStackParamList = {
    "index": undefined;
    "matches": undefined;
    "tournaments": undefined;
    "fields": undefined;
    "users": undefined;
};

export type AuthStackParamList = {
    "sign-in": undefined;
    "sign-up": undefined;
    "forgot-password": undefined;
    "reset-password": { token: string };
};

// Screen component props types
export interface ScreenProps<T extends Record<string, any> = {}> {
    params?: T;
}
