'use client';

import { useState } from 'react';

interface TradeButtonsProps {
  onTrade: (type: 'buy' | 'sell' | 'short', quantity: number) => void;
  currentPrice: number;
  disabled: boolean;
  playerBalance?: number;
}

export default function TradeButtons({ onTrade, currentPrice, disabled, playerBalance = 0 }: TradeButtonsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleTrade = async (type: 'buy' | 'sell' | 'short') => {
    if (quantity > 0 && currentPrice > 0 && !isExecuting) {
      const tradeCost = currentPrice * quantity;
      
      if (type === 'buy' && tradeCost > playerBalance) {
        return;
      }

      setIsExecuting(true);
      onTrade(type, quantity);
      
      setTimeout(() => setIsExecuting(false), 500);
    }
  };

  const quickQuantities = [1, 5, 10, 25, 50, 100];
  const tradeCost = currentPrice * quantity;
  const canAfford = tradeCost <= playerBalance;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quantity
        </label>
        <div className="flex gap-2 mb-2">
          {quickQuantities.map((qty) => (
            <button
              key={qty}
              onClick={() => setQuantity(qty)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                quantity === qty
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {qty}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        />
        <p className={`text-sm mt-1 ${canAfford ? 'text-gray-400' : 'text-red-400'}`}>
          Total: ₹{tradeCost.toLocaleString('en-IN')}
          {!canAfford && ' (Insufficient balance)'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleTrade('buy')}
          disabled={disabled || currentPrice === 0 || isExecuting || !canAfford}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg shadow-lg"
        >
          {isExecuting ? '...' : 'Buy'}
        </button>
        <button
          onClick={() => handleTrade('sell')}
          disabled={disabled || currentPrice === 0 || isExecuting}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg shadow-lg"
        >
          {isExecuting ? '...' : 'Sell'}
        </button>
        <button
          onClick={() => handleTrade('short')}
          disabled={disabled || currentPrice === 0 || isExecuting}
          className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg shadow-lg"
        >
          {isExecuting ? '...' : 'Short'}
        </button>
      </div>
    </div>
  );
}

