# Quick Deployment Guide

## 🚀 Fastest Way: Vercel + Railway

### 1. Deploy Backend (Railway) - 5 minutes

```bash
# Option A: Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up --service server
railway variables set FRONTEND_URL=https://your-app.vercel.app

# Option B: Railway Web UI
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select repo → Add Service
4. Set Root Directory: server
5. Add env var: FRONTEND_URL (set after frontend deploy)
```

### 2. Deploy Frontend (Vercel) - 3 minutes

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel login
vercel --prod

# Option B: Vercel Web UI
1. Go to vercel.com
2. Import Git Repository
3. Add env var: NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
4. Deploy
```

### 3. Update Backend CORS

Go to Railway → Variables → Update `FRONTEND_URL` with your Vercel URL

## ✅ Done!

Your game is live at: `https://your-app.vercel.app`

## 🔧 Troubleshooting

**Socket connection fails?**
- Check `NEXT_PUBLIC_SOCKET_URL` matches Railway URL
- Verify Railway service is running
- Check Railway logs for errors

**Build fails?**
- Ensure Node.js 18+ in Railway settings
- Check all dependencies in package.json

## 📝 Environment Variables

**Railway (Backend):**
```
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
```

**Vercel (Frontend):**
```
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

