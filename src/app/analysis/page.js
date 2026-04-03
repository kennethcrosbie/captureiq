'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Clock,
  Film,
  Play,
  Swords,
  Eye,
  Target,
  Camera,
  MapPin,
  User,
  Users,
  Crosshair,
  Mountain,
  Gamepad2,
} from 'lucide-react';

// Title-specific field icons
const FIELD_ICONS = {
  Player: User, Team: Users, Action: Gamepad2, 'Camera Angle': Camera,
  'Court Location': MapPin, 'Game State': Target,
  'Vault Hunter': User, Weapon: Crosshair, 'Ability/Action': Gamepad2,
  Enemy: Swords, Environment: Mountain,
  Superstar: User, 'Move/Action': Gamepad2, 'Match Type': Target,
  Arena: MapPin, 'Crowd Heat': Users,
  Leader: User, Era: Clock, 'Game Mechanic': Gamepad2,
  'Biome/Wonder': Mountain, 'UI Elements': Eye,
};

// Mock analysis data — NBA 2K26
const MOCK_NBA_SHOTS = [
  {
    shotNumber: 1, timecodeIn: '00:00:00:00', timecodeOut: '00:00:02:15', duration: 2.5,
    shotType: 'Wide Establishing', description: 'Arena exterior, crowd entering',
    intel: { Player: '—', Team: 'Lakers', Action: 'Pre-game', 'Camera Angle': 'Wide aerial', 'Court Location': 'Exterior', 'Game State': 'Pre-game' },
    flags: [],
  },
  {
    shotNumber: 2, timecodeIn: '00:00:02:15', timecodeOut: '00:00:05:00', duration: 2.5,
    shotType: 'Medium', description: 'LeBron James warming up at half court',
    intel: { Player: 'LeBron James', Team: 'Lakers', Action: 'Warm-up dribble', 'Camera Angle': 'Medium tracking', 'Court Location': 'Half court', 'Game State': 'Pre-game' },
    flags: [],
  },
  {
    shotNumber: 3, timecodeIn: '00:00:05:00', timecodeOut: '00:00:08:12', duration: 3.4,
    shotType: 'Close-up', description: 'Tip-off, ball in the air',
    intel: { Player: 'Anthony Davis', Team: 'Lakers vs Celtics', Action: 'Tip-off jump', 'Camera Angle': 'Low angle close-up', 'Court Location': 'Center court', 'Game State': 'Tip-off' },
    flags: [],
  },
  {
    shotNumber: 4, timecodeIn: '00:00:08:12', timecodeOut: '00:00:12:00', duration: 3.8,
    shotType: 'Tracking', description: 'Fast break, LeBron drives to the basket',
    intel: { Player: 'LeBron James', Team: 'Lakers', Action: 'Fast break drive', 'Camera Angle': 'Broadcast tracking', 'Court Location': 'Paint / key', 'Game State': 'Live play — Q1' },
    flags: [],
  },
  {
    shotNumber: 5, timecodeIn: '00:00:12:00', timecodeOut: '00:00:14:15', duration: 2.5,
    shotType: 'Replay', description: 'Slam dunk replay from multiple angles',
    intel: { Player: 'LeBron James', Team: 'Lakers', Action: 'Slam dunk (replay)', 'Camera Angle': 'Multi-angle replay', 'Court Location': 'Basket', 'Game State': 'Replay' },
    flags: [],
  },
];

// Mock analysis data — Borderlands 4
const MOCK_BL4_SHOTS = [
  {
    shotNumber: 1, timecodeIn: '00:00:00:00', timecodeOut: '00:00:03:10', duration: 3.3,
    shotType: 'Wide Establishing', description: 'Pandora desert vista, ship flying overhead',
    intel: { 'Vault Hunter': '—', Weapon: '—', 'Ability/Action': '—', Enemy: '—', Environment: 'Pandora — Arid Badlands', 'Camera Angle': 'Wide establishing' },
    flags: [],
  },
  {
    shotNumber: 2, timecodeIn: '00:00:03:10', timecodeOut: '00:00:06:20', duration: 3.3,
    shotType: 'Medium', description: 'FL4K emerges from vehicle with pet Skag',
    intel: { 'Vault Hunter': 'FL4K', Weapon: 'Jakobs Revolver', 'Ability/Action': 'Vehicle exit', Enemy: '—', Environment: 'Pandora — Settlement', 'Camera Angle': 'Medium profile' },
    flags: [],
  },
  {
    shotNumber: 3, timecodeIn: '00:00:06:20', timecodeOut: '00:00:10:00', duration: 3.3,
    shotType: 'Action CU', description: 'FL4K opens fire on psycho bandits',
    intel: { 'Vault Hunter': 'FL4K', Weapon: 'Atlas Assault Rifle', 'Ability/Action': 'Gunfire — sustained', Enemy: 'Psycho Bandits (x4)', Environment: 'Pandora — Bandit Camp', 'Camera Angle': 'OTS action' },
    flags: [{ type: 'violence', label: 'Gunfire + enemy kills', severity: 'medium' }],
  },
  {
    shotNumber: 4, timecodeIn: '00:00:10:00', timecodeOut: '00:00:13:15', duration: 3.5,
    shotType: 'Action Wide', description: 'Explosion, blood splatter, enemies ragdoll',
    intel: { 'Vault Hunter': 'FL4K', Weapon: 'Torgue Rocket Launcher', 'Ability/Action': 'Explosive kill — AoE', Enemy: 'Psycho Bandits (x6)', Environment: 'Pandora — Bandit Camp', 'Camera Angle': 'Wide action' },
    flags: [
      { type: 'violence', label: 'Blood splatter visible', severity: 'high' },
      { type: 'violence', label: 'Weapon fired toward camera', severity: 'high' },
    ],
  },
  {
    shotNumber: 5, timecodeIn: '00:00:13:15', timecodeOut: '00:00:16:00', duration: 2.5,
    shotType: 'Close-up', description: 'FL4K activates Fade Away action skill',
    intel: { 'Vault Hunter': 'FL4K', Weapon: 'Jakobs Revolver', 'Ability/Action': 'Fade Away (Action Skill)', Enemy: 'Badass Psycho', Environment: 'Pandora — Arena', 'Camera Angle': 'Close-up profile' },
    flags: [],
  },
];

