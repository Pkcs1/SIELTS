import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { ErrorCategory, SkillId, UserProfileState } from '../types/ielts';

interface SkillGraphViewProps {
  profile: UserProfileState;
  skillBands: Record<SkillId, number>;
  onChangeErrorCategory: (entryId: string, category: ErrorCategory) => void;
  onToggleErrorResolved: (entryId: string) => void;
  onClearResolvedErrors: () => void;
  onRetrySet: (skill: SkillId, setId: string) => void;
}

const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  'lexical-paraphrase': 'Lexical / Missed Paraphrase',
  'logic-tfng': 'Logic (FALSE vs NOT GIVEN)',
  'word-limit-spelling': 'Word-Count Limit / Spelling',
  'distractor-trap': 'Listening Distractor Trap',
  'time-pressure': 'Time Pressure / Rushed',
};

export const SkillGraphView: React.FC<SkillGraphViewProps> = ({
  profile,
  skillBands,
  onChangeErrorCategory,
  onToggleErrorResolved,
  onClearResolvedErrors,
  onRetrySet,
}) => {
  const completedList = Object.values(profile.completedSets).sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const categoryCounts = profile.errorLog.reduce<Record<string, number>>((acc, err) => {
    acc[err.category] = (acc[err.category] ?? 0) + 1;
    return acc;
  }, {});

  const skills: { id: SkillId; label: string; color: string }[] = [
    { id: 'reading', label: 'Reading', color: '#FF6B2C' },
    { id: 'listening', label: 'Listening', color: '#F59E0B' },
    { id: 'writing', label: 'Writing', color: '#4F46E5' },
    { id: 'speaking', label: 'Speaking', color: '#0D9488' },
  ];

  return (
    <div className="space-y-5">
      {/* Skill Proficiency Graph */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-orange-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                4-Skill Estimated Band Graph
              </h2>
              <p className="text-xs text-slate-500">
                Target Band: <strong className="text-[#FF6B2C]">{profile.targetBand.toFixed(1)}</strong>
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-[#FF6B2C]" />
          </div>

          <div className="mt-5 space-y-4">
            {skills.map((s) => {
              const band = skillBands[s.id];
              const pct = Math.round((band / 9) * 100);
              const targetPct = Math.round((profile.targetBand / 9) * 100);
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{s.label}</span>
                    <span style={{ color: s.color }}>Band {band.toFixed(1)} / 9.0</span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-900"
                      style={{ left: `${targetPct}%` }}
                      title={`Target Band ${profile.targetBand.toFixed(1)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Error Breakdown */}
        <div className="rounded-2xl border border-orange-100 bg-white p-5">
          <h3 className="text-base font-extrabold text-slate-900">
            Error Pattern Diagnosis
          </h3>
          <p className="text-xs text-slate-500">
            IELTSPLAN.md recommends classifying every mistake to eliminate repeat traps.
          </p>

          <div className="mt-4 space-y-2.5">
            {(Object.keys(ERROR_CATEGORY_LABELS) as ErrorCategory[]).map((cat) => {
              const count = categoryCounts[cat] ?? 0;
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FAF8F6] px-3.5 py-2.5 text-xs"
                >
                  <span className="font-semibold text-slate-800">{ERROR_CATEGORY_LABELS[cat]}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-extrabold ${
                      count > 0 ? 'bg-[#FFF1EB] text-[#FF6B2C]' : 'bg-white text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Deconstruction Log */}
      <div className="rounded-2xl border border-orange-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Error Deconstruction Log ({profile.errorLog.length})
            </h3>
            <p className="text-xs text-slate-500">
              Every missed item from Reading & Listening drills is captured automatically for review.
            </p>
          </div>
          {profile.errorLog.some((e) => e.resolved) && (
            <button
              onClick={onClearResolvedErrors}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:text-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Resolved</span>
            </button>
          )}
        </div>

        {profile.errorLog.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-[#FAF8F6] p-8 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />
            <p className="mt-2 text-sm font-bold text-slate-800">
              No logged errors yet!
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Complete any Reading or Listening set in the Mock Simulator — any missed questions will appear here with explanations.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.errorLog.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-xl border p-4 text-xs transition ${
                  entry.resolved
                    ? 'border-emerald-200 bg-emerald-50/35 opacity-80'
                    : 'border-orange-100 bg-[#FAF8F6]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-0.5 font-bold uppercase text-[#FF6B2C]">
                      {entry.skill} • {entry.questionTypeLabel}
                    </span>
                    <span className="font-semibold text-slate-600">{entry.setTitle}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={entry.category}
                      onChange={(e) =>
                        onChangeErrorCategory(entry.id, e.target.value as ErrorCategory)
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
                    >
                      {(Object.keys(ERROR_CATEGORY_LABELS) as ErrorCategory[]).map((cat) => (
                        <option key={cat} value={cat}>
                          {ERROR_CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onToggleErrorResolved(entry.id)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ${
                        entry.resolved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{entry.resolved ? 'Reviewed' : 'Mark Reviewed'}</span>
                    </button>

                    <button
                      onClick={() => onRetrySet(entry.skill, entry.setId)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#FF6B2C] px-2.5 py-1 font-bold text-white"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>

                <p className="mt-2 font-bold text-slate-900">{entry.prompt}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 text-rose-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Your Answer: <strong>{entry.userAnswer}</strong>
                  </span>
                  <span className="text-emerald-700">
                    Correct Key: <strong>{entry.correctAnswer}</strong>
                  </span>
                </div>
                <p className="mt-1.5 rounded-lg bg-white p-2.5 text-slate-600">
                  <strong>Evidence:</strong> "{entry.quote}" — {entry.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Completed Sessions */}
      {completedList.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Recent Completed Practice Sets</h3>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {completedList.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FAF8F6] px-3.5 py-2.5 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{rec.title}</p>
                  <p className="text-slate-500 capitalize">
                    {rec.skill} • {rec.correctCount}/{rec.totalCount} marks
                  </p>
                </div>
                <span className="rounded-lg bg-white px-2.5 py-1 font-extrabold text-[#FF6B2C] shadow-2xs">
                  Band {rec.bandEstimate.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
