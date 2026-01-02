# Deploy to Netlify - Trade Battle DS

## Architecture

- **Frontend**: Next.js on Netlify
- **Backend**: Express + Socket.io on Railway/Render (required for WebSocket support)

> **Note**: Netlify doesn't support persistent WebSocket connections, so the backend must be deployed separately.

## Step 1: Deploy Backend (Railway or Render)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add Service → Select your repo
6. **Settings**:
   - Root Directory: `server`
   - Build Command: (auto-detected)
   - Start Command: `node index.js`
7. **Environment Variables**:
   ```
   PORT=3001
   FRONTEND_URL=https://your-app.netlify.app
   NODE_ENV=production
   ```
8. Copy the Railway URL (e.g., `https://your-backend.railway.app`)

### Option B: Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. New → Web Service
4. Connect your GitHub repository
5. **Settings**:
   - Name: `tradebattleds-backend`
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node index.js`
   - Root Directory: `server`
6. **Environment Variables**:
   ```
   PORT=3001
   FRONTEND_URL=https://your-app.netlify.app
   ```
7. Copy the Render URL (e.g., `https://your-backend.onrender.com`)

## Step 2: Deploy Frontend to Netlify

### Method 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
cd /Users/darshsheth41/tds/tradebattleds
netlify init

# Follow prompts:
# - Create & configure a new site
# - Team: (select your team)
# - Site name: (or press enter for auto-generated)
# - Build command: npm run build
# - Directory to deploy: .next
# - Netlify functions folder: (press enter, not needed)

# Set environment variable
netlify env:set NEXT_PUBLIC_SOCKET_URL https://your-backend.railway.app

# Deploy
netlify deploy --prod
```

### Method 2: Netlify Web UI

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose "Deploy with GitHub"
5. Select your repository
6. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: (leave empty)
7. **Environment variables** (Site settings → Environment variables):
   ```
   NEXT_PUBLIC_SOCKET_URL = https://your-backend.railway.app
   ```
8. Click "Deploy site"

### Method 3: GitHub Integration (Auto-deploy)

1. Go to Netlify → Add new site → Import from Git
2. Connect GitHub and select repository
3. Configure build:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variable: `NEXT_PUBLIC_SOCKET_URL`
5. Deploy automatically on every push

## Step 3: Update Backend CORS

After Netlify deployment, update backend environment variable:

**Railway:**
- Go to Variables tab
- Update `FRONTEND_URL` to: `https://your-app.netlify.app`

**Render:**
- Go to Environment tab
- Update `FRONTEND_URL` to: `https://your-app.netlify.app`

## Step 4: Verify Deployment

1. Visit your Netlify URL: `https://your-app.netlify.app`
2. Open browser console (F12)
3. Check for Socket.io connection
4. Test creating a room and joining

## Troubleshooting

### Build Fails on Netlify

**Issue**: Next.js build errors
**Solution**: 
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check build logs in Netlify dashboard

**Fix Node version:**
```toml
# In netlify.toml
[build.environment]
  NODE_VERSION = "18"
```

### Socket Connection Fails

**Issue**: Cannot connect to backend
**Solution**:
1. Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
2. Check backend is running (visit backend URL)
3. Verify CORS allows Netlify domain
4. Check browser console for errors

### 404 Errors on Refresh

**Issue**: Page not found on refresh
**Solution**: Already handled by `_redirects` file and Next.js routing

## Environment Variables Summary

### Netlify (Frontend)
```
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
```

### Railway/Render (Backend)
```
PORT=3001
FRONTEND_URL=https://your-app.netlify.app
NODE_ENV=production
```

## Custom Domain (Optional)

1. Go to Netlify → Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions
4. Update `FRONTEND_URL` in backend with new domain

## Cost

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes/month)
- **Railway**: $5/month (hobby plan)
- **Render**: Free tier available (with limitations)

## Quick Deploy Commands

```bash
# 1. Deploy to Netlify
netlify deploy --prod

# 2. Set environment variable
netlify env:set NEXT_PUBLIC_SOCKET_URL https://your-backend.railway.app

# 3. Redeploy with new env var
netlify deploy --prod
```

## Support

- Netlify Docs: https://docs.netlify.com
- Netlify Status: https://www.netlifystatus.com
- Check deployment logs in Netlify dashboard