const TITLE_DATA = {
  'nba-2k26': { label: 'NBA 2K26', color: '#FF6B00', shots: MOCK_NBA_SHOTS },
  'borderlands-4': { label: 'Borderlands 4', color: '#F5A623', shots: MOCK_BL4_SHOTS },
};

function ShotRow({ shot, titleId }) {
  const [expanded, setExpanded] = useState(false);
  const hasFlags = shot.flags && shot.flags.length > 0;

  return (
    <div className="border-b border-white/5 last:border-0">
      <div
        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={14} className="text-brand-gray" /> : <ChevronRight size={14} className="text-brand-gray" />}

        <span className="text-xs text-brand-gray font-mono w-8">#{shot.shotNumber}</span>
        <span className="text-xs text-brand-gray font-mono w-28">{shot.timecodeIn}</span>
        <span className="text-xs text-brand-gray w-12 text-center">{shot.duration}s</span>
        <span className="text-xs text-white/60 w-28">{shot.shotType}</span>
        <span className="text-sm text-white flex-1 truncate">{shot.description}</span>

        {hasFlags && (
          <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full">
            {shot.flags.length} flag{shot.flags.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 pl-12">
          <div className="bg-brand-navy/50 rounded-lg p-4 border border-white/5">
            <h4 className="text-[10px] text-brand-gray uppercase tracking-wider mb-3">Shot Intelligence</h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(shot.intel).map(([field, value]) => {
                const Icon = FIELD_ICONS[field] || Film;
                return (
                  <div key={field} className="flex items-start gap-2">
                    <Icon size={14} className="text-brand-red mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-brand-gray">{field}</p>
                      <p className="text-xs text-white">{value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasFlags && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <h4 className="text-[10px] text-brand-gray uppercase tracking-wider mb-2">Content Flags</h4>
                <div className="space-y-2">
                  {shot.flags.map((flag, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                      flag.severity === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <Swords size={12} />
                      <span>{flag.label}</span>
                      <span className="ml-auto text-[10px] opacity-60">{flag.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const [activeTitle, setActiveTitle] = useState('nba-2k26');
  const [analyzing, setAnalyzing] = useState(false);
  const data = TITLE_DATA[activeTitle];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2500);
  };

  return (
    <div className="min-h-screen">
      <Header title="Analysis" subtitle="AI-powered footage intelligence" />

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              className="bg-brand-navy-light border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red/50"
              value={activeTitle}
              onChange={(e) => setActiveTitle(e.target.value)}
            >
              <option value="nba-2k26">NBA 2K26</option>
              <option value="borderlands-4">Borderlands 4</option>
            </select>

            <select className="bg-brand-navy-light border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red/50">
              <option>NBA2K26_Draft_TV30_v2.mp4</option>
              <option>NBA2K26_GameplayReveal_60s.mp4</option>
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #C5281C 0%, #FF0D00 100%)' }}
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Gemini...
              </>
            ) : (
              <>
                <Brain size={16} />
                Analyze with Gemini
              </>
            )}
          </button>
        </div>

        {/* Analysis Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-brand-navy-light border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-brand-gray uppercase tracking-wider">Shots Detected</p>
            <p className="text-2xl font-bold text-white mt-1">{data.shots.length}</p>
          </div>
          <div className="bg-brand-navy-light border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-brand-gray uppercase tracking-wider">Total Duration</p>
            <p className="text-2xl font-bold text-white mt-1">
              {data.shots.reduce((acc, s) => acc + s.duration, 0).toFixed(1)}s
            </p>
          </div>
          <div className="bg-brand-navy-light border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-brand-gray uppercase tracking-wider">Content Flags</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {data.shots.reduce((acc, s) => acc + (s.flags?.length || 0), 0)}
            </p>
          </div>
          <div className="bg-brand-navy-light border border-white/5 rounded-xl p-4">
            <p className="text-[10px] text-brand-gray uppercase tracking-wider">Title</p>
            <p className="text-2xl font-bold mt-1" style={{ color: data.color }}>{data.label}</p>
          </div>
        </div>

        {/* Shot Timeline */}
        <div className="bg-brand-navy-light border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="heading-2k text-xs text-white">Shot-by-Shot Analysis</h3>
            <span className="text-[10px] text-brand-gray">Click a row to expand intelligence</span>
          </div>
          {/* Column headers */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-white/5 bg-white/[0.02]">
            <span className="w-[14px]" />
            <span className="text-[10px] text-brand-gray uppercase w-8">#</span>
            <span className="text-[10px] text-brand-gray uppercase w-28">Timecode In</span>
            <span className="text-[10px] text-brand-gray uppercase w-12 text-center">Dur</span>
            <span className="text-[10px] text-brand-gray uppercase w-28">Shot Type</span>
            <span className="text-[10px] text-brand-gray uppercase flex-1">Description</span>
            <span className="text-[10px] text-brand-gray uppercase w-16">Flags</span>
          </div>
          {data.shots.map((shot) => (
            <ShotRow key={shot.shotNumber} shot={shot} titleId={activeTitle} />
          ))}
        </div>
      </div>
    </div>
  );
}
