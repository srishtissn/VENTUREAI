import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: '#6c63ff', filter: 'blur(100px)', opacity: 0.12 }}/>
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: '#00d4aa', filter: 'blur(100px)', opacity: 0.1 }}/>
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '40px', borderRadius: 24, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: 20, margin: '0 auto 16px' }}>V</div>
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color: 'white' }}>Welcome back</h1>
            <p style={{ color: '#8888aa', fontSize: 14, marginTop: 8 }}>Sign in to VentureAI</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[{ key: 'email', label: 'Email', type: 'email', placeholder: 'you@startup.com' }, { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' }].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6, fontWeight: 500 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)', color: 'white', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#6c63ff'} onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.2)'}/>
              </div>
            ))}
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, marginTop: 8 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </motion.button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#8888aa' }}>
            No account? <Link to="/register" style={{ color: '#6c63ff', fontWeight: 600 }}>Create one →</Link>
          </p>
          {/* Demo accounts */}
          <div style={{ marginTop: 24, padding: '16px', borderRadius: 12, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)' }}>
            <p style={{ fontSize: 12, color: '#8888aa', marginBottom: 8, fontWeight: 600 }}>DEMO ACCOUNTS</p>
            {[{ email: 'founder@demo.com', role: 'Founder' }, { email: 'investor@demo.com', role: 'Investor' }].map(d => (
              <div key={d.email} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a78bfa', marginBottom: 4 }}>
                <span>{d.role}: {d.email}</span><span>pass: demo1234</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
