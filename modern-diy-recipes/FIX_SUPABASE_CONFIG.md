# Supabase Configuration Fix Guide

## Problem Identified

Our analysis has identified the following issues with the Supabase configuration:

1. **Security Issue**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` in both `.env` and `.env.local` is actually a **service_role** key, not an anon key
   - This is a security risk as it exposes admin-level database access to client-side code
   - The key contains `"role":"service_role"` which confirms it's not an anon key

2. **Table Creation Issues**: The database setup scripts fail because:
   - They use the same key incorrectly named as an anon key
   - The app works because it's actually using a service_role key (but named incorrectly)

## Required Fixes

### 1. Update .env.local with Proper Keys

You need to correctly configure your environment variables:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://bzudglfxxywugesncjnz.supabase.co

# This should be an anon key (limited permissions)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-proper-anon-key>

# This is correct and should remain a service_role key
SUPABASE_SERVICE_ROLE_KEY=<your-current-service-role-key>
```

### 2. Get the Proper Anon Key

Log into your Supabase dashboard to get the correct keys:

1. Go to [https://supabase.com](https://supabase.com) and log in
2. Navigate to your project: `bzudglfxxywugesncjnz`
3. Go to Project Settings > API
4. Copy the **anon/public** key (not the service_role key)
5. Update your `.env.local` file with this proper anon key

### 3. Use the Fixed Database Setup Script

We've created a fixed database script that properly uses the service_role key:

```bash
node create-tables-fixed.js
```

This script will:
- Correctly use the service_role key for database operations
- Check if tables exist
- Try to create missing tables
- Provide SQL that you can run in the Supabase SQL Editor

### 4. For Immediate Testing (If Needed)

Since the app is currently working (but insecurely), you can continue testing with:

```bash
npm run dev
```

The KRAFT Terminal Layout component has been updated to handle missing tables gracefully.

## Security Recommendations

1. **Never expose service_role keys** to client-side code (never use NEXT_PUBLIC_ prefix)
2. **Create a backend API** for operations requiring service_role permissions
3. **Use Row Level Security** in Supabase for proper data access control
4. **Regenerate keys** once you've properly configured the application

## Long-term Solutions

1. **Create a backend API** that uses the service_role key securely
2. **Set up RLS policies** to control data access via the anon key
3. **Implement proper auth flows** with user-specific permissions