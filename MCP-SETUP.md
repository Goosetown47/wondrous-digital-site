# MCP Server Setup Instructions

## Setting up Supabase MCP Server

1. **Get your Supabase Service Role Key**:
   - Go to your Supabase project dashboard (https://supabase.com/dashboard)
   - Navigate to Settings → API
   - Copy your `service_role` key (keep this secret!)
   
   Note: The personal access token (sbp_...) is for CLI authentication, but the MCP server needs the service role key for database operations.

2. **Add the Service Role Key to your environment**:
   ```bash
   echo 'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here' >> .env.local
   ```

3. **The MCP configuration is already set up**:
   - Check `.mcp.json` in the project root
   - It's configured to use the Supabase MCP server

4. **Restart Claude Code**:
   - Exit Claude Code completely
   - Start it again with: `claude`
   - The MCP server should auto-start

## Available MCP Commands

Once configured, you'll have access to Supabase MCP commands like:
- `mcp__supabase-write__apply_migration` - Apply SQL migrations
- `mcp__supabase-write__execute_sql` - Execute SQL queries
- And more...

## Testing the Connection

After setup, you can test by running:
```
mcp list
```

This should show the Supabase server as connected.

## Troubleshooting

If the MCP server doesn't connect:
1. Check that your service role key is correct
2. Ensure you're in the project directory
3. Try running `claude mcp restart supabase`

## Setting up Netlify MCP Server

1. **Get your Netlify Personal Access Token**:
   - Go to [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
   - Click "New access token"
   - Give it a descriptive name (e.g., "MCP Server")
   - Copy the token (you won't be able to see it again!)

2. **Add the token to your environment**:
   ```bash
   echo 'NETLIFY_AUTH_TOKEN=your-netlify-token-here' >> .env.local
   ```

3. **The Netlify MCP is already configured in `.mcp.json`**

## Available Netlify MCP Commands

Once configured, you'll have access to commands like:
- `mcp__netlify__list_sites` - List all your Netlify sites
- `mcp__netlify__create_site` - Create a new site
- `mcp__netlify__deploy` - Deploy to Netlify
- And more...

## Alternative: Manual Migration

If you can't set up MCP, you can manually apply migrations:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL from `apply-admin-migrations.sql`