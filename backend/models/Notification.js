import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Expanded enum to cover common app events created from sockets/controllers
  type: { type: String, enum: ['friend_request', 'note_share', 'message', 'friend_accepted', 'friend_declined', 'new_message'], required: true },
  message: { type: String },
  // follow a consistent naming convention used across the codebase
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  // reference can point to a Message, Note, or other models in future
  reference: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel' },
  referenceModel: { type: String, enum: ['Message', 'Note'], default: undefined },
  senderInfo: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  }
});

export default mongoose.model('Notification', NotificationSchema);
