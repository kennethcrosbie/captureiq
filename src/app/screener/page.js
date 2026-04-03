'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import {
  ShieldCheck,
  Upload,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Swords,
  Eye,
  MessageSquare,
  Shield,
  ChevronDown,
  ChevronRight,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { ARC_CATEGORIES, DELIVERY_CHANNELS, TECHNICAL_CHECKS } from '../../lib/constants';

// Category icons map
const CATEGORY_ICONS = {
  violence: Swords,
  sex: Eye,
  alcohol_drugs: AlertTriangle,
  language: MessageSquare,
  sensitivity: Shield,
};

// Mock ARC screening results — BL4 General Audience TV spot
const MOCK_RESULT_FLAGGED = {
  overallStatus: 'fail',
  gameTitle: 'Borderlands 4',
  gameRating: 'M',
  deliveryChannel: 'tv_cinema',
  audienceTarget: 'General Audience (All Ages)',
  summary: 'This edit contains 3 violations that prevent TV/Cinema broadcast for a general audience. Blood splatter, weapon fired toward camera, and excessive kill montage all violate ARC Section II.B for this delivery channel.',
  preclearanceRecommended: true,
  contentFlags: [
    {
      category: 'Violence',
      severity: 'critical',
      timecode: '00:00:10:00 – 00:00:13:15',
      description: 'Visible blood splatter during explosion sequence. Blood is entirely prohibited in TV/Cinema advertising regardless of game rating.',
      arcRef: 'Section II.B.1',
      recommendation: 'Remove or replace blood VFX with non-red particle effects. Consider using stylized impact effects instead.',
    },
    {
      category: 'Violence',
      severity: 'critical',
      timecode: '00:00:10:00 – 00:00:13:15',
      description: 'Weapon (Torgue Rocket Launcher) fired directly toward the camera. Depictions of weapons aimed at the viewer are prohibited in general audience advertising.',
      arcRef: 'Section II.B.1',
      recommendation: 'Use alternate angle where weapon is fired away from camera, or cut before the muzzle flash frame.',
    },
    {
      category: 'Violence',
      severity: 'warning',
      timecode: '00:00:06:20 – 00:00:13:15',
      description: 'Rapid succession of enemy kills (10 kills in 6.6 seconds) creates an excessive violence impression unsuitable for general audience TV placement.',
      arcRef: 'Section II.B.1',
      recommendation: 'Reduce kill count in montage or intercut with non-combat gameplay moments (exploration, dialogue, loot).',
    },
  ],
  technicalChecks: [
    { check: 'Rating Slate', status: 'fail', details: 'No ESRB rating slate detected. Required at 50% screen height for minimum 2 seconds.', arcRef: 'VI.E.1' },
    { check: 'Rating Icon Overlay', status: 'fail', details: 'No rating icon overlay found. Required at 15% screen height for general audience placement.', arcRef: 'VI.E.2' },
    { check: 'First 4 Seconds Clean', status: 'pass', details: 'Opening 4 seconds contain establishing shot only — no restricted content.', arcRef: 'VI.E.3' },
    { check: 'Content Descriptors', status: 'fail', details: 'Blood and Gore, Intense Violence descriptors not displayed.', arcRef: 'VI.E.4' },
  ],
};

// Mock ARC screening results — NBA 2K26 Clean
const MOCK_RESULT_CLEAN = {
  overallStatus: 'pass',
  gameTitle: 'NBA 2K26',
  gameRating: 'E',
  deliveryChannel: 'tv_cinema',
  audienceTarget: 'General Audience (All Ages)',
  summary: 'This edit passes ARC compliance for TV/Cinema broadcast. No content flags detected. All technical requirements met.',
  preclearanceRecommended: false,
  contentFlags: [],
  technicalChecks: [
    { check: 'Rating Slate', status: 'pass', details: 'ESRB E rating slate present at 52% screen height for 2.5 seconds.', arcRef: 'VI.E.1' },
    { check: 'Rating Icon Overlay', status: 'pass', details: 'E rating icon overlay at 16% screen height, displayed throughout.', arcRef: 'VI.E.2' },
    { check: 'First 4 Seconds Clean', status: 'pass', details: 'Arena establishing shot — fully compliant.', arcRef: 'VI.E.3' },
    { check: 'Content Descriptors', status: 'pass', details: 'No applicable descriptors required for E-rated content.', arcRef: 'VI.E.4' },
  ],
};

