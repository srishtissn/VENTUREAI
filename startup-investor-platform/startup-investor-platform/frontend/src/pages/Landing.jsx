import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SECTORS = ['FinTech','HealthTech','EdTech','AI/ML','SaaS','AgriTech','CleanTech','BioTech'];
const STATS = [{ v:'2,400+', l:'Startups' },{ v:'840+', l:'Investors' },{ v:'$1.2B', l:'Funding Matched' },{ v:'94%', l:'Match Accuracy' }];

function FloatingOrb({ x, y, size, color, delay }) {
  return (
    <motion.div animate={{ y: [0, -30, 0], x: [0, 15, 0] }} transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: color, filter: 'blur(60px)', opacity: 0.25, pointerEvents: 'none' }}/>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -120]);

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <FloatingOrb x="10%" y="20%" size={400} color="#6c63ff" delay={0}/>
        <FloatingOrb x="70%" y="10%" size={300} color="#00d4aa" delay={2}/>
        <FloatingOrb x="50%" y="60%" size={350} color="#4f46e5" delay={4}/>
        <FloatingOrb x="80%" y="70%" size={200} color="#ff6b6b" delay={1}/>
      </div>

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>V</div>
          <span style={{ fontFamily: 'Clash Display, sans-serif', fontWeight: 700, fontSize: 20, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VentureAI</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(108,99,255,0.4)', background: 'transparent', color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>
            Sign In
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
            style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Get Started →
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <motion.section style={{ y: heroY, position: 'relative', zIndex: 5, textAlign: 'center', padding: '80px 20px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 100, border: '1px solid rgba(108,99,255,0.4)', background: 'rgba(108,99,255,0.1)', marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4aa', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
            <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>AI-Powered Startup Intelligence Platform</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
          style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1.05, color: 'white', marginBottom: 24 }}>
          Where Startups<br/>
          <span style={{ background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Meet Capital
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ fontSize: 18, color: '#8888aa', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7 }}>
          AI matchmaking, competitive analysis, and real-time deal flow — connecting the next generation of founders with the right investors.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(108,99,255,0.5)' }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{ padding: '16px 40px', borderRadius: 14, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
            Launch Your Startup 🚀
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            style={{ padding: '16px 40px', borderRadius: 14, border: '1px solid rgba(0,212,170,0.4)', background: 'rgba(0,212,170,0.08)', color: '#00d4aa', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
            Find Startups 💼
          </motion.button>
        </motion.div>

        {/* Sector pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 48 }}>
          {SECTORS.map((s, i) => (
            <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + i * 0.05 }}
              style={{ padding: '6px 16px', borderRadius: 100, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', color: '#a78bfa', fontSize: 13, fontWeight: 500 }}>
              {s}
            </motion.span>
          ))}
        </motion.div>
      </motion.section>

      {/* Stats */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ padding: '40px 40px', position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
          {STATS.map(({ v, l }, i) => (
            <motion.div key={l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center', padding: '28px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.15)' }}>
              <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 36, fontWeight: 700, background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
              <div style={{ color: '#8888aa', fontSize: 14, marginTop: 6 }}>{l}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        style={{ padding: '80px 40px', position: 'relative', zIndex: 5, maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, textAlign: 'center', color: 'white', marginBottom: 60 }}>
          Everything You Need to<br/><span style={{ background: 'linear-gradient(135deg,#6c63ff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Fund & Grow</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {[
            { icon: '🎯', title: 'AI Matchmaking', desc: 'Cosine similarity + Random Forest ML connects startups with perfectly aligned investors in seconds.' },
            { icon: '🔥', title: 'Competition Detector', desc: 'NLP-powered market analysis identifies competitors and measures competition level in real-time.' },
            { icon: '⚡', title: 'Success Predictor', desc: 'Scikit-learn Random Forest model predicts your startup success probability based on 6 key metrics.' },
            { icon: '💬', title: 'Real-time Chat', desc: 'Socket.io powered deal room for negotiations — from first match to signed term sheet.' },
            { icon: '📊', title: 'Sector Analytics', desc: 'Live dashboards showing funding trends, competition density, and success rates by sector.' },
            { icon: '🔮', title: 'Simulation Mode', desc: 'Model funding scenarios and predict outcomes before making critical business decisions.' },
          ].map(({ icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(108,99,255,0.5)' }}
              style={{ padding: '28px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(108,99,255,0.15)', transition: 'all 0.3s', cursor: 'default' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 10 }}>{title}</h3>
              <p style={{ color: '#8888aa', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ padding: '80px 40px', textAlign: 'center', position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 40px', borderRadius: 28, background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.1))', border: '1px solid rgba(108,99,255,0.3)' }}>
          <h2 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 40, fontWeight: 700, color: 'white', marginBottom: 16 }}>Ready to Raise?</h2>
          <p style={{ color: '#8888aa', marginBottom: 32, fontSize: 16 }}>Join thousands of founders and investors already on VentureAI.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/register')}
            style={{ padding: '16px 48px', borderRadius: 14, background: 'linear-gradient(135deg,#6c63ff,#4f46e5)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, boxShadow: '0 20px 60px rgba(108,99,255,0.4)' }}>
            Start Free Today →
          </motion.button>
        </div>
      </motion.section>

      <footer style={{ padding: '30px 40px', textAlign: 'center', color: '#444466', fontSize: 14, position: 'relative', zIndex: 5, borderTop: '1px solid rgba(108,99,255,0.1)' }}>
        © 2024 VentureAI — Built with ❤️ using React, Node.js, FastAPI & Scikit-learn
      </footer>
    </div>
  );
}
