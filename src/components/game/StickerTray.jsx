import React, { useState, useRef } from 'react';
import './GameComponents.css';

export const STICKERS = Array.from({ length: 20 }, (_, i) => ({
  id: `cat_${i + 1}`,
  src: `/stickers/cat_${i + 1}.webp`,
  label: `Cat ${i + 1}`,
}));

export function StickerTray({ onSend }) {
  const [sent, setSent] = useState(null);
  const [preview, setPreview] = useState(null);
  const previewOpenedAt = useRef(0);

  const openPreview = (s) => {
    setPreview(s);
    previewOpenedAt.current = Date.now();
  };

  const closePreview = () => {
    // Mobile browsers fire a ghost click ~300ms after touch — ignore it
    if (Date.now() - previewOpenedAt.current < 400) return;
    setPreview(null);
  };

  const handleSend = (sticker) => {
    onSend(sticker);
    setSent(sticker.id);
    setPreview(null);
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
