const express = require('express');
const router = express.Router();
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const Match = require('../models/Match');

// @GET /api/analytics/sectors - Sector analytics
router.get('/sectors', async (req, res) => {
  try {
    const sectorStats = await Startup.aggregate([
      { $match: { isPublished: true } },
      { $group: {
        _id: '$sector',
        totalStartups: { $sum: 1 },
        avgFunding: { $avg: '$fundingRequired' },
        avgAiScore: { $avg: '$aiScore' },
        avgTeamSize: { $avg: '$teamSize' },
        totalFunding: { $sum: '$fundingRequired' },
        stages: { $push: '$stage' }
      }},
      { $sort: { totalStartups: -1 } }
    ]);

    // Enrich with competition density
    const enriched = sectorStats.map(s => ({
      ...s,
      competitionDensity: s.totalStartups > 20 ? 'high' : s.totalStartups > 10 ? 'medium' : 'low',
      successProbability: Math.round(s.avgAiScore || 50),
      avgFundingFormatted: `$${((s.avgFunding || 0) / 1000).toFixed(0)}K`
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/analytics/overview - Platform overview stats
router.get('/overview', async (req, res) => {
  try {
    const [totalStartups, totalInvestors, totalMatches, avgAiScore] = await Promise.all([
      Startup.countDocuments({ isPublished: true }),
      Investor.countDocuments(),
      Match.countDocuments({ status: 'connected' }),
      Startup.aggregate([{ $group: { _id: null, avg: { $avg: '$aiScore' } } }])
    ]);
    const topSectors = await Startup.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$sector', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const stageDistribution = await Startup.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);
    res.json({
      totalStartups, totalInvestors, totalMatches,
      avgSuccessScore: Math.round(avgAiScore[0]?.avg || 50),
      topSectors, stageDistribution
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/analytics/sector/:sector - Detailed sector analytics
router.get('/sector/:sector', async (req, res) => {
  try {
    const { sector } = req.params;
    const startups = await Startup.find({ sector, isPublished: true })
      .select('name aiScore trustScore fundingRequired teamSize stage createdAt')
      .sort({ aiScore: -1 });

    const stats = {
      sector,
      totalStartups: startups.length,
      avgFunding: startups.reduce((a, s) => a + s.fundingRequired, 0) / (startups.length || 1),
      avgAiScore: startups.reduce((a, s) => a + s.aiScore, 0) / (startups.length || 1),
      avgTeamSize: startups.reduce((a, s) => a + s.teamSize, 0) / (startups.length || 1),
      competitionDensity: startups.length > 20 ? 'high' : startups.length > 10 ? 'medium' : 'low',
      topStartups: startups.slice(0, 5),
      fundingDistribution: startups.reduce((acc, s) => {
        const range = s.fundingRequired < 100000 ? '<100K' : s.fundingRequired < 500000 ? '100K-500K' : s.fundingRequired < 1000000 ? '500K-1M' : '>1M';
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {})
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/analytics/simulation - Simulation mode
router.get('/simulation', async (req, res) => {
  try {
    const { fundingRequired = 500000, teamSize = 5, sector = 'saas', stage = 'seed', experience = 3 } = req.query;
    // Simulate probability based on factors
    let score = 40;
    if (Number(fundingRequired) < 500000) score += 10;
    if (Number(teamSize) >= 3 && Number(teamSize) <= 10) score += 15;
    if (['saas','fintech','healthtech','ai-ml'].includes(sector)) score += 10;
    if (['seed','series-a'].includes(stage)) score += 10;
    if (Number(experience) >= 5) score += 15;
    const successProbability = Math.min(score, 95);
    const scenarios = [
      { name: 'Conservative', successRate: successProbability - 10, fundingTime: '12-18 months', valuation: Number(fundingRequired) * 5 },
      { name: 'Base Case', successRate: successProbability, fundingTime: '6-12 months', valuation: Number(fundingRequired) * 8 },
      { name: 'Optimistic', successRate: successProbability + 10, fundingTime: '3-6 months', valuation: Number(fundingRequired) * 15 },
    ];
    res.json({ scenarios, inputs: { fundingRequired, teamSize, sector, stage, experience } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
