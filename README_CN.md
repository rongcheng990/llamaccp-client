# LlamaCCP Client

> 一款现代化的桌面风格 Web GUI，用于管理 llama.cpp 服务 —— 轻松发现、下载、配置和运行本地大语言模型。

[**English**](./README.md) | **中文**

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Fastify](https://img.shields.io/badge/Fastify-4-black)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 功能概览

```
┌──────────────────────────────────────────────────────────────┐
│                    LlamaCCP Client                           │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  发现模型 │ 本地模型  │ 服务控制  │ 下载管理  │    设置与偏好    │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│                                                              │
│  🔍 HF 模型搜索       📥 并发下载管理                         │
│  📂 本地模型管理       ⚙️  40+ 服务端参数                     │
│  🚀 一键启动服务       📊 实时日志与健康监控                    │
│  🌐 中英文国际化       🔌 自动检测 llama.cpp                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 界面预览

### 发现与下载模型
浏览 HuggingFace 上的 GGUF 模型，支持关键词搜索、查看模型详情、一键下载。

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 搜索模型...                                    [扫描目录]   │
├─────────────────────┬─────────────────────┬───────────────────┤
│ ┌─────────────────┐ │ ┌─────────────────┐ │ ┌───────────────┐ │
│ │  🤖 Qwen3-30B   │ │ │  🤖 Gemma-4     │ │ │ 🤖 Llama-3.2  │ │
│ │  Q4_K_M · 18GB  │ │ │  E4B Q8_0 · 8GB │ │ │ 1B · 1.3GB    │ │
│ │  ↓ 12.5k  ♥ 890 │ │ │  ↓ 8.2k  ♥ 620  │ │ │ ↓ 45k ♥ 2.1k │ │
│ │  [下载]         │ │ │  [下载]          │ │ │ [下载]        │ │
│ └─────────────────┘ │ └─────────────────┘ │ └───────────────┘ │
└─────────────────────┴─────────────────────┴───────────────────┘
```

### 本地模型与运行状态
查看当前正在运行的模型，管理本地 GGUF 文件，直接启动服务。

```
┌─────────────────────┬─────────────────────┬───────────────────┐
│ Gemma-4 E4B Q4_K_M  │ Qwen2.5 0.5B Q2_K  │ Llama-3.2 1B Q8_0│
│ 5.0 GB · Q4_K_M     │ 396 MB · Q2_K       │ 1.3 GB · Q8_0    │
│ 🟢 运行中           │                     │                   │
│ [  运行中   ]  🗑️   │ [启动服务]    🗑️    │ [启动服务]   🗑️  │
└─────────────────────┴─────────────────────┴───────────────────┘
```

### 服务配置（40+ 参数）
完全掌控 llama-server，分类配置卡片、实时控制台、一键启动/停止/重启。

```
┌─────────────────────────────────────────────────────────────────┐
│  服务                                              🟢 运行中    │
│                                              [▶ 启动][■ 停止][↻]│
├──────────────────────┬──────────────────────────────────────────┤
│ 配置 [控制台]                                                   │
├──────────────────────┼──────────────────────────────────────────┤
│                      │                                          │
│  模型与网络           │  性能                                    │
│  ├─ 模型路径          │  ├─ 上下文大小 (-c)      4096           │
│  ├─ 主机 / 端口       │  ├─ 线程数 (-t)          4              │
│  ├─ API 密钥 🔒      │  ├─ GPU 层数 (-ngl)      99             │
│  └─ 指标监控 [开关]   │  ├─ 批大小 (-b)          2048           │
│                      │  ├─ 并行槽位 (-np)       -1             │
│                      │  ├─ 连续批处理            [✓]            │
│                      │  ├─ Flash Attention      [自动 ▼]       │
│                      │  └─ RoPE 频率基数/缩放                   │
│                      │                                          │
│  采样参数             │  内存与其他                               │
│  ├─ 温度      0.7    │  ├─ 内存锁定 (mlock)     [ ]            │
│  ├─ Top P     0.9    │  ├─ 内存映射 (mmap)      [✓]            │
│  ├─ Top K      40    │  └─ 额外参数                              │
│  ├─ Min P    0.05    │                                          │
│  ├─ 重复惩罚    │     │  ▸ 高级设置                               │
│  ├─ Mirostat   0     │    ├─ LoRA 适配器                        │
│  └─ 存在/频率惩罚     │    ├─ 对话模板                            │
│                      │    ├─ 语法 (GBNF)                        │
│                      │    ├─ K/V 缓存类型                       │
│                      │    └─ 嵌入模式                            │
└──────────────────────┴──────────────────────────────────────────┘
```

### 下载管理器
支持并发下载、暂停/恢复/取消、实时进度显示和下载历史记录。

```
┌─────────────────────────────────────────────────────────────────┐
│  下载管理                              [进行中] [历史记录]       │
├─────────────────────────────────────────────────────────────────┤
│  📥 gemma-4-E4B-it-Q4_K_M.gguf                                 │
│  ████████████████████░░░░░░░  76%  ·  3.8 / 5.0 GB             │
│  速度: 45.2 MB/s  ·  剩余: 26秒        [⏸ 暂停] [✕ 取消]      │
│                                                                  │
│  📥 Qwen3.5-9B-Q4_K_M.gguf                                     │
│  ██████░░░░░░░░░░░░░░░░░░  28%  ·  1.5 / 5.2 GB               │
│  速度: 38.7 MB/s  ·  剩余: 1分52秒     [⏸ 暂停] [✕ 取消]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 系统架构

```
                         ┌─────────────────┐
                         │   浏览器 (SPA)   │
                         │  React 18 + Vite│
                         └────────┬────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    │ HTTP /api/* │              │
                    │             │  Socket.IO   │
                    │             │  (WebSocket) │
                    ▼             ▼              │
              ┌─────────────────────────┐        │
              │   Fastify 服务 :3001    │◄───────┘
              │                         │
              │  ┌───────────────────┐  │
              │  │   进程管理器       │  │     ┌──────────────────┐
              │  │  (child_process)  │──┼────►│  llama-server    │
              │  └───────────────────┘  │     │  (:8081)         │
              │                         │     └──────────────────┘
              │  ┌───────────────────┐  │
              │  │   下载管理器       │  │     ┌──────────────────┐
              │  │  (并发下载)        │──┼────►│  HuggingFace CDN │
              │  └───────────────────┘  │     └──────────────────┘
              │                         │
              │  ┌───────────────────┐  │
              │  │  SQLite 数据库     │  │
              │  │  (better-sqlite3) │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
```

### Monorepo 项目结构

```
llamaccp-client/
├── packages/
│   ├── client/          # 前端 — React 18 SPA (Vite + Tailwind)
│   │   └── src/
│   │       ├── pages/       # 5 个主页面
│   │       ├── components/  # UI 组件 (Radix + shadcn/ui)
│   │       ├── lib/         # API 客户端、i18n、socket、格式化工具
│   │       └── stores/      # Zustand 全局状态
│   │
│   ├── server/          # 后端 — Fastify API + 进程管理器
│   │   └── src/
│   │       ├── routes/      # REST API 端点
│   │       ├── services/    # 业务逻辑（进程、下载、模型、设置）
│   │       └── db/          # SQLite 表结构 + 查询
│   │
│   └── shared/          # 共享类型和常量
│       └── src/
│           ├── types/       # ServerConfig、LocalModel、AppSettings 等
│           └── constants/   # Llama 参数定义
│
├── package.json         # npm workspaces
└── tsconfig.base.json   # 共享 TypeScript 配置
```

---

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **前端** | React 18 + TypeScript | 基于 SPA 的组件化 UI |
| **构建** | Vite 5 | 快速 HMR 开发服务器 + 生产构建 |
| **路由** | react-router-dom v6 | 客户端路由，5 个页面 |
| **状态** | Zustand + TanStack Query v5 | 全局 UI 状态 + 服务端状态缓存 |
| **UI** | Radix UI + Tailwind CSS | 无障碍组件 + 实用优先的样式 |
| **图标** | lucide-react | 统一的图标集 |
| **后端** | Fastify v4 | 高性能 Node.js HTTP 服务器 |
| **实时通信** | Socket.IO v4 | 双向事件（日志、状态、下载进度） |
| **数据库** | SQLite (better-sqlite3) | 零配置嵌入式数据库，WAL 模式 |
| **进程管理** | Node.js child_process | 启动和管理 llama-server |
| **语言** | TypeScript 5.4 | 全栈类型安全 |
| **国际化** | 自实现（零依赖） | 中英文切换，响应式语言切换 |

---

## 核心功能

### 1. 模型发现与下载
- **搜索 HuggingFace** 上的 GGUF 模型（支持中国用户使用的 HF Mirror）
- **模型详情弹窗**，展示完整的 GGUF 文件列表和大小
- **一键下载**，自动管理并发队列
- **暂停 / 恢复 / 取消** — 完整的下载生命周期，支持 `.part` 文件断点续传

### 2. 本地模型管理
- **自动扫描** 模型目录中的 `.gguf` 文件
- **智能解析** — 从文件名中提取量化类型（Q4_K_M、Q8_0...）和参数量（7B、70B...）
- **运行状态** — 绿色徽章标记当前加载的模型
- **一键启动** — 跳转到服务页面并自动使用选定模型启动
- **自动检测** — 启动时自动发现已在运行的 llama-server 进程

### 3. 服务控制（40+ 参数）
全面的配置，按直观的分类组织：

| 分类 | 参数 |
|------|------|
| **模型与网络** | 模型路径、主机、端口、API 密钥、指标监控 |
| **性能** | 上下文大小、线程数、GPU 层数、批大小、并行槽位、连续批处理、Flash Attention、批处理线程、RoPE 频率基数/缩放 |
| **采样** | 温度、Top-P、Top-K、Min-P、重复惩罚、存在惩罚、频率惩罚、Mirostat |
| **内存** | mlock、mmap |
| **高级** | LoRA 适配器、对话模板、语法 (GBNF)、KV 缓存类型、嵌入模式 |
| **原始参数** | 额外 CLI 参数 |

### 4. 实时监控
- **控制台日志查看器** — 通过 Socket.IO 实时显示 llama-server 的 stdout/stderr
- **健康检查** — 定期轮询，自动错误检测
- **自动检测** — 启动时发现已运行的 llama-server 进程

### 5. 下载管理器
- **并发下载** — 可配置并发数（默认 3）
- **实时进度** — 通过 Socket.IO 显示速度、剩余时间、进度条
- **HTTP Range 断点续传** — 从上次中断的位置继续下载
- **下载历史** — 持久化到 SQLite，记录时间戳

### 6. 国际化
- **英文 / 中文** — 一键切换语言，无需刷新页面
- **自研实现** — 零依赖，通过 `useSyncExternalStore` 实现响应式
- **语言偏好持久化** — 保存在 localStorage

### 7. 自动检测
- **llama-server 二进制文件** — 搜索常见安装路径 + `which` 命令
- **版本检测** — 通过 `llama-server --version` 读取版本号
- **已有服务** — 启动时自动接管已运行的 llama-server 进程

---

## 快速开始

### 前置要求

- **Node.js** >= 18
- **llama-server** 二进制文件（来自 [llama.cpp](https://github.com/ggerganov/llama.cpp)）
- 一些 **GGUF 模型文件**

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/rongcheng990/llamaccp-client.git
cd llamaccp-client

# 安装依赖
npm install

# 启动开发环境（前端 :5173 + 后端 :3001）
npm run dev

# 或构建生产版本
npm run build
```

在浏览器中打开 http://localhost:5173

### 首次配置

1. 进入 **设置** 页面
2. 点击 **自动检测** 查找 `llama-server` 二进制文件
3. 设置 **模型目录** 路径（GGUF 文件存储位置）
4. 点击 **保存设置**

### 环境变量

复制 `.env.example` 为 `.env` 并自定义：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LLAMA_SERVER_PATH` | `/opt/homebrew/bin/llama-server` | llama-server 二进制文件路径 |
| `MODEL_DIR` | `~/models` | GGUF 文件存储目录 |
| `SERVER_PORT` | `3001` | 后端 API 端口 |
| `CLIENT_PORT` | `5173` | 前端开发服务器端口 |
| `MAX_CONCURRENT_DOWNLOADS` | `3` | 最大并行下载数 |
| `HF_API_BASE` | `https://hf-mirror.com/api` | HuggingFace API 端点 |

---

## API 接口

### 服务控制
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/server/status` | 获取当前服务状态（状态、PID、配置） |
| POST | `/api/server/start` | 使用配置启动 llama-server |
| POST | `/api/server/stop` | 停止运行中的服务 |
| POST | `/api/server/restart` | 使用（可选）新配置重启 |
| GET | `/api/server/logs` | 获取缓冲的日志行 |

### 模型管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/models/local` | 列出所有本地 GGUF 模型 |
| POST | `/api/models/local/scan` | 扫描模型目录查找新文件 |
| DELETE | `/api/models/local/:id` | 删除模型文件 |

### 下载管理
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/downloads/start` | 开始新下载 |
| POST | `/api/downloads/cancel/:id` | 取消活跃下载 |
| POST | `/api/downloads/pause/:id` | 暂停活跃下载 |
| POST | `/api/downloads/resume/:id` | 恢复已暂停的下载 |
| GET | `/api/downloads/active` | 列出活跃下载 |
| GET | `/api/downloads/history` | 获取下载历史 |

### 设置
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settings` | 获取当前设置 |
| PUT | `/api/settings` | 更新设置 |
| POST | `/api/settings/detect` | 自动检测 llama-server 二进制文件 |

### HuggingFace
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/hf/search?q=&limit=` | 搜索 GGUF 模型 |
| GET | `/api/hf/models/:repoId` | 获取模型详情及文件树 |

### Socket.IO 事件

| 事件 | 方向 | 说明 |
|------|------|------|
| `server:status` | 服务端 → 客户端 | 实时服务状态更新 |
| `server:log` | 服务端 → 客户端 | llama-server 实时日志 |
| `download:progress` | 服务端 → 客户端 | 下载进度更新 |
| `download:completed` | 服务端 → 客户端 | 下载完成通知 |

---

## 数据库结构

SQLite 包含 4 张表，启动时自动迁移：

```
┌──────────────────┐  ┌──────────────────┐
│    settings       │  │     models       │
│──────────────────│  │──────────────────│
│ key (PK) TEXT     │  │ id (PK) TEXT     │
│ value TEXT (JSON) │  │ name TEXT        │
└──────────────────┘  │ file_path TEXT   │
                      │ file_name TEXT   │
┌──────────────────┐  │ file_size INT    │
│ server_configs    │  │ quantization TXT │
│──────────────────│  │ param_count TXT  │
│ id (PK) TEXT      │  │ added_at TEXT    │
│ name TEXT         │  │ last_used TEXT   │
│ config TEXT (JSON)│  └──────────────────┘
│ created_at TEXT   │
│ updated_at TEXT   │  ┌──────────────────┐
└──────────────────┘  │ download_history  │
                      │──────────────────│
                      │ id (PK) TEXT     │
                      │ model_id TEXT    │
                      │ file_name TEXT   │
                      │ url TEXT         │
                      │ total_bytes INT  │
                      │ status TEXT      │
                      │ started_at TEXT  │
                      │ completed_at TEXT│
                      └──────────────────┘
```

---

## 配置参数参考

所有可配置的 llama-server 参数，从 UI 字段到 CLI 标志的映射：

```
UI 字段                 →  CLI 标志
─────────────────────────────────────────
modelPath（模型路径）    →  -m <path>
host（主机）            →  --host <addr>
port（端口）            →  --port <num>
contextSize（上下文大小） →  -c <num>
threads（线程数）        →  -t <num>
gpuLayers（GPU 层数）    →  -ngl <num>
batchSize（批大小）      →  -b <num>
temperature（温度）      →  --temp <float>
topP                    →  --top-p <float>
topK                    →  --top-k <num>
repeatPenalty（重复惩罚） →  --repeat-penalty <float>
mlock（内存锁定）        →  --mlock
mmap（内存映射）         →  --no-mmap（禁用时）
apiKey（API 密钥）       →  --api-key <key>
metrics（指标监控）      →  --metrics
parallel（并行槽位）     →  -np <num>
contBatching（连续批处理） →  -cb
flashAttn（Flash 注意力） →  -fa <on|off>
threadsBatch（批处理线程） →  -tb <num>
ropeFreqBase（RoPE 频率基数） →  --rope-freq-base <float>
ropeFreqScale（RoPE 频率缩放）→  --rope-freq-scale <float>
minP                    →  --min-p <float>
presencePenalty（存在惩罚） →  --presence-penalty <float>
frequencyPenalty（频率惩罚） →  --frequency-penalty <float>
mirostat                →  --mirostat <num>
loraPath（LoRA 路径）    →  --lora <path>
chatTemplate（对话模板）  →  --chat-template <name>
grammar（语法）          →  --grammar <path>
cacheTypeK（K 缓存类型）  →  -ctk <type>
cacheTypeV（V 缓存类型）  →  -ctv <type>
embeddingMode（嵌入模式） →  --embedding
extraArgs（额外参数）     →  （原样追加）
```

---

## 许可证

MIT
