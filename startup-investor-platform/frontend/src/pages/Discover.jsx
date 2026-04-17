import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startupAPI, investorAPI, chatAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import ScoreRing from '../components/ui/ScoreRing';
import SectorBadge from '../components/ui/SectorBadge';
import toast from 'react-hot-toast';

const SECTORS = ['all','fintech','healthtech','edtech','saas','ai-ml','blockchain','cleantech','cybersecurity','agritech','other'];

// ─── Startup Profile Modal ────────────────────────────────────────────────────
function StartupModal({ startup, onClose, onMessage }) {
  if (!startup) return null;
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9 }}
        onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:580, maxHeight:'88vh', overflowY:'auto', borderRadius:24, background:'#12121a', border:'1px solid rgba(108,99,255,0.35)' }}>
        <div style={{ padding:'26px', background:'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(0,212,170,0.08))', borderBottom:'1px solid rgba(108,99,255,0.1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                <h2 style={{ fontFamily:'Clash Display,sans-serif', fontSize:24, fontWeight:700, color:'white' }}>{startup.name}</h2>
                <SectorBadge sector={startup.sector}/>
              </div>
              {startup.tagline && <p style={{ color:'#a78bfa', fontStyle:'italic', fontSize:14 }}>"{startup.tagline}"</p>}
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
              <ScoreRing score={Math.round(startup.aiScore||0)} size={64} label="AI" color="#6c63ff"/>
              <ScoreRing score={Math.round(startup.trustScore||0)} size={64} label="Trust" color="#00d4aa"/>
            </div>
            <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#8888aa', cursor:'pointer', fontSize:20, marginLeft:12, flexShrink:0 }}>✕</button>
          </div>
        </div>
        <div style={{ padding:'22px' }}>
          <p style={{ color:'#ccccdd', lineHeight:1.7, fontSize:14, marginBottom:18 }}>{startup.description}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            {[
              { label:'Funding Ask', value:`$${(startup.fundingRequired/1000).toFixed(0)}K`, icon:'💰' },
              { label:'Team Size', value:startup.teamSize, icon:'👥' },
              { label:'Stage', value:startup.stage, icon:'📍' },
              { label:'Location', value:startup.location||'—', icon:'🌍' },
              { label:'Exp (yrs)', value:startup.founderExperience||0, icon:'⭐' },
              { label:'Competition', value:startup.competitionLevel||'—', icon:'⚔️' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ padding:'10px', borderRadius:12, background:'#1a1a27', textAlign:'center' }}>
                <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
                <div style={{ fontWeight:700, color:'white', fontSize:14, textTransform:'capitalize' }}>{value}</div>
                <div style={{ fontSize:10, color:'#8888aa', marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <span style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:700,
              background:startup.competitionLevel==='low'?'rgba(0,212,170,0.15)':startup.competitionLevel==='medium'?'rgba(255,211,93,0.15)':'rgba(255,107,107,0.15)',
              color:startup.competitionLevel==='low'?'#00d4aa':startup.competitionLevel==='medium'?'#ffd93d':'#ff6b6b' }}>
              {startup.competitionLevel==='low'?'🟢':startup.competitionLevel==='medium'?'🟡':'🔴'} {startup.competitionLevel} competition
            </span>
            {startup.website && <a href={startup.website} target="_blank" rel="noreferrer" style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:700, background:'rgba(108,99,255,0.15)', color:'#a78bfa', textDecoration:'none' }}>🌐 Website</a>}
          </div>
          {startup.founder && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:12, background:'#1a1a27', marginBottom:8 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#00d4aa)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13 }}>{startup.founder.name?.[0]}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'white' }}>{startup.founder.name}</div>
                <div style={{ fontSize:11, color:'#8888aa' }}>Founder · Trust {startup.founder.trustScore||0}%</div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid rgba(108,99,255,0.1)', display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:12, border:'1px solid rgba(108,99,255,0.3)', background:'transparent', color:'#a78bfa', cursor:'pointer', fontWeight:600 }}>Close</button>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={() => { onMessage(startup); onClose(); }}
            style={{ flex:2, padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#6c63ff,#4f46e5)', color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
            💬 Message Founder
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Investor Profile Modal ───────────────────────────────────────────────────
function InvestorModal({ investor, onClose, onMessage }) {
  if (!investor) return null;
  const u = investor.user || {};
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9 }}
        onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:560, maxHeight:'88vh', overflowY:'auto', borderRadius:24, background:'#12121a', border:'1px solid rgba(0,212,170,0.3)' }}>
        <div style={{ padding:'26px', background:'linear-gradient(135deg,rgba(0,212,170,0.1),rgba(108,99,255,0.08))', borderBottom:'1px solid rgba(0,212,170,0.1)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', gap:14, alignItems:'center', flex:1 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#00d4aa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'white', flexShrink:0 }}>{u.name?.[0]?.toUpperCase()||'?'}</div>
              <div>
                <h2 style={{ fontFamily:'Clash Display,sans-serif', fontSize:22, fontWeight:700, color:'white' }}>{u.name||'Investor'}</h2>
                <div style={{ fontSize:13, color:'#00d4aa', fontWeight:600 }}>{investor.firmName||'Independent'}</div>
                <div style={{ fontSize:12, color:'#8888aa', textTransform:'capitalize' }}>{investor.investorType}</div>
              </div>
            </div>
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:11, color:'#8888aa' }}>Trust Score</div>
              <div style={{ fontSize:26, fontWeight:700, color:'#00d4aa' }}>{investor.trustScore||0}%</div>
            </div>
            <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#8888aa', cursor:'pointer', fontSize:20, marginLeft:12 }}>✕</button>
          </div>
        </div>
        <div style={{ padding:'22px' }}>
          {investor.investmentThesis && (
            <div style={{ padding:'14px', borderRadius:12, background:'#1a1a27', marginBottom:16, border:'1px solid rgba(108,99,255,0.15)' }}>
              <div style={{ fontSize:11, color:'#8888aa', marginBottom:6 }}>Investment Thesis</div>
              <p style={{ color:'#ccccdd', fontSize:13, lineHeight:1.6 }}>{investor.investmentThesis}</p>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              { label:'Min Investment', value:`$${(investor.minInvestment/1000).toFixed(0)}K` },
              { label:'Max Investment', value:`$${(investor.maxInvestment/1000).toFixed(0)}K` },
              { label:'Risk Level', value:investor.riskLevel },
              { label:'Total Budget', value:`$${((investor.totalBudget||0)/1000).toFixed(0)}K` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding:'12px 14px', borderRadius:12, background:'#1a1a27' }}>
                <div style={{ fontSize:11, color:'#8888aa', marginBottom:4 }}>{label}</div>
                <div style={{ fontWeight:700, color:'white', textTransform:'capitalize', fontSize:15 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:'#8888aa', marginBottom:8 }}>Interested Sectors</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {investor.sectors?.map(s => <SectorBadge key={s} sector={s}/>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize:12, color:'#8888aa', marginBottom:8 }}>Preferred Stages</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {investor.preferredStages?.map(s => (
                <span key={s} style={{ padding:'4px 12px', borderRadius:20, background:'rgba(0,212,170,0.1)', color:'#00d4aa', fontSize:12, fontWeight:600, textTransform:'capitalize' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid rgba(0,212,170,0.1)', display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:12, border:'1px solid rgba(108,99,255,0.3)', background:'transparent', color:'#a78bfa', cursor:'pointer', fontWeight:600 }}>Close</button>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={() => { onMessage(investor); onClose(); }}
            style={{ flex:2, padding:'11px', borderRadius:12, background:'linear-gradient(135deg,#00d4aa,#059669)', color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:14 }}>
            💬 Message Investor
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Startup Card ─────────────────────────────────────────────────────────────
function StartupCard({ startup, onClick, onMessage }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} whileHover={{ y:-4 }}
      style={{ borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.2)', overflow:'hidden' }}>
      <div onClick={() => onClick(startup)} style={{ padding:'18px 18px 0', cursor:'pointer' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <h3 style={{ fontFamily:'Clash Display,sans-serif', fontSize:17, fontWeight:700, color:'white', marginBottom:6 }}>{startup.name}</h3>
            <SectorBadge sector={startup.sector}/>
          </div>
          <ScoreRing score={Math.round(startup.aiScore||0)} size={56} label="" color="#6c63ff"/>
        </div>
        {startup.tagline && <p style={{ fontSize:12, color:'#a78bfa', fontStyle:'italic', marginBottom:8 }}>"{startup.tagline}"</p>}
        <p style={{ fontSize:13, color:'#8888aa', lineHeight:1.5, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{startup.description}</p>
        <div style={{ display:'flex', gap:10, fontSize:12, color:'#8888aa', marginBottom:14, flexWrap:'wrap' }}>
          <span>💰 ${(startup.fundingRequired/1000).toFixed(0)}K</span>
          <span>👥 {startup.teamSize}</span>
          <span style={{ textTransform:'capitalize' }}>📍 {startup.stage}</span>
          <span style={{ color:startup.competitionLevel==='low'?'#00d4aa':startup.competitionLevel==='medium'?'#ffd93d':'#ff6b6b' }}>
            {startup.competitionLevel==='low'?'🟢':startup.competitionLevel==='medium'?'🟡':'🔴'} {startup.competitionLevel}
          </span>
        </div>
      </div>
      <div style={{ display:'flex', borderTop:'1px solid rgba(108,99,255,0.08)' }}>
        <button onClick={() => onClick(startup)} style={{ flex:1, padding:'11px', background:'transparent', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:12, fontWeight:600 }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(108,99,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>👁 View Profile</button>
        <div style={{ width:1, background:'rgba(108,99,255,0.08)' }}/>
        <button onClick={() => onMessage(startup)} style={{ flex:1, padding:'11px', background:'transparent', border:'none', color:'#00d4aa', cursor:'pointer', fontSize:12, fontWeight:600 }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(0,212,170,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>💬 Message</button>
      </div>
    </motion.div>
  );
}

// ─── Investor Card ────────────────────────────────────────────────────────────
function InvestorCard({ investor, onClick, onMessage }) {
  const u = investor.user || {};
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} whileHover={{ y:-4 }}
      style={{ borderRadius:20, background:'#12121a', border:'1px solid rgba(0,212,170,0.2)', overflow:'hidden' }}>
      <div onClick={() => onClick(investor)} style={{ padding:'18px 18px 0', cursor:'pointer' }}>
        <div style={{ display:'flex', gap:12, marginBottom:12 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#00d4aa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'white', flexShrink:0 }}>{u.name?.[0]?.toUpperCase()||'?'}</div>
          <div style={{ flex:1 }}>
            <h3 style={{ fontFamily:'Clash Display,sans-serif', fontSize:16, fontWeight:700, color:'white', marginBottom:2 }}>{u.name||'Investor'}</h3>
            <div style={{ fontSize:12, color:'#00d4aa', fontWeight:600 }}>{investor.firmName||'Independent'}</div>
            <div style={{ fontSize:11, color:'#8888aa', textTransform:'capitalize' }}>{investor.investorType}</div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:10, color:'#8888aa' }}>Trust</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#00d4aa' }}>{investor.trustScore||0}%</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {investor.sectors?.slice(0,3).map(s => <SectorBadge key={s} sector={s}/>)}
          {investor.sectors?.length > 3 && <span style={{ fontSize:11, color:'#8888aa' }}>+{investor.sectors.length-3}</span>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
          <div style={{ padding:'8px', borderRadius:10, background:'#1a1a27', fontSize:12 }}>
            <div style={{ color:'#8888aa' }}>Min</div>
            <div style={{ color:'white', fontWeight:600 }}>${(investor.minInvestment/1000).toFixed(0)}K</div>
          </div>
          <div style={{ padding:'8px', borderRadius:10, background:'#1a1a27', fontSize:12 }}>
            <div style={{ color:'#8888aa' }}>Max</div>
            <div style={{ color:'white', fontWeight:600 }}>${(investor.maxInvestment/1000).toFixed(0)}K</div>
          </div>
        </div>
        {investor.investmentThesis && (
          <p style={{ fontSize:12, color:'#8888aa', lineHeight:1.5, marginBottom:14, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>"{investor.investmentThesis}"</p>
        )}
      </div>
      <div style={{ display:'flex', borderTop:'1px solid rgba(0,212,170,0.08)' }}>
        <button onClick={() => onClick(investor)} style={{ flex:1, padding:'11px', background:'transparent', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:12, fontWeight:600 }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(108,99,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>👁 View Profile</button>
        <div style={{ width:1, background:'rgba(0,212,170,0.08)' }}/>
        <button onClick={() => onMessage(investor)} style={{ flex:1, padding:'11px', background:'transparent', border:'none', color:'#00d4aa', cursor:'pointer', fontSize:12, fontWeight:600 }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(0,212,170,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>💬 Message</button>
      </div>
    </motion.div>
  );
}

// ─── Main Discover Page ───────────────────────────────────────────────────────
export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isInvestor = user?.role === 'investor';

  const [startups, setStartups] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(isInvestor ? 'startups' : 'investors');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sRes, iRes] = await Promise.all([
          startupAPI.list({ limit: 100 }),
          investorAPI.list({ limit: 100 })
        ]);
        setStartups(sRes.data.startups || []);
        setInvestors(iRes.data.investors || []);
      } catch (e) { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleMessage = async (item) => {
    try {
      const otherId = item.founder?._id || item.user?._id || item._id;
      if (!otherId) return toast.error('Cannot message this user');
      const roomId = `direct_${[user._id, otherId].sort().join('_')}`;
      await chatAPI.createRoom({ roomId, participantIds: [user._id, otherId] });
      navigate(`/chat/${roomId}`);
    } catch { toast.error('Could not start chat'); }
  };

  const filteredStartups = startups.filter(s => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()) || s.sector?.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === 'all' || s.sector === sectorFilter;
    return matchSearch && matchSector;
  });

  const filteredInvestors = investors.filter(inv => {
    const name = inv.user?.name || inv.firmName || '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || inv.sectors?.some(s => s.toLowerCase().includes(search.toLowerCase())) || inv.firmName?.toLowerCase().includes(search.toLowerCase());
    const matchSector = sectorFilter === 'all' || inv.sectors?.includes(sectorFilter);
    return matchSearch && matchSector;
  });

  const showingStartups = activeTab === 'startups';

  return (
    <div style={{ background:'#0a0a0f', minHeight:'100vh' }}>
      <Navbar/>
      <main style={{ maxWidth:1200, margin:'0 auto', padding:'80px 24px 60px' }}>
        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:'Clash Display,sans-serif', fontSize:32, fontWeight:700, color:'white', marginBottom:8 }}>🔍 Discover</h1>
          <p style={{ color:'#8888aa' }}>Browse startups and investors, view profiles, and message directly</p>
        </motion.div>

        {/* Tab switcher */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'#12121a', padding:6, borderRadius:14, border:'1px solid rgba(108,99,255,0.15)', width:'fit-content' }}>
          {[
            { id:'startups', label:`🚀 Startups (${startups.length})` },
            { id:'investors', label:`💼 Investors (${investors.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch(''); setSectorFilter('all'); }}
              style={{ padding:'9px 22px', borderRadius:10, border:'none', background:activeTab===t.id?'rgba(108,99,255,0.3)':'transparent', color:activeTab===t.id?'#a78bfa':'#8888aa', cursor:'pointer', fontWeight:600, fontSize:14, transition:'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:260, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#8888aa', fontSize:16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={showingStartups ? 'Search startups by name, sector, description...' : 'Search investors by name, firm, sector...'}
              style={{ width:'100%', padding:'11px 14px 11px 42px', borderRadius:14, background:'#1a1a27', border:'1px solid rgba(108,99,255,0.2)', color:'white', fontSize:14, outline:'none' }}
              onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
            {SECTORS.map(s => (
              <button key={s} onClick={() => setSectorFilter(s)}
                style={{ padding:'7px 12px', borderRadius:20, border:`1px solid ${sectorFilter===s?'#6c63ff':'rgba(108,99,255,0.2)'}`, background:sectorFilter===s?'rgba(108,99,255,0.2)':'transparent', color:sectorFilter===s?'#a78bfa':'#8888aa', cursor:'pointer', fontSize:11, fontWeight:500, textTransform:'capitalize', transition:'all 0.2s' }}>
                {s==='all'?'🌐 All':s.replace(/-/g,' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ marginBottom:18, fontSize:13, color:'#8888aa' }}>
          Showing <span style={{ color:'#a78bfa', fontWeight:700 }}>{showingStartups ? filteredStartups.length : filteredInvestors.length}</span> {showingStartups ? 'startups' : 'investors'}
          {search && <span> matching "<span style={{ color:'white' }}>{search}</span>"</span>}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'80px', color:'#6c63ff' }}>
            <div style={{ width:40, height:40, border:'2px solid #6c63ff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }}/>
            Loading...
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:18 }}>
            {showingStartups ? (
              filteredStartups.length > 0 ? filteredStartups.map(s => (
                <StartupCard key={s._id} startup={s} onClick={setSelectedStartup} onMessage={handleMessage}/>
              )) : (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px', color:'#8888aa' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🚀</div>
                  <p style={{ fontSize:16, color:'white', marginBottom:6 }}>No startups found</p>
                  <p>Try a different search or sector</p>
                </div>
              )
            ) : (
              filteredInvestors.length > 0 ? filteredInvestors.map(inv => (
                <InvestorCard key={inv._id} investor={inv} onClick={setSelectedInvestor} onMessage={handleMessage}/>
              )) : (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px', color:'#8888aa' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>💼</div>
                  <p style={{ fontSize:16, color:'white', marginBottom:6 }}>No investors found</p>
                  <p>Try a different search or sector</p>
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedStartup && <StartupModal startup={selectedStartup} onClose={() => setSelectedStartup(null)} onMessage={handleMessage}/>}
        {selectedInvestor && <InvestorModal investor={selectedInvestor} onClose={() => setSelectedInvestor(null)} onMessage={handleMessage}/>}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
