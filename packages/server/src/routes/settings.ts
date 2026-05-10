import { FastifyInstance } from 'fastify';
import { getSettings, updateSettings } from '../services/settingsManager.js';
import { detectLlamaCpp } from '../services/llamaDetector.js';
import { setSetting } from '../db/queries.js';

export async function settingsRoutes(fastify: FastifyInstance) {
  // Get settings
  fastify.get('/api/settings', async () => {
    return getSettings();
  });

  // Update settings
  fastify.put('/api/settings', async (request) => {
    const partial = request.body as any;
    return updateSettings(partial);
  });

  // Auto-detect llama.cpp
  fastify.post('/api/settings/detect', async () => {
    const result = await detectLlamaCpp();
    if (result.found && result.path) {
      setSetting('llamaServerPath', result.path);
    }
    return result;
  });
}
