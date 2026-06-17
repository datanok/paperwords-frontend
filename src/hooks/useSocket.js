import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_EVENTS, TIMEOUTS } from '../constants/gameConstants';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    socketRef.current = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected');
      setConnected(true);
      setError(null);
    });

    socketRef.current.on(SOCKET_EVENTS.CONNECTION_ESTABLISHED, (data) => {
      console.log('[Socket] Connection established', data);
      setUserId(data.userId);
      setSessionId(data.sessionId);

      // Tell backend which user this socket belongs to
      socketRef.current.emit('set_user', data.userId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('[Socket] Connection error', error);
      setError(error.message || 'Connection failed');
    });

    // Heartbeat response
    socketRef.current.on(SOCKET_EVENTS.HEARTBEAT_PING, () => {
      socketRef.current.emit(SOCKET_EVENTS.HEARTBEAT_PONG, {
        timestamp: Date.now(),
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const emit = useCallback((event, data, callback) => {
    if (!socketRef.current || !connected) {
      console.warn('[Socket] Cannot emit: socket not connected');
      return;
    }
    socketRef.current.emit(event, data, callback);
  }, [connected]);

  const on = useCallback((event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.on(event, callback);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  const off = useCallback((event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.off(event, callback);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    userId,
    sessionId,
    error,
    emit,
    on,
    off,
  };
};
