import { spawn, ChildProcess } from 'child_process';
import { Server as SocketServer } from 'socket.io';
import type { ServerConfig, ServerState } from '@llamaccp/shared';
import { getSettings } from '../db/queries.js';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 8081;

let currentProcess: ChildProcess | null = null;
let currentState: ServerState = { status: 'stopped' };
let io: SocketServer | null = null;
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;
let logBuffer: string[] = [];
const MAX_LOG_BUFFER = 500;

export function initProcessManager(socketIo: SocketServer) {
  io = socketIo;
  // Auto-detect already-running llama-server on startup
  detectRunningServer();
}

async function detectRunningServer() {
  const settings = getSettings();
  const host = '127.0.0.1';
  const port = 8081;
  try {
    const res = await fetch(`http://${host}:${port}/health`);
    if (res.ok) {
      const modelsRes = await fetch(`http://${host}:${port}/v1/models`);
      const modelsData: any = await modelsRes.json();
      const modelName = modelsData?.data?.[0]?.id || modelsData?.models?.[0]?.name || '';
      const config = Object.assign(
        {},
        { host: DEFAULT_HOST, port: DEFAULT_PORT, contextSize: 4096, threads: 4, gpuLayers: 99, batchSize: 2048, temperature: 0.7, topP: 0.9, topK: 40, repeatPenalty: 1.1, mlock: false, mmap: true },
        settings.defaultServerConfig,
        { modelPath: modelName, host, port }
      ) as Partial<ServerConfig>;
      updateState({ status: 'running', config: config as ServerConfig, host, port });
      // Start periodic health check for externally-started server
      healthCheckInterval = setInterval(async () => {
        try {
          const r = await fetch(`http://${host}:${port}/health`);
          if (!r.ok) throw new Error('unhealthy');
        } catch {
          if (currentState.status === 'running') {
            updateState({ status: 'stopped', pid: undefined, startedAt: undefined });
            clearInterval(healthCheckInterval!);
            healthCheckInterval = null;
          }
        }
      }, 10000);
    }
  } catch {
    // No server running, that's fine
  }
}

export function getServerState(): ServerState {
  return { ...currentState };
}

export function getLogs(): string[] {
  return [...logBuffer];
}

export async function startServer(config: ServerConfig): Promise<ServerState> {
  if (currentState.status === 'running' || currentState.status === 'starting') {
    throw new Error('Server is already running');
  }

  const settings = getSettings();
  const binPath = settings.llamaServerPath || 'llama-server';
  const args = buildArgs(config);

  updateState({ status: 'starting', config, port: config.port, host: config.host });
  logBuffer = [];

  try {
    currentProcess = spawn(binPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    currentProcess.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach((line) => {
        logBuffer.push(line);
        if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
        io?.emit('server:log', line);
      });
    });

    currentProcess.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach((line) => {
        logBuffer.push(`[stderr] ${line}`);
        if (logBuffer.length > MAX_LOG_BUFFER) logBuffer.shift();
        io?.emit('server:log', `[stderr] ${line}`);
      });
    });

    currentProcess.on('exit', (code, signal) => {
      const wasRunning = currentState.status === 'running';
      clearInterval(healthCheckInterval!);
      healthCheckInterval = null;
      currentProcess = null;
      const error = code !== 0 ? `Process exited with code ${code}, signal ${signal}` : undefined;
      updateState({ status: 'stopped', pid: undefined, startedAt: undefined, error: wasRunning ? error : undefined });
    });

    currentProcess.on('error', (err) => {
      updateState({ status: 'error', error: err.message });
      currentProcess = null;
    });

    updateState({ pid: currentProcess.pid, startedAt: new Date().toISOString() });

    // Wait for health check
    await waitForHealth(config.host, config.port, 30000);
    updateState({ status: 'running' });

    // Start periodic health check
    healthCheckInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://${config.host}:${config.port}/health`);
        if (!res.ok) throw new Error('unhealthy');
      } catch {
        if (currentState.status === 'running') {
          updateState({ status: 'error', error: 'Health check failed' });
        }
      }
    }, 10000);

    return getServerState();
  } catch (err: any) {
    updateState({ status: 'error', error: err.message });
    throw err;
  }
}

