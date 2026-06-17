import React from 'react';
import { ResultCircle } from './PaperUI';
import './GameComponents.css';

export const GuessHistory = ({ guesses = [] }) => {
  if (guesses.length === 0) {
    return (
      <div className="guess-history">
        <p className="history-empty">No guesses yet</p>
      </div>
    );
  }

  return (
    <div className="guess-history">
      <p className="history-title">Your guesses ({guesses.length})</p>
      <div className="history-rows">
        {guesses.map((guess, i) => {
          // feedback may be a count directly, or an array of {result} objects
          const matchCount = typeof guess.feedback === 'number'
            ? guess.feedback
            : Array.isArray(guess.feedback)
              ? guess.feedback.filter((f) => f.result !== 'absent').length
              : 0;

          return (
            <div key={i} className="history-row">
              <div className="history-tiles">
                {guess.word.split('').map((ch, j) => (
                  <div key={j} className="letter-box">
                    <div className="letter-box-bg" />
                    <span className="letter-box-char">{ch}</span>
                  </div>
                ))}
              </div>
              <ResultCircle count={matchCount} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
