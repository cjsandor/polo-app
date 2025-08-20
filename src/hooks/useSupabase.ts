/**
 * Supabase React Hooks
 * Custom hooks for authentication and common database operations
 */

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { auth, supabase, utils } from "../services/supabase";
import type { Profile, TeamAdmin } from "../types/database";

// Auth hooks
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { session } = await auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getInitialSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (event === "SIGNED_IN" && session?.user) {
                // Create or update profile on sign in
                const { error } = await supabase
                    .from("profiles")
                    .upsert({
                        id: session.user.id,
                        full_name: session.user.user_metadata?.full_name ||
                            session.user.email?.split("@")[0],
                    })
                    .select();

                if (error) {
                    console.error("Error creating/updating profile:", error);
                }
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        const result = await auth.signIn(email, password);
        setLoading(false);
        return result;
    };

    const signUp = async (
        email: string,
        password: string,
        metadata?: any,
    ) => {
        setLoading(true);
        const result = await auth.signUp(email, password, metadata);
        setLoading(false);
        return result;
    };

    const signOut = async () => {
        setLoading(true);
        const result = await auth.signOut();
        setLoading(false);
        return result;
    };

    const resetPassword = async (email: string) => {
        return await auth.resetPassword(email);
    };

    const updatePassword = async (password: string) => {
        return await auth.updatePassword(password);
    };

    const updateUser = async (updates: any) => {
        return await auth.updateUser(updates);
    };

    return {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateUser,
    };
};

// Profile hooks
export const useProfile = (userId?: string) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const targetUserId = userId || user?.id;

    useEffect(() => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", targetUserId)
                    .single();

                if (error) throw error;
                setProfile(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [targetUserId]);

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!targetUserId) return { error: "No user ID" };

        try {
            const { data, error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", targetUserId)
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
            return { data, error: null };
        } catch (err) {
            const error = err instanceof Error ? err.message : "Unknown error";
            return { data: null, error };
        }
    };

    return {
        profile,
        loading,
        error,
        updateProfile,
    };
};

// Admin hooks
export const useIsAdmin = (userId?: string) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const targetUserId = userId || user?.id;

    useEffect(() => {
        if (!targetUserId) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        const checkAdminStatus = async () => {
            try {
                setLoading(true);
                const result = await utils.isAdmin(targetUserId);
                setIsAdmin(result);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [targetUserId]);

    return { isAdmin, loading };
};

// Team admin hooks
export const useTeamRoles = (userId?: string) => {
    const [teamRoles, setTeamRoles] = useState<TeamAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const targetUserId = userId || user?.id;

    useEffect(() => {
        if (!targetUserId) {
            setTeamRoles([]);
            setLoading(false);
            return;
        }

        const fetchTeamRoles = async () => {
            try {
                setLoading(true);
                const roles = await utils.getUserTeamRoles(targetUserId);
                setTeamRoles(roles);
            } catch (error) {
                console.error("Error fetching team roles:", error);
                setTeamRoles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamRoles();
    }, [targetUserId]);

    const canManageTeam = async (teamId: string) => {
        return await utils.canManageTeam(teamId, targetUserId);
    };

    const getManagedTeams = () => {
        return teamRoles.filter(
            (role) => role.role === "manager" || role.role === "scorekeeper",
        );
    };

    const isTeamManager = (teamId: string) => {
        return teamRoles.some(
            (role) => role.team_id === teamId && role.role === "manager",
        );
    };

    const isTeamScorekeeper = (teamId: string) => {
        return teamRoles.some(
            (role) =>
                role.team_id === teamId &&
                (role.role === "manager" || role.role === "scorekeeper"),
        );
    };

    return {
        teamRoles,
        loading,
        canManageTeam,
        getManagedTeams,
        isTeamManager,
        isTeamScorekeeper,
    };
};

// Generic data fetching hook
export const useSupabaseQuery = <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    dependencies: any[] = [],
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await queryFn();

            if (result.error) {
                throw new Error(result.error.message || "Query failed");
            }

            setData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return {
        data,
        loading,
        error,
        refetch,
    };
};

// Session persistence hook
export const useSessionPersistence = () => {
    const [isRestoring, setIsRestoring] = useState(true);
    const { session } = useAuth();

    useEffect(() => {
        // Session restoration is handled automatically by Supabase
        // This hook just tracks the restoration state
        const timer = setTimeout(() => {
            setIsRestoring(false);
        }, 1000); // Give it 1 second to restore session

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (session !== null) {
            setIsRestoring(false);
        }
    }, [session]);

    return { isRestoring };
};
