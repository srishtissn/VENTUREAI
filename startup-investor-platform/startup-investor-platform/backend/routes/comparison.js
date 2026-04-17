const express = require('express');
const router = express.Router();
const Startup = require('../models/Startup');

// @POST /api/comparison/startups - Compare multiple startups
router.post('/startups', async (req, res) => {
  try {
    const { startupIds } = req.body;
    if (!startupIds || startupIds.length < 2) return res.status(400).json({ message: 'At least 2 startups required' });
    if (startupIds.length > 5) return res.status(400).json({ message: 'Maximum 5 startups for comparison' });
    const startups = await Startup.find({ _id: { $in: startupIds } })
      .populate('founder', 'name avatar trustScore');
    if (startups.length < 2) return res.status(404).json({ message: 'Startups not found' });

    const comparison = startups.map(s => ({
      _id: s._id,
      name: s.name,
      sector: s.sector,
      stage: s.stage,
      fundingRequired: s.fundingRequired,
      teamSize: s.teamSize,
      aiScore: s.aiScore,
      trustScore: s.trustScore,
      marketSize: s.marketSize || 0,
      revenue: s.revenue || 0,
      founderExperience: s.founderExperience || 0,
      competitionLevel: s.competitionLevel,
      founder: s.founder,
      logo: s.logo,
      tagline: s.tagline,
      metrics: s.metrics || {},
      // Radar chart data (normalized 0-100)
      radarData: {
        funding: Math.min((s.fundingRequired / 5000000) * 100, 100),
        team: Math.min((s.teamSize / 50) * 100, 100),
        aiScore: s.aiScore,
        trust: s.trustScore,
        market: Math.min(((s.marketSize || 0) / 1000000000) * 100, 100),
        experience: Math.min(((s.founderExperience || 0) / 20) * 100, 100),
      }
    }));

    // Rankings
    const rankings = {
      byAiScore: [...comparison].sort((a, b) => b.aiScore - a.aiScore).map(s => s.name),
      byTrustScore: [...comparison].sort((a, b) => b.trustScore - a.trustScore).map(s => s.name),
      byFunding: [...comparison].sort((a, b) => b.fundingRequired - a.fundingRequired).map(s => s.name),
      byTeamSize: [...comparison].sort((a, b) => b.teamSize - a.teamSize).map(s => s.name),
    };

    res.json({ startups: comparison, rankings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
