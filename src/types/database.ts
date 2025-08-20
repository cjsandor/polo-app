/**
 * Database Type Definitions
 * Generated from Supabase schema with additional utility types
 */

// Enum types from database
export type MatchStatus =
    | "scheduled"
    | "live"
    | "completed"
    | "cancelled"
    | "postponed"
    | "abandoned";

export type EventType =
    | "goal"
    | "own_goal"
    | "penalty_goal"
    | "foul"
    | "substitution"
    | "knock_in"
    | "throw_in"
    | "timeout"
    | "injury"
    | "chukker_start"
    | "chukker_end"
    | "yellow_card"
    | "red_card";

export type UserRole = "admin" | "viewer";
export type TeamAdminRole = "manager" | "scorekeeper";
export type Platform = "ios" | "android";

// Database table interfaces
export interface Profile {
    id: string;
    role: UserRole;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
}

export interface Field {
    id: string;
    name: string;
    club?: string;
    location?: string;
    created_at: string;
}

export interface Team {
    id: string;
    name: string;
    logo_url?: string;
    home_field_id?: string;
    created_at: string;
    // Relations
    home_field?: Field;
    players?: Player[];
}

export interface Player {
    id: string;
    name: string;
    team_id?: string;
    position?: number; // 1-4
    handicap?: number; // -2 to 10
    jersey_number?: number; // 0-99
    photo_url?: string;
    created_at: string;
    // Relations
    team?: Team;
}

export interface Tournament {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    location?: string;
    created_at: string;
    // Relations
    matches?: Match[];
}

export interface Match {
    id: string;
    tournament_id?: string;
    home_team_id: string;
    away_team_id: string;
    scheduled_time: string;
    status: MatchStatus;
    field_id?: string;
    home_score: number;
    away_score: number;
    current_chukker: number; // 0-8
    total_chukkers: number; // 4, 6, or 8
    overtime: boolean;
    home_handicap_goals: number;
    away_handicap_goals: number;
    created_at: string;
    updated_at: string;
    // Relations
    tournament?: Tournament;
    home_team?: Team;
    away_team?: Team;
    field?: Field;
    match_lineups?: MatchLineup[];
    match_events?: MatchEvent[];
}

export interface MatchLineup {
    match_id: string;
    team_id: string;
    player_id: string;
    position?: number; // 1-4
    starter: boolean;
    // Relations
    team?: Team;
    player?: Player;
}

export interface MatchEvent {
    id: string;
    match_id: string;
    event_type: EventType;
    team_id?: string;
    player_id?: string;
    chukker: number; // 1-8
    occurred_at: string;
    inserted_at: string;
    details?: any; // jsonb
    sequence?: number;
    created_by?: string;
    // Relations
    team?: Team;
    player?: Player;
}

export interface TeamAdmin {
    user_id: string;
    team_id: string;
    role: TeamAdminRole;
    // Relations
    team?: Team;
}

export interface PushToken {
    user_id: string;
    expo_token: string;
    platform?: Platform;
    created_at: string;
}

export interface Follow {
    user_id: string;
    team_id: string;
    created_at: string;
    // Relations
    team?: Team;
}

// Composite types for API responses
export interface MatchWithDetails extends Match {
    home_team: Team;
    away_team: Team;
    field?: Field;
    tournament?: Tournament;
    match_lineups: (MatchLineup & {
        team: Team;
        player: Player;
    })[];
    match_events: (MatchEvent & {
        team?: Team;
        player?: Player;
    })[];
}

export interface TeamWithDetails extends Team {
    home_field?: Field;
    players: Player[];
    recent_matches?: Match[];
    followers_count?: number;
}

export interface PlayerWithDetails extends Player {
    team?: Team;
    recent_matches?: Match[];
    season_stats?: {
        goals: number;
        matches_played: number;
        average_handicap: number;
    };
}

export interface TournamentWithDetails extends Tournament {
    matches: (Match & {
        home_team: Team;
        away_team: Team;
    })[];
    teams?: Team[];
}

// Utility types
export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface RealtimePayload<T = any> {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: T | null;
    old: T | null;
    table: string;
    schema: string;
}

// Search types
export interface SearchResult<T> {
    item: T;
    score: number;
    matches: Array<{
        indices: [number, number][];
        value: string;
        key: string;
    }>;
}

