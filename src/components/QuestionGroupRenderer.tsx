import React from 'react';
import { CheckCircle2, Flag, XCircle } from 'lucide-react';
import { ListeningQuestion, QuestionGroup, ReadingQuestion } from '../types/ielts';
import { countIeltsWords, gradeObjectiveQuestion } from '../utils/grading';

type ExamQuestion = ReadingQuestion | ListeningQuestion;

interface QuestionGroupRendererProps {
  groups: QuestionGroup[];
  questions: ExamQuestion[];
  answers: Record<string, string>;
  flagged: Record<string, boolean>;
  activeQuestionNumber: number;
  submitted: boolean;
  textSizeClass: string;
  onSelectQuestion: (qNum: number) => void;
  onChangeAnswer: (qId: string, val: string) => void;
  onToggleFlag: (qId: string) => void;
}

function extractOptionKey(q: ExamQuestion, opt: string): string {
  if (
    q.type === 'true-false-not-given' ||
    q.type === 'yes-no-not-given'
  ) {
    return opt;
  }
  const dotIdx = opt.indexOf('.');
  if (dotIdx > 0 && dotIdx <= 5) {
    return opt.slice(0, dotIdx).trim();
  }
  return opt.trim();
}

export const QuestionGroupRenderer: React.FC<QuestionGroupRendererProps> = ({
  groups,
  questions,
  answers,
  flagged,
  activeQuestionNumber,
  submitted,
  textSizeClass,
  onSelectQuestion,
  onChangeAnswer,
  onToggleFlag,
}) => {
  const qByNum = new Map<number, ExamQuestion>();
  questions.forEach((q) => qByNum.set(q.questionNumber, q));

  const renderFeedbackCard = (q: ExamQuestion) => {
    if (!submitted) return null;
    const res = gradeObjectiveQuestion(q, answers[q.id] ?? '');
    const sourceLabel = 'paragraphRef' in q ? `Evidence (${q.paragraphRef})` : 'Audio Quote';
    const quoteText = 'passageQuote' in q ? q.passageQuote : q.audioQuote;
    return (
      <div
        key={`fb-${q.id}`}
        className={`mt-2 rounded-lg p-2.5 text-xs ${
          res.isCorrect ? 'bg-emerald-500/15 text-emerald-800' : 'bg-rose-500/15 text-rose-800'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold">
          {res.isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          <span>
            Q{q.questionNumber}: {res.reason}
          </span>
        </div>
        <p className="mt-1 opacity-90">
          {quoteText && (
            <>
              <strong>{sourceLabel}:</strong> &ldquo;{quoteText}&rdquo; —{' '}
            </>
          )}
          {q.explanation}
        </p>
      </div>
    );
  };

  const renderInlineTokens = (template: string) => {
    const tokens = template.split(/(\{\{\d+\}\})/g);
    return tokens.map((part, i) => {
      const m = part.match(/^\{\{(\d+)\}\}$/);
      if (!m) {
        return <span key={`txt-${i}`}>{part}</span>;
      }
      const qNum = Number(m[1]);
      const q = qByNum.get(qNum);
      if (!q) return <span key={`missing-${i}`}>{part}</span>;

      const userVal = answers[q.id] ?? '';
      const wordsTyped = countIeltsWords(userVal);
      const overLimit = q.maxWords !== undefined && wordsTyped > q.maxWords;
      const isFocused = activeQuestionNumber === qNum;
      const isFlag = !!flagged[q.id];
      const gradeRes = submitted ? gradeObjectiveQuestion(q, userVal) : null;

      return (
        <span
          key={`gap-${q.id}`}
          id={`exam-card-${qNum}`}
          className="mx-1 inline-flex items-center gap-1 align-middle"
        >
          <button
            type="button"
            onClick={() => onSelectQuestion(qNum)}
            title={`Q${qNum} (click to focus)`}
            className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 font-mono text-[11px] font-extrabold ${
              isFocused
                ? 'bg-[#FF6B2C] text-white'
                : 'bg-slate-800 text-white hover:bg-[#FF6B2C]'
            }`}
          >
            {qNum}
          </button>
          <input
            id={`exam-q-${qNum}`}
            type="text"
            disabled={submitted}
            value={userVal}
            onFocus={() => onSelectQuestion(qNum)}
            onChange={(e) => onChangeAnswer(q.id, e.target.value)}
            placeholder={`Q${qNum}`}
            aria-label={`Question ${qNum}`}
            className={`w-28 rounded-md border px-2 py-0.5 text-xs font-semibold text-slate-900 transition focus:outline-none sm:w-32 ${
              gradeRes
                ? gradeRes.isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-rose-500 bg-rose-50 text-rose-900'
                : overLimit
                  ? 'border-rose-500 bg-rose-50'
                  : isFocused
                    ? 'border-[#FF6B2C] bg-white ring-2 ring-[#FF6B2C]/30'
                    : 'border-slate-300 bg-white'
            }`}
          />
          {!submitted && (
            <button
              type="button"
              onClick={() => onToggleFlag(q.id)}
              title={isFlag ? 'Remove review flag' : 'Flag for review'}
              className={`rounded p-0.5 ${
                isFlag ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
              }`}
            >
              <Flag className="h-3 w-3" />
            </button>
          )}
          {overLimit && (
            <span className="text-[10px] font-bold text-rose-600">
              ({wordsTyped}/{q.maxWords}w!)
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const groupQuestions = group.questionNumbers
          .map((n) => qByNum.get(n))
          .filter((q): q is ExamQuestion => Boolean(q));

        return (
          <section
            key={group.id}
            className="rounded-xl border p-4"
            style={{
              backgroundColor: 'var(--exam-bg)',
              borderColor: 'var(--exam-border)',
            }}
          >
            {/* Official Question Range Header */}
            <div className="border-b pb-2.5" style={{ borderColor: 'var(--exam-border)' }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#FF6B2C]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#FF6B2C]">
                  {group.rangeLabel}
                </span>
                {group.title && <h4 className="text-sm font-extrabold">{group.title}</h4>}
              </div>
              <p className="mt-1 text-xs font-semibold leading-relaxed opacity-85">
                {group.instructionNote}
              </p>
            </div>

            {/* Reference Box (List of Headings, Researchers, Endings, Park Locations) */}
            {group.optionBoxItems && group.optionBoxItems.length > 0 && (
              <div
                className="mt-3 rounded-xl border p-3.5 text-xs"
                style={{
                  backgroundColor: 'var(--exam-surface)',
                  borderColor: 'var(--exam-border)',
                }}
              >
                {group.optionBoxTitle && (
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B2C]">
                    {group.optionBoxTitle}
                  </p>
                )}
                <ul className="space-y-1.5 font-medium leading-snug">
                  {group.optionBoxItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Layout 1: Inline Notes / Bullets */}
            {group.layout === 'inline-notes' && group.inlineTemplate?.bullets && (
              <div className="mt-3 space-y-2.5">
                {group.inlineTemplate.heading && (
                  <p className="text-xs font-extrabold uppercase tracking-wider opacity-80">
                    {group.inlineTemplate.heading}
                  </p>
                )}
                <ul className={`list-disc space-y-3 pl-5 leading-relaxed ${textSizeClass}`}>
                  {group.inlineTemplate.bullets.map((line, bIdx) => (
                    <li key={`${group.id}-b-${bIdx}`}>{renderInlineTokens(line)}</li>
                  ))}
                </ul>
                {submitted && (
                  <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--exam-border)' }}>
                    {groupQuestions.map(renderFeedbackCard)}
                  </div>
                )}
              </div>
            )}

            {/* Layout 2: Inline Summary Paragraphs */}
            {group.layout === 'inline-summary' && group.inlineTemplate?.paragraphs && (
              <div className="mt-3 space-y-3">
                {group.inlineTemplate.heading && (
                  <p className="text-xs font-extrabold uppercase tracking-wider opacity-80">
                    {group.inlineTemplate.heading}
                  </p>
                )}
                {group.inlineTemplate.paragraphs.map((para, pIdx) => (
                  <p key={`${group.id}-p-${pIdx}`} className={`leading-loose ${textSizeClass}`}>
                    {renderInlineTokens(para)}
                  </p>
                ))}
                {submitted && (
                  <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--exam-border)' }}>
                    {groupQuestions.map(renderFeedbackCard)}
                  </div>
                )}
              </div>
            )}

            {/* Layout 3: Inline Table Completion */}
            {group.layout === 'inline-table' &&
              group.inlineTemplate?.tableHeaders &&
              group.inlineTemplate?.tableRows && (
                <div className="mt-3 space-y-3 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b bg-black/5" style={{ borderColor: 'var(--exam-border)' }}>
                        {group.inlineTemplate.tableHeaders.map((hdr) => (
                          <th key={hdr} className="px-3 py-2 font-extrabold uppercase tracking-wider">
                            {hdr}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.inlineTemplate.tableRows.map((row, rIdx) => (
                        <tr
                          key={`${group.id}-row-${rIdx}`}
                          className="border-b last:border-none"
                          style={{ borderColor: 'var(--exam-border)' }}
                        >
                          {row.map((cell, cIdx) => (
                            <td key={`${group.id}-c-${rIdx}-${cIdx}`} className="px-3 py-2.5 leading-relaxed">
                              {renderInlineTokens(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {submitted && (
                    <div className="space-y-1.5 border-t pt-3" style={{ borderColor: 'var(--exam-border)' }}>
                      {groupQuestions.map(renderFeedbackCard)}
                    </div>
                  )}
                </div>
              )}

            {/* Layout 4: Standard Numbered List (MCQ, Multi-Select, T/F/NG, Matching) */}
            {(group.layout === 'standard-list' || group.layout === 'flow-chart') && (
              <div className="mt-3 space-y-3">
                {groupQuestions.map((q) => {
                  const userVal = answers[q.id] ?? '';
                  const isFocused = activeQuestionNumber === q.questionNumber;
                  const isFlag = !!flagged[q.id];
                  const isMulti = q.type === 'multiple-select' || Array.isArray(q.correctAnswer);
                  const selectedMulti = userVal
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const wordsTyped = countIeltsWords(userVal);
                  const overLimit = q.maxWords !== undefined && wordsTyped > q.maxWords;

                  return (
                    <div
                      key={q.id}
                      id={`exam-card-${q.questionNumber}`}
                      onClick={() => onSelectQuestion(q.questionNumber)}
                      className={`rounded-xl border p-3.5 transition ${
                        isFocused ? 'ring-2 ring-[#FF6B2C]/65' : ''
                      }`}
                      style={{
                        backgroundColor: 'var(--exam-surface)',
                        borderColor: 'var(--exam-border)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-extrabold ${
                              isFocused
                                ? 'bg-[#FF6B2C] text-white'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {q.questionNumber}
                          </span>
                          <p className={`font-semibold leading-snug ${textSizeClass}`}>{q.prompt}</p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFlag(q.id);
                          }}
                          className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            isFlag ? 'bg-amber-400/25 text-amber-600' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Flag className="h-3 w-3" />
                          <span>{isFlag ? 'Review' : 'Flag'}</span>
                        </button>
                      </div>

                      {q.options ? (
                        isMulti ? (
                          <div className="mt-2.5 space-y-1.5 pl-8">
                            {q.options.map((opt) => {
                              const optValue = extractOptionKey(q, opt);
                              const checked = selectedMulti.includes(optValue);
                              const maxSel = ('selectCount' in q ? q.selectCount : undefined) ?? 2;
                              return (
                                <label
                                  key={opt}
                                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                    checked
                                      ? 'border-[#FF6B2C] bg-[#FF6B2C]/15 text-[#FF6B2C]'
                                      : 'border-slate-300/60 hover:border-orange-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    disabled={submitted}
                                    checked={checked}
                                    onChange={() => {
                                      let next: string[];
                                      if (checked) {
                                        next = selectedMulti.filter((v) => v !== optValue);
                                      } else {
                                        next =
                                          selectedMulti.length >= maxSel
                                            ? [...selectedMulti.slice(1), optValue]
                                            : [...selectedMulti, optValue];
                                      }
                                      onChangeAnswer(q.id, next.sort().join(', '));
                                    }}
                                    className="accent-[#FF6B2C]"
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            className={`mt-2.5 pl-8 ${
                              q.type === 'multiple-choice'
                                ? 'flex flex-col gap-1.5'
                                : 'flex flex-wrap gap-2'
                            }`}
                          >
                            {q.options.map((opt) => {
                              const optValue = extractOptionKey(q, opt);
                              const selected = userVal === optValue;
                              return (
                                <button
                                  key={opt}
                                  id={selected ? `exam-q-${q.questionNumber}` : undefined}
                                  type="button"
                                  disabled={submitted}
                                  onClick={() => onChangeAnswer(q.id, optValue)}
                                  className={`rounded-lg border px-3 py-1.5 text-left text-xs font-semibold transition ${
                                    selected
                                      ? 'border-[#FF6B2C] bg-[#FF6B2C] text-white'
                                      : 'border-slate-300/60 hover:border-orange-400'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        )
                      ) : (
                        <div className="mt-2.5 flex items-center gap-2 pl-8">
                          <input
                            id={`exam-q-${q.questionNumber}`}
                            type="text"
                            disabled={submitted}
                            value={userVal}
                            onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                            placeholder="Type answer..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-[#FF6B2C] focus:outline-none"
                          />
                          {q.maxWords && (
                            <span
                              className={`shrink-0 rounded-md px-2 py-1 font-mono text-[10px] font-bold ${
                                overLimit ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {wordsTyped}/{q.maxWords}w
                            </span>
                          )}
                        </div>
                      )}

                      {renderFeedbackCard(q)}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
