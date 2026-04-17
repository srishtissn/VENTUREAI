import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startupAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SECTORS = ['fintech','healthtech','edtech','agritech','ecommerce','saas','ai-ml','blockchain','cleantech','cybersecurity','biotech','other'];

function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.8 }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 20, fontWeight: 700, color: 'white', marginTop: 24, marginBottom: 8 }}>{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 24, fontWeight: 700, color: 'white', marginTop: 16, marginBottom: 10 }}>{line.replace('# ', '')}</h1>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, color: '#a78bfa', margin: '10px 0 4px' }}>{line.replace(/\*\*/g, '')}</p>;
        if (line.startsWith('- ')) return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 8 }}><span style={{ color: '#6c63ff', marginTop: 2 }}>•</span><span style={{ color: '#ccccdd', fontSize: 14 }}>{line.replace('- ', '')}</span></div>;
        if (/^\d+\./.test(line)) return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 8 }}><span style={{ color: '#00d4aa', fontWeight: 700, fontSize: 13 }}>{line.split('.')[0]}.</span><span style={{ color: '#ccccdd', fontSize: 14 }}>{line.split('.').slice(1).join('.').trim()}</span></div>;
        if (line.trim() === '') return <div key={i} style={{ height: 6 }}/>;
        return <p key={i} style={{ color: '#ccccdd', fontSize: 14, margin: '4px 0' }}>{line}</p>;
      })}
    </div>
  );
}

function LoadingAI({ message }) {
  const dots = ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷'];
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % dots.length), 100);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ padding: '40px', textAlign: 'center', borderRadius: 20, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)' }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: '#6c63ff', fontFamily: 'monospace' }}>{dots[frame]}</div>
      <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: 16 }}>{message}</p>
      <p style={{ color: '#8888aa', fontSize: 13, marginTop: 8 }}>Gemini AI is thinking...</p>
    </motion.div>
  );
}

