import React, { useState } from 'react';
import { Tally } from './PaperUI';
import { WORD_LENGTH } from '../../constants/gameConstants';
import './GameComponents.css';

const ROUND_OPTIONS = [1, 2, 3, 5];

export const WordLengthSelector = ({ onSelect, disabled = false }) => {
  const [wordLength, setWordLength] = useState(WORD_LENGTH.MIN);
  const [rounds, setRounds] = useState(1);

  const changeLength = (delta) => {
    setWordLength((prev) => Math.min(WORD_LENGTH.MAX, Math.max(WORD_LENGTH.MIN, prev + delta)));
  };

  return (
    <div className="word-length-selector">
      <div className="paper-card">
        <div className="wls-inner">
          <h2 className="wls-title">How many letters?</h2>
          <p className="wls-desc">Choose the length of your secret word</p>

          <div className="stepper-controls">
            <button className="stepper-btn" onClick={() => changeLength(-1)} disabled={disabled || wordLength <= WORD_LENGTH.MIN}>−</button>
            <span className="stepper-value">{wordLength}</span>
            <button className="stepper-btn" onClick={() => changeLength(1)} disabled={disabled || wordLength >= WORD_LENGTH.MAX}>+</button>
          </div>

          <Tally n={wordLength} />

          <div className="rounds-selector">
            <p className="rounds-label">Number of rounds</p>
            <div className="rounds-options">
              {ROUND_OPTIONS.map((n) => (
                <button
                  key={n}
                  className={`rounds-btn${rounds === n ? ' rounds-btn--active' : ''}`}
                  onClick={() => setRounds(n)}
                  disabled={disabled}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={() => onSelect(wordLength, rounds)}
            disabled={disabled}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
