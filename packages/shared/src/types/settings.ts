export interface AppSettings {
  llamaServerPath: string;
  modelDir: string;
  maxConcurrentDownloads: number;
  defaultServerConfig: Partial<import('./server').ServerConfig>;
}

export const DEFAULT_SETTINGS: AppSettings = {
  llamaServerPath: '/opt/homebrew/bin/llama-server',
  modelDir: '~/models',
  maxConcurrentDownloads: 3,
  defaultServerConfig: {},
};
