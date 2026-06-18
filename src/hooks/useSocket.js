import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_EVENTS, SESSION_KEYS } from '../constants/gameConstants';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [connected, setConnected]       = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [userId, setUserId]             = useState(null);
  const [sessionId, setSessionId]       = useState(null);
  const [error, setError]               = useState(null);
  const [restoredRoom, setRestoredRoom] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    socketRef.current = io(apiUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      setReconnecting(false);
      setError(null);
    });

    socketRef.current.on('reconnecting', () => {
      setReconnecting(true);
    });

    socketRef.current.on(SOCKET_EVENTS.CONNECTION_ESTABLISHED, (data) => {
      // Prefer the userId we already have stored — this is the same player reconnecting.
      const storedUserId  = localStorage.getItem(SESSION_KEYS.USER_ID);
      const activeUserId  = storedUserId || data.userId;

      if (!storedUserId) {
        localStorage.setItem(SESSION_KEYS.USER_ID,    data.userId);
        localStorage.setItem(SESSION_KEYS.SESSION_ID, data.sessionId);
      }

      setUserId(activeUserId);
      setSessionId(data.sessionId);

      // Tell the backend which user this socket is for.
      // If the user was in a room, the backend will restore the session automatically.
      socketRef.current.emit('set_user', activeUserId);
    });

    socketRef.current.on('session_restored', (data) => {
      setRestoredRoom(data);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('reconnect_failed', () => {
      setReconnecting(false);
      setError('Could not reconnect. Please refresh.');
    });

    socketRef.current.on('connect_error', (err) => {
      setError(err.message || 'Connection failed');
    });

    socketRef.current.on(SOCKET_EVENTS.HEARTBEAT_PING, () => {
      socketRef.current.emit(SOCKET_EVENTS.HEARTBEAT_PONG, { timestamp: Date.now() });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const emit = useCallback((event, data, callback) => {
    if (!socketRef.current || !connected) {
      console.warn('[Socket] Cannot emit: not connected');
      return;
    }
    socketRef.current.emit(event, data, callback);
  }, [connected]);

  const on = useCallback((event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.on(event, callback);
    return () => { if (socketRef.current) socketRef.current.off(event, callback); };
  }, []);

  const off = useCallback((event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.off(event, callback);
  }, []);

  return { socket: socketRef.current, connected, reconnecting, userId, sessionId, error, restoredRoom, emit, on, off };
};
