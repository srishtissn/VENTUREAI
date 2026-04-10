const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Rate limiting DISABLED for local dev
// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
// app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/startups', require('./routes/startups'));
app.use('/api/investors', require('./routes/investors'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/comparison', require('./routes/comparison'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/genai', require('./routes/genai'));

// Socket.io
const activeUsers = new Map();
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join_room', ({ roomId, userId, userName }) => {
    socket.join(roomId);
    activeUsers.set(socket.id, { userId, userName, roomId });
    io.to(roomId).emit('user_joined', { userId, userName, message: `${userName} joined the chat` });
  });
  socket.on('send_message', async ({ roomId, message, senderId, senderName }) => {
    const msgData = { id: Date.now(), message, senderId, senderName, timestamp: new Date().toISOString() };
    io.to(roomId).emit('receive_message', msgData);
    try {
      const Chat = require('./models/Chat');
      await Chat.findOneAndUpdate({ roomId }, { $push: { messages: msgData }, $setOnInsert: { roomId } }, { upsert: true, new: true });
    } catch (e) { console.error('Chat save error:', e); }
  });
  socket.on('typing', ({ roomId, userName }) => socket.to(roomId).emit('user_typing', { userName }));
  socket.on('stop_typing', ({ roomId }) => socket.to(roomId).emit('user_stop_typing'));
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) { io.to(user.roomId).emit('user_left', { userName: user.userName }); activeUsers.delete(socket.id); }
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startup_platform')
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });

module.exports = { app, io };
