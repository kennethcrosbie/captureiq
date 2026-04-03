'use client';

export default function StatCard({ label, value, sub, icon: Icon, trend }) {
  return (
    <div className="bg-brand-navy-light border border-white/5 rounded-xl p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center">
          {Icon && <Icon size={20} className="text-brand-red" />}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-brand-gray mt-1">{label}</p>
      {sub && <p className="text-[10px] text-brand-gray/60 mt-0.5">{sub}</p>}
    </div>
  );
}
