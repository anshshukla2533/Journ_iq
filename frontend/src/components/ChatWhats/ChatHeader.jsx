import React from 'react';

export default function ChatHeader({ contact, onBack, showBack = false }) {
  const isOnline = contact?.online;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <button
          onClick={onBack}
          style={{
            color: '#374151',
            padding: '8px',
            borderRadius: '9999px',
            background: 'transparent',
            border: 'none',
            display: showBack ? 'inline-flex' : 'none',
            cursor: 'pointer'
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg,#4ade80 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          {contact?.name?.[0] || 'C'}
        </div>

        {/* Contact Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {contact?.name || 'Contact'}
          </h2>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {isOnline ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '9999px' }} />
                Online
              </span>
            ) : (
              'Offline'
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          style={{ color: '#374151', padding: '10px', borderRadius: '9999px', border: 'none', background: 'transparent', cursor: 'pointer' }}
          title="Call"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button
          style={{ color: '#374151', padding: '10px', borderRadius: '9999px', border: 'none', background: 'transparent', cursor: 'pointer' }}
          title="Menu"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
