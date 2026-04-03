import React from 'react';
import useNotifications from '../../hooks/useNotifications';
import useAuth from '../../hooks/useAuth';

const formatTimestamp = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return 'Recently';
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const resolveUi = (notification) => {
  if (notification?.ui?.title) return notification.ui;

  const type = notification?.type || 'system';
  const data = notification?.data || {};
  const text = data.text || notification.message || '';
  const actorFromText = String(text).match(/^(.+?)\s+(shared|sent|accepted)\b/i)?.[1] || '';

  if (type === 'message') {
    const actor = data.senderName || data.senderEmail || actorFromText || 'Someone';
    return {
      category: 'Message',
      title: `${actor} sent you a message`,
      description: data.messagePreview ? `"${data.messagePreview}"` : 'Open chat to see the latest message.',
    };
  }

  if (type === 'note_share') {
    const actor = data.senderName || data.senderEmail || actorFromText || 'Someone';
    const noteTitle = data.noteTitle || String(text).match(/shared\s+"?(.+?)"?\s+with you/i)?.[1] || 'a note';
    return {
      category: 'Shared Note',
      title: `${actor} shared ${noteTitle} with you`,
      description: 'Open your notes or chat to review the shared note.',
    };
  }

  if (type === 'friend_request') {
    const actor = data.senderName || data.senderEmail || actorFromText || 'Someone';
    return {
      category: 'Friend Request',
      title: `${actor} sent you a friend request`,
      description: 'Open chat to review the request.',
    };
  }

  return {
    category: 'System',
    title: text || 'System notification',
    description: 'There is a new workspace update waiting for you.',
  };
};

const paletteByType = {
  message: {
    chip: 'bg-[#edf6ff] text-[#4d7bb8] border-[#d7e7fb]',
    iconWrap: 'bg-[#edf6ff] text-[#5c8fd0]',
  },
  note_share: {
    chip: 'bg-[#eef7ec] text-[#628657] border-[#dcebd6]',
    iconWrap: 'bg-[#eef7ec] text-[#6f9b61]',
  },
  friend_request: {
    chip: 'bg-[#f5efff] text-[#8161b8] border-[#e6dafc]',
    iconWrap: 'bg-[#f5efff] text-[#8a6ac2]',
  },
  system: {
    chip: 'bg-[#f6efe6] text-[#946f4a] border-[#eadcc8]',
    iconWrap: 'bg-[#f6efe6] text-[#ad8258]',
  },
};

const iconByType = {
  message: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 3.866-3.582 7-8 7a8.84 8.84 0 01-3.986-.94L3 20l1.118-3.354A6.93 6.93 0 013 12c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
    </svg>
  ),
  note_share: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h6M9 3h6a2 2 0 012 2v14l-5-3-5 3V5a2 2 0 012-2z" />
    </svg>
  ),
  friend_request: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3M9 7a4 4 0 100 8 4 4 0 000-8zm-6 14a6 6 0 0112 0" />
    </svg>
  ),
  system: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const NotificationsPanel = () => {
  const { token } = useAuth();
  const { notifications, unreadCount, markAsRead, markAsUnread, markAllAsRead } = useNotifications(token);

  if (!notifications.length) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-[#efe2cf] bg-white/75 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7efe3] text-[#b88455]">
          {iconByType.system}
        </div>
        <p className="text-xl font-semibold text-[#3a3128]">No notifications yet</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#8c7f72]">
          Messages, note shares, and requests will show up here with clear names and status.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[1.8rem] border border-[#efe2cf] bg-[#fffaf3] px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a68560]">Inbox</p>
          <h3 className="mt-1 text-xl font-semibold text-[#342c24]">Notification center</h3>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="rounded-xl border border-[#eadcc8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9a724a] transition hover:border-[#c9a47a] hover:bg-[#fff8ef]"
            >
              Mark all read
            </button>
          ) : null}
          <div className="rounded-full border border-[#e5f0db] bg-[#f2f8eb] px-4 py-2 text-sm font-medium text-[#739258]">
            {unreadCount} unread
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const type = notification.type || 'system';
          const ui = resolveUi(notification);
          const palette = paletteByType[type] || paletteByType.system;
          const icon = iconByType[type] || iconByType.system;
          const isUnread = !notification.isRead && !notification.read;

          return (
            <div
              key={notification._id || notification.id}
              className={`rounded-[1.8rem] border bg-white/92 px-5 py-5 shadow-[0_18px_36px_rgba(170,132,87,0.12)] transition ${
                isUnread ? 'border-[#e2d0b8]' : 'border-[#efe5d8]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${palette.iconWrap}`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${palette.chip}`}>
                      {ui.category}
                    </span>
                    <button
                      onClick={() => (isUnread ? markAsRead(notification._id || notification.id) : markAsUnread(notification._id || notification.id))}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                        isUnread
                          ? 'bg-[#f2f8eb] text-[#769558] hover:bg-[#e8f3dc]'
                          : 'bg-[#f5efe7] text-[#9b866e] hover:bg-[#efe5d9]'
                      }`}
                    >
                      {isUnread ? 'Unread' : 'Read'}
                    </button>
                  </div>
                  <h4 className="mt-3 text-lg font-semibold leading-7 text-[#312821]">{ui.title}</h4>
                  <p className="mt-1 text-sm leading-6 text-[#85786b]">{ui.description}</p>
                  <p className="mt-3 text-xs font-medium tracking-wide text-[#a39382]">{formatTimestamp(notification.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPanel;
