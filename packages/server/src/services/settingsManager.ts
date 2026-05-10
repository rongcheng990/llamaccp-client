import { getSettings as getSettingsFromDb, setSetting } from '../db/queries.js';
import type { AppSettings } from '@llamaccp/shared';

const DEFAULT_SETTINGS: AppSettings = {
  llamaServerPath: '/opt/homebrew/bin/llama-server',
  modelDir: '~/models',
  maxConcurrentDownloads: 3,
  defaultServerConfig: {},
};

export function getSettings(): AppSettings {
  const raw = getSettingsFromDb();
  return {
    llamaServerPath: (raw.llamaServerPath as string) || DEFAULT_SETTINGS.llamaServerPath,
    modelDir: (raw.modelDir as string) || DEFAULT_SETTINGS.modelDir,
    maxConcurrentDownloads: (raw.maxConcurrentDownloads as unknown as number) || DEFAULT_SETTINGS.maxConcurrentDownloads,
    defaultServerConfig: (raw.defaultServerConfig as Partial<import('@llamaccp/shared').ServerConfig>) || DEFAULT_SETTINGS.defaultServerConfig,
  };
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined) {
      setSetting(key, value);
    }
  }
  return getSettings();
}
