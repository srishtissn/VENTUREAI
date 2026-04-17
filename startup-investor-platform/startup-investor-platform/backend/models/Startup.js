const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  founder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  tagline: { type: String, default: '' },
  description: { type: String, required: true },
  sector: {
    type: String,
    required: true,
    enum: ['fintech','healthtech','edtech','agritech','ecommerce','saas','ai-ml','blockchain','cleantech','logistics','proptech','gaming','social','cybersecurity','biotech','spacetech','foodtech','legaltech','hrtech','marketingtech','other']
  },
  stage: { type: String, enum: ['idea','pre-seed','seed','series-a','series-b','growth','ipo'], default: 'idea' },
  fundingRequired: { type: Number, required: true },
  fundingRaised: { type: Number, default: 0 },
  teamSize: { type: Number, required: true },
  foundedYear: { type: Number },
  revenue: { type: Number, default: 0 },
  marketSize: { type: Number, default: 0 },
  userGrowthRate: { type: Number, default: 0 },
  founderExperience: { type: Number, default: 0 }, // years
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  pitchDeckUrl: { type: String, default: '' },
  videoPitchUrl: { type: String, default: '' },
  logo: { type: String, default: '' },
  pitchDeckAnalysis: {
    clarity: Number,
    fillerWords: Number,
    sentiment: String,
    keyTopics: [String],
    transcript: String
  },
  aiScore: { type: Number, default: 0, min: 0, max: 100 },
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  nlpEmbedding: [Number],
  competitorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],
  competitionLevel: { type: String, enum: ['low','medium','high'], default: 'low' },
  similarStartupsCount: { type: Number, default: 0 },
  tags: [String],
  socialLinks: { linkedin: String, twitter: String, github: String },
  metrics: {
    monthlyActiveUsers: Number,
    churnRate: Number,
    ltv: Number,
    cac: Number,
    mrr: Number
  },
  isPublished: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
}, { timestamps: true });

startupSchema.index({ sector: 1, stage: 1 });
startupSchema.index({ aiScore: -1 });
startupSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Startup', startupSchema);
