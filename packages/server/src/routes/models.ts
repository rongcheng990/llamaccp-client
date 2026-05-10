import { FastifyInstance } from 'fastify';
import { getLocalModels, scanModels, deleteModel } from '../services/modelManager.js';

function toCamelCase(row: any) {
  return {
    id: row.id,
    name: row.name,
    fileName: row.file_name,
    filePath: row.file_path,
    fileSize: row.file_size,
    quantization: row.quantization,
    parameterCount: row.parameter_count,
    addedAt: row.added_at,
    lastUsed: row.last_used,
  };
}

export async function modelRoutes(fastify: FastifyInstance) {
  // Get local models
  fastify.get('/api/models/local', async () => {
    return getLocalModels().map(toCamelCase);
  });

  // Delete a model
  fastify.delete('/api/models/local/:id', async (request) => {
    const { id } = request.params as { id: string };
    const success = deleteModel(id);
    return { success };
  });

  // Scan for models
  fastify.post('/api/models/local/scan', async () => {
    return (await scanModels()).map(toCamelCase);
  });
}
