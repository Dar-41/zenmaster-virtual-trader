'use client';

import { useState } from 'react';

interface AdminControlsProps {
  onControl: (action: string, value?: number) => void;
  controls: {
    bias: number;
    volatility: number;
    paused: boolean;
  };
  disabled: boolean;
}

export default function AdminControls({ onControl, controls, disabled }: AdminControlsProps) {
  const [volatility, setVolatility] = useState(controls.volatility);

  const handleVolatilityChange = (value: number) => {
    setVolatility(value);
    onControl('volatility', value);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Admin Controls</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => onControl('priceUp')}
              disabled={disabled}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              ↑ Push Price UP
            </button>
            <button
              onClick={() => onControl('priceDown')}
              disabled={disabled}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              ↓ Push Price DOWN
            </button>
          </div>
          <button
            onClick={() => onControl('resetBias')}
            disabled={disabled}
            className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Reset Bias
          </button>
          <div className="mt-2 text-sm text-gray-400">
            Current Bias: {controls.bias > 0 ? '+' : ''}{controls.bias.toFixed(2)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Volatility: {volatility.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={volatility}
            onChange={(e) => handleVolatilityChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          {controls.paused ? (
            <button
              onClick={() => onControl('resume')}
              disabled={disabled}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              ▶ Resume Market
            </button>
          ) : (
            <button
              onClick={() => onControl('pause')}
              disabled={disabled}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              ⏸ Pause Market
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400 space-y-1">
            <div>Bias: {controls.bias > 0 ? 'UP' : controls.bias < 0 ? 'DOWN' : 'NEUTRAL'}</div>
            <div>Volatility: {controls.volatility.toFixed(2)}x</div>
            <div>Status: {controls.paused ? 'PAUSED' : 'RUNNING'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

