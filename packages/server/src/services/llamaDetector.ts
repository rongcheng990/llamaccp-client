import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSettings } from '../db/queries.js';

const execFileAsync = promisify(execFile);

const SEARCH_PATHS = [
  '/opt/homebrew/bin/llama-server',
  '/usr/local/bin/llama-server',
  path.join(os.homedir(), 'llama.cpp/build/bin/llama-server'),
  path.join(os.homedir(), 'llama.cpp/llama-server'),
  path.join(os.homedir(), '.local/bin/llama-server'),
];

export interface LlamaDetection {
  found: boolean;
  path?: string;
  version?: string;
  error?: string;
}

export async function detectLlamaCpp(): Promise<LlamaDetection> {
  // 1. Check saved path first
  const settings = getSettings();
  const savedPath = settings.llamaServerPath;
  if (savedPath && fs.existsSync(savedPath)) {
    const version = await getVersion(savedPath);
    return { found: true, path: savedPath, version };
  }

  // 2. Check known paths
  for (const p of SEARCH_PATHS) {
    if (fs.existsSync(p)) {
      const version = await getVersion(p);
      return { found: true, path: p, version };
    }
  }

  // 3. Try `which llama-server`
  try {
    const { stdout } = await execFileAsync('which', ['llama-server']);
    const foundPath = stdout.trim();
    if (foundPath && fs.existsSync(foundPath)) {
      const version = await getVersion(foundPath);
      return { found: true, path: foundPath, version };
    }
  } catch {}

  return { found: false, error: 'llama-server not found. Please install llama.cpp or set the path manually.' };
}

async function getVersion(binPath: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(binPath, ['--version']);
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

export function getDefaultModelDir(): string {
  const settings = getSettings();
  if (settings.modelDir) return settings.modelDir;
  return path.join(os.homedir(), 'models');
}
