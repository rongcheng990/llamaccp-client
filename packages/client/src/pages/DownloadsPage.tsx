import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, X, Clock, HardDrive, Pause, Play, History } from 'lucide-react';
import { formatBytes, formatSpeed, formatETA } from '@/lib/format';
import { t, useLocale } from '@/lib/i18n';
import type { DownloadProgress } from '@llamaccp/shared';

export function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);
  const [tab, setTab] = useState('active');
  const queryClient = useQueryClient();
  useLocale();

  const { data: activeDownloads } = useQuery({
    queryKey: ['downloads'],
    queryFn: api.getActiveDownloads,
    refetchInterval: 2000,
  });

  const { data: historyData } = useQuery({
    queryKey: ['download-history'],
    queryFn: api.getDownloadHistory,
    enabled: tab === 'history',
  });

  // Socket.IO for real-time progress
  useEffect(() => {
    let socket: any;
    import('@/lib/socket').then(({ getSocket }) => {
      socket = getSocket();

      const onProgress = (progress: DownloadProgress) => {
        setDownloads((prev) => {
          const idx = prev.findIndex((d) => d.id === progress.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = progress;
            return next;
          }
          return [progress, ...prev];
        });
      };

      const onCompleted = (progress: DownloadProgress) => {
        setDownloads((prev) => {
          const idx = prev.findIndex((d) => d.id === progress.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = progress;
            return next;
          }
          return [progress, ...prev];
        });
        // Refresh history when a download completes
        queryClient.invalidateQueries({ queryKey: ['download-history'] });
      };

      socket.on('download:progress', onProgress);
      socket.on('download:completed', onCompleted);
    });

    return () => {
      if (socket) {
        socket.off('download:progress');
        socket.off('download:completed');
      }
    };
  }, [queryClient]);

  // Merge API data with socket data
  useEffect(() => {
    if (activeDownloads) {
      setDownloads((prev) => {
        const socketIds = new Set(prev.map((d) => d.id));
        const merged = [...prev];
        for (const dl of activeDownloads) {
          if (!socketIds.has(dl.id)) {
            merged.push(dl);
          }
        }
        return merged;
      });
    }
  }, [activeDownloads]);

  const handleCancel = async (id: string) => {
    try {
      await api.cancelDownload(id);
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'cancelled' as const } : d)),
      );
      queryClient.invalidateQueries({ queryKey: ['download-history'] });
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.pauseDownload(id);
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'paused' as const, speed: 0, eta: 0 } : d)),
      );
    } catch (err) {
      console.error('Pause failed:', err);
    }
  };

  const handleResume = async (id: string) => {
    try {
      const result = await api.resumeDownload(id);
      if (result) {
        setDownloads((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: 'downloading' as const } : d)),
        );
      }
    } catch (err) {
      console.error('Resume failed:', err);
    }
  };

  const activeCount = downloads.filter((d) => d.status === 'downloading' || d.status === 'paused').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('downloads.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeCount > 0
            ? t(activeCount > 1 ? 'downloads.activePlural' : 'downloads.active', { n: activeCount })
            : t('downloads.noActive')}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">{t('downloads.tab.active')}</TabsTrigger>
          <TabsTrigger value="history">{t('downloads.tab.history')}</TabsTrigger>
        </TabsList>

        {/* Active Downloads Tab */}
        <TabsContent value="active">
          {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Download className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">{t('downloads.noDownloads')}</p>
              <p className="text-sm mt-1">{t('downloads.noDownloadsHint')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {downloads.map((dl) => {
                const progress = dl.totalBytes > 0
                  ? Math.round((dl.downloadedBytes / dl.totalBytes) * 100)
                  : 0;

                return (
                  <Card key={dl.id} className="bg-surface border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {dl.fileName}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {dl.modelId}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 ml-3">
                          <StatusBadge status={dl.status} />
                          {dl.status === 'downloading' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePause(dl.id)}
                                title={t('downloads.pause')}
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancel(dl.id)}
                                title={t('downloads.cancel')}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {dl.status === 'paused' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleResume(dl.id)}
                                title={t('downloads.resume')}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancel(dl.id)}
                                title={t('downloads.cancel')}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <Progress value={progress} className="h-1.5 mb-2" />

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {formatBytes(dl.downloadedBytes)} / {formatBytes(dl.totalBytes)} ({progress}%)
                        </span>
                        {dl.status === 'downloading' && (
                          <>
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatSpeed(dl.speed)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatETA(dl.eta)}
                            </span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {!historyData || historyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <History className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">{t('downloads.noHistory')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyData.map((item: any) => (
                <Card key={item.id} className="bg-surface border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {item.file_name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.model_id || '-'}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>{formatBytes(item.total_bytes)}</span>
                      {item.started_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.started_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  useLocale();
  const styles: Record<string, string> = {
    downloading: 'bg-blue-500/10 text-blue-400',
    paused: 'bg-yellow-500/10 text-yellow-400',
    completed: 'bg-green-500/10 text-green-400',
    failed: 'bg-red-500/10 text-red-400',
    cancelled: 'bg-gray-500/10 text-gray-400',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${styles[status] || ''}`}>
      {t(`downloads.status.${status}`)}
    </span>
  );
}
