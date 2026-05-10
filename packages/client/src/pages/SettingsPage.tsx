import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Save, Search, CheckCircle, XCircle } from 'lucide-react';
import { t, useLocale, setLocale, getLocale, type Locale } from '@/lib/i18n';
import type { AppSettings } from '@llamaccp/shared';

export function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locale = useLocale();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  });

  const [form, setForm] = useState<Partial<AppSettings>>({});

  // Sync form with loaded settings
  const currentForm = settings ? { ...settings, ...form } : form;

  const updateForm = (key: keyof AppSettings, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: () => api.updateSettings(currentForm),
    onSuccess: () => {
      toast({ title: t('settings.saved') });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setForm({});
    },
    onError: (err: Error) => {
      toast({ title: t('settings.saveFailed'), description: err.message, variant: 'destructive' });
    },
  });

  const detectMutation = useMutation({
    mutationFn: api.detectLlamaCpp,
    onSuccess: (result) => {
      if (result.found) {
        updateForm('llamaServerPath', result.path);
        toast({ title: t('settings.detected'), description: `${result.path} (${result.version})` });
      } else {
        toast({ title: t('settings.notFound'), description: result.error, variant: 'destructive' });
      }
    },
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Language */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm">{t('settings.language')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">{t('settings.languageHint')}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={locale === 'en' ? 'default' : 'outline'}
                onClick={() => setLocale('en')}
              >
                English
              </Button>
              <Button
                size="sm"
                variant={locale === 'zh' ? 'default' : 'outline'}
                onClick={() => setLocale('zh')}
              >
                中文
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* llama.cpp binary */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm">{t('settings.llamaCppBinary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">{t('settings.llamaServerPath')}</label>
              <div className="flex gap-2">
                <Input
                  value={currentForm.llamaServerPath || ''}
                  onChange={(e) => updateForm('llamaServerPath', e.target.value)}
                  placeholder="/path/to/llama-server"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => detectMutation.mutate()}
                  disabled={detectMutation.isPending}
                >
                  <Search className="h-4 w-4 mr-1" />
                  {t('settings.autoDetect')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model directory */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm">{t('settings.modelStorage')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">{t('settings.modelDir')}</label>
              <Input
                value={currentForm.modelDir || ''}
                onChange={(e) => updateForm('modelDir', e.target.value)}
                placeholder="~/models"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {t('settings.modelDirHint')}
              </p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t('settings.maxConcurrent')}</label>
              <Input
                type="number"
                value={currentForm.maxConcurrentDownloads || 3}
                onChange={(e) => updateForm('maxConcurrentDownloads', parseInt(e.target.value))}
                min={1}
                max={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {t('settings.saveSettings')}
          </Button>
        </div>
      </div>
    </div>
  );
}
