# JournIQ Deployment Guide

## Problem Identified
Your frontend was trying to reach `localhost:3000` from Vercel, which is impossible. The issue was:
1. **Frontend env var not set** - `VITE_API_URL` was not configured on Vercel
2. **Backend CORS** - Not properly configured for your Vercel URL
3. **Hardcoded redirects** - Auth routes had hardcoded localhost URLs

## Changes Made

### 1. Backend Changes

#### File: `backend/.env`
✅ **Updated structure for production support**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VERCEL_FRONTEND_URL=http://localhost:5173  # Update this for production
MONGODB_URI=...
SESSION_SECRET=supersecretkey
CLIENT_URL=http://localhost:5173
JWT_SECRET=...
JWT_EXPIRES_IN=7d
# ... rest of config
```

#### File: `backend/server.js`
✅ **Updated CORS configuration**
- Added `process.env.VERCEL_FRONTEND_URL` to allowed origins
- Added your Vercel URL directly as fallback
- Added console logging for debugging

#### File: `backend/routes/auth.js`
✅ **Made auth routes dynamic**
- Uses environment variables instead of hardcoded `localhost:5173`
- Supports both development and production URLs
- OAuth callbacks now dynamic

### 2. Frontend Changes

#### File: `frontend/src/services/authService.js`
✅ **Improved API endpoint detection**
- Properly reads `VITE_API_URL` from environment
- Uses intelligent fallback based on environment
- Added console logging for debugging

#### File: `frontend/vite.config.js`
✅ **Removed hardcoded API URL**
- Now reads from environment variables only
- Allows build-time configuration

## 📋 RENDER BACKEND - Environment Variables to Set

Go to your Render app → Environment tab → Add these:

```
FRONTEND_URL=https://journ-iq-93xs.vercel.app
VERCEL_FRONTEND_URL=https://journ-iq-93xs.vercel.app
CLIENT_URL=https://journ-iq-93xs.vercel.app
NODE_ENV=production
PORT=3000
BACKEND_URL=https://your-render-url
RENDER_EXTERNAL_URL=https://your-render-url
MONGODB_URI=your-mongodb-connection-string
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
GITHUB_CALLBACK_URL=https://your-render-url/api/auth/github/callback
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-render-url/api/auth/google/callback
YOUTUBE_API_KEY=your-youtube-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ **Important**: Replace all `your-*` values with your actual credentials and `https://your-render-url` with your actual Render URL

## 📋 VERCEL FRONTEND - Environment Variables to Set

Go to your Vercel project → Settings → Environment Variables → Add this:

```
VITE_API_URL=https://your-render-backend-url/api
```

Replace `https://your-render-backend-url` with your actual Render backend URL.

## 🚀 Deployment Steps

### 1. Update Backend on Render
```bash
git add backend/.env backend/server.js backend/routes/auth.js
git commit -m "Fix CORS and production URL handling"
git push origin main
```
- Render will auto-redeploy
- Get your backend URL from Render dashboard

### 2. Update OAuth Callbacks
In your Render Environment Variables, update:
- `GITHUB_CALLBACK_URL=https://your-render-url/api/auth/github/callback`
- `GOOGLE_CALLBACK_URL=https://your-render-url/api/auth/google/callback`

### 3. Update Frontend on Vercel
1. Go to Vercel project settings
2. Add env var: `VITE_API_URL=https://your-render-url/api`
3. Redeploy the frontend

### 4. Test
Open browser console (F12) and check:
- Network tab shows requests going to your Render URL (not localhost)
- API response is successful (not CORS error)
- Login works properly

## 🔍 Debugging

If you still see `localhost:3000` errors:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Check Vercel build logs** - Ensure env var was set during build
3. **Check Network tab** - See actual request URL
4. **Check Console logs** - Look for `API_BASE_URL:` log message
5. **Verify Render env vars** are set correctly

## Quick Reference: Your URLs

- **Frontend**: https://journ-iq-93xs.vercel.app
- **Backend**: https://your-render-url (get from Render dashboard)

Once you get these working, test all these endpoints:
- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/user`
- GET `/api` (health check)

Good luck! 🎉
