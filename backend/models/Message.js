import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  // Participant references (ObjectId)
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Email-based identity for portability and quick lookups
  senderEmail: { type: String, index: true },
  receiverEmail: { type: String, index: true },
  // Deterministic conversation id based on sorted participant emails
  conversationId: { type: String, index: true },
  // Message body
  text: { type: String },
  content: { type: String }, // legacy/client field
  note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  image: { type: String },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Ensure text/content parity for consumers that expect either
MessageSchema.pre('save', function(next) {
  if (!this.text && this.content) this.text = this.content;
  if (!this.content && this.text) this.content = this.text;
  // Compute conversationId if emails present
  if (!this.conversationId && this.senderEmail && this.receiverEmail) {
    const a = String(this.senderEmail).toLowerCase();
    const b = String(this.receiverEmail).toLowerCase();
    this.conversationId = [a, b].sort().join(':');
  }
  next();
});

export default mongoose.model('Message', MessageSchema);