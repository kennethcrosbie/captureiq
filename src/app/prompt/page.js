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
  ChevronDown,
} from 'lucide-react';

const MOCK_CONVERSATION = [
  {
    role: 'system',
    content: 'CaptureIQ Prompt Workspace connected. Gemini 2.0 Flash ready. Active title: NBA 2K26. Footage loaded: NBA2K26_Draft_TV30_v2.mp4 (5 shots analyzed).',
  },
];

const PROMPT_TEMPLATES = [
  { label: 'Find all shots of a specific player', prompt: 'Show me all shots featuring LeBron James and describe his actions in each.' },
  { label: 'Suggest an edit sequence', prompt: 'Using the analyzed footage, suggest a 15-second edit sequence for a hype social post focused on dunks and fast breaks.' },
  { label: 'Check ARC compliance', prompt: 'Review the current edit for ARC Section II.B compliance if the target delivery is a TV 30-second spot.' },
  { label: 'Generate shot list', prompt: 'Based on the analyzed footage, generate a detailed shot list with timecodes that I can hand to an editor.' },
  { label: 'Compare two clips', prompt: 'Compare the shot composition and pacing between the two most recent uploads for this title.' },
];

const MOCK_RESPONSES = {
  default: `Based on the analyzed footage for **NBA2K26_Draft_TV30_v2.mp4**, here's what I found:

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

  edit: `Here's a suggested **15-second social edit** using the analyzed NBA 2K26 footage:

**Proposed Timeline:**

| TC | Shot | Duration | Description |
|---|---|---|---|
| 00:00 | Shot #3 (Tip-off) | 1.5s | Quick tip-off for energy |
| 01:15 | Shot #4 (Fast break) | 3.0s | LeBron drives, builds tension |
| 04:15 | Shot #5 (Dunk replay) | 3.5s | Slam dunk — hero moment |
| 07:20 | Shot #2 (Warm-up) | 2.0s | Cool-down, LeBron confidence |
| 09:20 | End card | 5.8s | 2K branding + CTA |

**Pacing Notes:**
- Opens fast with game action, peaks at the dunk
- Warm-up shot used as a cool "walk-off" beat
- Total gameplay: 10s | End card: 5.8s (leaves room for rating overlay)

**ARC Note:** This sequence is clean for organic social. If targeting paid pre-roll, add a rating icon overlay at 15% height.

Want me to export this as an EDL or XML for Premiere?`,
};

export default function PromptPage() {
  const [messages, setMessages] = useState(MOCK_CONVERSATION);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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

    // Simulate Gemini response
    setTimeout(() => {
      const isEditRequest = msg.toLowerCase().includes('suggest') || msg.toLowerCase().includes('edit') || msg.toLowerCase().includes('sequence');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isEditRequest ? MOCK_RESPONSES.edit : MOCK_RESPONSES.default,
      }]);
      setIsTyping(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Prompt Workspace" subtitle="Natural language interface to Gemini" />

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
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                    <button className="flex items-center gap-1 text-[10px] text-brand-gray hover:text-white transition-colors">
                      <Copy size={12} /> Copy
                    </button>
                    <button className="flex items-center gap-1 text-[10px] text-brand-gray hover:text-white transition-colors">
                      <Download size={12} /> Export
                    </button>
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
                  <span className="text-sm text-brand-gray">Gemini is thinking...</span>
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
                placeholder="Ask Gemini about your footage..."
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
          </div>
        </div>
      </div>
    </div>
  );
}
