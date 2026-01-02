import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { CandleData } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';

interface TradingChartProps {
  symbol: string;
  name: string;
  candles: CandleData[];
  currentPrice: number;
  className?: string;
}

const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  name,
  candles,
  currentPrice,
  className,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.3)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.3)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#22d3ee',
          width: 1,
          style: 2,
          labelBackgroundColor: '#22d3ee',
        },
        horzLine: {
          color: '#22d3ee',
          width: 1,
          style: 2,
          labelBackgroundColor: '#22d3ee',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const formattedCandles: CandlestickData<Time>[] = candles.map((candle) => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(formattedCandles);
    
    // Auto-scroll to the latest candle
    if (chartRef.current) {
      chartRef.current.timeScale().scrollToRealTime();
    }

    // Calculate price change
    if (candles.length > 1) {
      const firstPrice = candles[0].open;
      const change = currentPrice - firstPrice;
      const changePercent = (change / firstPrice) * 100;
      setPriceChange(change);
      setPriceChangePercent(changePercent);
    }
  }, [candles, currentPrice]);

  const isPositive = priceChange >= 0;

  return (
    <div className={cn('glass-card p-4 flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{symbol.slice(0, 2)}</span>
          </div>
          <div>
            <h3 className="font-bold text-foreground">{symbol}</h3>
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="price-display text-xl text-foreground animate-market-tick">
            ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={cn(
            'ticker-display text-sm',
            isPositive ? 'profit-text' : 'loss-text'
          )}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={chartContainerRef} 
        className="flex-1 min-h-[200px] md:min-h-[300px] rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default TradingChart;
