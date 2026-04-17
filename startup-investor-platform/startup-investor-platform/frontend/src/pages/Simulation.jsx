import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyticsAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import toast from 'react-hot-toast';

const SECTORS = ['fintech','healthtech','edtech','saas','ai-ml','blockchain','cleantech','ecommerce'];
const STAGES = ['idea','pre-seed','seed','series-a','series-b'];

export default function Simulation() {
  const [params, setParams] = useState({ fundingRequired: 500000, teamSize: 5, sector: 'saas', stage: 'seed', experience: 3 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }));

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.simulation(params);
      setResult(res.data);
    } catch { toast.error('Simulation failed'); }
    finally { setLoading(false); }
  };

  const growthData = result ? Array.from({ length: 12 }, (_, i) => ({
    month: `M${i+1}`,
    conservative: Math.round(params.fundingRequired * (1 + (result.scenarios[0].successRate/100) * (i/11))),
    base: Math.round(params.fundingRequired * (1 + (result.scenarios[1].successRate/100) * (i/11))),
    optimistic: Math.round(params.fundingRequired * (1 + (result.scenarios[2].successRate/100) * (i/11))),
  })) : [];

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ paddingTop: 80, maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 32, fontWeight: 700, color: 'white' }}>Simulation Mode 🔮</h1>
          <p style={{ color: '#8888aa', marginTop: 6 }}>Model funding scenarios and predict outcomes using ML</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          {/* Controls */}
          <div style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)', height: 'fit-content' }}>
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 24 }}>Configure Scenario</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Sector */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 8, fontWeight: 600 }}>Sector</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {SECTORS.map(s => (
                    <button key={s} onClick={() => set('sector', s)}
                      style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${params.sector===s?'#6c63ff':'rgba(108,99,255,0.2)'}`, background: params.sector===s?'rgba(108,99,255,0.2)':'transparent', color: params.sector===s?'#a78bfa':'#8888aa', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>
                      {s.replace(/-/g,' ')}
                    </button>
                  ))}
                </div>
              </div>
              {/* Stage */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 8, fontWeight: 600 }}>Stage</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {STAGES.map(s => (
                    <button key={s} onClick={() => set('stage', s)}
                      style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${params.stage===s?'#00d4aa':'rgba(108,99,255,0.2)'}`, background: params.stage===s?'rgba(0,212,170,0.15)':'transparent', color: params.stage===s?'#00d4aa':'#8888aa', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sliders */}
              {[
                { key: 'fundingRequired', label: 'Funding Required', min: 50000, max: 5000000, step: 50000, format: v => `$${(v/1000).toFixed(0)}K` },
                { key: 'teamSize', label: 'Team Size', min: 1, max: 50, step: 1, format: v => `${v} people` },
                { key: 'experience', label: 'Founder Experience', min: 0, max: 20, step: 1, format: v => `${v} years` },
              ].map(({ key, label, min, max, step, format }) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, color: '#8888aa', fontWeight: 600 }}>{label}</label>
                    <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700 }}>{format(params[key])}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={params[key]}
                    onChange={e => set(key, Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#6c63ff', cursor: 'pointer' }}/>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666688', marginTop: 4 }}>
                    <span>{format(min)}</span><span>{format(max)}</span>
                  </div>
                </div>
              ))}
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runSimulation} disabled={loading}
                style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, marginTop: 8 }}>
                {loading ? '⏳ Running ML...' : '🔮 Run Simulation'}
              </motion.button>
            </div>
          </div>

          {/* Results */}
          <div>
            <AnimatePresence>
              {!result && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: 64 }}>🔮</div>
                  <p style={{ color: '#8888aa', fontSize: 16 }}>Configure your scenario and run the simulation</p>
                </motion.div>
              )}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)', flexDirection: 'column', gap: 16 }}>
                  <div style={{ width: 48, height: 48, border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}/>
                  <p style={{ color: '#a78bfa', fontWeight: 600 }}>Running ML models...</p>
                  <p style={{ color: '#8888aa', fontSize: 13 }}>Random Forest + Scenario analysis</p>
                </motion.div>
              )}
              {result && !loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Scenario cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    {result.scenarios.map((s, i) => (
                      <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        style={{ padding: '20px', borderRadius: 18, background: '#12121a', border: `1px solid ${['rgba(108,99,255,0.2)','rgba(0,212,170,0.3)','rgba(255,107,107,0.2)'][i]}`, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>{'📉📈📊'[i]}</div>
                        <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 12 }}>{s.name}</h3>
                        <div style={{ fontFamily: 'Space Mono', fontSize: 32, fontWeight: 700, color: ['#a78bfa','#00d4aa','#ff6b6b'][i], marginBottom: 8 }}>{s.successRate}%</div>
                        <div style={{ fontSize: 12, color: '#8888aa' }}>Success Rate</div>
                        <div style={{ marginTop: 12, padding: '8px', borderRadius: 10, background: '#1a1a27', fontSize: 12 }}>
                          <div style={{ color: '#8888aa' }}>Funding Time</div>
                          <div style={{ color: 'white', fontWeight: 600 }}>{s.fundingTime}</div>
                        </div>
                        <div style={{ marginTop: 8, padding: '8px', borderRadius: 10, background: '#1a1a27', fontSize: 12 }}>
                          <div style={{ color: '#8888aa' }}>Est. Valuation</div>
                          <div style={{ color: 'white', fontWeight: 600 }}>${(s.valuation/1000000).toFixed(1)}M</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Growth chart */}
                  <div style={{ padding: '24px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
                    <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 20 }}>12-Month Value Projection</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={growthData}>
                        <defs>
                          {['conservative','base','optimistic'].map((key, i) => (
                            <linearGradient key={key} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={['#a78bfa','#00d4aa','#ff6b6b'][i]} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={['#a78bfa','#00d4aa','#ff6b6b'][i]} stopOpacity={0}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)"/>
                        <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 11 }}/>
                        <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`}/>
                        <Tooltip contentStyle={{ background: '#1a1a27', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, color: 'white' }} formatter={v => `$${(v/1000).toFixed(0)}K`}/>
                        {['conservative','base','optimistic'].map((key, i) => (
                          <Area key={key} type="monotone" dataKey={key} stroke={['#a78bfa','#00d4aa','#ff6b6b'][i]} fill={`url(#grad${i})`} strokeWidth={2} name={result.scenarios[i]?.name}/>
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
