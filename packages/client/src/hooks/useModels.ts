import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useModels() {
  const localModels = useQuery({
    queryKey: ['local-models'],
    queryFn: api.getLocalModels,
  });

  return { localModels };
}

export function useHFSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['hf-search', query],
    queryFn: () => api.searchHFModels(query || 'gguf'),
    enabled,
  });
}
