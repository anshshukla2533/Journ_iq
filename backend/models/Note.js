// backend/models/Note.js
import mongoose from 'mongoose';


const todoSchema = new mongoose.Schema({
  task: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
});

const noteSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  reminder: {
    type: Date,
    default: null
  },
  todos: [todoSchema],
  images: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  timelineTag: {
    type: String,
    default: ''
  },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accessLevel: { type: String, enum: ['read', 'write'], default: 'read' },
    sharedAt: { type: Date, default: Date.now }
  }],
  parentNote: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }, // Reference to original note if this is a shared copy
  isSharedCopy: { type: Boolean, default: false }
});

// Update the updatedAt field before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Note = mongoose.model('Note', noteSchema);
export default Note;