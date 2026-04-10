const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firmName: { type: String, default: '' },
  investorType: { type: String, enum: ['angel','vc','family-office','corporate','accelerator','crowdfunding'], default: 'angel' },
  sectors: [{
    type: String,
    enum: ['fintech','healthtech','edtech','agritech','ecommerce','saas','ai-ml','blockchain','cleantech','logistics','proptech','gaming','social','cybersecurity','biotech','spacetech','foodtech','legaltech','hrtech','marketingtech','other']
  }],
  preferredStages: [{ type: String, enum: ['idea','pre-seed','seed','series-a','series-b','growth','ipo'] }],
  minInvestment: { type: Number, default: 10000 },
  maxInvestment: { type: Number, default: 1000000 },
  totalBudget: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['low','medium','high'], default: 'medium' },
  portfolioSize: { type: Number, default: 0 },
  portfolio: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],
  geographicPreference: [String],
  investmentThesis: { type: String, default: '' },
  successfulExits: { type: Number, default: 0 },
  trustScore: { type: Number, default: 0 },
  isAccredited: { type: Boolean, default: false },
  linkedinUrl: { type: String, default: '' },
  notableinvestments: [String],
}, { timestamps: true });

module.exports = mongoose.model('Investor', investorSchema);
