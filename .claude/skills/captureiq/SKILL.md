# CaptureIQ — AI Capture & Editorial Pipeline

## What This Is

CaptureIQ is an AI-powered web tool for 2K Games' Creative Studio that automates footage analysis, editorial intelligence, and ESRB ARC compliance screening. It is built for editors and creative producers who work across 2K's title portfolio.

This skill provides the full context needed to develop, extend, and maintain CaptureIQ. Any Claude session with this skill loaded should be able to work on the codebase without needing prior conversation history.

---

## Architecture Overview

**Stack:**
- Frontend: Next.js 15 + React 19 (App Router)
- AI Engine: Google Gemini 2.0 Flash (multimodal video analysis)
- Storage: Google Drive API (footage files + analysis JSON)
- Database: Firestore (Phase 2 — structured metadata)
- Hosting: Vercel (auto-deploys from GitHub on push)
- Icons: lucide-react
- Styling: Tailwind CSS v4

**Project Structure:**
```
captureiq/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.js             # Dashboard
│   │   ├── browse/page.js      # Footage Browser (upload, filter, grid/list)
│   │   ├── analysis/page.js    # AI Analysis (title-specific shot intelligence)
│   │   ├── prompt/page.js      # Prompt Workspace (Gemini chat + timeline export)
│   │   ├── screener/page.js    # ARC Compliance Screener
│   │   └── api/                # Server-side API routes
│   │       ├── analyze/route.js    # POST — Gemini footage analysis
│   │       ├── screener/route.js   # POST — ARC compliance screening
│   │       ├── drive/route.js      # GET/POST — Google Drive operations
│   │       └── export/route.js     # POST — Timeline export (XML/EDL/CSV)
│   ├── components/             # Shared UI components
│   │   ├── Sidebar.js          # Navigation sidebar with title selector
│   │   ├── Header.js           # Page header with search
│   │   └── StatCard.js         # Dashboard stat card
│   ├── lib/                    # Core libraries
│   │   ├── constants.js        # Brand tokens, ARC rules, title configs
│   │   ├── gemini.js           # Gemini API integration
│   │   ├── drive.js            # Google Drive API integration
│   │   └── export.js           # Timeline export (Premiere XML, EDL, CSV)
│   └── styles/
│       └── globals.css         # Global styles + Tailwind + 2K brand classes
├── .env.example                # Environment variable template
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

**Environment Variables:**
- `GEMINI_API_KEY` — Google Gemini API key (required for AI features)
- `GOOGLE_CLIENT_ID` — OAuth2 client ID (for Drive integration)
- `GOOGLE_CLIENT_SECRET` — OAuth2 client secret (for Drive integration)
- `GOOGLE_DRIVE_FOLDER_ID` — Shared Drive folder for footage storage
- `NEXTAUTH_URL` — App URL for OAuth redirect
- `NEXTAUTH_SECRET` — Session encryption secret

---

## 2K Brand Guidelines

All UI must follow 2K's brand styling. The visual language is dark, bold, and premium.

**Colors:**
- Red (Primary): `#FF0D00`
- Red Dark: `#C5281C`
- Navy (Background): `#0C1B2E`
- Navy Light (Cards): `#142538`
- Navy Mid (Elevated surfaces): `#1A3048`
- Gray (Secondary text): `#939597`
- Gray Light (Body text on dark): `#B8BABE`
- Gray Dark (Muted): `#4A4D50`
- Gradient (CTA buttons): `linear-gradient(135deg, #C5281C 0%, #FF0D00 100%)`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

**Title Colors:**
- NBA 2K26: `#FF6B00` (orange)
- Borderlands 4: `#F5A623` (gold)
- WWE 2K26: `#D4AF37` (gold)
- Civilization VII: `#4ECDC4` (teal)

**Typography:**
- Headings: Bold, uppercase, wide letter-spacing (0.08em) — mimics Flama Bold
- CSS class: `.heading-2k` applies this treatment
- Font stack: system fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)

