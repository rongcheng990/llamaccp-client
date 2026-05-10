import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Trash2, RefreshCw, Play, Circle } from 'lucide-react';
import { formatBytes } from '@/lib/format';
import { t, useLocale } from '@/lib/i18n';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import type { LocalModel } from '@llamaccp/shared';

export function LocalModelsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  useLocale();

  const { data: models = [], isLoading, refetch } = useQuery({
    queryKey: ['local-models'],
    queryFn: api.getLocalModels,
  });

  const { data: serverState } = useQuery({
    queryKey: ['server-status'],
    queryFn: api.getServerStatus,
    refetchInterval: 5000,
  });

  const runningModelPath = (serverState?.status === 'running' || serverState?.status === 'starting')
    ? serverState.config?.modelPath
    : undefined;

  // Match model by full path OR by filename suffix (for externally-started servers)
  const isModelRunning = (model: LocalModel) => {
    if (!runningModelPath) return false;
    if (runningModelPath === model.filePath) return true;
    return model.filePath.endsWith(runningModelPath) || runningModelPath.endsWith(model.fileName);
  };

  const deleteMutation = useMutation({
    mutationFn: api.deleteModel,
    onSuccess: () => {
      toast({ title: t('local.modelDeleted') });
      queryClient.invalidateQueries({ queryKey: ['local-models'] });
    },
    onError: (err: Error) => {
      toast({ title: t('local.deleteFailed'), description: err.message, variant: 'destructive' });
    },
  });

  const scanMutation = useMutation({
    mutationFn: api.scanModels,
    onSuccess: (models) => {
      toast({ title: t('local.scanResult', { n: models.length }) });
      queryClient.invalidateQueries({ queryKey: ['local-models'] });
    },
    onError: (err: Error) => {
      toast({ title: t('local.scanFailed'), description: err.message, variant: 'destructive' });
    },
  });

  const handleStartServer = (model: LocalModel) => {
    navigate('/server', { state: { modelPath: model.filePath, modelName: model.name } });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('local.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('local.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
          {t('local.scanDirectory')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          {t('local.loading')}
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <HardDrive className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">{t('local.noModels')}</p>
          <p className="text-sm mt-1">
            {t('local.noModelsHint')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => {
            const isRunning = isModelRunning(model);
            return (
              <Card
                key={model.id}
                className={`bg-surface border-border hover:border-primary/30 transition-all ${isRunning ? 'border-green-500/50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {model.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {model.fileName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      {isRunning && (
                        <Badge variant="outline" className="gap-1 text-green-500 border-green-500/50 px-2 py-0.5">
                          <Circle className="h-1.5 w-1.5 fill-current" />
                          {t('local.running')}
                        </Badge>
                      )}
                      {model.quantization && (
                        <Badge variant="secondary">
                          {model.quantization}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>{formatBytes(model.fileSize)}</span>
                    {model.parameterCount && <span>{model.parameterCount}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      variant={isRunning ? 'outline' : 'default'}
                      onClick={() => handleStartServer(model)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {isRunning ? t('local.running') : t('local.startServer')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(t('local.confirmDelete'))) {
                          deleteMutation.mutate(model.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
