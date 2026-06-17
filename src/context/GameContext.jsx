import React, { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [wordDisplay, setWordDisplay] = useState('');
  const [isYourTurn, setIsYourTurn] = useState(false);

  const initializeGame = useCallback((state) => {
    setGameState(state);
    setGuesses([]);
    setIsYourTurn(state.currentTurn === state.playerRole);
  }, []);

  const submitWord = useCallback((word) => {
    setGameState((prev) => ({
      ...prev,
      secretWord: word,
    }));
  }, []);

  const addGuess = useCallback((guessData) => {
    setGuesses((prev) => [...prev, guessData]);
  }, []);

  const updateWordDisplay = useCallback((display) => {
    setWordDisplay(display);
  }, []);

  const setTurn = useCallback((isYour) => {
    setIsYourTurn(isYour);
  }, []);

  const endGame = useCallback((winner) => {
    setGameState((prev) => ({
      ...prev,
      winner,
      state: 'finished',
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
    setGuesses([]);
    setWordDisplay('');
    setIsYourTurn(false);
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        guesses,
        wordDisplay,
        isYourTurn,
        initializeGame,
        submitWord,
        addGuess,
        updateWordDisplay,
        setTurn,
        endGame,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};
