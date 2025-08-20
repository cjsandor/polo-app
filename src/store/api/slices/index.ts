/**
 * API Slices Index
 * Re-exports all API slices and their hooks for easy importing
 */

// Export all the API slice hooks
export * from "./matchesApi";
export * from "./teamsApi";
export * from "./playersApi";
export * from "./matchEventsApi";
export * from "./tournamentsApi";
export * from "./fieldsApi";
export * from "./profilesApi";

// Export the main API slice
export { api } from "../index";
