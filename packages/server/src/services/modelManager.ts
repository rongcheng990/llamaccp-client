import fs from 'fs';
import path from 'path';
import { getAllModels, upsertModel, deleteModel as deleteModelFromDb, getModelById } from '../db/queries.js';
import type { LocalModel } from '@llamaccp/shared';
import { getDefaultModelDir } from './llamaDetector.js';

export function getLocalModels(): LocalModel[] {
  return getAllModels();
}

export async function scanModels(): Promise<LocalModel[]> {
  const modelDir = getDefaultModelDir();
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
    return [];
  }

  const files = findGgufFiles(modelDir);
  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const stat = fs.statSync(filePath);
    const parsed = parseModelName(fileName);

    upsertModel({
      name: parsed.name,
      fileName,
      filePath,
      fileSize: stat.size,
      quantization: parsed.quantization,
      parameterCount: parsed.parameterCount,
      lastUsed: undefined,
    });
  }

  return getAllModels();
}

export function deleteModel(id: string): boolean {
  const model = getModelById(id);
  if (!model) return false;

  // Delete file from disk
  if (fs.existsSync(model.filePath)) {
    fs.unlinkSync(model.filePath);
  }

  return deleteModelFromDb(id);
}

function findGgufFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findGgufFiles(fullPath));
    } else if (entry.name.endsWith('.gguf')) {
      results.push(fullPath);
    }
  }

  return results;
}

interface ParsedModelName {
  name: string;
  quantization?: string;
  parameterCount?: string;
}

function parseModelName(fileName: string): ParsedModelName {
  const baseName = fileName.replace(/\.gguf$/i, '');

  // Try to extract quantization (e.g., Q4_K_M, Q5_K_S, Q8_0)
  const quantMatch = baseName.match(/[._-](Q\d+[_][A-Z][_][A-Z]|[IQ]\d+[_][A-Z]+[_]?[A-Z]*|[IQ]\d+[_]?[A-Z]*|[A-Z]\d+[_][A-Z])/i);
  const quantization = quantMatch ? quantMatch[1].toUpperCase() : undefined;

  // Try to extract parameter count (e.g., 7B, 13B, 70B)
  const paramMatch = baseName.match(/[._-](\d+[BbMm])/);
  const parameterCount = paramMatch ? paramMatch[1].toUpperCase() : undefined;

  // Clean name
  let name = baseName.replace(/[-_]/g, ' ');
  if (quantization) name = name.replace(new RegExp(quantization, 'gi'), '').trim();
  if (parameterCount) name = name.replace(new RegExp(parameterCount, 'gi'), '').trim();
  name = name.replace(/\s+/g, ' ').trim() || baseName;

  return { name, quantization, parameterCount };
}
