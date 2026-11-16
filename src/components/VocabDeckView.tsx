import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Plus,
  RefreshCw,
  RotateCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { SkillId, VocabCard } from '../types/ielts';
import { VOCAB_BANK } from '../data/vocabBank';

interface VocabDeckViewProps {
  masteredIds: string[];
  customCards: VocabCard[];
  onToggleMastered: (cardId: string) => void;
  onAddCustomCard: (card: VocabCard) => void;
  onAwardXp: (amount: number) => void;
}

function shuffleItems<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const VocabDeckView: React.FC<VocabDeckViewProps> = ({
  masteredIds,
  customCards,
  onToggleMastered,
  onAddCustomCard,
  onAwardXp,
}) => {
  const [mode, setMode] = useState<'flashcards' | 'match'>('flashcards');
  const [skillFilter, setSkillFilter] = useState<SkillId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Add custom card form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<string>('');
  const [newParaphrase, setNewParaphrase] = useState<string>('');
  const [newDefinition, setNewDefinition] = useState<string>('');
  const [newSentence, setNewSentence] = useState<string>('');
  const [newSkill, setNewSkill] = useState<SkillId>('reading');

  const allCards = useMemo(() => [...customCards, ...VOCAB_BANK], [customCards]);

  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      if (skillFilter !== 'all' && card.skill !== skillFilter) return false;
      const isMastered = masteredIds.includes(card.id);
      if (statusFilter === 'mastered' && !isMastered) return false;
      if (statusFilter === 'learning' && isMastered) return false;
      return true;
    });
  }, [allCards, skillFilter, statusFilter, masteredIds]);

  const safeIdx = filteredCards.length > 0 ? Math.min(cardIndex, filteredCards.length - 1) : 0;
  const currentCard = filteredCards[safeIdx];
  const isCurrentMastered = currentCard ? masteredIds.includes(currentCard.id) : false;

  // Paraphrase Match Speed Drill state
  const [roundSeed, setRoundSeed] = useState<number>(1);
  const matchRoundCards = useMemo(() => {
    const pool = [...allCards];
    // Deterministic-friendly or fresh shuffle per roundSeed
    void roundSeed;
    return shuffleItems(pool).slice(0, 5);
  }, [allCards, roundSeed]);

  const shuffledRightOptions = useMemo(() => {
    return shuffleItems(
      matchRoundCards.map((c) => ({ id: c.id, text: c.questionParaphrase }))
    );
  }, [matchRoundCards]);

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongFlash, setWrongFlash] = useState<boolean>(false);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);

  const startNewMatchRound = () => {
    setRoundSeed((s) => s + 1);
    setSelectedLeftId(null);
    setMatchedIds([]);
    setWrongFlash(false);
    setAttemptsCount(0);
  };

  const handleRightPick = (rightId: string) => {
    if (!selectedLeftId || matchedIds.includes(rightId)) return;
    setAttemptsCount((a) => a + 1);
    if (selectedLeftId === rightId) {
      const nextMatched = [...matchedIds, rightId];
      setMatchedIds(nextMatched);
      setSelectedLeftId(null);
      if (nextMatched.length === matchRoundCards.length) {
        onAwardXp(30);
      }
    } else {
      setWrongFlash(true);
      window.setTimeout(() => setWrongFlash(false), 500);
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newParaphrase.trim()) return;
    onAddCustomCard({
      id: `custom-${Date.now()}`,
      term: newTerm.trim(),
      questionParaphrase: newParaphrase.trim(),
      definition: newDefinition.trim() || 'Custom IELTS vocabulary & paraphrase entry.',
      contextSentence: newSentence.trim() || `Practice recognizing "${newTerm.trim()}" in IELTS passages.`,
      skill: newSkill,
      bandLevel: 'Band 7.5',
    });
    setNewTerm('');
    setNewParaphrase('');
    setNewDefinition('');
    setNewSentence('');
    setShowAddForm(false);
    setCardIndex(0);
    setFlipped(false);
  };

  return (
    <div className="space-y-5">
      {/* Header & Mode Switcher */}
      <div className="rounded-2xl border border-orange-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFF1EB] px-2.5 py-0.5 text-[11px] font-bold text-[#FF6B2C]">
                {masteredIds.length}/{allCards.length} Mastered
              </span>
              <span className="text-xs font-semibold text-slate-500">
                High-Frequency IELTS Paraphrase Bank
              </span>
            </div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-900">
              Vocabulary & Paraphrase Recall Deck
            </h2>
            <p className="text-xs text-slate-500">
              Train the #1 IELTS Reading & Listening skill: matching passage lexis to paraphrased question stems.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMode('flashcards')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                mode === 'flashcards'
                  ? 'bg-[#FF6B2C] text-white'
                  : 'bg-[#FAF8F6] text-slate-600 hover:bg-orange-50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Flashcards</span>
            </button>
            <button
              onClick={() => setMode('match')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                mode === 'match'
                  ? 'bg-[#FF6B2C] text-white'
                  : 'bg-[#FAF8F6] text-slate-600 hover:bg-orange-50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Paraphrase Match Game</span>
            </button>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-[#EA580C] hover:bg-orange-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {/* Custom Card Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCustom}
            className="mt-4 grid gap-3 rounded-xl border border-orange-200 bg-[#FAF8F6] p-4 sm:grid-cols-2"
          >
            <input
              required
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Passage Phrase (e.g. 'mitigate coastal erosion')"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#FF6B2C] focus:outline-none"
            />
            <input
              required
              value={newParaphrase}
              onChange={(e) => setNewParaphrase(e.target.value)}
              placeholder="Question-Stem Paraphrase (e.g. 'reduce shoreline wear')"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#FF6B2C] focus:outline-none"
            />
            <input
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              placeholder="Brief Definition (optional)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#FF6B2C] focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value as SkillId)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
              </select>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white hover:bg-[#EA580C]"
              >
                Save to Deck
              </button>
            </div>
            <input
              value={newSentence}
              onChange={(e) => setNewSentence(e.target.value)}
              placeholder="Example context sentence (optional)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#FF6B2C] focus:outline-none sm:col-span-2"
            />
          </form>
        )}
      </div>

      {/* MODE 1: ACTIVE RECALL FLASHCARDS */}
      {mode === 'flashcards' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'reading', 'listening', 'writing', 'speaking'] as const).map((sk) => (
                <button
                  key={sk}
                  onClick={() => {
                    setSkillFilter(sk);
                    setCardIndex(0);
                    setFlipped(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition ${
                    skillFilter === sk
                      ? 'bg-slate-900 text-white'
                      : 'bg-[#FAF8F6] text-slate-600 hover:bg-orange-50'
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              {(['all', 'learning', 'mastered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCardIndex(0);
                    setFlipped(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${
                    statusFilter === st
                      ? 'bg-[#FFF1EB] text-[#FF6B2C]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {!currentCard ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center">
              <BookMarked className="mx-auto h-8 w-8 text-orange-400" />
              <p className="mt-2 text-sm font-bold text-slate-800">
                No cards match this filter
              </p>
              <button
                onClick={() => {
                  setSkillFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-3 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white"
              >
                Show All Cards
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {/* Interactive Flip Card */}
              <div
                onClick={() => setFlipped((f) => !f)}
                className={`cursor-pointer rounded-3xl border-2 p-7 shadow-sm transition-all ${
                  flipped
                    ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/70 to-white'
                    : 'border-orange-200 bg-gradient-to-br from-[#FFF5EE] to-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-white px-2.5 py-1 font-bold uppercase text-[#FF6B2C] shadow-2xs">
                    {currentCard.skill} • {currentCard.bandLevel}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>{flipped ? 'Click to see Passage Term' : 'Click to Reveal Paraphrase'}</span>
                  </span>
                </div>

                {!flipped ? (
                  <div className="py-8 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Passage / Academic Expression
                    </p>
                    <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                      "{currentCard.term}"
                    </h3>
                    <p className="mx-auto mt-4 max-w-lg rounded-xl bg-white/80 p-3 text-xs italic leading-relaxed text-slate-600 shadow-2xs">
                      {currentCard.contextSentence}
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                      IELTS Question-Stem Paraphrase
                    </p>
                    <h3 className="mt-2 text-xl font-extrabold text-emerald-950">
                      {currentCard.questionParaphrase}
                    </h3>
                    <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-slate-700">
                      <strong>Meaning: </strong>
                      {currentCard.definition}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs">
                  <span className="font-mono font-bold text-slate-500">
                    Card {safeIdx + 1} / {filteredCards.length}
                  </span>
                  {isCurrentMastered && (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mastered
                    </span>
                  )}
                </div>
              </div>

              {/* Card Navigation Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setFlipped(false);
                    setCardIndex((i) => (i - 1 + filteredCards.length) % filteredCards.length);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-orange-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => onToggleMastered(currentCard.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    isCurrentMastered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FF6B2C] text-white hover:bg-[#EA580C]'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isCurrentMastered ? 'Mastered ✓' : 'Mark Mastered (+20 XP)'}</span>
                </button>

                <button
                  onClick={() => {
                    setFlipped(false);
                    setCardIndex((i) => (i + 1) % filteredCards.length);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-orange-300"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MATCH THE IELTS PARAPHRASE GAME */}
      {mode === 'match' && (
        <div className="rounded-2xl border border-orange-100 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Match the Passage Lexis to Its Question Paraphrase
              </h3>
              <p className="text-xs text-slate-500">
                Select an expression on the left, then click its IELTS synonym on the right ({matchedIds.length}/5 matched).
              </p>
            </div>
            <button
              onClick={startNewMatchRound}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-[#FF6B2C]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>New Round</span>
            </button>
          </div>

          {matchedIds.length === matchRoundCards.length ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
              <Trophy className="mx-auto h-9 w-9 text-amber-500" />
              <h4 className="mt-2 text-base font-extrabold text-emerald-950">
                Round Complete! (+30 Study XP)
              </h4>
              <p className="mt-1 text-xs text-emerald-800">
                Matched all 5 IELTS paraphrases in {attemptsCount} attempts.
              </p>
              <button
                onClick={startNewMatchRound}
                className="mt-4 rounded-xl bg-[#FF6B2C] px-5 py-2 text-xs font-bold text-white"
              >
                Play Another Round
              </button>
            </div>
          ) : (
            <div className={`grid gap-4 md:grid-cols-2 ${wrongFlash ? 'ring-2 ring-rose-300 rounded-2xl p-1' : ''}`}>
              {/* Left Passage Terms */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  1. Passage / Transcript Phrase
                </p>
                {matchRoundCards.map((card) => {
                  const isMatched = matchedIds.includes(card.id);
                  const isSelected = selectedLeftId === card.id;
                  return (
                    <button
                      key={card.id}
                      disabled={isMatched}
                      onClick={() => setSelectedLeftId(card.id)}
                      className={`w-full rounded-xl border p-3 text-left text-xs font-bold transition ${
                        isMatched
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-75'
                          : isSelected
                            ? 'border-[#FF6B2C] bg-[#FF6B2C] text-white shadow-xs'
                            : 'border-slate-200 bg-[#FAF8F6] text-slate-800 hover:border-orange-300'
                      }`}
                    >
                      "{card.term}"
                    </button>
                  );
                })}
              </div>

              {/* Right Question Paraphrases */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  2. Question-Stem Equivalent
                </p>
                {shuffledRightOptions.map((opt) => {
                  const isMatched = matchedIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      disabled={isMatched || !selectedLeftId}
                      onClick={() => handleRightPick(opt.id)}
                      className={`w-full rounded-xl border p-3 text-left text-xs font-semibold transition ${
                        isMatched
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-75'
                          : selectedLeftId
                            ? 'border-orange-200 bg-white text-slate-800 hover:border-[#FF6B2C] hover:bg-orange-50'
                            : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
