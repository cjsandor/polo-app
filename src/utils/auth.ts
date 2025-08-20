/**
 * Authentication Utilities
 * Helper functions for authentication flow and validation
 */

import { supabase } from "../services/supabase";
import { ERROR_MESSAGES, VALIDATION } from "../config/constants";
import type { Profile, UserRole } from "../types/database";

// Validation utilities
export const AuthValidation = {
    /**
     * Validate email format
     */
    validateEmail: (email: string): boolean => {
        return VALIDATION.EMAIL_REGEX.test(email.trim());
    },

    /**
     * Validate password strength
     */
    validatePassword: (
        password: string,
    ): { valid: boolean; message?: string } => {
        if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
            return {
                valid: false,
                message:
                    `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
            };
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return {
                valid: false,
                message: "Password must contain at least one uppercase letter",
            };
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return {
                valid: false,
                message: "Password must contain at least one lowercase letter",
            };
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return {
                valid: false,
                message: "Password must contain at least one number",
            };
        }

        return { valid: true };
    },

    /**
     * Validate full name
     */
    validateFullName: (name: string): boolean => {
        return name.trim().length >= 2;
    },

    /**
     * Validate registration form
     */
    validateRegistration: (data: {
        email: string;
        password: string;
        confirmPassword: string;
        fullName?: string;
    }) => {
        const errors: string[] = [];

        if (!AuthValidation.validateEmail(data.email)) {
            errors.push("Please enter a valid email address");
        }

        const passwordValidation = AuthValidation.validatePassword(
            data.password,
        );
        if (!passwordValidation.valid) {
            errors.push(passwordValidation.message!);
        }

        if (data.password !== data.confirmPassword) {
            errors.push("Passwords do not match");
        }

        if (data.fullName && !AuthValidation.validateFullName(data.fullName)) {
            errors.push("Full name must be at least 2 characters long");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },
};

// Session management utilities
export const SessionManager = {
    /**
     * Check if session is valid and not expired
     */
    isSessionValid: (session: any): boolean => {
        if (!session || !session.access_token) {
            return false;
        }

        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        return session.expires_at ? session.expires_at > now : true;
    },

    /**
     * Refresh session if needed
     */
    refreshSessionIfNeeded: async () => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                return { session: null, refreshed: false };
            }

            // If session is close to expiring (within 5 minutes), refresh it
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = session.expires_at || 0;
            const timeUntilExpiry = expiresAt - now;

            if (timeUntilExpiry < 300) {
                // Less than 5 minutes
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                    console.error("Session refresh error:", error);
                    return { session: null, refreshed: false, error };
                }
                return { session: data.session, refreshed: true };
            }

            return { session, refreshed: false };
        } catch (error) {
            console.error("Session refresh check error:", error);
            return { session: null, refreshed: false, error };
        }
    },

    /**
     * Get session info for debugging
     */
    getSessionInfo: async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return null;
        }

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        const timeUntilExpiry = expiresAt - now;

        return {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: new Date(expiresAt * 1000).toISOString(),
            timeUntilExpiry: `${Math.floor(timeUntilExpiry / 60)} minutes`,
            isValid: SessionManager.isSessionValid(session),
        };
    },
};

// Profile utilities
export const ProfileManager = {
    /**
     * Create or update user profile
     */
    upsertProfile: async (
        userId: string,
        data: {
            full_name?: string;
            avatar_url?: string;
            role?: UserRole;
        },
    ) => {
        try {
            const { data: profile, error } = await supabase
                .from("profiles")
                .upsert(
                    {
                        id: userId,
                        ...data,
                    },
                    { onConflict: "id" },
                )
                .select()
                .single();

            if (error) throw error;
            return { profile, error: null };
        } catch (error) {
            console.error("Profile upsert error:", error);
            return {
                profile: null,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    },

    /**
     * Get user profile with fallback
     */
    getProfileWithFallback: async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                // If profile doesn't exist, try to get user data and create profile
                if (error.code === "PGRST116") {
                    const {
                        data: { user },
                    } = await supabase.auth.getUser();

                    if (user) {
                        const fallbackProfile = {
                            id: userId,
                            role: "viewer" as UserRole,
                            full_name: user.user_metadata?.full_name ||
                                user.email?.split("@")[0] ||
                                "Unknown User",
                            avatar_url: user.user_metadata?.avatar_url,
                        };

                        const { profile } = await ProfileManager.upsertProfile(
                            userId,
                            fallbackProfile,
                        );

                        return profile;
                    }
                }
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Get profile with fallback error:", error);
            return null;
        }
    },

    /**
     * Update avatar URL
     */
    updateAvatar: async (userId: string, avatarUrl: string) => {
        return ProfileManager.upsertProfile(userId, { avatar_url: avatarUrl });
    },

    /**
     * Update display name
     */
    updateDisplayName: async (userId: string, fullName: string) => {
        return ProfileManager.upsertProfile(userId, { full_name: fullName });
    },
};

// Error handling utilities
export const AuthErrors = {
    /**
     * Parse Supabase auth error and return user-friendly message
     */
    parseAuthError: (error: any): string => {
        if (!error) return "An unknown error occurred";

        const message = error.message || error.error_description || "";

        // Common error cases
        switch (error.code || message) {
            case "email_not_confirmed":
                return "Please check your email and click the confirmation link";

            case "invalid_credentials":
                return "Invalid email or password. Please try again.";

            case "email_already_exists":
            case "user_already_exists":
                return "An account with this email already exists";

            case "weak_password":
                return "Password is too weak. Please choose a stronger password.";

            case "rate_limit":
                return "Too many attempts. Please wait a moment and try again.";

            case "network_error":
                return ERROR_MESSAGES.NETWORK_ERROR;

            case "server_error":
                return ERROR_MESSAGES.SERVER_ERROR;

            default:
                // Check for specific message patterns
                if (message.includes("Password")) {
                    return "Please check your password and try again";
                }
                if (message.includes("Email")) {
                    return "Please check your email address and try again";
                }
                if (message.includes("network")) {
                    return ERROR_MESSAGES.NETWORK_ERROR;
                }

                // Fallback to original message or generic error
                return message || "An error occurred during authentication";
        }
    },

    /**
     * Check if error requires user action
     */
    requiresUserAction: (error: any): boolean => {
        const message = error?.message || "";
        const actionRequired = [
            "email_not_confirmed",
            "invalid_credentials",
            "weak_password",
        ];

        return actionRequired.includes(error?.code) ||
            message.includes("confirm");
    },
};

// Auth state utilities
export const AuthState = {
    /**
     * Check if user is authenticated
     */
    isAuthenticated: async (): Promise<boolean> => {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            return SessionManager.isSessionValid(session);
        } catch {
            return false;
        }
    },

    /**
     * Wait for auth to be ready
     */
    waitForAuth: (timeout = 5000): Promise<boolean> => {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => resolve(false), timeout);

            const checkAuth = async () => {
                const isAuth = await AuthState.isAuthenticated();
                if (isAuth) {
                    clearTimeout(timeoutId);
                    resolve(true);
                } else {
                    setTimeout(checkAuth, 100);
                }
            };

            checkAuth();
        });
    },

    /**
     * Get current auth status info
     */
    getAuthStatus: async () => {
        try {
            const [{ session }, sessionInfo] = await Promise.all([
                supabase.auth.getSession(),
                SessionManager.getSessionInfo(),
            ]);

            return {
                isAuthenticated: SessionManager.isSessionValid(session),
                session: sessionInfo,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                isAuthenticated: false,
                session: null,
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    },
};
