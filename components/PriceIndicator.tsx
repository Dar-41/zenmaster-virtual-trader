'use client';

import { useEffect, useState } from 'react';

interface PriceIndicatorProps {
  currentPrice: number;
  previousPrice: number;
}

export default function PriceIndicator({ currentPrice, previousPrice }: PriceIndicatorProps) {
  const [change, setChange] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (previousPrice > 0 && currentPrice !== previousPrice) {
      const priceChange = currentPrice - previousPrice;
      const percentChange = (priceChange / previousPrice) * 100;
      setChange(percentChange);
      setIsAnimating(true);
      
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [currentPrice, previousPrice]);

  if (change === 0 || !isAnimating) return null;

  const isPositive = change > 0;
  const bgColor = isPositive ? 'bg-green-500' : 'bg-red-500';
  const icon = isPositive ? '↑' : '↓';

  return (
    <div
      className={`fixed top-20 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-40 animate-bounce`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="font-bold">
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

