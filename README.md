# SIELTS

**SIELTS** is an interactive IELTS learning platform, exercise bank, and computer-delivered exam simulator built with **Next.js 15 (App Router)**, **React**, **TypeScript**, and **Tailwind CSS v4**. Designed around official IELTS Academic and General Training specifications ([IELTSPLAN.md](./IELTSPLAN.md)), it helps candidates learn strategies, drill all question types, practice with multi-accent neural audio, and track errors across all four test components.

---

## Core Features

### 1. Daily Refreshing 4-Skill Simulator (`/api/daily`)
- Automatically creates a new **Reading**, **Listening**, **Writing**, and **Speaking** set each calendar day (`YYYY-MM-DD`) with a live countdown to the next daily refresh.
- Supports generating unlimited **Bonus Sets** on demand (`variant=1, 2, ...`).
- Dynamically synthesizes a fresh multi-accent neural `.mp3` for each day's Listening dialogue (`en-GB-SoniaNeural`, `en-GB-RyanNeural`, `en-AU-NatashaNeural`, `en-US-GuyNeural`) via `scripts/synthesize_dialogue.py` and streams it through `/api/daily-audio`.

### 2. IELTS Academy & Strategy Guides (`Lessons & Guides`)
- **All 17 Objective Task Types**: Step-by-step strategies, marking rules, common pitfalls, and interactive inline examples for all **11 Reading question types** and **6 Listening question types**, plus **Writing Task 1/2** and **Speaking Parts 1–3**.
- **Band Descriptors & Band 6 vs. Band 7 Breakdowns**: Official qualitative rubrics (Writing `TA/TR`, `CC`, `LR`, `GRA`; Speaking `FC`, `LR`, `GRA`, `P`), raw-to-band conversion tables (Academic vs. General Training), and CLB benchmarks.
- **10-Point Self-Checklists & Cheat Sheets**: Persistent practice checklists, lexical/discourse marker banks, One Skill Retake (OSR) rules, and Computer-Delivered interface guides.

### 3. Computer-Delivered Exam Simulator (`Mock Simulator`)
- **Reading**: Split-screen layout with click-to-highlight passage sentences, candidate scratchpad notes, display contrast modes (Standard Light, Black-on-Yellow, Dark), `A- / A / A+` font scaling, strict word-count validation (hyphenated words count as 1 word), `TRUE/FALSE/NOT GIVEN` vs. `YES/NO/NOT GIVEN` checks, and a clickable question navigation palette with review flags.
- **Listening**: Neural multi-accent `.mp3` tracks (`public/audio/` + `/api/daily-audio`) with timeline scrubbing, `0.9x / 1.0x / 1.15x` speed control, **Strict Single-Play Exam Mode**, timestamp-synced speaker & transcript highlighting, and interactive spatial Town Map SVGs.
- **Writing Studio**: Live word-count tracking (`150` / `250` word minimums), continuous-prose bullet-point penalty alerts, visual tables and grouped bar charts, and side-by-side **Band 8.0+ model essays**.
- **Speaking Simulator**: Part 1 interview prompts, Part 2 Cue Cards with **1-minute preparation** + **2-minute speaking** countdown timers, keyword notepad, neural examiner prompt playback, and browser microphone recording (`MediaRecorder`).

### 4. AI Study & Rubric Coach (`/api/ai`)
- Integrated into Reading (**AI Paraphrase & Lexis Unpacker**), Writing (**AI Writing Rubric Coach**), and Speaking (**AI Cue-Card & Fluency Coach**).
- Uses **`@google/genai`** (`gemini-4-hydrogen` via the Interactions API) when `GEMINI_API_KEY` is configured in `.env.local`, and automatically falls back to a built-in local IELTS rubric & structural diagnostic engine when no API key is set.

### 5. Skill Graph, Error Deconstruction Log & Band Calculator
- Automatically captures missed Reading and Listening questions with passage/audio evidence quotes and lets you classify errors (*Lexical / Missed Paraphrase*, *Logic FALSE vs. NOT GIVEN*, *Word-Count Limit / Spelling*, *Listening Distractor Trap*).
- Interactive **Official Band Score Calculator** supporting Academic/GT Reading raw marks, Listening raw marks, weighted Writing (`1/3` Task 1 + `2/3` Task 2), Speaking rubrics, and `.25`/`.75` half-band rounding.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), `lucide-react`
- **AI SDK**: `@google/genai` (`gemini-4-hydrogen`)
- **Neural Audio Generation**: Python `edge-tts` + `ffmpeg` (`scripts/generate_audio.py`, `scripts/synthesize_dialogue.py`)

---

## Project Structure

```text
├── IELTSPLAN.md                  # Source IELTS specification & knowledge document
├── public/audio/                 # Pre-generated multi-accent MP3 tracks & prompts
├── scripts/
│   ├── generate_audio.py         # Batch generator for static Listening & Speaking MP3s
│   └── synthesize_dialogue.py    # On-demand daily dialogue MP3 synthesizer
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/route.ts       # Gemini 4 Hydrogen + local diagnostic API route
│   │   │   ├── daily/route.ts    # Daily pack generator & cache endpoint
│   │   │   └── daily-audio/route.ts # Range-capable MP3 streamer for daily audio
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/               # Dashboard, Lessons, Exercises, Simulator, Skill Graph, Calculator
│   ├── data/                     # Knowledge base, audio manifest, Reading/Listening/Writing/Speaking banks
│   ├── types/ielts.ts
│   └── utils/                    # Deterministic grading, band conversion, daily seeded generator
├── .env.example
├── next.config.mjs
└── package.json
```

---

## Getting Started

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Optional: Enable Live Gemini AI Coaching
Copy `.env.example` to `.env.local` and add your Gemini API key:
```bash
cp .env.example .env.local
```
```env
GEMINI_API_KEY=your_api_key_here
```
Restart `npm run dev`. When `GEMINI_API_KEY` is omitted, the AI Coach and Daily Generator run using built-in local diagnostics and seeded generation.

### 4. Optional: Python Environment for On-Demand Daily Neural Audio
To enable dynamic `.mp3` generation for newly generated Daily Listening sets (requires `ffmpeg` on `PATH`):
```bash
python -m venv .venv
# Windows:
.\.venv\Scripts\pip install -r requirements.txt
# macOS / Linux:
./.venv/bin/pip install -r requirements.txt
```

To regenerate the static audio bank under `public/audio/`:
```bash
.\.venv\Scripts\python scripts/generate_audio.py
```

---

## Build for Production

```bash
npm run build
npm run start
```
