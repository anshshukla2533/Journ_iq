import mongoose from 'mongoose';

const FriendRequestSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true, index: true },
  receiverEmail: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('FriendRequest', FriendRequestSchema);


