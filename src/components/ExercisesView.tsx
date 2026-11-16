import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Play,
  CheckCircle2,
  Filter,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { IeltsStream, SkillId, UserProfileState } from '../types/ielts';
import { READING_BANK } from '../data/readingBank';
import { LISTENING_BANK } from '../data/listeningBank';
import { WRITING_BANK } from '../data/writingBank';
import { SPEAKING_BANK } from '../data/speakingBank';

interface ExercisesViewProps {
  stream: IeltsStream;
  initialSkillFilter?: SkillId | 'all';
  profile: UserProfileState;
  onStartSimulator: (skill: SkillId, setId: string) => void;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  stream,
  initialSkillFilter = 'all',
  profile,
  onStartSimulator,
}) => {
  const [skillFilter, setSkillFilter] = useState<SkillId | 'all'>(initialSkillFilter);
  const [streamFilter, setStreamFilter] = useState<'all' | IeltsStream>('all');
  const [qTypeFilter, setQTypeFilter] = useState<string>('all');

  const availableReadingTypes = useMemo(() => {
    const set = new Set<string>();
    READING_BANK.forEach((p) => p.questions.forEach((q) => set.add(q.typeLabel)));
    return Array.from(set);
  }, []);

  const cards = useMemo(() => {
    const list: {
      id: string;
      skill: SkillId;
      streamLabel: string;
      streamVal: IeltsStream | 'both';
      title: string;
      subtitle: string;
      difficulty: string;
      minutes: number;
      itemCountLabel: string;
      tags: string[];
      completed: boolean;
      scoreLabel?: string;
    }[] = [];

    READING_BANK.forEach((r) => {
      const done = profile.completedSets[r.id];
      const types = Array.from(new Set(r.questions.map((q) => q.typeLabel)));
      list.push({
        id: r.id,
        skill: 'reading',
        streamLabel: r.stream === 'academic' ? 'Academic' : 'General Training',
        streamVal: r.stream,
        title: r.title,
        subtitle: `${r.sectionLabel} • ${r.wordCount} words • ${r.sourceStyle}`,
        difficulty: r.difficultyBand,
        minutes: r.recommendedMinutes,
        itemCountLabel: `${r.questions.length} Questions`,
        tags: types,
        completed: !!done,
        scoreLabel: done ? `${done.correctCount}/${done.totalCount} (Band ${done.bandEstimate.toFixed(1)})` : undefined,
      });
    });

    LISTENING_BANK.forEach((l) => {
      const done = profile.completedSets[l.id];
      const types = Array.from(new Set(l.questions.map((q) => q.typeLabel)));
      list.push({
        id: l.id,
        skill: 'listening',
        streamLabel: 'Academic & GT',
        streamVal: 'both',
        title: `Part ${l.partNumber}: ${l.title}`,
        subtitle: `${l.contextType} • ${l.accentLabel}`,
        difficulty: l.difficultyBand,
        minutes: l.recommendedMinutes,
        itemCountLabel: `${l.questions.length} Questions`,
        tags: types,
        completed: !!done,
        scoreLabel: done ? `${done.correctCount}/${done.totalCount} (Band ${done.bandEstimate.toFixed(1)})` : undefined,
      });
    });

    WRITING_BANK.forEach((w) => {
      const hasDraft = (profile.writingDrafts[w.id]?.trim().length ?? 0) > 20;
      list.push({
        id: w.id,
        skill: 'writing',
        streamLabel: w.stream === 'academic' ? 'Academic' : w.stream === 'general' ? 'General Training' : 'Academic & GT',
        streamVal: w.stream,
        title: w.title,
        subtitle: `${w.category} • Min ${w.minWords} words • ${w.weightLabel}`,
        difficulty: 'Band 7.0 – 8.5 Target',
        minutes: w.recommendedMinutes,
        itemCountLabel: `Min ${w.minWords}w`,
        tags: [w.category, 'Band 8+ Model'],
        completed: hasDraft,
        scoreLabel: hasDraft ? 'Draft Saved' : undefined,
      });
    });

    SPEAKING_BANK.forEach((s) => {
      list.push({
        id: s.id,
        skill: 'speaking',
        streamLabel: 'Academic & GT',
        streamVal: 'both',
        title: s.title,
        subtitle: `Parts 1–3 Full Flow • Cue Card: "${s.part2.cueCardTitle}"`,
        difficulty: s.difficultyBand,
        minutes: 14,
        itemCountLabel: 'Parts 1–3',
        tags: ['Part 1 Interview', 'Part 2 Cue Card', 'Part 3 Abstract'],
        completed: false,
      });
    });

    return list.filter((item) => {
      if (skillFilter !== 'all' && item.skill !== skillFilter) return false;
      if (streamFilter !== 'all' && item.streamVal !== 'both' && item.streamVal !== streamFilter) {
        return false;
      }
      if (qTypeFilter !== 'all' && !item.tags.includes(qTypeFilter)) return false;
      return true;
    });
  }, [skillFilter, streamFilter, qTypeFilter, profile]);

  const skillMeta: Record<
    SkillId,
    { label: string; icon: React.ComponentType<{ className?: string }>; badgeClass: string }
  > = {
    reading: {
      label: 'Reading',
      icon: BookOpen,
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    listening: {
      label: 'Listening',
      icon: Headphones,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    writing: {
      label: 'Writing',
      icon: PenTool,
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    speaking: {
      label: 'Speaking',
      icon: Mic,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="rounded-2xl border border-orange-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Interactive Exercise & Question Bank
            </h2>
            <p className="text-xs text-slate-500">
              Practice every official IELTS task type with deterministic word-limit checks, audio synthesis, and Band 8+ models.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1EB] px-3 py-1 text-xs font-bold text-[#FF6B2C]">
            <Sparkles className="h-3.5 w-3.5" />
            {cards.length} Practice Sets Shown
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
          <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filter:
          </span>

          {(['all', 'reading', 'listening', 'writing', 'speaking'] as const).map((sk) => (
            <button
              key={sk}
              onClick={() => {
                setSkillFilter(sk);
                if (sk !== 'reading' && sk !== 'all') setQTypeFilter('all');
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                skillFilter === sk
                  ? 'bg-[#FF6B2C] text-white'
                  : 'bg-[#FAF8F6] text-slate-600 hover:bg-orange-50'
              }`}
            >
              {sk === 'all' ? 'All 4 Skills' : sk}
            </button>
          ))}

          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value as 'all' | IeltsStream)}
            className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="all">Both Streams (Current: {stream === 'academic' ? 'Academic' : 'GT'})</option>
            <option value="academic">Academic Only</option>
            <option value="general">General Training Only</option>
          </select>

          {(skillFilter === 'all' || skillFilter === 'reading') && (
            <select
              value={qTypeFilter}
              onChange={(e) => setQTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-orange-400 focus:outline-none"
            >
              <option value="all">All Reading Question Types (11)</option>
              {availableReadingTypes.map((qt) => (
                <option key={qt} value={qt}>
                  {qt}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center">
          <AlertCircle className="h-8 w-8 text-orange-400" />
          <p className="mt-2 text-sm font-bold text-slate-800">No exercise sets match those filters</p>
          <button
            onClick={() => {
              setSkillFilter('all');
              setStreamFilter('all');
              setQTypeFilter('all');
            }}
            className="mt-3 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const meta = skillMeta[card.skill];
            const Icon = meta.icon;
            return (
              <div
                key={card.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-orange-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label} • {card.streamLabel}
                    </span>

                    {card.scoreLabel ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        {card.scoreLabel}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {card.difficulty}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-[#FAF8F6] px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="text-xs text-slate-500">
                    <strong className="text-slate-800">{card.itemCountLabel}</strong> • ~{card.minutes} min
                  </div>
                  <button
                    onClick={() => onStartSimulator(card.skill, card.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B2C] px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#EA580C]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{card.completed ? 'Practice Again' : 'Open Practice'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
