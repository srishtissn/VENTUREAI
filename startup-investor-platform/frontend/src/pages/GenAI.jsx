import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startupAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import ScoreRing from '../components/ui/ScoreRing';
import SectorBadge from '../components/ui/SectorBadge';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SECTORS = ['fintech','healthtech','edtech','agritech','ecommerce','saas','ai-ml','blockchain','cleantech','cybersecurity','biotech','other'];
const STAGES = ['idea','pre-seed','seed','series-a','series-b','growth'];

function MarkdownText({ text }) {
  if (!text) return null;
  return (
    <div style={{ lineHeight:1.8 }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily:'Clash Display,sans-serif', fontSize:18, fontWeight:700, color:'white', marginTop:20, marginBottom:6 }}>{line.replace('## ','')}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} style={{ fontFamily:'Clash Display,sans-serif', fontSize:22, fontWeight:700, color:'white', marginTop:14, marginBottom:8 }}>{line.replace('# ','')}</h1>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight:700, color:'#a78bfa', margin:'8px 0 3px' }}>{line.replace(/\*\*/g,'')}</p>;
        if (line.startsWith('- ')) return <div key={i} style={{ display:'flex', gap:8, marginBottom:5, paddingLeft:8 }}><span style={{ color:'#6c63ff', marginTop:2 }}>•</span><span style={{ color:'#ccccdd', fontSize:14 }}>{line.replace('- ','')}</span></div>;
        if (/^\d+\./.test(line)) return <div key={i} style={{ display:'flex', gap:8, marginBottom:5, paddingLeft:8 }}><span style={{ color:'#00d4aa', fontWeight:700, fontSize:13 }}>{line.split('.')[0]}.</span><span style={{ color:'#ccccdd', fontSize:14 }}>{line.split('.').slice(1).join('.').trim()}</span></div>;
        if (line.trim()==='') return <div key={i} style={{ height:5 }}/>;
        return <p key={i} style={{ color:'#ccccdd', fontSize:14, margin:'3px 0' }}>{line}</p>;
      })}
    </div>
  );
}

function LoadingAI({ message }) {
  const dots = ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷'];
  const [f, setF] = useState(0);
  useEffect(() => { const t = setInterval(() => setF(x => (x+1)%dots.length), 100); return () => clearInterval(t); }, []);
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ padding:'36px', textAlign:'center', borderRadius:20, background:'rgba(108,99,255,0.08)', border:'1px solid rgba(108,99,255,0.25)' }}>
      <div style={{ fontSize:44, marginBottom:14, color:'#6c63ff', fontFamily:'monospace' }}>{dots[f]}</div>
      <p style={{ color:'#a78bfa', fontWeight:600, fontSize:15 }}>{message}</p>
      <p style={{ color:'#8888aa', fontSize:12, marginTop:6 }}>Groq LLaMA 3 + RAG is thinking...</p>
    </motion.div>
  );
}

