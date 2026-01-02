# ZenMaster Virtual Trader

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Dar-41/zenmaster-virtual-trader)
[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/Dar-41/zenmaster-virtual-trader&branch=main&name=zenmaster-trader)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Dar-41/zenmaster-virtual-trader)

VT SONA: A next-gen Virtual trading dashboard with automated technical analysis, risk management tools, and real-time market insights. Visualizes SMC, EMAs, and RSI on interactive charts.

A real-time multiplayer trading game for the Indian stock market, designed for live events, college fests, and projector demos.

## Features

### Core Gameplay
- **Real-time Multiplayer**: 2-6 players per room
- **5-minute Game Sessions**: Fast-paced trading action
- **Starting Capital**: ₹5,00,000 virtual money per player
- **Market Scenarios**: Bull, Bear, Range, and Volatile markets
- **Admin Controls**: Real-time price manipulation during gameplay
- **Live Leaderboard**: Real-time P&L rankings with rankings
- **TradingView Charts**: Professional candlestick charts with real-time updates
- **Buy/Sell/Short**: Full trading functionality with position management

### Enhanced Features
- **Trade History**: View all your trades with P&L tracking
- **Game Statistics**: Win rate, average trade size, total trades
- **Price Indicators**: Visual feedback for price movements
- **Toast Notifications**: Non-intrusive notifications for trades and events
- **Connection Status**: Real-time connection monitoring
- **Game End Modal**: Beautiful end-game screen with final rankings
- **Sound Effects**: Audio feedback for trade executions
- **Admin Analytics**: Game-wide statistics and metrics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Polished UI with transitions and effects

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Charts**: TradingView Lightweight Charts
- **Backend**: Node.js, Express
- **Real-time**: Socket.io
- **State**: In-memory server-side state

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm run dev:server
```

3. In a new terminal, start the frontend:
```bash
npm run dev
```

4. Or run both simultaneously:
```bash
npm run dev:all
```

## Usage

### For Players

1. Visit `http://localhost:3000`
2. Enter your name and room code
3. Join the game and start trading!

### For Admins

1. Visit `http://localhost:3000/admin`
2. Enter admin name, select stock and market scenario
3. Create room and share the room code
4. Start the game when ready (minimum 2 players)
5. Use admin controls to manipulate price during gameplay

## Game Rules

- **Duration**: 5 minutes fixed
- **Players**: 2-6 per room
- **Starting Capital**: ₹5,00,000
- **Trades**: Market orders only, instant execution
- **Positions**: Auto square-off at game end
- **Ranking**: By Net P&L

## Admin Controls

- **Push Price UP/DOWN**: Gradually bias price direction
- **Volatility Slider**: Adjust market volatility (0.5x - 3.0x)
- **Pause/Resume**: Pause market movement
- **Lock Room**: Prevent new players from joining

## Project Structure

```
tradebattleds/
├── app/                 # Next.js app directory
├── page.tsx        # Landing page
├── play/           # Player game page
├── admin/          # Admin panel
├── components/         # React components
├── TradingChart.tsx
├── TradeButtons.tsx
├── PlayerStats.tsx
├── Leaderboard.tsx
├── AdminControls.tsx
├── server/             # Backend server
├── index.js        # Express + Socket.io server
├── marketEngine.js # Market simulation
└── gameTypes.js    # Game types and config
└── lib/                # Shared utilities
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Performance Optimizations

- Server-side price generation (single source of truth)
- Minimal socket events (1 per second for price ticks)
- requestAnimationFrame for chart rendering
- In-memory state management
- Optimized chart updates

## License

MIT
