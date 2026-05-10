import { FastifyInstance } from 'fastify';
import { startDownload, cancelDownload, getActiveDownloadsList, pauseDownload, resumeDownload } from '../services/downloadManager.js';
import { getDownloadHistory } from '../db/queries.js';

export async function downloadRoutes(fastify: FastifyInstance) {
  // Start a download
  fastify.post('/api/downloads/start', async (request, reply) => {
    try {
      const req = request.body as any;
      const progress = await startDownload(req);
      return progress;
    } catch (err: any) {
      reply.code(500).send({ message: err.message });
    }
  });

  // Cancel a download
  fastify.post('/api/downloads/cancel/:id', async (request) => {
    const { id } = request.params as { id: string };
    const success = cancelDownload(id);
    return { success };
  });

  // Pause a download
  fastify.post('/api/downloads/pause/:id', async (request) => {
    const { id } = request.params as { id: string };
    const success = pauseDownload(id);
    return { success };
  });

  // Resume a download
  fastify.post('/api/downloads/resume/:id', async (request) => {
    const { id } = request.params as { id: string };
    const progress = await resumeDownload(id);
    if (!progress) return { success: false };
    return progress;
  });

  // Get active downloads
  fastify.get('/api/downloads/active', async () => {
    return getActiveDownloadsList();
  });

  // Get download history
  fastify.get('/api/downloads/history', async () => {
    return getDownloadHistory();
  });
}
