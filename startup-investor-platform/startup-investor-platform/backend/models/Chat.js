const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: Number,
  senderId: String,
  senderName: String,
  message: String,
  timestamp: Date,
  type: { type: String, enum: ['text','file','deal','system'], default: 'text' },
  fileUrl: String,
});

const chatSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  messages: [messageSchema],
  dealStatus: { type: String, enum: ['none','proposed','negotiating','agreed','closed'], default: 'none' },
  dealTerms: { type: String, default: '' },
  lastMessage: { type: String, default: '' },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
