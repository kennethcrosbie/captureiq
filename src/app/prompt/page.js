'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '../../components/Header';
import {
  Terminal,
  Send,
  Sparkles,
  Copy,
  Download,
  Clock,
  Film,
  FileVideo,
  FileText,
  Table,
  ChevronDown,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';

const MOCK_CONVERSATION = [
  {
    role: 'system',
    content: 'CaptureIQ Prompt Workspace connected. Gemini 2.0 Flash ready. Active title: NBA 2K26. Footage loaded: NBA2K26_Draft_TV30_v2.mp4 (5 shots analyzed).',
  },
];

const PROMPT_TEMPLATES = [
  { label: 'Find all shots of a specific player', prompt: 'Show me all shots featuring LeBron James and describe his actions in each.' },
  { label: 'Suggest a 15-second social edit', prompt: 'Using the analyzed footage, suggest a 15-second edit sequence for a hype social post focused on dunks and fast breaks.' },
  { label: 'Build a 30-second TV spot', prompt: 'Create a 30-second TV spot edit using the analyzed footage. Open with energy, build to a hero moment, leave room for a 5-second end card with rating slate.' },
  { label: 'Check ARC compliance', prompt: 'Review the current edit for ARC Section II.B compliance if the target delivery is a TV 30-second spot.' },
  { label: 'Generate shot list for editor', prompt: 'Based on the analyzed footage, generate a detailed shot list with timecodes that I can hand to an editor.' },
];

// Mock edit suggestion with structured cut data
const MOCK_EDIT_RESPONSE = {
  text: `Here's a suggested **15-second social edit** using the analyzed NBA 2K26 footage:

**Proposed Timeline:**

| TC | Shot | Duration | Description |
|---|---|---|---|
| 00:00 | Shot #3 (Tip-off) | 1.5s | Quick tip-off for energy |
| 00:01:12 | Shot #4 (Fast break) | 3.0s | LeBron drives, builds tension |
| 00:04:12 | Shot #5 (Dunk replay) | 3.5s | Slam dunk — hero moment |
| 00:07:24 | Shot #2 (Warm-up) | 2.0s | Cool-down, LeBron confidence |
| 00:09:24 | End card | 5.8s | 2K branding + CTA |

**Pacing Notes:**
- Opens fast with game action, peaks at the dunk
- Warm-up shot used as a cool "walk-off" beat
- Total gameplay: 10s | End card: 5.8s (leaves room for rating overlay)

**ARC Note:** This sequence is clean for organic social. If targeting paid pre-roll, add a rating icon overlay at 15% height.`,

  // Structured cut data for export
  cuts: [
    { shotNumber: 1, timecodeIn: '00:00:00:00', timecodeOut: '00:00:01:12', duration: 1.5, description: 'Shot #3 — Tip-off, quick energy opener' },
    { shotNumber: 2, timecodeIn: '00:00:05:00', timecodeOut: '00:00:08:12', duration: 3.0, description: 'Shot #4 — LeBron fast break drive' },
    { shotNumber: 3, timecodeIn: '00:00:12:00', timecodeOut: '00:00:15:12', duration: 3.5, description: 'Shot #5 — Slam dunk replay, hero moment' },
    { shotNumber: 4, timecodeIn: '00:00:02:15', timecodeOut: '00:00:04:15', duration: 2.0, description: 'Shot #2 — LeBron warm-up, confidence beat' },
    { shotNumber: 5, timecodeIn: '00:00:00:00', timecodeOut: '00:00:05:19', duration: 5.8, description: 'End card — 2K branding + CTA' },
  ],
};

const MOCK_TV_RESPONSE = {
  text: `Here's a **30-second TV spot** built from the analyzed NBA 2K26 footage:

**Proposed Timeline:**

| TC | Shot | Duration | Description |
|---|---|---|---|
| 00:00 | ESRB Slate | 2.5s | E rating slate at 52% height |
| 00:02:12 | Shot #1 (Arena) | 3.0s | Wide establishing — arena energy |
| 00:05:12 | Shot #3 (Tip-off) | 2.5s | Tip-off, game begins |
| 00:07:24 | Shot #4 (Fast break) | 4.0s | LeBron drives to basket |
| 00:11:24 | Shot #5 (Dunk replay) | 4.5s | Multi-angle slam dunk — hero |
| 00:15:24 | Shot #2 (Warm-up) | 3.0s | LeBron walk-off, cool beat |
| 00:18:24 | Shot #4 alt (Drive) | 3.5s | Second drive sequence, builds pace |
| 00:21:24 | Shot #5 alt (Replay) | 3.0s | Dunk from reverse angle |
| 00:24:12 | End card | 5.8s | 2K branding + CTA + rating overlay |

**Technical Compliance:**
- Rating slate opens at 52% screen height for 2.5 seconds (ARC VI.E compliant)
- E rating overlay at 16% height on end card
- First 4 seconds are ESRB slate + arena establishing — fully clean

**ARC Status:** This edit is compliant for TV/Cinema broadcast. No preclearance needed for E-rated content.`,

  cuts: [
    { shotNumber: 1, timecodeIn: '00:00:00:00', timecodeOut: '00:00:02:12', duration: 2.5, description: 'ESRB Rating Slate — E rating, 52% height' },
    { shotNumber: 2, timecodeIn: '00:00:00:00', timecodeOut: '00:00:02:15', duration: 3.0, description: 'Shot #1 — Arena wide establishing' },
    { shotNumber: 3, timecodeIn: '00:00:05:00', timecodeOut: '00:00:07:12', duration: 2.5, description: 'Shot #3 — Tip-off, game begins' },
    { shotNumber: 4, timecodeIn: '00:00:08:12', timecodeOut: '00:00:12:00', duration: 4.0, description: 'Shot #4 — LeBron fast break drive' },
    { shotNumber: 5, timecodeIn: '00:00:12:00', timecodeOut: '00:00:14:15', duration: 4.5, description: 'Shot #5 — Multi-angle slam dunk replay' },
    { shotNumber: 6, timecodeIn: '00:00:02:15', timecodeOut: '00:00:05:00', duration: 3.0, description: 'Shot #2 — LeBron warm-up walk-off' },
    { shotNumber: 7, timecodeIn: '00:00:08:12', timecodeOut: '00:00:12:00', duration: 3.5, description: 'Shot #4 alt — Second drive sequence' },
    { shotNumber: 8, timecodeIn: '00:00:12:00', timecodeOut: '00:00:14:15', duration: 3.0, description: 'Shot #5 alt — Reverse angle dunk' },
    { shotNumber: 9, timecodeIn: '00:00:00:00', timecodeOut: '00:00:05:19', duration: 5.8, description: 'End card — 2K branding + CTA + rating overlay' },
  ],
};

const MOCK_DEFAULT_RESPONSE = {
  text: `Based on the analyzed footage for **NBA2K26_Draft_TV30_v2.mp4**, here's what I found:

**Shot Breakdown:**
- **5 shots** detected across 14.2 seconds of footage
- Primary player featured: **LeBron James** (appears in 3 of 5 shots)
- Teams shown: **Lakers vs Celtics**
- Key moments: Arena establishing → Warm-up → Tip-off → Fast break → Slam dunk replay

**Highlight Shots:**
- Shot #4 (08:12–12:00): Fast break drive by LeBron — great energy, broadcast tracking angle
- Shot #5 (12:00–14:15): Multi-angle slam dunk replay — strong closer

**Content Flags:** None detected. This footage appears clean for all delivery channels.

Would you like me to suggest an edit sequence for a specific format (TV :15, :30, social, etc.)?`,
  cuts: null,
};

// Export format options
const EXPORT_FORMATS = [
  {
    id: 'xml',
    label: 'Premiere Pro XML',
    desc: 'FCP XML v5 — import directly into Premiere via File > Import',
    icon: FileVideo,
    extension: '.xml',
  },
  {
    id: 'edl',
    label: 'EDL (CMX3600)',
    desc: 'Universal edit decision list — works with any NLE',
    icon: FileText,
    extension: '.edl',
  },
  {
    id: 'csv',
    label: 'CSV Shot List',
    desc: 'Spreadsheet-friendly shot list with timecodes',
    icon: Table,
    extension: '.csv',
  },
];

function ExportModal({ cuts, sourceFile, onClose }) {
  const [selectedFormat, setSelectedFormat] = useState('xml');
  const [sequenceName, setSequenceName] = useState('CaptureIQ_Edit');
  const [fps, setFps] = useState(23.976);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    // Generate the file client-side for the mock
    // In production, this would call /api/export
    const { generatePremiereXML, generateEDL, generateCSV } = await import('../../lib/export');

    let content, extension, mimeType;

    const params = {
      sequenceName,
      sourceFile: sourceFile || 'NBA2K26_Draft_TV30_v2.mp4',
      fps,
      cuts,
    };

    switch (selectedFormat) {
      case 'xml':
        content = generatePremiereXML(params);
        extension = 'xml';
        mimeType = 'application/xml';
        break;
      case 'edl':
        content = generateEDL(params);
        extension = 'edl';
        mimeType = 'text/plain';
        break;
      case 'csv':
        content = generateCSV(params);
        extension = 'csv';
        mimeType = 'text/csv';
        break;
    }

    // Trigger browser download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sequenceName.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExporting(false);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-brand-navy-light border border-white/10 rounded-2xl w-[520px] max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h3 className="heading-2k text-sm text-white">Export Timeline</h3>
            <p className="text-xs text-brand-gray mt-0.5">{cuts.length} cuts ready for export</p>
          </div>
          <button onClick={onClose} className="text-brand-gray hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Format selection */}
          <div>
            <label className="text-[10px] text-brand-gray uppercase tracking-wider block mb-2">Export Format</label>
            <div className="space-y-2">
              {EXPORT_FORMATS.map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === fmt.id
                        ? 'border-brand-red bg-brand-red/5'
                        : 'border-white/5 hover:border-white/15 bg-brand-navy/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedFormat === fmt.id ? 'bg-brand-red/15' : 'bg-white/5'
                    }`}>
                      <Icon size={18} className={selectedFormat === fmt.id ? 'text-brand-red' : 'text-brand-gray'} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${selectedFormat === fmt.id ? 'text-white' : 'text-white/70'}`}>
                        {fmt.label}
                        <span className="text-brand-gray text-xs ml-2">{fmt.extension}</span>
                      </p>
                      <p className="text-xs text-brand-gray mt-0.5">{fmt.desc}</p>
                    </div>
                    {selectedFormat === fmt.id && (
                      <div className="w-5 h-5 rounded-full bg-brand-red flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-brand-gray uppercase tracking-wider block mb-1.5">Sequence Name</label>
              <input
                type="text"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                className="w-full bg-brand-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red/50"
              />
            </div>
            <div>
              <label className="text-[10px] text-brand-gray uppercase tracking-wider block mb-1.5">Frame Rate</label>
              <select
                value={fps}
                onChange={(e) => setFps(parseFloat(e.target.value))}
                className="w-full bg-brand-navy border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-red/50"
              >
                <option value={23.976}>23.976 fps (Film)</option>
                <option value={24}>24 fps</option>
                <option value={29.97}>29.97 fps (NTSC)</option>
                <option value={30}>30 fps</option>
                <option value={59.94}>59.94 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>
          </div>

          {/* Cut preview */}
          <div>
            <label className="text-[10px] text-brand-gray uppercase tracking-wider block mb-2">Timeline Preview</label>
            <div className="bg-brand-navy/50 border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
                <span className="text-[9px] text-brand-gray uppercase w-6">#</span>
                <span className="text-[9px] text-brand-gray uppercase w-20">TC In</span>
                <span className="text-[9px] text-brand-gray uppercase w-10">Dur</span>
                <span className="text-[9px] text-brand-gray uppercase flex-1">Description</span>
              </div>
              {cuts.map((cut, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-brand-gray font-mono w-6">{cut.shotNumber || i + 1}</span>
                  <span className="text-xs text-brand-gray font-mono w-20">{cut.timecodeIn}</span>
                  <span className="text-xs text-white w-10">{cut.duration}s</span>
                  <span className="text-xs text-white/80 flex-1 truncate">{cut.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Import instructions */}
          <div className="bg-brand-navy/50 border border-white/5 rounded-lg p-3">
            <p className="text-[10px] text-brand-gray uppercase tracking-wider mb-1.5">How to Import</p>
            {selectedFormat === 'xml' && (
              <p className="text-xs text-brand-gray">In Premiere Pro: File &gt; Import &gt; select the .xml file. The sequence will appear in your project panel with all cuts placed on the timeline.</p>
            )}
            {selectedFormat === 'edl' && (
              <p className="text-xs text-brand-gray">In Premiere Pro: File &gt; Import &gt; select the .edl file. In DaVinci Resolve: File &gt; Import Timeline &gt; Import EDL. Link to source media when prompted.</p>
            )}
            {selectedFormat === 'csv' && (
              <p className="text-xs text-brand-gray">Open in Excel or Google Sheets for a formatted shot list with timecodes. Useful for sharing with editors, producers, or clients who don't use an NLE.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-brand-gray hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #C5281C 0%, #FF0D00 100%)' }}
          >
            {exported ? (
              <>
                <Check size={16} />
                Downloaded!
              </>
            ) : exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Export {EXPORT_FORMATS.find(f => f.id === selectedFormat)?.extension}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromptPage() {
  const [messages, setMessages] = useState(MOCK_CONVERSATION);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [exportModal, setExportModal] = useState(null); // holds cut data when open
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsTyping(true);
    setShowTemplates(false);

    // Determine response type based on prompt content
    setTimeout(() => {
      const lower = msg.toLowerCase();
      const isTV = lower.includes('tv') || lower.includes('30-second') || lower.includes('30 second') || lower.includes(':30');
      const isEdit = lower.includes('suggest') || lower.includes('edit') || lower.includes('sequence') || lower.includes('build') || lower.includes('create');

      let response;
      if (isEdit && isTV) {
        response = MOCK_TV_RESPONSE;
      } else if (isEdit) {
        response = MOCK_EDIT_RESPONSE;
      } else {
        response = MOCK_DEFAULT_RESPONSE;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.text,
        cuts: response.cuts,
      }]);
      setIsTyping(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Prompt Workspace" subtitle="Prompt an edit, export to Premiere" />

      <div className="flex-1 flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl rounded-xl px-5 py-4 ${
                msg.role === 'system'
                  ? 'bg-brand-navy-mid border border-white/5 text-brand-gray text-xs'
                  : msg.role === 'user'
                    ? 'bg-brand-red/15 border border-brand-red/20 text-white'
                    : 'bg-brand-navy-light border border-white/5 text-white'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                    <Sparkles size={14} className="text-brand-red" />
                    <span className="text-[10px] text-brand-gray uppercase tracking-wider">Gemini 2.0 Flash</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Action buttons for assistant messages */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                    <button
                      className="flex items-center gap-1 text-[10px] text-brand-gray hover:text-white transition-colors"
                      onClick={() => navigator.clipboard?.writeText(msg.content)}
                    >
                      <Copy size={12} /> Copy
                    </button>

                    {/* Show export button only when cuts are available */}
                    {msg.cuts && msg.cuts.length > 0 && (
                      <button
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-brand-red hover:text-white transition-colors ml-2 bg-brand-red/10 px-3 py-1.5 rounded-lg border border-brand-red/20 hover:bg-brand-red/20"
                        onClick={() => setExportModal(msg.cuts)}
                      >
                        <Download size={12} />
                        Export to Premiere
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-brand-navy-light border border-white/5 rounded-xl px-5 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-red animate-pulse" />
                  <span className="text-sm text-brand-gray">Gemini is building your edit...</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick templates */}
        {showTemplates && (
          <div className="px-6 pb-2">
            <div className="bg-brand-navy-light border border-white/5 rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-brand-gray uppercase tracking-wider px-2 mb-2">Quick Prompts</p>
              {PROMPT_TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={() => handleSend(t.prompt)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-6 pt-3 border-t border-white/5">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Describe the edit you want — Gemini will build the timeline and you can export it to Premiere..."
                rows={2}
                className="w-full bg-brand-navy-light border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-brand-gray focus:outline-none focus:border-brand-red/50 resize-none"
              />
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="absolute right-12 bottom-3 text-brand-gray hover:text-white transition-colors"
                title="Quick prompts"
              >
                <Terminal size={16} />
              </button>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #C5281C 0%, #FF0D00 100%)' }}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] text-brand-gray">
              <Film size={10} className="inline mr-1" />
              NBA2K26_Draft_TV30_v2.mp4
            </span>
            <span className="text-[10px] text-brand-gray">
              <Clock size={10} className="inline mr-1" />
              5 shots loaded
            </span>
            <span className="text-[10px] text-brand-gray/50">
              <FileVideo size={10} className="inline mr-1" />
              Export: XML / EDL / CSV
            </span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {exportModal && (
        <ExportModal
          cuts={exportModal}
          sourceFile="NBA2K26_Draft_TV30_v2.mp4"
          onClose={() => setExportModal(null)}
        />
      )}
    </div>
  );
}
