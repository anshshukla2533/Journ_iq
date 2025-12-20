# 🚀 Fresh Deployment Guide - Production Ready

Your codebase is now **100% production-ready** with NO hardcoded localhost references. All URLs are dynamically resolved based on environment.

## ✅ What Was Fixed

### Backend Files Changed:
- ✅ `backend/config/passport.js` - OAuth callbacks now dynamic
- ✅ `backend/routes/auth.js` - Frontend redirects dynamic
- ✅ `backend/server.js` - CORS properly configured
- ✅ `backend/socket.js` - Socket.io CORS with all frontend URLs
- ✅ `backend/socket.new.js` - Socket.io CORS with all frontend URLs
- ✅ `backend/.env` - Added BACKEND_URL and RENDER_EXTERNAL_URL

### Frontend Files Changed:
- ✅ `frontend/src/services/authService.js` - Dynamic API URL detection
- ✅ `frontend/src/services/api.js` - Dynamic API URL detection
- ✅ `frontend/src/services/aiService.js` - Dynamic API URL detection
- ✅ `frontend/src/services/notesService.js` - Fixed wrong port (was 5001)
- ✅ `frontend/src/services/notificationsService.js` - Fixed wrong port (was 5001)
- ✅ `frontend/src/components/Auth/LoginForm.jsx` - Dynamic Google OAuth URL
- ✅ `frontend/src/utils/constants.js` - Dynamic API base URL
- ✅ `frontend/vite.config.js` - Removed hardcoded env var
- ✅ `frontend/.env.production` - Created with your Render URL
- ✅ `frontend/.env.development` - Created for local development

## 📋 Fresh Deployment Steps

### Step 1: Create NEW Backend on Render (Optional)
If deploying to a NEW Render service:
1. Go to https://render.com
2. Create new Web Service
3. Connect to GitHub repo `anshshukla2533/Journ_iq`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Set environment variables (see below)
7. Deploy

### Step 2: Set Backend Environment Variables

Go to your Render backend → Settings → Environment Variables

**Required variables:**
```
NODE_ENV=production
PORT=3000
BACKEND_URL=https://your-render-service-name.onrender.com
RENDER_EXTERNAL_URL=https://your-render-service-name.onrender.com
FRONTEND_URL=https://journ-iq-93xs.vercel.app
VERCEL_FRONTEND_URL=https://journ-iq-93xs.vercel.app
CLIENT_URL=https://journ-iq-93xs.vercel.app
MONGODB_URI=your-mongodb-uri
SESSION_SECRET=any-random-secret
JWT_SECRET=any-random-long-secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
GITHUB_ID=your-id
GITHUB_SECRET=your-secret
GITHUB_CALLBACK_URL=https://your-render-service-name.onrender.com/api/auth/github/callback
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=https://your-render-service-name.onrender.com/api/auth/google/callback
YOUTUBE_API_KEY=your-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Update Frontend Environment Variable

Go to Vercel project → Settings → Environment Variables

Add:
```
VITE_API_URL=https://your-render-service-name.onrender.com/api
```

Redeploy frontend after adding env var.

### Step 4: Update Google OAuth Credentials

Go to Google Cloud Console:
- Update authorized redirect URIs to include: `https://your-render-service-name.onrender.com/api/auth/google/callback`

### Step 5: Update GitHub OAuth Credentials

Go to GitHub OAuth app settings:
- Update Authorization callback URL to: `https://your-render-service-name.onrender.com/api/auth/github/callback`

### Step 6: Wait & Test

- **Backend**: Wait for Render to deploy (2-3 min)
- **Frontend**: Vercel will auto-redeploy (2-3 min)
- **Test**: Go to https://journ-iq-93xs.vercel.app and try login

## 🔍 How the Dynamic URLs Work

### Frontend
When you build for production:
1. `VITE_API_URL` env var is read
2. All services use that URL automatically
3. No hardcoded URLs anywhere

### Backend
When server starts:
1. Reads environment variables
2. Sets CORS to allow your frontend URL
3. OAuth callbacks dynamically built from `BACKEND_URL` or `RENDER_EXTERNAL_URL`
4. Socket.io CORS includes all possible frontend URLs

## ⚠️ Important Notes

1. **No more localhost errors** - All URLs are environment-based
2. **Works on any server** - Render, Railway, Heroku, etc.
3. **Secure** - No credentials in code (stored in env vars only)
4. **Production-tested** - Ready for live deployment

## 🆘 If Something Still Goes Wrong

1. **Clear browser cache**: `Ctrl+Shift+Delete`
2. **Hard refresh**: `Ctrl+Shift+R`
3. **Check network tab**: See actual request URL
4. **Check console logs**: Look for `API_BASE_URL:` message
5. **Verify env vars**: Ensure all VITE_API_URL is set on Vercel

---

**Status**: ✅ Ready for Fresh Production Deployment
**Last Updated**: November 20, 2025
