import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI, investorAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import ScoreRing from '../components/ui/ScoreRing';
import toast from 'react-hot-toast';

const MOODS = [{ emoji: '😊', label: 'Great' }, { emoji: '🙂', label: 'Good' }, { emoji: '😐', label: 'Okay' }, { emoji: '😔', label: 'Low' }, { emoji: '😰', label: 'Stressed' }];
const SECTORS = ['fintech','healthtech','edtech','agritech','ecommerce','saas','ai-ml','blockchain','cleantech','logistics','proptech','gaming','social','cybersecurity','biotech','spacetech','foodtech','legaltech','hrtech','marketingtech'];
const STAGES = ['idea','pre-seed','seed','series-a','series-b','growth'];
const RISK_LEVELS = ['low','medium','high'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name||'', bio: user?.bio||'', location: user?.location||'', linkedin: user?.linkedin||'', website: user?.website||'' });
  const [investorProfile, setInvestorProfile] = useState(null);
  const [mood, setMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (user?.role === 'investor') {
      investorAPI.myProfile().then(r => setInvestorProfile(r.data)).catch(() => setInvestorProfile({
        sectors: [], preferredStages: [], minInvestment: 10000, maxInvestment: 500000, riskLevel: 'medium', investmentThesis: '', firmName: ''
      }));
    }
  }, [user?.role]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data);
      toast.success('✅ Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const saveInvestor = async () => {
    setSaving(true);
    try {
      await investorAPI.updateProfile(investorProfile);
      toast.success('✅ Investor profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const saveMoodCheckin = async () => {
    if (!mood) return toast.error('Select a mood first');
    try {
      await authAPI.mentalHealthCheckin({ mood, note: moodNote });
      toast.success('✨ Mental health check-in saved!');
      setMood(''); setMoodNote('');
    } catch { toast.error('Failed to save'); }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)', color: 'white', fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6, fontWeight: 500 };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ paddingTop: 80, maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px' }}>
        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '32px', borderRadius: 24, background: 'linear-gradient(135deg,rgba(108,99,255,0.15),rgba(0,212,170,0.08))', border: '1px solid rgba(108,99,255,0.3)', marginBottom: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Clash Display', fontWeight: 700, fontSize: 28, color: 'white', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 26, fontWeight: 700, color: 'white' }}>{user?.name}</h1>
            <p style={{ color: '#8888aa', fontSize: 14, marginTop: 4 }}>{user?.email} · <span style={{ color: '#a78bfa', textTransform: 'capitalize' }}>{user?.role}</span></p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <ScoreRing score={user?.trustScore || 0} size={72} label="Trust" color="#00d4aa"/>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#12121a', padding: '6px', borderRadius: 14, border: '1px solid rgba(108,99,255,0.15)', width: 'fit-content' }}>
          {['profile', user?.role === 'investor' ? 'investor' : null, 'mental-health'].filter(Boolean).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: tab === t ? 'rgba(108,99,255,0.3)' : 'transparent', color: tab === t ? '#a78bfa' : '#8888aa', cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {t === 'mental-health' ? '🧠 Wellness' : t === 'investor' ? '💼 Investor' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 24 }}>Edit Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ key: 'name', label: 'Full Name', placeholder: 'Alex Johnson' }, { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' }, { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' }, { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' }].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input value={profile[key]} onChange={e => setProfile({ ...profile, [key]: e.target.value })} placeholder={placeholder}
                    style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={4} placeholder="Tell your story..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveProfile} disabled={saving}
              style={{ marginTop: 20, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              {saving ? 'Saving...' : '💾 Save Profile'}
            </motion.button>
          </motion.div>
        )}

        {/* Investor tab */}
        {tab === 'investor' && investorProfile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 24 }}>Investor Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><label style={labelStyle}>Firm / Fund Name</label><input value={investorProfile.firmName||''} onChange={e => setInvestorProfile({...investorProfile, firmName: e.target.value})} placeholder="e.g. Sequoia Capital" style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
              <div>
                <label style={labelStyle}>Preferred Sectors (select all that apply)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SECTORS.map(s => {
                    const sel = investorProfile.sectors?.includes(s);
                    return <button key={s} type="button" onClick={() => setInvestorProfile(p => ({ ...p, sectors: sel ? p.sectors.filter(x=>x!==s) : [...(p.sectors||[]), s] }))} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${sel?'#6c63ff':'rgba(108,99,255,0.2)'}`, background: sel?'rgba(108,99,255,0.2)':'transparent', color: sel?'#a78bfa':'#8888aa', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>{s.replace(/-/g,' ')}</button>;
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Preferred Stages</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STAGES.map(s => {
                    const sel = investorProfile.preferredStages?.includes(s);
                    return <button key={s} type="button" onClick={() => setInvestorProfile(p => ({ ...p, preferredStages: sel ? p.preferredStages.filter(x=>x!==s) : [...(p.preferredStages||[]), s] }))} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${sel?'#00d4aa':'rgba(108,99,255,0.2)'}`, background: sel?'rgba(0,212,170,0.15)':'transparent', color: sel?'#00d4aa':'#8888aa', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize' }}>{s}</button>;
                  })}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                {[{ key: 'minInvestment', label: 'Min Investment ($)' }, { key: 'maxInvestment', label: 'Max Investment ($)' }, { key: 'totalBudget', label: 'Total Budget ($)' }].map(({ key, label }) => (
                  <div key={key}><label style={labelStyle}>{label}</label><input type="number" value={investorProfile[key]||0} onChange={e => setInvestorProfile({...investorProfile, [key]: Number(e.target.value)})} style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
                ))}
              </div>
              <div>
                <label style={labelStyle}>Risk Level</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {RISK_LEVELS.map(r => (
                    <button key={r} type="button" onClick={() => setInvestorProfile({...investorProfile, riskLevel: r})}
                      style={{ padding: '8px 20px', borderRadius: 10, border: `1px solid ${investorProfile.riskLevel===r?'#ffd93d':'rgba(108,99,255,0.2)'}`, background: investorProfile.riskLevel===r?'rgba(255,211,93,0.15)':'transparent', color: investorProfile.riskLevel===r?'#ffd93d':'#8888aa', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600 }}>{r}</button>
                  ))}
                </div>
              </div>
              <div><label style={labelStyle}>Investment Thesis</label><textarea value={investorProfile.investmentThesis||''} onChange={e => setInvestorProfile({...investorProfile, investmentThesis: e.target.value})} rows={3} placeholder="What kind of startups are you looking for?" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveInvestor} disabled={saving}
              style={{ marginTop: 20, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              {saving ? 'Saving...' : '💾 Save Investor Profile'}
            </motion.button>
          </motion.div>
        )}

        {/* Mental health tab */}
        {tab === 'mental-health' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '28px', borderRadius: 20, background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
            <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>🧠 Wellness Tracker</h2>
            <p style={{ color: '#8888aa', fontSize: 14, marginBottom: 24 }}>Founder burnout is real. Check in with yourself daily.</p>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>How are you feeling today?</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {MOODS.map(({ emoji, label }) => (
                  <motion.button key={label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setMood(label)}
                    style={{ padding: '12px 20px', borderRadius: 14, border: `2px solid ${mood===label?'#6c63ff':'rgba(108,99,255,0.2)'}`, background: mood===label?'rgba(108,99,255,0.2)':'#1a1a27', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 28 }}>{emoji}</span>
                    <span style={{ fontSize: 12, color: mood===label?'#a78bfa':'#8888aa', fontWeight: 600 }}>{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Anything on your mind? (optional)</label>
              <textarea value={moodNote} onChange={e => setMoodNote(e.target.value)} rows={3}
                placeholder="Write a note to yourself..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveMoodCheckin}
              style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              ✨ Save Check-in
            </motion.button>
            <div style={{ marginTop: 28, padding: '20px', borderRadius: 16, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.1)' }}>
              <h4 style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 12, fontSize: 15 }}>💙 Founder Wellness Tips</h4>
              {['Take breaks every 90 minutes — your brain needs recovery time.','Talk to other founders. You\'re not alone in this journey.','Sleep is a competitive advantage, not a luxury.','Celebrate small wins — progress compounds like interest.'].map(tip => (
                <div key={tip} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#00d4aa', fontSize: 14, marginTop: 1 }}>•</span>
                  <span style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
