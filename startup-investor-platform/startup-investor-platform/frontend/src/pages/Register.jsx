import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roles = [{ value: 'founder', label: '🚀 Founder', desc: 'I have a startup to fund' }, { value: 'investor', label: '💼 Investor', desc: 'I want to invest in startups' }];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) return toast.error('Please select your role');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to VentureAI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: '#6c63ff', filter: 'blur(120px)', opacity: 0.1 }}/>
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 5 }}>
        <div style={{ padding: '40px', borderRadius: 24, background: '#12121a', border: '1px solid rgba(108,99,255,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, fontWeight: 700, color: 'white' }}>Create Account</h1>
            <p style={{ color: '#8888aa', fontSize: 14, marginTop: 8 }}>Join VentureAI — it's free</p>
          </div>

          {/* Role Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {roles.map(({ value, label, desc }) => (
              <motion.button key={value} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setForm({ ...form, role: value })}
                style={{ padding: '16px 12px', borderRadius: 14, background: form.role === value ? 'rgba(108,99,255,0.2)' : '#1a1a27', border: `2px solid ${form.role === value ? '#6c63ff' : 'rgba(108,99,255,0.15)'}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{label.split(' ')[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: form.role === value ? '#a78bfa' : '#8888aa' }}>{label.split(' ')[1]}</div>
                <div style={{ fontSize: 11, color: '#666688', marginTop: 4 }}>{desc}</div>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[{ key: 'name', label: 'Full Name', type: 'text', placeholder: 'Alex Johnson' }, { key: 'email', label: 'Email', type: 'email', placeholder: 'alex@startup.com' }, { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' }].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, color: '#8888aa', marginBottom: 6, fontWeight: 500 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#1a1a27', border: '1px solid rgba(108,99,255,0.2)', color: 'white', fontSize: 14, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#6c63ff'} onBlur={e => e.target.style.borderColor = 'rgba(108,99,255,0.2)'}/>
              </div>
            ))}
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, marginTop: 8 }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </motion.button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#8888aa' }}>
            Already a member? <Link to="/login" style={{ color: '#6c63ff', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
