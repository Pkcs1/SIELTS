import React, { useEffect, useState } from 'react';
import {
  Flame,
  Target,
  Trophy,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Pencil,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { UserProfileState } from '../types/ielts';

interface RightPanelProps {
  profile: UserProfileState;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateName: (name: string) => void;
  onUpdateTargetBand: (band: number) => void;
  onResetProfile: () => void;
  estimatedOverallBand: number;
  activeSkillsCount: number;
  completedSetsCount: number;
  totalSetsCount: number;
}

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const RightPanel: React.FC<RightPanelProps> = ({
  profile,
  isOpen,
  onToggleOpen,
  onUpdateName,
  onUpdateTargetBand,
  onResetProfile,
  estimatedOverallBand,
  activeSkillsCount,
  completedSetsCount,
  totalSetsCount,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(profile.candidateName);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [weekMeta, setWeekMeta] = useState<{
    weekDates: (number | string)[];
    monthLabel: string;
  }>({
    weekDates: ['--', '--', '--', '--', '--', '--', '--'],
    monthLabel: 'This Week',
  });

  useEffect(() => {
    const now = new Date();
    const todayIdx = (now.getDay() + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIdx);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return d.getDate();
    });
    const monthLabel = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    setWeekMeta({ weekDates, monthLabel });
    setSelectedDayIdx(todayIdx);
  }, []);

  if (!isOpen) {
    return (
      <div className="hidden items-start border-l border-orange-100/70 bg-soft-grid p-2 lg:flex">
        <button
          onClick={onToggleOpen}
          title="Open Candidate Details"
          className="rounded-xl bg-white p-2 text-orange-600 shadow-xs transition hover:bg-orange-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const maxWeeklyMin = Math.max(60, ...profile.weeklyMinutes);

  const handleSaveName = () => {
    const clean = draftName.trim() || 'IELTS Learner';
    onUpdateName(clean);
    setEditingName(false);
  };

  return (
    <aside className="w-full shrink-0 border-t border-orange-100/80 bg-soft-grid px-4 py-4 xl:w-80 xl:border-t-0 xl:border-l">
      {/* Top Collapse Bar matching Focotech "Close Details" */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          onClick={onToggleOpen}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B2C] hover:text-[#EA580C]"
        >
          <ChevronRight className="h-3.5 w-3.5 rounded-full border border-orange-300 p-0.5" />
          <span>Close Details</span>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetProfile}
            title="Reset local study stats to zero"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </button>
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-[#EA580C]">
            Study Analytics
          </span>
        </div>
      </div>

      {/* Candidate Profile Card */}
      <div className="rounded-2xl border border-orange-100/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A38] to-[#EA580C] text-base font-extrabold text-white shadow-sm">
            {profile.candidateName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-1">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-full rounded-lg border border-orange-300 px-2 py-0.5 text-sm font-semibold text-slate-900 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="rounded-md bg-orange-500 p-1 text-white"
                  aria-label="Save name"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="rounded-md bg-slate-100 p-1 text-slate-600"
                  aria-label="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-bold text-slate-900">
                  {profile.candidateName}
                </h3>
                <button
                  onClick={() => {
                    setDraftName(profile.candidateName);
                    setEditingName(true);
                  }}
                  className="text-slate-400 hover:text-orange-500"
                  title="Edit candidate name"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500">
              {profile.stream === 'academic' ? 'IELTS Academic' : 'General Training'} Candidate
            </p>
            <p className="mt-0.5 text-xs font-semibold text-amber-600">
              ★ {profile.xpPoints} Study XP
            </p>
          </div>
        </div>

        {/* 3 Metric Chips (Days Streak, Target Band, Est. Band) */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#FAF7F4] p-2.5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-slate-900">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{profile.streakDays}</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">Days Streak</p>
          </div>

          <div className="border-x border-orange-100 text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-slate-900">
              <Target className="h-4 w-4 text-rose-500" />
              <select
                aria-label="Target Band"
                value={profile.targetBand}
                onChange={(e) => onUpdateTargetBand(parseFloat(e.target.value))}
                className="cursor-pointer bg-transparent font-extrabold text-slate-900 focus:outline-none"
              >
                {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                  <option key={b} value={b}>
                    {b.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">Target Band</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-slate-900">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>{estimatedOverallBand.toFixed(1)}</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">Est. Band</p>
          </div>
        </div>
      </div>

      {/* Weekly Streak Calendar */}
      <div className="mt-3.5 rounded-2xl border border-orange-100/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-slate-900">Weekly Streak</h4>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="rounded-lg border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {weekMeta.monthLabel}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Active Study Week</span>
          <span className="font-semibold text-orange-600">
            {profile.activeWeekDays.length}/7 Days
          </span>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {WEEK_LABELS.map((day, idx) => {
            const active = profile.activeWeekDays.includes(idx);
            return (
              <div
                key={day}
                className={`flex flex-col items-center rounded-xl py-2 text-center transition ${
                  active
                    ? 'bg-[#FF6B2C] text-white shadow-xs shadow-orange-500/25'
                    : 'bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-medium opacity-90">{day}</span>
                <span className="mt-0.5 text-xs font-bold">{weekMeta.weekDates[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Progress Stat Cards */}
      <div className="mt-3.5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-orange-100/80 bg-white p-3.5 shadow-2xs">
          <div className="inline-flex rounded-xl bg-orange-50 p-2 text-orange-500">
            <BookOpen className="h-4 w-4" />
          </div>
          <p className="mt-2.5 text-sm font-bold text-slate-900">
            {activeSkillsCount}/4 Skills
          </p>
          <p className="text-[11px] text-slate-500">
            {activeSkillsCount > 0 ? 'Active' : 'In Progress'}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100/80 bg-white p-3.5 shadow-2xs">
          <div className="inline-flex rounded-xl bg-orange-50 p-2 text-orange-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2.5 text-sm font-bold text-slate-900">
            {completedSetsCount}/{totalSetsCount} Sets
          </p>
          <p className="text-[11px] text-slate-500">Completed</p>
        </div>
      </div>

      {/* Weekly Practice Time Chart with floating dark tooltip */}
      <div className="mt-3.5 rounded-2xl border border-orange-100/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-slate-900">Weekly Study Time</h4>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {profile.weeklyMinutes.reduce((a, b) => a + b, 0)}m total
          </span>
        </div>

        <div className="mt-5 flex h-28 items-end justify-between gap-2 px-1">
          {WEEK_LABELS.map((day, idx) => {
            const mins = profile.weeklyMinutes[idx] ?? 0;
            const pct = mins === 0 ? 4 : Math.max(12, Math.round((mins / maxWeeklyMin) * 100));
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                key={day}
                onClick={() => setSelectedDayIdx(idx)}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                {isSelected && (
                  <span className="absolute -top-6 rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {mins}m
                  </span>
                )}
                <div
                  className={`w-full max-w-5 rounded-t-md transition-all ${
                    isSelected
                      ? 'bg-[#FF6B2C]'
                      : 'bg-orange-100 group-hover:bg-orange-300'
                  }`}
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[10px] font-medium text-slate-400">{day}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
