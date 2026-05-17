# EventOS AI

Turn event ideas into execution-ready operational workspaces. AI-powered event planning for communities, clubs, hackathons, and teams.

## What It Does

Fill in your event details — title, type, audience, date, and goals — and EventOS AI generates a complete operational workspace with five tabs:

- **Event Brief** — summary, objectives, audience profile, and execution goals
- **Task Checklist** — prioritized, categorized tasks with progress tracking
- **Timeline** — phased plan (before / during / after the event)
- **Communication Kit** — ready-to-send templates for WhatsApp, Instagram, email, and reminders
- **Social Media Ideas** — reel, story, teaser, and countdown content with captions

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router) with React 19
- [shadcn/ui](https://ui.shadcn.com/) (base-nova style) with [Base UI](https://base-ui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Google Gemini API](https://ai.google.dev/) for AI generation (optional — falls back to mock data)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/sanyam2509-tech/Forge-Force.git
cd Forge-Force

# Install dependencies
npm install

# (Optional) Set up AI generation
cp .env.example .env.local
# Add your Gemini API key to .env.local
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

```bash
npm run build
npm start
```

## Environment Variables

See [`.env.example`](.env.example) for all available environment variables.

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | No | Google Gemini API key. When not set, the app uses mock data. |

## Project Structure

```
src/
├── app/
│   ├── api/generate/   # POST endpoint — Gemini AI or mock fallback
│   ├── create/         # Event creation form
│   ├── dashboard/      # Generated workspace viewer
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/
│   ├── create/         # Event form
│   ├── dashboard/      # Dashboard tabs and header
│   ├── landing/        # Landing page sections
│   └── ui/             # shadcn/ui primitives
├── hooks/              # Custom React hooks
└── lib/                # Types, utilities, mock data
```

## License

This project is private.
