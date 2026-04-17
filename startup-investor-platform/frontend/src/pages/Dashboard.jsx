import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startupAPI, investorAPI, analyticsAPI, matchAPI, chatAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import StatCard from '../components/ui/StatCard';
import ScoreRing from '../components/ui/ScoreRing';
import SectorBadge from '../components/ui/SectorBadge';
import toast from 'react-hot-toast';

// ─── Startup Profile Modal ───────────────────────────────────────────────────
function StartupModal({ startup, onClose, onMessage }) {
  if (!startup) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
          style={{ background: '#12121a', borderRadius: 24, border: '1px solid rgba(108,99,255,0.3)',
            width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
          {/* Header */}
          <div style={{ padding: '28px 28px 20px',
            background: 'linear-gradient(135deg,rgba(108,99,255,0.18),rgba(0,212,170,0.08))',
            borderBottom: '1px solid rgba(108,99,255,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 26, fontWeight: 700,
                  color: 'white', marginBottom: 8 }}>{startup.name}</h2>
                <SectorBadge sector={startup.sector}/>
                {startup.stage && (
                  <span style={{ marginLeft: 8, padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(255,211,93,0.15)', color: '#ffd93d', fontSize: 11, fontWeight: 600 }}>
                    {startup.stage}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <ScoreRing score={Math.round(startup.aiScore || 0)} size={72} color="#6c63ff"/>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)',
                  border: 'none', color: '#8888aa', borderRadius: '50%', width: 32, height: 32,
                  cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>
            {startup.tagline && (
              <p style={{ marginTop: 12, color: '#a78bfa', fontStyle: 'italic', fontSize: 14 }}>
                "{startup.tagline}"
              </p>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px' }}>
            <p style={{ color: '#ccccdd', lineHeight: 1.7, marginBottom: 24, fontSize: 14 }}>
              {startup.description}
            </p>

            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Funding Ask', value: `$${(startup.fundingRequired/1000).toFixed(0)}K`, icon: '💰' },
                { label: 'Team Size', value: `${startup.teamSize} people`, icon: '👥' },
                { label: 'Trust Score', value: `${startup.trustScore || 0}%`, icon: '⭐' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 14,
                  background: '#1a1a27', border: '1px solid rgba(108,99,255,0.1)' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>{value}</div>
                  <div style={{ fontSize: 11, color: '#8888aa', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Competition + AI score */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#1a1a27',
                border: '1px solid rgba(108,99,255,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 4 }}>Competition Level</div>
                <div style={{ fontWeight: 700, fontSize: 14,
                  color: startup.competitionLevel === 'low' ? '#00d4aa' :
                         startup.competitionLevel === 'medium' ? '#ffd93d' : '#ff6b6b' }}>
                  {startup.competitionLevel === 'low' ? '🟢 Low' :
                   startup.competitionLevel === 'medium' ? '🟡 Medium' : '🔴 High'}
                </div>
              </div>
              <div style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#1a1a27',
                border: '1px solid rgba(108,99,255,0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 4 }}>AI Success Score</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#6c63ff' }}>
                  {Math.round(startup.aiScore || 0)}%
                </div>
              </div>
            </div>

            {/* Founder info */}
            {startup.founder && (
              <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(108,99,255,0.08)',
                border: '1px solid rgba(108,99,255,0.15)', marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 8 }}>FOUNDER</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6c63ff,#00d4aa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {startup.founder.name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{startup.founder.name}</div>
                    <div style={{ fontSize: 12, color: '#00d4aa' }}>⭐ {startup.founder.trustScore || 0}% trust</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => onMessage(startup)}
                style={{ flex: 1, padding: '13px', borderRadius: 14,
                  background: 'linear-gradient(135deg,#6c63ff,#4f46e5)',
                  color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                💬 Message Founder
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{ padding: '13px 20px', borderRadius: 14,
                  background: 'rgba(108,99,255,0.1)', color: '#a78bfa',
                  border: '1px solid rgba(108,99,255,0.25)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Investor Profile Modal ───────────────────────────────────────────────────
function InvestorModal({ investor, onClose, onMessage }) {
  if (!investor) return null;
  const inv = investor;
  const u = investor.user || {};
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
          style={{ background: '#12121a', borderRadius: 24, border: '1px solid rgba(0,212,170,0.3)',
            width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
          {/* Header */}
          <div style={{ padding: '28px 28px 20px',
            background: 'linear-gradient(135deg,rgba(0,212,170,0.12),rgba(108,99,255,0.08))',
            borderBottom: '1px solid rgba(0,212,170,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 24, fontWeight: 700,
                  color: 'white', marginBottom: 6 }}>{u.name || 'Investor'}</h2>
                <div style={{ fontSize: 13, color: '#00d4aa', fontWeight: 600 }}>
                  {inv.firmName || 'Independent Investor'}
                </div>
                <div style={{ fontSize: 12, color: '#8888aa', marginTop: 4 }}>
                  {inv.investorType || 'Angel Investor'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#00d4aa' }}>{inv.trustScore || 0}%</div>
                  <div style={{ fontSize: 10, color: '#8888aa' }}>Trust Score</div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)',
                  border: 'none', color: '#8888aa', borderRadius: '50%', width: 32, height: 32,
                  cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px 28px' }}>
            {/* Investment range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: '14px', borderRadius: 14, background: '#1a1a27',
                border: '1px solid rgba(0,212,170,0.12)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 4 }}>Min Investment</div>
                <div style={{ fontWeight: 700, color: '#00d4aa', fontSize: 15 }}>
                  ${((inv.minInvestment||0)/1000).toFixed(0)}K
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: 14, background: '#1a1a27',
                border: '1px solid rgba(0,212,170,0.12)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 4 }}>Max Investment</div>
                <div style={{ fontWeight: 700, color: '#00d4aa', fontSize: 15 }}>
                  ${((inv.maxInvestment||0)/1000).toFixed(0)}K
                </div>
              </div>
            </div>

            {/* Risk + accredited */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: inv.riskLevel === 'low' ? 'rgba(0,212,170,0.15)' :
                             inv.riskLevel === 'medium' ? 'rgba(255,211,93,0.15)' : 'rgba(255,107,107,0.15)',
                color: inv.riskLevel === 'low' ? '#00d4aa' :
                       inv.riskLevel === 'medium' ? '#ffd93d' : '#ff6b6b' }}>
                Risk: {inv.riskLevel || 'medium'}
              </span>
              {inv.isAccredited && (
                <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: 'rgba(108,99,255,0.15)', color: '#a78bfa' }}>✓ Accredited</span>
              )}
            </div>

            {/* Sectors */}
            {inv.sectors?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 8 }}>INTERESTED SECTORS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {inv.sectors.map(s => (
                    <span key={s} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12,
                      background: 'rgba(108,99,255,0.15)', color: '#a78bfa', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Thesis */}
            {inv.investmentThesis && (
              <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(0,212,170,0.06)',
                border: '1px solid rgba(0,212,170,0.15)', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 6 }}>INVESTMENT THESIS</div>
                <p style={{ color: '#ccccdd', fontSize: 13, lineHeight: 1.6 }}>{inv.investmentThesis}</p>
              </div>
            )}

            {/* Message button */}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onMessage(investor)}
              style={{ width: '100%', padding: '13px', borderRadius: 14,
                background: 'linear-gradient(135deg,#00d4aa,#059669)',
                color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              💬 Message Investor
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Startup Card ─────────────────────────────────────────────────────────────
function StartupCard({ startup, onSelect, selected, onViewProfile }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      style={{ padding: '20px', borderRadius: 18, background: '#1a1a27',
        border: `1px solid ${selected ? '#6c63ff' : 'rgba(108,99,255,0.15)'}`,
        transition: 'all 0.2s', position: 'relative' }}>
      {selected && (
        <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20,
          borderRadius: '50%', background: '#6c63ff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 11, color: 'white' }}>✓</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: 16, marginBottom: 4 }}>{startup.name}</div>
          <SectorBadge sector={startup.sector}/>
        </div>
        <ScoreRing score={Math.round(startup.aiScore || 0)} size={56} label="" color="#6c63ff"/>
      </div>
      <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 12, lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {startup.description}
      </p>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8888aa', marginBottom: 14 }}>
        <span>💰 ${(startup.fundingRequired/1000).toFixed(0)}K</span>
        <span>👥 {startup.teamSize} team</span>
        <span style={{ color: startup.competitionLevel === 'low' ? '#00d4aa' :
          startup.competitionLevel === 'medium' ? '#ffd93d' : '#ff6b6b' }}>
          {startup.competitionLevel === 'low' ? '🟢' : startup.competitionLevel === 'medium' ? '🟡' : '🔴'} {startup.competitionLevel}
        </span>
      </div>
      {/* Action row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => onViewProfile(startup)}
          style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: 'rgba(108,99,255,0.15)', color: '#a78bfa',
            border: '1px solid rgba(108,99,255,0.25)', cursor: 'pointer' }}>
          👁 View Profile
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(startup._id)}
          style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            background: selected ? 'rgba(108,99,255,0.3)' : 'rgba(108,99,255,0.08)',
            color: selected ? '#6c63ff' : '#8888aa',
            border: `1px solid ${selected ? '#6c63ff' : 'rgba(108,99,255,0.15)'}`, cursor: 'pointer' }}>
          ⚖️ Compare
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Investor Card ────────────────────────────────────────────────────────────
function InvestorCard({ investor, onViewProfile }) {
  const u = investor.user || {};
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      style={{ padding: '20px', borderRadius: 18, background: '#1a1a27',
        border: '1px solid rgba(0,212,170,0.15)', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00d4aa,#059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>
          {u.name?.[0]?.toUpperCase() || 'I'}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>{u.name || 'Investor'}</div>
          <div style={{ fontSize: 12, color: '#00d4aa' }}>{investor.firmName || 'Angel Investor'}</div>
          <div style={{ fontSize: 11, color: '#8888aa' }}>{investor.investorType || 'Investor'}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#00d4aa' }}>{investor.trustScore || 0}%</div>
          <div style={{ fontSize: 10, color: '#8888aa' }}>Trust</div>
        </div>
      </div>

      {/* Budget range */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#8888aa' }}>
          💰 ${((investor.minInvestment||0)/1000).toFixed(0)}K – ${((investor.maxInvestment||0)/1000).toFixed(0)}K
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600,
          color: investor.riskLevel === 'low' ? '#00d4aa' :
                 investor.riskLevel === 'medium' ? '#ffd93d' : '#ff6b6b' }}>
          {investor.riskLevel || 'medium'} risk
        </span>
      </div>

      {/* Sectors */}
      {investor.sectors?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {investor.sectors.slice(0, 3).map(s => (
            <span key={s} style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11,
              background: 'rgba(108,99,255,0.15)', color: '#a78bfa' }}>{s}</span>
          ))}
          {investor.sectors.length > 3 && (
            <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11,
              background: 'rgba(108,99,255,0.1)', color: '#8888aa' }}>
              +{investor.sectors.length - 3} more
            </span>
          )}
        </div>
      )}

      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => onViewProfile(investor)}
        style={{ width: '100%', padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: 'rgba(0,212,170,0.12)', color: '#00d4aa',
          border: '1px solid rgba(0,212,170,0.25)', cursor: 'pointer' }}>
        👁 View Profile & Message
      </motion.button>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myStartups, setMyStartups] = useState([]);
  const [overview, setOverview] = useState(null);
  const [recentStartups, setRecentStartups] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  // Search states
  const [startupSearch, setStartupSearch] = useState('');
  const [investorSearch, setInvestorSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, recentsRes] = await Promise.all([
          analyticsAPI.overview(),
          startupAPI.list({ limit: 6, sortBy: 'createdAt' })
        ]);
        setOverview(overviewRes.data);
        setRecentStartups(recentsRes.data.startups || []);

        if (user.role === 'founder') {
          const myRes = await startupAPI.myStartups();
          setMyStartups(myRes.data || []);
          // Founders see investor list
          const invRes = await investorAPI.list({ limit: 12 });
          setInvestors(invRes.data.investors || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user.role]);

  const toggleCompare = (id) => {
    setSelectedForCompare(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) :
      prev.length < 5 ? [...prev, id] : prev
    );
  };

  const handleCompare = () => {
    if (selectedForCompare.length < 2) return toast.error('Select at least 2 startups to compare');
    navigate('/compare', { state: { startupIds: selectedForCompare } });
  };

  // Start a direct message chat
  const handleMessage = async (entity, type) => {
    try {
      // entity is a startup or investor object
      // We need the user ID of the other party
      let otherUserId, otherName;
      if (type === 'startup') {
        otherUserId = entity.founder?._id || entity.founder;
        otherName = entity.founder?.name || entity.name;
      } else {
        otherUserId = entity.user?._id || entity.user;
        otherName = entity.user?.name || entity.firmName || 'Investor';
      }

      if (!otherUserId) {
        toast.error('Cannot start chat — profile incomplete');
        return;
      }

      const roomId = [user._id, otherUserId].sort().join('_');
      await chatAPI.createRoom({
        roomId,
        participantIds: [user._id, otherUserId],
      });
      setSelectedStartup(null);
      setSelectedInvestor(null);
      navigate(`/chat/${roomId}`);
    } catch (e) {
      console.error(e);
      toast.error('Could not open chat');
    }
  };

  // Filter helpers
  const filteredStartups = recentStartups.filter(s =>
    s.name?.toLowerCase().includes(startupSearch.toLowerCase()) ||
    s.sector?.toLowerCase().includes(startupSearch.toLowerCase())
  );
  const filteredInvestors = investors.filter(inv =>
    (inv.user?.name || '').toLowerCase().includes(investorSearch.toLowerCase()) ||
    (inv.firmName || '').toLowerCase().includes(investorSearch.toLowerCase()) ||
    (inv.sectors || []).some(s => s.toLowerCase().includes(investorSearch.toLowerCase()))
  );

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

      {/* Modals */}
      {selectedStartup && (
        <StartupModal
          startup={selectedStartup}
          onClose={() => setSelectedStartup(null)}
          onMessage={(s) => handleMessage(s, 'startup')}
        />
      )}
      {selectedInvestor && (
        <InvestorModal
          investor={selectedInvestor}
          onClose={() => setSelectedInvestor(null)}
          onMessage={(inv) => handleMessage(inv, 'investor')}
        />
      )}

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 24px 40px' }}>
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

        {/* Quick actions — Founder */}
        {user.role === 'founder' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: '+ Submit Startup', path: '/submit-startup', color: 'linear-gradient(135deg,#6c63ff,#4f46e5)', icon: '🚀' },
              { label: 'Find Investors', path: '/match', color: 'linear-gradient(135deg,#00d4aa,#059669)', icon: '🎯' },
              { label: 'Sector Analytics', path: '/analytics', color: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: '📊' },
              { label: 'GenAI Studio', path: '/genai', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', icon: '🤖' },
              { label: 'Simulation', path: '/simulation', color: 'linear-gradient(135deg,#ec4899,#be185d)', icon: '🔮' },
            ].map(({ label, path, color, icon }) => (
              <motion.button key={path} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                style={{ padding: '14px', borderRadius: 14, background: color, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span>{icon}</span>{label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Quick actions — Investor */}
        {user.role === 'investor' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Swipe Startups', path: '/match', color: 'linear-gradient(135deg,#6c63ff,#4f46e5)', icon: '🎯' },
              { label: 'Compare Startups', path: '/compare', color: 'linear-gradient(135deg,#00d4aa,#059669)', icon: '⚖️' },
              { label: 'Analytics', path: '/analytics', color: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: '📊' },
              { label: 'Update Profile', path: '/profile', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', icon: '👤' },
            ].map(({ label, path, color, icon }) => (
              <motion.button key={path} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                style={{ padding: '14px', borderRadius: 14, background: color, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span>{icon}</span>{label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── My Startups (founder) ──────────────────────────────────────────── */}
        {user.role === 'founder' && myStartups.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 700, color: 'white' }}>My Startups</h2>
              {selectedForCompare.length >= 2 && (
                <motion.button whileHover={{ scale: 1.03 }} onClick={handleCompare}
                  style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Compare {selectedForCompare.length} Selected →
                </motion.button>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 16 }}>
              Click "View Profile" to see details • Click "Compare" to select for comparison
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {myStartups.map(s => (
                <StartupCard key={s._id} startup={s}
                  onSelect={toggleCompare}
                  selected={selectedForCompare.includes(s._id)}
                  onViewProfile={setSelectedStartup}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Investors List (founder sees this) ────────────────────────────── */}
        {user.role === 'founder' && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 700, color: 'white' }}>
                💼 Investors on Platform
              </h2>
              <span style={{ fontSize: 13, color: '#8888aa' }}>{filteredInvestors.length} available</span>
            </div>
            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8888aa', fontSize: 14 }}>🔍</span>
              <input
                value={investorSearch}
                onChange={e => setInvestorSearch(e.target.value)}
                placeholder="Search investors by name, firm or sector..."
                style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 12,
                  background: '#1a1a27', border: '1px solid rgba(0,212,170,0.2)',
                  color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor='#00d4aa'}
                onBlur={e => e.target.style.borderColor='rgba(0,212,170,0.2)'}
              />
            </div>
            {filteredInvestors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8888aa' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
                <p>No investors found{investorSearch ? ' matching your search' : ''}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filteredInvestors.map(inv => (
                  <InvestorCard key={inv._id} investor={inv} onViewProfile={setSelectedInvestor}/>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Recent Startups (everyone sees) ───────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 700, color: 'white' }}>
              Recent Startups
            </h2>
            {selectedForCompare.length >= 2 && (
              <motion.button whileHover={{ scale: 1.03 }} onClick={handleCompare}
                style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Compare Selected ({selectedForCompare.length}) →
              </motion.button>
            )}
          </div>

          {/* Search bar for startups */}
          <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8888aa', fontSize: 14 }}>🔍</span>
            <input
              value={startupSearch}
              onChange={e => setStartupSearch(e.target.value)}
              placeholder="Search startups by name or sector..."
              style={{ width: '100%', padding: '11px 14px 11px 38px', borderRadius: 12,
                background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)',
                color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor='#6c63ff'}
              onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredStartups.map(s => (
              <StartupCard key={s._id} startup={s}
                onSelect={toggleCompare}
                selected={selectedForCompare.includes(s._id)}
                onViewProfile={setSelectedStartup}
              />
            ))}
          </div>

          {filteredStartups.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8888aa' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <p style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8 }}>No startups yet</p>
              <p>Be the first to submit your startup!</p>
              {user.role === 'founder' && (
                <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/submit-startup')}
                  style={{ marginTop: 20, padding: '12px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  Submit Your Startup →
                </motion.button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
