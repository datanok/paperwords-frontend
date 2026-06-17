import React, { useState } from 'react';
import { Tally } from './PaperUI';
import { WORD_LENGTH } from '../../constants/gameConstants';
import './GameComponents.css';

export const WordLengthSelector = ({ onSelect, disabled = false }) => {
  const [selected, setSelected] = useState(WORD_LENGTH.MIN);

  const change = (delta) => {
    setSelected((prev) => Math.min(WORD_LENGTH.MAX, Math.max(WORD_LENGTH.MIN, prev + delta)));
  };

  return (
    <div className="word-length-selector">
      <div className="paper-card">
        <div className="wls-inner">
          <h2 className="wls-title">How many letters?</h2>
          <p className="wls-desc">Choose the length of your secret word</p>

          <div className="stepper-controls">
            <button
              className="stepper-btn"
              onClick={() => change(-1)}
              disabled={disabled || selected <= WORD_LENGTH.MIN}
            >
              −
            </button>
            <span className="stepper-value">{selected}</span>
            <button
              className="stepper-btn"
              onClick={() => change(1)}
              disabled={disabled || selected >= WORD_LENGTH.MAX}
            >
              +
            </button>
          </div>

          <Tally n={selected} />

          <button
            className="btn btn-primary btn-lg"
            onClick={() => onSelect(selected)}
            disabled={disabled}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
