import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  Scale,
  ListChecks,
  Terminal,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MODULE_KNOWLEDGE, OFFICIAL_EXTRAS } from '../data/knowledgeBase';
import { IeltsStream, SkillId } from '../types/ielts';

interface LessonsViewProps {
  selectedSkill: SkillId;
  onSelectSkill: (skill: SkillId) => void;
  stream: IeltsStream;
  checklistState: Record<string, boolean>;
  onToggleChecklist: (itemId: string) => void;
  onLaunchPractice: (skill: SkillId) => void;
}

type LessonSubTab =
  | 'overview'
  | 'question-types'
  | 'scoring'
  | 'lexis'
  | 'checklist'
  | 'cheatsheet'
  | 'nuances';

export const LessonsView: React.FC<LessonsViewProps> = ({
  selectedSkill,
  onSelectSkill,
  stream,
  checklistState,
  onToggleChecklist,
  onLaunchPractice,
}) => {
  const [subTab, setSubTab] = useState<LessonSubTab>('question-types');
  const [expandedQType, setExpandedQType] = useState<string | null>(null);
  const [miniCheckAnswers, setMiniCheckAnswers] = useState<Record<string, string>>({});
  const [revealedMiniAnswers, setRevealedMiniAnswers] = useState<Record<string, boolean>>({});

  const mod = MODULE_KNOWLEDGE[selectedSkill];

  const skillButtons: { id: SkillId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'reading', label: 'Reading (11 Types)', icon: BookOpen },
    { id: 'listening', label: 'Listening (6 Types)', icon: Headphones },
    { id: 'writing', label: 'Writing (T1 & T2)', icon: PenTool },
    { id: 'speaking', label: 'Speaking (Parts 1–3)', icon: Mic },
  ];

  const subTabs: { id: LessonSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'question-types', label: 'Question Types & Strategies', icon: Sparkles },
    { id: 'overview', label: 'Overview & Exact Format', icon: FileText },
    { id: 'scoring', label: 'Band Score & Band 6 vs 7', icon: Scale },
    { id: 'lexis', label: 'Skills & Lexical Bank', icon: BookOpen },
    { id: 'checklist', label: '10-Point Checklist', icon: ListChecks },
    { id: 'cheatsheet', label: 'Cheat Sheet', icon: Terminal },
    { id: 'nuances', label: 'Official Nuances & AI', icon: Info },
  ];

  const checkedCount = mod.checklist.filter((c) => checklistState[c.id]).length;

  return (
    <div className="space-y-5">
      {/* Top Skill Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {skillButtons.map((btn) => {
            const Icon = btn.icon;
            const active = selectedSkill === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  onSelectSkill(btn.id);
                  setExpandedQType(null);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-[#FF6B2C] text-white shadow-xs'
                    : 'bg-[#FAF8F6] text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onLaunchPractice(selectedSkill)}
          className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#FF6B2C]"
        >
          Practice {mod.title} Drills →
        </button>
      </div>

      {/* Module Header Banner */}
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-[#FFF4ED] to-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-700 uppercase">
              {stream === 'academic' ? 'IELTS Academic' : 'IELTS General Training'} • {mod.weight}
            </span>
            <h2 className="mt-1.5 text-xl font-extrabold text-slate-900">{mod.title}</h2>
            <p className="text-sm text-slate-600">{mod.subtitle}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-xs">
            <p className="font-bold text-slate-900">Timing Rule</p>
            <p className="text-slate-600">{mod.durationSummary}</p>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-orange-100 pt-3">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#FF6B2C] text-white'
                    : 'bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUBTAB 1: QUESTION TYPES & STRATEGIES */}
      {subTab === 'question-types' && (
        <div className="space-y-3">
          {mod.questionTypes.map((qt, idx) => {
            const isOpen = expandedQType === qt.id || (expandedQType === null && idx === 0);
            const miniAns = miniCheckAnswers[qt.id] ?? '';
            const isRevealed = revealedMiniAnswers[qt.id] ?? false;

            return (
              <div
                key={qt.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition"
              >
                <button
                  onClick={() => setExpandedQType(isOpen ? '__none__' : qt.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-orange-50/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF1EB] text-xs font-extrabold text-[#FF6B2C]">
                      {qt.number}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{qt.title}</h3>
                      <p className="text-xs text-slate-500">{qt.construct}</p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-slate-100 bg-[#FAF8F6]/60 px-5 py-4 text-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200/70 bg-white p-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                          Marking & Rules
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700">{qt.markingRules}</p>
                        <p className="mt-2 text-[11px] font-semibold text-slate-500">
                          Text Order: <span className="text-slate-800">{qt.followsTextOrder}</span>
                        </p>
                      </div>

                      <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Common Mistakes to Avoid
                        </p>
                        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-slate-700">
                          {qt.commonMistakes.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/70 bg-white p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Step-by-Step Strategy
                      </p>
                      <ol className="mt-2 space-y-1.5 text-xs text-slate-700">
                        {qt.strategy.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-700">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Interactive Mini-Example */}
                    <div className="rounded-xl border border-orange-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B2C]">
                          Interactive Quick Example • {qt.example.sourceTag}
                        </span>
                      </div>
                      <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs italic leading-relaxed text-slate-700">
                        <strong className="not-italic text-slate-900">{qt.example.extractLabel}: </strong>
                        {qt.example.extract}
                      </p>
                      <p className="mt-2.5 text-xs font-bold text-slate-900">{qt.example.question}</p>

                      {qt.example.options ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {qt.example.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => {
                                setMiniCheckAnswers((prev) => ({ ...prev, [qt.id]: opt }));
                                setRevealedMiniAnswers((prev) => ({ ...prev, [qt.id]: true }));
                              }}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                miniAns === opt
                                  ? 'border-[#FF6B2C] bg-[#FFF1EB] text-[#EA580C]'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <button
                            onClick={() =>
                              setRevealedMiniAnswers((prev) => ({ ...prev, [qt.id]: !isRevealed }))
                            }
                            className="rounded-lg bg-[#FF6B2C] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#EA580C]"
                          >
                            {isRevealed ? 'Hide Model Answer' : 'Reveal Model Answer'}
                          </button>
                        </div>
                      )}

                      {isRevealed && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
                          <p className="font-bold">
                            Answer: <span className="text-emerald-700">{qt.example.answer}</span>
                          </p>
                          <p className="mt-1 text-emerald-800">{qt.example.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: OVERVIEW & EXACT FORMAT */}
      {subTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">Target Construct & Purpose</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{mod.overview.construct}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{mod.overview.whyItExists}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                {mod.overview.skillsMeasured.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF6B2C]" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">Candidacy Streams</h3>
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3.5">
                <p className="text-xs font-bold text-orange-800">IELTS Academic</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {mod.overview.academicAudience}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs font-bold text-slate-800">IELTS General Training</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {mod.overview.generalAudience}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Exact Official Specification</h3>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase">
                  <th className="px-3 py-2.5">Specification Field</th>
                  <th className="px-3 py-2.5">Academic</th>
                  {mod.formatRows.some((r) => r.general) && (
                    <th className="px-3 py-2.5">General Training</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mod.formatRows.map((row) => (
                  <tr key={row.field} className="border-b border-slate-100 last:border-none">
                    <td className="px-3 py-2.5 font-bold text-slate-800">{row.field}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.academic}</td>
                    {mod.formatRows.some((r) => r.general) && (
                      <td className="px-3 py-2.5 text-slate-700">{row.general ?? row.academic}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SCORING & BAND 6 VS 7 */}
      {subTab === 'scoring' && (
        <div className="space-y-4">
          {mod.rubricNote && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
              <strong className="font-bold">Scoring Architecture: </strong>
              {mod.rubricNote}
            </div>
          )}

          {mod.rawConversionRows && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-900">
                Raw Mark (out of 40) to Band Score Conversion
              </h3>
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase">
                    <th className="px-3 py-2">Band</th>
                    <th className="px-3 py-2">
                      {selectedSkill === 'reading' ? 'Academic Raw' : 'Listening Raw'}
                    </th>
                    {selectedSkill === 'reading' && <th className="px-3 py-2">GT Raw</th>}
                    <th className="px-3 py-2">Level</th>
                    <th className="px-3 py-2">Standard Description</th>
                  </tr>
                </thead>
                <tbody>
                  {mod.rawConversionRows.map((r) => (
                    <tr key={r.band} className="border-b border-slate-100 last:border-none">
                      <td className="px-3 py-2.5 font-extrabold text-[#FF6B2C]">Band {r.band}</td>
                      <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">
                        {r.academicRaw}
                      </td>
                      {selectedSkill === 'reading' && (
                        <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">
                          {r.generalRaw}
                        </td>
                      )}
                      <td className="px-3 py-2.5 font-semibold text-slate-800">{r.cefrLevel}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mod.bandDescriptors && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Official Qualitative Band Descriptors (Band 5 – Band 9)
              </h3>
              <div className="space-y-2.5">
                {mod.bandDescriptors.map((row) => (
                  <div
                    key={row.band}
                    className="rounded-xl border border-slate-100 bg-[#FAF8F6] p-3.5"
                  >
                    <p className="mb-2 text-xs font-extrabold text-[#FF6B2C]">Band {row.band}.0</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {row.criteria.map((c) => (
                        <div key={c.label} className="rounded-lg bg-white p-2.5 text-xs shadow-2xs">
                          <p className="font-bold text-slate-800">{c.label}</p>
                          <p className="mt-1 leading-relaxed text-slate-600">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Band 6 vs Band 7 Concrete Table */}
          <div className="overflow-x-auto rounded-2xl border border-orange-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-900">{mod.band6vs7Title}</h3>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-orange-50/60 text-slate-700 uppercase">
                  <th className="px-3 py-2.5">Dimension</th>
                  <th className="px-3 py-2.5">Band 6.0 Reader/User</th>
                  <th className="px-3 py-2.5 text-[#EA580C]">Band 7.0 Target Threshold</th>
                </tr>
              </thead>
              <tbody>
                {mod.band6vs7Rows.map((row) => (
                  <tr key={row.dimension} className="border-b border-slate-100 last:border-none">
                    <td className="px-3 py-2.5 font-bold text-slate-800">{row.dimension}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.band6}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{row.band7}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SKILLS & LEXICAL BANK */}
      {subTab === 'lexis' && (
        <div className="space-y-4">
          {mod.lexicalGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {group.items.map((item) => (
                  <div key={item.label} className="rounded-xl border border-orange-100 bg-[#FAF8F6] p-3.5">
                    <p className="text-xs font-bold text-[#EA580C]">{item.label}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.phrases.map((phrase) => (
                        <span
                          key={phrase}
                          className="rounded-lg border border-orange-200/80 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
                        >
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">Systematic Time Management Plan</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              {mod.studyPlan.timeAllocation.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF6B2C]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SUBTAB 5: INTERACTIVE 10-POINT SELF-CHECKLIST */}
      {subTab === 'checklist' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mod.title} — Practice Self-Evaluation Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Tick each habit after your practice sessions (saved locally in your browser).
              </p>
            </div>
            <span className="rounded-full bg-[#FFF1EB] px-3 py-1 text-xs font-extrabold text-[#FF6B2C]">
              {checkedCount} / {mod.checklist.length} Verified
            </span>
          </div>

          <div className="space-y-2">
            {mod.checklist.map((item) => {
              const checked = !!checklistState[item.id];
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                    checked
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-[#FAF8F6] hover:border-orange-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleChecklist(item.id)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#FF6B2C]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{item.detail}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 6: QUICK-REVIEW CHEAT SHEET */}
      {subTab === 'cheatsheet' && (
        <div className="rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              {mod.title} Quick-Review Cheat Sheet
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-300">
              IELTSPLAN.md Spec
            </span>
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-orange-100">
            {mod.cheatSheetLines.join('\n')}
          </pre>
        </div>
      )}

      {/* SUBTAB 7: OFFICIAL NUANCES, GAPS, OSR & AI CAUTION */}
      {subTab === 'nuances' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">
              Source Nuances, Policy Updates & Delivery Differences
            </h3>
            <div className="mt-3 space-y-3">
              {mod.gapsAndUpdates.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-orange-100 bg-[#FAF8F6] p-3.5"
                >
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Balanced AI Tool Integration & Critical Caution
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-900">
              {mod.studyPlan.aiIntegration.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs font-semibold text-rose-800">
              Caution: {mod.studyPlan.aiCaution}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">
              IELTS One Skill Retake (OSR) & Computer-Delivered Features
            </h3>
            <p className="mt-1 text-xs text-slate-600">{OFFICIAL_EXTRAS.oneSkillRetake.summary}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
              {OFFICIAL_EXTRAS.oneSkillRetake.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
