# Supabase MCP Setup Guide for Cursor on Windows

## Prerequisites
- Node.js installed and available in PATH
- Supabase account with a project
- Cursor IDE

## Step 1: Create Supabase Personal Access Token

1. Go to https://supabase.com/dashboard
2. Click on your profile icon → **Account Settings**
3. Navigate to **Access Tokens**
4. Click **Generate New Token**
5. Name it (e.g., "MCP Server for Cursor")
6. **IMPORTANT**: Copy and save the token immediately!

## Step 2: Configure MCP in Cursor

### Option A: Using Cursor Settings (Recommended)

1. Open Cursor
2. Press `Ctrl+Shift+P` to open command palette
3. Type "Preferences: Open User Settings (JSON)"
4. Add this configuration to your settings:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_SUPABASE_ACCESS_TOKEN_HERE"
      ]
    }
  }
}
```

### Option B: Using MCP Configuration File

1. Create a file at one of these locations:
   - `%USERPROFILE%\.cursor\mcp.json`
   - `%APPDATA%\Cursor\User\mcp.json`

2. Copy the contents from `mcp-config.json` in this project

3. Replace `YOUR_SUPABASE_ACCESS_TOKEN_HERE` with your actual token

## Step 3: Optional Configuration

### Restrict to Specific Project
Add your project reference ID (found in Supabase project settings):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_TOKEN",
        "--project-ref",
        "YOUR_PROJECT_REF"
      ]
    }
  }
}
```

### Enable Read-Only Mode
To prevent accidental modifications:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_TOKEN",
        "--read-only"
      ]
    }
  }
}
```

## Step 4: Restart Cursor

After configuring, restart Cursor for the changes to take effect.

## Step 5: Test the Connection

Once configured, the AI assistant should be able to:
- Query your Supabase database
- Manage tables and schemas
- Handle authentication and authorization
- Work with storage buckets
- Manage Edge Functions
- And more!

## Troubleshooting

### If MCP doesn't work:

1. **Check Node.js is in PATH**:
   ```powershell
   node --version
   ```

2. **Test the MCP server manually**:
   ```powershell
   npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_TOKEN
   ```

3. **Check Cursor logs**:
   - Help → Toggle Developer Tools → Console

4. **Ensure token has proper permissions**:
   - Token should have necessary scopes for your operations

## Security Notes

- **NEVER** commit your access token to version control
- Consider using environment variables for tokens
- Use read-only mode when possible
- Regularly rotate your access tokens

## Your Project Details

- **Project ID**: polo-app (from config.toml)
- **Local API URL**: http://localhost:54321
- **Local Database Port**: 54322
- **Studio URL**: http://localhost:54323

## Available MCP Commands

Once configured, the AI assistant can help with:
- Database queries and mutations
- Schema management
- User authentication
- Storage operations
- Edge Functions deployment
- Real-time subscriptions
- And more Supabase features!

