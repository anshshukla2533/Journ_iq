import { useState, useEffect, useCallback } from 'react';
import { setNotificationHandler } from '../services/socket';
import { api, setAuthToken } from '../services/api';

export default function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setAuthToken(token);
      const response = await api.get('/notifications');
      if (response.data.success) {
        const items = response.data.data || [];
        setNotifications(items);
        setUnreadCount(items.filter((item) => !item.read && !item.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [token]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      setAuthToken(token);
      await api.post('/notifications/mark-read', { notificationId });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId || notification.id === notificationId
            ? { ...notification, read: true, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      setAuthToken(token);
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [token]);

  const markAsUnread = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      setAuthToken(token);
      await api.post('/notifications/mark-unread', { notificationId });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId || notification.id === notificationId
            ? { ...notification, read: false, isRead: false }
            : notification
        )
      );
      setUnreadCount((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  }, [token]);

  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetchNotifications();
    setNotificationHandler(handleNewNotification);

    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      clearInterval(interval);
      setNotificationHandler(null);
    };
  }, [token, fetchNotifications, handleNewNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
