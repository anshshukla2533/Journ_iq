import Notification from '../models/Notification.js';

const notificationController = {
  // Get all notifications for the current user
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.find({ 
        user: req.user._id 
      })
      .sort({ createdAt: -1 })
      .populate('reference', 'content text') // Populate message or note content
      .populate('senderInfo.id', 'name email'); // Populate sender info
      
      res.json({
        success: true,
        data: notifications.map(notification => ({
          ...notification.toObject(),
          preview: notification.reference?.content || notification.reference?.text,
        }))
      });
    } catch (err) {
      console.error('Get notifications error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch notifications' 
      });
    }
  },

  // Mark a single notification as read
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.body;
      const notification = await Notification.findOneAndUpdate(
        { 
          _id: notificationId,
          user: req.user._id // Ensure user owns this notification
        },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          error: 'Notification not found' 
        });
      }

      res.json({ 
        success: true, 
        data: notification 
      });
    } catch (err) {
      console.error('Mark as read error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to mark notification as read' 
      });
    }
  },

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      await Notification.updateMany(
        { user: req.user._id },
        { isRead: true }
      );

      res.json({ 
        success: true, 
        message: 'All notifications marked as read' 
      });
    } catch (err) {
      console.error('Mark all as read error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to mark all notifications as read' 
      });
    }
  },

  // Get unread notification count
  async getUnreadCount(req, res) {
    try {
      const count = await Notification.countDocuments({
        user: req.user._id,
        isRead: false
      });

      res.json({ 
        success: true, 
        data: { count } 
      });
    } catch (err) {
      console.error('Get unread count error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get unread notification count' 
      });
    }
  },

  // Delete a notification
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: req.user._id // Ensure user owns this notification
      });

      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          error: 'Notification not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Notification deleted successfully' 
      });
    } catch (err) {
      console.error('Delete notification error:', err);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete notification' 
      });
    }
  }
};

export default notificationController;