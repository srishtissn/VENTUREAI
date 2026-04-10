import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { startupAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import toast from 'react-hot-toast';

const SECTORS = ['fintech','healthtech','edtech','agritech','ecommerce','saas','ai-ml','blockchain','cleantech','logistics','proptech','gaming','social','cybersecurity','biotech','spacetech','foodtech','legaltech','hrtech','marketingtech','other'];
const STAGES = ['idea','pre-seed','seed','series-a','series-b','growth'];

const steps = ['Basics','Details','Media','Review'];

export default function SubmitStartup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', sector: '', stage: 'seed',
    fundingRequired: '', teamSize: '', founderExperience: '', marketSize: '',
    revenue: '', website: '', pitchDeckUrl: '', videoPitchUrl: '', location: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setAiAnalyzing(true);
    try {
      toast.loading('🤖 AI analyzing your startup...', { id: 'ai' });
      const res = await startupAPI.create({ ...form, fundingRequired: Number(form.fundingRequired), teamSize: Number(form.teamSize), founderExperience: Number(form.founderExperience), marketSize: Number(form.marketSize) || 0 });
      toast.dismiss('ai');
      toast.success(`🎉 Startup submitted! AI Score: ${Math.round(res.data.aiScore)}%`);
      navigate('/dashboard');
    } catch (err) {
      toast.dismiss('ai');
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); setAiAnalyzing(false); }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)', color: 'white', fontSize: 14, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6, fontWeight: 500 };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ paddingTop: 100, maxWidth: 720, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '100%', height: 3, borderRadius: 2, background: i <= step ? '#6c63ff' : 'rgba(108,99,255,0.2)', transition: 'all 0.3s' }}/>
              <span style={{ fontSize: 12, color: i <= step ? '#a78bfa' : '#8888aa', fontWeight: i === step ? 700 : 400 }}>{s}</span>
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '32px', borderRadius: 24, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)' }}>
          {/* Step 0: Basics */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>The Basics</h2>
              <div><label style={labelStyle}>Startup Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. NeuroLend" style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
              <div><label style={labelStyle}>Tagline *</label><input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="One sentence that captures your vision" style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/></div>
              <div>
                <label style={labelStyle}>Sector * <span style={{ color: '#ff6b6b', fontSize: 11 }}>(Used for AI matching)</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                  {SECTORS.slice(0,12).map(s => (
                    <button key={s} type="button" onClick={() => set('sector', s)}
                      style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${form.sector === s ? '#6c63ff' : 'rgba(108,99,255,0.2)'}`, background: form.sector === s ? 'rgba(108,99,255,0.2)' : '#1a1a27', color: form.sector === s ? '#a78bfa' : '#8888aa', cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>
                      {s.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Stage *</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STAGES.map(s => (
                    <button key={s} type="button" onClick={() => set('stage', s)}
                      style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${form.stage === s ? '#6c63ff' : 'rgba(108,99,255,0.2)'}`, background: form.stage === s ? 'rgba(108,99,255,0.2)' : '#1a1a27', color: form.stage === s ? '#a78bfa' : '#8888aa', cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>The Details</h2>
              <div>
                <label style={labelStyle}>Description * <span style={{ color: '#00d4aa', fontSize: 11 }}>(AI will analyze this for competition + success score)</span></label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
                  placeholder="Describe your startup's problem, solution, target market, and traction. Be specific — this improves your AI score."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                <div style={{ fontSize: 11, color: '#8888aa', marginTop: 6 }}>{form.description.split(' ').filter(w=>w).length} words — aim for 50+ for best AI analysis</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { key: 'fundingRequired', label: 'Funding Required ($)', placeholder: '500000' },
                  { key: 'teamSize', label: 'Team Size', placeholder: '5' },
                  { key: 'founderExperience', label: 'Founder Experience (years)', placeholder: '3' },
                  { key: 'marketSize', label: 'Market Size ($)', placeholder: '1000000000' },
                  { key: 'revenue', label: 'Monthly Revenue ($)', placeholder: '0' },
                  { key: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                      style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Media */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>Media & Links</h2>
              {[
                { key: 'website', label: 'Website URL', placeholder: 'https://yourstartup.com' },
                { key: 'pitchDeckUrl', label: 'Pitch Deck URL (Google Drive, Notion, etc.)', placeholder: 'https://drive.google.com/...' },
                { key: 'videoPitchUrl', label: 'Video Pitch URL (YouTube, Loom)', placeholder: 'https://youtube.com/...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={inputStyle} onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
                </div>
              ))}
              <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>🤖 AI Features Enabled</div>
                <ul style={{ fontSize: 13, color: '#8888aa', lineHeight: 2 }}>
                  <li>✅ Success prediction (Random Forest ML)</li>
                  <li>✅ Competition detection (NLP + Cosine similarity)</li>
                  <li>✅ Auto investor matching</li>
                  <li>✅ Trust score calculation</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>Review & Submit</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Name', value: form.name }, { label: 'Sector', value: form.sector }, { label: 'Stage', value: form.stage },
                  { label: 'Funding', value: `$${Number(form.fundingRequired||0).toLocaleString()}` },
                  { label: 'Team Size', value: form.teamSize }, { label: 'Location', value: form.location || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '12px 16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.15)' }}>
                    <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.15)' }}>
                <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 6 }}>Description Preview</div>
                <p style={{ fontSize: 13, color: '#ccccdd', lineHeight: 1.6 }}>{form.description.slice(0,200)}{form.description.length > 200 ? '...' : ''}</p>
              </div>
              {aiAnalyzing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '16px', borderRadius: 12, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, border: '2px solid #6c63ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}/>
                  <p style={{ color: '#a78bfa', fontSize: 14, fontWeight: 600 }}>AI is analyzing your startup...</p>
                  <p style={{ color: '#8888aa', fontSize: 12, marginTop: 4 }}>Running NLP + Random Forest models</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(108,99,255,0.3)', background: 'transparent', color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
            ) : <div/>}
            {step < 3 ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && (!form.name || !form.sector || !form.stage)}
                style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                Continue →
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={loading}
                style={{ padding: '12px 32px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
                {loading ? '🤖 Analyzing...' : '🚀 Submit Startup'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
