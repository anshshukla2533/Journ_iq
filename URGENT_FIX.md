# 🚀 IMMEDIATE ACTION REQUIRED

## ⚠️ CRITICAL STEP - DO THIS NOW

Your error `localhost:3000 ERR_CONNECTION_REFUSED` happens because:
1. Frontend on Vercel tries to reach `localhost:3000` 
2. `localhost` on Vercel is the Vercel server, NOT your Render backend

## 📋 FIX IN 3 STEPS

### Step 1: Get Your Render Backend URL
1. Go to https://dashboard.render.com
2. Click on your backend service (e.g., "journiq-backend")
3. Copy the URL shown at the top (it looks like: `https://journiq-backend.onrender.com`)
4. ✅ Save it somewhere

### Step 2: Update Frontend `.env.production`
File: `frontend/.env.production`

Replace this:
```
VITE_API_URL=https://your-render-url/api
```

With your actual URL (example):
```
VITE_API_URL=https://journiq-backend.onrender.com/api
```

### Step 3: Deploy to Vercel
```bash
# From your project root
git add frontend/.env.production frontend/.env.development
git commit -m "Add production and development environment files"
git push origin main
```

Vercel will automatically redeploy with the new env var.

## ✅ Verify It Works
After deployment:
1. Open browser console (F12)
2. Look for log message: `API_BASE_URL: https://your-render-url/api`
3. Try to login - should work now!

## 🐛 Still Getting localhost:3000 Error?
If you STILL see the error:
1. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear browser cache completely
3. Check that `.env.production` was actually committed to git
4. Check Vercel build logs to see if file was included
