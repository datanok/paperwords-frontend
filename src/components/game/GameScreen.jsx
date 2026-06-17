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

function OpponentTyping({ word, wordLength }) {
  if (!word) return null;
  const letters = word.toUpperCase().split('');
  return (
    <div className="opponent-typing-row">
      <span className="opponent-typing-label">opponent guessing</span>
      <div className="opponent-typing-boxes">
        {Array.from({ length: wordLength }).map((_, i) => (
          <LetterBox key={i} char={letters[i] || ''} state="typing" />
        ))}
      </div>
    </div>
  );
}

function ScorePips({ wins, total }) {
  return (
    <div className="score-pips">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`score-pip${i < wins ? ' score-pip--filled' : ''}`} />
      ))}
    </div>
  );
}

export const GameScreen = ({ roomId, playerRole, initialWordLength = null }) => {
  const { emit, on } = useSocketContext();

  const [phase, setPhase] = useState(() => {
    if (playerRole === 'host') return 'length-selection';
    if (initialWordLength) return 'word-submission';
    return 'waiting';
  });

  const [wordLength, setWordLength]               = useState(initialWordLength);
  const [totalRounds, setTotalRounds]             = useState(1);
  const [currentRound, setCurrentRound]           = useState(1);
  const [scores, setScores]                       = useState({ host: 0, guest: 0 });
  const [isYourTurn, setIsYourTurn]               = useState(false);
  const [myGuesses, setMyGuesses]                 = useState([]);
  const [opponentGuessCount, setOpponentGuessCount] = useState(0);
  const [wordSubmitted, setWordSubmitted]         = useState(false);
  const [receivedSticker, setReceivedSticker]     = useState(null);
  const [opponentTyping, setOpponentTyping]       = useState('');
  const [roundWinner, setRoundWinner]             = useState(null);
  const [roundEndData, setRoundEndData]           = useState(null);
  const [myReadyNext, setMyReadyNext]             = useState(false);
  const [opponentReadyNext, setOpponentReadyNext] = useState(false);

  const iWon   = roundWinner === playerRole;
  const iLost  = roundWinner && roundWinner !== playerRole;

  useEffect(() => {
    const unsubs = [];

    unsubs.push(on(SOCKET_EVENTS.GAME_WORD_LENGTH_SET, (data) => {
      setWordLength(data.wordLength);
      setTotalRounds(data.rounds || 1);
      setPhase('word-submission');
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_STARTED, (data) => {
      setPhase('playing');
      setIsYourTurn(data.currentTurn === playerRole);
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_FEEDBACK, (data) => {
      if (data.playerRole === playerRole) {
        setMyGuesses((prev) => [...prev, { word: data.word, feedback: data.feedback }]);
        setOpponentTyping('');
      } else {
        setOpponentGuessCount((prev) => prev + 1);
        setOpponentTyping('');
      }
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_TURN_CHANGED, (data) => {
      setIsYourTurn(data.currentTurn === playerRole);
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_OPPONENT_TYPING, (data) => {
      setOpponentTyping(data.word || '');
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_ROUND_WON, (data) => {
      setRoundWinner(data.winner);
      setScores({ host: data.hostWins, guest: data.guestWins });
      if (data.winner === playerRole) setOpponentTyping('');
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_LOSER_SOLVED, () => {
      setOpponentTyping('');
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_ROUND_END, (data) => {
      setRoundEndData(data);
      setScores({ host: data.hostWins, guest: data.guestWins });
      setCurrentRound(data.currentRound);
      setOpponentTyping('');
      setPhase('round-end');
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_OPPONENT_READY_NEXT, () => {
      setOpponentReadyNext(true);
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_ROUND_RESET, (data) => {
      setMyGuesses([]);
      setOpponentGuessCount(0);
      setIsYourTurn(false);
      setWordSubmitted(false);
      setRoundWinner(null);
      setOpponentTyping('');
      setRoundEndData(null);
      setMyReadyNext(false);
      setOpponentReadyNext(false);
      setCurrentRound(data.currentRound);
      setScores({ host: data.hostWins, guest: data.guestWins });
      setPhase('word-submission');
    }));

    unsubs.push(on(SOCKET_EVENTS.GAME_STICKER_RECEIVED, (data) => {
      setReceivedSticker(data.sticker);
      setTimeout(() => setReceivedSticker(null), 3000);
    }));

    return () => unsubs.forEach((u) => u());
  }, [on, playerRole]);

  const handleWordLengthSelect = (length, rounds) => {
    setWordLength(length);
    setTotalRounds(rounds);
    emit(SOCKET_EVENTS.ROOM_SET_WORD_LENGTH, { wordLength: length, rounds });
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

  const handleGiveUp = () => {
    emit(SOCKET_EVENTS.GAME_GIVE_UP, {});
  };

  const handleNextRound = () => {
    setMyReadyNext(true);
    emit(SOCKET_EVENTS.GAME_NEXT_ROUND, {});
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
            <div className="board-round-scores">
              {totalRounds > 1 && (
                <span className="round-counter">Round {currentRound} of {totalRounds}</span>
              )}
              <div className="scores-row">
                <span className="score-label">you</span>
                <ScorePips wins={scores[playerRole]} total={totalRounds} />
                <span className="score-divider">·</span>
                <ScorePips wins={scores[playerRole === 'host' ? 'guest' : 'host']} total={totalRounds} />
                <span className="score-label">them</span>
              </div>
            </div>
          </div>

          {/* Round winner banners */}
          {iWon && (
            <div className="round-banner round-banner--won">
              You got it! Watching opponent...
            </div>
          )}
          {iLost && (
            <div className="round-banner round-banner--lost">
              They got it! Keep trying...
            </div>
          )}

          {/* Opponent typing preview — shown when opponent is active */}
          {(!roundWinner || iWon) && (
            <OpponentTyping word={opponentTyping} wordLength={wordLength} />
          )}

          <p className="opponent-status">
            Opponent guessed {opponentGuessCount} time{opponentGuessCount !== 1 ? 's' : ''}
          </p>

          {/* Guess input: your turn normally, OR loser's free-guess mode */}
          {(isYourTurn && !roundWinner) && (
            <GuessInput onGuess={handleGuessWord} wordLength={wordLength} />
          )}
          {iLost && (
            <div className="loser-guess-section">
              <GuessInput onGuess={handleGuessWord} wordLength={wordLength} />
              <button className="btn btn-secondary btn-sm give-up-btn" onClick={handleGiveUp}>
                Give up
              </button>
            </div>
          )}

          {!isYourTurn && !roundWinner && (
            <div className={`turn-indicator opponent`}>Their turn</div>
          )}

          <GuessHistory guesses={myGuesses} wordLength={wordLength} />
          <StickerTray onSend={handleSendSticker} />
        </div>
      );
    }

    if (phase === 'round-end' && roundEndData) {
      const { roundWinner: rw, hostSecretWord, guestSecretWord, isGameOver, finalWinner } = roundEndData;
      const mySecret = playerRole === 'host' ? hostSecretWord : guestSecretWord;
      const theirSecret = playerRole === 'host' ? guestSecretWord : hostSecretWord;
      const iWonRound = rw === playerRole;

      if (isGameOver) {
        const iWonGame = finalWinner === playerRole;
        const isTie = finalWinner === 'tie';
        return (
          <div className={`paper-card end-card`}>
            <h2 className="end-title">
              {isTie ? 'It\'s a tie!' : iWonGame ? 'You win! 🎉' : 'They win!'}
            </h2>
            <div className="final-scores">
              <div className="final-score-item">
                <span className="final-score-num">{scores[playerRole]}</span>
                <span className="final-score-who">you</span>
              </div>
              <span className="final-score-dash">–</span>
              <div className="final-score-item">
                <span className="final-score-num">{scores[playerRole === 'host' ? 'guest' : 'host']}</span>
                <span className="final-score-who">them</span>
              </div>
            </div>
            <hr className="end-divider" />
            <div className="end-words-reveal">
              <div className="end-word-pair">
                <p className="end-word-label">your word</p>
                <div className="end-word">
                  {mySecret?.split('').map((ch, i) => <LetterBox key={i} char={ch} />)}
                </div>
              </div>
              <div className="end-word-pair">
                <p className="end-word-label">their word</p>
                <div className="end-word">
                  {theirSecret?.split('').map((ch, i) => <LetterBox key={i} char={ch} />)}
                </div>
              </div>
            </div>
            <Button onClick={() => { window.location.href = '/'; }} variant="primary" size="lg" fullWidth>
              Play again
            </Button>
          </div>
        );
      }

      return (
        <div className="paper-card end-card">
          <h2 className="end-title">{iWonRound ? 'Round won! 🎉' : rw ? 'Round lost' : 'Round over'}</h2>
          <div className="round-scores-display">
            <div className="round-score-col">
              <ScorePips wins={scores[playerRole]} total={totalRounds} />
              <span className="round-score-who">you</span>
            </div>
            <span className="round-score-sep">vs</span>
            <div className="round-score-col">
              <ScorePips wins={scores[playerRole === 'host' ? 'guest' : 'host']} total={totalRounds} />
              <span className="round-score-who">them</span>
            </div>
          </div>
          <hr className="end-divider" />
          <div className="end-words-reveal">
            <div className="end-word-pair">
              <p className="end-word-label">your word</p>
              <div className="end-word">
                {mySecret?.split('').map((ch, i) => <LetterBox key={i} char={ch} />)}
              </div>
            </div>
            <div className="end-word-pair">
              <p className="end-word-label">their word</p>
              <div className="end-word">
                {theirSecret?.split('').map((ch, i) => <LetterBox key={i} char={ch} />)}
              </div>
            </div>
          </div>
          <Button
            onClick={handleNextRound}
            variant="primary"
            size="lg"
            fullWidth
            disabled={myReadyNext}
          >
            {myReadyNext ? (opponentReadyNext ? 'Starting...' : 'Waiting for opponent...') : 'Next Round'}
          </Button>
        </div>
      );
    }

    return <p className="game-waiting">Loading...</p>;
  };

  return (
    <div className="game-screen">
      <StickerReceived sticker={receivedSticker} />

      <header className="game-page-header">
        <h1 className="game-title">PAPERWORDS</h1>
        <div className="game-squiggle"><Squiggle width={220} /></div>
      </header>

      {renderContent()}
    </div>
  );
};