export default function GenAI() {
  const { user } = useAuth();
  const [tab, setTab] = useState('pitch');
  const [myStartups, setMyStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sector, setSector] = useState('saas');

  // For pitch analysis without a saved startup
  const [pitchForm, setPitchForm] = useState({
    startupName: '', description: '', sector: 'saas',
    fundingRequired: '', teamSize: '', stage: 'seed'
  });

  useEffect(() => {
    if (user?.role === 'founder') {
      startupAPI.myStartups().then(r => setMyStartups(r.data || [])).catch(() => {});
    } else {
      startupAPI.list({ limit: 20 }).then(r => setMyStartups(r.data.startups || [])).catch(() => {});
    }
  }, [user]);

  const analyzePitch = async () => {
    if (!pitchForm.startupName || !pitchForm.description) return toast.error('Fill in name and description');
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/analyze-pitch', pitchForm);
      setResult({ type: 'pitch', data: res.data.analysis, title: `Pitch Analysis — ${res.data.startupName}` });
      toast.success('✅ AI analysis complete!');
    } catch { toast.error('Analysis failed — check your Gemini API key in backend/.env'); }
    finally { setLoading(false); }
  };

  const generateReport = async () => {
    if (!selectedStartup) return toast.error('Select a startup first');
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/investor-report', { startupId: selectedStartup });
      setResult({ type: 'report', data: res.data.report, title: `Investor Report — ${res.data.startup.name}` });
      toast.success('✅ Investor report generated!');
    } catch { toast.error('Report failed — check your Gemini API key in backend/.env'); }
    finally { setLoading(false); }
  };

  const summarizeProfile = async () => {
    if (!selectedStartup) return toast.error('Select a startup first');
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/summarize-profile', { startupId: selectedStartup });
      setResult({ type: 'summary', data: res.data.summary, title: `Profile Summary — ${res.data.startup.name}` });
      toast.success('✅ Profile summary ready!');
    } catch { toast.error('Summary failed — check your Gemini API key in backend/.env'); }
    finally { setLoading(false); }
  };

  const analyzeMarket = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/market-analysis', { sector });
      setResult({ type: 'market', data: res.data.analysis, title: `Market Analysis — ${sector.toUpperCase()}` });
      toast.success('✅ Market analysis complete!');
    } catch { toast.error('Market analysis failed — check your Gemini API key in backend/.env'); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: 'pitch', label: '🎯 Pitch Analyzer', desc: 'Get AI feedback on your pitch' },
    { id: 'report', label: '📄 Investor Report', desc: 'Generate full investment memo' },
    { id: 'summary', label: '✨ Profile Summary', desc: 'Compelling one-pager' },
    { id: 'market', label: '📊 Market Analysis', desc: 'Sector deep-dive report' },
  ];

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)', color: 'white', fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6, fontWeight: 500 };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4aa', display: 'inline-block' }}/>
            <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>Powered by Google Gemini 1.5 Flash</span>
          </div>
          <h1 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 36, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            GenAI Studio 🤖
          </h1>
          <p style={{ color: '#8888aa', fontSize: 16 }}>AI-powered pitch analysis, investor reports, and market intelligence — free with Gemini</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>

          {/* Sidebar tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tabs.map(t => (
              <motion.button key={t.id} whileHover={{ x: 4 }} onClick={() => { setTab(t.id); setResult(null); }}
                style={{ padding: '16px', borderRadius: 14, border: `1px solid ${tab === t.id ? '#6c63ff' : 'rgba(108,99,255,0.15)'}`, background: tab === t.id ? 'rgba(108,99,255,0.2)' : '#12121a', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: tab === t.id ? '#a78bfa' : 'white', marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: '#8888aa' }}>{t.desc}</div>
              </motion.button>
            ))}

            {/* API key reminder */}
            <div style={{ marginTop: 16, padding: '16px', borderRadius: 14, background: 'rgba(255,211,93,0.08)', border: '1px solid rgba(255,211,93,0.2)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ffd93d', marginBottom: 8 }}>⚠️ Setup Required</div>
              <div style={{ fontSize: 11, color: '#8888aa', lineHeight: 1.6 }}>
                Add to <code style={{ color: '#a78bfa' }}>backend/.env</code>:<br/>
                <code style={{ color: '#00d4aa', fontSize: 10 }}>GEMINI_API_KEY=your_key</code><br/><br/>
                Get free key at:<br/>
                <span style={{ color: '#6c63ff' }}>aistudio.google.com</span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                {/* PITCH ANALYZER */}
                {tab === 'pitch' && (
                  <div style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 20 }}>🎯 AI Pitch Analyzer</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <label style={labelStyle}>Startup Name *</label>
                          <input value={pitchForm.startupName} onChange={e => setPitchForm({...pitchForm, startupName: e.target.value})} placeholder="e.g. NeuroLend" style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                        </div>
                        <div>
                          <label style={labelStyle}>Sector</label>
                          <select value={pitchForm.sector} onChange={e => setPitchForm({...pitchForm, sector: e.target.value})} style={{ ...inputStyle, cursor: 'pointer' }}>
                            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Funding Required ($)</label>
                          <input value={pitchForm.fundingRequired} onChange={e => setPitchForm({...pitchForm, fundingRequired: e.target.value})} placeholder="500000" style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                        </div>
                        <div>
                          <label style={labelStyle}>Team Size</label>
                          <input value={pitchForm.teamSize} onChange={e => setPitchForm({...pitchForm, teamSize: e.target.value})} placeholder="5" style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Pitch Description * <span style={{ color: '#00d4aa', fontSize: 11 }}>(more detail = better AI feedback)</span></label>
                        <textarea value={pitchForm.description} onChange={e => setPitchForm({...pitchForm, description: e.target.value})} rows={6}
                          placeholder="Describe your startup: the problem you solve, your solution, target market, traction, and why you'll win..."
                          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={analyzePitch} disabled={loading}
                        style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                        {loading ? '🤖 Gemini is analyzing...' : '🎯 Analyze My Pitch'}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* INVESTOR REPORT */}
                {tab === 'report' && (
                  <div style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>📄 Investor Report Generator</h2>
                    <p style={{ color: '#8888aa', fontSize: 14, marginBottom: 20 }}>Generate a professional investment memo that VCs actually read</p>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Select Startup</label>
                      <select value={selectedStartup} onChange={e => setSelectedStartup(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">-- Choose a startup --</option>
                        {myStartups.map(s => <option key={s._id} value={s._id}>{s.name} ({s.sector})</option>)}
                      </select>
                    </div>
                    {selectedStartup && (
                      <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', marginBottom: 16, fontSize: 13, color: '#00d4aa' }}>
                        ✅ Gemini will generate a full 8-section investment memo with market analysis, risk assessment, and a final verdict
                      </div>
                    )}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateReport} disabled={loading || !selectedStartup}
                      style={{ padding: '14px', borderRadius: 14, background: selectedStartup ? 'linear-gradient(135deg,#00d4aa,#059669)' : '#2a2a3a', color: 'white', border: 'none', cursor: selectedStartup ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15, width: '100%' }}>
                      {loading ? '📝 Writing report...' : '📄 Generate Investor Report'}
                    </motion.button>
                  </div>
                )}

                {/* PROFILE SUMMARY */}
                {tab === 'summary' && (
                  <div style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>✨ Profile Summarizer</h2>
                    <p style={{ color: '#8888aa', fontSize: 14, marginBottom: 20 }}>Transform your startup data into a compelling investor-ready one-pager</p>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Select Startup</label>
                      <select value={selectedStartup} onChange={e => setSelectedStartup(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">-- Choose a startup --</option>
                        {myStartups.map(s => <option key={s._id} value={s._id}>{s.name} ({s.sector})</option>)}
                      </select>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={summarizeProfile} disabled={loading || !selectedStartup}
                      style={{ padding: '14px', borderRadius: 14, background: selectedStartup ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : '#2a2a3a', color: 'white', border: 'none', cursor: selectedStartup ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15, width: '100%' }}>
                      {loading ? '✨ Creating summary...' : '✨ Generate Profile Summary'}
                    </motion.button>
                  </div>
                )}

                {/* MARKET ANALYSIS */}
                {tab === 'market' && (
                  <div style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)', marginBottom: 24 }}>
                    <h2 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8 }}>📊 Market Intelligence</h2>
                    <p style={{ color: '#8888aa', fontSize: 14, marginBottom: 20 }}>Get a Gemini-powered market analysis for any sector</p>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Select Sector</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {SECTORS.map(s => (
                          <button key={s} onClick={() => setSector(s)}
                            style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${sector === s ? '#ffd93d' : 'rgba(108,99,255,0.2)'}`, background: sector === s ? 'rgba(255,211,93,0.15)' : '#1a1a27', color: sector === s ? '#ffd93d' : '#8888aa', cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
                            {s.replace(/-/g,' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={analyzeMarket} disabled={loading}
                      style={{ padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, width: '100%' }}>
                      {loading ? '📊 Analyzing market...' : `📊 Analyze ${sector.toUpperCase()} Market`}
                    </motion.button>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <LoadingAI message={
                    tab === 'pitch' ? 'Analyzing your pitch like a VC...' :
                    tab === 'report' ? 'Writing your investment memo...' :
                    tab === 'summary' ? 'Crafting your one-pager...' :
                    'Researching the market...'
                  }/>
                )}

                {/* Result */}
                {result && !loading && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(0,212,170,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: 20, fontWeight: 700, color: 'white' }}>{result.title}</h3>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(0,212,170,0.15)', color: '#00d4aa', fontSize: 12, fontWeight: 600 }}>✅ Gemini Generated</span>
                        <button onClick={() => { navigator.clipboard.writeText(result.data); toast.success('Copied!'); }}
                          style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(108,99,255,0.15)', color: '#a78bfa', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '20px', borderRadius: 14, background: '#0a0a0f', border: '1px solid rgba(108,99,255,0.1)' }}>
                      <MarkdownText text={result.data}/>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
