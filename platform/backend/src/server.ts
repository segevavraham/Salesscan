// Main Server Entry Point
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config/env';
import { logger, httpLogStream } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import meetingRoutes from './routes/meeting.routes';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
  },
  pingInterval: config.wsPingInterval,
  pingTimeout: config.wsPingTimeout,
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', { stream: httpLogStream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/meetings', meetingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);

  res.status(500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// ============================================================================
// WEBSOCKET
// ============================================================================

io.on('connection', (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Meeting events
  socket.on('meeting:start', async (data) => {
    logger.info(`Meeting started: ${data.meetingId}`);
    socket.join(`meeting:${data.meetingId}`);
  });

  socket.on('meeting:end', async (data) => {
    logger.info(`Meeting ended: ${data.meetingId}`);
    socket.leave(`meeting:${data.meetingId}`);
  });

  socket.on('audio:chunk', async (data) => {
    // Handle audio chunk
    // Process with AssemblyAI
    // Emit transcription back to client
  });

  socket.on('error', (error) => {
    logger.error(`WebSocket error for ${socket.id}:`, error);
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    server.listen(config.port, config.host, () => {
      logger.info('='.repeat(50));
      logger.info('🚀 Sales Coach AI Platform - Server Started');
      logger.info('='.repeat(50));
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Server: http://${config.host}:${config.port}`);
      logger.info(`Health check: http://${config.host}:${config.port}/health`);
      logger.info(`API: http://${config.host}:${config.port}/api/v1`);
      logger.info(`WebSocket: ws://${config.host}:${config.port}`);
      logger.info('='.repeat(50));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close HTTP server
  server.close(async () => {
    logger.info('HTTP server closed');

    // Disconnect from database
    await disconnectDatabase();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

export { app, server, io };
