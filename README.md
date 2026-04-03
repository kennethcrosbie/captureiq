# CaptureIQ

AI-powered capture and editorial pipeline for 2K Games.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GOOGLE_CLIENT_ID` | OAuth2 client ID | For Drive integration |
| `GOOGLE_CLIENT_SECRET` | OAuth2 client secret | For Drive integration |
| `GOOGLE_DRIVE_FOLDER_ID` | Shared Drive folder ID | For Drive integration |

## Project Structure

```
captureiq/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.js             # Dashboard
│   │   ├── browse/page.js      # Footage Browser
│   │   ├── analysis/page.js    # AI Analysis (title-specific)
│   │   ├── prompt/page.js      # Prompt Workspace (Gemini chat)
│   │   ├── screener/page.js    # ARC Compliance Screener
│   │   └── api/                # API routes
│   │       ├── analyze/        # Gemini footage analysis
│   │       ├── screener/       # ARC compliance screening
│   │       └── drive/          # Google Drive file operations
│   ├── components/             # Shared UI components
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   ├── Header.js           # Page header with search
│   │   └── StatCard.js         # Dashboard stat card
│   ├── lib/                    # Core libraries
│   │   ├── constants.js        # Brand tokens, ARC rules, title configs
│   │   ├── gemini.js           # Gemini API integration
│   │   └── drive.js            # Google Drive API integration
│   └── styles/
│       └── globals.css         # Global styles + Tailwind
├── .env.example                # Environment template
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in the Vercel dashboard under Settings > Environment Variables.
