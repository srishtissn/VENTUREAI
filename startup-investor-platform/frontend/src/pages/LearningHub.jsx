import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { learningAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','fundraising','pitching','legal','marketing','product','growth','finance','mindset'];
const TYPES = ['all','article','video','course','template','checklist'];
const typeIcon = { article:'📄', video:'🎬', course:'🎓', template:'📋', checklist:'✅' };
const diffColor = { beginner:'#00d4aa', intermediate:'#ffd93d', advanced:'#ff6b6b' };

export default function LearningHub() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (type !== 'all') params.type = type;
      const res = await learningAPI.list(params);
      setResources(res.data.resources || []);
    } catch { toast.error('Failed to load resources'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category, type]);

  const handleLike = async (id) => {
    try {
      await learningAPI.like(id);
      setResources(prev => prev.map(r => r._id === id ? { ...r, likes: (r.likes||0)+1 } : r));
      toast.success('❤️ Liked!');
    } catch {}
  };

  const filtered = resources.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar/>
      <main style={{ paddingTop: 80, maxWidth: 1100, margin: '0 auto', padding: '80px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 32, fontWeight: 700, color: 'white' }}>Learning Hub 🧠</h1>
          <p style={{ color: '#8888aa', marginTop: 6 }}>Curated resources to help you raise, grow and succeed</p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search resources..."
            style={{ padding: '12px 16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)', color: 'white', fontSize: 14, outline: 'none', maxWidth: 400 }}
            onFocus={e => e.target.style.borderColor='#6c63ff'} onBlur={e => e.target.style.borderColor='rgba(108,99,255,0.2)'}/>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${category===c?'#6c63ff':'rgba(108,99,255,0.2)'}`, background: category===c?'rgba(108,99,255,0.2)':'transparent', color: category===c?'#a78bfa':'#8888aa', cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${type===t?'#00d4aa':'rgba(108,99,255,0.2)'}`, background: type===t?'rgba(0,212,170,0.15)':'transparent', color: type===t?'#00d4aa':'#8888aa', cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
                {typeIcon[t]||'📚'} {t}
              </button>
            ))}
          </div>
        </div>

        {/* Resources grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6c63ff' }}>Loading resources...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                style={{ padding: '24px', borderRadius: 20, background: '#12121a', border: `1px solid ${r.isFeatured ? 'rgba(108,99,255,0.4)' : 'rgba(108,99,255,0.15)'}`, position: 'relative', overflow: 'hidden' }}>
                {r.isFeatured && (
                  <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 20, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', fontSize: 11, fontWeight: 700, color: 'white' }}>⭐ Featured</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{typeIcon[r.type] || '📚'}</span>
                  <div>
                    <div style={{ fontSize: 12, color: diffColor[r.difficulty], fontWeight: 600, textTransform: 'capitalize' }}>{r.difficulty}</div>
                    <div style={{ fontSize: 11, color: '#8888aa', textTransform: 'capitalize' }}>{r.type} · {r.duration}</div>
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 10, lineHeight: 1.3 }}>{r.title}</h3>
                <p style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {r.tags?.slice(0,3).map(t => (
                    <span key={t} style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(108,99,255,0.1)', color: '#a78bfa', fontSize: 11 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(108,99,255,0.1)' }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#8888aa' }}>
                    <span>👁 {r.views || 0}</span>
                    <span style={{ textTransform: 'capitalize', color: '#a78bfa' }}>📂 {r.category}</span>
                  </div>
                  <button onClick={() => handleLike(r._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#ff6b6b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    ❤️ {r.likes || 0}
                  </button>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && !loading && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#8888aa' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                <p>No resources found. Try a different filter.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
