import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocketContext } from '../context/SocketContext';
import { useSession } from '../hooks/useSession';
import { useGameContext } from '../context/GameContext';
import { GameScreen } from '../components/game/GameScreen';
import { Button } from '../components/common/Button';
import { Squiggle } from '../components/game/PaperUI';
import { SOCKET_EVENTS } from '../constants/gameConstants';
import './Room.css';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button className={`copy-btn${copied ? ' copy-btn--copied' : ''}`} onClick={handleCopy} aria-label="Copy room code">
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 5v9a1.5 1.5 0 001.5 1.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
};

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { connected, emit, on, userId } = useSocketContext();
  const { session, clearSession } = useSession();
  const { resetGame } = useGameContext();
  const [roomState, setRoomState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWordLength, setGameWordLength] = useState(session?.wordLength || null);

  useEffect(() => {
    if (!connected || !userId) { navigate('/'); return; }
    setLoading(false);
    setError(null);
    if (session?.wordLength) setGameStarted(true);

    const unsubs = [];
    unsubs.push(on(SOCKET_EVENTS.ROOM_PLAYER_JOINED, (data) => {
      setRoomState((prev) => ({ ...prev, guestId: data.playerId, state: data.state }));
    }));
    unsubs.push(on(SOCKET_EVENTS.GAME_WORD_LENGTH_SET, (data) => {
      setGameWordLength(data.wordLength);
      setGameStarted(true);
    }));
    return () => unsubs.forEach((u) => u());
  }, [connected, session, userId, navigate, roomId, on]);

  const handleStartGame = () => {
    setGameStarted(true);
    emit('game:initiate', {});
  };

  const handleLeaveRoom = () => {
    resetGame();
    emit(SOCKET_EVENTS.ROOM_LEAVE, {}, () => {
      clearSession();
      navigate('/');
    });
  };

  if (!connected) {
    return (
      <div className="room-page">
        <header className="room-header">
          <h1 className="room-title">PAPERWORDS</h1>
          <div className="room-squiggle"><Squiggle width={220} /></div>
        </header>
        <div className="paper-card room-card">
          <p className="room-waiting">Connecting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="room-page">
        <header className="room-header">
          <h1 className="room-title">PAPERWORDS</h1>
          <div className="room-squiggle"><Squiggle width={220} /></div>
        </header>
        <div className="paper-card room-card">
          <p className="room-waiting">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-page">
        <header className="room-header">
          <h1 className="room-title">PAPERWORDS</h1>
          <div className="room-squiggle"><Squiggle width={220} /></div>
        </header>
        <div className="paper-card room-card">
          <p style={{ color: 'var(--color-red)', margin: 0 }}>{error}</p>
          <Button onClick={() => navigate('/')} variant="primary">Back to Home</Button>
        </div>
      </div>
    );
  }

  if (gameStarted) {
    return (
      <GameScreen
        roomId={roomId}
        playerRole={session?.playerRole}
        initialWordLength={gameWordLength}
      />
    );
  }

  return (
    <div className="room-page">
      <header className="room-header">
        <h1 className="room-title">PAPERWORDS</h1>
        <div className="room-squiggle"><Squiggle width={220} /></div>
      </header>

      <div className="paper-card room-card">
        <span className="room-role-badge">you are the {session?.playerRole}</span>

        <p className="room-id-label">Room ID</p>
        <div className="room-id-row">
          <p className="room-id-value">{roomId}</p>
          <CopyButton text={roomId} />
        </div>
        <p className="room-id-hint">Share this code with your opponent</p>

        {roomState?.guestId ? (
          <>
            <p className="room-joined">Opponent joined!</p>
            {session?.playerRole === 'host' && (
              <Button onClick={handleStartGame} variant="primary" size="lg" fullWidth>
                Start Game
              </Button>
            )}
          </>
        ) : (
          <p className="room-waiting">Waiting for opponent...</p>
        )}
      </div>

      <div className="room-footer">
        <Button onClick={handleLeaveRoom} variant="secondary">Leave Room</Button>
      </div>
    </div>
  );
};

export default Room;
