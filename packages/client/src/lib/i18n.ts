import { useSyncExternalStore, useCallback } from 'react';

export type Locale = 'en' | 'zh';

const STORAGE_KEY = 'llamaccp-locale';

let currentLocale: Locale = (localStorage.getItem(STORAGE_KEY) as Locale) || 'en';

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  emitChange();
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => currentLocale,
  );
}

const translations: Record<string, { en: string; zh: string }> = {
  // Sidebar
  'nav.discover': { en: 'Discover', zh: '发现' },
  'nav.localModels': { en: 'Local Models', zh: '本地模型' },
  'nav.server': { en: 'Server', zh: '服务' },
  'nav.downloads': { en: 'Downloads', zh: '下载' },
  'nav.settings': { en: 'Settings', zh: '设置' },

  // ModelDetail
  'model.by': { en: 'by', zh: '作者' },
  'model.downloads': { en: 'downloads', zh: '下载' },
  'model.likes': { en: 'likes', zh: '赞' },
  'model.ggufFiles': { en: 'GGUF Files', zh: 'GGUF 文件' },
  'model.noGguf': { en: 'No GGUF files found for this model.', zh: '未找到该模型的 GGUF 文件。' },
  'model.unknownSize': { en: 'Unknown size', zh: '大小未知' },
  'model.download': { en: 'Download', zh: '下载' },

  // DiscoverPage
  'discover.title': { en: 'Discover Models', zh: '发现模型' },
  'discover.subtitle': { en: 'Browse and download GGUF models from HuggingFace', zh: '浏览并下载 HuggingFace 上的 GGUF 模型' },
  'discover.searchPlaceholder': { en: 'Search models...', zh: '搜索模型...' },
  'discover.loading': { en: 'Loading models...', zh: '加载模型中...' },
  'discover.downloadStarted': { en: 'Download started', zh: '下载已开始' },
  'discover.downloadFailed': { en: 'Download failed', zh: '下载失败' },
  'discover.downloadQueued': { en: 'Max downloads reached, queued', zh: '已达最大下载数，请稍后' },
  'discover.gguf': { en: 'GGUF', zh: 'GGUF' },

  // LocalModelsPage
  'local.title': { en: 'Local Models', zh: '本地模型' },
  'local.subtitle': { en: 'Manage your downloaded GGUF model files', zh: '管理已下载的 GGUF 模型文件' },
  'local.scanDirectory': { en: 'Scan Directory', zh: '扫描目录' },
  'local.loading': { en: 'Loading models...', zh: '加载模型中...' },
  'local.noModels': { en: 'No models found', zh: '未找到模型' },
  'local.noModelsHint': { en: 'Download models from Discover or scan your model directory', zh: '从发现页面下载模型或扫描模型目录' },
  'local.startServer': { en: 'Start Server', zh: '启动服务' },
  'local.modelDeleted': { en: 'Model deleted', zh: '模型已删除' },
  'local.deleteFailed': { en: 'Failed to delete', zh: '删除失败' },
  'local.scanResult': { en: 'Found {n} models', zh: '发现 {n} 个模型' },
  'local.scanFailed': { en: 'Scan failed', zh: '扫描失败' },
  'local.confirmDelete': { en: 'Delete this model file?', zh: '确定删除此模型文件？' },
  'local.running': { en: 'Running', zh: '已启动' },

  // ServerPage
  'server.title': { en: 'Server', zh: '服务' },
  'server.subtitle': { en: 'Configure and control llama.cpp server', zh: '配置和控制 llama.cpp 服务' },
  'server.start': { en: 'Start', zh: '启动' },
  'server.stop': { en: 'Stop', zh: '停止' },
  'server.restart': { en: 'Restart', zh: '重启' },
  'server.starting': { en: 'Server starting...', zh: '服务启动中...' },
  'server.startFailed': { en: 'Failed to start', zh: '启动失败' },
  'server.stopped': { en: 'Server stopped', zh: '服务已停止' },
  'server.restarting': { en: 'Server restarting...', zh: '服务重启中...' },
  'server.alreadyRunning': { en: 'Server is already running, restarting with new model...', zh: '服务已在运行，正在使用新模型重启...' },
  'server.configuration': { en: 'Configuration', zh: '配置' },
  'server.console': { en: 'Console', zh: '控制台' },
  'server.noLogs': { en: 'No logs yet. Start the server to see output.', zh: '暂无日志。启动服务后查看输出。' },
  'server.modelNetwork': { en: 'Model & Network', zh: '模型与网络' },
  'server.modelPath': { en: 'Model Path', zh: '模型路径' },
  'server.modelPathPlaceholder': { en: '/path/to/model.gguf', zh: '/path/to/model.gguf' },
  'server.host': { en: 'Host', zh: '主机' },
  'server.port': { en: 'Port', zh: '端口' },
  'server.performance': { en: 'Performance', zh: '性能' },
  'server.contextSize': { en: 'Context Size (-c)', zh: '上下文大小 (-c)' },
  'server.threads': { en: 'Threads (-t)', zh: '线程数 (-t)' },
  'server.gpuLayers': { en: 'GPU Layers (-ngl)', zh: 'GPU 层数 (-ngl)' },
  'server.batchSize': { en: 'Batch Size (-b)', zh: '批大小 (-b)' },
  'server.sampling': { en: 'Sampling', zh: '采样' },
  'server.temperature': { en: 'Temperature', zh: '温度' },
  'server.topP': { en: 'Top P', zh: 'Top P' },
  'server.topK': { en: 'Top K', zh: 'Top K' },
  'server.repeatPenalty': { en: 'Repeat Penalty', zh: '重复惩罚' },
  'server.memoryExtra': { en: 'Memory & Extra', zh: '内存与其他' },
  'server.memoryLock': { en: 'Memory Lock (--mlock)', zh: '内存锁定 (--mlock)' },
  'server.memoryMap': { en: 'Memory Map (--mmap)', zh: '内存映射 (--mmap)' },
  'server.extraArgs': { en: 'Extra Arguments', zh: '额外参数' },
  'server.extraArgsPlaceholder': { en: '--arg1 --arg2 value', zh: '--arg1 --arg2 value' },
  // API Key & Security
  'server.apiKey': { en: 'API Key', zh: 'API 密钥' },
  'server.apiKeyPlaceholder': { en: 'Optional API key for authentication', zh: '可选的 API 认证密钥' },
  'server.metrics': { en: 'Enable Metrics', zh: '启用指标监控' },
  // Performance extras
  'server.parallel': { en: 'Parallel Slots (-np)', zh: '并行槽位 (-np)' },
  'server.parallelHint': { en: '-1 = auto', zh: '-1 = 自动' },
  'server.contBatching': { en: 'Continuous Batching (-cb)', zh: '连续批处理 (-cb)' },
  'server.flashAttn': { en: 'Flash Attention (-fa)', zh: 'Flash Attention (-fa)' },
  'server.threadsBatch': { en: 'Batch Threads (-tb)', zh: '批处理线程 (-tb)' },
  'server.ropeFreqBase': { en: 'RoPE Freq Base', zh: 'RoPE 频率基数' },
  'server.ropeFreqScale': { en: 'RoPE Freq Scale', zh: 'RoPE 频率缩放' },
  // Sampling extras
  'server.minP': { en: 'Min P', zh: 'Min P' },
  'server.presencePenalty': { en: 'Presence Penalty', zh: '存在惩罚' },
  'server.frequencyPenalty': { en: 'Frequency Penalty', zh: '频率惩罚' },
  'server.mirostat': { en: 'Mirostat', zh: 'Mirostat' },
  // Advanced
  'server.advanced': { en: 'Advanced', zh: '高级设置' },
  'server.loraPath': { en: 'LoRA Adapter', zh: 'LoRA 适配器' },
  'server.loraPathPlaceholder': { en: '/path/to/lora-adapter', zh: '/path/to/lora-adapter' },
  'server.chatTemplate': { en: 'Chat Template', zh: '对话模板' },
  'server.chatTemplatePlaceholder': { en: 'chatml, llama, etc.', zh: 'chatml, llama 等' },
  'server.grammar': { en: 'Grammar (GBNF)', zh: '语法 (GBNF)' },
  'server.grammarPlaceholder': { en: '/path/to/grammar.gbnf', zh: '/path/to/grammar.gbnf' },
  'server.cacheTypeK': { en: 'Cache Type K (-ctk)', zh: 'K 缓存类型 (-ctk)' },
  'server.cacheTypeV': { en: 'Cache Type V (-ctv)', zh: 'V 缓存类型 (-ctv)' },
  'server.embeddingMode': { en: 'Embedding Mode', zh: '嵌入模式' },
  'server.status.stopped': { en: 'stopped', zh: '已停止' },
  'server.status.starting': { en: 'starting', zh: '启动中' },
  'server.status.running': { en: 'running', zh: '运行中' },
  'server.status.stopping': { en: 'stopping', zh: '停止中' },
  'server.status.error': { en: 'error', zh: '错误' },

  // DownloadsPage
  'downloads.title': { en: 'Downloads', zh: '下载' },
  'downloads.active': { en: '{n} active download', zh: '{n} 个下载中' },
  'downloads.activePlural': { en: '{n} active downloads', zh: '{n} 个下载中' },
  'downloads.noActive': { en: 'No active downloads', zh: '没有正在进行的下载' },
  'downloads.noDownloads': { en: 'No downloads yet', zh: '暂无下载' },
  'downloads.noDownloadsHint': { en: 'Download models from the Discover page', zh: '从发现页面下载模型' },
  'downloads.status.downloading': { en: 'downloading', zh: '下载中' },
  'downloads.status.paused': { en: 'paused', zh: '已暂停' },
  'downloads.status.completed': { en: 'completed', zh: '已完成' },
  'downloads.status.failed': { en: 'failed', zh: '失败' },
  'downloads.status.cancelled': { en: 'cancelled', zh: '已取消' },
  'downloads.tab.active': { en: 'Active', zh: '进行中' },
  'downloads.tab.history': { en: 'History', zh: '历史记录' },
  'downloads.pause': { en: 'Pause', zh: '暂停' },
  'downloads.resume': { en: 'Resume', zh: '继续' },
  'downloads.cancel': { en: 'Cancel', zh: '取消' },
  'downloads.noHistory': { en: 'No download history', zh: '暂无下载历史' },
  'downloads.downloadedBytes': { en: 'Downloaded', zh: '已下载' },

  // SettingsPage
  'settings.title': { en: 'Settings', zh: '设置' },
  'settings.subtitle': { en: 'Configure your llama.cpp installation', zh: '配置 llama.cpp 安装' },
  'settings.language': { en: 'Language / 语言', zh: 'Language / 语言' },
  'settings.languageHint': { en: 'Change the display language', zh: '更改显示语言' },
  'settings.llamaCppBinary': { en: 'llama.cpp Binary', zh: 'llama.cpp 二进制文件' },
  'settings.llamaServerPath': { en: 'llama-server Path', zh: 'llama-server 路径' },
  'settings.autoDetect': { en: 'Auto Detect', zh: '自动检测' },
  'settings.modelStorage': { en: 'Model Storage', zh: '模型存储' },
  'settings.modelDir': { en: 'Model Directory', zh: '模型目录' },
  'settings.modelDirHint': { en: 'Directory where downloaded GGUF files are stored', zh: '下载的 GGUF 文件存储目录' },
  'settings.maxConcurrent': { en: 'Max Concurrent Downloads', zh: '最大并发下载数' },
  'settings.saveSettings': { en: 'Save Settings', zh: '保存设置' },
  'settings.saved': { en: 'Settings saved', zh: '设置已保存' },
  'settings.saveFailed': { en: 'Failed to save', zh: '保存失败' },
  'settings.detected': { en: 'llama.cpp detected', zh: '已检测到 llama.cpp' },
  'settings.notFound': { en: 'Not found', zh: '未找到' },
};

export function t(key: string, params?: Record<string, string | number>): string {
  const entry = translations[key];
  if (!entry) return key;
  let text = entry[currentLocale] || entry.en;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
