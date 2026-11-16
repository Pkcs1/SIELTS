'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Bell,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  DailyChallengePack,
  ErrorCategory,
  ErrorLogEntry,
  NavTab,
  PracticeSessionRecord,
  SkillId,
  UserProfileState,
  VocabCard,
} from './types/ielts';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { DashboardView } from './components/DashboardView';
import { LessonsView } from './components/LessonsView';
import { ExercisesView } from './components/ExercisesView';
import { SimulatorView } from './components/SimulatorView';
import { VocabDeckView } from './components/VocabDeckView';
import { SkillGraphView } from './components/SkillGraphView';
import { BandCalculatorView } from './components/BandCalculatorView';
import { MODULE_KNOWLEDGE } from './data/knowledgeBase';
import { READING_BANK } from './data/readingBank';
import { LISTENING_BANK } from './data/listeningBank';
import { WRITING_BANK } from './data/writingBank';
import { SPEAKING_BANK } from './data/speakingBank';
import { VOCAB_BANK } from './data/vocabBank';
import { roundIeltsBand } from './utils/grading';

const STORAGE_KEY = 'sielts-profile-v2';

const DEFAULT_PROFILE: UserProfileState = {
  candidateName: 'Naufal Rama',
  stream: 'academic',
  targetBand: 7.5,
  xpPoints: 0,
  streakDays: 0,
  activeWeekDays: [],
  weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
  checklistState: {},
  completedSets: {},
  errorLog: [],
  writingDrafts: {},
  speakingNotes: {},
  masteredVocabIds: [],
  customVocabCards: [],
};

function getTodayWeekIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

function applyStudyActivity(
  prev: UserProfileState,
  minutesAdded: number,
  xpAdded: number
): UserProfileState {
  const todayIdx = getTodayWeekIndex();
  const nextActiveWeekDays = prev.activeWeekDays.includes(todayIdx)
    ? prev.activeWeekDays
    : [...prev.activeWeekDays, todayIdx].sort((a, b) => a - b);
  const nextWeeklyMinutes = [...prev.weeklyMinutes];
  nextWeeklyMinutes[todayIdx] = (nextWeeklyMinutes[todayIdx] ?? 0) + Math.max(0, minutesAdded);

  return {
    ...prev,
    xpPoints: prev.xpPoints + Math.max(0, xpAdded),
    streakDays: Math.max(prev.streakDays, nextActiveWeekDays.length),
    activeWeekDays: nextActiveWeekDays,
    weeklyMinutes: nextWeeklyMinutes,
  };
}

function loadInitialProfile(): UserProfileState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

const TAB_TITLES: Record<NavTab, string> = {
  overview: 'Dashboard',
  lessons: 'Lessons & Strategy Guides',
  exercises: 'Exercise Bank',
  simulator: 'Computer-Delivered Simulator',
  vocab: 'Vocabulary & Paraphrase Deck',
  'skill-graph': 'Skill Graph & Error Log',
  calculator: 'Band Score Calculator & Rubrics',
};

