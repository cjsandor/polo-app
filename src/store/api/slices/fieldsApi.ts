/**
 * Fields API Slice
 * RTK Query endpoints for field/venue-related operations
 */

import { api } from "../index";
import type {
    CreateFieldData,
    Field,
    UpdateFieldData,
} from "../../types/database";

export const fieldsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all fields
        getFields: builder.query<Field[], void>({
            query: () => ({
                method: "select",
                table: "fields",
                query: (builder) => builder.order("name", { ascending: true }),
            }),
            providesTags: ["Field"],
            transformResponse: (response: any) => response.data,
        }),

        // Get field by ID
        getFieldById: builder.query<Field, string>({
            query: (id) => ({
                method: "select",
                table: "fields",
                query: (builder) => builder.eq("id", id).single(),
            }),
            providesTags: (result, error, id) => [{ type: "Field", id }],
            transformResponse: (response: any) => response.data,
        }),

        // Get fields by club
        getFieldsByClub: builder.query<Field[], string>({
            query: (club) => ({
                method: "select",
                table: "fields",
                query: (builder) =>
                    builder
                        .ilike("club", `%${club}%`)
                        .order("name", { ascending: true }),
            }),
            providesTags: (result, error, club) => [
                { type: "Field", id: `club-${club}` },
                "Field",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Search fields by name or location
        searchFields: builder.query<Field[], string>({
            query: (searchTerm) => ({
                method: "select",
                table: "fields",
                query: (builder) =>
                    builder
                        .or(
                            `name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`,
                        )
                        .order("name", { ascending: true }),
            }),
            providesTags: (result, error, searchTerm) => [
                { type: "Field", id: `search-${searchTerm}` },
                "Field",
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get fields with upcoming matches
        getFieldsWithUpcomingMatches: builder.query<
            Array<Field & { upcoming_matches_count: number }>,
            void
        >({
            query: () => {
                const today = new Date().toISOString().split("T")[0];
                const nextMonth =
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0];

                return {
                    method: "select",
                    table: "fields",
                    query: (builder) =>
                        builder
                            .select(`
                                *,
                                matches!inner(count)
                            `)
                            .eq("matches.status", "scheduled")
                            .gte("matches.scheduled_time", today)
                            .lte("matches.scheduled_time", nextMonth)
                            .order("name", { ascending: true }),
                };
            },
            providesTags: [{ type: "Field", id: "with-matches" }, "Field"],
            transformResponse: (response: any) => response.data,
        }),

        // Create new field
        createField: builder.mutation<Field, CreateFieldData>({
            query: (fieldData) => ({
                method: "insert",
                table: "fields",
                data: fieldData,
                returning: "representation",
            }),
            invalidatesTags: ["Field"],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Update field
        updateField: builder.mutation<
            Field,
            { id: string; updates: UpdateFieldData }
        >({
            query: ({ id, updates }) => ({
                method: "update",
                table: "fields",
                data: updates,
                query: (builder) => builder.eq("id", id),
                returning: "representation",
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Field", id },
                "Field",
            ],
            transformResponse: (response: any) => response.data?.[0],
        }),

        // Delete field
        deleteField: builder.mutation<void, string>({
            query: (id) => ({
                method: "delete",
                table: "fields",
                query: (builder) => builder.eq("id", id),
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Field", id },
                "Field",
            ],
        }),

        // Get field usage statistics
        getFieldStats: builder.query<
            {
                total_matches: number;
                matches_this_month: number;
                matches_next_month: number;
                most_active_day: string;
                average_matches_per_week: number;
                top_teams: Array<{
                    team_name: string;
                    matches_count: number;
                }>;
            },
            string
        >({
            query: (fieldId) => ({
                method: "rpc",
                rpcName: "get_field_stats",
                rpcParams: { field_id: fieldId },
            }),
            providesTags: (result, error, fieldId) => [
                { type: "Field", id: `stats-${fieldId}` },
            ],
            transformResponse: (response: any) => response.data,
        }),

        // Get field availability
        getFieldAvailability: builder.query<
            Array<{
                date: string;
                available_slots: string[];
                booked_slots: Array<{
                    time: string;
                    match_id: string;
                    teams: string;
                }>;
            }>,
            { fieldId: string; startDate: string; endDate: string }
        >({
            query: ({ fieldId, startDate, endDate }) => ({
                method: "rpc",
                rpcName: "get_field_availability",
                rpcParams: {
                    field_id: fieldId,
                    start_date: startDate,
                    end_date: endDate,
                },
            }),
            providesTags: (result, error, { fieldId, startDate, endDate }) => [
                {
                    type: "Field",
                    id: `availability-${fieldId}-${startDate}-${endDate}`,
                },
            ],
            transformResponse: (response: any) => response.data,
        }),
    }),
});

export const {
    useGetFieldsQuery,
    useGetFieldByIdQuery,
    useGetFieldsByClubQuery,
    useSearchFieldsQuery,
    useGetFieldsWithUpcomingMatchesQuery,
    useCreateFieldMutation,
    useUpdateFieldMutation,
    useDeleteFieldMutation,
    useGetFieldStatsQuery,
    useGetFieldAvailabilityQuery,
} = fieldsApi;
