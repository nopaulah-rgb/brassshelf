# Netlify Deployment Configuration

This document explains the changes made to enable proper Remix deployment on Netlify.

## What Changed

### 1. Removed `public/_redirects`
- The initial `_redirects` file was for static SPAs, but Remix is a full-stack SSR framework
- Replaced with proper Netlify configuration for Remix

### 2. Added `netlify.toml`
Configuration file that tells Netlify how to build and deploy your Remix app:
- **Build command**: `npm run build`
- **Publish directory**: `build/client` (where Remix outputs static assets)
- **Redirects**: All requests route through `/.netlify/functions/server` for SSR
- **Cache headers**: Optimizes caching for build assets

### 3. Created `netlify/functions/server.ts`
A Netlify Function that runs your Remix server for server-side rendering:
- Handles all dynamic routes
- Processes server-side logic
- Returns properly rendered HTML

### 4. Installed `@remix-run/netlify`
Added the official Remix adapter for Netlify to handle SSR properly.

### 5. Updated `vite.config.ts`
- Added `serverBuildFile: "index.js"` for consistent server output
- Added `ssr.noExternal: ["three"]` to properly bundle Three.js for SSR

## How It Works

1. **Static assets** (CSS, JS, images) are served from `build/client/`
2. **All page requests** are routed to the Netlify Function
3. **The Function** runs your Remix server and returns rendered HTML
4. **Client-side hydration** takes over for subsequent navigation

## Deployment Steps

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Configure Netlify deployment for Remix SSR"
   git push
   ```

2. **Netlify will automatically**:
   - Detect the `netlify.toml` configuration
   - Run `npm run build`
   - Deploy the client files to CDN
   - Create the serverless function
   - Make your site live!

3. **No additional Netlify configuration needed** - everything is in the code

## Why This Is Different From SPAs

Traditional React SPAs (like Create React App) are fully static and just need client-side routing via `_redirects`. 

Remix is a **full-stack framework** that can:
- Run server-side logic
- Fetch data on the server
- Generate SEO-friendly HTML
- Handle form submissions server-side

This requires a serverless function to run the Remix server, not just static file serving.

## Troubleshooting

If you still see 404 errors:

1. **Check the deploy log** on Netlify - ensure the function was created
2. **Verify the build succeeded** - look for "Deploy succeeded" message
3. **Check function logs** - Visit Functions tab in Netlify dashboard
4. **Clear browser cache** - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

## References

- [Netlify Redirects Documentation](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps)
- [Remix Netlify Deployment](https://remix.run/docs/en/main/guides/deployment#netlify)
- [Netlify Support Guide](https://answers.netlify.com/t/support-guide-i-ve-deployed-my-site-but-i-still-see-page-not-found/125)

