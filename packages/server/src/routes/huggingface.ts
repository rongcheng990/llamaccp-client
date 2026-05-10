import { FastifyInstance } from 'fastify';

const HF_API_BASE = process.env.HF_API_BASE || 'https://hf-mirror.com/api';
const HF_BASE = HF_API_BASE.replace(/\/api$/, '');

export async function huggingfaceRoutes(fastify: FastifyInstance) {
  // Search models
  fastify.get('/api/hf/search', async (request) => {
    const { q, limit = '20', offset = '0' } = request.query as { q?: string; limit?: string; offset?: string };
    const params = new URLSearchParams({
      search: q || '',
      limit,
      offset,
      filter: 'gguf',
      sort: 'downloads',
      direction: '-1',
    });

    const res = await fetch(`${HF_API_BASE}/models?${params}`);
    if (!res.ok) throw new Error(`HuggingFace API error: ${res.status}`);
    const data: any = await res.json();

    const models = (Array.isArray(data) ? data : []).map((m: any) => ({
      id: m.id,
      name: m.id.split('/').pop() || m.id,
      author: m.id.split('/')[0] || '',
      description: m.pipeline_tag || '',
      downloads: m.downloads || 0,
      likes: m.likes || 0,
      tags: m.tags || [],
      pipeline_tag: m.pipeline_tag,
      createdAt: m.createdAt,
      updatedAt: m.lastModified,
      siblings: (m.siblings || []).map((s: any) => ({
        rfilename: s.rfilename,
        size: s.rfSize || s.fileSize || null,
      })),
    }));

    return { models, total: models.length };
  });

  // Get model details — use wildcard to handle repoId with "/"
  fastify.get('/api/hf/models/*', async (request) => {
    const repoId = (request.params as { '*': string })['*'];
    const res = await fetch(`${HF_API_BASE}/models/${repoId}`);
    if (!res.ok) throw new Error(`HuggingFace API error: ${res.status}`);
    const m: any = await res.json();

    const siblings = (m.siblings || []).map((s: any) => ({
      rfilename: s.rfilename,
      size: s.rfSize || s.fileSize || null,
    }));

    // Fetch file sizes from the repo tree API for files without size info
    const needSize = siblings.filter((s: any) => !s.size);
    if (needSize.length > 0) {
      try {
        // Build a flat size map from tree listing (root + known subdirectories)
        const sizeMap = new Map<string, number>();
        const dirs = new Set<string>();
        for (const s of siblings) {
          const idx = s.rfilename.indexOf('/');
          if (idx > 0) dirs.add(s.rfilename.substring(0, idx));
        }
        const pathsToFetch = ['tree/main', ...[...dirs].map((d) => `tree/main/${d}`)];
        for (const p of pathsToFetch) {
          const treeRes = await fetch(`${HF_API_BASE}/models/${repoId}/${p}`);
          if (treeRes.ok) {
            const tree = await treeRes.json() as any[];
            for (const item of tree) {
              if (item.type === 'file') sizeMap.set(item.path, item.size);
            }
          }
        }
        for (const s of siblings) {
          if (!s.size && sizeMap.has(s.rfilename)) {
            s.size = sizeMap.get(s.rfilename)!;
          }
        }
      } catch {
        // Ignore tree API errors
      }
    }

    return {
      id: m.id,
      name: m.id.split('/').pop() || m.id,
      author: m.id.split('/')[0] || '',
      description: m.pipeline_tag || '',
      downloads: m.downloads || 0,
      likes: m.likes || 0,
      tags: m.tags || [],
      pipeline_tag: m.pipeline_tag,
      createdAt: m.createdAt,
      updatedAt: m.lastModified,
      siblings,
    };
  });
}
