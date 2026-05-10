# LlamaCCP Client

> A modern desktop-style Web GUI for managing llama.cpp server — discover, download, configure and run local LLMs with ease.

**English** | [**中文**](./README_CN.md)

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Fastify](https://img.shields.io/badge/Fastify-4-black)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    LlamaCCP Client                           │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Discover │  Local   │  Server  │Download  │    Settings     │
│  Models  │  Models  │ Control  │ Manager  │  & Preferences  │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│                                                              │
│  🔍 HF Model Search    📥 Concurrent Downloads              │
│  📂 Local Model Mgmt   ⚙️  40+ Server Params                │
│  🚀 One-click Launch   📊 Real-time Logs & Health           │
│  🌐 EN/ZH i18n         🔌 Auto-detect llama.cpp             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Screenshots

### Discover & Download Models
Browse HuggingFace GGUF models, search by keyword, view model details, and download with one click.

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Search models...                              [Scan Dir]   │
├─────────────────────┬─────────────────────┬───────────────────┤
│ ┌─────────────────┐ │ ┌─────────────────┐ │ ┌───────────────┐ │
│ │  🤖 Qwen3-30B   │ │ │  🤖 Gemma-4     │ │ │ 🤖 Llama-3.2  │ │
│ │  Q4_K_M · 18GB  │ │ │  E4B Q8_0 · 8GB │ │ │ 1B · 1.3GB    │ │
│ │  ↓ 12.5k  ♥ 890 │ │ │  ↓ 8.2k  ♥ 620  │ │ │ ↓ 45k ♥ 2.1k │ │
│ │  [Download]     │ │ │  [Download]      │ │ │ [Download]    │ │
│ └─────────────────┘ │ └─────────────────┘ │ └───────────────┘ │
└─────────────────────┴─────────────────────┴───────────────────┘
```

### Local Models with Running Status
See which model is currently running, manage local GGUF files, and launch the server directly.

```
┌─────────────────────┬─────────────────────┬───────────────────┐
│ Gemma-4 E4B Q4_K_M  │ Qwen2.5 0.5B Q2_K  │ Llama-3.2 1B Q8_0│
│ 5.0 GB · Q4_K_M     │ 396 MB · Q2_K       │ 1.3 GB · Q8_0    │
│ 🟢 Running          │                     │                   │
│ [  Running  ]  🗑️   │ [Start Server]  🗑️  │ [Start Server] 🗑️│
└─────────────────────┴─────────────────────┴───────────────────┘
```

### Server Configuration (40+ Parameters)
Full control over llama-server with categorized config cards, real-time console, and one-click start/stop/restart.

```
┌─────────────────────────────────────────────────────────────────┐
│  Server                                    🟢 running           │
│                                            [▶ Start][■ Stop][↻] │
├──────────────────────┬──────────────────────────────────────────┤
│ Configuration [Console]                                        │
├──────────────────────┼──────────────────────────────────────────┤
│                      │                                          │
│  Model & Network     │  Performance                             │
│  ├─ Model Path       │  ├─ Context Size (-c)    4096           │
│  ├─ Host / Port      │  ├─ Threads (-t)         4              │
│  ├─ API Key 🔒       │  ├─ GPU Layers (-ngl)    99             │
│  └─ Metrics [toggle] │  ├─ Batch Size (-b)      2048           │
│                      │  ├─ Parallel Slots (-np) -1             │
│                      │  ├─ Continuous Batching  [✓]            │
│                      │  ├─ Flash Attention      [auto ▼]       │
│                      │  └─ RoPE Freq Base/Scale                │
│                      │                                          │
│  Sampling            │  Memory & Extra                          │
│  ├─ Temperature  0.7 │  ├─ Memory Lock (mlock) [ ]             │
│  ├─ Top P        0.9 │  ├─ Memory Map (mmap)  [✓]             │
│  ├─ Top K         40 │  └─ Extra Args                           │
│  ├─ Min P       0.05 │                                          │
│  ├─ Repeat Penalty│  │  ▸ Advanced                              │
│  ├─ Mirostat      0  │    ├─ LoRA Adapter                       │
│  └─ Presence/Freq    │    ├─ Chat Template                      │
│                      │    ├─ Grammar (GBNF)                     │
│                      │    ├─ Cache Type K/V                     │
│                      │    └─ Embedding Mode                     │
└──────────────────────┴──────────────────────────────────────────┘
```

### Download Manager
Concurrent downloads with pause/resume/cancel, real-time progress, and download history.

```
┌─────────────────────────────────────────────────────────────────┐
│  Downloads                            [Active] [History]       │
├─────────────────────────────────────────────────────────────────┤
│  📥 gemma-4-E4B-it-Q4_K_M.gguf                                 │
│  ████████████████████░░░░░░░  76%  ·  3.8 / 5.0 GB             │
│  Speed: 45.2 MB/s  ·  ETA: 26s        [⏸ Pause] [✕ Cancel]    │
│                                                                  │
│  📥 Qwen3.5-9B-Q4_K_M.gguf                                     │
│  ██████░░░░░░░░░░░░░░░░░░  28%  ·  1.5 / 5.2 GB               │
│  Speed: 38.7 MB/s  ·  ETA: 1m 52s     [⏸ Pause] [✕ Cancel]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

```
                         ┌─────────────────┐
                         │   Browser (SPA) │
                         │  React 18 + Vite│
                         └────────┬────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    │ HTTP /api/* │              │
                    │             │  Socket.IO   │
                    │             │  (WebSocket) │
                    ▼             ▼              │
              ┌─────────────────────────┐        │
              │   Fastify Server :3001  │◄───────┘
              │                         │
              │  ┌───────────────────┐  │
              │  │  Process Manager  │  │     ┌──────────────────┐
              │  │  (child_process)  │──┼────►│  llama-server    │
              │  └───────────────────┘  │     │  (:8081)         │
              │                         │     └──────────────────┘
              │  ┌───────────────────┐  │
              │  │  Download Manager │  │     ┌──────────────────┐
              │  │  (concurrent dl)  │──┼────►│  HuggingFace CDN │
              │  └───────────────────┘  │     └──────────────────┘
              │                         │
              │  ┌───────────────────┐  │
              │  │  SQLite Database  │  │
              │  │  (better-sqlite3) │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
```

### Monorepo Structure

```
llamaccp-client/
├── packages/
│   ├── client/          # Frontend — React 18 SPA (Vite + Tailwind)
│   │   └── src/
│   │       ├── pages/       # 5 main pages
│   │       ├── components/  # UI components (Radix + shadcn/ui)
│   │       ├── lib/         # API client, i18n, socket, format utils
│   │       └── stores/      # Zustand global state
│   │
│   ├── server/          # Backend — Fastify API + Process Manager
│   │   └── src/
│   │       ├── routes/      # REST API endpoints
│   │       ├── services/    # Business logic (process, download, model, settings)
│   │       └── db/          # SQLite schema + queries
│   │
│   └── shared/          # Shared types & constants
│       └── src/
│           ├── types/       # ServerConfig, LocalModel, AppSettings, etc.
│           └── constants/   # Llama param definitions
│
├── package.json         # npm workspaces
└── tsconfig.base.json   # Shared TypeScript config
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | SPA with component-based UI |
| **Build** | Vite 5 | Fast HMR dev server + production build |
| **Routing** | react-router-dom v6 | Client-side routing with 5 pages |
| **State** | Zustand + TanStack Query v5 | Global UI state + server state caching |
| **UI** | Radix UI + Tailwind CSS | Accessible components + utility-first styling |
| **Icons** | lucide-react | Consistent icon set |
| **Backend** | Fastify v4 | High-performance Node.js HTTP server |
| **Real-time** | Socket.IO v4 | Bidirectional events (logs, status, download progress) |
| **Database** | SQLite (better-sqlite3) | Zero-config embedded DB, WAL mode |
| **Process** | Node.js child_process | Spawns and manages llama-server |
| **Language** | TypeScript 5.4 | Full-stack type safety |
| **i18n** | Custom (no deps) | EN/ZH with reactive locale switching |

---

## Key Features

### 1. Model Discovery & Download
- **Search HuggingFace** for GGUF models (supports HF Mirror for China users)
- **Model detail dialog** with full GGUF file listing and sizes
- **One-click download** with automatic concurrent queue management
- **Pause / Resume / Cancel** — full download lifecycle with `.part` file support

### 2. Local Model Management
- **Auto-scan** model directories for `.gguf` files
- **Smart parsing** — extracts quantization (Q4_K_M, Q8_0...) and parameter count (7B, 70B...) from filenames
- **Running status** — green badge marks the currently loaded model
- **One-click launch** — navigate to server page and auto-start with selected model

### 3. Server Control (40+ Parameters)
Comprehensive configuration organized into intuitive categories:

| Category | Parameters |
|----------|-----------|
| **Model & Network** | model path, host, port, API key, metrics |
| **Performance** | context size, threads, GPU layers, batch size, parallel slots, continuous batching, flash attention, batch threads, RoPE freq base/scale |
| **Sampling** | temperature, top-P, top-K, min-P, repeat penalty, presence/frequency penalty, mirostat |
| **Memory** | mlock, mmap |
| **Advanced** | LoRA adapter, chat template, grammar (GBNF), KV cache types, embedding mode |
| **Raw** | extra CLI arguments |

### 4. Real-time Monitoring
- **Console log viewer** — live stdout/stderr from llama-server via Socket.IO
- **Health checks** — periodic polling with automatic error detection
- **Auto-detection** — discovers already-running llama-server on startup

### 5. Download Manager
- **Concurrent downloads** — configurable limit (default 3)
- **Real-time progress** — speed, ETA, progress bar via Socket.IO
- **HTTP Range resume** — continues interrupted downloads from last byte
- **Download history** — persisted in SQLite with timestamps

### 6. Internationalization
- **English / 中文** — one-click language switch, no page reload
- **Custom implementation** — zero dependencies, reactive via `useSyncExternalStore`
- **Locale persistence** — saved in localStorage

### 7. Auto-detection
- **llama-server binary** — searches common install paths + `which`
- **Version detection** — reads version string from `llama-server --version`
- **Pre-existing server** — adopts already-running llama-server process on startup

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **llama-server** binary (from [llama.cpp](https://github.com/ggerganov/llama.cpp))
- Some **GGUF model files**

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd llamaccp-client

# Install dependencies
npm install

# Start development (frontend :5173 + backend :3001)
npm run dev

# Or build for production
npm run build
```

Open http://localhost:5173 in your browser.

### First-time Setup

1. Go to **Settings** page
2. Click **Auto Detect** to find your `llama-server` binary
3. Set your **Model Directory** path (where GGUF files are stored)
4. Click **Save Settings**

### Environment Variables

Copy `.env.example` to `.env` and customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `LLAMA_SERVER_PATH` | `/opt/homebrew/bin/llama-server` | Path to llama-server binary |
| `MODEL_DIR` | `~/models` | GGUF file storage directory |
| `SERVER_PORT` | `3001` | Backend API port |
| `CLIENT_PORT` | `5173` | Frontend dev server port |
| `MAX_CONCURRENT_DOWNLOADS` | `3` | Max parallel downloads |
| `HF_API_BASE` | `https://hf-mirror.com/api` | HuggingFace API endpoint |

---

## API Endpoints

### Server
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/server/status` | Current server state (status, pid, config) |
| POST | `/api/server/start` | Start llama-server with config |
| POST | `/api/server/stop` | Stop running server |
| POST | `/api/server/restart` | Restart with (optional) new config |
| GET | `/api/server/logs` | Get buffered log lines |

### Models
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/models/local` | List all local GGUF models |
| POST | `/api/models/local/scan` | Scan model directory for new files |
| DELETE | `/api/models/local/:id` | Delete a model file |

### Downloads
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/downloads/start` | Start a new download |
| POST | `/api/downloads/cancel/:id` | Cancel active download |
| POST | `/api/downloads/pause/:id` | Pause active download |
| POST | `/api/downloads/resume/:id` | Resume paused download |
| GET | `/api/downloads/active` | List active downloads |
| GET | `/api/downloads/history` | Get download history |

### Settings
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings` | Get current settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/settings/detect` | Auto-detect llama-server binary |

### HuggingFace
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hf/search?q=&limit=` | Search HF for GGUF models |
| GET | `/api/hf/models/:repoId` | Get model detail with file tree |

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `server:status` | Server → Client | Real-time server state updates |
| `server:log` | Server → Client | Live log lines from llama-server |
| `download:progress` | Server → Client | Download progress updates |
| `download:completed` | Server → Client | Download finished notification |

---

## Database Schema

SQLite with 4 tables, auto-migrated on startup:

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

## Configuration Reference

All configurable llama-server parameters mapped from UI to CLI:

```
UI Field                →  CLI Flag
─────────────────────────────────────────
modelPath               →  -m <path>
host                    →  --host <addr>
port                    →  --port <num>
contextSize             →  -c <num>
threads                 →  -t <num>
gpuLayers               →  -ngl <num>
batchSize               →  -b <num>
temperature             →  --temp <float>
topP                    →  --top-p <float>
topK                    →  --top-k <num>
repeatPenalty           →  --repeat-penalty <float>
mlock                   →  --mlock
mmap                    →  --no-mmap (when disabled)
apiKey                  →  --api-key <key>
metrics                 →  --metrics
parallel                →  -np <num>
contBatching            →  -cb
flashAttn               →  -fa <on|off>
threadsBatch            →  -tb <num>
ropeFreqBase            →  --rope-freq-base <float>
ropeFreqScale           →  --rope-freq-scale <float>
minP                    →  --min-p <float>
presencePenalty         →  --presence-penalty <float>
frequencyPenalty        →  --frequency-penalty <float>
mirostat                →  --mirostat <num>
loraPath                →  --lora <path>
chatTemplate            →  --chat-template <name>
grammar                 →  --grammar <path>
cacheTypeK              →  -ctk <type>
cacheTypeV              →  -ctv <type>
embeddingMode           →  --embedding
extraArgs               →  (appended as-is)
```

---

## License

MIT
