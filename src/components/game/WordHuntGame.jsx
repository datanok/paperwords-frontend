import React, { useState } from 'react';

const COLORS = {
  paper: '#F6F1E4',
  grid: '#E7DECB',
  card: '#FFFCF5',
  ink: '#2E2C39',
  inkSoft: '#7A7464',
  red: '#D6544A',
  green: '#5E9C6E',
  blue: '#5C84B8',
  yellow: '#E8B339',
  muted: '#C9C0AE',
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&family=Space+Mono:wght@400;700&display=swap');
`;

function computeMatchCount(guess, secret) {
  const sCounts = {};
  for (const ch of secret) sCounts[ch] = (sCounts[ch] || 0) + 1;
  const gCounts = {};
  for (const ch of guess) gCounts[ch] = (gCounts[ch] || 0) + 1;
  let total = 0;
  for (const ch in gCounts) total += Math.min(gCounts[ch], sCounts[ch] || 0);
  return total;
}

function Squiggle({ width = 180, color = COLORS.red }) {
  return (
    <svg width={width} height="18" viewBox={`0 0 ${width} 18`} style={{ display: 'block' }}>
      <path
        d={`M4 9 Q ${width * 0.2} 1, ${width * 0.4} 9 T ${width * 0.8} 9 T ${width - 4} 9`}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarDoodle({ left, top, size = 22, color, rotate = 0 }) {
  return (
    <svg
      style={{ position: 'absolute', left, top, transform: `rotate(${rotate}deg)`, opacity: 0.9 }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <path d="M12 1 L15 9 L23 12 L15 15 L12 23 L9 15 L1 12 L9 9 Z" fill={color} />
    </svg>
  );
}

function LetterBox({ char, masked, size = 46 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size + 4 }}>
      <div
        className="absolute inset-0 rounded-md"
        style={{ border: `2.5px solid ${COLORS.ink}`, background: COLORS.card, filter: 'url(#sketchy)' }}
      />
      <span
        className="relative"
        style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 22, color: COLORS.ink }}
      >
        {masked ? (char ? '•' : '') : char}
      </span>
    </div>
  );
}

function LetterRow({ value, length, masked, onChange, onSubmit, autoFocus }) {
  return (
    <div className="relative inline-block">
      <div className="flex gap-2">
        {Array.from({ length }).map((_, i) => (
          <LetterBox key={i} char={value[i] || ''} masked={masked} />
        ))}
      </div>
      <input
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, length);
          onChange(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit && onSubmit();
        }}
        autoFocus={autoFocus}
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
        inputMode="text"
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        style={{ fontSize: 16 }}
      />
    </div>
  );
}

function ResultCircle({ count }) {
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 50, height: 50 }}>
      <svg viewBox="0 0 50 50" className="absolute inset-0" style={{ filter: 'url(#sketchy)' }}>
        <ellipse
          cx="25"
          cy="25"
          rx="21"
          ry="19"
          fill="none"
          stroke={COLORS.red}
          strokeWidth="3"
          strokeDasharray="160"
          className="draw-circle"
        />
      </svg>
      <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 19, color: COLORS.ink }}>
        {count}
      </span>
    </div>
  );
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function AlphabetTracker({ status, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1 justify-center" style={{ maxWidth: 380 }}>
      {ALPHABET.map((letter) => {
        const st = status[letter];
        return (
          <button
            key={letter}
            onClick={() => onToggle(letter)}
            className="relative flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              fontFamily: 'Patrick Hand, cursive',
              fontSize: 16,
              color: st === 'no' ? COLORS.muted : COLORS.ink,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {letter}
            {st === 'yes' && (
              <svg className="absolute inset-0" viewBox="0 0 28 28">
                <ellipse cx="14" cy="14" rx="12" ry="11" fill="none" stroke={COLORS.green} strokeWidth="2" />
              </svg>
            )}
            {st === 'no' && (
              <svg className="absolute inset-0" viewBox="0 0 28 28">
                <line x1="4" y1="24" x2="24" y2="4" stroke={COLORS.red} strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Tally({ n }) {
  const groups = [];
  let remaining = n;
  while (remaining > 0) {
    const c = Math.min(remaining, 5);
    groups.push(c);
    remaining -= c;
  }
  return (
    <div className="flex gap-2 items-center" style={{ height: 24 }}>
      {groups.map((count, gi) => {
        const w = count === 5 ? 32 : Math.max(count, 1) * 7 + 2;
        return (
          <svg key={gi} width={w} height="24" viewBox={`0 0 ${w} 24`}>
            {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
              <line
                key={i}
                x1={3 + i * 7}
                y1="2"
                x2={3 + i * 7}
                y2="22"
                stroke={COLORS.ink}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
            {count === 5 && (
              <line x1="2" y1="22" x2="30" y2="2" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" />
            )}
          </svg>
        );
      })}
    </div>
  );
}

function SketchyButton({ children, onClick, disabled, color = COLORS.ink, big }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative"
      style={{
        fontFamily: 'Kalam, cursive',
        fontWeight: 700,
        fontSize: big ? 22 : 18,
        color: disabled ? COLORS.muted : color,
        background: 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        padding: big ? '10px 28px' : '8px 22px',
      }}
    >
      <span
        className="absolute inset-0 rounded-lg"
        style={{
          border: `2.5px solid ${disabled ? COLORS.muted : color}`,
          filter: 'url(#sketchy)',
        }}
      />
      <span className="relative">{children}</span>
    </button>
  );
}

function Card({ children, rotate = 0, maxWidth = 384, className = '' }) {
  return (
    <div className={`relative w-full ${className}`} style={{ maxWidth }}>
      <div
        className="relative p-6 flex flex-col items-center gap-5"
        style={{ background: COLORS.card, borderRadius: 10, transform: `rotate(${rotate}deg)` }}
      >
        <div
          className="absolute inset-0 rounded-lg"
          style={{ border: `2.5px solid ${COLORS.ink}`, filter: 'url(#sketchy)' }}
        />
        {children}
      </div>
    </div>
  );
}

export default function WordHuntGame() {
  const [phase, setPhase] = useState('setup');
  const [wordLength, setWordLength] = useState(4);
  const [secretStr, setSecretStr] = useState('');
  const [secretWord, setSecretWord] = useState('');
  const [guessStr, setGuessStr] = useState('');
  const [history, setHistory] = useState([]);
  const [letterStatus, setLetterStatus] = useState({});
  const [error, setError] = useState('');

  const changeLength = (delta) => {
    const next = Math.min(8, Math.max(3, wordLength + delta));
    setWordLength(next);
    setSecretStr('');
  };

  const lockSecret = () => {
    if (secretStr.length !== wordLength) {
      setError(`Fill in all ${wordLength} letters first.`);
      return;
    }
    setSecretWord(secretStr);
    setError('');
    setPhase('pass');
  };

  const submitGuess = () => {
    if (guessStr.length !== wordLength) {
      setError(`Fill in all ${wordLength} letters first.`);
      return;
    }
    if (history.some((h) => h.word === guessStr)) {
      setError("Already tried that one — try something new.");
      return;
    }
    setError('');
    const count = computeMatchCount(guessStr, secretWord);
    setHistory((prev) => [...prev, { word: guessStr, count }]);
    if (guessStr === secretWord) {
      setPhase('won');
    }
    setGuessStr('');
  };

  const toggleLetter = (letter) => {
    setLetterStatus((prev) => {
      const cur = prev[letter];
      const next = cur === undefined ? 'yes' : cur === 'yes' ? 'no' : undefined;
      const copy = { ...prev };
      if (next === undefined) delete copy[letter];
      else copy[letter] = next;
      return copy;
    });
  };

  const reset = () => {
    setPhase('setup');
    setSecretStr('');
    setSecretWord('');
    setGuessStr('');
    setHistory([]);
    setLetterStatus({});
    setError('');
  };

  const giveUp = () => setPhase('revealed');

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{
        background: COLORS.paper,
        backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`,
        backgroundSize: '26px 26px',
        padding: '32px 16px 60px',
        fontFamily: 'Patrick Hand, cursive',
        color: COLORS.ink,
      }}
    >
      <style>{`
        ${FONTS}
        .draw-circle {
          stroke-dashoffset: 160;
          animation: draw 0.6s ease-out forwards;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .draw-circle { animation: none; stroke-dashoffset: 0; }
        }
        input { caret-color: ${COLORS.ink}; }
      `}</style>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="noise" seed="3" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Header — present on every screen */}
      <div className="relative text-center mb-6">
        <h1 style={{ fontFamily: 'Kalam, cursive', fontWeight: 700, fontSize: 44, margin: 0 }}>WORD HUNT</h1>
        <div className="flex justify-center -mt-1">
          <Squiggle width={170} />
        </div>
      </div>

      {/* ── SETUP ── */}
      {phase === 'setup' && (
        <Card rotate={-0.4}>
          <p className="relative text-center" style={{ fontSize: 18 }}>
            Player 1 picks a secret word. Player 2 will try to guess it — after each guess, you'll only learn{' '}
            <i>how many letters</i> from the guess are somewhere in the word.
          </p>

          <div className="relative w-full flex flex-col items-center gap-2">
            <span style={{ fontSize: 18 }}>How many letters?</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeLength(-1)}
                className="relative flex items-center justify-center"
                style={{ width: 34, height: 34, background: 'transparent', cursor: 'pointer' }}
              >
                <span className="absolute inset-0 rounded-md" style={{ border: `2.5px solid ${COLORS.ink}`, filter: 'url(#sketchy)' }} />
                <span style={{ fontFamily: 'Kalam, cursive', fontWeight: 700, fontSize: 20 }}>−</span>
              </button>
              <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 30 }}>{wordLength}</span>
              <button
                onClick={() => changeLength(1)}
                className="relative flex items-center justify-center"
                style={{ width: 34, height: 34, background: 'transparent', cursor: 'pointer' }}
              >
                <span className="absolute inset-0 rounded-md" style={{ border: `2.5px solid ${COLORS.ink}`, filter: 'url(#sketchy)' }} />
                <span style={{ fontFamily: 'Kalam, cursive', fontWeight: 700, fontSize: 20 }}>+</span>
              </button>
            </div>
            <Tally n={wordLength} />
          </div>

          <div className="relative w-full flex flex-col items-center gap-2">
            <span style={{ fontSize: 18 }}>Player 1: type the secret word</span>
            <LetterRow value={secretStr} length={wordLength} masked onChange={setSecretStr} onSubmit={lockSecret} autoFocus />
            <span style={{ fontSize: 14, color: COLORS.inkSoft }}>(hidden — only dots show)</span>
          </div>

          {error && <span className="relative" style={{ color: COLORS.red, fontSize: 16 }}>{error}</span>}

          <div className="relative">
            <SketchyButton onClick={lockSecret} big>Lock it in</SketchyButton>
          </div>
        </Card>
      )}

      {/* ── PASS ── */}
      {phase === 'pass' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <Card rotate={0.3}>
            <svg width="70" height="70" viewBox="0 0 70 70" className="relative">
              <ellipse cx="35" cy="35" rx="30" ry="22" fill="none" stroke={COLORS.ink} strokeWidth="3" />
              <path d="M8 28 Q35 50 62 28" fill="none" stroke={COLORS.ink} strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="relative text-center" style={{ fontSize: 20 }}>
              Word's locked in! Pass the device to the guesser.
            </p>
          </Card>
          <SketchyButton onClick={() => setPhase('guessing')} big>
            I'm the guesser — let's go
          </SketchyButton>
        </div>
      )}

      {/* ── GUESSING ── */}
      {phase === 'guessing' && (
        <Card rotate={-0.2} maxWidth={464}>
          {/* guess count badge */}
          <div className="relative px-4 py-1" style={{ transform: 'rotate(1deg)' }}>
            <span className="absolute inset-0 rounded-md" style={{ border: `2px solid ${COLORS.inkSoft}`, filter: 'url(#sketchy)' }} />
            <span className="relative" style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: COLORS.inkSoft }}>
              {wordLength}-letter word · guess #{history.length + 1}
            </span>
          </div>

          {/* input row */}
          <div className="relative flex flex-col items-center gap-3">
            <LetterRow value={guessStr} length={wordLength} onChange={setGuessStr} onSubmit={submitGuess} autoFocus />
            {error && <span style={{ color: COLORS.red, fontSize: 16 }}>{error}</span>}
            <SketchyButton onClick={submitGuess}>Check it</SketchyButton>
          </div>

          {/* guess history */}
          {history.length > 0 && (
            <div className="relative w-full">
              {/* ruled-paper divider */}
              <div style={{ borderTop: `1.5px solid ${COLORS.grid}`, marginBottom: 8 }} />
              <div className="flex flex-col gap-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {history
                  .slice()
                  .reverse()
                  .map((h, i) => (
                    <div key={history.length - i} className="flex items-center justify-between gap-3 px-2">
                      <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 24, letterSpacing: 4 }}>
                        {h.word.split('').join(' ')}
                      </span>
                      <ResultCircle count={h.count} />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* alphabet tracker */}
          <div className="relative w-full flex flex-col items-center gap-2">
            <span style={{ fontSize: 15, color: COLORS.inkSoft }}>tap a letter to mark it in or out</span>
            <AlphabetTracker status={letterStatus} onToggle={toggleLetter} />
          </div>

          {/* give up */}
          <button
            onClick={giveUp}
            style={{
              fontFamily: 'Patrick Hand, cursive',
              fontSize: 16,
              color: COLORS.inkSoft,
              background: 'transparent',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            give up — reveal the word
          </button>
        </Card>
      )}

      {/* ── WON / REVEALED ── */}
      {(phase === 'won' || phase === 'revealed') && (
        <div className="relative w-full max-w-sm">
          {phase === 'won' && (
            <>
              <StarDoodle left={-10} top={-10} size={26} color={COLORS.yellow} rotate={-15} />
              <StarDoodle left={250} top={0} size={20} color={COLORS.green} rotate={20} />
              <StarDoodle left={20} top={120} size={18} color={COLORS.blue} rotate={-10} />
              <StarDoodle left={260} top={130} size={24} color={COLORS.red} rotate={15} />
            </>
          )}
          <Card rotate={phase === 'won' ? -0.5 : 0.4}>
            <h2
              className="relative"
              style={{ fontFamily: 'Kalam, cursive', fontWeight: 700, fontSize: 36, margin: 0 }}
            >
              {phase === 'won' ? 'GOT IT!' : 'So close...'}
            </h2>

            <p className="relative" style={{ fontSize: 18, margin: 0 }}>
              {phase === 'won'
                ? `Solved in ${history.length} guess${history.length === 1 ? '' : 'es'}!`
                : 'The word was:'}
            </p>

            <div className="relative flex gap-2">
              {secretWord.split('').map((ch, i) => (
                <LetterBox key={i} char={ch} masked={false} />
              ))}
            </div>

            {phase === 'won' && history.length > 0 && (
              <div className="relative w-full" style={{ borderTop: `1.5px solid ${COLORS.grid}`, paddingTop: 10 }}>
                <div className="flex flex-col gap-1" style={{ maxHeight: 160, overflowY: 'auto' }}>
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-2">
                      <span style={{ fontFamily: 'Patrick Hand, cursive', fontSize: 20, letterSpacing: 3, color: COLORS.inkSoft }}>
                        {h.word.split('').join(' ')}
                      </span>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: COLORS.inkSoft }}>
                        {h.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <SketchyButton onClick={reset} big>Play again</SketchyButton>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
