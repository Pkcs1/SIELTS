# SIELTS

**SIELTS** is an interactive IELTS learning platform, exercise bank, and computer-delivered exam simulator built with **Next.js 15 (App Router)**, **React**, **TypeScript**, and **Tailwind CSS v4**. Designed around official IELTS Academic and General Training specifications ([IELTSPLAN.md](./IELTSPLAN.md)), it helps candidates learn strategies, drill all question types, practice with multi-accent neural audio, and track errors across all four test components.

---

## Core Features

### 1. Daily Refreshing 4-Skill Simulator (`/api/daily`)
- Automatically creates a new **Reading**, **Listening**, **Writing**, and **Speaking** set each calendar day (`YYYY-MM-DD`) with a live countdown to the next daily refresh.
- Supports generating unlimited **Bonus Sets** on demand (`variant=1, 2, ...`).
- Serves pre-bundled, rotating multi-accent neural `.mp3` tracks (`public/audio/daily-listen-0.mp3` – `daily-listen-5.mp3`) indexed with exact speaker segment timestamps in `src/data/audioManifest.ts`, requiring **zero runtime Python or `ffmpeg` subprocesses** in serverless cloud deployments (Vercel, Netlify, Railway).

### 2. IELTS Academy & Strategy Guides (`Lessons & Guides`)
- **All 17 Objective Task Types**: Step-by-step strategies, marking rules, common pitfalls, and interactive inline examples for all **11 Reading question types** and **6 Listening question types**, plus **Writing Task 1/2** and **Speaking Parts 1–3**.
- **Band Descriptors & Band 6 vs. Band 7 Breakdowns**: Official qualitative rubrics (Writing `TA/TR`, `CC`, `LR`, `GRA`; Speaking `FC`, `LR`, `GRA`, `P`), raw-to-band conversion tables (Academic vs. General Training), and CLB benchmarks.
- **10-Point Self-Checklists & Cheat Sheets**: Persistent practice checklists, lexical/discourse marker banks, One Skill Retake (OSR) rules, and Computer-Delivered interface guides.

### 3. Computer-Delivered Exam Simulator (`Mock Simulator`)
- **Reading**: Split-screen layout with click-to-highlight passage sentences, candidate scratchpad notes, display contrast modes (Standard Light, Black-on-Yellow, Dark), `A- / A / A+` font scaling, strict word-count validation (hyphenated words count as 1 word), `TRUE/FALSE/NOT GIVEN` vs. `YES/NO/NOT GIVEN` checks, and a clickable question navigation palette with review flags.
- **Listening**: Pre-generated multi-accent neural `.mp3` tracks (`public/audio/` + `src/data/audioManifest.ts`) with timeline scrubbing, `0.9x / 1.0x / 1.15x` speed control, **Strict Single-Play Exam Mode**, timestamp-synced speaker & transcript highlighting, and interactive spatial Town Map SVGs.
- **Writing Studio**: Live word-count tracking (`150` / `250` word minimums), continuous-prose bullet-point penalty alerts, visual tables and grouped bar charts, and side-by-side **Band 8.0+ model essays**.
- **Speaking Simulator**: Part 1 interview prompts, Part 2 Cue Cards with **1-minute preparation** + **2-minute speaking** countdown timers, keyword notepad, neural examiner prompt playback, browser microphone recording (`MediaRecorder`), **live Speech-to-Text (`SpeechRecognition`)** into an editable transcript, and real-time **Spoken Words**, **WPM Pace**, and **Filler Word** (`um`, `uh`, `like`, `you know`, `basically`) telemetry.

### 4. Vocabulary & Paraphrase Deck (`Vocab & Paraphrases`)
- Preloaded with **20 high-frequency IELTS paraphrase cards** (`src/data/vocabBank.ts`) across Reading, Listening, Writing, and Speaking, plus custom card creation and global `⌘K` search integration.
- **Active Recall Flashcards**: Flip between Passage Terms and IELTS Question-Stem Paraphrases, filter by skill or mastery state, and earn Study XP when marking cards as Mastered.
- **Paraphrase Match Game**: Interactive 5-pair timed matching drill pairing passage lexis with paraphrased question stems.

### 5. AI Study & Rubric Coach (`/api/ai`)
- Integrated into Reading (**AI Paraphrase & Lexis Unpacker**), Writing (**AI Writing Rubric Coach**), and Speaking (**AI Cue-Card & Fluency Coach**, evaluating spoken transcript metrics, WPM pacing, filler words, and discourse markers).
- Uses **`@google/genai`** (`gemini-4-hydrogen` via the Interactions API) when `GEMINI_API_KEY` is configured in `.env.local`, and automatically falls back to a built-in local IELTS rubric & structural diagnostic engine when no API key is set.

### 6. Skill Graph, Error Deconstruction Log & Band Calculator
- Automatically captures missed Reading and Listening questions with passage/audio evidence quotes and lets you classify errors (*Lexical / Missed Paraphrase*, *Logic FALSE vs. NOT GIVEN*, *Word-Count Limit / Spelling*, *Listening Distractor Trap*).
- Interactive **Official Band Score Calculator** supporting Academic/GT Reading raw marks, Listening raw marks, weighted Writing (`1/3` Task 1 + `2/3` Task 2), Speaking rubrics, and `.25`/`.75` half-band rounding.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), `lucide-react`
- **AI SDK**: `@google/genai` (`gemini-4-hydrogen`)
- **Neural Audio Assets**: Pre-bundled multi-accent `.mp3` tracks (`public/audio/`) offline-generated via `edge-tts` (`scripts/generate_audio.py`)

---

## Project Structure

```text
├── IELTSPLAN.md                  # Source IELTS specification & knowledge document
├── public/audio/                 # Pre-generated static & rotating daily neural MP3 tracks
├── scripts/
│   └── generate_audio.py         # Offline batch generator for static & daily Listening/Speaking MP3s
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/route.ts       # Gemini 4 Hydrogen + local diagnostic & fluency API route
│   │   │   └── daily/route.ts    # Pure Node.js cloud-ready daily pack generator
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/               # Dashboard, Lessons, Exercises, Simulator, Vocab Deck, Skill Graph, Calculator
│   ├── data/                     # Knowledge base, audio manifest, vocab bank, practice banks
│   ├── types/ielts.ts
│   └── utils/                    # Deterministic grading, band conversion, daily seeded generator
├── .env.example
├── next.config.mjs
└── package.json
```
