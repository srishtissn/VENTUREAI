import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { matchAPI, startupAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import ScoreRing from '../components/ui/ScoreRing';
import SectorBadge from '../components/ui/SectorBadge';
import toast from 'react-hot-toast';

function SwipeCard({ item, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  const { user } = useAuth();
  const startup = item.startup || item;

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) onSwipe('like', startup._id);
    else if (info.offset.x < -120) onSwipe('dislike', startup._id);
  };

  return (
    <motion.div drag={isTop ? "x" : false} dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, position: 'absolute', width: '100%', maxWidth: 420, cursor: isTop ? 'grab' : 'default' }}
      onDragEnd={handleDragEnd} whileTap={{ cursor: 'grabbing' }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 12 }}>
      {/* Like/Nope labels */}
      {isTop && (
        <>
          <motion.div style={{ opacity: likeOpacity, position: 'absolute', top: 20, left: 20, zIndex: 10, padding: '8px 20px', borderRadius: 10, border: '3px solid #00d4aa', color: '#00d4aa', fontWeight: 900, fontSize: 22, transform: 'rotate(-15deg)' }}>INVEST ✓</motion.div>
          <motion.div style={{ opacity: nopeOpacity, position: 'absolute', top: 20, right: 20, zIndex: 10, padding: '8px 20px', borderRadius: 10, border: '3px solid #ff6b6b', color: '#ff6b6b', fontWeight: 900, fontSize: 22, transform: 'rotate(15deg)' }}>SKIP ✗</motion.div>
        </>
      )}
      <div style={{ borderRadius: 24, background: '#12121a', border: '1px solid rgba(108,99,255,0.25)', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ padding: '28px 28px 20px', background: 'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(0,212,170,0.08))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 6 }}>{startup.name}</h2>
              <SectorBadge sector={startup.sector}/>
            </div>
            <ScoreRing score={Math.round(startup.aiScore || 0)} size={72} color="#6c63ff"/>
          </div>
          {startup.tagline && <p style={{ fontSize: 14, color: '#a78bfa', fontStyle: 'italic', marginTop: 8 }}>"{startup.tagline}"</p>}
        </div>
        {/* Body */}
        <div style={{ padding: '20px 28px 24px' }}>
          <p style={{ fontSize: 14, color: '#ccccdd', lineHeight: 1.7, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{startup.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Funding Ask', value: `$${(startup.fundingRequired/1000).toFixed(0)}K`, icon: '💰' },
              { label: 'Team Size', value: startup.teamSize || '—', icon: '👥' },
              { label: 'Stage', value: startup.stage || '—', icon: '📍' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 12, background: '#1a1a27' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#8888aa' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 12, color: startup.competitionLevel === 'low' ? '#00d4aa' : startup.competitionLevel === 'medium' ? '#ffd93d' : '#ff6b6b' }}>
                {startup.competitionLevel === 'low' ? '🟢 Low' : startup.competitionLevel === 'medium' ? '🟡 Medium' : '🔴 High'} Competition
              </span>
            </div>
            {item.matchScore && <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>🎯 {Math.round(item.matchScore)}% match</div>}
          </div>
          {startup.founder && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(108,99,255,0.1)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', fontWeight: 700 }}>{startup.founder.name?.[0]}</div>
              <span style={{ fontSize: 13, color: '#8888aa' }}>by <strong style={{ color: '#ccccdd' }}>{startup.founder.name}</strong></span>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: '#00d4aa' }}>⭐ {startup.founder.trustScore || 0}% trust</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SwipeMatch() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ liked: 0, skipped: 0, matches: 0 });

  useEffect(() => { loadStartups(); }, []);

  const loadStartups = async () => {
    setLoading(true);
    try {
      if (user.role === 'investor') {
        const res = await matchAPI.getInvestorStartups();
        setQueue(res.data || []);
      } else {
        const res = await startupAPI.list({ limit: 20 });
        setQueue((res.data.startups || []).map(s => ({ startup: s, matchScore: 0 })));
      }
    } catch (e) { toast.error('Failed to load startups'); }
    finally { setLoading(false); }
  };

  const handleSwipe = async (action, startupId) => {
    setQueue(q => q.slice(1));
    setStats(s => ({ ...s, [action === 'like' ? 'liked' : 'skipped']: s[action === 'like' ? 'liked' : 'skipped'] + 1 }));
    if (action === 'like') {
      try {
        const res = await matchAPI.swipe({ startupId, action: 'like' });
        if (res.data.isMatch) {
          toast.success("🎉 It's a Match! Check your messages.", { duration: 5000 });
          setStats(s => ({ ...s, matches: s.matches + 1 }));
        }
      } catch (e) { console.error(e); }
    }
  };

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar/>
      <div style={{ textAlign: 'center' }}><div style={{ width: 40, height: 40, border: '2px solid #6c63ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}/><p style={{ color: '#6c63ff' }}>Finding your matches...</p></div>
    </div>
  );

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ paddingTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            {user.role === 'investor' ? 'Discover Startups 🎯' : 'Find Investors 💼'}
          </h1>
          <p style={{ color: '#8888aa' }}>Swipe right to invest, left to skip. Drag the card or use buttons below.</p>
        </motion.div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          {[{ label: 'Liked', val: stats.liked, color: '#00d4aa' }, { label: 'Skipped', val: stats.skipped, color: '#ff6b6b' }, { label: 'Matches', val: stats.matches, color: '#6c63ff' }].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 12, color: '#8888aa' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Card stack */}
        <div style={{ position: 'relative', height: 580, width: '100%', maxWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            {queue.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 40px', borderRadius: 24, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)', width: '100%', maxWidth: 420 }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✨</div>
                <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, color: 'white', marginBottom: 12 }}>You've seen them all!</h2>
                <p style={{ color: '#8888aa', marginBottom: 24 }}>Check back later for new startups, or review your matches.</p>
                <motion.button whileHover={{ scale: 1.03 }} onClick={loadStartups} style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>🔄 Reload</motion.button>
              </motion.div>
            ) : (
              queue.slice(0, 2).map((item, i) => (
                <SwipeCard key={item.startup?._id || i} item={item} isTop={i === 0} onSwipe={handleSwipe}/>
              )).reverse()
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        {queue.length > 0 && (
          <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('dislike', queue[0]?.startup?._id)}
              style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,107,107,0.15)', border: '2px solid #ff6b6b', color: '#ff6b6b', cursor: 'pointer', fontSize: 24 }}>✗</motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('like', queue[0]?.startup?._id)}
              style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,212,170,0.15)', border: '2px solid #00d4aa', color: '#00d4aa', cursor: 'pointer', fontSize: 24 }}>✓</motion.button>
          </div>
        )}
      </main>
    </div>
  );
}
