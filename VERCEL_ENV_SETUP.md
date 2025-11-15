# Vercel Environment Variables Setup

## Issue: Mapbox Not Showing on Vercel

The Mapbox map is not displaying on your Vercel deployment because environment variables are not automatically deployed. The `.env.local` file is only used for local development.

## Solution: Add Environment Variables in Vercel

### Step 1: Get Your Environment Variables

You need to add these environment variables to Vercel:

1. **NEXT_PUBLIC_MAPBOX_TOKEN** - Your Mapbox access token
2. **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
3. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anonymous key

### Step 2: Add Environment Variables in Vercel Dashboard

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (toplix or final_toplix_supabase)
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add each variable:

   **For Mapbox:**
   - **Name:** `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value:** Your Mapbox token (starts with `pk.eyJ...`)
   - **Environments:** Select all (Production, Preview, Development)

   **For Supabase:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Your Supabase project URL
   - **Environments:** Select all

   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anonymous key
   - **Environments:** Select all

6. Click **Save** after adding each variable

### Step 3: Redeploy Your Application

After adding the environment variables, you need to trigger a new deployment:

**Option A: Via Vercel Dashboard**
1. Go to the **Deployments** tab
2. Click the **⋯** (three dots) menu on the latest deployment
3. Click **Redeploy**
4. Confirm the redeploy

**Option B: Via Git Push**
```bash
# Make a small change and push to trigger a new deployment
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin main
```

### Step 4: Verify the Variables Are Set

After redeploying, check:
1. The Mapbox map should now display on your Vercel URL
2. Properties should load from Supabase (if configured)
3. No console errors about missing tokens

## Important Notes

- ⚠️ **Never commit `.env.local` to Git** - It's already in `.gitignore`
- ✅ **Always add environment variables in Vercel** for production
- 🔄 **Redeploy is required** after adding new environment variables
- 🌍 **Select all environments** (Production, Preview, Development) when adding variables

## Troubleshooting

### Map still not showing after adding variables?
1. Make sure you redeployed after adding the variables
2. Check the browser console for errors
3. Verify the token is correct (starts with `pk.eyJ`)
4. Check Vercel deployment logs for any errors

### Variables not working?
1. Ensure variable names match exactly (case-sensitive)
2. Make sure you selected all environments when adding
3. Try redeploying again
4. Check Vercel build logs for any warnings

## Quick Reference

**Required Environment Variables:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoidG9wbGl4MTM1IiwiYSI6ImNtaDU5bHBneDA0NTUyaXM1bTZndjZzaXcifQ.EMHtvyQI_W8gcBgViIngdw
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

