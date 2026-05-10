import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ServerConfig, ServerState } from '@llamaccp/shared';

export function useServer() {
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: ['server-status'],
    queryFn: api.getServerStatus,
    refetchInterval: 5000,
  });

  const start = useMutation({
    mutationFn: (config: ServerConfig) => api.startServer(config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-status'] }),
  });

  const stop = useMutation({
    mutationFn: () => api.stopServer(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-status'] }),
  });

  const restart = useMutation({
    mutationFn: (config: ServerConfig) => api.restartServer(config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-status'] }),
  });

  return { status: status.data, start, stop, restart, isLoading: status.isLoading };
}
