'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';

interface TradingChartProps {
  candles: any[];
  currentPrice: number;
}

export default function TradingChart({ candles, currentPrice }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Use addSeries with the CandlestickSeries definition
    const candlestickSeriesInstance = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    }) as ISeriesApi<'Candlestick'>;

    chartRef.current = chart;
    seriesRef.current = candlestickSeriesInstance;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const formattedCandles: CandlestickData<Time>[] = candles.map((candle) => ({
      time: (candle.time as number) as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(formattedCandles);
    
    if (chartRef.current && formattedCandles.length > 0) {
      // Scroll to the end of the chart
      setTimeout(() => {
        if (chartRef.current) {
          try {
            chartRef.current.timeScale().scrollToPosition(-1, false);
          } catch (e) {
            // Ignore scroll errors
          }
        }
      }, 0);
    }
  }, [candles]);

  return (
    <div>
      <div className="mb-2 text-right">
        <span className="text-2xl font-bold text-blue-400">
          {currentPrice > 0 ? `₹${currentPrice.toFixed(2)}` : 'Waiting for price...'}
        </span>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
