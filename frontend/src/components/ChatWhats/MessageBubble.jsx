import React from 'react';

export default function MessageBubble({ message }) {
  const fromMe = !!message?.fromMe;
  const isRead = message?.status === 'read';
  const isSent = message?.status === 'sent' || message?.status === 'delivered';
  const timeStr = new Date(message.createdAt || message.readAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Determine tick icon and color
  let tickIcon = '✓';
  let tickColor = fromMe ? 'rgba(255,255,255,0.6)' : '#6b7280';
  if (fromMe) {
    if (isRead) {
      tickIcon = '✓✓';
      tickColor = '#93c5fd'; // blue-300 like
    } else if (isSent) {
      tickIcon = '✓✓';
      tickColor = 'rgba(255,255,255,0.6)';
    }
  }

  const messageContent = message.content || message.text || message.note?.text || '';
  const isLongMessage = messageContent.length > 60;

  const containerStyle = {
    display: 'flex',
    width: '100%',
    marginBottom: '12px',
    padding: '0 8px',
    justifyContent: fromMe ? 'flex-end' : 'flex-start',
  };

  const bubbleStyle = {
    maxWidth: '75%',
    padding: '8px 12px',
    borderRadius: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    color: fromMe ? '#ffffff' : '#111827',
    background: fromMe ? 'linear-gradient(90deg, #22c55e, #16a34a)' : '#ffffff',
    border: fromMe ? 'none' : '1px solid #f3f4f6',
  };

  const textStyle = {
    wordBreak: 'break-word',
    lineHeight: 1.6,
    fontSize: 15,
    maxWidth: isLongMessage ? '24rem' : undefined,
  };

  const metaStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    marginTop: 4,
    fontSize: 12,
    color: fromMe ? 'rgba(255,255,255,0.7)' : '#6b7280',
  };

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>
        <div style={textStyle}>{messageContent}</div>
        <div style={metaStyle}>
          <span>{timeStr}</span>
          {fromMe && <span style={{ color: tickColor, fontWeight: 600 }}>{tickIcon}</span>}
        </div>
      </div>
    </div>
  );
}
