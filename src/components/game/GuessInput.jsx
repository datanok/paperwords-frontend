import React, { useState } from 'react';
import { LetterRow } from './PaperUI';
import { isValidWord } from '../../utils/wordUtils';
import './GameComponents.css';

export const GuessInput = ({ onGuess, disabled = false, wordLength }) => {
  const [word, setWord] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = word.trim().toUpperCase();
    if (!trimmed)                      { setError('Enter a word'); return; }
    if (trimmed.length !== wordLength) { setError(`Word must be exactly ${wordLength} letters`); return; }
    if (!/^[a-zA-Z]+$/.test(trimmed)) { setError('Only letters allowed'); return; }

    setChecking(true);
    const valid = await isValidWord(trimmed, wordLength);
    setChecking(false);
    if (!valid) { setError('Not a valid word — try another.'); return; }

    onGuess(trimmed);
    setWord('');
  };

  return (
    <div className="guess-input-section">
      <label className="guess-label">Your guess ({wordLength} letters)</label>

      <LetterRow
        value={word}
        length={wordLength}
        onChange={(v) => { setWord(v); setError(null); }}
        onSubmit={handleSubmit}
        disabled={disabled || checking}
        autoFocus
      />

      {error && <p className="paper-error">{error}</p>}

      <button
        className="btn btn-primary btn-md"
        onClick={handleSubmit}
        disabled={disabled || checking || word.length !== wordLength}
      >
        {checking ? 'Checking...' : 'Guess'}
      </button>
    </div>
  );
};
