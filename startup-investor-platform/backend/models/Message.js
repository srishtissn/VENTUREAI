const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'offer', 'system'], default: 'text' },
  read: { type: Boolean, default: false },
  // Deal negotiation
  offer: {
    amount: Number,
    equity: Number,
    valuation: Number,
    terms: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'] },
  },
}, { timestamps: true });

messageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
