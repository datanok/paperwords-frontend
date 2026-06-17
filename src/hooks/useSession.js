import { useCallback, useState, useEffect } from 'react';
import { SESSION_KEYS } from '../constants/gameConstants';

export const useSession = () => {
  const [session, setSession] = useState(null);

  // Initialize session from sessionStorage on mount
  useEffect(() => {
    const userId = sessionStorage.getItem(SESSION_KEYS.USER_ID);
    const sessionId = sessionStorage.getItem(SESSION_KEYS.SESSION_ID);
    const roomId = sessionStorage.getItem(SESSION_KEYS.ROOM_ID);
    const playerRole = sessionStorage.getItem(SESSION_KEYS.PLAYER_ROLE);
    const wordLengthStr = sessionStorage.getItem(SESSION_KEYS.WORD_LENGTH);

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
    sessionStorage.setItem(SESSION_KEYS.USER_ID, sessionData.userId);
    sessionStorage.setItem(SESSION_KEYS.SESSION_ID, sessionData.sessionId);
    if (sessionData.roomId) {
      sessionStorage.setItem(SESSION_KEYS.ROOM_ID, sessionData.roomId);
    }
    if (sessionData.playerRole) {
      sessionStorage.setItem(SESSION_KEYS.PLAYER_ROLE, sessionData.playerRole);
    }
    if (sessionData.wordLength) {
      sessionStorage.setItem(SESSION_KEYS.WORD_LENGTH, String(sessionData.wordLength));
    }

    setSession(sessionData);
  }, []);

  const updateSession = useCallback((updates) => {
    setSession((prev) => {
      const updated = { ...prev, ...updates };
      if (updates.userId) {
        sessionStorage.setItem(SESSION_KEYS.USER_ID, updates.userId);
      }
      if (updates.roomId) {
        sessionStorage.setItem(SESSION_KEYS.ROOM_ID, updates.roomId);
      }
      if (updates.playerRole) {
        sessionStorage.setItem(SESSION_KEYS.PLAYER_ROLE, updates.playerRole);
      }
      return updated;
    });
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEYS.USER_ID);
    sessionStorage.removeItem(SESSION_KEYS.SESSION_ID);
    sessionStorage.removeItem(SESSION_KEYS.ROOM_ID);
    sessionStorage.removeItem(SESSION_KEYS.PLAYER_ROLE);
    sessionStorage.removeItem(SESSION_KEYS.WORD_LENGTH);
    setSession(null);
  }, []);

  const hasValidSession = useCallback(() => {
    return (
      session &&
      session.userId &&
      session.sessionId &&
      session.roomId
    );
  }, [session]);

  return {
    session,
    saveSession,
    updateSession,
    clearSession,
    hasValidSession,
  };
};