export async function stopServer(): Promise<void> {
  if (!currentProcess || currentState.status === 'stopped') return;

  updateState({ status: 'stopping' });

  return new Promise((resolve) => {
    const proc = currentProcess!;
    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
    }, 5000);

    proc.on('exit', () => {
      clearTimeout(timeout);
      clearInterval(healthCheckInterval!);
      healthCheckInterval = null;
      currentProcess = null;
      updateState({ status: 'stopped', pid: undefined, startedAt: undefined });
      resolve();
    });

    proc.kill('SIGTERM');
  });
}

export async function restartServer(config: ServerConfig): Promise<ServerState> {
  await stopServer();
  return startServer(config);
}

function buildArgs(config: ServerConfig): string[] {
  const args: string[] = [
    '-m', config.modelPath,
    '--host', config.host,
    '--port', config.port.toString(),
    '-c', config.contextSize.toString(),
    '-t', config.threads.toString(),
    '-ngl', config.gpuLayers.toString(),
    '-b', config.batchSize.toString(),
    '--temp', config.temperature.toString(),
    '--top-p', config.topP.toString(),
    '--top-k', config.topK.toString(),
    '--repeat-penalty', config.repeatPenalty.toString(),
  ];

  if (config.mlock) args.push('--mlock');
  if (!config.mmap) args.push('--no-mmap');

  // API Key & Security
  if (config.apiKey) args.push('--api-key', config.apiKey);
  if (config.metrics) args.push('--metrics');

  // Performance / Inference
  if (config.parallel !== undefined && config.parallel !== -1) {
    args.push('-np', config.parallel.toString());
  }
  if (config.contBatching) args.push('-cb');
  if (config.flashAttn && config.flashAttn !== 'auto') {
    args.push('-fa', config.flashAttn);
  }
  if (config.threadsBatch !== undefined && config.threadsBatch > 0) {
    args.push('-tb', config.threadsBatch.toString());
  }
  if (config.ropeFreqBase !== undefined && config.ropeFreqBase > 0) {
    args.push('--rope-freq-base', config.ropeFreqBase.toString());
  }
  if (config.ropeFreqScale !== undefined && config.ropeFreqScale !== 1 && config.ropeFreqScale > 0) {
    args.push('--rope-freq-scale', config.ropeFreqScale.toString());
  }

  // Sampling
  if (config.minP !== undefined && config.minP > 0) {
    args.push('--min-p', config.minP.toString());
  }
  if (config.presencePenalty !== undefined && config.presencePenalty !== 0) {
    args.push('--presence-penalty', config.presencePenalty.toString());
  }
  if (config.frequencyPenalty !== undefined && config.frequencyPenalty !== 0) {
    args.push('--frequency-penalty', config.frequencyPenalty.toString());
  }
  if (config.mirostat !== undefined && config.mirostat > 0) {
    args.push('--mirostat', config.mirostat.toString());
  }

  // Advanced
  if (config.loraPath) args.push('--lora', config.loraPath);
  if (config.chatTemplate) args.push('--chat-template', config.chatTemplate);
  if (config.grammar) args.push('--grammar', config.grammar);
  if (config.cacheTypeK) args.push('-ctk', config.cacheTypeK);
  if (config.cacheTypeV) args.push('-ctv', config.cacheTypeV);
  if (config.embeddingMode) args.push('--embedding');

  // Extra args (raw CLI args appended last)
  if (config.extraArgs) {
    const extra = config.extraArgs.trim().split(/\s+/);
    args.push(...extra);
  }

  return args;
}

async function waitForHealth(host: string, port: number, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://${host}:${port}/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not become healthy within ${timeoutMs / 1000}s`);
}

function updateState(partial: Partial<ServerState>) {
  currentState = { ...currentState, ...partial };
  io?.emit('server:status', currentState);
}
