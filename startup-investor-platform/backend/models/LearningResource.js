const mongoose = require('mongoose');

const learningSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['article','video','course','template','checklist'], default: 'article' },
  category: { type: String, enum: ['fundraising','pitching','legal','marketing','product','growth','finance','mindset'], required: true },
  content: { type: String, default: '' },
  url: { type: String, default: '' },
  duration: { type: String, default: '' },
  difficulty: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  tags: [String],
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  author: { type: String, default: 'Admin' },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LearningResource', learningSchema);
