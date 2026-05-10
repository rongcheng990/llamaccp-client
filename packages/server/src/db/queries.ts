import { getDb } from './database.js';
import type { LocalModel, ServerConfig } from '@llamaccp/shared';
import { randomUUID } from 'crypto';

// Models
export function getAllModels(): LocalModel[] {
  const db = getDb();
  return db.prepare('SELECT * FROM models ORDER BY added_at DESC').all() as LocalModel[];
}

export function getModelById(id: string): LocalModel | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM models WHERE id = ?').get(id) as LocalModel | undefined;
}

export function upsertModel(model: Omit<LocalModel, 'id' | 'addedAt'>): LocalModel {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM models WHERE file_path = ?').get(model.filePath) as LocalModel | undefined;
  if (existing) {
    db.prepare(`UPDATE models SET name = ?, file_name = ?, file_size = ?, quantization = ?, parameter_count = ? WHERE id = ?`)
      .run(model.name, model.fileName, model.fileSize, model.quantization || null, model.parameterCount || null, existing.id);
    return { ...existing, ...model };
  }
  const id = randomUUID();
  const addedAt = new Date().toISOString();
  db.prepare(`INSERT INTO models (id, name, file_name, file_path, file_size, quantization, parameter_count, added_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, model.name, model.fileName, model.filePath, model.fileSize, model.quantization || null, model.parameterCount || null, addedAt);
  return { id, ...model, addedAt };
}

export function deleteModel(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM models WHERE id = ?').run(id);
  return result.changes > 0;
}

// Server Configs
export function getAllServerConfigs(): ServerConfig[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM server_configs').all() as any[];
  return rows.map((r) => ({ ...JSON.parse(r.config), id: r.id, name: r.name }));
}

export function saveServerConfig(config: ServerConfig): ServerConfig {
  const db = getDb();
  const { id, name, ...rest } = config;
  const configJson = JSON.stringify(rest);
  db.prepare(`INSERT OR REPLACE INTO server_configs (id, name, config) VALUES (?, ?, ?)`)
    .run(id, name, configJson);
  return config;
}

export function deleteServerConfig(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM server_configs WHERE id = ?').run(id);
  return result.changes > 0;
}

// Settings
export function getSettings(): Record<string, string> {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = JSON.parse(row.value);
  return result;
}

export function setSetting(key: string, value: any): void {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
}

// Download history
export function saveDownloadHistory(entry: { id: string; modelId?: string; fileName: string; filePath: string; totalBytes: number; status: string; startedAt: string; completedAt?: string }) {
  const db = getDb();
  db.prepare(`INSERT OR REPLACE INTO download_history (id, model_id, file_name, file_path, total_bytes, status, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(entry.id, entry.modelId || null, entry.fileName, entry.filePath, entry.totalBytes, entry.status, entry.startedAt, entry.completedAt || null);
}

export function getDownloadHistory(limit = 50): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM download_history ORDER BY started_at DESC LIMIT ?').all(limit);
}
