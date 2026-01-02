const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const next = require('next');

// Import game logic
const { MarketEngine } = require('./server/marketEngine');
const { generateRoomCode, INDIAN_STOCKS, MARKET_SCENARIOS, GAME_CONFIG } = require('./server/gameTypes');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);

    // Allow CORS for development, though same-origin is preferred in production
    server.use(cors());
    server.use(express.json());

    // Socket.io Setup
    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all connections for simplicity in monolith
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // --- GAME LOGIC START ---

    // In-memory game state
    const rooms = new Map();
    const players = new Map();

    // Market engines per room
    const marketEngines = new Map();

    // Admin controls state per room
    const adminControls = new Map();

    // Generate price tick for a room
    function generatePriceTick(roomId) {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return null;

        const engine = marketEngines.get(roomId);
        if (!engine) return null;

        const controls = adminControls.get(roomId) || { bias: 0, volatility: 1, paused: false };

        if (controls.paused) {
            return null;
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const candle = engine.generateTick(timestamp, controls);

        // Update all player positions with new price
        room.players.forEach(player => {
            player.positions.forEach(position => {
                position.currentPrice = candle.close;
                const priceDiff = position.quantity > 0
                    ? (candle.close - position.avgPrice)
                    : (position.avgPrice - candle.close);
                position.unrealizedPnl = position.quantity * priceDiff;
            });

            // Calculate total P&L
            const realizedPnl = player.trades
                .filter(t => t.pnl !== undefined)
                .reduce((sum, t) => sum + (t.pnl || 0), 0);
            const unrealizedPnl = player.positions
                .reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
            player.pnl = realizedPnl + unrealizedPnl;
            player.roi = ((player.balance + player.pnl - GAME_CONFIG.INITIAL_BALANCE) / GAME_CONFIG.INITIAL_BALANCE) * 100;
        });

        return candle;
    }

    // Start game timer
    function startGameTimer(roomId) {
        const room = rooms.get(roomId);
        if (!room) return;

        const engine = marketEngines.get(roomId);
        if (!engine) return;

        room.startTime = Date.now();
        room.endTime = room.startTime + GAME_CONFIG.GAME_DURATION_MS;
        room.status = 'playing';

        // Generate initial candles for chart history
        const now = Math.floor(Date.now() / 1000);
        const initialCandles = [];
        for (let i = 60; i > 0; i--) {
            const candle = engine.generateTick(now - i, { bias: 0, volatility: 1, paused: false });
            initialCandles.push(candle);
        }

        // Send initial candles to all players
        io.to(roomId).emit('initialCandles', { candles: initialCandles });

        // Countdown before starting price ticks (3 seconds)
        let countdown = 3;
        io.to(roomId).emit('gameCountdown', { countdown });

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                io.to(roomId).emit('gameCountdown', { countdown });
            } else {
                clearInterval(countdownInterval);
                io.to(roomId).emit('gameCountdown', { countdown: 0 });

                // Start price ticks immediately after countdown
                startPriceTicks(roomId);
            }
        }, 1000);
    }

    // Start price tick interval
    function startPriceTicks(roomId) {
        const room = rooms.get(roomId);
        if (!room) return;

        // Price tick interval (1 second)
        const tickInterval = setInterval(() => {
            if (room.status !== 'playing') {
                clearInterval(tickInterval);
                return;
            }

            const candle = generatePriceTick(roomId);
            if (candle) {
                io.to(roomId).emit('priceTick', {
                    roomId,
                    candle,
                    timestamp: Date.now()
                });

                // Update leaderboard
                updateLeaderboard(roomId);
            }

            // Check if game should end
            if (Date.now() >= room.endTime) {
                endGame(roomId);
                clearInterval(tickInterval);
            }
        }, GAME_CONFIG.TICK_INTERVAL_MS);

        // Store interval for cleanup
        room.tickInterval = tickInterval;
    }

    // Update leaderboard
    function updateLeaderboard(roomId) {
        const room = rooms.get(roomId);
        if (!room) return;

        const leaderboard = room.players
            .map(p => ({
                id: p.id,
                name: p.name,
                pnl: p.pnl,
                roi: p.roi,
                balance: p.balance + p.pnl
            }))
            .sort((a, b) => b.pnl - a.pnl);

        io.to(roomId).emit('updateLeaderboard', { roomId, leaderboard });
    }

    // End game and square off positions
    function endGame(roomId) {
        const room = rooms.get(roomId);
        if (!room) return;

        room.status = 'ended';

        // Square off all positions at current price
        const engine = marketEngines.get(roomId);
        const currentPrice = engine ? engine.getCurrentPrice() : 0;

        room.players.forEach(player => {
            player.positions.forEach(position => {
                const priceDiff = position.quantity > 0
                    ? (currentPrice - position.avgPrice)
                    : (position.avgPrice - currentPrice);
                const pnl = position.quantity * priceDiff;

                player.balance += pnl;
                player.trades.push({
                    id: `squareoff-${Date.now()}-${Math.random()}`,
                    stockSymbol: position.stockSymbol,
                    type: position.quantity > 0 ? 'sell' : 'cover',
                    quantity: Math.abs(position.quantity),
                    price: currentPrice,
                    timestamp: Date.now(),
                    pnl
                });
            });

            player.positions = [];

            // Final P&L calculation
            const realizedPnl = player.trades
                .filter(t => t.pnl !== undefined)
                .reduce((sum, t) => sum + (t.pnl || 0), 0);
            player.pnl = realizedPnl;
            player.roi = ((player.balance + player.pnl - GAME_CONFIG.INITIAL_BALANCE) / GAME_CONFIG.INITIAL_BALANCE) * 100;
        });

        updateLeaderboard(roomId);

        io.to(roomId).emit('endGame', {
            roomId,
            leaderboard: room.players
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    pnl: p.pnl,
                    roi: p.roi,
                    balance: p.balance + p.pnl
                }))
                .sort((a, b) => b.pnl - a.pnl)
        });
    }

    // Socket.io connection handling
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Create room (admin)
        socket.on('createRoom', ({ adminName, stockSymbol, scenario }) => {
            const roomCode = generateRoomCode();
            const roomId = `room-${roomCode}`;

            const stock = INDIAN_STOCKS.find(s => s.symbol === stockSymbol) || INDIAN_STOCKS[0];
            const scenarioConfig = MARKET_SCENARIOS.find(s => s.id === scenario) || MARKET_SCENARIOS[0];

            const admin = {
                id: socket.id,
                name: adminName,
                balance: GAME_CONFIG.INITIAL_BALANCE,
                positions: [],
                trades: [],
                pnl: 0,
                roi: 0,
                isConnected: true,
                joinedAt: Date.now()
            };

            const room = {
                id: roomId,
                code: roomCode,
                adminId: socket.id,
                status: 'waiting',
                stock,
                scenario: scenarioConfig.id,
                players: [admin],
                isLocked: false
            };

            rooms.set(roomId, room);
            players.set(socket.id, { roomId, playerId: admin.id, isAdmin: true });

            // Initialize market engine
            const engine = new MarketEngine(stock, scenarioConfig);
            marketEngines.set(roomId, engine);
            adminControls.set(roomId, { bias: 0, volatility: 1, paused: false });

            socket.join(roomId);
            socket.emit('roomCreated', { roomId, roomCode, room });

            console.log(`Room created: ${roomCode} by ${adminName}`);
        });

        // Join room (player)
        socket.on('joinRoom', ({ roomCode, playerName }) => {
            const room = Array.from(rooms.values()).find(r => r.code === roomCode);

            if (!room) {
                socket.emit('joinError', { message: 'Room not found' });
                return;
            }

            if (room.isLocked) {
                socket.emit('joinError', { message: 'Room is locked' });
                return;
            }

            if (room.status !== 'waiting') {
                socket.emit('joinError', { message: 'Game already started' });
                return;
            }

            if (room.players.length >= GAME_CONFIG.MAX_PLAYERS) {
                socket.emit('joinError', { message: 'Room is full' });
                return;
            }

            const player = {
                id: socket.id,
                name: playerName,
                balance: GAME_CONFIG.INITIAL_BALANCE,
                positions: [],
                trades: [],
                pnl: 0,
                roi: 0,
                isConnected: true,
                joinedAt: Date.now()
            };

            room.players.push(player);
            players.set(socket.id, { roomId: room.id, playerId: player.id, isAdmin: false });

            socket.join(room.id);
            socket.emit('joinedRoom', { roomId: room.id, room });
            io.to(room.id).emit('playerJoined', { player, room });

            console.log(`Player ${playerName} joined room ${roomCode}`);
        });

        // Start game
        socket.on('startGame', ({ roomId }) => {
            const room = rooms.get(roomId);
            const playerData = players.get(socket.id);

            if (!room || !playerData || !playerData.isAdmin) {
                socket.emit('error', { message: 'Unauthorized' });
                return;
            }

            if (room.players.length < GAME_CONFIG.MIN_PLAYERS) {
                socket.emit('error', { message: `Need at least ${GAME_CONFIG.MIN_PLAYERS} players` });
                return;
            }

            if (room.status !== 'waiting') {
                socket.emit('error', { message: 'Game already started' });
                return;
            }

            startGameTimer(roomId);
            io.to(roomId).emit('gameStarted', { roomId, startTime: room.startTime, endTime: room.endTime });

            console.log(`Game started in room ${roomId}`);
        });

        // Place trade
        socket.on('placeTrade', ({ roomId, type, quantity }) => {
            const room = rooms.get(roomId);
            const playerData = players.get(socket.id);

            if (!room || !playerData) {
                socket.emit('tradeError', { message: 'Invalid room or player' });
                return;
            }

            if (room.status !== 'playing') {
                socket.emit('tradeError', { message: 'Game not active' });
                return;
            }

            const player = room.players.find(p => p.id === playerData.playerId);
            if (!player) {
                socket.emit('tradeError', { message: 'Player not found' });
                return;
            }

            const engine = marketEngines.get(roomId);
            const currentPrice = engine ? engine.getCurrentPrice() : 0;

            if (currentPrice === 0) {
                socket.emit('tradeError', { message: 'Market not ready' });
                return;
            }

            // Validate and execute trade
            const tradeCost = currentPrice * quantity;
            let position = player.positions.find(p => p.stockSymbol === room.stock.symbol);

            if (type === 'buy') {
                if (player.balance < tradeCost) {
                    socket.emit('tradeError', { message: 'Insufficient balance' });
                    return;
                }

                if (position && position.quantity < 0) {
                    // Covering short position
                    const coverQuantity = Math.min(quantity, Math.abs(position.quantity));
                    const remainingQuantity = quantity - coverQuantity;
                    const pnl = coverQuantity * (position.avgPrice - currentPrice);
                    const coverCost = currentPrice * coverQuantity;

                    // Pay for covering, then add P&L
                    player.balance -= coverCost;
                    player.balance += pnl;
                    player.trades.push({
                        id: `trade-${Date.now()}-${Math.random()}`,
                        stockSymbol: room.stock.symbol,
                        type: 'cover',
                        quantity: coverQuantity,
                        price: currentPrice,
                        timestamp: Date.now(),
                        pnl
                    });

                    if (coverQuantity === Math.abs(position.quantity)) {
                        player.positions = player.positions.filter(p => p.stockSymbol !== room.stock.symbol);
                    } else {
                        position.quantity += coverQuantity;
                    }

                    if (remainingQuantity > 0) {
                        player.balance -= currentPrice * remainingQuantity;
                        const remainingPosition = player.positions.find(p => p.stockSymbol === room.stock.symbol);
                        if (!remainingPosition) {
                            player.positions.push({
                                stockSymbol: room.stock.symbol,
                                quantity: remainingQuantity,
                                avgPrice: currentPrice,
                                currentPrice,
                                unrealizedPnl: 0
                            });
                        } else {
                            const totalCost = remainingPosition.avgPrice * Math.abs(remainingPosition.quantity) + currentPrice * remainingQuantity;
                            remainingPosition.quantity = remainingQuantity;
                            remainingPosition.avgPrice = totalCost / remainingQuantity;
                            remainingPosition.currentPrice = currentPrice;
                        }
                    }
                } else {
                    // Opening long position
                    player.balance -= tradeCost;
                    if (position) {
                        const totalCost = position.avgPrice * position.quantity + tradeCost;
                        position.quantity += quantity;
                        position.avgPrice = totalCost / position.quantity;
                        position.currentPrice = currentPrice;
                    } else {
                        player.positions.push({
                            stockSymbol: room.stock.symbol,
                            quantity,
                            avgPrice: currentPrice,
                            currentPrice,
                            unrealizedPnl: 0
                        });
                    }

                    player.trades.push({
                        id: `trade-${Date.now()}-${Math.random()}`,
                        stockSymbol: room.stock.symbol,
                        type: 'buy',
                        quantity,
                        price: currentPrice,
                        timestamp: Date.now()
                    });
                }
            } else if (type === 'sell') {
                if (!position || position.quantity <= 0) {
                    socket.emit('tradeError', { message: 'No long position to sell' });
                    return;
                }

                const sellQuantity = Math.min(quantity, position.quantity);
                const pnl = sellQuantity * (currentPrice - position.avgPrice);

                // Return capital + profit
                player.balance += currentPrice * sellQuantity;
                player.trades.push({
                    id: `trade-${Date.now()}-${Math.random()}`,
                    stockSymbol: room.stock.symbol,
                    type: 'sell',
                    quantity: sellQuantity,
                    price: currentPrice,
                    timestamp: Date.now(),
                    pnl
                });

                if (sellQuantity === position.quantity) {
                    player.positions = player.positions.filter(p => p.stockSymbol !== room.stock.symbol);
                } else {
                    position.quantity -= sellQuantity;
                }
            } else if (type === 'short') {
                if (position && position.quantity > 0) {
                    socket.emit('tradeError', { message: 'Close long position first' });
                    return;
                }

                // Opening short position
                if (!position) {
                    player.positions.push({
                        stockSymbol: room.stock.symbol,
                        quantity: -quantity,
                        avgPrice: currentPrice,
                        currentPrice,
                        unrealizedPnl: 0
                    });
                } else {
                    const totalCost = position.avgPrice * Math.abs(position.quantity) + currentPrice * quantity;
                    position.quantity -= quantity;
                    position.avgPrice = totalCost / Math.abs(position.quantity);
                    position.currentPrice = currentPrice;
                }

                player.trades.push({
                    id: `trade-${Date.now()}-${Math.random()}`,
                    stockSymbol: room.stock.symbol,
                    type: 'short',
                    quantity,
                    price: currentPrice,
                    timestamp: Date.now()
                });
            }

            // Update P&L
            player.positions.forEach(p => {
                const priceDiff = p.quantity > 0
                    ? (currentPrice - p.avgPrice)
                    : (p.avgPrice - currentPrice);
                p.unrealizedPnl = p.quantity * priceDiff;
            });

            const realizedPnl = player.trades
                .filter(t => t.pnl !== undefined)
                .reduce((sum, t) => sum + (t.pnl || 0), 0);
            const unrealizedPnl = player.positions
                .reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
            player.pnl = realizedPnl + unrealizedPnl;
            player.roi = ((player.balance + player.pnl - GAME_CONFIG.INITIAL_BALANCE) / GAME_CONFIG.INITIAL_BALANCE) * 100;

            socket.emit('tradeExecuted', { player, trade: player.trades[player.trades.length - 1] });
            updateLeaderboard(roomId);
        });

        // Admin controls
        socket.on('adminControl', ({ roomId, action, value }) => {
            const room = rooms.get(roomId);
            const playerData = players.get(socket.id);

            if (!room || !playerData || !playerData.isAdmin) {
                socket.emit('error', { message: 'Unauthorized' });
                return;
            }

            const controls = adminControls.get(roomId) || { bias: 0, volatility: 1, paused: false };

            switch (action) {
                case 'priceUp':
                    controls.bias = Math.min(controls.bias + 0.3, 1.0);
                    break;
                case 'priceDown':
                    controls.bias = Math.max(controls.bias - 0.3, -1.0);
                    break;
                case 'volatility':
                    controls.volatility = Math.max(0.5, Math.min(3.0, value || 1.0));
                    break;
                case 'pause':
                    controls.paused = true;
                    break;
                case 'resume':
                    controls.paused = false;
                    break;
                case 'resetBias':
                    controls.bias = 0;
                    break;
            }

            adminControls.set(roomId, controls);
            io.to(roomId).emit('adminControlUpdate', { controls });
        });

        // Lock/unlock room
        socket.on('toggleLock', ({ roomId }) => {
            const room = rooms.get(roomId);
            const playerData = players.get(socket.id);

            if (!room || !playerData || !playerData.isAdmin) {
                socket.emit('error', { message: 'Unauthorized' });
                return;
            }

            room.isLocked = !room.isLocked;
            io.to(roomId).emit('roomLocked', { isLocked: room.isLocked });
        });

        // Disconnect handling
        socket.on('disconnect', () => {
            const playerData = players.get(socket.id);
            if (playerData) {
                const room = rooms.get(playerData.roomId);
                if (room) {
                    const player = room.players.find(p => p.id === playerData.playerId);
                    if (player) {
                        player.isConnected = false;
                        io.to(playerData.roomId).emit('playerDisconnected', { playerId: player.id });
                    }
                }
                players.delete(socket.id);
            }
            console.log('Client disconnected:', socket.id);
        });
    });

    // --- GAME LOGIC END ---

    // Handle all other requests with Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
