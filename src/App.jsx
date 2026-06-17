import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Room from './pages/Room';
import NotFound from './pages/NotFound';

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id="sketchy">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="noise" seed="3" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </GameProvider>
    </SocketProvider>
  );
}

export default App;