export function App() {
  const [profile, setProfile] = useState<UserProfileState>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [lessonSkill, setLessonSkill] = useState<SkillId>('reading');
  const [exerciseSkillFilter, setExerciseSkillFilter] = useState<SkillId | 'all'>('all');
  const [simSkill, setSimSkill] = useState<SkillId>('reading');
  const [simSetId, setSimSetId] = useState<string | undefined>(undefined);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Daily Refreshing Simulator State
  const [dailyDate, setDailyDate] = useState<string>('');
  const [dailyVariant, setDailyVariant] = useState<number>(0);
  const [dailyPack, setDailyPack] = useState<DailyChallengePack | null>(null);
  const [dailyLoading, setDailyLoading] = useState<boolean>(false);

  useEffect(() => {
    setProfile(loadInitialProfile());
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    setDailyDate(localDate);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !dailyDate) return;
    let cancelled = false;
    setDailyLoading(true);
    fetch(
      `/api/daily?date=${encodeURIComponent(dailyDate)}&stream=${profile.stream}&variant=${dailyVariant}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Daily API error'))))
      .then((pack: DailyChallengePack) => {
        if (!cancelled) setDailyPack(pack);
      })
      .catch(() => {
        // Keep existing state safely on transient error
      })
      .finally(() => {
        if (!cancelled) setDailyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, dailyDate, profile.stream, dailyVariant]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota issues safely
    }
  }, [profile, hydrated]);

  // Cmd/Ctrl + K shortcut for search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Compute live skill bands & overall band
  const skillBands = useMemo<Record<SkillId, number>>(() => {
    const records = Object.values(profile.completedSets);
    const avgFor = (skill: SkillId, fallback: number) => {
      const matching = records.filter((r) => r.skill === skill);
      if (matching.length === 0) return fallback;
      const mean = matching.reduce((sum, r) => sum + r.bandEstimate, 0) / matching.length;
      return roundIeltsBand(mean);
    };

    const nonEmptyDrafts = Object.values(profile.writingDrafts)
      .map((txt) => txt.trim())
      .filter(Boolean);
    const maxDraftWords =
      nonEmptyDrafts.length > 0
        ? Math.max(...nonEmptyDrafts.map((t) => t.split(/\s+/).filter(Boolean).length))
        : 0;
    const writingFromSets = avgFor('writing', 0);

    const hasSpeakingNotes = Object.values(profile.speakingNotes).some(
      (n) => n.trim().length > 10
    );
    const speakingFromSets = avgFor('speaking', 0);

    return {
      reading: avgFor('reading', 0),
      listening: avgFor('listening', 0),
      writing:
        writingFromSets > 0
          ? writingFromSets
          : nonEmptyDrafts.length > 0
            ? maxDraftWords >= 50
              ? 6.5
              : 5.5
            : 0,
      speaking:
        speakingFromSets > 0
          ? speakingFromSets
          : hasSpeakingNotes
            ? 6.5
            : 0,
    };
  }, [profile]);

  const estimatedOverallBand = useMemo(() => {
    const activeBands = Object.values(skillBands).filter((b) => b > 0);
    if (activeBands.length === 0) return 0;
    return roundIeltsBand(
      activeBands.reduce((sum, b) => sum + b, 0) / activeBands.length
    );
  }, [skillBands]);

  // Instant cross-module search index
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: {
      id: string;
      title: string;
      category: string;
      action: () => void;
    }[] = [];

    (Object.keys(MODULE_KNOWLEDGE) as SkillId[]).forEach((sk) => {
      const mod = MODULE_KNOWLEDGE[sk];
      mod.questionTypes.forEach((qt) => {
        if (
          qt.title.toLowerCase().includes(q) ||
          qt.construct.toLowerCase().includes(q) ||
          qt.markingRules.toLowerCase().includes(q)
        ) {
          results.push({
            id: `qt-${qt.id}`,
            title: qt.title,
            category: `${mod.title} Guide`,
            action: () => {
              setLessonSkill(sk);
              setActiveTab('lessons');
              setSearchFocused(false);
            },
          });
        }
      });
    });

    READING_BANK.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.topicTag.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          title: r.title,
          category: 'Reading Simulator',
          action: () => {
            setSimSkill('reading');
            setSimSetId(r.id);
            setActiveTab('simulator');
            setSearchFocused(false);
          },
        });
      }
    });

    LISTENING_BANK.forEach((l) => {
      if (l.title.toLowerCase().includes(q) || l.contextType.toLowerCase().includes(q)) {
        results.push({
          id: l.id,
          title: `Part ${l.partNumber}: ${l.title}`,
          category: 'Listening Audio Drill',
          action: () => {
            setSimSkill('listening');
            setSimSetId(l.id);
            setActiveTab('simulator');
            setSearchFocused(false);
          },
        });
      }
    });

    WRITING_BANK.forEach((w) => {
      if (w.title.toLowerCase().includes(q) || w.promptText.toLowerCase().includes(q)) {
        results.push({
          id: w.id,
          title: w.title,
          category: w.category,
          action: () => {
            setSimSkill('writing');
            setSimSetId(w.id);
            setActiveTab('simulator');
            setSearchFocused(false);
          },
        });
      }
    });

    SPEAKING_BANK.forEach((s) => {
      if (
        s.title.toLowerCase().includes(q) ||
        s.part2.cueCardTitle.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          title: s.part2.cueCardTitle,
          category: 'Speaking Cue Card',
          action: () => {
            setSimSkill('speaking');
            setSimSetId(s.id);
            setActiveTab('simulator');
            setSearchFocused(false);
          },
        });
      }
    });

    [...VOCAB_BANK, ...(profile.customVocabCards ?? [])].forEach((v) => {
      if (
        v.term.toLowerCase().includes(q) ||
        v.questionParaphrase.toLowerCase().includes(q) ||
        v.definition.toLowerCase().includes(q)
      ) {
        results.push({
          id: `vocab-${v.id}`,
          title: `${v.term} -> ${v.questionParaphrase}`,
          category: 'Vocab & Paraphrases',
          action: () => {
            setActiveTab('vocab');
            setSearchFocused(false);
          },
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, profile.customVocabCards]);

  const handleNavigate = (tab: NavTab, skill?: SkillId, setId?: string) => {
    if (tab === 'lessons' && skill) setLessonSkill(skill);
    if (tab === 'exercises') setExerciseSkillFilter(skill ?? 'all');
    if (tab === 'simulator') {
      if (skill) setSimSkill(skill);
      setSimSetId(setId);
    }
    setActiveTab(tab);
  };

  const handleOpenSimulator = (skill: SkillId, setId?: string) => {
    setSimSkill(skill);
    setSimSetId(setId);
    setActiveTab('simulator');
  };

  const handleRecordCompletion = (
    record: PracticeSessionRecord,
    newErrors: ErrorLogEntry[]
  ) => {
    setProfile((prev) => {
      const earnedXp = record.correctCount * 15 + 25;
      const updated = applyStudyActivity(prev, Math.max(2, record.minutesSpent), earnedXp);
      return {
        ...updated,
        completedSets: {
          ...prev.completedSets,
          [record.setId]: record,
        },
        errorLog: [...newErrors, ...prev.errorLog].slice(0, 60),
      };
    });
  };

  const totalSetsCount =
    READING_BANK.length + LISTENING_BANK.length + WRITING_BANK.length + SPEAKING_BANK.length;
  const completedSetsCount =
    Object.keys(profile.completedSets).length +
    Object.values(profile.writingDrafts).filter((d) => d.trim().length > 30).length;

  const unresolvedErrors = profile.errorLog.filter((e) => !e.resolved).length;

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6">
      {/* Main Rounded Floating Container matching Focotech Frame */}
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1440px] flex-col overflow-hidden rounded-[28px] bg-[#FAF8F6] shadow-2xl shadow-orange-950/25 lg:flex-row">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => handleNavigate(tab)}
          unresolvedErrors={unresolvedErrors}
          onQuickStartSimulator={() => handleOpenSimulator('reading')}
        />

        {/* Center Main Workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Header Bar */}
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100/70 bg-white/85 px-6 py-4 backdrop-blur-xs">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                {TAB_TITLES[activeTab]}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Academic / General Training Toggle */}
              <div className="inline-flex rounded-full border border-orange-200/80 bg-[#FAF8F6] p-0.5 text-xs font-bold">
                <button
                  onClick={() => setProfile((p) => ({ ...p, stream: 'academic' }))}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
                    profile.stream === 'academic'
                      ? 'bg-[#FF6B2C] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Academic</span>
                </button>
                <button
                  onClick={() => setProfile((p) => ({ ...p, stream: 'general' }))}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
                    profile.stream === 'general'
                      ? 'bg-[#FF6B2C] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>General</span>
                </button>
              </div>

              {/* Search Bar (Cmd+K) */}
              <div className="relative">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs focus-within:border-[#FF6B2C]">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchFocused(true);
                    }}
                    placeholder="Search topics, question types..."
                    className="w-40 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none sm:w-52"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 sm:inline">
                      ⌘K
                    </span>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchFocused && searchQuery.trim() && (
                  <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-orange-100 bg-white p-2 shadow-xl">
                    {searchResults.length === 0 ? (
                      <p className="p-3 text-center text-xs text-slate-500">
                        No matches for "{searchQuery}"
                      </p>
                    ) : (
                      searchResults.map((res) => (
                        <button
                          key={res.id}
                          onClick={res.action}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-[#FFF1EB]"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{res.title}</p>
                            <p className="text-[11px] text-[#FF6B2C]">{res.category}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Error Bell & Profile Avatar */}
              <button
                onClick={() => setActiveTab('skill-graph')}
                title="Open Error Deconstruction Log"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 hover:text-[#FF6B2C]"
              >
                <Bell className="h-4 w-4" />
                {unresolvedErrors > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6B2C] px-1 text-[9px] font-bold text-white">
                    {unresolvedErrors}
                  </span>
                )}
              </button>

              <button
                onClick={() => setRightPanelOpen((o) => !o)}
                title="Toggle Candidate Analytics Panel"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A38] to-[#EA580C] text-xs font-extrabold text-white shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Main Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-5 lg:p-6">
            {activeTab === 'overview' && (
              <DashboardView
                stream={profile.stream}
                profile={profile}
                dailyDate={dailyDate}
                dailyPack={dailyPack}
                dailyLoading={dailyLoading}
                dailyVariant={dailyVariant}
                onGenerateBonusDaily={() => setDailyVariant((v) => v + 1)}
                onNavigate={handleNavigate}
                onOpenSimulator={handleOpenSimulator}
              />
            )}

            {activeTab === 'lessons' && (
              <LessonsView
                selectedSkill={lessonSkill}
                onSelectSkill={setLessonSkill}
                stream={profile.stream}
                checklistState={profile.checklistState}
                onToggleChecklist={(id) =>
                  setProfile((prev) => {
                    const nextVal = !prev.checklistState[id];
                    const nextState: UserProfileState = {
                      ...prev,
                      checklistState: {
                        ...prev.checklistState,
                        [id]: nextVal,
                      },
                    };
                    return nextVal ? applyStudyActivity(nextState, 1, 5) : nextState;
                  })
                }
                onLaunchPractice={(sk) => {
                  setExerciseSkillFilter(sk);
                  setActiveTab('exercises');
                }}
              />
            )}

            {activeTab === 'exercises' && (
              <ExercisesView
                stream={profile.stream}
                initialSkillFilter={exerciseSkillFilter}
                profile={profile}
                onStartSimulator={handleOpenSimulator}
              />
            )}

            {activeTab === 'simulator' && (
              <SimulatorView
                initialSkill={simSkill}
                initialSetId={simSetId}
                stream={profile.stream}
                profile={profile}
                dailyPack={dailyPack}
                dailyLoading={dailyLoading}
                onGenerateBonusDaily={() => setDailyVariant((v) => v + 1)}
                onRecordCompletion={handleRecordCompletion}
                onSaveWritingDraft={(promptId, text) =>
                  setProfile((prev) => {
                    const prevLen = (prev.writingDrafts[promptId] ?? '').trim().length;
                    const nextLen = text.trim().length;
                    const nextState: UserProfileState = {
                      ...prev,
                      writingDrafts: {
                        ...prev.writingDrafts,
                        [promptId]: text,
                      },
                    };
                    return prevLen <= 30 && nextLen > 30
                      ? applyStudyActivity(nextState, 5, 25)
                      : nextState;
                  })
                }
                onSaveSpeakingNote={(setId, notes) =>
                  setProfile((prev) => {
                    const prevLen = (prev.speakingNotes[setId] ?? '').trim().length;
                    const nextLen = notes.trim().length;
                    const nextState: UserProfileState = {
                      ...prev,
                      speakingNotes: {
                        ...prev.speakingNotes,
                        [setId]: notes,
                      },
                    };
                    return prevLen <= 10 && nextLen > 10
                      ? applyStudyActivity(nextState, 3, 20)
                      : nextState;
                  })
                }
              />
            )}

            {activeTab === 'vocab' && (
              <VocabDeckView
                masteredIds={profile.masteredVocabIds ?? []}
                customCards={profile.customVocabCards ?? []}
                onToggleMastered={(cardId) =>
                  setProfile((prev) => {
                    const current = prev.masteredVocabIds ?? [];
                    const exists = current.includes(cardId);
                    const nextState: UserProfileState = {
                      ...prev,
                      masteredVocabIds: exists
                        ? current.filter((id) => id !== cardId)
                        : [...current, cardId],
                    };
                    return exists ? nextState : applyStudyActivity(nextState, 1, 20);
                  })
                }
                onAddCustomCard={(card: VocabCard) =>
                  setProfile((prev) =>
                    applyStudyActivity(
                      {
                        ...prev,
                        customVocabCards: [card, ...(prev.customVocabCards ?? [])],
                      },
                      1,
                      10
                    )
                  )
                }
                onAwardXp={(amount) =>
                  setProfile((prev) => applyStudyActivity(prev, 1, amount))
                }
              />
            )}

            {activeTab === 'skill-graph' && (
              <SkillGraphView
                profile={profile}
                skillBands={skillBands}
                onChangeErrorCategory={(entryId, category: ErrorCategory) =>
                  setProfile((prev) => ({
                    ...prev,
                    errorLog: prev.errorLog.map((e) =>
                      e.id === entryId ? { ...e, category } : e
                    ),
                  }))
                }
                onToggleErrorResolved={(entryId) =>
                  setProfile((prev) => ({
                    ...prev,
                    errorLog: prev.errorLog.map((e) =>
                      e.id === entryId ? { ...e, resolved: !e.resolved } : e
                    ),
                  }))
                }
                onClearResolvedErrors={() =>
                  setProfile((prev) => ({
                    ...prev,
                    errorLog: prev.errorLog.filter((e) => !e.resolved),
                  }))
                }
                onRetrySet={(sk, sId) => handleOpenSimulator(sk, sId)}
              />
            )}

            {activeTab === 'calculator' && <BandCalculatorView stream={profile.stream} />}
          </main>
        </div>

        {/* Right Candidate Analytics Drawer */}
        <RightPanel
          profile={profile}
          isOpen={rightPanelOpen}
          onToggleOpen={() => setRightPanelOpen((o) => !o)}
          onUpdateName={(candidateName) =>
            setProfile((p) => ({ ...p, candidateName }))
          }
          onUpdateTargetBand={(targetBand) =>
            setProfile((p) => ({ ...p, targetBand }))
          }
          onResetProfile={() => {
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              // Ignore storage cleanup errors
            }
            setProfile(DEFAULT_PROFILE);
          }}
          estimatedOverallBand={estimatedOverallBand}
          activeSkillsCount={Object.values(skillBands).filter((b) => b > 0).length}
          completedSetsCount={completedSetsCount}
          totalSetsCount={totalSetsCount}
        />
      </div>
    </div>
  );
}

export default App;
