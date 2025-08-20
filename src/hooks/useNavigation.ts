/**
 * Navigation Hooks
 * Custom hooks for navigation state and utilities
 */

import { useEffect } from "react";
import { useGlobalSearchParams, usePathname } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setActiveTab } from "../store/slices/uiSlice";
import { setLastActiveTab } from "../store/slices/preferencesSlice";
import { navigation, setupDeepLinking } from "../utils/navigation";

/**
 * Hook to track current route and update Redux state
 */
export const useNavigationState = () => {
    const pathname = usePathname();
    const params = useGlobalSearchParams();
    const dispatch = useAppDispatch();

    // Update active tab based on pathname
    useEffect(() => {
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length > 0) {
            const tabName = segments[segments.length - 1];
            if (
                ["matches", "teams", "players", "profile", "admin"].includes(
                    tabName,
                )
            ) {
                dispatch(setActiveTab(tabName));
                dispatch(setLastActiveTab(tabName));
            }
        }
    }, [pathname, dispatch]);

    return {
        pathname,
        params,
    };
};

/**
 * Hook to set up deep linking
 */
export const useDeepLinking = () => {
    useEffect(() => {
        const cleanup = setupDeepLinking();
        return cleanup;
    }, []);
};

/**
 * Hook for navigation utilities with Redux integration
 */
export const useAppNavigation = () => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector((state) => state.ui.activeTab);

    const goToMatch = (matchId: string) => {
        navigation.goToMatch(matchId);
        dispatch(setActiveTab("matches"));
    };

    const goToTeam = (teamId: string) => {
        navigation.goToTeam(teamId);
        dispatch(setActiveTab("teams"));
    };

    const goToPlayer = (playerId: string) => {
        navigation.goToPlayer(playerId);
        dispatch(setActiveTab("players"));
    };

    const goToTab = (tabName: string) => {
        const tabRoutes: Record<string, string> = {
            matches: "/(app)/(tabs)/matches",
            teams: "/(app)/(tabs)/teams",
            players: "/(app)/(tabs)/players",
            profile: "/(app)/(tabs)/profile",
            admin: "/(app)/(tabs)/admin",
        };

        const route = tabRoutes[tabName];
        if (route) {
            navigation.replace(route);
            dispatch(setActiveTab(tabName));
            dispatch(setLastActiveTab(tabName));
        }
    };

    return {
        activeTab,
        goToMatch,
        goToTeam,
        goToPlayer,
        goToTab,
        ...navigation,
    };
};
