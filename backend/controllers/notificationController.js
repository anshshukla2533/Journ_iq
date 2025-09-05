import Notification from '../models/Notification.js';

const notificationController = {
  
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.find({ user: req.user._id })
                                           .sort({ createdAt: -1 });
      res.json(notifications);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },


  async markAsRead(req, res) {
    try {
      const { notificationId } = req.body;
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      res.json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

export default notificationController;