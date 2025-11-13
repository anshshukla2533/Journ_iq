import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure participants are always sorted to maintain consistent conversation IDs
conversationSchema.pre('save', function(next) {
  this.participants.sort();
  next();
});

// Create a compound index on participants to ensure uniqueness
conversationSchema.index({ participants: 1 }, { unique: true });

// Helper method to get or create a conversation between users
conversationSchema.statics.getOrCreate = async function(participants) {
  try {
    let conversation = await this.findOne({
      participants: { $all: participants }
    }).populate('lastMessage');

    if (!conversation) {
      conversation = await this.create({
        participants: participants.sort(),
        unreadCount: new Map(participants.map(p => [p.toString(), 0]))
      });
    }

    return conversation;
  } catch (error) {
    console.error('Error in getOrCreate conversation:', error);
    throw error;
  }
};

// Method to increment unread count for a participant
conversationSchema.methods.incrementUnread = async function(forUserId) {
  const currentCount = this.unreadCount.get(forUserId.toString()) || 0;
  this.unreadCount.set(forUserId.toString(), currentCount + 1);
  return this.save();
};

// Method to reset unread count for a participant
conversationSchema.methods.resetUnread = async function(forUserId) {
  this.unreadCount.set(forUserId.toString(), 0);
  return this.save();
};

// Method to update last message
conversationSchema.methods.updateLastMessage = async function(messageId) {
  this.lastMessage = messageId;
  this.updatedAt = new Date();
  return this.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;