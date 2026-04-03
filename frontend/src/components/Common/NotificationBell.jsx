import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';

const describeNotification = (notification) => {
  const data = notification?.data || {};
  const type = notification?.type || 'system';

  if (type === 'message') {
    const actor = data.senderName || data.senderEmail || 'Someone';
    return {
      label: 'Message',
      title: `${actor} sent you a message`,
      description: data.messagePreview ? `"${data.messagePreview}"` : 'Tap to open the conversation.',
    };
  }

  if (type === 'note_share') {
    const actor = data.senderName || data.senderEmail || 'Someone';
    return {
      label: 'Shared Note',
      title: `${actor} shared ${data.noteTitle || 'a note'} with you`,
      description: 'Open the conversation or your notes to view it.',
    };
  }

  if (type === 'friend_request') {
    const actor = data.senderName || data.senderEmail || 'Someone';
    return {
      label: 'Friend Request',
      title: `${actor} sent you a friend request`,
      description: 'Open your chat network to respond.',
    };
  }

  return {
    label: 'System',
    title: data.text || 'System notification',
    description: 'Open notifications for more details.',
  };
};

const NotificationBell = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(token);
  const navigate = useNavigate();

  const unread = useMemo(
    () => notifications.filter((notification) => !notification.isRead && !notification.read).length,
    [notifications],
  );

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);

    switch (notification.type) {
      case 'message':
        navigate('/dashboard/chat');
        break;
      case 'note_share':
        navigate('/dashboard/notes');
        break;
      case 'friend_request':
        navigate('/dashboard/chat');
        break;
      default:
        navigate('/dashboard/notifications');
        break;
    }

    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadcc8] bg-white text-[#8d6948] shadow-[0_12px_26px_rgba(170,132,87,0.12)] transition hover:border-[#c9a47a] hover:bg-[#fff8ef] focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#d17d58] px-1.5 text-[11px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[360px] rounded-[1.6rem] border border-[#eadcc8] bg-[#fffdf9] shadow-[0_26px_48px_rgba(170,132,87,0.18)]">
          <div className="flex items-center justify-between border-b border-[#f1e6d7] px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-[#312821]">Notifications</h3>
              <p className="mt-1 text-xs text-[#8f8173]">{unread} unread updates</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-medium text-[#9a724a] transition hover:text-[#7f5c39]">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const info = describeNotification(notification);
                const isUnread = !notification.isRead && !notification.read;

                return (
                  <button
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`mb-2 w-full rounded-2xl border px-4 py-3 text-left transition last:mb-0 ${
                      isUnread
                        ? 'border-[#e9d7bd] bg-[#fff7ec] hover:bg-[#fff3e3]'
                        : 'border-[#f1e6d7] bg-white hover:bg-[#fffaf2]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ad8c68]">{info.label}</p>
                        <p className="mt-1 text-sm font-semibold text-[#302821]">{info.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[#8a7d70]">{info.description}</p>
                        <p className="mt-2 text-[11px] text-[#a09081]">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                      {isUnread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7f9a5c]" /> : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-[#8f8173]">No notifications right now.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
