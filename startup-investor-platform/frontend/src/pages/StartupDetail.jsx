import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { startupAPI, matchAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import ScoreRing from '../components/ui/ScoreRing';
import SectorBadge from '../components/ui/SectorBadge';
import toast from 'react-hot-toast';

export default function StartupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, cRes] = await Promise.all([startupAPI.get(id), startupAPI.getCompetition(id)]);
        setStartup(sRes.data);
        setCompetition(cRes.data);
        if (user) {
          try { const mRes = await matchAPI.getStartupInvestors(id); setInvestors(mRes.data?.slice(0,5)||[]); } catch {}
        }
      } catch { toast.error('Failed to load startup'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, user]);

  if (loading) return (
    <div style={{ background:'#0a0a0f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Navbar/>
      <div style={{ width:40, height:40, border:'2px solid #6c63ff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
    </div>
  );

  if (!startup) return (
    <div style={{ background:'#0a0a0f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
      <Navbar/><p>Startup not found</p>
    </div>
  );

  return (
    <div style={{ background:'#0a0a0f', minHeight:'100vh' }}>
      <Navbar/>
      <main style={{ paddingTop:80, maxWidth:1000, margin:'0 auto', padding:'80px 24px 60px' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          style={{ padding:'32px', borderRadius:24, background:'linear-gradient(135deg,rgba(108,99,255,0.12),rgba(0,212,170,0.06))', border:'1px solid rgba(108,99,255,0.25)', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <h1 style={{ fontFamily:'Clash Display,sans-serif', fontSize:32, fontWeight:700, color:'white' }}>{startup.name}</h1>
                <SectorBadge sector={startup.sector}/>
              </div>
              {startup.tagline && <p style={{ color:'#a78bfa', fontStyle:'italic', fontSize:16, marginBottom:12 }}>"{startup.tagline}"</p>}
              <p style={{ color:'#ccccdd', lineHeight:1.7, fontSize:15 }}>{startup.description}</p>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              <ScoreRing score={Math.round(startup.aiScore)} size={80} label="AI Score" color="#6c63ff"/>
              <ScoreRing score={Math.round(startup.trustScore)} size={80} label="Trust" color="#00d4aa"/>
            </div>
          </div>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
          {[
            { label:'Funding Ask', value:`$${(startup.fundingRequired/1000).toFixed(0)}K`, icon:'💰' },
            { label:'Team Size', value:startup.teamSize, icon:'👥' },
            { label:'Stage', value:startup.stage, icon:'📍' },
            { label:'Location', value:startup.location||'—', icon:'🌍' },
            { label:'Competition', value:competition?.competitionLevel||'—', icon:'⚔️' },
            { label:'Similar Startups', value:competition?.similarCount||0, icon:'🔍' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ padding:'16px', borderRadius:14, background:'#12121a', border:'1px solid rgba(108,99,255,0.15)', textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
              <div style={{ fontWeight:700, color:'white', fontSize:16, textTransform:'capitalize' }}>{value}</div>
              <div style={{ fontSize:11, color:'#8888aa', marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>

        {competition && (
          <div style={{ padding:'24px', borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.15)', marginBottom:24 }}>
            <h3 style={{ fontFamily:'Clash Display,sans-serif', fontSize:18, fontWeight:700, color:'white', marginBottom:16 }}>🔥 Market Competition Analysis</h3>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ padding:'6px 16px', borderRadius:20,
                background: competition.competitionLevel==='low'?'rgba(0,212,170,0.2)':competition.competitionLevel==='medium'?'rgba(255,211,93,0.2)':'rgba(255,107,107,0.2)',
                color: competition.competitionLevel==='low'?'#00d4aa':competition.competitionLevel==='medium'?'#ffd93d':'#ff6b6b',
                fontWeight:700, textTransform:'uppercase', fontSize:13 }}>
                {competition.competitionLevel} Competition
              </span>
              <span style={{ color:'#8888aa', fontSize:14 }}>{competition.similarCount} similar startups found in NLP analysis</span>
            </div>
          </div>
        )}

        {investors.length > 0 && (
          <div style={{ padding:'24px', borderRadius:20, background:'#12121a', border:'1px solid rgba(108,99,255,0.15)', marginBottom:24 }}>
            <h3 style={{ fontFamily:'Clash Display,sans-serif', fontSize:18, fontWeight:700, color:'white', marginBottom:16 }}>🎯 Recommended Investors</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {investors.map((m, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, background:'#1a1a27' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#00d4aa)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700 }}>
                    {m.investor?.user?.name?.[0]||'?'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:'white', fontSize:14 }}>{m.investor?.user?.name||'Investor'}</div>
                    <div style={{ fontSize:12, color:'#8888aa' }}>{m.investor?.firmName||''} · {m.investor?.investorType}</div>
                  </div>
                  <div style={{ padding:'4px 12px', borderRadius:20, background:'rgba(108,99,255,0.2)', color:'#a78bfa', fontSize:13, fontWeight:700 }}>{Math.round(m.matchScore)}% match</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:12 }}>
          <motion.button whileHover={{ scale:1.03 }} onClick={() => navigate(-1)}
            style={{ padding:'12px 24px', borderRadius:12, border:'1px solid rgba(108,99,255,0.3)', background:'transparent', color:'#a78bfa', cursor:'pointer', fontWeight:600 }}>
            ← Back
          </motion.button>
          {startup.website && (
            <a href={startup.website} target="_blank" rel="noreferrer"
              style={{ padding:'12px 24px', borderRadius:12, background:'linear-gradient(135deg,#6c63ff,#4f46e5)', color:'white', textDecoration:'none', fontWeight:700 }}>
              🌐 Visit Website
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