**UI Patterns:**
- Dark navy backgrounds with subtle card elevation via lighter navy shades
- Red accent bars (thin lines at top of cards, left edge of pages)
- Cards use `bg-brand-navy-light border border-white/5 rounded-xl`
- Status badges: `.badge-pass` (green), `.badge-fail` (red), `.badge-warning` (amber)
- CTA buttons use the red gradient background
- Subtle hover effects via `.card-hover` class

---

## Title-Specific Footage Intelligence

The core differentiator of CaptureIQ is that Gemini analyzes footage differently depending on the game title. Each title has specific metadata fields that matter to editors.

**NBA 2K26** (ESRB: E)
- Fields: Player, Team, Action, Camera Angle, Court Location, Game State
- Example values: "LeBron James", "Lakers vs Celtics", "Fast break drive", "Broadcast tracking", "Paint / key", "Live play — Q1"

**Borderlands 4** (ESRB: M)
- Fields: Vault Hunter, Weapon, Ability/Action, Enemy, Environment, Camera Angle
- Example values: "FL4K", "Torgue Rocket Launcher", "Explosive kill — AoE", "Psycho Bandits (x6)", "Pandora — Bandit Camp", "Wide action"
- Note: BL4 footage frequently triggers ARC content flags for violence/blood

**WWE 2K26** (ESRB: T)
- Fields: Superstar, Move/Action, Match Type, Arena, Camera Angle, Crowd Heat
- Example values: "John Cena", "Finisher — Attitude Adjustment", "Royal Rumble", "Madison Square Garden", "Ringside tracking", "High"

**Civilization VII** (ESRB: E10+)
- Fields: Leader, Era, Game Mechanic, Biome/Wonder, UI Elements, Camera Angle
- Example values: "Gandhi", "Classical Era", "City founding", "Nile Delta", "Tech tree overlay", "Strategic zoom"

When adding new titles, add an entry to `TITLE_CONFIGS` in `src/lib/constants.js` and update the Gemini prompt in `src/lib/gemini.js` to include the new fields.

---

## ARC Compliance Screening

The ARC (Advertising Review Council) screener is based on the ESRB ARC Manual, 15th Edition. This is NOT about a game's ESRB rating — it's about the delivery context of an edit.

**Key concept:** A Mature-rated game (like Borderlands 4) can and often does need edits approved for all-ages audiences (like a TV commercial). The delivery channel determines which rules apply.

**Delivery Channels (from strictest to most flexible):**

1. **TV / Cinema** — Section II.B fully applies. Blood entirely prohibited. Must use rating slate or overlay. Preclearance recommended.
2. **Paid Online Ads** — Section II.B applies. Blood prohibited in most paid placements. Rating overlay required.
3. **Organic Social / Web** — Section II.B recommended. Rating icon overlay or slate required. Age gate if M-rated content.
4. **Age-Gated Placement** — Content can reflect game's true nature. Must not exceed Pertinent Content. Slate/overlay still required.

**ARC Section II.B Content Categories:**

1. **Violence** (II.B.1) — Graphic depictions, weapons, blows to head, blood/gore. Blood is ENTIRELY prohibited in TV/Cinema regardless of game rating.
2. **Sexual Content** (II.B.2) — Nudity, sexual situations, sexual violence.
3. **Alcohol & Drugs** (II.B.3) — Drug references, alcohol/tobacco glamorization.
4. **Offensive Language** (II.B.4) — Profanity, crude language, offensive gestures.
5. **Insensitivity** (II.B.5) — Religious, disability, or culturally insensitive content.

**Technical Compliance (Section VI.E):**

- Rating Slate: 50% screen height, minimum 2 seconds
- Rating Icon Overlay: 15% screen height for general audience placements
- First 4 Seconds: Must be clean of any restricted content
- Content Descriptors: Must display applicable descriptors

