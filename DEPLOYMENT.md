# Deployment Guide - Trade Battle DS

This guide will help you deploy the multiplayer trading game to production.

## Architecture

- **Frontend**: Next.js (deploy to Vercel)
- **Backend**: Express + Socket.io (deploy to Railway/Render)

## Option 1: Deploy to Vercel + Railway (Recommended)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Choose "Empty Project"

3. **Configure Backend**
   - Click "New" → "GitHub Repo"
   - Select your repo
   - Set Root Directory: `server`
   - Railway will auto-detect Node.js

4. **Set Environment Variables**
   - Go to Variables tab
   - Add:
     ```
     PORT=3001
     FRONTEND_URL=https://your-vercel-app.vercel.app
     NODE_ENV=production
     ```

5. **Deploy**
   - Railway will auto-deploy
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework Preset: Next.js (auto-detected)

3. **Set Environment Variables**
   - Go to Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_SOCKET_URL=https://your-app.railway.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

5. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL

## Option 2: Deploy to Render (Alternative)

### Backend on Render

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repo
4. Settings:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node index.js`
   - Environment: Node
5. Add environment variables:
   - `PORT=3001`
   - `FRONTEND_URL=https://your-vercel-app.vercel.app`

### Frontend on Vercel

Same as Option 1, Step 2.

## Option 3: Deploy Both to Railway

### Backend
- Same as Option 1, Step 1

### Frontend on Railway

1. Create new service in Railway
2. Select your GitHub repo
3. Set Root Directory: `/` (root)
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variable:
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app`

## Quick Deploy Script

For Railway backend, create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Post-Deployment Checklist

- [ ] Backend is accessible (check health endpoint)
- [ ] Frontend connects to backend (check browser console)
- [ ] Socket.io connection works
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] HTTPS is enabled (both services)

## Troubleshooting

### Socket.io Connection Issues

1. Check CORS settings in backend
2. Verify `NEXT_PUBLIC_SOCKET_URL` is correct
3. Ensure both services use HTTPS in production

### Build Errors

1. Check Node.js version (should be 18+)
2. Verify all dependencies are in package.json
3. Check build logs for specific errors

### Connection Refused

1. Verify backend is running
2. Check firewall/port settings
3. Ensure environment variables are set correctly

## Environment Variables Reference

### Backend (.env)
```
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

## Cost Estimates

- **Vercel**: Free tier (hobby) - sufficient for demos
- **Railway**: $5/month (hobby plan) - includes $5 credit
- **Render**: Free tier available (with limitations)

## Production Optimizations

1. Enable compression in Express
2. Add rate limiting
3. Set up monitoring (Sentry, LogRocket)
4. Configure CDN for static assets
5. Add database for game history (optional)

## Support

For issues, check:
- Railway logs: Dashboard → Service → Logs
- Vercel logs: Dashboard → Project → Deployments → View Function Logs

