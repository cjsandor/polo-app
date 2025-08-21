/**
 * Navigation Utilities
 * Helper functions for navigation and deep linking
 */

import { router } from "expo-router";
import { Linking } from "react-native";

// Navigation helpers
export const navigation = {
    // Go to specific match
    goToMatch: (matchId: string) => {
        router.push(`/(app)/(tabs)/matches/${matchId}`);
    },

    // Go to specific team
    goToTeam: (teamId: string) => {
        router.push(`/(app)/(tabs)/teams/${teamId}`);
    },

    // Go to specific player
    goToPlayer: (playerId: string) => {
        router.push(`/(app)/(tabs)/players/${playerId}`);
    },

    // Go to create match (admin only)
    createMatch: () => {
        router.push("/(app)/(tabs)/matches/create");
    },

    // Go to edit match (admin only)
    editMatch: (matchId: string) => {
        router.push(`/(app)/(tabs)/matches/edit?id=${matchId}`);
    },

    // Go to admin dashboard
    goToAdmin: () => {
        router.push("/(app)/(admin)/");
    },

    // Authentication navigation
    goToSignIn: () => {
        router.push("/(auth)/sign-in");
    },

    goToSignUp: () => {
        router.push("/(auth)/sign-up");
    },

    // Go back
    goBack: () => {
        router.back();
    },

    // Replace current screen
    replace: (href: string) => {
        router.replace(href as any);
    },

    // Reset navigation stack
    reset: (href: string) => {
        router.dismissAll();
        router.replace(href as any);
    },
};

// Deep linking configuration
export const linking = {
    prefixes: ["polotracker://", "https://polotracker.app"],
    config: {
        screens: {
            "(app)": {
                screens: {
                    "(tabs)": {
                        screens: {
                            "matches": {
                                screens: {
                                    index: "matches",
                                    "[id]": "matches/:id",
                                    create: "matches/create",
                                    edit: "matches/edit",
                                },
                            },
                            "teams": {
                                screens: {
                                    index: "teams",
                                    "[id]": "teams/:id",
                                    create: "teams/create",
                                    edit: "teams/edit",
                                },
                            },
                            "players": {
                                screens: {
                                    index: "players",
                                    "[id]": "players/:id",
                                    create: "players/create",
                                    edit: "players/edit",
                                },
                            },
                            // Profile screens temporarily removed from tabs
                        },
                    },
                    "(admin)": {
                        screens: {
                            index: "admin",
                            matches: "admin/matches",
                            tournaments: "admin/tournaments",
                            fields: "admin/fields",
                            players: "admin/players",
                        },
                    },
                },
            },
            "(auth)": {
                screens: {
                    "sign-in": "auth/sign-in",
                    "sign-up": "auth/sign-up",
                    "forgot-password": "auth/forgot-password",
                    "reset-password": "auth/reset-password",
                },
            },
        },
    },
};

// URL handling utilities
export const urlUtils = {
    // Parse match ID from URL
    parseMatchId: (url: string): string | null => {
        const match = url.match(/matches\/([^\/\?]+)/);
        return match ? match[1] : null;
    },

    // Parse team ID from URL
    parseTeamId: (url: string): string | null => {
        const match = url.match(/teams\/([^\/\?]+)/);
        return match ? match[1] : null;
    },

    // Parse player ID from URL
    parsePlayerId: (url: string): string | null => {
        const match = url.match(/players\/([^\/\?]+)/);
        return match ? match[1] : null;
    },

    // Generate share URL for match
    getMatchShareUrl: (matchId: string): string => {
        return `https://polotracker.app/matches/${matchId}`;
    },

    // Generate share URL for team
    getTeamShareUrl: (teamId: string): string => {
        return `https://polotracker.app/teams/${teamId}`;
    },

    // Generate share URL for player
    getPlayerShareUrl: (playerId: string): string => {
        return `https://polotracker.app/players/${playerId}`;
    },

    // Handle incoming URLs
    handleUrl: async (url: string) => {
        try {
            const matchId = urlUtils.parseMatchId(url);
            const teamId = urlUtils.parseTeamId(url);
            const playerId = urlUtils.parsePlayerId(url);

            if (matchId) {
                navigation.goToMatch(matchId);
            } else if (teamId) {
                navigation.goToTeam(teamId);
            } else if (playerId) {
                navigation.goToPlayer(playerId);
            } else {
                // Handle other URLs or fallback to home
                router.replace("/(app)/(tabs)/matches");
            }
        } catch (error) {
            console.error("Error handling URL:", error);
            // Fallback to home screen
            router.replace("/(app)/(tabs)/matches");
        }
    },
};

// Listen for incoming URLs
export const setupDeepLinking = () => {
    // Handle URLs when app is already running
    const handleUrl = (event: { url: string }) => {
        urlUtils.handleUrl(event.url);
    };

    // Add event listener
    const subscription = Linking.addEventListener("url", handleUrl);

    // Handle URL when app is opened from background
    Linking.getInitialURL().then((url) => {
        if (url) {
            urlUtils.handleUrl(url);
        }
    });

    // Return cleanup function
    return () => {
        subscription?.remove();
    };
};

// Tab navigation helpers
export const tabNavigation = {
    // Get tab index from route name
    getTabIndex: (routeName: string): number => {
        const tabMap: Record<string, number> = {
            matches: 0,
            teams: 1,
            players: 2,
            admin: 3,
        };
        return tabMap[routeName] || 0;
    },

    // Get route name from tab index
    getRouteName: (index: number): string => {
        const routes = ["matches", "teams", "players", "admin"];
        return routes[index] || "matches";
    },
};
