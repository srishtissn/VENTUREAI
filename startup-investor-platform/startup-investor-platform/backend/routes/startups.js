const express = require('express');
const router = express.Router();
const axios = require('axios');
const Startup = require('../models/Startup');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @GET /api/startups - List all published startups
router.get('/', async (req, res) => {
  try {
    const { sector, stage, page = 1, limit = 12, search, sortBy = 'aiScore' } = req.query;
    const query = { isPublished: true };
    if (sector) query.sector = sector;
    if (stage) query.stage = stage;
    if (search) query.$text = { $search: search };

    const total = await Startup.countDocuments(query);
    const startups = await Startup.find(query)
      .populate('founder', 'name avatar trustScore')
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ startups, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/startups - Create startup
router.post('/', protect, authorize('founder', 'admin'), async (req, res) => {
  try {
    const data = { ...req.body, founder: req.user._id };
    const startup = new Startup(data);

    // Call ML service for AI score + competition detection + embedding
    try {
      const mlRes = await axios.post(`${ML_URL}/analyze-startup`, {
        description: startup.description,
        sector: startup.sector,
        funding: startup.fundingRequired,
        teamSize: startup.teamSize,
        experience: startup.founderExperience || 3,
        marketSize: startup.marketSize || 1000000,
        stage: startup.stage
      }, { timeout: 15000 });

      startup.aiScore = mlRes.data.success_score || 50;
      startup.nlpEmbedding = mlRes.data.embedding || [];
      startup.competitorIds = mlRes.data.competitor_ids || [];
      startup.competitionLevel = mlRes.data.competition_level || 'low';
      startup.similarStartupsCount = mlRes.data.similar_count || 0;
    } catch (mlErr) {
      console.log('ML service unavailable, using defaults:', mlErr.message);
      startup.aiScore = Math.floor(Math.random() * 30) + 50;
    }

    // Trust score from founder
    const founder = await User.findById(req.user._id);
    startup.trustScore = founder.trustScore;
    startup.isPublished = true;

    await startup.save();
    res.status(201).json(startup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/startups/:id
router.get('/:id', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id)
      .populate('founder', 'name avatar bio trustScore linkedin')
      .populate('competitorIds', 'name sector aiScore fundingRequired');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    startup.viewCount += 1;
    await startup.save();
    res.json(startup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/startups/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Not found' });
    if (startup.founder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(startup, req.body);
    await startup.save();
    res.json(startup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/startups/:id/analyze-video
router.post('/:id/analyze-video', protect, async (req, res) => {
  try {
    const { videoUrl, transcript } = req.body;
    const mlRes = await axios.post(`${ML_URL}/analyze-pitch`, { videoUrl, transcript }, { timeout: 30000 });
    const startup = await Startup.findById(req.params.id);
    startup.pitchDeckAnalysis = mlRes.data;
    startup.videoPitchUrl = videoUrl || startup.videoPitchUrl;
    await startup.save();
    res.json(mlRes.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/startups/:id/competition
router.get('/:id/competition', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id).populate('competitorIds', 'name sector aiScore fundingRequired description');
    res.json({
      competitionLevel: startup.competitionLevel,
      similarCount: startup.similarStartupsCount,
      competitors: startup.competitorIds
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/startups/my/startups
router.get('/my/startups', protect, async (req, res) => {
  try {
    const startups = await Startup.find({ founder: req.user._id }).sort({ createdAt: -1 });
    res.json(startups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
