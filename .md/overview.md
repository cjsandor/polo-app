## Overview

Polo App is a React Native mobile application built with Expo for managing and following matches, teams, and players, with realtime updates and basic admin tooling.

- **Core features**:
  - Authentication (sign in) and profile
  - Browse matches, teams, players; view details
  - Realtime match updates and live events
  - Admin dashboard for editing matches and logging events
  - Push notifications (planned/configurable)

- **Tech stack**:
  - Expo SDK (managed), React, React Native
  - Expo Router for filebased navigation (pp/)
  - Redux Toolkit + React Redux for state management
  - Supabase (@supabase/supabase-js) for data, auth, and realtime
  - Utilities: Day.js, Zod; common RN libraries (gesture-handler, reanimated, etc.)

- **Highlevel architecture**:
  - Routes in pp/ using Expo Router with groups:
    - (auth): sign-in
    - (app): tabs for matches, 	eams, players, profile
    - Detail routes: matches/[id], 	eams/[id], players/[id]
    - (admin): index (dashboard), edit-match, log-event
  - Shared modules in src/:
    - components/, hooks/, services/, store/, 	ypes/, utils/
    - Store uses Redux Toolkit slices (uth, ui, live) and API layer under store/api/*
    - services/ contains supabase client init, ealtime helpers, and 
otifications

- **Data flow**:
  - Read/write via API layer (store/api/*) and Supabase client
  - Global app state in Redux slices; UI/local state kept in components/hooks
  - Realtime: Supabase channels push match/event updates into store (liveSlice)

- **Navigation**:
  - Filebased routes in pp/ replace custom navigators and linking
  - Tabs defined under pp/(app)/(tabs); stacks via _layout.tsx

- **Conventions**:
  - Shared code imports use @/ alias (maps to src/)
  - Types live in src/types; errors, dates, constants in src/utils
  - Assets (icons/splash) remain in root ssets/ for Expo tooling

- **Running**:
  - 
pm run start to launch the Metro bundler
  - If using Expo Router entry point, index.js should import expo-router/entry

- **Notes**:
  - Ensure abel.config.js includes expo-router/babel and module-resolver alias for @
  - Configure push notifications credentials in Expo and Supabase policies/migrations as needed