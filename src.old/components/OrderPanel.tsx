import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/gameStore';
import { formatINR, Stock, Position } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderPanelProps {
  stock: Stock;
  currentPrice: number;
  className?: string;
}

const OrderPanel: React.FC<OrderPanelProps> = ({ stock, currentPrice, className }) => {
  const [quantity, setQuantity] = useState(10);
  const { currentPlayer, executeBuy, executeSell, executeShort } = useGameStore();

  const position = currentPlayer?.positions.find(p => p.stockSymbol === stock.symbol);
  const canBuy = currentPlayer && currentPlayer.balance >= currentPrice * quantity;
  const canSell = position && position.quantity >= quantity;
  const canShort = currentPlayer && currentPlayer.balance >= currentPrice * quantity * 0.5;

  const handleBuy = () => {
    executeBuy(stock.symbol, quantity);
  };

  const handleSell = () => {
    executeSell(stock.symbol, quantity);
  };

  const handleShort = () => {
    executeShort(stock.symbol, quantity);
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const orderValue = currentPrice * quantity;

  return (
    <div className={cn('glass-card p-4 space-y-4', className)}>
      {/* Stock info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground">{stock.symbol}</h3>
          <p className="text-xs text-muted-foreground">{stock.sector}</p>
        </div>
        <div className="text-right">
          <div className="price-display text-lg text-foreground">
            ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Quantity selector */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Quantity</label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustQuantity(-10)}
            className="h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 h-10 bg-secondary border border-border rounded-lg text-center font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustQuantity(10)}
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Order value */}
      <div className="p-3 bg-secondary/50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order Value</span>
          <span className="font-mono font-semibold text-foreground">{formatINR(orderValue)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="buy"
          size="lg"
          onClick={handleBuy}
          disabled={!canBuy}
          className="flex-1"
        >
          <TrendingUp className="h-5 w-5 mr-1" />
          BUY
        </Button>
        <Button
          variant="sell"
          size="lg"
          onClick={handleSell}
          disabled={!canSell}
          className="flex-1"
        >
          <TrendingDown className="h-5 w-5 mr-1" />
          SELL
        </Button>
      </div>

      {/* Short sell button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleShort}
        disabled={!canShort}
        className="w-full border-warning/50 text-warning hover:bg-warning/10 hover:border-warning"
      >
        SHORT SELL
      </Button>

      {/* Current position */}
      <AnimatePresence>
        {position && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: position.unrealizedPnl >= 0 ? 'hsl(142 71% 45% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
              borderColor: position.unrealizedPnl >= 0 ? 'hsl(142 71% 45% / 0.3)' : 'hsl(0 72% 51% / 0.3)',
            }}
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Position</span>
              <span className={cn(
                'font-mono font-bold',
                position.quantity > 0 ? 'profit-text' : 'loss-text'
              )}>
                {position.quantity > 0 ? '+' : ''}{position.quantity} @ ₹{position.avgPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-muted-foreground">Unrealized P&L</span>
              <span className={cn(
                'font-mono font-bold',
                position.unrealizedPnl >= 0 ? 'profit-text' : 'loss-text'
              )}>
                {formatINR(position.unrealizedPnl)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderPanel;
