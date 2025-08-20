# Environment Configuration

## Setup Instructions

1. **Create environment file:**
   ```bash
   # Copy the template and edit with your values
   cp .env.example .env.local
   ```

2. **Required Environment Variables:**
   Add these to your `.env.local` file:
   
   ```env
   # Supabase Configuration (Required)
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Environment (development/staging/production)
   EXPO_PUBLIC_ENVIRONMENT=development
   
   # App Configuration
   EXPO_PUBLIC_APP_NAME="Polo Match Tracker"
   EXPO_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Getting Supabase Credentials:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the `Project URL` and `anon/public key`

## Environment Files

- **`.env.local`** - Local development (not committed)
- **`.env.production`** - Production values (not committed, use EAS secrets)
- **`.env.example`** - Template file (committed for reference)

## EAS Build Configuration

For production builds, set environment variables in EAS:

```bash
# Set production environment variables
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-prod-url.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-prod-anon-key"
```

## Security Notes

- Never commit actual credentials to version control
- Use different Supabase projects for development/production
- Keep service role keys server-side only
- Use EAS secrets for production deployment
