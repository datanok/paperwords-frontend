import React, { useState } from 'react';
import './GameComponents.css';

export const STICKERS = Array.from({ length: 20 }, (_, i) => ({
  id: `cat_${i + 1}`,
  src: `/stickers/cat_${i + 1}.webp`,
  label: `Cat ${i + 1}`,
}));

export function StickerTray({ onSend }) {
  const [sent, setSent] = useState(null);

  const handleSend = (sticker) => {
    onSend(sticker);
    setSent(sticker.id);
    setTimeout(() => setSent(null), 1800);
  };

  return (
    <div className="sticker-tray">
      <p className="sticker-tray-label">send a sticker</p>
      <div className="sticker-buttons">
        {STICKERS.map((s) => (
          <button
            key={s.id}
            className={`sticker-btn${sent === s.id ? ' sticker-btn-sent' : ''}`}
            onClick={() => handleSend(s)}
            title={s.label}
            disabled={sent !== null}
          >
            <img src={s.src} alt={s.label} className="sticker-img" />
          </button>
        ))}
      </div>
      {sent && <p className="sticker-sent-confirm">Sent!</p>}
    </div>
  );
}

export function StickerReceived({ sticker, senderLabel = 'opponent' }) {
  if (!sticker) return null;
  return (
    <div className="sticker-received-overlay" key={sticker.id + Date.now()}>
      <div className="sticker-received-bubble">
        <img src={sticker.src} alt={sticker.label} className="sticker-received-img" />
        <p className="sticker-received-from">{senderLabel} sent a sticker!</p>
      </div>
    </div>
  );
}
