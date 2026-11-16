import { IeltsStream, ReadingQuestion, ListeningQuestion } from '../types/ielts';

/**
 * Counts words using official IELTS rules:
 * - Hyphenated compounds (e.g., "check-in", "part-time", "well-known") count as ONE word.
 * - Numbers written as figures (e.g., "1984", "24%", "7.30") count as ONE number/word token.
 */
export function countIeltsWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Normalizes extracted answers for deterministic IELTS comparison:
 * - Lowercases and trims outer whitespace
 * - Strips trailing punctuation like periods or commas
 * - Collapses multiple spaces
 */
export function normalizeAnswerToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?]+$/g, '')
    .replace(/\s+/g, ' ');
}

export interface GradeResult {
  isCorrect: boolean;
  reason: string;
  wordCount: number;
  exceededLimit: boolean;
}

export function gradeObjectiveQuestion(
  question: Pick<
    ReadingQuestion | ListeningQuestion,
    'type' | 'maxWords' | 'correctAnswer' | 'acceptedVariants'
  >,
  rawUserAnswer: string | string[] | undefined
): GradeResult {
  if (rawUserAnswer === undefined) {
    return {
      isCorrect: false,
      reason: 'No answer provided (IELTS has no negative marking — never leave blanks!).',
      wordCount: 0,
      exceededLimit: false,
    };
  }

  // Multi-select question
  if (Array.isArray(question.correctAnswer)) {
    const userArr = Array.isArray(rawUserAnswer)
      ? rawUserAnswer.map((v) => normalizeAnswerToken(v)).sort()
      : rawUserAnswer
          .split(',')
          .map((v) => normalizeAnswerToken(v))
          .filter(Boolean)
          .sort();
    const expectedArr = [...question.correctAnswer].map((v) => normalizeAnswerToken(v)).sort();
    const isMatch =
      userArr.length === expectedArr.length &&
      userArr.every((val, idx) => val === expectedArr[idx]);
    return {
      isCorrect: isMatch,
      reason: isMatch
        ? 'All selected options match the key.'
        : `Expected ${question.correctAnswer.join(' & ')}.`,
      wordCount: userArr.length,
      exceededLimit: false,
    };
  }

  const userStr = Array.isArray(rawUserAnswer) ? rawUserAnswer.join(' ') : rawUserAnswer;
  const wordCount = countIeltsWords(userStr);

  if (!userStr.trim()) {
    return {
      isCorrect: false,
      reason: 'Blank response — always guess before finishing since there is no penalty.',
      wordCount: 0,
      exceededLimit: false,
    };
  }

  if (question.maxWords !== undefined && wordCount > question.maxWords) {
    return {
      isCorrect: false,
      reason: `Word-count limit violated (${wordCount} words entered, max allowed: ${question.maxWords}). Automatically scores 0.`,
      wordCount,
      exceededLimit: true,
    };
  }

  const normalizedUser = normalizeAnswerToken(userStr);
  const validKeys = [
    normalizeAnswerToken(question.correctAnswer),
    ...(question.acceptedVariants ?? []).map(normalizeAnswerToken),
  ];

  // Check T/F/NG vs Y/N/NG confusion explicitly
  if (
    question.type === 'true-false-not-given' &&
    (normalizedUser === 'yes' || normalizedUser === 'no')
  ) {
    return {
      isCorrect: false,
      reason: 'Category mismatch: Use TRUE/FALSE/NOT GIVEN for factual tasks (not YES/NO).',
      wordCount,
      exceededLimit: false,
    };
  }
  if (
    question.type === 'yes-no-not-given' &&
    (normalizedUser === 'true' || normalizedUser === 'false')
  ) {
    return {
      isCorrect: false,
      reason: 'Category mismatch: Use YES/NO/NOT GIVEN for writer claims (not TRUE/FALSE).',
      wordCount,
      exceededLimit: false,
    };
  }

  // For single-letter options (A, B, C, i, ii, etc.), also accept if user typed "A. ..." prefix
  const isMatch = validKeys.some((key) => {
    if (normalizedUser === key) return true;
    if (key.length <= 4 && normalizedUser.startsWith(`${key} `)) return true;
    return false;
  });

  return {
    isCorrect: isMatch,
    reason: isMatch
      ? 'Exact match.'
      : `Expected "${question.correctAnswer}"${
          question.acceptedVariants?.length
            ? ` (or ${question.acceptedVariants.join(' / ')})`
            : ''
        }.`,
    wordCount,
    exceededLimit: false,
  };
}

