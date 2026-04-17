const express = require('express');
const router = express.Router();
const LearningResource = require('../models/LearningResource');
const { protect, authorize } = require('../middleware/auth');

// Seed some default resources on first call
async function seedIfEmpty() {
  const count = await LearningResource.countDocuments();
  if (count === 0) {
    await LearningResource.insertMany([
      { title: 'How to Write a Winning Pitch Deck', description: 'Master the 10-slide pitch deck formula used by top founders', type: 'article', category: 'pitching', difficulty: 'beginner', duration: '15 min read', isFeatured: true, tags: ['pitch','deck','fundraising'] },
      { title: 'Term Sheet 101', description: 'Everything founders need to know about term sheets', type: 'article', category: 'legal', difficulty: 'intermediate', duration: '20 min read', tags: ['legal','term-sheet','equity'] },
      { title: 'Finding Product-Market Fit', description: 'Proven frameworks to achieve PMF faster', type: 'course', category: 'product', difficulty: 'intermediate', duration: '2 hours', isFeatured: true, tags: ['pmf','product','growth'] },
      { title: 'Investor Psychology', description: 'Understand how investors think and make decisions', type: 'article', category: 'fundraising', difficulty: 'advanced', duration: '25 min read', tags: ['investors','psychology','fundraising'] },
      { title: 'Building a Financial Model', description: 'Step-by-step guide to creating investor-ready financial models', type: 'template', category: 'finance', difficulty: 'intermediate', duration: '1 hour', tags: ['finance','model','excel'] },
      { title: 'Founder Mental Health Guide', description: 'Managing stress, burnout, and mental wellness as a founder', type: 'article', category: 'mindset', difficulty: 'beginner', duration: '10 min read', isFeatured: true, tags: ['mental-health','wellness','founder'] },
      { title: 'Growth Hacking for Startups', description: '50 proven growth hacks from top YC startups', type: 'checklist', category: 'growth', difficulty: 'intermediate', duration: '30 min read', tags: ['growth','marketing','hacks'] },
      { title: 'Equity & Cap Table Basics', description: 'Navigate equity, dilution and cap tables with confidence', type: 'course', category: 'legal', difficulty: 'beginner', duration: '45 min', tags: ['equity','cap-table','dilution'] },
    ]);
  }
}

// @GET /api/learning
router.get('/', async (req, res) => {
  try {
    await seedIfEmpty();
    const { category, type, difficulty, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    const total = await LearningResource.countDocuments(query);
    const resources = await LearningResource.find(query)
      .sort({ isFeatured: -1, likes: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ resources, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/learning/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const resource = await LearningResource.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
