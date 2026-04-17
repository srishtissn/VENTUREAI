import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { path: '/match', label: 'Match', icon: '🎯' },
  { path: '/compare', label: 'Compare', icon: '⚖️' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  { path: '/genai', label: 'GenAI', icon: '🤖' },
  { path: '/learn', label: 'Learn', icon: '🧠' },
  { path: '/simulation', label: 'Simulate', icon: '🔮' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120 }}
      style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, padding:'10px 24px',
        background:'rgba(10,10,15,0.9)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(108,99,255,0.15)' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6c63ff,#00d4aa)',
            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', color:'white', fontSize:15 }}>V</div>
          <span style={{ fontFamily:'Clash Display,sans-serif', fontWeight:700, fontSize:18,
            background:'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            VentureAI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display:'flex', alignItems:'center', gap:2 }}>
          {navLinks.map(({ path, label, icon }) => (
            <Link key={path} to={path}
              style={{ padding:'7px 12px', borderRadius:10, fontSize:13, fontWeight:500, textDecoration:'none',
                display:'flex', alignItems:'center', gap:5, transition:'all 0.2s',
                background: location.pathname === path ? 'rgba(108,99,255,0.2)' : 'transparent',
                color: location.pathname === path ? '#a78bfa' : '#8888aa' }}>
              <span style={{ fontSize:14 }}>{icon}</span>{label}
            </Link>
          ))}
          {user?.role === 'founder' && (
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => navigate('/submit-startup')}
              style={{ marginLeft:8, padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:700,
                color:'white', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#6c63ff,#4f46e5)' }}>
              + Startup
            </motion.button>
          )}
        </div>

        {/* Profile dropdown */}
        <div style={{ position:'relative' }}>
          <button onClick={() => setProfileOpen(!profileOpen)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:12,
              border:'1px solid rgba(108,99,255,0.2)', background:'transparent', cursor:'pointer' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#00d4aa)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'white' }}>{user?.name?.split(' ')[0]}</div>
              <div style={{ fontSize:10, color:'#6c63ff', textTransform:'capitalize' }}>{user?.role}</div>
            </div>
            <span style={{ color:'#8888aa', fontSize:10 }}>{profileOpen ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:8, scale:0.95 }}
                style={{ position:'absolute', right:0, top:'110%', width:200, borderRadius:16,
                  overflow:'hidden', zIndex:100, background:'#1a1a27',
                  border:'1px solid rgba(108,99,255,0.3)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(108,99,255,0.1)' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'white' }}>{user?.name}</div>
                  <div style={{ fontSize:11, color:'#8888aa' }}>{user?.email}</div>
                  <div style={{ fontSize:11, color:'#00d4aa', marginTop:4 }}>Trust: {user?.trustScore || 0}%</div>
                </div>
                {[
                  { to:'/profile', label:'👤 Profile' },
                  { to:'/chat', label:'💬 Messages' },
                  { to:'/genai', label:'🤖 GenAI Studio' }
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                    style={{ display:'block', padding:'10px 16px', fontSize:13, color:'#ccccdd', textDecoration:'none' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(108,99,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    {item.label}
                  </Link>
                ))}
                <button onClick={logout}
                  style={{ width:'100%', padding:'10px 16px', fontSize:13, color:'#ff6b6b',
                    background:'transparent', border:'none', borderTop:'1px solid rgba(108,99,255,0.1)',
                    cursor:'pointer', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,107,107,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  🚪 Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