/**
 * Converts a raw score out of 40 into an official IELTS Band Score (1.0 - 9.0)
 * based on calibrated British Council / IELTS tables in IELTSPLAN.md.
 */
export function rawReadingToBand(rawOutOf40: number, stream: IeltsStream): number {
  const s = Math.max(0, Math.min(40, Math.round(rawOutOf40)));
  if (stream === 'academic') {
    if (s >= 39) return 9.0;
    if (s >= 37) return 8.5;
    if (s >= 35) return 8.0;
    if (s >= 33) return 7.5;
    if (s >= 30) return 7.0;
    if (s >= 27) return 6.5;
    if (s >= 23) return 6.0;
    if (s >= 19) return 5.5;
    if (s >= 15) return 5.0;
    if (s >= 13) return 4.5;
    if (s >= 10) return 4.0;
    if (s >= 6) return 3.5;
    if (s >= 4) return 3.0;
    return s >= 1 ? 2.5 : 1.0;
  }

  // General Training Reading requires higher raw marks per band
  if (s >= 40) return 9.0;
  if (s >= 39) return 8.5;
  if (s >= 37) return 8.0;
  if (s >= 36) return 7.5;
  if (s >= 34) return 7.0;
  if (s >= 32) return 6.5;
  if (s >= 30) return 6.0;
  if (s >= 27) return 5.5;
  if (s >= 23) return 5.0;
  if (s >= 19) return 4.5;
  if (s >= 15) return 4.0;
  if (s >= 12) return 3.5;
  if (s >= 9) return 3.0;
  return s >= 1 ? 2.5 : 1.0;
}

export function rawListeningToBand(rawOutOf40: number): number {
  const s = Math.max(0, Math.min(40, Math.round(rawOutOf40)));
  if (s >= 39) return 9.0;
  if (s >= 37) return 8.5;
  if (s >= 35) return 8.0;
  if (s >= 32) return 7.5;
  if (s >= 30) return 7.0;
  if (s >= 26) return 6.5;
  if (s >= 23) return 6.0;
  if (s >= 18) return 5.5;
  if (s >= 16) return 5.0;
  if (s >= 13) return 4.5;
  if (s >= 10) return 4.0;
  if (s >= 8) return 3.5;
  if (s >= 6) return 3.0;
  return s >= 1 ? 2.5 : 1.0;
}

/**
 * Official IELTS rounding to the nearest whole or half band:
 * - Average ending in .25 rounds UP to .5
 * - Average ending in .75 rounds UP to the next whole band
 */
export function roundIeltsBand(rawAverage: number): number {
  const clamped = Math.max(1, Math.min(9, rawAverage));
  const floorVal = Math.floor(clamped);
  const fraction = clamped - floorVal;
  if (fraction < 0.25) return floorVal;
  if (fraction < 0.75) return floorVal + 0.5;
  return Math.min(9, floorVal + 1);
}

/**
 * Scales a partial practice set score (e.g., 7/8 questions) to a 40-question equivalent
 * so users get an estimated band score immediately after smaller drills.
 */
export function estimateBandFromSet(
  correct: number,
  total: number,
  skill: 'reading' | 'listening',
  stream: IeltsStream
): number {
  if (total <= 0) return 5.0;
  const scaledOutOf40 = Math.round((correct / total) * 40);
  return skill === 'reading'
    ? rawReadingToBand(scaledOutOf40, stream)
    : rawListeningToBand(scaledOutOf40);
}

/**
 * Detects bullet points or list fragments in Writing tasks, which incur severe penalties in IELTS.
 */
export function detectWritingBulletPenalty(text: string): boolean {
  const lines = text.split('\n');
  return lines.some((line) => /^\s*([-*•]|\d+[.)])\s+/.test(line));
}
