import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { chatAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export default function Chat() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(roomId || null);
  const [dealStatus, setDealStatus] = useState('none');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    chatAPI.myRooms().then(r => setRooms(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    // Load history
    chatAPI.getRoom(activeRoom).then(r => { setMessages(r.data?.messages || []); setDealStatus(r.data?.dealStatus || 'none'); }).catch(() => {});
    // Connect socket
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join_room', { roomId: activeRoom, userId: user._id, userName: user.name });
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('user_typing', ({ userName }) => { if (userName !== user.name) setTyping(userName); });
    socket.on('user_stop_typing', () => setTyping(null));
    socket.on('user_joined', ({ message }) => setMessages(prev => [...prev, { id: Date.now(), senderId: 'system', senderName: 'System', message, timestamp: new Date().toISOString(), type: 'system' }]));
    return () => socket.disconnect();
  }, [activeRoom]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!input.trim() || !activeRoom) return;
    socketRef.current?.emit('send_message', { roomId: activeRoom, message: input.trim(), senderId: user._id, senderName: user.name });
    setInput('');
    socketRef.current?.emit('stop_typing', { roomId: activeRoom });
  };

  const handleTyping = (val) => {
    setInput(val);
    socketRef.current?.emit('typing', { roomId: activeRoom, userName: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socketRef.current?.emit('stop_typing', { roomId: activeRoom }), 1500);
  };

  const proposeDeal = async () => {
    await chatAPI.updateDeal(activeRoom, { dealStatus: 'proposed', dealTerms: input || 'Deal proposed' });
    setDealStatus('proposed');
    socketRef.current?.emit('send_message', { roomId: activeRoom, message: '📋 A deal has been proposed. Review the terms.', senderId: user._id, senderName: user.name });
    setInput('');
  };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <div style={{ paddingTop: 64, display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Rooms sidebar */}
        <div style={{ width: 280, background: '#12121a', borderRight: '1px solid rgba(108,99,255,0.15)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: 'white' }}>Messages 💬</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {rooms.length === 0 && (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                <p style={{ color: '#8888aa', fontSize: 13 }}>No conversations yet. Match with startups/investors to start chatting!</p>
              </div>
            )}
            {rooms.map(room => (
              <motion.div key={room.roomId} whileHover={{ x: 2 }} onClick={() => setActiveRoom(room.roomId)}
                style={{ padding: '12px', borderRadius: 12, cursor: 'pointer', marginBottom: 4, background: activeRoom === room.roomId ? 'rgba(108,99,255,0.15)' : 'transparent', border: `1px solid ${activeRoom === room.roomId ? 'rgba(108,99,255,0.4)' : 'transparent'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {room.participants?.find(p => p._id !== user._id)?.name?.[0] || '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {room.participants?.find(p => p._id !== user._id)?.name || 'Chat Room'}
                    </div>
                    <div style={{ fontSize: 11, color: '#8888aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.lastMessage || 'No messages yet'}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeRoom ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 64 }}>💬</div>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, color: 'white' }}>Select a conversation</h2>
              <p style={{ color: '#8888aa' }}>Or match with someone to start chatting</p>
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/match')}
                style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                Find Matches →
              </motion.button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(108,99,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#12121a' }}>
                <div>
                  <h3 style={{ fontWeight: 700, color: 'white', fontSize: 16 }}>Deal Room</h3>
                  <p style={{ fontSize: 12, color: '#8888aa' }}>{activeRoom}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['none','proposed','negotiating','agreed'].includes(dealStatus) && (
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: dealStatus === 'agreed' ? 'rgba(0,212,170,0.2)' : dealStatus === 'proposed' ? 'rgba(255,211,93,0.2)' : 'rgba(108,99,255,0.15)', color: dealStatus === 'agreed' ? '#00d4aa' : dealStatus === 'proposed' ? '#ffd93d' : '#8888aa' }}>
                      {dealStatus === 'none' ? '💬 Chatting' : dealStatus === 'proposed' ? '📋 Deal Proposed' : dealStatus === 'agreed' ? '✅ Deal Agreed' : '🤝 Negotiating'}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user._id;
                    const isSystem = msg.type === 'system' || msg.senderId === 'system';
                    if (isSystem) return (
                      <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 12, color: '#8888aa', padding: '4px 12px', borderRadius: 20, background: 'rgba(108,99,255,0.1)' }}>{msg.message}</span>
                      </motion.div>
                    );
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%' }}>
                          {!isOwn && <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 4, marginLeft: 4 }}>{msg.senderName}</div>}
                          <div style={{ padding: '10px 16px', borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isOwn ? 'linear-gradient(135deg,#6c63ff,#4f46e5)' : '#1a1a27', color: 'white', fontSize: 14, lineHeight: 1.5, border: isOwn ? 'none' : '1px solid rgba(108,99,255,0.15)' }}>
                            {msg.message}
                          </div>
                          <div style={{ fontSize: 10, color: '#666688', marginTop: 3, textAlign: isOwn ? 'right' : 'left', marginLeft: isOwn ? 0 : 4 }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {typing && <div style={{ fontSize: 12, color: '#8888aa', fontStyle: 'italic' }}>{typing} is typing...</div>}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(108,99,255,0.15)', background: '#12121a' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <input value={input} onChange={e => handleTyping(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                    placeholder="Type a message... (Enter to send)"
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 14, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)', color: 'white', fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendMessage}
                    style={{ padding: '12px 20px', borderRadius: 14, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>→</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={proposeDeal}
                    title="Propose a Deal"
                    style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)', cursor: 'pointer', fontSize: 18 }}>📋</motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