// Form types for creating/updating records
export interface CreateTeamData {
    name: string;
    logo_url?: string;
    home_field_id?: string;
}

export interface UpdateTeamData extends Partial<CreateTeamData> {}

export interface CreatePlayerData {
    name: string;
    team_id?: string;
    position?: number;
    handicap?: number;
    jersey_number?: number;
    photo_url?: string;
}

export interface UpdatePlayerData extends Partial<CreatePlayerData> {}

export interface CreateMatchData {
    tournament_id?: string;
    home_team_id: string;
    away_team_id: string;
    scheduled_time: string;
    field_id?: string;
    total_chukkers: number;
    home_handicap_goals?: number;
    away_handicap_goals?: number;
}

export interface UpdateMatchData extends Partial<CreateMatchData> {
    status?: MatchStatus;
    home_score?: number;
    away_score?: number;
    current_chukker?: number;
    overtime?: boolean;
}

export interface CreateMatchEventData {
    match_id: string;
    event_type: EventType;
    team_id?: string;
    player_id?: string;
    chukker: number;
    occurred_at?: string;
    details?: any;
}

export interface CreateTournamentData {
    name: string;
    start_date: string;
    end_date: string;
    location?: string;
}

export interface UpdateTournamentData extends Partial<CreateTournamentData> {}

export interface CreateFieldData {
    name: string;
    club?: string;
    location?: string;
}

export interface UpdateFieldData extends Partial<CreateFieldData> {}

// Additional enhanced types for API responses
export interface MatchWithDetails extends Match {
    home_team: Team;
    away_team: Team;
    field?: Field;
    tournament?: Tournament;
    match_lineups: MatchLineup[];
    match_events: MatchEvent[];
}

export interface TeamWithDetails extends Team {
    home_field?: Field;
    players: Player[];
}

export interface PlayerWithDetails extends Player {
    team?: Team;
}

export interface TournamentWithDetails extends Tournament {
    matches: Array<
        Match & {
            home_team: Team;
            away_team: Team;
        }
    >;
}

export interface CreateMatchEventData {
    match_id: string;
    event_type: EventType;
    chukker: number;
    team_id?: string;
    player_id?: string;
    occurred_at?: string;
    details?: Record<string, any>;
}

// Database type for Supabase client
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, "id" | "created_at"> & {
                    id: string;
                };
                Update: Partial<Omit<Profile, "id" | "created_at">>;
            };
            fields: {
                Row: Field;
                Insert: Omit<Field, "id" | "created_at">;
                Update: Partial<Omit<Field, "id" | "created_at">>;
            };
            teams: {
                Row: Team;
                Insert: Omit<Team, "id" | "created_at">;
                Update: Partial<Omit<Team, "id" | "created_at">>;
            };
            players: {
                Row: Player;
                Insert: Omit<Player, "id" | "created_at">;
                Update: Partial<Omit<Player, "id" | "created_at">>;
            };
            tournaments: {
                Row: Tournament;
                Insert: Omit<Tournament, "id" | "created_at">;
                Update: Partial<Omit<Tournament, "id" | "created_at">>;
            };
            matches: {
                Row: Match;
                Insert: Omit<Match, "id" | "created_at" | "updated_at">;
                Update: Partial<
                    Omit<Match, "id" | "created_at" | "updated_at">
                >;
            };
            match_lineups: {
                Row: MatchLineup;
                Insert: MatchLineup;
                Update: Partial<MatchLineup>;
            };
            match_events: {
                Row: MatchEvent;
                Insert: Omit<
                    MatchEvent,
                    "id" | "inserted_at" | "sequence" | "created_by"
                >;
                Update: Partial<
                    Omit<
                        MatchEvent,
                        "id" | "inserted_at" | "sequence" | "created_by"
                    >
                >;
            };
            team_admins: {
                Row: TeamAdmin;
                Insert: TeamAdmin;
                Update: Partial<TeamAdmin>;
            };
            push_tokens: {
                Row: PushToken;
                Insert: Omit<PushToken, "created_at">;
                Update: Partial<Omit<PushToken, "created_at">>;
            };
            follows: {
                Row: Follow;
                Insert: Omit<Follow, "created_at">;
                Update: Partial<Omit<Follow, "created_at">>;
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            is_admin: {
                Args: { uid: string };
                Returns: boolean;
            };
        };
        Enums: {
            match_status: MatchStatus;
            event_type: EventType;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
