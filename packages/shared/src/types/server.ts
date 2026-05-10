export interface ServerConfig {
  id: string;
  name: string;
  modelPath: string;
  host: string;
  port: number;
  contextSize: number;
  threads: number;
  gpuLayers: number;
  batchSize: number;
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
  mlock: boolean;
  mmap: boolean;
  extraArgs?: string;

  // API Key & Security
  apiKey?: string;
  metrics?: boolean;

  // Performance / Inference
  parallel?: number;
  contBatching?: boolean;
  flashAttn?: 'auto' | 'on' | 'off';
  threadsBatch?: number;
  ropeFreqBase?: number;
  ropeFreqScale?: number;

  // Sampling
  minP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  mirostat?: number;

  // Advanced
  loraPath?: string;
  chatTemplate?: string;
  grammar?: string;
  cacheTypeK?: string;
  cacheTypeV?: string;
  embeddingMode?: boolean;
}

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export interface ServerState {
  status: ServerStatus;
  pid?: number;
  port?: number;
  host?: string;
  config?: ServerConfig;
  startedAt?: string;
  error?: string;
}

export const DEFAULT_SERVER_CONFIG: Omit<ServerConfig, 'id' | 'name' | 'modelPath'> = {
  host: '127.0.0.1',
  port: 8081,
  contextSize: 4096,
  threads: 4,
  gpuLayers: 99,
  batchSize: 2048,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
  mlock: false,
  mmap: true,
  // Performance
  parallel: -1,
  contBatching: true,
  flashAttn: 'auto',
  // Sampling
  minP: 0.05,
  presencePenalty: 0,
  frequencyPenalty: 0,
  mirostat: 0,
};
