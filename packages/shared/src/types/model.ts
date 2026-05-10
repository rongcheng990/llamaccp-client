export interface LocalModel {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  quantization?: string;
  parameterCount?: string;
  addedAt: string;
  lastUsed?: string;
}

export interface HFModel {
  id: string;
  name: string;
  author: string;
  description?: string;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag?: string;
  createdAt: string;
  updatedAt: string;
  siblings?: HFFile[];
}

export interface HFFile {
  rfilename: string;
  size?: number;
}

export interface DownloadProgress {
  id: string;
  modelId: string;
  fileName: string;
  filePath: string;
  totalBytes: number;
  downloadedBytes: number;
  speed: number; // bytes/sec
  eta: number; // seconds
  status: 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
}

export interface DownloadRequest {
  repoId: string;
  fileName: string;
  modelDir?: string;
}
