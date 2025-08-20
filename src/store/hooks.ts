/**
 * Redux Typed Hooks
 * Pre-typed versions of useDispatch and useSelector
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Convenience hooks for common selectors
export const useAuth = () => useAppSelector((state) => state.auth);
export const useUI = () => useAppSelector((state) => state.ui);
export const usePreferences = () =>
    useAppSelector((state) => state.preferences);

// Auth-specific hooks
export const useUser = () => useAppSelector((state) => state.auth.user);
export const useProfile = () => useAppSelector((state) => state.auth.profile);
export const useIsAuthenticated = () =>
    useAppSelector((state) => state.auth.isAuthenticated);
export const useIsAdmin = () => useAppSelector((state) => state.auth.isAdmin);
export const useAuthLoading = () =>
    useAppSelector((state) => state.auth.loading);

// UI-specific hooks
export const useGlobalLoading = () =>
    useAppSelector((state) => state.ui.globalLoading);
export const useNotifications = () =>
    useAppSelector((state) => state.ui.notifications);
export const useModals = () => useAppSelector((state) => state.ui.modals);
export const useActiveTab = () => useAppSelector((state) => state.ui.activeTab);
export const useIsOnline = () => useAppSelector((state) => state.ui.isOnline);

// Preferences-specific hooks
export const useTheme = () =>
    useAppSelector((state) => state.preferences.display.theme);
export const useFollowedTeams = () =>
    useAppSelector((state) => state.preferences.follows.teamIds);
export const useNotificationPreferences = () =>
    useAppSelector((state) => state.preferences.notifications);

// Custom loading hook for specific states
export const useLoading = (key: string) => {
    return useAppSelector((state) => state.ui.loadingStates[key] || false);
};

// Custom refreshing hook
export const useRefreshing = (key: string) => {
    return useAppSelector((state) => state.ui.refreshingStates[key] || false);
};

// Team management hook
export const useCanManageTeam = (teamId: string) => {
    return useAppSelector((state) => {
        if (state.auth.isAdmin) return true;
        return state.auth.teamRoles.some(
            (role) =>
                role.team_id === teamId &&
                (role.role === "manager" || role.role === "scorekeeper"),
        );
    });
};

// Follow status hooks
export const useIsTeamFollowed = (teamId: string) => {
    return useAppSelector((state) =>
        state.preferences.follows.teamIds.includes(teamId)
    );
};

export const useIsPlayerFollowed = (playerId: string) => {
    return useAppSelector((state) =>
        state.preferences.follows.playerIds.includes(playerId)
    );
};
