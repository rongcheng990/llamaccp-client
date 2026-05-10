import { createWriteStream, createReadStream, existsSync, statSync } from 'fs';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import type { DownloadProgress, DownloadRequest } from '@llamaccp/shared';
import { getDefaultModelDir } from './llamaDetector.js';
import { saveDownloadHistory } from '../db/queries.js';
import { getSettings } from '../db/queries.js';
import { randomUUID } from 'crypto';

interface ActiveDownload {
  id: string;
  request: DownloadRequest;
  progress: DownloadProgress;
  abortController: AbortController;
  writeStream?: ReturnType<typeof createWriteStream>;
  _intent?: 'download' | 'paused' | 'cancelled';
}

const activeDownloads = new Map<string, ActiveDownload>();
let io: SocketServer | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

export function initDownloadManager(socketIo: SocketServer) {
  io = socketIo;
  progressInterval = setInterval(broadcastProgress, 500);
}

export function destroyDownloadManager() {
  if (progressInterval) clearInterval(progressInterval);
  for (const [id, dl] of activeDownloads) {
    dl.abortController.abort();
  }
  activeDownloads.clear();
}

export function getActiveDownloadsList(): DownloadProgress[] {
  return Array.from(activeDownloads.values()).map((d) => ({ ...d.progress }));
}

function getMaxConcurrent(): number {
  try {
    const settings = getSettings();
    return parseInt(settings.maxConcurrentDownloads as any, 10) || 3;
  } catch {
    return 3;
  }
}

export async function startDownload(req: DownloadRequest): Promise<DownloadProgress> {
  // Check concurrent download limit
  const maxConcurrent = getMaxConcurrent();
  const currentActive = Array.from(activeDownloads.values())
    .filter((d) => d.progress.status === 'downloading').length;
  if (currentActive >= maxConcurrent) {
    throw new Error(`Max concurrent downloads (${maxConcurrent}) reached. Please wait for a download to finish.`);
  }

  // Check if this file is already downloading
  const duplicate = Array.from(activeDownloads.values())
    .find((d) => d.request.repoId === req.repoId && d.request.fileName === req.fileName);
  if (duplicate) {
    return { ...duplicate.progress };
  }

  const id = randomUUID();
  const modelDir = req.modelDir || getDefaultModelDir();
  if (!existsSync(modelDir)) {
    const { mkdirSync } = await import('fs');
    mkdirSync(modelDir, { recursive: true });
  }

  const filePath = path.join(modelDir, req.fileName);
  const partPath = filePath + '.part';

  // Check for partial download
  let startByte = 0;
  if (existsSync(partPath)) {
    startByte = statSync(partPath).size;
  }

  const hfBase = process.env.HF_API_BASE
    ? process.env.HF_API_BASE.replace(/\/api$/, '')
    : 'https://hf-mirror.com';
  const url = `${hfBase}/${req.repoId}/resolve/main/${req.fileName}`;

  const headers: Record<string, string> = {};
  if (startByte > 0) {
    headers['Range'] = `bytes=${startByte}-`;
  }

  const abortController = new AbortController();
  const progress: DownloadProgress = {
    id,
    modelId: req.repoId,
    fileName: req.fileName,
    filePath,
    totalBytes: 0,
    downloadedBytes: startByte,
    speed: 0,
    eta: 0,
    status: 'downloading',
    startedAt: new Date().toISOString(),
  };

  const download: ActiveDownload = {
    id,
    request: req,
    progress,
    abortController,
  };

  (download)._intent = 'download';
  activeDownloads.set(id, download);

  // Start download in background
  performDownload(download, url, headers, partPath, filePath, startByte).catch((err) => {
    // Only mark as failed if not intentionally paused/cancelled
    if (download._intent !== 'download') return;
    progress.status = 'failed';
    io?.emit('download:progress', { ...progress });
    activeDownloads.delete(id);
  });

  return { ...progress };
}

export function cancelDownload(id: string): boolean {
  const dl = activeDownloads.get(id);
  if (!dl) return false;
  dl._intent = 'cancelled';
  dl.abortController.abort();
  dl.progress.status = 'cancelled';
  dl.writeStream?.end();
  io?.emit('download:progress', { ...dl.progress });
  saveDownloadHistory({
    id: dl.id,
    modelId: dl.progress.modelId,
    fileName: dl.progress.fileName,
    filePath: dl.progress.filePath,
    totalBytes: dl.progress.totalBytes,
    status: 'cancelled',
    startedAt: dl.progress.startedAt,
    completedAt: new Date().toISOString(),
  });
  activeDownloads.delete(id);
  return true;
}

