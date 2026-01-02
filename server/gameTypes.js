const INDIAN_STOCKS = [
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

const MARKET_SCENARIOS = [
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

const GAME_CONFIG = {
  INITIAL_BALANCE: 500000,
  GAME_DURATION_MS: 5 * 60 * 1000,
  TICK_INTERVAL_MS: 1000,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  MAX_STOCKS: 3,
};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function formatINR(amount) {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);
  return isNegative ? `-${formatted}` : formatted;
}

function formatPercent(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatTimeRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {
  INDIAN_STOCKS,
  MARKET_SCENARIOS,
  GAME_CONFIG,
  generateRoomCode,
  formatINR,
  formatPercent,
  formatTimeRemaining,
};

