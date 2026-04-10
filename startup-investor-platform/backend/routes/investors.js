const express = require('express');
const router = express.Router();
const Investor = require('../models/Investor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/investors
router.get('/', async (req, res) => {
  try {
    const { sector, riskLevel, page = 1, limit = 12 } = req.query;
    const query = {};
    if (sector) query.sectors = sector;
    if (riskLevel) query.riskLevel = riskLevel;
    const total = await Investor.countDocuments(query);
    const investors = await Investor.find(query)
      .populate('user', 'name avatar trustScore location bio')
      .sort({ trustScore: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ investors, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/investors/my/profile
router.get('/my/profile', protect, authorize('investor', 'admin'), async (req, res) => {
  try {
    const investor = await Investor.findOne({ user: req.user._id }).populate('user', 'name email avatar trustScore');
    if (!investor) return res.status(404).json({ message: 'Investor profile not found' });
    res.json(investor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/investors/my/profile
router.put('/my/profile', protect, authorize('investor', 'admin'), async (req, res) => {
  try {
    let investor = await Investor.findOne({ user: req.user._id });
    if (!investor) investor = new Investor({ user: req.user._id });
    const fields = ['firmName','investorType','sectors','preferredStages','minInvestment','maxInvestment','totalBudget','riskLevel','geographicPreference','investmentThesis','notableinvestments','linkedinUrl','isAccredited'];
    fields.forEach(f => { if (req.body[f] !== undefined) investor[f] = req.body[f]; });
    // Recalculate trust score
    let trust = 20;
    if (investor.firmName) trust += 10;
    if (investor.investmentThesis) trust += 20;
    if (investor.sectors.length > 0) trust += 15;
    if (investor.isAccredited) trust += 25;
    if (investor.linkedinUrl) trust += 10;
    investor.trustScore = Math.min(trust, 100);
    await investor.save();
    res.json(investor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/investors/:id
router.get('/:id', async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id).populate('user', 'name avatar bio trustScore location');
    if (!investor) return res.status(404).json({ message: 'Not found' });
    res.json(investor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
