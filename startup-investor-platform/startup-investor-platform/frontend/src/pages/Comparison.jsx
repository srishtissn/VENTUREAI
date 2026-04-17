import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { comparisonAPI, startupAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import SectorBadge from '../components/ui/SectorBadge';
import ScoreRing from '../components/ui/ScoreRing';
import toast from 'react-hot-toast';

const COLORS = ['#6c63ff','#00d4aa','#ff6b6b','#ffd93d','#8b5cf6'];

export default function Comparison() {
  const location = useLocation();
  const [allStartups, setAllStartups] = useState([]);
  const [selectedIds, setSelectedIds] = useState(location.state?.startupIds || []);
  const [compData, setCompData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    startupAPI.list({ limit: 50 }).then(r => {
      setAllStartups(r.data.startups || []);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (location.state?.startupIds?.length >= 2) handleCompare(location.state.startupIds);
  }, []); // eslint-disable-line

  const handleCompare = async (ids = selectedIds) => {
    if (ids.length < 2) return toast.error('Select at least 2 startups');
    setLoading(true);
    try {
      const res = await comparisonAPI.compare(ids);
      setCompData(res.data);
    } catch (e) { toast.error('Comparison failed'); }
    finally { setLoading(false); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const radarData = compData ? ['AI Score','Trust','Funding','Team','Market','Experience'].map((key, i) => {
    const entry = { metric: key };
    const radarKeys = ['aiScore','trust','funding','team','market','experience'];
    compData.startups.forEach(s => { entry[s.name] = Math.round(s.radarData[radarKeys[i]] || 0); });
    return entry;
  }) : [];

  const barData = compData ? [
    { name: 'AI Score', ...Object.fromEntries(compData.startups.map(s => [s.name, Math.round(s.aiScore)])) },
    { name: 'Trust Score', ...Object.fromEntries(compData.startups.map(s => [s.name, Math.round(s.trustScore)])) },
  ] : [];

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 32, fontWeight: 700, color: 'white' }}>Startup Comparison Engine ⚖️</h1>
          <p style={{ color: '#8888aa', marginTop: 6 }}>Select 2–5 startups to compare side-by-side using AI metrics</p>
        </motion.div>

        {/* Selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Select Startups ({selectedIds.length}/5)</h2>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleCompare()}
              disabled={selectedIds.length < 2 || loading}
              style={{ padding: '10px 24px', borderRadius: 12, background: selectedIds.length >= 2 ? 'linear-gradient(135deg,#6c63ff,#4f46e5)' : '#2a2a3a', color: 'white', border: 'none', cursor: selectedIds.length >= 2 ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
              {loading ? '⏳ Comparing...' : '⚖️ Compare Selected'}
            </motion.button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {fetching ? (
              <p style={{ color: '#8888aa' }}>Loading startups...</p>
            ) : allStartups.map((s, idx) => (
              <motion.div key={s._id} whileHover={{ scale: 1.02 }} onClick={() => toggleSelect(s._id)}
                style={{
                  padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
                  background: selectedIds.includes(s._id) ? 'rgba(108,99,255,0.2)' : '#1a1a27',
                  border: `1px solid ${selectedIds.includes(s._id) ? '#6c63ff' : 'rgba(108,99,255,0.15)'}`,
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s'
                }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14, fontWeight: 700,
                  background: COLORS[idx % COLORS.length] + '30',
                  color: COLORS[idx % COLORS.length]
                }}>
                  {s.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  <SectorBadge sector={s.sector}/>
                </div>
                {selectedIds.includes(s._id) && <span style={{ color: '#6c63ff', fontSize: 16 }}>✓</span>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Results */}
        {compData && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compData.startups.length}, 1fr)`, gap: 16, marginBottom: 32 }}>
              {compData.startups.map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '24px 20px', borderRadius: 20, background: '#12121a', border: `2px solid ${COLORS[i]}40`, textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], margin: '0 auto 12px' }}/>
                  <h3 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>{s.name}</h3>
                  <SectorBadge sector={s.sector}/>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                    <ScoreRing score={Math.round(s.aiScore)} size={64} label="AI" color={COLORS[i]}/>
                    <ScoreRing score={Math.round(s.trustScore)} size={64} label="Trust" color="#00d4aa"/>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8888aa' }}>
                      <span>Funding</span>
                      <span style={{ color: 'white', fontWeight: 600 }}>${(s.fundingRequired / 1000).toFixed(0)}K</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8888aa' }}>
                      <span>Team</span>
                      <span style={{ color: 'white', fontWeight: 600 }}>{s.teamSize}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8888aa' }}>
                      <span>Stage</span>
                      <span style={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>{s.stage}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8888aa' }}>
                      <span>Competition</span>
                      <span style={{
                        color: s.competitionLevel === 'low' ? '#00d4aa' : s.competitionLevel === 'medium' ? '#ffd93d' : '#ff6b6b',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>{s.competitionLevel}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div style={{ padding: '24px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
                <h3 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 20 }}>📡 Radar Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(108,99,255,0.2)"/>
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#8888aa', fontSize: 12 }}/>
                    {compData.startups.map((s, i) => (
                      <Radar key={s.name} name={s.name} dataKey={s.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15}/>
                    ))}
                    <Legend wrapperStyle={{ color: '#8888aa', fontSize: 12 }}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ padding: '24px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
                <h3 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 20 }}>📊 Score Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)"/>
                    <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 12 }}/>
                    <YAxis tick={{ fill: '#8888aa', fontSize: 12 }} domain={[0, 100]}/>
                    <Tooltip contentStyle={{ background: '#1a1a27', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, color: 'white' }}/>
                    <Legend wrapperStyle={{ color: '#8888aa', fontSize: 12 }}/>
                    {compData.startups.map((s, i) => (
                      <Bar key={s.name} dataKey={s.name} fill={COLORS[i]} radius={[6, 6, 0, 0]}/>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rankings */}
            <div style={{ padding: '24px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
              <h3 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 20 }}>🏆 Rankings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {Object.entries(compData.rankings).map(([key, ranking]) => (
                  <div key={key} style={{ padding: '16px', borderRadius: 14, background: '#1a1a27' }}>
                    <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 10, textTransform: 'capitalize' }}>
                      {key.replace('by', '').replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    {ranking.map((name, i) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontFamily: 'Space Mono', fontSize: 12, color: i === 0 ? '#ffd93d' : '#8888aa', fontWeight: 700 }}>#{i + 1}</span>
                        <span style={{ fontSize: 13, color: i === 0 ? 'white' : '#ccccdd', fontWeight: i === 0 ? 700 : 400 }}>{name}</span>
                        {i === 0 && <span>👑</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
