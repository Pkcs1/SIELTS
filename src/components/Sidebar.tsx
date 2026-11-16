import React from 'react';
import {
  LayoutGrid,
  BookOpen,
  ClipboardCheck,
  MonitorPlay,
  BookMarked,
  BarChart3,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';
import { NavTab } from '../types/ielts';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unresolvedErrors: number;
  onQuickStartSimulator: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'lessons', label: 'Lessons & Guides', icon: BookOpen },
  { id: 'exercises', label: 'Exercise Bank', icon: ClipboardCheck },
  { id: 'simulator', label: 'Mock Simulator', icon: MonitorPlay },
  { id: 'vocab', label: 'Vocab & Paraphrases', icon: BookMarked },
  { id: 'skill-graph', label: 'Skill Graph & Log', icon: BarChart3 },
  { id: 'calculator', label: 'Band & Rubrics', icon: Calculator },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unresolvedErrors,
  onQuickStartSimulator,
}) => {
  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-orange-100/70 bg-white px-4 py-5 lg:w-60 lg:border-r lg:border-b-0">
      <div>
        {/* Brand Header (Focotech Style) */}
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A38] to-[#EA580C] text-white shadow-sm shadow-orange-500/30">
            <span className="text-sm font-black tracking-tight">SI</span>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              S<span className="text-[#FF6B2C]">IELTS</span>
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              IELTS Prep Studio
            </p>
          </div>
        </div>

        <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Menu
        </p>

        <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-[#FFF1EB] font-semibold text-[#FF6B2C] shadow-2xs'
                    : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${isActive ? 'text-[#FF6B2C]' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </span>
                {item.id === 'skill-graph' && unresolvedErrors > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B2C] px-1.5 text-[11px] font-bold text-white">
                    {unresolvedErrors}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Exam Simulator Callout Card */}
      <div className="mt-6 hidden rounded-2xl bg-gradient-to-br from-[#FFF4ED] via-[#FFE7D6] to-[#FDBA74]/55 p-4 lg:block">
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[#EA580C] shadow-2xs">
          <span>Full Exam Mode</span>
        </div>
        <h4 className="text-sm font-extrabold text-slate-900">
          IELTS Mock Simulator
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Practice all 17 question types and timed computer-delivered simulations across all four skills.
        </p>
        <button
          onClick={onQuickStartSimulator}
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#EA580C] shadow-sm transition hover:bg-[#FF6B2C] hover:text-white"
        >
          <span>Start Full Mock</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
