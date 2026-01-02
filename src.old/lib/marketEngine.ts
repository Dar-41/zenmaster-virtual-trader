import { CandleData, MarketScenarioConfig, Stock } from './gameTypes';

// Market simulation engine
export class MarketEngine {
  private stock: Stock;
  private scenario: MarketScenarioConfig;
  private currentPrice: number;
  private candles: CandleData[] = [];
  private tickCount: number = 0;
  private trend: number = 0;
  private momentum: number = 0;

  constructor(stock: Stock, scenario: MarketScenarioConfig) {
    this.stock = stock;
    this.scenario = scenario;
    this.currentPrice = stock.basePrice;
    this.trend = scenario.trendBias;
    this.momentum = 0;
  }

  generateTick(timestamp: number): CandleData {
    this.tickCount++;
    
    // Base volatility adjusted by scenario
    const baseVolatility = this.stock.volatility * this.scenario.volatilityMultiplier;
    
    // Random walk with trend
    const randomFactor = (Math.random() - 0.5) * 2;
    const trendFactor = this.trend * 0.001;
    
    // Momentum decay
    this.momentum = this.momentum * 0.95 + randomFactor * 0.05;
    
    // Calculate price change
    let priceChange = this.currentPrice * baseVolatility * 0.005 * (randomFactor + trendFactor + this.momentum);
    
    // Fake breakout logic
    if (Math.random() < this.scenario.fakeBreakoutChance * 0.01) {
      const breakoutDirection = Math.random() > 0.5 ? 1 : -1;
      priceChange = this.currentPrice * baseVolatility * 0.02 * breakoutDirection;
      // Reverse next tick
      this.momentum = -breakoutDirection * 0.5;
    }
    
    // News event logic (sudden spike)
    if (Math.random() < this.scenario.newsEventChance * 0.01) {
      const newsImpact = (Math.random() - 0.5) * 2;
      priceChange = this.currentPrice * baseVolatility * 0.03 * newsImpact;
      this.trend += newsImpact * 0.1;
    }
    
    // Stop hunt wick logic
    const wickMultiplier = Math.random() > 0.9 ? 2 : 1;
    
    const open = this.currentPrice;
    const close = Math.max(1, this.currentPrice + priceChange);
    const high = Math.max(open, close) + Math.abs(priceChange) * wickMultiplier * Math.random();
    const low = Math.min(open, close) - Math.abs(priceChange) * wickMultiplier * Math.random();
    
    this.currentPrice = close;
    
    const candle: CandleData = {
      time: timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(Math.max(1, low).toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 100000) + 50000,
    };
    
    this.candles.push(candle);
    return candle;
  }

  getCurrentPrice(): number {
    return this.currentPrice;
  }

  getCandles(): CandleData[] {
    return this.candles;
  }

  // Admin controls
  injectVolatility(magnitude: number = 2) {
    this.momentum = (Math.random() - 0.5) * magnitude;
  }

  injectTrend(direction: 'up' | 'down', strength: number = 0.5) {
    this.trend = direction === 'up' ? strength : -strength;
  }

  injectFakeBreakout() {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const breakoutMove = this.currentPrice * this.stock.volatility * 0.025 * direction;
    this.currentPrice += breakoutMove;
    this.momentum = -direction * 0.8; // Reversal momentum
  }

  injectNewsCandle() {
    const impact = (Math.random() - 0.5) * 4;
    const newsMove = this.currentPrice * this.stock.volatility * 0.04 * impact;
    this.currentPrice += newsMove;
    this.trend += impact * 0.15;
  }

  reset() {
    this.currentPrice = this.stock.basePrice;
    this.candles = [];
    this.tickCount = 0;
    this.trend = this.scenario.trendBias;
    this.momentum = 0;
  }
}

// Generate initial candle history for chart
export const generateInitialCandles = (
  stock: Stock,
  scenario: MarketScenarioConfig,
  count: number = 60
): CandleData[] => {
  const engine = new MarketEngine(stock, scenario);
  const now = Math.floor(Date.now() / 1000);
  
  const candles: CandleData[] = [];
  for (let i = count; i > 0; i--) {
    candles.push(engine.generateTick(now - i));
  }
  
  return candles;
};