export function pauseDownload(id: string): boolean {
  const dl = activeDownloads.get(id);
  if (!dl || dl.progress.status !== 'downloading') return false;
  dl._intent = 'paused';
  dl.abortController.abort();
  dl.progress.status = 'paused';
  dl.progress.speed = 0;
  dl.progress.eta = 0;
  dl.writeStream?.end();
  io?.emit('download:progress', { ...dl.progress });
  return true;
}

export async function resumeDownload(id: string): Promise<DownloadProgress | null> {
  const dl = activeDownloads.get(id);
  if (!dl || dl.progress.status !== 'paused') return null;

  // Create new abort controller and restart download from .part file
  dl.abortController = new AbortController();
  dl.progress.status = 'downloading';

  const partPath = dl.progress.filePath + '.part';
  let startByte = 0;
  if (existsSync(partPath)) {
    startByte = statSync(partPath).size;
  }
  dl.progress.downloadedBytes = startByte;

  const hfBase = process.env.HF_API_BASE
    ? process.env.HF_API_BASE.replace(/\/api$/, '')
    : 'https://hf-mirror.com';
  const url = `${hfBase}/${dl.request.repoId}/resolve/main/${dl.request.fileName}`;
  const headers: Record<string, string> = {};
  if (startByte > 0) {
    headers['Range'] = `bytes=${startByte}-`;
  }

  dl._intent = 'download';
  performDownload(dl, url, headers, partPath, dl.progress.filePath, startByte).catch((err) => {
    if (dl._intent !== 'download') return;
    dl.progress.status = 'failed';
    io?.emit('download:progress', { ...dl.progress });
    activeDownloads.delete(id);
  });

  return { ...dl.progress };
}

async function performDownload(
  dl: ActiveDownload,
  url: string,
  headers: Record<string, string>,
  partPath: string,
  finalPath: string,
  startByte: number,
) {
  const response = await fetch(url, {
    headers,
    signal: dl.abortController.signal,
  });

  if (!response.ok && response.status !== 206) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const totalFromHeader = response.headers.get('content-length');
  const contentRange = response.headers.get('content-range');
  let totalBytes = startByte;

  if (contentRange) {
    const match = contentRange.match(/\/(\d+)/);
    if (match) totalBytes = parseInt(match[1], 10);
  } else if (totalFromHeader) {
    totalBytes = startByte + parseInt(totalFromHeader, 10);
  }

  dl.progress.totalBytes = totalBytes;

  if (!response.body) throw new Error('No response body');

  const writeStream = createWriteStream(partPath, startByte > 0 ? { flags: 'a' } : { flags: 'w' });
  dl.writeStream = writeStream;

  const reader = response.body.getReader();
  let lastTime = Date.now();
  let lastBytes = startByte;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      writeStream.write(value);
      dl.progress.downloadedBytes += value.length;

      // Calculate speed
      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;
      if (elapsed >= 1) {
        dl.progress.speed = (dl.progress.downloadedBytes - lastBytes) / elapsed;
        lastBytes = dl.progress.downloadedBytes;
        lastTime = now;

        if (dl.progress.speed > 0 && dl.progress.totalBytes > 0) {
          dl.progress.eta = (dl.progress.totalBytes - dl.progress.downloadedBytes) / dl.progress.speed;
        }
      }
    }
    // Normal completion — end the stream
    writeStream.end();
  } catch (err: any) {
    // Paused or cancelled — abort is expected, just end the stream
    writeStream.end();
    if (dl.abortController.signal.aborted) return;
    throw err;
  }

  // Rename .part to final name
  const { renameSync } = await import('fs');
  renameSync(partPath, finalPath);

  dl.progress.status = 'completed';
  dl.progress.completedAt = new Date().toISOString();
  dl.progress.speed = 0;
  dl.progress.eta = 0;

  io?.emit('download:completed', { ...dl.progress });
  saveDownloadHistory({
    id: dl.id,
    modelId: dl.progress.modelId,
    fileName: dl.progress.fileName,
    filePath: dl.progress.filePath,
    totalBytes: dl.progress.totalBytes,
    status: 'completed',
    startedAt: dl.progress.startedAt,
    completedAt: dl.progress.completedAt,
  });
  activeDownloads.delete(dl.id);
}

function broadcastProgress() {
  for (const dl of activeDownloads.values()) {
    io?.emit('download:progress', { ...dl.progress });
  }
}
