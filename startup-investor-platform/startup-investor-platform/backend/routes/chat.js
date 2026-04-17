const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

// @GET /api/chat/:roomId - Get chat history
router.get('/:roomId', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ roomId: req.params.roomId }).populate('participants', 'name avatar');
    if (!chat) return res.json({ roomId: req.params.roomId, messages: [] });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/chat/my/rooms - Get all chat rooms for user
router.get('/my/rooms', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .sort({ lastActivity: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/chat/create - Create chat room
router.post('/create', protect, async (req, res) => {
  try {
    const { roomId, participantIds, matchId } = req.body;
    let chat = await Chat.findOne({ roomId });
    if (!chat) {
      chat = await Chat.create({
        roomId, participants: participantIds, matchId,
        messages: [{ id: Date.now(), senderId: 'system', senderName: 'System', message: '🎉 You matched! Start the conversation.', timestamp: new Date(), type: 'system' }],
        lastMessage: 'Chat started', lastActivity: new Date()
      });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/chat/:roomId/deal - Update deal status
router.post('/:roomId/deal', protect, async (req, res) => {
  try {
    const { dealStatus, dealTerms } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { roomId: req.params.roomId },
      { dealStatus, dealTerms, lastActivity: new Date() },
      { new: true }
    );
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
