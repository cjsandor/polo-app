# Fix Instructions for API Data Loading Issues

## Problem Identified
Your app is using a **service_role key** instead of an **anon key** for Supabase authentication. Service role keys bypass Row Level Security (RLS) and should NEVER be exposed in client applications.

## How to Fix

### Step 1: Get Your Anon Key from Supabase Dashboard
1. Go to your Supabase project: https://app.supabase.com/project/hefizkqpxfbjipbbzywu/settings/api
2. In the API Settings page, look for the **Project API keys** section
3. Copy the **anon/public** key (NOT the service_role key!)
4. The anon key should have `"role":"anon"` in its JWT payload

### Step 2: Update Your .env File
Replace the current EXPO_PUBLIC_SUPABASE_ANON_KEY with the correct anon key:

```env
# WRONG - This is a service_role key (contains "role":"service_role")
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZml6a3FweGZiamlwYmJ6eXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcwMzQ3MCwiZXhwIjoyMDcxMjc5NDcwfQ.-BaN27cuBdElGZ1qDKXMZmzMkwww8h7t_NeBBOU4Jjg

# RIGHT - Use the anon key (contains "role":"anon")
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### Step 3: Restart Your Development Server
After updating the .env file:
1. Stop the current server (Ctrl+C)
2. Run `npm start` again

### Step 4: Test the App
1. Open the app in your browser/device
2. Navigate to Teams, Players, and Admin screens
3. Data should now load correctly

## Debugging Output
I've added debug logging to help identify issues. When you open the app:
1. Open the browser Developer Console (F12)
2. Look for logs starting with:
   - 🔍 Base Query Called
   - 📊 Selecting from table
   - ✅ Select result
   - ❌ Supabase query error

## Security Note
**NEVER commit the service_role key to version control!** 
- The service_role key should only be used server-side
- The anon key is safe for client applications
- Consider adding .env to .gitignore if not already done

## Additional Checks
If issues persist after fixing the key:
1. Check if your Supabase project has Row Level Security (RLS) enabled on tables
2. Verify that the anon role has SELECT permissions on the tables
3. Check for any authentication requirements in your RLS policies

## Current Debug Mode
The app is currently using a debug version of the base query (`baseQuery-debug.ts`) that logs all API calls. Once everything is working, you can switch back to the regular version by updating `src/store/api/index.ts`.
