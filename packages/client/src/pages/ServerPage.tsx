import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { t, useLocale } from '@/lib/i18n';
import {
  Play,
  Square,
  RotateCcw,
  Circle,
  Save,
  Server as ServerIcon,
  Terminal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { ServerConfig, ServerState } from '@llamaccp/shared';
import { DEFAULT_SERVER_CONFIG } from '@llamaccp/shared';

export function ServerPage() {
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  useLocale();

  const locState = location.state as { modelPath?: string; modelName?: string } | null;

  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState<Partial<ServerConfig>>({
    ...DEFAULT_SERVER_CONFIG,
    id: crypto.randomUUID(),
    name: 'Default',
    modelPath: '',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { data: serverState } = useQuery({
    queryKey: ['server-status'],
    queryFn: api.getServerStatus,
    refetchInterval: 3000,
  });

  // Sync form with running server config
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (serverState?.config && !synced) {
      setConfig(serverState.config);
      setSynced(true);
    }
    if (serverState?.status === 'stopped') {
      setSynced(false);
    }
  }, [serverState?.config, serverState?.status, synced]);

  const { data: savedConfigs = [] } = useQuery({
    queryKey: ['server-configs'],
    queryFn: api.getServerConfigs,
  });

  // When navigating from LocalModels with a model path, apply it and auto-start
  const [autoStarted, setAutoStarted] = useState(false);
  useEffect(() => {
    if (locState?.modelPath && !autoStarted) {
      setAutoStarted(true);
      const newConfig = {
        ...DEFAULT_SERVER_CONFIG,
        id: crypto.randomUUID(),
        name: 'Default',
        modelPath: locState.modelPath,
      };
      setConfig(newConfig);

      // Always use restart — handles both running and stopped cases safely
      toast({ title: t('server.starting') });
      restartMutation.mutate(newConfig as ServerConfig);
      // Clear location state to avoid re-triggering on re-render
      window.history.replaceState({}, '');
    }
  }, [locState?.modelPath, autoStarted]);

  const startMutation = useMutation({
    mutationFn: (cfg?: ServerConfig) => api.startServer(cfg || (config as ServerConfig)),
    onSuccess: () => {
      toast({ title: t('server.starting') });
    },
    onError: (err: Error) => {
      toast({ title: t('server.startFailed'), description: err.message, variant: 'destructive' });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => api.stopServer(),
    onSuccess: () => toast({ title: t('server.stopped') }),
  });

  const restartMutation = useMutation({
    mutationFn: (cfg?: ServerConfig) => api.restartServer(cfg || (config as ServerConfig)),
    onSuccess: () => toast({ title: t('server.restarting') }),
  });

  // Socket.IO for logs
  useEffect(() => {
    import('@/lib/socket').then(({ getSocket }) => {
      const socket = getSocket();
      const handler = (line: string) => setLogs((prev) => [...prev.slice(-499), line]);
      socket.on('server:log', handler);
      return () => { socket.off('server:log', handler); };
    });
  }, []);

  const status = serverState?.status || 'stopped';
  const statusColor = {
    stopped: 'bg-muted-foreground',
    starting: 'bg-yellow-500',
    running: 'bg-green-500',
    stopping: 'bg-yellow-500',
    error: 'bg-red-500',
  }[status];

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('server.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('server.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1">
            <Circle className={`h-2 w-2 fill-current ${statusColor}`} />
            {t(`server.status.${status}`)}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => startMutation.mutate(undefined)}
            disabled={status === 'running' || status === 'starting'}
          >
            <Play className="h-3 w-3 mr-1" /> {t('server.start')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => stopMutation.mutate()}
            disabled={status === 'stopped'}
          >
            <Square className="h-3 w-3 mr-1" /> {t('server.stop')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => restartMutation.mutate(undefined)}
            disabled={status !== 'running'}
          >
            <RotateCcw className="h-3 w-3 mr-1" /> {t('server.restart')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">{t('server.configuration')}</TabsTrigger>
          <TabsTrigger value="console">
            {t('server.console')} {logs.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px]">{logs.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Model & Network */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm">{t('server.modelNetwork')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">{t('server.modelPath')}</label>
                  <Input
                    value={config.modelPath || ''}
                    onChange={(e) => updateConfig('modelPath', e.target.value)}
                    placeholder={t('server.modelPathPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.host')}</label>
                    <Input
                      value={config.host || ''}
                      onChange={(e) => updateConfig('host', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.port')}</label>
                    <Input
                      type="number"
                      value={config.port || 8080}
                      onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                {/* API Key & Security */}
                <div className="pt-2 border-t border-border">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.apiKey')}</label>
                    <Input
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => updateConfig('apiKey', e.target.value)}
                      placeholder={t('server.apiKeyPlaceholder')}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <label className="text-sm text-muted-foreground">{t('server.metrics')}</label>
                    <Switch
                      checked={config.metrics || false}
                      onCheckedChange={(v) => updateConfig('metrics', v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm">{t('server.performance')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.contextSize')}</label>
                    <Input
                      type="number"
                      value={config.contextSize || 4096}
                      onChange={(e) => updateConfig('contextSize', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.threads')}</label>
                    <Input
                      type="number"
                      value={config.threads || 4}
                      onChange={(e) => updateConfig('threads', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.gpuLayers')}</label>
                    <Input
                      type="number"
                      value={config.gpuLayers || 99}
                      onChange={(e) => updateConfig('gpuLayers', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.batchSize')}</label>
                    <Input
                      type="number"
                      value={config.batchSize || 2048}
                      onChange={(e) => updateConfig('batchSize', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.parallel')}</label>
                    <Input
                      type="number"
                      value={config.parallel ?? -1}
                      onChange={(e) => updateConfig('parallel', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.threadsBatch')}</label>
                    <Input
                      type="number"
                      value={config.threadsBatch || 0}
                      onChange={(e) => updateConfig('threadsBatch', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">{t('server.contBatching')}</label>
                  <Switch
                    checked={config.contBatching !== false}
                    onCheckedChange={(v) => updateConfig('contBatching', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">{t('server.flashAttn')}</label>
                  <select
                    className="bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
                    value={config.flashAttn || 'auto'}
                    onChange={(e) => updateConfig('flashAttn', e.target.value)}
                  >
                    <option value="auto">auto</option>
                    <option value="on">on</option>
                    <option value="off">off</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.ropeFreqBase')}</label>
                    <Input
                      type="number"
                      value={config.ropeFreqBase || 0}
                      onChange={(e) => updateConfig('ropeFreqBase', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.ropeFreqScale')}</label>
                    <Input
                      type="number"
                      step={0.1}
                      value={config.ropeFreqScale ?? 1}
                      onChange={(e) => updateConfig('ropeFreqScale', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sampling */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm">{t('server.sampling')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.temperature')}</label>
                    <Input
                      type="number"
                      step={0.05}
                      value={config.temperature || 0.7}
                      onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.topP')}</label>
                    <Input
                      type="number"
                      step={0.05}
                      value={config.topP || 0.9}
                      onChange={(e) => updateConfig('topP', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.topK')}</label>
                    <Input
                      type="number"
                      value={config.topK || 40}
                      onChange={(e) => updateConfig('topK', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.repeatPenalty')}</label>
                    <Input
                      type="number"
                      step={0.05}
                      value={config.repeatPenalty || 1.1}
                      onChange={(e) => updateConfig('repeatPenalty', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.minP')}</label>
                    <Input
                      type="number"
                      step={0.01}
                      value={config.minP ?? 0.05}
                      onChange={(e) => updateConfig('minP', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.mirostat')}</label>
                    <Input
                      type="number"
                      value={config.mirostat ?? 0}
                      onChange={(e) => updateConfig('mirostat', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.presencePenalty')}</label>
                    <Input
                      type="number"
                      step={0.05}
                      value={config.presencePenalty ?? 0}
                      onChange={(e) => updateConfig('presencePenalty', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t('server.frequencyPenalty')}</label>
                    <Input
                      type="number"
                      step={0.05}
                      value={config.frequencyPenalty ?? 0}
                      onChange={(e) => updateConfig('frequencyPenalty', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory & Extra */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm">{t('server.memoryExtra')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">{t('server.memoryLock')}</label>
                  <Switch
                    checked={config.mlock || false}
                    onCheckedChange={(v) => updateConfig('mlock', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">{t('server.memoryMap')}</label>
                  <Switch
                    checked={config.mmap !== false}
                    onCheckedChange={(v) => updateConfig('mmap', v)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t('server.extraArgs')}</label>
                  <Input
                    value={config.extraArgs || ''}
                    onChange={(e) => updateConfig('extraArgs', e.target.value)}
                    placeholder={t('server.extraArgsPlaceholder')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced — collapsible */}
          <div className="mt-4">
            <button
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
              onClick={() => setAdvancedOpen(!advancedOpen)}
            >
              {advancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {t('server.advanced')}
            </button>
            {advancedOpen && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-surface border-border">
                  <CardContent className="space-y-3 pt-5">
                    <div>
                      <label className="text-xs text-muted-foreground">{t('server.loraPath')}</label>
                      <Input
                        value={config.loraPath || ''}
                        onChange={(e) => updateConfig('loraPath', e.target.value)}
                        placeholder={t('server.loraPathPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t('server.chatTemplate')}</label>
                      <Input
                        value={config.chatTemplate || ''}
                        onChange={(e) => updateConfig('chatTemplate', e.target.value)}
                        placeholder={t('server.chatTemplatePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t('server.grammar')}</label>
                      <Input
                        value={config.grammar || ''}
                        onChange={(e) => updateConfig('grammar', e.target.value)}
                        placeholder={t('server.grammarPlaceholder')}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-surface border-border">
                  <CardContent className="space-y-3 pt-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">{t('server.cacheTypeK')}</label>
                        <select
                          className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm text-foreground"
                          value={config.cacheTypeK || 'f16'}
                          onChange={(e) => updateConfig('cacheTypeK', e.target.value)}
                        >
                          <option value="f16">f16</option>
                          <option value="q8_0">q8_0</option>
                          <option value="q4_0">q4_0</option>
                          <option value="q4_1">q4_1</option>
                          <option value="q5_0">q5_0</option>
                          <option value="q5_1">q5_1</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">{t('server.cacheTypeV')}</label>
                        <select
                          className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm text-foreground"
                          value={config.cacheTypeV || 'f16'}
                          onChange={(e) => updateConfig('cacheTypeV', e.target.value)}
                        >
                          <option value="f16">f16</option>
                          <option value="q8_0">q8_0</option>
                          <option value="q4_0">q4_0</option>
                          <option value="q4_1">q4_1</option>
                          <option value="q5_0">q5_0</option>
                          <option value="q5_1">q5_1</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-muted-foreground">{t('server.embeddingMode')}</label>
                      <Switch
                        checked={config.embeddingMode || false}
                        onCheckedChange={(v) => updateConfig('embeddingMode', v)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="console">
          <Card className="bg-surface border-border">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 font-mono text-xs text-green-400 space-y-0.5">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground">{t('server.noLogs')}</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap break-all">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
