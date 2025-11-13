import { useState, useEffect, useCallback } from 'react';
import { createSocket, setNotificationHandler } from '../services/socket';
import axios from 'axios';

export default function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [token]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/notifications/mark-read`,
        { notificationId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [token]);

  const handleNewNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!token) return;
    
    fetchNotifications();
    setNotificationHandler(handleNewNotification);

    // Refresh notifications periodically
    const interval = setInterval(fetchNotifications, 60000); // Every minute

    return () => {
      clearInterval(interval);
      setNotificationHandler(null);
    };
  }, [token, fetchNotifications, handleNewNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
}