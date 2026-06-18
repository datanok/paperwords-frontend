import { useCallback, useState, useEffect } from 'react';
import { SESSION_KEYS } from '../constants/gameConstants';

// userId and roomId use localStorage so they survive mobile tab suspension.
// Role and wordLength use sessionStorage — they're restored from backend on rejoin.
const persistent = (key, val) => {
  if (val === undefined) return localStorage.getItem(key);
  if (val === null) localStorage.removeItem(key);
  else localStorage.setItem(key, val);
};
const session_ = (key, val) => {
  if (val === undefined) return sessionStorage.getItem(key);
  if (val === null) sessionStorage.removeItem(key);
  else sessionStorage.setItem(key, val);
};

export const useSession = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const userId     = persistent(SESSION_KEYS.USER_ID);
    const sessionId  = persistent(SESSION_KEYS.SESSION_ID);
    const roomId     = persistent(SESSION_KEYS.ROOM_ID);
    const playerRole = session_(SESSION_KEYS.PLAYER_ROLE);
    const wordLengthStr = session_(SESSION_KEYS.WORD_LENGTH);

    if (userId && sessionId) {
      setSession({
        userId,
        sessionId,
        roomId,
        playerRole,
        wordLength: wordLengthStr ? parseInt(wordLengthStr, 10) : null,
        createdAt: new Date(),
      });
    }
  }, []);

  const saveSession = useCallback((sessionData) => {
    persistent(SESSION_KEYS.USER_ID,    sessionData.userId);
    persistent(SESSION_KEYS.SESSION_ID, sessionData.sessionId);
    if (sessionData.roomId)     persistent(SESSION_KEYS.ROOM_ID, sessionData.roomId);
    if (sessionData.playerRole) session_(SESSION_KEYS.PLAYER_ROLE, sessionData.playerRole);
    if (sessionData.wordLength) session_(SESSION_KEYS.WORD_LENGTH, String(sessionData.wordLength));
    setSession(sessionData);
  }, []);

  const updateSession = useCallback((updates) => {
    setSession((prev) => {
      const updated = { ...prev, ...updates };
      if (updates.userId)     persistent(SESSION_KEYS.USER_ID, updates.userId);
      if (updates.roomId)     persistent(SESSION_KEYS.ROOM_ID, updates.roomId);
      if (updates.playerRole) session_(SESSION_KEYS.PLAYER_ROLE, updates.playerRole);
      return updated;
    });
  }, []);

  const clearSession = useCallback(() => {
    persistent(SESSION_KEYS.USER_ID,    null);
    persistent(SESSION_KEYS.SESSION_ID, null);
    persistent(SESSION_KEYS.ROOM_ID,    null);
    session_(SESSION_KEYS.PLAYER_ROLE,  null);
    session_(SESSION_KEYS.WORD_LENGTH,  null);
    setSession(null);
  }, []);

  const hasValidSession = useCallback(() => {
    return !!(session?.userId && session?.sessionId && session?.roomId);
  }, [session]);

  return { session, saveSession, updateSession, clearSession, hasValidSession };
};
