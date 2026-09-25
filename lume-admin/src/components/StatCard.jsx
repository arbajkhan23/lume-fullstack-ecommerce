import React from 'react';

export default function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <div className="panel p-5 flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted font-medium mb-2">{label}</p>
        <p className={`text-2xl font-display ${accent ? 'text-accent' : 'text-white'}`}>{value}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent flex-shrink-0">
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
