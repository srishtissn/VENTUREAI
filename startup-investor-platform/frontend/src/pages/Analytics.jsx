import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from 'recharts';
import { analyticsAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';

const COLORS = ['#6c63ff','#00d4aa','#ff6b6b','#ffd93d','#8b5cf6','#3b82f6','#ec4899','#f59e0b','#10b981','#ef4444'];

export default function Analytics() {
  const [sectors, setSectors] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorDetail, setSectorDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.sectors(), analyticsAPI.overview()])
      .then(([sRes, oRes]) => { setSectors(sRes.data); setOverview(oRes.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSectorClick = async (sector) => {
    setSelectedSector(sector);
    try {
      const res = await analyticsAPI.sectorDetail(sector);
      setSectorDetail(res.data);
    } catch {}
  };

  if (loading) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar/><div style={{ color: '#6c63ff' }}>Loading analytics...</div>
    </div>
  );

  const stageData = overview?.stageDistribution?.map(s => ({ name: s._id, count: s.count })) || [];
  const topSectorData = sectors.slice(0, 8).map(s => ({ name: s._id?.replace('tech','T').replace('fintech','FinT'), startups: s.totalStartups, avgScore: Math.round(s.avgAiScore || 0) }));

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ paddingTop: 80, maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 32, fontWeight: 700, color: 'white' }}>Sector Analytics 📊</h1>
          <p style={{ color: '#8888aa', marginTop: 6 }}>Real-time market intelligence across all startup sectors</p>
        </motion.div>

        {/* Overview cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Startups', value: overview?.totalStartups || 0, icon: '🚀', color: '#6c63ff' },
            { label: 'Active Investors', value: overview?.totalInvestors || 0, icon: '💼', color: '#00d4aa' },
            { label: 'Matches Made', value: overview?.totalMatches || 0, icon: '🤝', color: '#ffd93d' },
            { label: 'Avg Success %', value: `${overview?.avgSuccessScore || 0}%`, icon: '⚡', color: '#ff6b6b' },
            { label: 'Active Sectors', value: sectors.length, icon: '🏭', color: '#8b5cf6' },
          ].map(({ label, value, icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ padding: '20px', borderRadius: 16, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#8888aa', marginTop: 4 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
          {/* Sector bar chart */}
          <div style={{ padding: '24px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
            <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 20 }}>Startups by Sector</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topSectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)"/>
                <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={50}/>
                <YAxis tick={{ fill: '#8888aa', fontSize: 11 }}/>
                <Tooltip contentStyle={{ background: '#1a1a27', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, color: 'white' }}/>
                <Bar dataKey="startups" fill="#6c63ff" radius={[6,6,0,0]} name="Startups"/>
                <Bar dataKey="avgScore" fill="#00d4aa" radius={[6,6,0,0]} name="Avg AI Score"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Stage pie */}
          <div style={{ padding: '24px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
            <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 20 }}>Stage Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stageData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={4}>
                  {stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a27', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, color: 'white' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {stageData.map(({ name, count }, i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }}/>
                  <span style={{ color: '#8888aa', textTransform: 'capitalize' }}>{name} ({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector cards grid */}
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 16 }}>Sector Deep Dive</h2>
        <p style={{ color: '#8888aa', fontSize: 13, marginBottom: 20 }}>Click a sector card for detailed analytics</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
          {sectors.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4, borderColor: COLORS[i % COLORS.length] }}
              onClick={() => handleSectorClick(s._id)}
              style={{ padding: '20px', borderRadius: 18, background: selectedSector === s._id ? `${COLORS[i%COLORS.length]}15` : '#12121a', border: `1px solid ${selectedSector === s._id ? COLORS[i%COLORS.length] : 'rgba(108,99,255,0.15)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, color: 'white', fontSize: 16, textTransform: 'capitalize' }}>{s._id?.replace(/-/g,' ')}</h3>
                <span style={{ fontSize: 20, padding: '4px 10px', borderRadius: 8, background: `${COLORS[i%COLORS.length]}20`, fontWeight: 700, color: COLORS[i%COLORS.length], fontFamily: 'Space Mono' }}>{s.totalStartups}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                <div style={{ padding: '8px', borderRadius: 8, background: '#1a1a27' }}>
                  <div style={{ color: '#8888aa' }}>Avg Funding</div>
                  <div style={{ color: 'white', fontWeight: 600 }}>${((s.avgFunding||0)/1000).toFixed(0)}K</div>
                </div>
                <div style={{ padding: '8px', borderRadius: 8, background: '#1a1a27' }}>
                  <div style={{ color: '#8888aa' }}>Avg AI Score</div>
                  <div style={{ color: COLORS[i%COLORS.length], fontWeight: 600 }}>{Math.round(s.avgAiScore||0)}%</div>
                </div>
                <div style={{ padding: '8px', borderRadius: 8, background: '#1a1a27' }}>
                  <div style={{ color: '#8888aa' }}>Competition</div>
                  <div style={{ color: s.competitionDensity==='low'?'#00d4aa':s.competitionDensity==='medium'?'#ffd93d':'#ff6b6b', fontWeight: 600, textTransform: 'capitalize' }}>{s.competitionDensity}</div>
                </div>
                <div style={{ padding: '8px', borderRadius: 8, background: '#1a1a27' }}>
                  <div style={{ color: '#8888aa' }}>Success Prob</div>
                  <div style={{ color: '#a78bfa', fontWeight: 600 }}>{s.successProbability||0}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sector detail panel */}
        {sectorDetail && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.25)' }}>
            <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4, textTransform: 'capitalize' }}>{sectorDetail.sector} — Detailed View</h3>
            <p style={{ color: '#8888aa', fontSize: 14, marginBottom: 24 }}>{sectorDetail.totalStartups} startups · {sectorDetail.competitionDensity} competition density</p>
            {sectorDetail.topStartups?.length > 0 && (
              <div>
                <h4 style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>Top Startups in this Sector</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sectorDetail.topStartups.map((s, i) => (
                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#1a1a27' }}>
                      <span style={{ fontFamily: 'Space Mono', color: '#6c63ff', fontWeight: 700, fontSize: 14, width: 24 }}>#{i+1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#8888aa' }}>AI Score: {Math.round(s.aiScore)}% · ${(s.fundingRequired/1000).toFixed(0)}K</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
