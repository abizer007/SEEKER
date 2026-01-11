# Supabase Setup Guide

This guide will help you connect your SEEKR project to your Supabase project.

## Step 1: Get Your Supabase Anon Key

1. Go to your Supabase project dashboard: https://app.supabase.com/project/vxsytkfocracajkwyban
2. Navigate to **Settings** → **API**
3. Find the **Project API keys** section
4. Copy the **anon/public** key (NOT the service_role key)
5. Open the `.env` file in the root of this project
6. Replace `your_anon_public_key_here` with your actual anon key

Your `.env` file should look like this:
```
VITE_SUPABASE_URL=https://vxsytkfocracajkwyban.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: Run Database Migrations

You need to run the SQL migrations to set up your database schema. You can do this in two ways:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `supabase/migrations/20251103132933_70a74f97-e31d-4af7-b391-29444dcbac54.sql`
   - `supabase/migrations/20251103141313_71946fad-77b6-4987-bf93-95b84ad38809.sql`
   - `supabase/migrations/20251103161822_001d3271-5cd1-467a-b63e-df04fd1df147.sql`

### Option B: Using Supabase CLI

If you have Supabase CLI installed:
```bash
supabase db push
```

## Step 3: Verify Storage Buckets

The migrations will create the following storage buckets:
- `avatars` - User profile pictures
- `banners` - User banner images
- `documents` - ID proofs and documents
- `achievements` - Achievement images
- `reel-videos` - Video reels
- `reel-thumbnails` - Video thumbnails

Verify these buckets exist in your Supabase dashboard under **Storage**.

## Step 4: Configure Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable the authentication methods you want to use (Email, Google, etc.)
3. Configure email templates if needed

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Try to sign up or log in
3. Check the browser console for any errors

## Troubleshooting

### Error: "Missing env.VITE_SUPABASE_URL"
- Make sure your `.env` file exists in the root directory
- Verify the file has the correct variable names (they must start with `VITE_`)

### Error: "Missing env.VITE_SUPABASE_PUBLISHABLE_KEY"
- Make sure you've replaced `your_anon_public_key_here` with your actual anon key
- Verify you copied the **anon/public** key, not the service_role key

### Database Connection Issues
- Verify your Supabase project URL is correct
- Check that your Supabase project is active and not paused
- Ensure all migrations have been run successfully

## Security Notes

- Never commit your `.env` file to git (it's already in `.gitignore`)
- The anon key is safe to use in frontend code (it's public)
- Never expose your service_role key in frontend code
