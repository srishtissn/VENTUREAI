const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Investor = require('../models/Investor');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });

    // Create investor profile if role is investor
    if (role === 'investor') {
      await Investor.create({ user: user._id, firmName: name });
    }

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      trustScore: user.trustScore, token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.lastSeen = new Date();
    await user.save();
    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      avatar: user.avatar, trustScore: user.trustScore, token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const fields = ['name','bio','location','linkedin','twitter','website','avatar','preferredLanguage'];
    fields.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    user.updateTrustScore();
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, trustScore: user.trustScore, bio: user.bio });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/auth/mental-health
router.post('/mental-health', protect, async (req, res) => {
  try {
    const { mood, note } = req.body;
    const user = await User.findById(req.user._id);
    user.mentalHealthCheckins.push({ mood, note, date: new Date() });
    if (user.mentalHealthCheckins.length > 30) user.mentalHealthCheckins.shift();
    await user.save();
    res.json({ message: 'Check-in saved', checkins: user.mentalHealthCheckins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
