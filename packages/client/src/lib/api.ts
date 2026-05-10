const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Server
  getServerStatus: () => request<import('@llamaccp/shared').ServerState>('/server/status'),
  startServer: (config: import('@llamaccp/shared').ServerConfig) =>
    request<import('@llamaccp/shared').ServerState>('/server/start', { method: 'POST', body: JSON.stringify(config) }),
  stopServer: () => request<{ success: boolean }>('/server/stop', { method: 'POST', body: '{}' }),
  restartServer: (config: import('@llamaccp/shared').ServerConfig) =>
    request<import('@llamaccp/shared').ServerState>('/server/restart', { method: 'POST', body: JSON.stringify(config) }),
  getServerLogs: () => request<string[]>('/server/logs'),
  getServerConfigs: () => request<import('@llamaccp/shared').ServerConfig[]>('/server/configs'),
  saveServerConfig: (config: import('@llamaccp/shared').ServerConfig) =>
    request<import('@llamaccp/shared').ServerConfig>('/server/configs', { method: 'POST', body: JSON.stringify(config) }),
  deleteServerConfig: (id: string) =>
    request<{ success: boolean }>(`/server/configs/${id}`, { method: 'DELETE' }),

  // Models
  getLocalModels: () => request<import('@llamaccp/shared').LocalModel[]>('/models/local'),
  deleteModel: (id: string) => request<{ success: boolean }>(`/models/local/${id}`, { method: 'DELETE' }),
  scanModels: () => request<import('@llamaccp/shared').LocalModel[]>('/models/local/scan', { method: 'POST', body: '{}' }),

  // HuggingFace
  searchHFModels: (query: string, limit = 20) =>
    request<{ models: import('@llamaccp/shared').HFModel[]; total: number }>(`/hf/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  getHFModel: (repoId: string) =>
    request<import('@llamaccp/shared').HFModel>(`/hf/models/${encodeURIComponent(repoId)}`),

  // Downloads
  startDownload: (req: import('@llamaccp/shared').DownloadRequest) =>
    request<import('@llamaccp/shared').DownloadProgress>('/downloads/start', { method: 'POST', body: JSON.stringify(req) }),
  cancelDownload: (id: string) => request<{ success: boolean }>(`/downloads/cancel/${id}`, { method: 'POST', body: '{}' }),
  pauseDownload: (id: string) => request<{ success: boolean }>(`/downloads/pause/${id}`, { method: 'POST', body: '{}' }),
  resumeDownload: (id: string) => request<import('@llamaccp/shared').DownloadProgress>(`/downloads/resume/${id}`, { method: 'POST', body: '{}' }),
  getActiveDownloads: () => request<import('@llamaccp/shared').DownloadProgress[]>('/downloads/active'),
  getDownloadHistory: () => request<any[]>('/downloads/history'),

  // Settings
  getSettings: () => request<import('@llamaccp/shared').AppSettings>('/settings'),
  updateSettings: (settings: Partial<import('@llamaccp/shared').AppSettings>) =>
    request<import('@llamaccp/shared').AppSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  detectLlamaCpp: () => request<{ found: boolean; path?: string; version?: string; error?: string }>('/settings/detect', { method: 'POST', body: '{}' }),
};
