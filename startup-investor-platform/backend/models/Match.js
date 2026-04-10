const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor', required: true },
  matchScore: { type: Number, required: true, min: 0, max: 100 },
  sectorMatch: { type: Number, default: 0 },
  stageMatch: { type: Number, default: 0 },
  budgetMatch: { type: Number, default: 0 },
  riskMatch: { type: Number, default: 0 },
  nlpSimilarity: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','liked','disliked','connected','deal','rejected'], default: 'pending' },
  startupAction: { type: String, enum: ['none','liked','disliked'], default: 'none' },
  investorAction: { type: String, enum: ['none','liked','disliked'], default: 'none' },
  chatRoomId: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

matchSchema.index({ startup: 1, investor: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
