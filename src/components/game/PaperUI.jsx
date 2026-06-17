// Shared paper-aesthetic UI primitives used across game and page components.

const INK  = '#2E2C39';
const RED  = '#D6544A';
const SOFT = '#7A7464';

export function Squiggle({ width = 180, color = RED }) {
  return (
    <svg width={width} height="18" viewBox={`0 0 ${width} 18`} style={{ display: 'block' }}>
      <path
        d={`M4 9 Q ${width * 0.2} 1,${width * 0.4} 9 T ${width * 0.8} 9 T ${width - 4} 9`}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Tally({ n }) {
  const groups = [];
  let rem = n;
  while (rem > 0) { const c = Math.min(rem, 5); groups.push(c); rem -= c; }

  return (
    <div className="tally-marks">
      {groups.map((count, gi) => {
        const w = count === 5 ? 32 : Math.max(count, 1) * 7 + 2;
        return (
          <svg key={gi} width={w} height="26" viewBox={`0 0 ${w} 26`}>
            {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
              <line
                key={i}
                x1={3 + i * 7} y1="2"
                x2={3 + i * 7} y2="24"
                stroke={INK} strokeWidth="2.5" strokeLinecap="round"
              />
            ))}
            {count === 5 && (
              <line x1="2" y1="24" x2="30" y2="2" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
            )}
          </svg>
        );
      })}
    </div>
  );
}

// Single letter box (visual only — no interactivity).
export function LetterBox({ char = '', result, size = 46 }) {
  const resultClass = result ? `letter-box-${result}` : '';
  return (
    <div className={`letter-box ${resultClass}`} style={{ width: size, height: size + 4 }}>
      <div className="letter-box-bg" />
      <span className="letter-box-char">{char}</span>
    </div>
  );
}

// Row of letter boxes with a transparent input overlay — same tap target as the row.
export function LetterRow({ value = '', length, masked = false, onChange, onSubmit, disabled = false, autoFocus = false }) {
  return (
    <div className="letter-input-area">
      <div className="letter-boxes">
        {Array.from({ length }).map((_, i) => {
          const char = value[i] || '';
          return (
            <div key={i} className="letter-box">
              <div className="letter-box-bg" />
              <span className="letter-box-char">{masked ? (char ? '•' : '') : char}</span>
            </div>
          );
        })}
      </div>
      <input
        className="hidden-word-input"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, length);
          onChange(v);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
        autoFocus={autoFocus}
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
        inputMode="text"
        disabled={disabled}
        aria-label={`Enter ${length}-letter word`}
      />
    </div>
  );
}

// Animated result circle — used when feedback is a single match count.
export function ResultCircle({ count }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, flexShrink: 0 }}>
      <svg viewBox="0 0 50 50" style={{ position: 'absolute', inset: 0, filter: 'url(#sketchy)' }}>
        <ellipse
          cx="25" cy="25" rx="21" ry="19"
          fill="none" stroke={RED} strokeWidth="3"
          strokeDasharray="160"
          style={{ strokeDashoffset: 160, animation: 'draw-circle 0.6s ease-out forwards' }}
        />
      </svg>
      <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 19, color: INK, position: 'relative' }}>
        {count}
      </span>
    </div>
  );
}
