import React, { useState, useRef } from 'react';
import { api } from '../../services/api';

export default function MessageInput({ contact, socket, user }) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);

  const autoResize = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    const next = Math.min(textareaRef.current.scrollHeight, 120);
    textareaRef.current.style.height = next + 'px';
  };

  const send = async () => {
    if (!text.trim() || !contact || isSending) return;

    const payload = { receiverId: contact._id, content: text };
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.focus();
    }
    setIsSending(true);

    try {
      if (socket && socket.connected) {
        socket.emit('message:send', payload);
      } else {
        await api.post('/messages/send', payload);
      }
    } catch (e) {
      console.error('send failed', e);
    } finally {
      setIsSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    autoResize();
  };

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '8px 12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  };

  const iconBtnStyle = {
    color: '#6b7280',
    background: 'transparent',
    border: 'none',
    padding: 6,
    borderRadius: 9999,
    cursor: 'pointer',
  };

  const textareaStyle = {
    flex: 1,
    background: 'transparent',
    color: '#111827',
    fontSize: 14,
    resize: 'none',
    outline: 'none',
    border: 'none',
    maxHeight: 120,
    overflow: 'hidden',
    lineHeight: 1.5,
    height: 40,
  };

  const canSend = !!contact && !!text.trim() && !isSending;
  const sendBtnStyle = {
    flexShrink: 0,
    padding: 8,
    borderRadius: 9999,
    border: 'none',
    background: canSend ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'transparent',
    color: canSend ? '#fff' : '#9ca3af',
    boxShadow: canSend ? '0 2px 6px rgba(16,185,129,0.35)' : 'none',
    cursor: canSend ? 'pointer' : 'not-allowed',
  };

  return (
    <div style={wrapperStyle}>
      {/* Attach / action */}
      <button style={iconBtnStyle} title="Attach">
        <svg width="20" height="20" fill="none" stroke="#6b7280" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="M16.5 6.5L11 12v6.5a3.5 3.5 0 01-7 0V7a5 5 0 0110 0v9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 9L18.5 3.5a3 3 0 014.25 4.25L12 18.5a5 5 0 01-7.07-7.07L13 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Text input */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={onKey}
        disabled={!contact}
        rows={1}
        placeholder={contact ? `Message ${contact.name || 'this contact'}...` : 'Select a chat'}
        style={textareaStyle}
      />

      {/* Send button */}
      <button onClick={send} disabled={!canSend} style={sendBtnStyle}>
        {isSending ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.9429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.01449553 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.97788154 L3.03521743,10.4188744 C3.03521743,10.5759718 3.19218622,10.7330691 3.50612381,10.7330691 L16.6915026,11.5185561 C16.6915026,11.5185561 17.1624089,11.5185561 17.1624089,12 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
