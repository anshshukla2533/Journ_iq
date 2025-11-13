import React, { useState } from 'react';

export default function ContactsList({ contacts, onOpen, active }) {
  const [search, setSearch] = useState('');
  const filtered = (contacts || []).filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#fff' }}>
      {/* Search Bar */}
      <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '14px', border: 'none', outline: 'none' }}
          />
        </div>
      </div>
      
      {/* Contacts List */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '14px' }}>
            <p>No contacts found</p>
          </div>
        ) : (
          filtered.map((c, idx) => (
            <div
              key={c._id}
              onClick={() => onOpen(c)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f9fafb', backgroundColor: active?._id === c._id ? '#f3f4f6' : 'transparent', borderLeft: active?._id === c._id ? '4px solid #22c55e' : '4px solid transparent', transition: 'all 0.2s' }}
            >
              {/* Avatar */}
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80 0%, #0ea5e9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0, fontSize: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {c.name?.[0] || c.email?.[0] || 'C'}
              </div>
              
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>{c.name || c.email}</h3>
                  {c.online && (
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', flexShrink: 0 }}></span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
              </div>
              
              {/* Online indicator */}
              {c.online && (
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#16a34a', display: window.innerWidth < 640 ? 'none' : 'block' }}>Online</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
