import mongoose from 'mongoose';

const FriendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true },
  conversationId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

FriendshipSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model('Friendship', FriendshipSchema);