// ─── Startup Card for Investor GenAI ─────────────────────────────────────────
function StartupPickCard({ startup, selected, onSelect }) {
  return (
    <motion.div whileHover={{ scale:1.02 }} onClick={() => onSelect(startup)}
      style={{ padding:'14px', borderRadius:16, background:selected?'rgba(108,99,255,0.2)':'#1a1a27', border:`1px solid ${selected?'#6c63ff':'rgba(108,99,255,0.15)'}`, cursor:'pointer', transition:'all 0.2s', position:'relative' }}>
      {selected && <div style={{ position:'absolute', top:10, right:10, width:20, height:20, borderRadius:'50%', background:'#6c63ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'white' }}>✓</div>}
      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, color:'white', fontSize:14, marginBottom:4 }}>{startup.name}</div>
          <SectorBadge sector={startup.sector}/>
          <p style={{ fontSize:12, color:'#8888aa', marginTop:6, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{startup.description}</p>
          <div style={{ display:'flex', gap:10, marginTop:6, fontSize:11, color:'#8888aa' }}>
            <span>💰 ${(startup.fundingRequired/1000).toFixed(0)}K</span>
            <span>👥 {startup.teamSize}</span>
            <span style={{ textTransform:'capitalize' }}>📍 {startup.stage}</span>
          </div>
        </div>
        <ScoreRing score={Math.round(startup.aiScore||0)} size={48} label="" color="#6c63ff"/>
      </div>
    </motion.div>
  );
}

export default function GenAI() {
  const { user } = useAuth();
  const isInvestor = user?.role === 'investor';
  const [tab, setTab] = useState('pitch');
  const [allStartups, setAllStartups] = useState([]);
  const [myStartups, setMyStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sector, setSector] = useState('saas');
  const [startupSearch, setStartupSearch] = useState('');

  const [pitchForm, setPitchForm] = useState({
    startupName:'', description:'', sector:'saas', fundingRequired:'500000', teamSize:'5', stage:'seed'
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (isInvestor) {
          // Investors see ALL startups
          const res = await startupAPI.list({ limit: 100 });
          setAllStartups(res.data.startups || []);
        } else {
          // Founders see their own startups
          const res = await startupAPI.myStartups();
          setMyStartups(res.data || []);
        }
      } catch {}
    };
    load();
  }, [isInvestor]);

  // Auto-fill when startup selected (founder side)
  const handleFounderStartupSelect = (id) => {
    setSelectedStartupId(id);
    if (!id) return;
    const s = myStartups.find(x => x._id === id);
    if (!s) return;
    setPitchForm({ startupName:s.name||'', description:s.description||'', sector:s.sector||'saas', fundingRequired:String(s.fundingRequired||500000), teamSize:String(s.teamSize||5), stage:s.stage||'seed' });
    setSector(s.sector||'saas');
    toast.success(`✅ Auto-filled from "${s.name}"`);
  };

  // Investor selects a startup to analyze
  const handleInvestorStartupSelect = (startup) => {
    setSelectedStartup(startup);
    setSelectedStartupId(startup._id);
    setPitchForm({ startupName:startup.name||'', description:startup.description||'', sector:startup.sector||'saas', fundingRequired:String(startup.fundingRequired||0), teamSize:String(startup.teamSize||0), stage:startup.stage||'seed' });
    setSector(startup.sector||'saas');
    toast.success(`✅ Selected "${startup.name}" for analysis`);
  };

  const analyzePitch = async () => {
    if (!pitchForm.startupName || !pitchForm.description) return toast.error('Select a startup or fill in details');
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/analyze-pitch', pitchForm);
      setResult({ type:'pitch', data:res.data.analysis, title:`Pitch Analysis — ${res.data.startupName}` });
      toast.success('✅ AI analysis complete!');
    } catch { toast.error('Analysis failed — check your Groq API key'); }
    finally { setLoading(false); }
  };

  const generateReport = async () => {
    if (!selectedStartupId) return toast.error('Select a startup first');
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/investor-report', { startupId: selectedStartupId });
      setResult({ type:'report', data:res.data.report, title:`Investor Report — ${res.data.startup.name}` });
      toast.success('✅ Report generated!');
    } catch { toast.error('Report failed — check your Groq API key'); }
    finally { setLoading(false); }
  };

  const summarizeProfile = async () => {
    if (!selectedStartupId) return toast.error('Select a startup first');
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/summarize-profile', { startupId: selectedStartupId });
      setResult({ type:'summary', data:res.data.summary, title:`Profile Summary — ${res.data.startup.name}` });
      toast.success('✅ Summary ready!');
    } catch { toast.error('Summary failed'); }
    finally { setLoading(false); }
  };

  const analyzeMarket = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/genai/market-analysis', { sector });
      setResult({ type:'market', data:res.data.analysis, title:`Market Analysis — ${sector.toUpperCase()}` });
      toast.success('✅ Market analysis complete!');
    } catch { toast.error('Market analysis failed'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width:'100%', padding:'10px 14px', borderRadius:12, background:'#1a1a27', border:'1px solid rgba(108,99,255,0.2)', color:'white', fontSize:14, outline:'none' };
  const labelStyle = { display:'block', fontSize:12, color:'#8888aa', marginBottom:5, fontWeight:500 };

  const founderTabs = [
    { id:'pitch', label:'🎯 Pitch Analyzer' },
    { id:'report', label:'📄 Investor Report' },
    { id:'summary', label:'✨ Profile Summary' },
    { id:'market', label:'📊 Market Analysis' },
  ];

  const investorTabs = [
    { id:'pitch', label:'🎯 Analyze Pitch' },
    { id:'report', label:'📄 Investment Memo' },
    { id:'summary', label:'✨ Startup Summary' },
    { id:'market', label:'📊 Market Analysis' },
  ];

  const tabs = isInvestor ? investorTabs : founderTabs;
  const filteredStartups = allStartups.filter(s => !startupSearch || s.name?.toLowerCase().includes(startupSearch.toLowerCase()) || s.sector?.toLowerCase().includes(startupSearch.toLowerCase()));

  return (
    <div style={{ background:'#0a0a0f', minHeight:'100vh' }}>
      <Navbar/>
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'80px 24px 60px' }}>
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:100, background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)', marginBottom:14 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#00d4aa', display:'inline-block' }}/>
            <span style={{ fontSize:11, color:'#a78bfa', fontWeight:600 }}>Powered by Groq LLaMA 3 + RAG</span>
          </div>
          <h1 style={{ fontFamily:'Clash Display,sans-serif', fontSize:34, fontWeight:700, color:'white', marginBottom:6 }}>GenAI Studio 🤖</h1>
          <p style={{ color:'#8888aa' }}>{isInvestor ? 'Analyze any startup with AI — pitch quality, investment memos, market intelligence' : 'AI-powered pitch analysis, investor reports, and market intelligence'}</p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns: isInvestor ? '1fr 320px' : '1fr', gap:24 }}>
          {/* Left: main content */}
          <div>
            {/* FOUNDER: auto-fill selector */}
            {!isInvestor && myStartups.length > 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ padding:'14px 18px', borderRadius:14, background:'rgba(0,212,170,0.08)', border:'1px solid rgba(0,212,170,0.25)', marginBottom:22, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#00d4aa', marginBottom:3 }}>⚡ Auto-Fill from Your Startup</div>
                  <div style={{ fontSize:11, color:'#8888aa' }}>Select to auto-fill all fields below instantly</div>
                </div>
                <select value={selectedStartupId} onChange={e => handleFounderStartupSelect(e.target.value)}
                  style={{ padding:'9px 14px', borderRadius:11, background:'#1a1a27', border:'1px solid rgba(0,212,170,0.3)', color:'white', fontSize:13, outline:'none', cursor:'pointer', minWidth:200 }}>
                  <option value="">-- Select your startup --</option>
                  {myStartups.map(s => <option key={s._id} value={s._id}>{s.name} ({s.sector})</option>)}
                </select>
              </motion.div>
            )}

            {/* INVESTOR: selected startup display */}
            {isInvestor && selectedStartup && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ padding:'14px 18px', borderRadius:14, background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.3)', marginBottom:22, display:'flex', alignItems:'center', gap:14 }}>
                <ScoreRing score={Math.round(selectedStartup.aiScore||0)} size={52} label="" color="#6c63ff"/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'white', marginBottom:3 }}>✅ Analyzing: {selectedStartup.name}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <SectorBadge sector={selectedStartup.sector}/>
                    <span style={{ fontSize:12, color:'#8888aa' }}>{selectedStartup.stage} · ${(selectedStartup.fundingRequired/1000).toFixed(0)}K ask</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedStartup(null); setSelectedStartupId(''); }}
                  style={{ background:'transparent', border:'none', color:'#8888aa', cursor:'pointer', fontSize:16 }}>✕</button>
              </motion.div>
            )}

            {/* Tab pills */}
            <div style={{ display:'flex', gap:6, marginBottom:22, flexWrap:'wrap' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }}
                  style={{ padding:'8px 18px', borderRadius:20, border:`1px solid ${tab===t.id?'#6c63ff':'rgba(108,99,255,0.2)'}`, background:tab===t.id?'rgba(108,99,255,0.2)':'transparent', color:tab===t.id?'#a78bfa':'#8888aa', cursor:'pointer', fontWeight:600, fontSize:13, transition:'all 0.2s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}>

                {/* PITCH ANALYZER */}
                {tab === 'pitch' && (
                  <div style={{ padding:'22px', borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.2)', marginBottom:20 }}>
                    <h2 style={{ fontFamily:'Clash Display,sans-serif', fontSize:19, fontWeight:700, color:'white', marginBottom:6 }}>
                      {isInvestor ? '🎯 Startup Pitch Analyzer' : '🎯 AI Pitch Analyzer'}
                    </h2>
                    <p style={{ color:'#8888aa', fontSize:13, marginBottom:18 }}>
                      {isInvestor ? (selectedStartup ? `Analyzing ${selectedStartup.name} — edit fields if needed` : 'Select a startup from the list →') : (selectedStartupId ? '✅ Auto-filled — edit if needed' : 'Select your startup above or fill manually')}
                    </p>
                    <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
                        <div><label style={labelStyle}>Startup Name *</label><input value={pitchForm.startupName} onChange={e => setPitchForm({...pitchForm, startupName:e.target.value})} placeholder="e.g. NeuroLend" style={inputStyle} onFocus={e=>e.target.style.borderColor='#6c63ff'} onBlur={e=>e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
                        <div><label style={labelStyle}>Sector</label><select value={pitchForm.sector} onChange={e=>setPitchForm({...pitchForm,sector:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>{SECTORS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                        <div><label style={labelStyle}>Stage</label><select value={pitchForm.stage} onChange={e=>setPitchForm({...pitchForm,stage:e.target.value})} style={{ ...inputStyle, cursor:'pointer' }}>{STAGES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                        <div><label style={labelStyle}>Team Size</label><input value={pitchForm.teamSize} onChange={e=>setPitchForm({...pitchForm,teamSize:e.target.value})} placeholder="5" style={inputStyle} onFocus={e=>e.target.style.borderColor='#6c63ff'} onBlur={e=>e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
                        <div style={{ gridColumn:'1/-1' }}><label style={labelStyle}>Funding Required ($)</label><input value={pitchForm.fundingRequired} onChange={e=>setPitchForm({...pitchForm,fundingRequired:e.target.value})} placeholder="500000" style={inputStyle} onFocus={e=>e.target.style.borderColor='#6c63ff'} onBlur={e=>e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
                      </div>
                      <div>
                        <label style={labelStyle}>Pitch Description * <span style={{ color:'#00d4aa', fontSize:10 }}>(more detail = better analysis)</span></label>
                        <textarea value={pitchForm.description} onChange={e=>setPitchForm({...pitchForm,description:e.target.value})} rows={5} placeholder="Describe the startup: problem, solution, market, traction, why they'll win..." style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} onFocus={e=>e.target.style.borderColor='#6c63ff'} onBlur={e=>e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                        <div style={{ fontSize:10, color:'#8888aa', marginTop:3 }}>{pitchForm.description.split(' ').filter(w=>w).length} words</div>
                      </div>
                      <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={analyzePitch} disabled={loading}
                        style={{ padding:'13px', borderRadius:14, background:'linear-gradient(135deg,#6c63ff,#4f46e5)', color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
                        {loading ? '🤖 Analyzing...' : '🎯 Analyze This Pitch'}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* INVESTOR REPORT */}
                {tab === 'report' && (
                  <div style={{ padding:'22px', borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.2)', marginBottom:20 }}>
                    <h2 style={{ fontFamily:'Clash Display,sans-serif', fontSize:19, fontWeight:700, color:'white', marginBottom:6 }}>📄 {isInvestor ? 'Investment Memo' : 'Investor Report Generator'}</h2>
                    <p style={{ color:'#8888aa', fontSize:13, marginBottom:16 }}>{isInvestor ? 'Generate a professional investment memo for this startup' : 'Auto-loaded from selected startup above'}</p>
                    {selectedStartupId ? (
                      <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(0,212,170,0.08)', border:'1px solid rgba(0,212,170,0.2)', marginBottom:14 }}>
                        <div style={{ fontSize:12, color:'#00d4aa', fontWeight:600 }}>✅ Ready: {(isInvestor ? allStartups : myStartups).find(s=>s._id===selectedStartupId)?.name}</div>
                      </div>
                    ) : (
                      <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(255,211,93,0.08)', border:'1px solid rgba(255,211,93,0.2)', marginBottom:14 }}>
                        <div style={{ fontSize:12, color:'#ffd93d', fontWeight:600 }}>⚠️ {isInvestor ? 'Select a startup from the list →' : 'Select your startup using the green bar above'}</div>
                      </div>
                    )}
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={generateReport} disabled={loading || !selectedStartupId}
                      style={{ padding:'13px', borderRadius:14, background:selectedStartupId?'linear-gradient(135deg,#00d4aa,#059669)':'#2a2a3a', color:'white', border:'none', cursor:selectedStartupId?'pointer':'not-allowed', fontWeight:700, fontSize:14, width:'100%' }}>
                      {loading ? '📝 Writing memo...' : '📄 Generate Investment Memo'}
                    </motion.button>
                  </div>
                )}

                {/* PROFILE SUMMARY */}
                {tab === 'summary' && (
                  <div style={{ padding:'22px', borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.2)', marginBottom:20 }}>
                    <h2 style={{ fontFamily:'Clash Display,sans-serif', fontSize:19, fontWeight:700, color:'white', marginBottom:6 }}>✨ {isInvestor ? 'Startup One-Pager' : 'Profile Summarizer'}</h2>
                    <p style={{ color:'#8888aa', fontSize:13, marginBottom:16 }}>{isInvestor ? 'Get a compelling investor-friendly summary of this startup' : 'Transform your startup into a compelling one-pager'}</p>
                    {selectedStartupId ? (
                      <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(0,212,170,0.08)', border:'1px solid rgba(0,212,170,0.2)', marginBottom:14 }}>
                        <div style={{ fontSize:12, color:'#00d4aa', fontWeight:600 }}>✅ {(isInvestor ? allStartups : myStartups).find(s=>s._id===selectedStartupId)?.name}</div>
                      </div>
                    ) : (
                      <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(255,211,93,0.08)', border:'1px solid rgba(255,211,93,0.2)', marginBottom:14 }}>
                        <div style={{ fontSize:12, color:'#ffd93d', fontWeight:600 }}>⚠️ {isInvestor ? 'Select a startup from the list →' : 'Select your startup above first'}</div>
                      </div>
                    )}
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={summarizeProfile} disabled={loading || !selectedStartupId}
                      style={{ padding:'13px', borderRadius:14, background:selectedStartupId?'linear-gradient(135deg,#8b5cf6,#7c3aed)':'#2a2a3a', color:'white', border:'none', cursor:selectedStartupId?'pointer':'not-allowed', fontWeight:700, fontSize:14, width:'100%' }}>
                      {loading ? '✨ Creating...' : '✨ Generate One-Pager'}
                    </motion.button>
                  </div>
                )}

                {/* MARKET ANALYSIS */}
                {tab === 'market' && (
                  <div style={{ padding:'22px', borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.2)', marginBottom:20 }}>
                    <h2 style={{ fontFamily:'Clash Display,sans-serif', fontSize:19, fontWeight:700, color:'white', marginBottom:6 }}>📊 Market Intelligence</h2>
                    <p style={{ color:'#8888aa', fontSize:13, marginBottom:16 }}>Get AI-powered market analysis for any sector {selectedStartup ? `(auto-set to ${selectedStartup.sector})` : ''}</p>
                    <div style={{ marginBottom:14 }}>
                      <label style={labelStyle}>Sector</label>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {SECTORS.map(s => (
                          <button key={s} onClick={() => setSector(s)}
                            style={{ padding:'6px 12px', borderRadius:10, border:`1px solid ${sector===s?'#ffd93d':'rgba(108,99,255,0.2)'}`, background:sector===s?'rgba(255,211,93,0.15)':'#1a1a27', color:sector===s?'#ffd93d':'#8888aa', cursor:'pointer', fontSize:11, textTransform:'capitalize', fontWeight:500 }}>
                            {s.replace(/-/g,' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={analyzeMarket} disabled={loading}
                      style={{ padding:'13px', borderRadius:14, background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:14, width:'100%' }}>
                      {loading ? '📊 Analyzing...' : `📊 Analyze ${sector.toUpperCase()} Market`}
                    </motion.button>
                  </div>
                )}

                {/* Loading */}
                {loading && <LoadingAI message={tab==='pitch'?'Analyzing pitch like a VC...':tab==='report'?'Writing investment memo...':tab==='summary'?'Crafting one-pager...':'Researching market...'}/>}

                {/* Result */}
                {result && !loading && (
                  <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                    style={{ padding:'22px', borderRadius:20, background:'#12121a', border:'1px solid rgba(0,212,170,0.25)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:8 }}>
                      <h3 style={{ fontFamily:'Clash Display,sans-serif', fontSize:18, fontWeight:700, color:'white' }}>{result.title}</h3>
                      <div style={{ display:'flex', gap:8 }}>
                        <span style={{ padding:'4px 11px', borderRadius:20, background:'rgba(0,212,170,0.15)', color:'#00d4aa', fontSize:11, fontWeight:600 }}>⚡ Groq LLaMA 3 + RAG</span>
                        <button onClick={() => { navigator.clipboard.writeText(result.data); toast.success('Copied!'); }}
                          style={{ padding:'4px 11px', borderRadius:20, background:'rgba(108,99,255,0.15)', color:'#a78bfa', fontSize:11, fontWeight:600, border:'none', cursor:'pointer' }}>
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    <div style={{ padding:'18px', borderRadius:12, background:'#0a0a0f', border:'1px solid rgba(108,99,255,0.1)' }}>
                      <MarkdownText text={result.data}/>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Investor startup picker */}
          {isInvestor && (
            <div style={{ position:'sticky', top:80, height:'calc(100vh - 120px)', display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'16px', borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.2)', flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <h3 style={{ fontFamily:'Clash Display,sans-serif', fontSize:16, fontWeight:700, color:'white', marginBottom:12 }}>
                  🚀 Select Startup to Analyze
                </h3>
                <div style={{ position:'relative', marginBottom:12 }}>
                  <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#8888aa', fontSize:13 }}>🔍</span>
                  <input value={startupSearch} onChange={e => setStartupSearch(e.target.value)}
                    placeholder="Search startups..."
                    style={{ width:'100%', padding:'8px 12px 8px 30px', borderRadius:10, background:'#1a1a27', border:'1px solid rgba(108,99,255,0.2)', color:'white', fontSize:13, outline:'none' }}/>
                </div>
                <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
                  {filteredStartups.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'30px', color:'#8888aa', fontSize:13 }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                      No startups found
                    </div>
                  ) : filteredStartups.map(s => (
                    <StartupPickCard key={s._id} startup={s} selected={selectedStartup?._id === s._id} onSelect={handleInvestorStartupSelect}/>
                  ))}
                </div>
              </div>
              {/* API key reminder */}
              <div style={{ marginTop:10, padding:'12px 14px', borderRadius:14, background:'rgba(255,211,93,0.08)', border:'1px solid rgba(255,211,93,0.2)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#ffd93d', marginBottom:5 }}>⚠️ Groq API Key Required</div>
                <div style={{ fontSize:10, color:'#8888aa', lineHeight:1.6 }}>
                  <code style={{ color:'#00d4aa' }}>GEMINI_API_KEY=gsk_...</code><br/>
                  Free at: <span style={{ color:'#6c63ff' }}>console.groq.com</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
