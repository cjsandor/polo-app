/**
 * Supabase Base Query for RTK Query - Debug Version
 * Custom base query that integrates Supabase with RTK Query with added debugging
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
    count?: number | null;
    status?: number;
    statusText?: string;
}

export interface SupabaseQueryError {
    message: string;
    status?: number;
}

// Create the base query function with debugging
export const supabaseBaseQuery: BaseQueryFn<
    SupabaseQueryArgs,
    unknown,
    { message: string; status?: number }
> = async (args) => {
    console.log("🔍 Base Query Called:", {
        table: args.table,
        method: args.method,
        rpcName: args.rpcName,
    });

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
                console.log(`📊 Selecting from table: ${table}`);
                queryBuilder = supabase.from(table).select("*", { count });

                if (query) {
                    queryBuilder = query(queryBuilder);
                }

                result = await queryBuilder;
                console.log(`✅ Select result:`, {
                    hasData: !!result.data,
                    dataLength: Array.isArray(result.data)
                        ? result.data.length
                        : "not array",
                    error: result.error,
                });
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
                if (!table) {
                    throw new Error("Table is required for delete queries");
                }
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
                console.log(`🔧 Calling RPC: ${rpcName}`);
                result = await supabase.rpc(rpcName, rpcParams || {});
                console.log(`✅ RPC result:`, {
                    hasData: !!result.data,
                    error: result.error,
                });
                break;

            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        // Handle Supabase errors
        if (result.error) {
            console.error("❌ Supabase query error:", result.error);

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
        console.log("✅ Query successful, returning data");
        return {
            data: {
                data: result.data,
                count: result.count,
                status: result.status,
            } as SupabaseQueryResult,
        };
    } catch (error) {
        console.error("❌ Base query error:", error);

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

    // Check for common error codes
    if (error.code === "PGRST301") return 404; // Not found
    if (error.code === "PGRST202") return 409; // Conflict
    if (error.code === "PGRST203") return 409; // Duplicate
    if (error.code === "PGRST204") return 400; // Bad request
    if (error.code === "23505") return 409; // Unique violation
    if (error.code === "23503") return 400; // Foreign key violation
    if (error.code === "42501") return 403; // Insufficient privilege
    if (error.code === "42P01") return 404; // Undefined table
    if (error.code === "42703") return 400; // Undefined column

    // Check for auth errors
    if (error.message?.includes("JWT")) return 401;
    if (error.message?.includes("unauthorized")) return 401;
    if (error.message?.includes("forbidden")) return 403;

    // Check HTTP status
    if (error.status) return error.status;
    if (error.statusCode) return error.statusCode;

    // Default to 500
    return 500;
}
