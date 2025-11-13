import React, { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import notificationsService from '../../services/notificationsService'
import { api } from '../../services/api'

const NotificationsPanel = ({ reloadSignal, socket }) => {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      const res = await notificationsService.getNotifications(token)
      if (res && res.success) setNotifications(res.data || [])
      setLoading(false)
    }
    load()
  }, [token, reloadSignal])

  // Subscribe to live notifications via socket
  useEffect(() => {
    if (!socket) return

    const onNotification = (payload) => {
      // Prepend new notification to list
      setNotifications((prev) => [payload, ...prev])
    }

    socket.on('notification', onNotification)
    return () => socket.off('notification', onNotification)
  }, [socket])

  const handleAcceptFriendRequest = async (notificationId, referenceId) => {
    try {
      await api.post(`/friends/accept/${referenceId}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      // Remove from notifications
      setNotifications((prev) => prev.filter(n => n._id !== notificationId))
    } catch (err) {
      console.error('Failed to accept friend request', err)
    }
  }

  const handleDeclineFriendRequest = async (notificationId, referenceId) => {
    try {
      await api.post(`/friends/decline/${referenceId}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      // Remove from notifications
      setNotifications((prev) => prev.filter(n => n._id !== notificationId))
    } catch (err) {
      console.error('Failed to decline friend request', err)
    }
  }

  const typeLabel = (type) => {
    switch (type) {
      case 'friend_request':
        return 'Friend Request';
      case 'friend_accepted':
        return 'Friend Accepted';
      case 'friend_declined':
        return 'Friend Declined';
      case 'message':
      case 'new_message':
        return 'New Message';
      default:
        return 'Update';
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-6 text-gray-900">Notifications</h3>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {notifications.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-lg">No notifications</p>
            </div>
          )}
          {notifications.map(n => {
            const type = n.type || n.data?.type;
            const senderName = n.senderInfo?.name || n.data?.senderName || 'Someone';
            const senderEmail = n.senderInfo?.email || n.data?.senderEmail || n.data?.fromEmail || n.data?.email || '';
            const ts = new Date(n.createdAt || n.date || Date.now());
            const isRead = n.isRead || n.read || false;

            let text = '';
            let showActions = false;
            let actions = null;

            if (type === 'friend_request') {
              text = `${senderName} sent you a friend request`;
              showActions = true;
              actions = (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAcceptFriendRequest(n._id, n.reference)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineFriendRequest(n._id, n.reference)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              );
            } else if (type === 'message' || type === 'new_message') {
              text = `New message from ${senderName}`;
            } else if (type === 'friend_accepted') {
              text = `${senderName} accepted your friend request`;
            } else if (type === 'friend_declined') {
              text = `${senderName} declined your friend request`;
            } else {
              text = n.message || n.msg || 'Notification';
            }

            return (
              <div
                key={n._id}
                className={`p-4 rounded-lg border transition-all ${ 
                  isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {text}
                      </div>
                      <div className={`text-xs uppercase tracking-wide ${isRead ? 'text-gray-400' : 'text-blue-600'}`}>
                        {typeLabel(type)}
                      </div>
                    </div>
                    {senderEmail && (
                      <div className="text-xs text-gray-500 mt-1">{senderEmail}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {ts.toLocaleString([], { hour: '2-digit', minute: '2-digit' })} • {ts.toLocaleDateString()}
                    </div>
                    {showActions && actions}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationsPanel
