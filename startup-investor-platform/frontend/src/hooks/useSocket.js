import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export default function useSocket(roomId, user) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    if (!roomId || !user) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('join_room', { roomId, userId: user._id, userName: user.name });
    socket.on('receive_message', msg => setMessages(p => [...p, msg]));
    socket.on('user_typing', ({ userName }) => { if (userName !== user.name) setTypingUser(userName); });
    socket.on('user_stop_typing', () => setTypingUser(null));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [roomId, user]);

  const sendMessage = (message) => {
    if (!socketRef.current || !message.trim()) return;
    socketRef.current.emit('send_message', { roomId, message: message.trim(), senderId: user._id, senderName: user.name });
  };

  const emitTyping = () => socketRef.current?.emit('typing', { roomId, userName: user.name });
  const emitStopTyping = () => socketRef.current?.emit('stop_typing', { roomId });

  return { connected, messages, setMessages, typingUser, sendMessage, emitTyping, emitStopTyping };
}
