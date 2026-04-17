import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // Listen for messages in any room the user has joined
    socket.on('receive_message', (msg) => {
      if (msg.senderId !== user._id && msg.type !== 'system') {
        const notif = {
          id: Date.now(),
          type: 'message',
          title: `New message from ${msg.senderName}`,
          body: msg.message.slice(0, 60) + (msg.message.length > 60 ? '...' : ''),
          timestamp: new Date().toISOString(),
          read: false,
          roomId: msg.roomId
        };
        setNotifications(prev => [notif, ...prev.slice(0, 19)]);
        setUnreadCount(c => c + 1);
        // Toast notification
        toast((t) => (
          <div onClick={() => toast.dismiss(t.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
              {msg.senderName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{msg.senderName}</div>
              <div style={{ fontSize: 12, color: '#8888aa' }}>{msg.message.slice(0, 50)}</div>
            </div>
          </div>
        ), { duration: 4000, style: { background: '#1a1a27', border: '1px solid rgba(108,99,255,0.3)', color: 'white' } });
      }
    });

    return () => socket.disconnect();
  }, [user]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => { setNotifications([]); setUnreadCount(0); };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