**Screening workflow:** Editor uploads a complete edit → selects delivery channel → selects target audience → Gemini analyzes the video against ARC rules for that channel → returns flags with specific timecodes, ARC section references, and fix recommendations.

---

## Prompt-to-Timeline Export

The Prompt Workspace allows editors to describe an edit in natural language, have Gemini build a timeline, and then export it to their NLE.

**Supported export formats:**
- **Premiere Pro XML** (FCP XML v5) — Import via File > Import in Premiere
- **EDL** (CMX3600) — Universal, works with any NLE including DaVinci Resolve
- **CSV** — Spreadsheet-friendly shot list with timecodes

**Export data structure:** Each cut contains `shotNumber`, `timecodeIn`, `timecodeOut`, `duration`, `description`, and optional `notes`. The export engine in `src/lib/export.js` converts these to the appropriate format.

**Workflow:** User prompts Gemini ("Build a 30-second TV spot from this footage") → Gemini returns a text response with a timeline table AND structured cut data → "Export to Premiere" button appears → User picks format, names sequence, sets frame rate → Downloads file → Imports into Premiere.

---

## Storage Architecture

**Phase 1 (Current):** Google Drive
- Footage files stored in a shared Drive folder
- Analysis results stored as companion JSON files alongside the video
- File metadata (analyzed status, ARC status, shot count) stored as Drive custom properties
- No SAN access needed — editors upload proxies/deliverables, not raw camera masters

**Phase 2 (Planned):** Firestore
- Structured metadata database for fast querying ("show me all BL4 clips with FL4K that are cleared for TV")
- Drive continues to hold actual files
- Firestore holds analysis results, compliance reports, user settings

**Phase 3 (Planned):** DAM Integration
- Approved assets push to AEM or custom Google Drive-backed DAM
- All CaptureIQ metadata (analysis, ARC status, tags) transfers with the asset
- CaptureIQ becomes the intake pipeline for the entire asset library

---

## Development Workflow

**Local development:**
```bash
npm install
cp .env.example .env.local  # Add your API keys
npm run dev                  # http://localhost:3000
```

**Deploying changes:**
```bash
git add .
git commit -m "Description of changes"
git push
# Vercel auto-deploys within 60 seconds
```

**Adding a new screen:**
1. Create `src/app/your-page/page.js`
2. Add navigation entry in `src/components/Sidebar.js`
3. Add route to `NAV_ITEMS` in `src/lib/constants.js`

**Adding a new title:**
1. Add entry to `TITLE_CONFIGS` in `src/lib/constants.js`
2. The analysis and screener pages will automatically pick up the new title
3. Tune the Gemini prompt in `src/lib/gemini.js` for title-specific field extraction

**Adding a new ARC rule:**
1. Add to `ARC_CATEGORIES` or `TECHNICAL_CHECKS` in `src/lib/constants.js`
2. Update the Gemini screening prompt in `src/lib/gemini.js`
3. The screener UI automatically renders new categories

---

## Key Design Decisions

1. **Delivery channel drives compliance, not game rating.** An M-rated game can produce E-rated content for TV. This was a fundamental reframe from the initial design.

2. **Title-specific analysis prompts.** Generic video analysis isn't useful for editors. They need to know WHICH player, WHICH weapon, WHICH action — different metadata per franchise.

3. **Google ecosystem for simplicity.** Gemini + Drive + Firestore + Google Auth all play nicely together. Minimizes integration complexity and IT involvement.

4. **Mock data first, real AI second.** The entire UI works with mock data so stakeholders can evaluate the tool before API keys are even connected.

5. **Export to NLE is essential.** The tool isn't useful if editors have to manually recreate timelines. XML/EDL export closes the loop from AI suggestion to editorial action.

6. **No SAN dependency.** CaptureIQ works entirely in the cloud with proxies and deliverables. It doesn't touch the editorial SAN infrastructure.
