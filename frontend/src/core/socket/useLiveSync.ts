import { useEffect } from 'react';
import { useSocket, LiveEvent } from './SocketContext';

/**
 * Hook to listen for specific real-time entity updates and trigger a callback
 * (such as TanStack Query invalidateQueries or showing a Toast).
 *
 * Example:
 * useLiveSync('products', (event) => {
 *   queryClient.invalidateQueries({ queryKey: ['products'] });
 * });
 */
export function useLiveSync<T = unknown>(
  entityName: string,
  onUpdate: (event: LiveEvent<T>) => void,
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (event: LiveEvent<T>) => {
      if (!event.entity || event.entity === entityName) {
        onUpdate(event);
      }
    };

    socket.on('live_event', handler);

    return () => {
      socket.off('live_event', handler);
    };
  }, [socket, entityName, onUpdate]);
}
