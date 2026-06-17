import React from 'react';
import './GameComponents.css';

export const WordDisplay = ({ word, label = 'Opponent\'s Word' }) => {
  return (
    <div className="word-display">
      <p className="display-label">{label}</p>
      <div className="display-word">
        {word.split('').map((letter, i) => (
          <span
            key={i}
            className={`letter-hint ${letter !== '_' ? 'animate-letter-fill' : ''}`}
            style={{
              display: 'inline-block',
              animation: letter !== '_' ? 'letterFill 0.3s ease-in-out' : 'none',
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};
