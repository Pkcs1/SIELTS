import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  ArrowRight,
  Clock,
  Play,
  Star,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import {
  DailyChallengePack,
  IeltsStream,
  NavTab,
  SkillId,
  UserProfileState,
} from '../types/ielts';
import { READING_BANK } from '../data/readingBank';
import { LISTENING_BANK } from '../data/listeningBank';
import { WRITING_BANK } from '../data/writingBank';
import { SPEAKING_BANK } from '../data/speakingBank';

interface DashboardViewProps {
  stream: IeltsStream;
  profile: UserProfileState;
  dailyDate: string;
  dailyPack: DailyChallengePack | null;
  dailyLoading: boolean;
  dailyVariant: number;
  onGenerateBonusDaily: () => void;
  onNavigate: (tab: NavTab, skill?: SkillId, setId?: string) => void;
  onOpenSimulator: (skill: SkillId, setId?: string) => void;
}

function getCountdownToMidnight(): string {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stream,
  profile,
  dailyDate,
  dailyPack,
  dailyLoading,
  dailyVariant,
  onGenerateBonusDaily,
  onNavigate,
  onOpenSimulator,
}) => {
  const [refreshCountdown, setRefreshCountdown] = useState<string>('--h --m');

  useEffect(() => {
    setRefreshCountdown(getCountdownToMidnight());
    const id = window.setInterval(() => setRefreshCountdown(getCountdownToMidnight()), 60000);
    return () => window.clearInterval(id);
  }, []);
  const readingCheckDone = Array.from({ length: 10 }, (_, i) => `r-c${i + 1}`).filter(
    (id) => profile.checklistState[id]
  ).length;
  const writingCheckDone = Array.from({ length: 10 }, (_, i) => `w-c${i + 1}`).filter(
    (id) => profile.checklistState[id]
  ).length;

  const streamReadingSets = READING_BANK.filter((r) => r.stream === stream);
  const completedReadingCount = streamReadingSets.filter(
    (r) => profile.completedSets[r.id]
  ).length;
  const readingProgressPct = Math.round(
    ((completedReadingCount + readingCheckDone / 10) / (streamReadingSets.length + 1)) * 100
  );

  const completedListeningCount = LISTENING_BANK.filter(
    (l) => profile.completedSets[l.id]
  ).length;
  const listeningProgressPct = Math.round((completedListeningCount / LISTENING_BANK.length) * 100);

  const recommendedCards = [
    {
      id: 'rec-reading-sim',
      skill: 'reading' as SkillId,
      setId: streamReadingSets[0]?.id ?? READING_BANK[0].id,
      badge: 'New • Interactive',
      duration: '16:00',
      title:
        stream === 'academic'
          ? 'Academic Reading: Coral Reef Refuges & Acoustics'
          : 'GT Reading: Workplace Transit & Roman Aqueducts',
      author: 'All 11 Question Types • Computer Simulator',
      bandRating: '7.0 – 8.5',
      questionsCount: streamReadingSets[0]?.questions.length ?? 8,
      gradient: 'from-[#1E293B] via-[#334155] to-[#FF6B2C]',
      accentTag: 'READING',
      actionType: 'sim' as const,
    },
    {
      id: 'rec-listening-tts',
      skill: 'listening' as SkillId,
      setId: 'list-p2',
      badge: 'Audio Synth',
      duration: '07:00',
      title: 'Listening Part 2: Town Map Labelling & Hotel Matching',
      author: 'Web Speech Multi-Accent • Map Visual',
      bandRating: '6.5 – 8.0',
      questionsCount: 5,
      gradient: 'from-[#7C2D12] via-[#C2410C] to-[#F59E0B]',
      accentTag: 'LISTENING',
      actionType: 'sim' as const,
    },
    {
      id: 'rec-writing-studio',
      skill: 'writing' as SkillId,
      setId: stream === 'academic' ? 'write-ac-t1-renewables' : 'write-gt-t1-heating',
      badge: 'Live Counter',
      duration: '20:00',
      title:
        stream === 'academic'
          ? 'Writing Task 1: European Renewables Table + Band 8 Model'
          : 'GT Task 1: Faulty Heating Letter + Register Guide',
      author: '150-Word Tracker • Prose Penalty Guard',
      bandRating: '7.5 – 8.5',
      questionsCount: WRITING_BANK.length,
      gradient: 'from-[#312E81] via-[#4338CA] to-[#FB923C]',
      accentTag: 'WRITING',
      actionType: 'sim' as const,
    },
    {
      id: 'rec-speaking-cue',
      skill: 'speaking' as SkillId,
      setId: SPEAKING_BANK[0].id,
      badge: 'Mic & Timers',
      duration: '14:00',
      title: 'Speaking Parts 1–3: Environment & Study Habits Simulator',
      author: '1-Min Prep Notepad • 2-Min Cue Card Timer',
      bandRating: '7.0 – 8.5',
      questionsCount: 3,
      gradient: 'from-[#0F766E] via-[#0D9488] to-[#F97316]',
      accentTag: 'SPEAKING',
      actionType: 'sim' as const,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Academy Overview Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200/70 bg-gradient-to-r from-[#FFF3EB] via-[#FFF8F3] to-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B2C] text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              SIELTS Learning Academy ({stream === 'academic' ? 'Academic Track' : 'General Training Track'})
            </p>
            <p className="text-xs text-slate-600">
              Official IELTS test specifications, 17 question strategies, interactive drills & computer simulations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('lessons', 'reading')}
            className="rounded-full border border-orange-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-600"
          >
            Study Strategies
          </button>
          <button
            onClick={() => onOpenSimulator('reading', streamReadingSets[0]?.id)}
            className="rounded-full bg-[#FF6B2C] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#EA580C]"
          >
            Launch Exam Sim
          </button>
        </div>
      </div>

      {/* Today's Daily Refreshing 4-Skill Simulator */}
      <section className="rounded-2xl border border-orange-200/90 bg-white p-5 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B2C] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                <CalendarDays className="h-3 w-3" />
                <span>DAILY REFRESHING SIMULATOR</span>
              </span>
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-orange-700">
                {dailyDate || 'Today'} • {dailyVariant === 0 ? 'Daily Set' : `Bonus Set #${dailyVariant}`}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>Next auto-refresh in {refreshCountdown}</span>
              </span>
            </div>
            <h2 className="mt-2 text-base font-extrabold text-slate-900">
              {dailyLoading && !dailyPack
                ? 'Generating today’s fresh Reading, Listening, Writing & Speaking pack...'
                : dailyPack
                  ? `Today’s Theme: ${dailyPack.themeTitle}`
                  : 'Daily 4-Skill IELTS Challenge'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Refreshes automatically every calendar day with unseen passages, synthesized neural Listening audio, Writing charts, and Cue Cards.
            </p>
          </div>

          <button
            onClick={onGenerateBonusDaily}
            disabled={dailyLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-[#FFF8F4] px-3.5 py-2 text-xs font-bold text-[#EA580C] transition hover:bg-[#FF6B2C] hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dailyLoading ? 'animate-spin' : ''}`} />
            <span>{dailyLoading ? 'Generating...' : 'Generate Fresh Bonus Set'}</span>
          </button>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              skill: 'reading' as SkillId,
              label: 'Daily Reading',
              sub: dailyPack ? `${dailyPack.reading.questions.length} Questions • 16m` : 'Loading...',
              id: dailyPack?.reading.id,
              done: !!(dailyPack && profile.completedSets[dailyPack.reading.id]),
              icon: BookOpen,
            },
            {
              skill: 'listening' as SkillId,
              label: 'Daily Listening',
              sub: dailyPack
                ? dailyPack.listening.audioMeta
                  ? `Neural MP3 • ${Math.round(dailyPack.listening.audioMeta.durationSec)}s`
                  : `${dailyPack.listening.questions.length} Qs • Audio`
                : 'Loading...',
              id: dailyPack?.listening.id,
              done: !!(dailyPack && profile.completedSets[dailyPack.listening.id]),
              icon: Headphones,
            },
            {
              skill: 'writing' as SkillId,
              label: 'Daily Writing',
              sub: dailyPack ? `Min ${dailyPack.writing.minWords}w + Model` : 'Loading...',
              id: dailyPack?.writing.id,
              done: !!(
                dailyPack && (profile.writingDrafts[dailyPack.writing.id]?.trim().length ?? 0) > 30
              ),
              icon: PenTool,
            },
            {
              skill: 'speaking' as SkillId,
              label: 'Daily Speaking',
              sub: dailyPack ? 'Parts 1–3 Cue Card' : 'Loading...',
              id: dailyPack?.speaking.id,
              done: !!(
                dailyPack && (profile.speakingNotes[dailyPack.speaking.id]?.trim().length ?? 0) > 10
              ),
              icon: Mic,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.skill}
                disabled={!item.id}
                onClick={() => item.id && onOpenSimulator(item.skill, item.id)}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-[#FAF8F6] p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/50 disabled:opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF6B2C] shadow-2xs">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.sub}</p>
                  </div>
                </div>
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Continue Learning Section (matches Focotech top 2 horizontal cards) */}
      <section>
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Continue Learning
          </h2>
          <button
            onClick={() => onNavigate('lessons', 'reading')}
            className="text-xs font-semibold text-[#FF6B2C] hover:underline"
          >
            View all 4 modules →
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1: Reading Mastery */}
          <div className="rounded-2xl border border-orange-100/80 bg-[#FAF6F2] p-5 transition hover:border-orange-200 hover:bg-white hover:shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-[#FF6B2C] shadow-2xs">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-slate-900">
                  {stream === 'academic' ? 'Academic Reading Mastery' : 'GT Reading Mastery'}
                </h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  11 Question Types • {readingCheckDone}/10 Checklist
                </p>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B2C] to-[#FB923C] transition-all"
                style={{ width: `${readingProgressPct}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {completedReadingCount}/{streamReadingSets.length} Passages Solved
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>60 min test format</span>
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => onNavigate('lessons', 'reading')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B2C] hover:text-[#EA580C]"
              >
                <span>Resume Module</span>
                <ArrowRight className="h-3.5 w-3.5 rounded-full border border-orange-300 p-0.5" />
              </button>
              <button
                onClick={() => onNavigate('exercises', 'reading')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Practice Drills
              </button>
            </div>
          </div>

          {/* Card 2: Listening & Writing Readiness */}
          <div className="rounded-2xl border border-orange-100/80 bg-[#FAF6F2] p-5 transition hover:border-orange-200 hover:bg-white hover:shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-[#FF6B2C] shadow-2xs">
                <Headphones className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-slate-900">
                  Listening & Writing Foundations
                </h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Parts 1–4 + Essays • {writingCheckDone}/10 Writing Checks
                </p>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B2C] to-[#FB923C] transition-all"
                style={{ width: `${listeningProgressPct}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {completedListeningCount}/{LISTENING_BANK.length} Audio Parts Solved
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>~30m + 60m</span>
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => onNavigate('lessons', 'listening')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B2C] hover:text-[#EA580C]"
              >
                <span>Resume Module</span>
                <ArrowRight className="h-3.5 w-3.5 rounded-full border border-orange-300 p-0.5" />
              </button>
              <button
                onClick={() => onNavigate('exercises', 'writing')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Writing Prompts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Practice & Simulations Section (matches Focotech media cards) */}
      <section>
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            Recommended Practice & Simulations For You
          </h2>
          <button
            onClick={() => onNavigate('exercises')}
            className="text-xs font-semibold text-[#FF6B2C] hover:underline"
          >
            Browse Exercise Bank →
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {recommendedCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onOpenSimulator(card.skill, card.setId)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            >
              {/* Visual Banner Header resembling Focotech video cards */}
              <div
                className={`relative flex h-40 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-4 text-white`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-xs">
                    {card.badge}
                  </span>
                  <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase backdrop-blur-xs">
                    {card.accentTag}
                  </span>
                </div>

                <div className="my-auto">
                  <p className="text-[11px] font-medium text-white/80">
                    SIELTS Computer Simulator
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-base font-extrabold leading-snug">
                    {card.title}
                  </p>
                </div>

                {/* Fake Scrubber Bar matching screenshot */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-[#FF6B2C] shadow-xs transition group-hover:scale-110">
                    <Play className="ml-0.5 h-3 w-3 fill-current" />
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-white/90">00:00</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                    <div
                      className={`h-full rounded-full bg-white transition-all ${
                        profile.completedSets[card.setId] ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-white/90">
                    {card.duration}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-3 px-1">
                <h3 className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-[#FF6B2C]">
                  {card.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">{card.author}</p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">Band {card.bandRating}</span>
                    <span className="text-slate-400">({card.questionsCount} items)</span>
                  </div>
                  <span className="rounded-full bg-[#FFF1EB] px-2.5 py-0.5 text-xs font-extrabold text-[#FF6B2C]">
                    Start Practice →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Skill Launch Bar */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#FF6B2C]" />
          <h3 className="text-sm font-bold text-slate-900">Quick-Jump by IELTS Component</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              skill: 'reading' as SkillId,
              label: 'Reading (11 Types)',
              meta: `${READING_BANK.length} Passages`,
              icon: BookOpen,
            },
            {
              skill: 'listening' as SkillId,
              label: 'Listening (Parts 1–4)',
              meta: `${LISTENING_BANK.length} Audio Sets`,
              icon: Headphones,
            },
            {
              skill: 'writing' as SkillId,
              label: 'Writing (Task 1 & 2)',
              meta: `${WRITING_BANK.length} Prompts + Models`,
              icon: PenTool,
            },
            {
              skill: 'speaking' as SkillId,
              label: 'Speaking (Parts 1–3)',
              meta: `${SPEAKING_BANK.length} Cue Sets`,
              icon: Mic,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.skill}
                onClick={() => onNavigate('exercises', item.skill)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-[#FAF8F6] p-3 text-left transition hover:border-orange-300 hover:bg-orange-50/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF6B2C] shadow-2xs">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-500">{item.meta}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
