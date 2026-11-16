import React from 'react';
import { ChevronLeft, ChevronRight, Flag, RotateCcw } from 'lucide-react';

export interface ExamNavPart {
  partNumber: number;
  label: string;
  questionNumbers: number[];
  badgeText?: string;
}

interface ExamBottomNavProps {
  parts: ExamNavPart[];
  activePartNumber: number;
  activeQuestionNumber?: number;
  questionIdByNumber?: Record<number, string>;
  answers?: Record<string, string>;
  flagged?: Record<string, boolean>;
  resultsByQNum?: Record<number, { isCorrect: boolean }>;
  submitted?: boolean;
  submitLabel?: string;
  retakeLabel?: string;
  scoreSummaryText?: string;
  isActiveFlagged?: boolean;
  onSelectPart: (partNumber: number) => void;
  onSelectQuestion?: (qNum: number) => void;
  onToggleActiveFlag?: () => void;
  onSubmit?: () => void;
  onRetake?: () => void;
}

export const ExamBottomNav: React.FC<ExamBottomNavProps> = ({
  parts,
  activePartNumber,
  activeQuestionNumber,
  questionIdByNumber,
  answers,
  flagged,
  resultsByQNum,
  submitted,
  submitLabel = 'Submit Full Test',
  retakeLabel = 'Retake Full Test',
  scoreSummaryText,
  isActiveFlagged,
  onSelectPart,
  onSelectQuestion,
  onToggleActiveFlag,
  onSubmit,
  onRetake,
}) => {
  const allQuestionNumbers = parts.flatMap((p) => p.questionNumbers);
  const currentIdx = activeQuestionNumber
    ? allQuestionNumbers.indexOf(activeQuestionNumber)
    : -1;
  const activePart = parts.find((p) => p.partNumber === activePartNumber) ?? parts[0];

  const answeredCount =
    questionIdByNumber && answers
      ? allQuestionNumbers.filter((n) => {
          const qId = questionIdByNumber[n];
          return Boolean(qId && (answers[qId] ?? '').trim().length > 0);
        }).length
      : 0;

  return (
    <div className="sticky bottom-0 z-20 rounded-2xl border border-slate-200/90 bg-white/95 p-3 text-slate-900 shadow-lg backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Part Selector Tabs + Active Review Toggle */}
        <div className="flex flex-wrap items-center gap-1.5">
          {onToggleActiveFlag && activeQuestionNumber !== undefined && (
            <button
              type="button"
              onClick={onToggleActiveFlag}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                isActiveFlagged
                  ? 'border-amber-400 bg-amber-100 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-300'
              }`}
            >
              <Flag className="h-3 w-3" />
              <span>Review Q{activeQuestionNumber}</span>
            </button>
          )}

          {parts.map((part) => {
            const isActive = part.partNumber === activePartNumber;
            const partAnswered =
              questionIdByNumber && answers
                ? part.questionNumbers.filter((n) => {
                    const qId = questionIdByNumber[n];
                    return Boolean(qId && (answers[qId] ?? '').trim().length > 0);
                  }).length
                : 0;

            return (
              <button
                key={part.partNumber}
                type="button"
                onClick={() => onSelectPart(part.partNumber)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? 'border-[#FF6B2C] bg-[#FF6B2C] text-white shadow-2xs'
                    : 'border-slate-200 bg-[#FAF8F6] text-slate-700 hover:border-orange-300'
                }`}
              >
                <span>{part.label}</span>
                {part.badgeText ? (
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {part.badgeText}
                  </span>
                ) : part.questionNumbers.length > 0 ? (
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {partAnswered}/{part.questionNumbers.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Right: Prev / Next + Answered / Submit */}
        <div className="flex flex-wrap items-center gap-2">
          {allQuestionNumbers.length > 0 && onSelectQuestion && (
            <div className="flex items-center gap-1">
              <span className="mr-1 font-mono text-[11px] font-bold text-slate-500">
                {answeredCount}/{allQuestionNumbers.length}
              </span>
              <button
                type="button"
                disabled={currentIdx <= 0}
                onClick={() =>
                  currentIdx > 0 && onSelectQuestion(allQuestionNumbers[currentIdx - 1])
                }
                aria-label="Previous question"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-orange-50 disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={currentIdx < 0 || currentIdx >= allQuestionNumbers.length - 1}
                onClick={() =>
                  currentIdx >= 0 &&
                  currentIdx < allQuestionNumbers.length - 1 &&
                  onSelectQuestion(allQuestionNumbers[currentIdx + 1])
                }
                aria-label="Next question"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-orange-50 disabled:opacity-35"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {submitted && scoreSummaryText ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                {scoreSummaryText}
              </span>
              {onRetake && (
                <button
                  type="button"
                  onClick={onRetake}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{retakeLabel}</span>
                </button>
              )}
            </div>
          ) : (
            onSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                className="rounded-xl bg-[#FF6B2C] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#EA580C]"
              >
                {submitLabel}
              </button>
            )
          )}
        </div>
      </div>

      {/* Row 2: Compact CD-IELTS Numbered Squares for Active Part */}
      {activePart &&
        activePart.questionNumbers.length > 0 &&
        questionIdByNumber &&
        onSelectQuestion && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-2.5">
            {activePart.questionNumbers.map((qNum) => {
              const qId = questionIdByNumber[qNum];
              const isAnswered = Boolean(qId && answers && (answers[qId] ?? '').trim().length > 0);
              const isFlag = Boolean(qId && flagged && flagged[qId]);
              const isCurrent = activeQuestionNumber === qNum;
              const postRes = resultsByQNum?.[qNum];

              let colorClass = 'border border-slate-300 bg-white text-slate-700 hover:border-[#FF6B2C]';
              if (postRes) {
                colorClass = postRes.isCorrect
                  ? 'border border-emerald-600 bg-emerald-600 text-white'
                  : 'border border-rose-600 bg-rose-600 text-white';
              } else if (isAnswered) {
                colorClass = 'border border-slate-900 bg-slate-900 text-white';
              }

              return (
                <button
                  key={qNum}
                  type="button"
                  onClick={() => onSelectQuestion(qNum)}
                  className={`relative flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 font-mono text-[11px] font-bold transition ${colorClass} ${
                    isCurrent ? 'ring-2 ring-[#FF6B2C] ring-offset-1' : ''
                  }`}
                >
                  {qNum}
                  {isFlag && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
};
