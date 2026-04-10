const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['founder', 'investor', 'admin'], required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  website: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  preferredLanguage: { type: String, default: 'en' },
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  profileCompleteness: { type: Number, default: 0 },
  mentalHealthCheckins: [{ mood: String, note: String, date: Date }],
  savedStartups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],
  savedInvestors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investor' }],
  swipedRight: [{ type: mongoose.Schema.Types.ObjectId }],
  swipedLeft: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // Calculate trust score
  let score = 10;
  if (this.avatar) score += 10;
  if (this.bio) score += 15;
  if (this.location) score += 10;
  if (this.linkedin) score += 20;
  if (this.website) score += 15;
  if (this.isVerified) score += 20;
  this.trustScore = Math.min(score, 100);
  this.profileCompleteness = score;
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.updateTrustScore = function() {
  let score = 10;
  if (this.avatar) score += 10;
  if (this.bio) score += 15;
  if (this.location) score += 10;
  if (this.linkedin) score += 20;
  if (this.website) score += 15;
  if (this.isVerified) score += 20;
  this.trustScore = Math.min(score, 100);
  this.profileCompleteness = score;
};

module.exports = mongoose.model('User', userSchema);
