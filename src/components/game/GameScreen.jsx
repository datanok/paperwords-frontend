import React, { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { SOCKET_EVENTS } from '../../constants/gameConstants';
import { WordLengthSelector } from './WordLengthSelector';
import { WordSubmission } from './WordSubmission';
import { GuessInput } from './GuessInput';
import { GuessHistory } from './GuessHistory';
import { Button } from '../common/Button';
import { Squiggle, LetterBox } from './PaperUI';
import { StickerTray, StickerReceived } from './StickerTray';
import './GameComponents.css';

export const GameScreen = ({ roomId, playerRole, initialWordLength = null }) => {
  const { emit, on } = useSocketContext();

  const [phase, setPhase]                         = useState(() => {
    if (playerRole === 'host') return 'length-selection';
    if (initialWordLength)     return 'word-submission';
    return 'waiting';
  });
  const [wordLength, setWordLength]               = useState(initialWordLength);
  const [isYourTurn, setIsYourTurn]               = useState(false);
  const [myGuesses, setMyGuesses]                 = useState([]);
  const [opponentGuessCount, setOpponentGuessCount] = useState(0);
  const [winner, setWinner]                       = useState(null);
  const [revealedWord, setRevealedWord]           = useState(null);
  const [wordSubmitted, setWordSubmitted]         = useState(false);
  const [receivedSticker, setReceivedSticker]     = useState(null);

  useEffect(() => {
    const unsubs = [];

    unsubs.push(on(SOCKET_EVENTS.GAME_WORD_LENGTH_SET, (data) => {
      setWordLength(data.wordLength);
      setPhase('word-submission');
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_STARTED, (data) => {
      setPhase('playing');
      setIsYourTurn(data.currentTurn === playerRole);
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_FEEDBACK, (data) => {
      if (data.playerRole === playerRole) {
        setMyGuesses((prev) => [...prev, { word: data.word, feedback: data.feedback }]);
      } else {
        setOpponentGuessCount((prev) => prev + 1);
      }
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_TURN_CHANGED, (data) => {
      setIsYourTurn(data.currentTurn === playerRole);
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_WON, (data) => {
      setPhase('finished');
      setWinner(data.winner);
      setRevealedWord(data.secretWord);
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_STICKER_RECEIVED, (data) => {
      setReceivedSticker(data.sticker);
      // auto-dismiss after 3 seconds
      setTimeout(() => setReceivedSticker(null), 3000);
    }));

    return () => unsubs.forEach((u) => u());
  }, [on, playerRole]);

  const handleWordLengthSelect = (length) => {
    setWordLength(length);
    emit(SOCKET_EVENTS.ROOM_SET_WORD_LENGTH, { wordLength: length });
  };

  const handleWordSubmit = (word) =>
    new Promise((resolve, reject) => {
      emit(SOCKET_EVENTS.GAME_SUBMIT_WORD, { word }, (response) => {
        if (response.success) { setWordSubmitted(true); resolve(); }
        else reject(new Error(response.error));
      });
    });

  const handleGuessWord = (word) => {
    emit(SOCKET_EVENTS.GAME_GUESS_WORD, { word }, (response) => {
      if (!response.success) console.error('Guess failed:', response.error);
    });
  };

  const handleSendSticker = useCallback((sticker) => {
    emit(SOCKET_EVENTS.GAME_SEND_STICKER, { sticker });
  }, [emit]);

  const renderContent = () => {
    if (phase === 'waiting') {
      return <p className="game-waiting">Waiting for host to choose word length...</p>;
    }

    if (phase === 'length-selection') {
      return <WordLengthSelector onSelect={handleWordLengthSelect} />;
    }

    if (phase === 'word-submission' && wordLength) {
      return (
        <WordSubmission
          wordLength={wordLength}
          onSubmit={handleWordSubmit}
          submitted={wordSubmitted}
        />
      );
    }

    if (phase === 'playing' && wordLength) {
      return (
        <div className="paper-card game-board">
          <div className="board-header">
            <h2 className="board-title">Guess the word</h2>
            <div className={`turn-indicator${isYourTurn ? '' : ' opponent'}`}>
              {isYourTurn ? 'Your turn' : "Their turn"}
            </div>
          </div>

          <p className="opponent-status">
            Opponent has guessed {opponentGuessCount} time{opponentGuessCount !== 1 ? 's' : ''}
          </p>

          {isYourTurn && (
            <GuessInput onGuess={handleGuessWord} wordLength={wordLength} />
          )}

          <GuessHistory guesses={myGuesses} wordLength={wordLength} />

          <StickerTray onSend={handleSendSticker} />
        </div>
      );
    }

    if (phase === 'finished') {
      const won = winner === playerRole;
      return (
        <div className={`paper-card ${won ? 'win-screen' : 'loss-screen'}`}>
          <h2 className="end-title">{won ? 'You got it!' : 'You lost'}</h2>
          <p className="end-message">
            {won
              ? `Solved in ${myGuesses.length} guess${myGuesses.length === 1 ? '' : 'es'}!`
              : `Opponent guessed first after ${opponentGuessCount} try${opponentGuessCount !== 1 ? 's' : ''}.`}
          </p>
          {revealedWord && (
            <>
              <hr className="end-divider" />
              <p className="end-message" style={{ fontSize: '0.875rem' }}>The word was:</p>
              <div className="end-word">
                {revealedWord.split('').map((ch, i) => (
                  <LetterBox key={i} char={ch} />
                ))}
              </div>
            </>
          )}
          <Button onClick={() => { window.location.href = '/'; }} variant="primary" size="lg" fullWidth>
            Play again
          </Button>
        </div>
      );
    }

    return <p className="game-waiting">Loading...</p>;
  };

  return (
    <div className="game-screen">
      {/* Sticker received overlay — always mounted, conditionally visible */}
      <StickerReceived sticker={receivedSticker} />

      <header className="game-page-header">
        <h1 className="game-title">PAPERWORDS</h1>
        <div className="game-squiggle">
          <Squiggle width={220} />
        </div>
      </header>

      {renderContent()}
    </div>
  );
};
