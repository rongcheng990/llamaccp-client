import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModelDetail } from '@/components/models/ModelDetail';
import { Search, Download, Star, RefreshCw } from 'lucide-react';
import { formatBytes } from '@/lib/format';
import { t, useLocale } from '@/lib/i18n';
import type { HFModel } from '@llamaccp/shared';
import { useToast } from '@/components/ui/use-toast';

export function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<HFModel | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  useLocale();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['hf-search', search],
    queryFn: () => api.searchHFModels(search || 'gguf'),
    enabled: true,
  });

  const downloadMutation = useMutation({
    mutationFn: (params: { repoId: string; fileName: string }) =>
      api.startDownload({ repoId: params.repoId, fileName: params.fileName }),
    onSuccess: (_data, variables) => {
      toast({ title: t('discover.downloadStarted') });
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      navigate('/downloads');
    },
    onError: (err: Error) => {
      if (err.message.includes('Max concurrent')) {
        toast({ title: t('discover.downloadQueued'), variant: 'destructive' });
      } else {
        toast({ title: t('discover.downloadFailed'), description: err.message, variant: 'destructive' });
      }
    },
  });

  const models = data?.models || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('discover.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('discover.subtitle')}
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('discover.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && refetch()}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Model grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          {t('discover.loading')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {models.map((model) => (
            <Card
              key={model.id}
              className="bg-surface hover:bg-surface-hover border-border cursor-pointer transition-all hover:border-primary/30"
              onClick={() => setSelectedModel(model)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {model.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {t('model.by')} {model.author}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {model.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {model.downloads > 1000
                      ? `${(model.downloads / 1000).toFixed(0)}k`
                      : model.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {model.likes}
                  </span>
                  <span>
                    {model.siblings?.filter((f) => f.rfilename.endsWith('.gguf')).length || 0} {t('discover.gguf')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Model detail dialog */}
      {selectedModel && (
        <ModelDetail
          model={selectedModel}
          open={!!selectedModel}
          onClose={() => setSelectedModel(null)}
          onDownload={(repoId, fileName) => {
            downloadMutation.mutate({ repoId, fileName });
            setSelectedModel(null);
          }}
        />
      )}
    </div>
  );
}
