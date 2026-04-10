import React from 'react';
import { motion } from 'framer-motion';
export default function StatCard({ icon, label, value, sub, color = '#6c63ff', delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: '#12121a', border: '1px solid rgba(108,99,255,0.15)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${color}15` }}>{icon}</div>
      <div>
        <div className="text-2xl font-display font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color }}>{sub}</div>}
      </div>
    </motion.div>
  );
}
