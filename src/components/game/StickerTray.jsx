import React, { useState, useRef, useEffect } from 'react';
import './GameComponents.css';

export const STICKERS = Array.from({ length: 20 }, (_, i) => ({
  id: `cat_${i + 1}`,
  src: `/stickers/cat_${i + 1}.webp`,
  label: `Cat ${i + 1}`,
}));

export function StickerTray({ onSend }) {
  const [sent, setSent] = useState(null);
  const [preview, setPreview] = useState(null);
  // Block backdrop close for 550ms after opening to swallow the ghost click
  // that mobile browsers fire ~300ms after touchend.
  const closeBlocked = useRef(false);
  const closeBlockTimer = useRef(null);

  useEffect(() => {
    return () => { if (closeBlockTimer.current) clearTimeout(closeBlockTimer.current); };
  }, []);

  const openPreview = (s) => {
    setPreview(s);
    closeBlocked.current = true;
    if (closeBlockTimer.current) clearTimeout(closeBlockTimer.current);
    closeBlockTimer.current = setTimeout(() => { closeBlocked.current = false; }, 550);
  };

  const closePreview = () => {
    if (closeBlocked.current) return;
    setPreview(null);
  };

  const handleSend = (sticker) => {
    onSend(sticker);
    setSent(sticker.id);
    setPreview(null);
    closeBlocked.current = false;
    if (closeBlockTimer.current) clearTimeout(closeBlockTimer.current);
    setTimeout(() => setSent(null), 1800);
  };

  return (
    <>
      <div className="sticker-tray">
        <p className="sticker-tray-label">send a sticker</p>
        <div className="sticker-buttons">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              className={`sticker-btn${sent === s.id ? ' sticker-btn-sent' : ''}`}
              onClick={() => openPreview(s)}
              title={s.label}
              disabled={sent !== null}
            >
              <img src={s.src} alt={s.label} className="sticker-img" />
            </button>
          ))}
        </div>
        {sent && <p className="sticker-sent-confirm">Sent!</p>}
      </div>

      {preview && (
        <div className="sticker-preview-backdrop" onClick={closePreview}>
          <div className="sticker-preview-popup" onClick={(e) => e.stopPropagation()}>
            <img src={preview.src} alt={preview.label} className="sticker-preview-img" />
            <div className="sticker-preview-actions">
              <button className="btn btn-primary btn-md" onClick={() => handleSend(preview)}>
                Send
              </button>
              <button className="btn btn-secondary btn-md" onClick={() => setPreview(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function StickerReceived({ sticker }) {
  if (!sticker) return null;
  return (
    <div className="sticker-received-overlay" key={sticker.id + Date.now()}>
      <div className="sticker-received-bubble">
        <img src={sticker.src} alt={sticker.label} className="sticker-received-img" />
        <p className="sticker-received-from">opponent sent a sticker!</p>
      </div>
    </div>
  );
}
