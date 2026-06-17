import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Squiggle } from '../components/game/PaperUI';
import { useSocketContext } from '../context/SocketContext';
import { useSession } from '../hooks/useSession';
import { SOCKET_EVENTS } from '../constants/gameConstants';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { emit, on, connected, userId, sessionId } = useSocketContext();
  const { saveSession } = useSession();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = () => {
    if (!connected) { setError('Not connected to server'); return; }
    if (!userId || !sessionId) { setError('Connection not established'); return; }
    setError(null);
    setLoading(true);
    emit('room:create', {}, (response) => {
      if (response && response.success) {
        saveSession({ userId, sessionId, roomId: response.roomId, playerRole: 'host' });
        navigate(`/room/${response.roomId}`);
      } else {
        setError(response?.error || 'Failed to create room');
        setLoading(false);
      }
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim())        { setError('Please enter a room ID'); return; }
    if (roomId.length !== 6)   { setError('Room ID must be 6 characters'); return; }
    if (!connected)            { setError('Not connected to server'); return; }
    setError(null);
    setLoading(true);
    emit('room:join', { roomId: roomId.toUpperCase() }, (response) => {
      if (response && response.success) {
        saveSession({ userId, sessionId, roomId: response.roomId, playerRole: 'guest', wordLength: response.wordLength });
        navigate(`/room/${response.roomId}`);
      } else {
        setError(response?.error || 'Failed to join room');
        setLoading(false);
      }
    });
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">PAPERWORDS</h1>
        <div className="home-squiggle">
          <Squiggle width={220} />
        </div>
        <p className="home-subtitle">Guess the Word · Real-Time Multiplayer</p>
      </header>

      <main className="home-main">
        {!connected && (
          <div className="connection-warning">
            <p style={{ margin: 0 }}>Connecting to server...</p>
          </div>
        )}

        <div className="home-grid">
          <div className="paper-card home-card home-card-tilt-left">
            <h2>Create Room</h2>
            <p>Start a new game and invite a friend</p>
            <Button
              onClick={handleCreateRoom}
              disabled={!connected || loading}
              fullWidth
              size="lg"
              variant="primary"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </div>

          <div className="paper-card home-card home-card-tilt-right">
            <h2>Join Room</h2>
            <p>Enter a friend's room ID to play</p>
            <form onSubmit={handleJoinRoom} className="join-form">
              <Input
                type="text"
                placeholder="Room ID (6 chars)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength="6"
                disabled={!connected || loading}
              />
              <Button
                type="submit"
                disabled={!connected || loading}
                fullWidth
                size="lg"
                variant="secondary"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </Button>
            </form>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}
      </main>

      <footer className="home-footer">
        Create a room · share the ID · guess each other's words!
      </footer>
    </div>
  );
};

export default Home;
