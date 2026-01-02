const { MARKET_SCENARIOS } = require('./gameTypes');

class MarketEngine {
  constructor(stock, scenarioConfig) {
    this.stock = stock;
    this.scenario = scenarioConfig;
    this.currentPrice = stock.basePrice;
    this.candles = [];
    this.tickCount = 0;
    this.trend = scenarioConfig.trendBias;
    this.momentum = 0;
  }

  generateTick(timestamp, adminControls = { bias: 0, volatility: 1, paused: false }) {
    if (adminControls.paused) {
      return this.getLastCandle() || this.createCandle(timestamp, this.currentPrice);
    }

    this.tickCount++;
    
    // Apply admin bias (gradual, not instant)
    const adminBias = adminControls.bias || 0;
    const effectiveTrend = this.trend + adminBias * 0.5;
    
    // Base volatility adjusted by scenario and admin
    const baseVolatility = this.stock.volatility * this.scenario.volatilityMultiplier * adminControls.volatility;
    
    // Random walk with trend
    const randomFactor = (Math.random() - 0.5) * 2;
    const trendFactor = effectiveTrend * 0.001;
    
    // Momentum decay
    this.momentum = this.momentum * 0.95 + randomFactor * 0.05;
    
    // Calculate price change
    let priceChange = this.currentPrice * baseVolatility * 0.005 * (randomFactor + trendFactor + this.momentum);
    
    // Apply admin bias directly to price change
    priceChange += this.currentPrice * adminBias * 0.002;
    
    // Fake breakout logic
    if (Math.random() < this.scenario.fakeBreakoutChance * 0.01) {
      const breakoutDirection = Math.random() > 0.5 ? 1 : -1;
      priceChange = this.currentPrice * baseVolatility * 0.02 * breakoutDirection;
      this.momentum = -breakoutDirection * 0.5;
    }
    
    // News event logic
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
    
    const candle = {
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

  getCurrentPrice() {
    return this.currentPrice;
  }

  getCandles() {
    return this.candles;
  }

  getLastCandle() {
    return this.candles.length > 0 ? this.candles[this.candles.length - 1] : null;
  }

  createCandle(timestamp, price) {
    return {
      time: timestamp,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0
    };
  }

  reset() {
    this.currentPrice = this.stock.basePrice;
    this.candles = [];
    this.tickCount = 0;
    this.trend = this.scenario.trendBias;
    this.momentum = 0;
  }
}

module.exports = { MarketEngine };

