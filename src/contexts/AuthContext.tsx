/**
 * Authentication Context Provider
 * Provides auth state and methods throughout the app
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import type { Profile } from "../types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signOut: () => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === "PGRST116") {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              full_name:
                user?.user_metadata?.full_name ||
                user?.email?.split("@")[0] ||
                "Unknown User",
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating profile:", createError);
            return null;
          }
          return newProfile;
        }
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
  };

  // Check admin status
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase.rpc("is_admin", { uid: userId });
      return data || false;
    } catch (error) {
      console.error("Admin check error:", error);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile and admin status
          const [profileData, adminStatus] = await Promise.all([
            fetchProfile(session.user.id),
            checkAdminStatus(session.user.id),
          ]);

          setProfile(profileData);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error("Initial session error:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile and admin status
          const [profileData, adminStatus] = await Promise.all([
            fetchProfile(session.user.id),
            checkAdminStatus(session.user.id),
          ]);

          setProfile(profileData);
          setIsAdmin(adminStatus);
        } else {
          // Clear profile and admin status on sign out
          setProfile(null);
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener.subscription?.unsubscribe?.();
    };
  }, []);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Sign in exception:", error);
      return {
        data: null,
        error: { message: "An unexpected error occurred" },
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Sign up exception:", error);
      return {
        data: null,
        error: { message: "An unexpected error occurred" },
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return { error };
      }

      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);

      return { error: null };
    } catch (error) {
      console.error("Sign out exception:", error);
      return { error: { message: "An unexpected error occurred" } };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;

    const [profileData, adminStatus] = await Promise.all([
      fetchProfile(user.id),
      checkAdminStatus(user.id),
    ]);

    setProfile(profileData);
    setIsAdmin(adminStatus);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

// Auth guard component
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
  requireAuth = true,
  requireAdmin = false,
}: AuthGuardProps) => {
  const { loading, isAuthenticated, isAdmin } = useAuthContext();

  if (loading) {
    return <>{fallback}</>;
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requireAdmin && !isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
