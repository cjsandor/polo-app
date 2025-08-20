/**
 * Supabase Base Query for RTK Query
 * Custom base query that integrates Supabase with RTK Query
 */

import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { supabase } from "../../services/supabase";
import { AuthErrors } from "../../utils/auth";
import { API } from "../../config/constants";

// Define the base query argument and result types
export interface SupabaseQueryArgs {
    table?: string;
    method: "select" | "insert" | "update" | "delete" | "upsert" | "rpc";
    query?: (builder: any) => any;
    data?: any;
    count?: "exact" | "planned" | "estimated";
    returning?: "minimal" | "representation";
    rpcName?: string;
    rpcParams?: any;
}

export interface SupabaseQueryResult<T = unknown> {
    data?: T;
    error?: {
        message: string;
        details?: string;
        hint?: string;
        code?: string;
    };
    count?: number;
    status?: number;
}

// Create the base query function
export const supabaseBaseQuery: BaseQueryFn<
    SupabaseQueryArgs,
    unknown,
    { message: string; status?: number }
> = async (args) => {
    try {
        const {
            table,
            method,
            query,
            data,
            count,
            returning,
            rpcName,
            rpcParams,
        } = args;

        let result: any;
        let queryBuilder: any;

        // Handle different query methods
        switch (method) {
            case "select":
                if (!table) {
                    throw new Error("Table is required for select queries");
                }
                queryBuilder = supabase.from(table).select("*", { count });

                if (query) {
                    queryBuilder = query(queryBuilder);
                }

                result = await queryBuilder;
                break;

            case "insert":
                if (!table || !data) {
                    throw new Error("Table and data are required for insert");
                }
                queryBuilder = supabase.from(table).insert(data);

                if (returning) {
                    queryBuilder = queryBuilder.select();
                }

                result = await queryBuilder;
                break;

            case "update":
                if (!table || !data) {
                    throw new Error("Table and data are required for update");
                }
                queryBuilder = supabase.from(table).update(data);

                if (query) {
                    queryBuilder = query(queryBuilder);
                }

                if (returning !== "minimal") {
                    queryBuilder = queryBuilder.select();
                }

                result = await queryBuilder;
                break;

            case "delete":
                if (!table) throw new Error("Table is required for delete");
                queryBuilder = supabase.from(table).delete();

                if (query) {
                    queryBuilder = query(queryBuilder);
                }

                if (returning !== "minimal") {
                    queryBuilder = queryBuilder.select();
                }

                result = await queryBuilder;
                break;

            case "upsert":
                if (!table || !data) {
                    throw new Error("Table and data are required for upsert");
                }
                queryBuilder = supabase.from(table).upsert(data);

                if (returning !== "minimal") {
                    queryBuilder = queryBuilder.select();
                }

                result = await queryBuilder;
                break;

            case "rpc":
                if (!rpcName) {
                    throw new Error("RPC name is required for RPC calls");
                }
                result = await supabase.rpc(rpcName, rpcParams || {});
                break;

            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        // Handle Supabase errors
        if (result.error) {
            console.error("Supabase query error:", result.error);

            // Parse common errors
            const errorMessage = AuthErrors.parseAuthError(result.error);
            const statusCode = getStatusCodeFromError(result.error);

            return {
                error: {
                    message: errorMessage,
                    status: statusCode,
                },
            };
        }

        // Return successful result
        return {
            data: {
                data: result.data,
                count: result.count,
                status: result.status,
            } as SupabaseQueryResult,
        };
    } catch (error) {
        console.error("Base query error:", error);

        // Handle network and other errors
        const message = error instanceof Error
            ? error.message
            : "Unknown error occurred";
        const isNetworkError = message.includes("fetch") ||
            message.includes("network");

        return {
            error: {
                message: isNetworkError ? "Network connection error" : message,
                status: isNetworkError ? 0 : 500,
            },
        };
    }
};

// Helper function to extract status codes from Supabase errors
function getStatusCodeFromError(error: any): number {
    if (!error) return 500;

    // Map common Supabase error codes to HTTP status codes
    switch (error.code) {
        case "PGRST116": // Not found
            return 404;
        case "23505": // Unique violation
            return 409;
        case "23503": // Foreign key violation
            return 400;
        case "23502": // Not null violation
            return 400;
        case "42501": // Insufficient privilege (RLS)
            return 403;
        case "08006": // Connection failure
        case "08000": // Connection exception
            return 503;
        case "57014": // Query canceled
            return 408;
        default:
            return 500;
    }
}

// Utility function to create optimistic updates
export const createOptimisticUpdate = <T>(
    endpoint: string,
    args: any,
    updateData: T,
) => {
    return {
        type: `${endpoint}/queryFulfilled`,
        meta: {
            arg: args,
            requestId: Date.now().toString(),
            requestStatus: "fulfilled",
        },
        payload: updateData,
    };
};

// Retry configuration for failed queries
export const retryCondition = (error: any, args: any, extraOptions: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error.status && error.status >= 400 && error.status < 500) {
        return false;
    }

    // Retry on network errors and 5xx errors
    return error.status === 0 || (error.status >= 500 && error.status < 600);
};

// Default retry delay with exponential backoff
export const retryDelay = (
    attempt: number,
    error: any,
    baseDelay = API.RETRY_DELAY_MS,
) => {
    // Exponential backoff: baseDelay * (2 ^ attempt) + random jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Random jitter up to 1 second

    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
};
