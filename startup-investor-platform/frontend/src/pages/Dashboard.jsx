import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startupAPI, analyticsAPI, matchAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import StatCard from '../components/ui/StatCard';
import ScoreRing from '../components/ui/ScoreRing';
import SectorBadge from '../components/ui/SectorBadge';
import toast from 'react-hot-toast';

function StartupCard({ startup, onSelect, selected }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      onClick={() => onSelect(startup._id)} style={{ padding: '20px', borderRadius: 18, background: '#1a1a27', border: `1px solid ${selected ? '#6c63ff' : 'rgba(108,99,255,0.15)'}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
      {selected && <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white' }}>✓</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: 16, marginBottom: 4 }}>{startup.name}</div>
          <SectorBadge sector={startup.sector}/>
        </div>
        <ScoreRing score={Math.round(startup.aiScore || 0)} size={56} label="" color="#6c63ff"/>
      </div>
      <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{startup.description}</p>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8888aa' }}>
        <span>💰 ${(startup.fundingRequired/1000).toFixed(0)}K</span>
        <span>👥 {startup.teamSize} team</span>
        <span style={{ color: startup.competitionLevel === 'low' ? '#00d4aa' : startup.competitionLevel === 'medium' ? '#ffd93d' : '#ff6b6b' }}>
          {startup.competitionLevel === 'low' ? '🟢' : startup.competitionLevel === 'medium' ? '🟡' : '🔴'} {startup.competitionLevel} competition
        </span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myStartups, setMyStartups] = useState([]);
  const [overview, setOverview] = useState(null);
  const [recentStartups, setRecentStartups] = useState([]);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, recentsRes] = await Promise.all([analyticsAPI.overview(), startupAPI.list({ limit: 6, sortBy: 'createdAt' })]);
        setOverview(overviewRes.data);
        setRecentStartups(recentsRes.data.startups || []);
        if (user.role === 'founder') {
          const myRes = await startupAPI.myStartups();
          setMyStartups(myRes.data || []);
        }
        try {
          const matchRes = await matchAPI.myMatches();
          setMatches(matchRes.data || []);
        } catch {}
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.role]);

  const toggleCompare = (id) => {
    setSelectedForCompare(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev);
  };

  const handleCompare = () => {
    if (selectedForCompare.length < 2) return toast.error('Select at least 2 startups to compare');
    navigate('/compare', { state: { startupIds: selectedForCompare } });
  };

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '2px solid #6c63ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}/>
        <p style={{ color: '#6c63ff', fontFamily: 'Space Mono' }}>Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ paddingTop: 80, maxWidth: 1200, margin: '0 auto', padding: '80px 24px 40px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 32, fontWeight: 700, color: 'white' }}>
            Good day, {user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#8888aa', marginTop: 6 }}>Here's what's happening on VentureAI today.</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon="🚀" label="Total Startups" value={overview?.totalStartups || 0} sub="+12 this week" color="#6c63ff" delay={0}/>
          <StatCard icon="💼" label="Active Investors" value={overview?.totalInvestors || 0} sub="Verified profiles" color="#00d4aa" delay={0.1}/>
          <StatCard icon="🤝" label="Successful Matches" value={overview?.totalMatches || 0} sub="This month" color="#ffd93d" delay={0.2}/>
          <StatCard icon="⚡" label="Avg AI Score" value={`${overview?.avgSuccessScore || 0}%`} sub="Platform average" color="#ff6b6b" delay={0.3}/>
        </div>

        {/* Quick actions for founder */}
        {user.role === 'founder' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: '+ Submit Startup', path: '/submit-startup', color: 'linear-gradient(135deg,#6c63ff,#4f46e5)', icon: '🚀' },
              { label: 'Find Investors', path: '/match', color: 'linear-gradient(135deg,#00d4aa,#059669)', icon: '🎯' },
              { label: 'Sector Analytics', path: '/analytics', color: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: '📊' },
              { label: 'Simulation', path: '/simulation', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', icon: '🔮' },
            ].map(({ label, path, color, icon }) => (
              <motion.button key={path} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                style={{ padding: '16px', borderRadius: 14, background: color, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span>{icon}</span>{label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Quick actions for investor */}
        {user.role === 'investor' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Swipe Startups', path: '/match', color: 'linear-gradient(135deg,#6c63ff,#4f46e5)', icon: '🎯' },
              { label: 'Compare Startups', path: '/compare', color: 'linear-gradient(135deg,#00d4aa,#059669)', icon: '⚖️' },
              { label: 'Analytics', path: '/analytics', color: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: '📊' },
              { label: 'Update Profile', path: '/profile', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', icon: '👤' },
            ].map(({ label, path, color, icon }) => (
              <motion.button key={path} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                style={{ padding: '16px', borderRadius: 14, background: color, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span>{icon}</span>{label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* My Startups (founder) */}
        {user.role === 'founder' && myStartups.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 700, color: 'white' }}>My Startups</h2>
              {selectedForCompare.length >= 2 && (
                <motion.button whileHover={{ scale: 1.03 }} onClick={handleCompare}
                  style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Compare {selectedForCompare.length} Selected →
                </motion.button>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 16 }}>Click startups to select for comparison</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {myStartups.map(s => <StartupCard key={s._id} startup={s} onSelect={toggleCompare} selected={selectedForCompare.includes(s._id)}/>)}
            </div>
          </section>
        )}

        {/* Recent startups */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 700, color: 'white' }}>Recent Startups</h2>
            {selectedForCompare.length >= 2 && (
              <motion.button whileHover={{ scale: 1.03 }} onClick={handleCompare}
                style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Compare Selected ({selectedForCompare.length}) →
              </motion.button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {recentStartups.map(s => <StartupCard key={s._id} startup={s} onSelect={toggleCompare} selected={selectedForCompare.includes(s._id)}/>)}
          </div>
          {recentStartups.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8888aa' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <p style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8 }}>No startups yet</p>
              <p>Be the first to submit your startup!</p>
              {user.role === 'founder' && <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/submit-startup')} style={{ marginTop: 20, padding: '12px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Submit Your Startup →</motion.button>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
