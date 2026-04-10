const express = require('express');
const router = express.Router();
const axios = require('axios');
const Match = require('../models/Match');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const { protect, authorize } = require('../middleware/auth');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Helper: compute basic match score between startup and investor
function computeMatchScore(startup, investor) {
  let score = 0;
  // Sector match (40 points)
  if (investor.sectors.includes(startup.sector)) score += 40;
  // Stage match (20 points)
  if (investor.preferredStages.includes(startup.stage)) score += 20;
  // Budget match (25 points)
  if (startup.fundingRequired >= investor.minInvestment && startup.fundingRequired <= investor.maxInvestment) score += 25;
  // Risk alignment (15 points)
  const riskMap = { low: 1, medium: 2, high: 3 };
  const startupRisk = startup.stage === 'idea' || startup.stage === 'pre-seed' ? 3 : startup.stage === 'seed' ? 2 : 1;
  const investorRisk = riskMap[investor.riskLevel] || 2;
  if (Math.abs(startupRisk - investorRisk) <= 1) score += 15;
  return Math.min(score, 100);
}

// @GET /api/matching/startup/:startupId/investors - Recommended investors for a startup
router.get('/startup/:startupId/investors', protect, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.startupId);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    const investors = await Investor.find({}).populate('user', 'name avatar trustScore location');
    const scored = investors.map(inv => ({
      investor: inv,
      matchScore: computeMatchScore(startup, inv),
      sectorMatch: inv.sectors.includes(startup.sector),
      stageMatch: inv.preferredStages.includes(startup.stage),
      budgetMatch: startup.fundingRequired >= inv.minInvestment && startup.fundingRequired <= inv.maxInvestment,
    })).filter(m => m.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/matching/investor/startups - Startups for swipe (investor)
router.get('/investor/startups', protect, authorize('investor', 'admin'), async (req, res) => {
  try {
    const investor = await Investor.findOne({ user: req.user._id });
    if (!investor) return res.status(404).json({ message: 'Investor profile not found' });

    // Find already swiped
    const existingMatches = await Match.find({ investor: investor._id });
    const swipedIds = existingMatches.map(m => m.startup.toString());

    const query = { isPublished: true, _id: { $nin: swipedIds } };
    if (investor.sectors.length > 0) query.sector = { $in: investor.sectors };

    const startups = await Startup.find(query)
      .populate('founder', 'name avatar trustScore')
      .limit(50);

    const scored = startups.map(s => ({
      startup: s,
      matchScore: computeMatchScore(s, investor),
    })).sort((a, b) => b.matchScore - a.matchScore);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/matching/swipe - Record swipe action
router.post('/swipe', protect, async (req, res) => {
  try {
    const { startupId, action } = req.body; // action: 'like' | 'dislike'
    const investor = await Investor.findOne({ user: req.user._id });
    if (!investor) return res.status(404).json({ message: 'Investor profile required' });
    const startup = await Startup.findById(startupId);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const matchScore = computeMatchScore(startup, investor);
    let match = await Match.findOne({ startup: startupId, investor: investor._id });
    if (!match) {
      match = new Match({ startup: startupId, investor: investor._id, matchScore,
        sectorMatch: investor.sectors.includes(startup.sector) ? 100 : 0,
        stageMatch: investor.preferredStages.includes(startup.stage) ? 100 : 0,
      });
    }
    match.investorAction = action === 'like' ? 'liked' : 'disliked';
    // Check mutual match
    if (match.startupAction === 'liked' && match.investorAction === 'liked') {
      match.status = 'connected';
      match.chatRoomId = `chat_${startupId}_${investor._id}_${Date.now()}`;
    }
    await match.save();
    res.json({ match, isMatch: match.status === 'connected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/matching/startup-like - Startup likes an investor
router.post('/startup-like', protect, authorize('founder', 'admin'), async (req, res) => {
  try {
    const { investorId, startupId, action } = req.body;
    const investor = await Investor.findById(investorId);
    const startup = await Startup.findById(startupId);
    if (!investor || !startup) return res.status(404).json({ message: 'Not found' });

    const matchScore = computeMatchScore(startup, investor);
    let match = await Match.findOne({ startup: startupId, investor: investorId });
    if (!match) {
      match = new Match({ startup: startupId, investor: investorId, matchScore });
    }
    match.startupAction = action === 'like' ? 'liked' : 'disliked';
    if (match.startupAction === 'liked' && match.investorAction === 'liked') {
      match.status = 'connected';
      match.chatRoomId = `chat_${startupId}_${investorId}_${Date.now()}`;
    }
    await match.save();
    res.json({ match, isMatch: match.status === 'connected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/matching/my-matches - Get all matches for current user
router.get('/my-matches', protect, async (req, res) => {
  try {
    let matches;
    if (req.user.role === 'investor') {
      const investor = await Investor.findOne({ user: req.user._id });
      matches = await Match.find({ investor: investor._id, status: { $in: ['connected', 'deal'] } })
        .populate({ path: 'startup', populate: { path: 'founder', select: 'name avatar' } });
    } else {
      const startups = await Startup.find({ founder: req.user._id });
      const startupIds = startups.map(s => s._id);
      matches = await Match.find({ startup: { $in: startupIds }, status: { $in: ['connected', 'deal'] } })
        .populate({ path: 'investor', populate: { path: 'user', select: 'name avatar' } });
    }
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/matching/cofounders/:startupId - Co-founder matching
router.get('/cofounders/:startupId', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.startupId).populate('founder', 'name bio');
    // Find users looking for co-founder opportunities in same sector
    const candidates = await Startup.find({
      sector: startup.sector,
      _id: { $ne: startup._id },
      isPublished: true
    }).populate('founder', 'name avatar bio location trustScore').limit(10);
    res.json(candidates.map(c => ({ founder: c.founder, startup: c, compatibilityScore: Math.floor(Math.random() * 30) + 60 })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
