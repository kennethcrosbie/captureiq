// ============================================
// CaptureIQ Constants & Brand Tokens
// ============================================

// 2K Brand Colors
export const BRAND = {
  red: '#FF0D00',
  redDark: '#C5281C',
  navy: '#0C1B2E',
  navyLight: '#142538',
  navyMid: '#1A3048',
  gray: '#939597',
  grayLight: '#B8BABE',
  grayDark: '#4A4D50',
  white: '#FFFFFF',
  black: '#000000',
  gradient: 'linear-gradient(135deg, #C5281C 0%, #FF0D00 100%)',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

// Title-specific analysis configurations
export const TITLE_CONFIGS = {
  'nba-2k26': {
    label: 'NBA 2K26',
    color: '#FF6B00',
    fields: ['Player', 'Team', 'Action', 'Camera Angle', 'Court Location', 'Game State'],
    esrbRating: 'E',
  },
  'borderlands-4': {
    label: 'Borderlands 4',
    color: '#F5A623',
    fields: ['Vault Hunter', 'Weapon', 'Ability/Action', 'Enemy', 'Environment', 'Camera Angle'],
    esrbRating: 'M',
  },
  'wwe-2k26': {
    label: 'WWE 2K26',
    color: '#D4AF37',
    fields: ['Superstar', 'Move/Action', 'Match Type', 'Arena', 'Camera Angle', 'Crowd Heat'],
    esrbRating: 'T',
  },
  'civ-vii': {
    label: 'Civilization VII',
    color: '#4ECDC4',
    fields: ['Leader', 'Era', 'Game Mechanic', 'Biome/Wonder', 'UI Elements', 'Camera Angle'],
    esrbRating: 'E10+',
  },
};

// ARC Manual Content Categories (Section II.B)
export const ARC_CATEGORIES = [
  {
    id: 'violence',
    label: 'Violence',
    icon: 'Swords',
    desc: 'Graphic depictions, weapons, blows to head, blood/gore',
    arcRef: 'Section II.B.1',
  },
  {
    id: 'sex',
    label: 'Sexual Content',
    icon: 'Eye',
    desc: 'Nudity, sexual situations, sexual violence',
    arcRef: 'Section II.B.2',
  },
  {
    id: 'alcohol_drugs',
    label: 'Alcohol & Drugs',
    icon: 'AlertTriangle',
    desc: 'Drug references, alcohol/tobacco glamorization',
    arcRef: 'Section II.B.3',
  },
  {
    id: 'language',
    label: 'Offensive Language',
    icon: 'MessageSquare',
    desc: 'Profanity, crude language, offensive gestures',
    arcRef: 'Section II.B.4',
  },
  {
    id: 'sensitivity',
    label: 'Insensitivity',
    icon: 'Shield',
    desc: 'Religious, disability, or culturally insensitive content',
    arcRef: 'Section II.B.5',
  },
];

// ARC Delivery Channels
export const DELIVERY_CHANNELS = [
  {
    id: 'tv_cinema',
    label: 'TV / Cinema',
    desc: 'Broadcast television, cable, cinema pre-roll',
    rules: 'Strictest — Section II.B fully applies. Blood entirely prohibited. Must use slate or overlay.',
    strictness: 'high',
  },
  {
    id: 'paid_online',
    label: 'Paid Online Ads',
    desc: 'Pre-roll, banner video, paid social',
    rules: 'Section II.B applies. Blood prohibited in most paid placements. Rating overlay required.',
    strictness: 'high',
  },
  {
    id: 'organic_social',
    label: 'Organic Social / Web',
    desc: 'YouTube, social posts, website trailers',
    rules: 'Section II.B recommended. Rating icon overlay or slate required. Age gate if M-rated content.',
    strictness: 'medium',
  },
  {
    id: 'age_gated',
    label: 'Age-Gated Placement',
    desc: 'Behind age gate on owned site or 65%+ audience',
    rules: 'Content can reflect game\'s true nature. Must not exceed Pertinent Content. Slate/overlay still required.',
    strictness: 'low',
  },
];

// Technical compliance checks (ARC Section VI.E)
export const TECHNICAL_CHECKS = [
  { id: 'rating_slate', label: 'Rating Slate', rule: '50% screen height, minimum 2 seconds', arcRef: 'VI.E.1' },
  { id: 'rating_overlay', label: 'Rating Icon Overlay', rule: '15% screen height for general audience', arcRef: 'VI.E.2' },
  { id: 'clean_open', label: 'First 4 Seconds Clean', rule: 'No restricted content in first 4 seconds', arcRef: 'VI.E.3' },
  { id: 'descriptors', label: 'Content Descriptors', rule: 'Must display applicable content descriptors', arcRef: 'VI.E.4' },
];

// Navigation items
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { id: 'browse', label: 'Footage Browser', path: '/browse', icon: 'Film' },
  { id: 'analysis', label: 'Analysis', path: '/analysis', icon: 'Brain' },
  { id: 'prompt', label: 'Prompt Workspace', path: '/prompt', icon: 'Terminal' },
  { id: 'screener', label: 'ARC Screener', path: '/screener', icon: 'ShieldCheck' },
];
