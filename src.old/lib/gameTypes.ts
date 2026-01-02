// Indian stocks data for the trading game
export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  volatility: number; // 0-1 scale
  lotSize: number;
}

export const INDIAN_STOCKS: Stock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", basePrice: 2450, volatility: 0.4, lotSize: 1 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", basePrice: 3750, volatility: 0.35, lotSize: 1 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", basePrice: 1650, volatility: 0.3, lotSize: 1 },
  { symbol: "INFY", name: "Infosys", sector: "IT", basePrice: 1520, volatility: 0.4, lotSize: 1 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", basePrice: 1180, volatility: 0.35, lotSize: 1 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", basePrice: 780, volatility: 0.45, lotSize: 1 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", basePrice: 1420, volatility: 0.35, lotSize: 1 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", basePrice: 850, volatility: 0.55, lotSize: 1 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", basePrice: 480, volatility: 0.4, lotSize: 1 },
  { symbol: "ADANIENT", name: "Adani Enterprises", sector: "Diversified", basePrice: 2850, volatility: 0.7, lotSize: 1 },
];

export type MarketScenario = 'bullish' | 'bearish' | 'range' | 'volatile';

export interface MarketScenarioConfig {
  id: MarketScenario;
  name: string;
  description: string;
  trendBias: number; // -1 to 1 (bearish to bullish)
  volatilityMultiplier: number;
  fakeBreakoutChance: number;
  newsEventChance: number;
}

export const MARKET_SCENARIOS: MarketScenarioConfig[] = [
  {
    id: 'bullish',
    name: 'Bull Run 🐂',
    description: 'Strong upward momentum with occasional pullbacks',
    trendBias: 0.6,
    volatilityMultiplier: 1.0,
    fakeBreakoutChance: 0.1,
    newsEventChance: 0.05,
  },
  {
    id: 'bearish',
    name: 'Bear Market 🐻',
    description: 'Downward pressure with dead cat bounces',
    trendBias: -0.6,
    volatilityMultiplier: 1.2,
    fakeBreakoutChance: 0.15,
    newsEventChance: 0.08,
  },
  {
    id: 'range',
    name: 'Range Bound 📊',
    description: 'Sideways movement within tight bands',
    trendBias: 0,
    volatilityMultiplier: 0.6,
    fakeBreakoutChance: 0.25,
    newsEventChance: 0.03,
  },
  {
    id: 'volatile',
    name: 'High Volatility ⚡',
    description: 'Wild swings in both directions',
    trendBias: 0,
    volatilityMultiplier: 2.0,
    fakeBreakoutChance: 0.2,
    newsEventChance: 0.15,
  },
];

export const GAME_CONFIG = {
  INITIAL_BALANCE: 500000, // ₹5,00,000
  GAME_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  TICK_INTERVAL_MS: 1000, // 1 second per candle
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 10,
  MAX_STOCKS: 3,
};

export interface Player {
  id: string;
  name: string;
  balance: number;
  positions: Position[];
  trades: Trade[];
  pnl: number;
  roi: number;
  isConnected: boolean;
  joinedAt: number;
}

export interface Position {
  stockSymbol: string;
  quantity: number; // negative for short
  avgPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
}

export interface Trade {
  id: string;
  stockSymbol: string;
  type: 'buy' | 'sell' | 'short' | 'cover';
  quantity: number;
  price: number;
  timestamp: number;
  pnl?: number;
}

export interface GameRoom {
  id: string;
  code: string;
  adminId: string;
  status: 'waiting' | 'playing' | 'paused' | 'ended';
  stocks: Stock[];
  scenario: MarketScenario;
  players: Player[];
  startTime?: number;
  endTime?: number;
  isLocked: boolean;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Generate room code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Format currency in Indian format
export const formatINR = (amount: number): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);
  
  return isNegative ? `-${formatted}` : formatted;
};

// Format percentage
export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Format time remaining
export const formatTimeRemaining = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
