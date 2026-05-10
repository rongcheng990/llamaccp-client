import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Star, HardDrive, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/format';
import { t, useLocale } from '@/lib/i18n';
import { api } from '@/lib/api';
import type { HFModel, HFFile } from '@llamaccp/shared';

interface ModelDetailProps {
  model: HFModel;
  open: boolean;
  onClose: () => void;
  onDownload: (repoId: string, fileName: string) => void;
}

export function ModelDetail({ model, open, onClose, onDownload }: ModelDetailProps) {
  useLocale();
  const [files, setFiles] = useState<HFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.getHFModel(model.id)
      .then((detail) => setFiles(detail.siblings?.filter((f) => f.rfilename.endsWith('.gguf')) || []))
      .catch(() => setFiles([]))
      .finally(() => setLoading(false));
  }, [open, model.id]);

  const handleDownload = (file: HFFile) => {
    setDownloading(file.rfilename);
    onDownload(model.id, file.rfilename);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg">{model.name}</DialogTitle>
          <DialogDescription>
            {t('model.by')} {model.author} &middot; {model.downloads.toLocaleString()} {t('model.downloads')} &middot; {model.likes} {t('model.likes')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {model.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-1 mb-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            {t('model.ggufFiles')}
          </h4>
        </div>

        <ScrollArea className="max-h-[40vh]">
          <div className="space-y-2 pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {t('discover.loading')}
              </div>
            ) : files.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('model.noGguf')}
              </p>
            ) : (
              files.map((file) => (
                <div
                  key={file.rfilename}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-3"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.rfilename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.size ? formatBytes(file.size) : t('model.unknownSize')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={downloading === file.rfilename}
                    className="shrink-0"
                  >
                    {downloading === file.rfilename ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    {downloading === file.rfilename ? '' : t('model.download')}
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
