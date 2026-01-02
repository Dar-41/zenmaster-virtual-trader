export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  volatility: number;
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
  trendBias: number;
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
  INITIAL_BALANCE: 500000,
  GAME_DURATION_MS: 5 * 60 * 1000,
  TICK_INTERVAL_MS: 1000,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  MAX_STOCKS: 3,
};

