'use client';

import { Bell, Search, User } from 'lucide-react';

export default function Header({ title, subtitle }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-brand-navy/50 backdrop-blur-sm">
      {/* Page Title */}
      <div>
        <h2 className="heading-2k text-lg text-white">{title}</h2>
        {subtitle && <p className="text-xs text-brand-gray mt-0.5">{subtitle}</p>}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input
            type="text"
            placeholder="Search footage..."
            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-brand-gray focus:outline-none focus:border-brand-red/50 w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-brand-gray hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full" />
        </button>

        {/* User avatar */}
        <button className="w-8 h-8 rounded-full bg-brand-navy-mid border border-white/10 flex items-center justify-center text-brand-gray hover:text-white transition-colors">
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
