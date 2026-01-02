#!/bin/bash

# Trade Battle DS - Automated Deployment Script
# This script helps deploy to Netlify and Railway

set -e

echo "🚀 Trade Battle DS Deployment Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
    echo -e "${GREEN}✅ Netlify CLI installed${NC}"
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
fi

echo ""
echo -e "${BLUE}Step 1: Preparing for deployment...${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3001" > .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
fi

# Build the project to check for errors
echo ""
echo -e "${BLUE}Step 2: Building project...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed! Please fix errors before deploying.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Deployment Options${NC}"
echo ""
echo "Choose deployment method:"
echo "1) Deploy to Railway (Full App - Recommended)"
echo "2) Deploy to Netlify (Frontend Only - Legacy)"
echo "3) Deploy to Vercel (Frontend Only - Legacy)"
echo "4) Just prepare files"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Deploying to Netlify...${NC}"
        echo ""
        echo "You'll need to:"
        echo "1. Login to Netlify (browser will open)"
        echo "2. Set environment variable: NEXT_PUBLIC_SOCKET_URL"
        echo ""
        read -p "Press Enter to continue..."
        netlify deploy --prod
        ;;
    2)
        echo ""
        echo -e "${BLUE}Deploying to Railway...${NC}"
        echo ""
        echo "You'll need to:"
        echo "1. Login to Railway (browser will open)"
        echo "2. Set environment variable: FRONTEND_URL"
        echo ""
        read -p "Press Enter to continue..."
        cd server
        railway up
        ;;
    3)
        echo ""
        echo -e "${BLUE}Deploying to both platforms...${NC}"
        echo ""
        echo "First, deploy backend to Railway..."
        read -p "Press Enter to deploy backend..."
        cd server
        railway up
        cd ..
        
        echo ""
        echo "Backend deployed! Copy the URL and press Enter..."
        read -p "Press Enter to deploy frontend..."
        
        echo ""
        echo "Setting environment variable..."
        read -p "Enter your Railway backend URL: " backend_url
        netlify env:set NEXT_PUBLIC_SOCKET_URL "$backend_url"
        
        echo ""
        echo "Deploying to Netlify..."
        netlify deploy --prod
        ;;
    4)
        echo ""
        echo -e "${GREEN}✅ Files prepared for deployment${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Commit and push to GitHub"
        echo "2. Connect to Netlify/Railway via web UI"
        echo "3. Set environment variables"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Deployment process completed!${NC}"
echo ""
echo "Don't forget to:"
echo "1. Set environment variables in both platforms"
echo "2. Update CORS settings in backend"
echo "3. Test the live deployment"


