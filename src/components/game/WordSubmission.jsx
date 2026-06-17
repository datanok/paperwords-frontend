import React, { useState } from 'react';
import { LetterRow } from './PaperUI';
import { isValidWord } from '../../utils/wordUtils';
import './GameComponents.css';

export const WordSubmission = ({ wordLength, onSubmit, disabled = false, submitted = false }) => {
  const [word, setWord] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!word.trim())               { setError('Please enter a word'); return; }
    if (word.length !== wordLength) { setError(`Word must be ${wordLength} letters`); return; }
    if (!/^[a-zA-Z]+$/.test(word)) { setError('Only letters allowed'); return; }

    setChecking(true);
    const valid = await isValidWord(word, wordLength);
    setChecking(false);
    if (!valid) { setError('Word not found in dictionary — try another.'); return; }

    setLoading(true);
    try {
      await onSubmit(word.toUpperCase());
    } catch (err) {
      setError(err.message || 'Failed to submit word');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="word-submission">
        <div className="paper-card">
          <div className="ws-inner">
            <div className="submitted-state">
              <p className="submitted-check">Word locked in ✓</p>
              <p className="submitted-waiting">Waiting for opponent to submit their word...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="word-submission">
      <div className="paper-card">
        <div className="ws-inner">
          <h2 className="ws-title">Enter your secret word</h2>
          <p className="ws-desc">
            Your opponent will try to guess this {wordLength}-letter word.
          </p>

          <LetterRow
            value={word}
            length={wordLength}
            onChange={(v) => { setWord(v); setError(null); }}
            onSubmit={handleSubmit}
            disabled={disabled || loading}
            autoFocus
          />

          {error && <p className="paper-error">{error}</p>}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={disabled || loading || checking || word.length !== wordLength}
          >
            {checking ? 'Checking...' : loading ? 'Submitting...' : 'Ready with this word'}
          </button>
        </div>
      </div>
    </div>
  );
};
