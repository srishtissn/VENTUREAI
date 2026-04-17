import React from 'react';
const colors = { fintech:'#00d4aa',healthtech:'#ff6b6b',edtech:'#ffd93d',saas:'#6c63ff',ai_ml:'#a78bfa','ai-ml':'#a78bfa',blockchain:'#f59e0b',ecommerce:'#3b82f6',agritech:'#22c55e',cleantech:'#10b981',gaming:'#ec4899',cybersecurity:'#ef4444',biotech:'#8b5cf6',other:'#6b7280' };
export default function SectorBadge({ sector }) {
  const c = colors[sector?.toLowerCase()?.replace(' ','_')] || '#6c63ff';
  return (
    <span className="px-2 py-0.5 rounded-md text-xs font-semibold capitalize"
      style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}>
      {sector?.replace(/-/g,' ')}
    </span>
  );
}
