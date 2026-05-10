import { FastifyInstance } from 'fastify';
import { getServerState, startServer, stopServer, restartServer, getLogs } from '../services/processManager.js';
import { getAllServerConfigs, saveServerConfig, deleteServerConfig } from '../db/queries.js';

export async function serverRoutes(fastify: FastifyInstance) {
  // Get server status
  fastify.get('/api/server/status', async () => {
    return getServerState();
  });

  // Start server
  fastify.post('/api/server/start', async (request, reply) => {
    try {
      const config = request.body as any;
      const state = await startServer(config);
      return state;
    } catch (err: any) {
      reply.code(500).send({ message: err.message });
    }
  });

  // Stop server
  fastify.post('/api/server/stop', async () => {
    await stopServer();
    return { success: true };
  });

  // Restart server
  fastify.post('/api/server/restart', async (request, reply) => {
    try {
      const config = request.body as any;
      const state = await restartServer(config);
      return state;
    } catch (err: any) {
      reply.code(500).send({ message: err.message });
    }
  });

  // Get logs
  fastify.get('/api/server/logs', async () => {
    return getLogs();
  });

  // Get saved configs
  fastify.get('/api/server/configs', async () => {
    return getAllServerConfigs();
  });

  // Save config
  fastify.post('/api/server/configs', async (request) => {
    const config = request.body as any;
    return saveServerConfig(config);
  });

  // Delete config
  fastify.delete('/api/server/configs/:id', async (request) => {
    const { id } = request.params as { id: string };
    const success = deleteServerConfig(id);
    return { success };
  });
}
