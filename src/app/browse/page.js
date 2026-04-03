'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import {
  Upload,
  Grid,
  List,
  Filter,
  Search,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Film,
  ChevronDown,
} from 'lucide-react';

// Mock footage data
const MOCK_FOOTAGE = [
  {
    id: 'f1',
    name: 'NBA2K26_Draft_TV30_v2.mp4',
    title: 'nba-2k26',
    titleLabel: 'NBA 2K26',
    duration: '0:30',
    resolution: '1920x1080',
    size: '245 MB',
    uploadedAt: '2 hours ago',
    analyzed: true,
    arcStatus: 'flagged',
    shotCount: 12,
    thumbnail: null,
  },
  {
    id: 'f2',
    name: 'BL4_VaultHunter_Montage_v3.mp4',
    title: 'borderlands-4',
    titleLabel: 'Borderlands 4',
    duration: '1:15',
    resolution: '3840x2160',
    size: '1.2 GB',
    uploadedAt: '5 hours ago',
    analyzed: true,
    arcStatus: 'pass',
    shotCount: 24,
    thumbnail: null,
  },
  {
    id: 'f3',
    name: 'CivVII_Announce_Cinematic.mp4',
    title: 'civ-vii',
    titleLabel: 'Civilization VII',
    duration: '2:30',
    resolution: '3840x2160',
    size: '2.8 GB',
    uploadedAt: '1 day ago',
    analyzed: false,
    arcStatus: null,
    shotCount: null,
    thumbnail: null,
  },
  {
    id: 'f4',
    name: 'WWE2K26_RoyalRumble_Social.mp4',
    title: 'wwe-2k26',
    titleLabel: 'WWE 2K26',
    duration: '0:45',
    resolution: '1920x1080',
    size: '380 MB',
    uploadedAt: '1 day ago',
    analyzed: true,
    arcStatus: 'pass',
    shotCount: 18,
    thumbnail: null,
  },
  {
    id: 'f5',
    name: 'NBA2K26_GameplayReveal_60s.mp4',
    title: 'nba-2k26',
    titleLabel: 'NBA 2K26',
    duration: '1:00',
    resolution: '3840x2160',
    size: '890 MB',
    uploadedAt: '2 days ago',
    analyzed: true,
    arcStatus: 'pass',
    shotCount: 20,
    thumbnail: null,
  },
  {
    id: 'f6',
    name: 'BL4_Moze_Gameplay_Raw.mp4',
    title: 'borderlands-4',
    titleLabel: 'Borderlands 4',
    duration: '5:22',
    resolution: '1920x1080',
    size: '3.4 GB',
    uploadedAt: '3 days ago',
    analyzed: false,
    arcStatus: null,
    shotCount: null,
    thumbnail: null,
  },
];

const TITLE_COLORS = {
  'nba-2k26': '#FF6B00',
  'borderlands-4': '#F5A623',
  'wwe-2k26': '#D4AF37',
  'civ-vii': '#4ECDC4',
};

function ArcBadge({ status }) {
  if (!status) return <span className="text-xs text-brand-gray/50">Not screened</span>;
  if (status === 'pass') return <span className="badge-pass text-xs px-2 py-0.5 rounded-full">ARC Pass</span>;
  if (status === 'flagged') return <span className="badge-warning text-xs px-2 py-0.5 rounded-full">Flagged</span>;
  return <span className="badge-fail text-xs px-2 py-0.5 rounded-full">Failed</span>;
}

export default function BrowsePage() {
  const [viewMode, setViewMode] = useState('grid');
  const [titleFilter, setTitleFilter] = useState('all');
  const [dragOver, setDragOver] = useState(false);

  const filtered = titleFilter === 'all'
    ? MOCK_FOOTAGE
    : MOCK_FOOTAGE.filter(f => f.title === titleFilter);

  return (
    <div className="min-h-screen">
      <Header title="Footage Browser" subtitle="Browse, upload, and manage video assets" />

      <div className="p-6 space-y-6">
        {/* Upload Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-brand-red bg-brand-red/5'
              : 'border-white/10 hover:border-white/20'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); /* Handle upload */ }}
        >
          <Upload size={32} className="mx-auto mb-3 text-brand-gray" />
          <p className="text-sm text-white font-medium">Drop video files here to upload</p>
          <p className="text-xs text-brand-gray mt-1">
            Or click to browse. Supports MP4, MOV, MXF up to 10GB.
          </p>
          <p className="text-[10px] text-brand-gray/50 mt-2">
            Files will be stored in your Google Drive CaptureIQ folder
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Title filter */}
            <select
              className="bg-brand-navy-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red/50"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
            >
              <option value="all">All Titles</option>
              <option value="nba-2k26">NBA 2K26</option>
              <option value="borderlands-4">Borderlands 4</option>
              <option value="wwe-2k26">WWE 2K26</option>
              <option value="civ-vii">Civilization VII</option>
            </select>

            <select className="bg-brand-navy-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red/50">
              <option>All Statuses</option>
              <option>Analyzed</option>
              <option>Pending Analysis</option>
              <option>ARC Passed</option>
              <option>ARC Flagged</option>
            </select>

            <span className="text-xs text-brand-gray">{filtered.length} assets</span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-brand-navy-light rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-brand-red text-white' : 'text-brand-gray hover:text-white'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-brand-red text-white' : 'text-brand-gray hover:text-white'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((file) => (
              <div key={file.id} className="bg-brand-navy-light border border-white/5 rounded-xl overflow-hidden card-hover cursor-pointer">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-brand-navy flex items-center justify-center">
                  <Film size={32} className="text-white/10" />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white">
                    {file.duration}
                  </div>
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                    style={{ backgroundColor: TITLE_COLORS[file.title] + '90' }}
                  >
                    {file.titleLabel}
                  </div>
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center">
                      <Play size={20} className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-brand-gray">{file.resolution}</span>
                    <span className="text-xs text-brand-gray">{file.size}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      {file.analyzed ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">{file.shotCount} shots</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} className="text-brand-gray/50" />
                          <span className="text-[10px] text-brand-gray/50">Not analyzed</span>
                        </>
                      )}
                    </div>
                    <ArcBadge status={file.arcStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-brand-navy-light border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-[10px] text-brand-gray uppercase tracking-wider">File</th>
                  <th className="text-left px-4 py-3 text-[10px] text-brand-gray uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-[10px] text-brand-gray uppercase tracking-wider">Duration</th>
                  <th className="text-left px-4 py-3 text-[10px] text-brand-gray uppercase tracking-wider">Shots</th>
                  <th className="text-left px-4 py-3 text-[10px] text-brand-gray uppercase tracking-wider">ARC Status</th>
                  <th className="text-left px-4 py-3 text-[10px] text-brand-gray uppercase tracking-wider">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => (
                  <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Film size={16} className="text-brand-gray" />
                        <span className="text-sm text-white">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ backgroundColor: TITLE_COLORS[file.title] + '20', color: TITLE_COLORS[file.title] }}
                      >
                        {file.titleLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-gray">{file.duration}</td>
                    <td className="px-4 py-3 text-sm text-brand-gray">{file.shotCount || '—'}</td>
                    <td className="px-4 py-3"><ArcBadge status={file.arcStatus} /></td>
                    <td className="px-4 py-3 text-xs text-brand-gray">{file.uploadedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