function StatusIcon({ status }) {
  if (status === 'pass') return <CheckCircle2 size={16} className="text-emerald-400" />;
  if (status === 'fail') return <XCircle size={16} className="text-red-400" />;
  return <AlertTriangle size={16} className="text-amber-400" />;
}

function SeverityBadge({ severity }) {
  const styles = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${styles[severity] || styles.info}`}>
      {severity}
    </span>
  );
}

export default function ScreenerPage() {
  const [selectedChannel, setSelectedChannel] = useState('tv_cinema');
  const [selectedTitle, setSelectedTitle] = useState('borderlands-4');
  const [audienceTarget, setAudienceTarget] = useState('General Audience (All Ages)');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedFlag, setExpandedFlag] = useState(null);
  const [showArcRef, setShowArcRef] = useState(false);

  const channel = DELIVERY_CHANNELS.find(c => c.id === selectedChannel);

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setResult(selectedTitle === 'nba-2k26' ? MOCK_RESULT_CLEAN : MOCK_RESULT_FLAGGED);
      setScanning(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      <Header title="ARC Compliance Screener" subtitle="ESRB Advertising Review Council — Section II.B Content Screening" />

      <div className="p-6 space-y-6">
        {/* Upload & Configuration */}
        <div className="grid grid-cols-3 gap-6">
          {/* Upload Zone */}
          <div className="col-span-1">
            <div className="bg-brand-navy-light border border-white/5 rounded-xl p-5 h-full">
              <h3 className="heading-2k text-xs text-white mb-4">Upload Edit</h3>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-brand-red/30 transition-colors cursor-pointer">
                <Upload size={28} className="mx-auto mb-3 text-brand-gray" />
                <p className="text-sm text-white font-medium">Drop complete edit here</p>
                <p className="text-xs text-brand-gray mt-1">MP4, MOV up to 10GB</p>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] text-brand-gray uppercase tracking-wider block mb-1.5">Game Title</label>
                  <select
                    className="w-full bg-brand-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red/50"
                    value={selectedTitle}
                    onChange={(e) => { setSelectedTitle(e.target.value); setResult(null); }}
                  >
                    <option value="nba-2k26">NBA 2K26 (E)</option>
                    <option value="borderlands-4">Borderlands 4 (M)</option>
                    <option value="wwe-2k26">WWE 2K26 (T)</option>
                    <option value="civ-vii">Civilization VII (E10+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-brand-gray uppercase tracking-wider block mb-1.5">Target Audience</label>
                  <select
                    className="w-full bg-brand-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red/50"
                    value={audienceTarget}
                    onChange={(e) => setAudienceTarget(e.target.value)}
                  >
                    <option>General Audience (All Ages)</option>
                    <option>Teen & Up</option>
                    <option>Mature (17+)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Channel Selection */}
          <div className="col-span-2">
            <div className="bg-brand-navy-light border border-white/5 rounded-xl p-5 h-full">
              <h3 className="heading-2k text-xs text-white mb-4">Delivery Channel</h3>
              <p className="text-xs text-brand-gray mb-4">
                Select where this edit will be delivered. The channel determines which ARC rules apply and how strictly content is evaluated.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DELIVERY_CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => { setSelectedChannel(ch.id); setResult(null); }}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedChannel === ch.id
                        ? 'border-brand-red bg-brand-red/5'
                        : 'border-white/5 hover:border-white/15 bg-brand-navy/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${selectedChannel === ch.id ? 'text-white' : 'text-white/70'}`}>
                        {ch.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        ch.strictness === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        ch.strictness === 'medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      }`}>
                        {ch.strictness === 'high' ? 'Strict' : ch.strictness === 'medium' ? 'Moderate' : 'Flexible'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-gray">{ch.desc}</p>
                  </button>
                ))}
              </div>

              {/* Channel rules callout */}
              <div className="mt-4 bg-brand-navy/50 border border-white/5 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-brand-red mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-white font-medium mb-1">{channel?.label} Rules</p>
                    <p className="text-xs text-brand-gray">{channel?.rules}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scan button */}
        <button
          onClick={handleScan}
          disabled={scanning}
          className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 heading-2k tracking-wider"
          style={{ background: 'linear-gradient(135deg, #C5281C 0%, #FF0D00 100%)' }}
        >
          {scanning ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Screening edit with Gemini — checking ARC compliance...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShieldCheck size={18} />
              Screen Edit for ARC Compliance
            </span>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall verdict */}
            <div className={`rounded-xl p-6 border ${
              result.overallStatus === 'pass'
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <div className="flex items-center gap-4">
                {result.overallStatus === 'pass' ? (
                  <CheckCircle2 size={40} className="text-emerald-400" />
                ) : (
                  <XCircle size={40} className="text-red-400" />
                )}
                <div className="flex-1">
                  <h3 className="heading-2k text-lg text-white">
                    {result.overallStatus === 'pass' ? 'ARC Compliant' : 'ARC Violations Detected'}
                  </h3>
                  <p className="text-sm text-brand-gray mt-1">{result.summary}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-gray">{result.gameTitle} ({result.gameRating})</p>
                  <p className="text-xs text-brand-gray">{channel?.label} → {result.audienceTarget}</p>
                </div>
              </div>

              {result.preclearanceRecommended && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-200">
                    <strong>Preclearance recommended.</strong> TV/Cinema placements with content flags should be submitted to ESRB for preclearance review before broadcast.
                  </p>
                </div>
              )}
            </div>

            {/* Content Flags */}
            {result.contentFlags.length > 0 && (
              <div className="bg-brand-navy-light border border-white/5 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="heading-2k text-xs text-white">
                    Content Flags ({result.contentFlags.length})
                  </h3>
                  <button
                    className="text-xs text-brand-red hover:text-brand-red/80 flex items-center gap-1"
                    onClick={() => setShowArcRef(!showArcRef)}
                  >
                    <FileText size={12} />
                    {showArcRef ? 'Hide' : 'Show'} ARC References
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {result.contentFlags.map((flag, i) => (
                    <div key={i} className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <SeverityBadge severity={flag.severity} />
                          <span className="text-sm text-white font-medium">{flag.category}</span>
                          {showArcRef && (
                            <span className="text-[10px] text-brand-red font-mono">{flag.arcRef}</span>
                          )}
                        </div>
                        <span className="text-xs text-brand-gray font-mono">{flag.timecode}</span>
                      </div>
                      <p className="text-sm text-brand-gray mt-2">{flag.description}</p>
                      <div className="mt-3 bg-brand-navy/50 border border-white/5 rounded-lg p-3">
                        <p className="text-[10px] text-brand-gray uppercase tracking-wider mb-1">Recommendation</p>
                        <p className="text-xs text-white">{flag.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Compliance */}
            <div className="bg-brand-navy-light border border-white/5 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="heading-2k text-xs text-white">Technical Compliance (Section VI.E)</h3>
              </div>
              <div className="divide-y divide-white/5">
                {result.technicalChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <StatusIcon status={check.status} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{check.check}</span>
                        {showArcRef && (
                          <span className="text-[10px] text-brand-red font-mono">{check.arcRef}</span>
                        )}
                      </div>
                      <p className="text-xs text-brand-gray mt-0.5">{check.details}</p>
                    </div>
                    <span className={`text-xs font-semibold uppercase ${
                      check.status === 'pass' ? 'text-emerald-400' : check.status === 'fail' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ARC Categories Reference */}
            <div className="bg-brand-navy-light border border-white/5 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h3 className="heading-2k text-xs text-white">ARC Section II.B Content Categories Reference</h3>
              </div>
              <div className="grid grid-cols-5 divide-x divide-white/5">
                {ARC_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id] || Shield;
                  const hasFlag = result.contentFlags.some(f => f.category.toLowerCase().includes(cat.id.replace('_', ' ').split(' ')[0]));
                  return (
                    <div key={cat.id} className={`p-4 text-center ${hasFlag ? 'bg-red-500/5' : ''}`}>
                      <Icon size={20} className={`mx-auto mb-2 ${hasFlag ? 'text-red-400' : 'text-brand-gray'}`} />
                      <p className={`text-xs font-medium ${hasFlag ? 'text-red-400' : 'text-white/70'}`}>{cat.label}</p>
                      <p className="text-[10px] text-brand-gray mt-1">{cat.desc}</p>
                      <p className="text-[10px] text-brand-red/60 mt-1">{cat.arcRef}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
