import { useEffect, useRef, useState } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import type { ServerState, DownloadProgress } from '@llamaccp/shared';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      disconnectSocket();
    };
  }, []);

  return { socket: socketRef.current, connected };
}

export function useServerSocket(onStatus?: (state: ServerState) => void, onLog?: (line: string) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    if (onStatus) socket.on('server:status', onStatus);
    if (onLog) socket.on('server:log', onLog);

    return () => {
      if (onStatus) socket.off('server:status', onStatus);
      if (onLog) socket.off('server:log', onLog);
    };
  }, [socket, onStatus, onLog]);
}

export function useDownloadSocket(
  onProgress?: (progress: DownloadProgress) => void,
  onCompleted?: (progress: DownloadProgress) => void,
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    if (onProgress) socket.on('download:progress', onProgress);
    if (onCompleted) socket.on('download:completed', onCompleted);

    return () => {
      if (onProgress) socket.off('download:progress', onProgress);
      if (onCompleted) socket.off('download:completed', onCompleted);
    };
  }, [socket, onProgress, onCompleted]);
}
