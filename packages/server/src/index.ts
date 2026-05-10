import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server as SocketIOServer } from 'socket.io';
import { serverRoutes } from './routes/server.js';
import { modelRoutes } from './routes/models.js';
import { downloadRoutes } from './routes/downloads.js';
import { settingsRoutes } from './routes/settings.js';
import { huggingfaceRoutes } from './routes/huggingface.js';
import { initProcessManager } from './services/processManager.js';
import { initDownloadManager, destroyDownloadManager } from './services/downloadManager.js';
import { getDb, closeDb } from './db/database.js';

const PORT = parseInt(process.env.SERVER_PORT || '3001', 10);

async function main() {
  // Init DB
  getDb();

  // Create Fastify instance
  const fastify = Fastify({ logger: false });

  // CORS
  await fastify.register(cors, {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register routes
  await fastify.register(serverRoutes);
  await fastify.register(modelRoutes);
  await fastify.register(downloadRoutes);
  await fastify.register(settingsRoutes);
  await fastify.register(huggingfaceRoutes);

  // Wait for Fastify to be ready so fastify.server is available
  await fastify.ready();

  // Socket.IO attaches to Fastify's internal HTTP server
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Init services with socket.io
  initProcessManager(io);
  initDownloadManager(io);

  // Start — Fastify listens on the port, Socket.IO shares the same server
  await fastify.listen({ port: PORT, host: '::' });
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO ready`);

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down...');
    destroyDownloadManager();
    closeDb();
    io.close();
    await fastify.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
