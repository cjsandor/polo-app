# Polo App Setup Guide

## ⚠️ IMPORTANT: Players Not Loading Issue

The players (and other data) are not loading because the app is missing Supabase configuration. Follow these steps to fix it:

## Quick Fix

### 1. Create `.env.local` file
Create a new file called `.env.local` in the root of your project with the following content:

```env
# Your Supabase project URL
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key (NOT the service_role key!)
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
```

### 2. Get your Supabase credentials

#### Option A: Use existing Supabase project
1. Go to [Supabase Dashboard](https://app.supabase.com/projects)
2. Select your project (or create a new one)
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → paste as `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → paste as `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   
   ⚠️ **IMPORTANT**: Use the **anon** key, NOT the **service_role** key!

#### Option B: Create new Supabase project
1. Go to [Supabase](https://app.supabase.com)
2. Create a new project
3. Run the migrations from `supabase/migrations/` folder to set up the database
4. Get your credentials as described in Option A

### 3. Restart the development server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
# or
npx expo start --web
```

### 4. Verify it's working
1. Open the browser console (F12)
2. Navigate to the Players screen
3. You should see debug logs like:
   - `🔍 Base Query Called: { table: "players", method: "select" }`
   - `✅ Select result: { hasData: true, dataLength: X }`

## Database Setup (if using new Supabase project)

If you created a new Supabase project, you need to set up the database:

### Run migrations
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
npx supabase link --project-ref your-project-id

# Run migrations
npx supabase db push
```

### Or manually run SQL
1. Go to your Supabase project SQL Editor
2. Run each migration file from `supabase/migrations/` in order:
   - `000_init.sql`
   - `001_seed_initial_data.sql`
   - `002_migrate_match_data_improved.sql`
   - `003_add_chukker_scores_optional.sql`

## Troubleshooting

### Data still not loading?
1. **Check credentials**: Make sure you're using the **anon** key, not the service_role key
2. **Check RLS**: In Supabase, check if Row Level Security is enabled and configured properly
3. **Check console**: Look for error messages in the browser console
4. **Debug mode**: The app is currently using `baseQuery-debug.ts` which logs all API calls

### Common issues:
- **"Missing required Supabase configuration"**: `.env.local` file is missing or empty
- **403 Forbidden errors**: Using wrong key or RLS policies blocking access
- **Network errors**: Check if Supabase project is active and accessible

## Security Notes

- **Never commit `.env.local` to git** (it's already in .gitignore)
- **Never use service_role key in client apps** - it bypasses all security
- **Always use the anon/public key** for client-side applications

## Next Steps

Once data is loading:
1. The Players screen should show the list of players
2. Teams screen should show teams
3. Admin functions should work for creating matches, players, etc.

## Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your Supabase project is active
3. Make sure all migrations have been run
4. Check that RLS policies allow read access for the anon role
