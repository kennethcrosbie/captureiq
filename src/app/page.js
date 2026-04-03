'use client';

import { useState } from 'react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import {
  Film,
  Brain,
  ShieldCheck,
  Clock,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

// Mock data for dashboard
const RECENT_ACTIVITY = [
  { id: 1, action: 'Analysis complete', asset: 'BL4_VaultHunter_Montage_v3.mp4', title: 'Borderlands 4', time: '12 min ago', status: 'complete' },
  { id: 2, action: 'ARC screening flagged', asset: 'NBA2K26_Draft_TV30_v2.mp4', title: 'NBA 2K26', time: '34 min ago', status: 'flagged' },
  { id: 3, action: 'Upload complete', asset: 'CivVII_Announce_Cinematic.mp4', title: 'Civilization VII', time: '1 hr ago', status: 'complete' },
  { id: 4, action: 'ARC screening passed', asset: 'WWE2K26_RoyalRumble_Social.mp4', title: 'WWE 2K26', time: '2 hr ago', status: 'passed' },
  { id: 5, action: 'Prompt workspace export', asset: 'BL4_Launch_Hero_60s.mp4', title: 'Borderlands 4', time: '3 hr ago', status: 'complete' },
];

const QUEUE_ITEMS = [
  { id: 1, name: 'NBA2K26_AllStar_TV15_v1.mp4', title: 'NBA 2K26', progress: 78, stage: 'Analyzing' },
  { id: 2, name: 'BL4_Moze_Gameplay_Raw.mp4', title: 'Borderlands 4', progress: 45, stage: 'Shot Detection' },
  { id: 3, name: 'CivVII_Gandhi_Trailer.mp4', title: 'Civilization VII', progress: 12, stage: 'Uploading' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="CaptureIQ Pipeline Overview" />

      <div className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Film} value="2,847" label="Total Clips" sub="Across all titles" trend={12} />
          <StatCard icon={Brain} value="1,203" label="Analyzed" sub="AI intelligence applied" trend={24} />
          <StatCard icon={ShieldCheck} value="89%" label="ARC Pass Rate" sub="Last 30 days" trend={3} />
          <StatCard icon={Clock} value="4.2s" label="Avg Analysis Time" sub="Per clip (Gemini 2.0)" trend={-15} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Processing Queue */}
          <div className="col-span-2 bg-brand-navy-light border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading-2k text-sm text-white">Processing Queue</h3>
              <span className="text-xs text-brand-gray">{QUEUE_ITEMS.length} items</span>
            </div>
            <div className="space-y-3">
              {QUEUE_ITEMS.map((item) => (
                <div key={item.id} className="bg-brand-navy/50 rounded-lg p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-white font-medium">{item.name}</p>
                      <p className="text-xs text-brand-gray">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-brand-red animate-pulse" />
                      <span className="text-xs text-brand-red font-medium">{item.stage}</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.progress}%`,
                        background: 'linear-gradient(90deg, #C5281C 0%, #FF0D00 100%)',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-brand-gray mt-1 text-right">{item.progress}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Title Breakdown */}
          <div className="bg-brand-navy-light border border-white/5 rounded-xl p-5">
            <h3 className="heading-2k text-sm text-white mb-4">By Title</h3>
            <div className="space-y-4">
              {[
                { title: 'NBA 2K26', count: 1245, color: '#FF6B00', pct: 44 },
                { title: 'Borderlands 4', count: 834, color: '#F5A623', pct: 29 },
                { title: 'WWE 2K26', count: 412, color: '#D4AF37', pct: 14 },
                { title: 'Civilization VII', count: 356, color: '#4ECDC4', pct: 13 },
              ].map((t) => (
                <div key={t.title}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-white">{t.title}</span>
                    <span className="text-xs text-brand-gray">{t.count} clips</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-brand-navy-light border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-2k text-sm text-white">Recent Activity</h3>
            <button className="text-xs text-brand-red hover:text-brand-red/80 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.status === 'flagged' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                  }`}>
                    {item.status === 'flagged'
                      ? <AlertTriangle size={16} className="text-amber-400" />
                      : <CheckCircle2 size={16} className="text-emerald-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.action}</p>
                    <p className="text-xs text-brand-gray">{item.asset}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-gray">{item.title}</p>
                  <p className="text-[10px] text-brand-gray/60">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
