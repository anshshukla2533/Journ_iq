import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  image: { type: String }, // URL or path to image
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema);
