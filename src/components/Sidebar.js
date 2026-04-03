'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Brain,
  Terminal,
  ShieldCheck,
  Settings,
  HelpCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Footage Browser', path: '/browse', icon: Film },
  { label: 'Analysis', path: '/analysis', icon: Brain },
  { label: 'Prompt Workspace', path: '/prompt', icon: Terminal },
  { label: 'ARC Screener', path: '/screener', icon: ShieldCheck },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Help', path: '/help', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-brand-navy flex flex-col border-r border-white/5 z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #C5281C 0%, #FF0D00 100%)' }}
          >
            CQ
          </div>
          <div>
            <h1 className="heading-2k text-sm text-white leading-tight">CaptureIQ</h1>
            <p className="text-[10px] text-brand-gray tracking-wider uppercase">AI Pipeline</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-red/15 text-brand-red'
                  : 'text-brand-gray hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Title selector */}
      <div className="px-3 py-3 border-t border-white/5">
        <label className="text-[10px] text-brand-gray uppercase tracking-wider block mb-2 px-3">
          Active Title
        </label>
        <select
          className="w-full bg-brand-navy-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red/50"
          defaultValue="nba-2k26"
        >
          <option value="nba-2k26">NBA 2K26</option>
          <option value="borderlands-4">Borderlands 4</option>
          <option value="wwe-2k26">WWE 2K26</option>
          <option value="civ-vii">Civilization VII</option>
        </select>
      </div>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-brand-gray hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
