import { prisma } from '../lib/prisma.js';
import { deleteCacheKeys, getCachedJson, notificationCacheKeys, setCachedJson } from '../lib/cache.js';

const buildNotificationCopy = (notification) => {
  const data = notification?.data || {};
  const type = notification?.type || data?.type || 'system';
  const text = data?.text || notification?.message || notification?.msg || '';

  const parseActorFromText = (value) => {
    const match = String(value || '').match(/^(.+?)\s+(shared|sent|accepted)\b/i);
    return match?.[1]?.trim() || '';
  };

  if (type === 'message') {
    const actor = data.senderName || data.senderEmail || parseActorFromText(text) || 'Someone';
    const preview = data.messagePreview ? ` "${data.messagePreview}"` : '';
    return {
      category: 'Message',
      title: `${actor} sent you a message`,
      description: preview ? `Latest message:${preview}` : 'Open chat to continue the conversation.',
      actor,
      actionLabel: 'Open chat',
    };
  }

  if (type === 'note_share') {
    const actor = data.senderName || data.senderEmail || parseActorFromText(text) || 'Someone';
    const noteTitle = data.noteTitle || String(text).match(/shared\s+"?(.+?)"?\s+with you/i)?.[1] || 'a note';
    return {
      category: 'Shared Note',
      title: `${actor} shared ${noteTitle} with you`,
      description: 'Open chat or notes to review the shared note.',
      actor,
      actionLabel: 'View note',
    };
  }

  if (type === 'friend_request') {
    const actor = data.senderName || data.senderEmail || 'Someone';
    return {
      category: 'Friend Request',
      title: `${actor} sent you a friend request`,
      description: 'Review the request from your chat network.',
      actor,
      actionLabel: 'Open requests',
    };
  }

  if (type === 'friend_accepted') {
    const actor = data.senderName || data.senderEmail || 'A friend';
    return {
      category: 'Friend Update',
      title: `${actor} accepted your friend request`,
      description: 'You can start chatting with them now.',
      actor,
      actionLabel: 'Open chat',
    };
  }

  return {
    category: 'System',
    title: data.text || notification.message || notification.msg || 'System notification',
    description: 'Check your workspace for the latest update.',
    actor: '',
    actionLabel: 'View',
  };
};

const notificationController = {
  async getNotifications(req, res) {
    try {
      const cacheKey = `notifications:list:${req.user.id}`;
      const cached = await getCachedJson(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } }
      });
      
      const mapped = notifications.map(n => ({
        ...n,
        _id: n.id,
        isRead: n.read,
        preview: n.data && n.data.text ? n.data.text : '',
        ui: buildNotificationCopy(n),
      }));

      await setCachedJson(cacheKey, mapped, 60);
      res.json({ success: true, data: mapped });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  },

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.body;
      const notif = await prisma.notification.findFirst({
        where: { id: notificationId, userId: req.user.id }
      });
      if (!notif) return res.status(404).json({ success: false, error: 'Notification not found' });

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });
      await deleteCacheKeys(notificationCacheKeys(req.user.id));
      res.json({ success: true, data: { ...updated, _id: updated.id } });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
  },

  async markAsUnread(req, res) {
    try {
      const { notificationId } = req.body;
      const notif = await prisma.notification.findFirst({
        where: { id: notificationId, userId: req.user.id }
      });
      if (!notif) return res.status(404).json({ success: false, error: 'Notification not found' });

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: false }
      });
      await deleteCacheKeys(notificationCacheKeys(req.user.id));
      res.json({ success: true, data: { ...updated, _id: updated.id } });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to mark notification as unread' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, read: false },
        data: { read: true }
      });
      await deleteCacheKeys(notificationCacheKeys(req.user.id));
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const cacheKey = `notifications:unread:${req.user.id}`;
      const cached = await getCachedJson(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const count = await prisma.notification.count({
        where: { userId: req.user.id, read: false }
      });
      const payload = { count };
      await setCachedJson(cacheKey, payload, 30);
      res.json({ success: true, data: payload });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to get unread notification count' });
    }
  },

  async deleteNotification(req, res) {
    try {
      const notif = await prisma.notification.findFirst({
        where: { id: req.params.notificationId, userId: req.user.id }
      });
      if (!notif) return res.status(404).json({ success: false, error: 'Notification not found' });

      await prisma.notification.delete({ where: { id: req.params.notificationId } });
      await deleteCacheKeys(notificationCacheKeys(req.user.id));
      res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
  }
};
export default notificationController;
