export type IeltsStream = 'academic' | 'general';

export type SkillId = 'reading' | 'listening' | 'writing' | 'speaking';

export type NavTab =
  | 'overview'
  | 'lessons'
  | 'exercises'
  | 'simulator'
  | 'vocab'
  | 'skill-graph'
  | 'calculator';

export type ErrorCategory =
  | 'lexical-paraphrase'
  | 'logic-tfng'
  | 'word-limit-spelling'
  | 'distractor-trap'
  | 'time-pressure';

export type ExamContrastTheme = 'standard' | 'yellow' | 'dark';

export interface FormatRow {
  field: string;
  academic: string;
  general?: string;
}

export interface QuestionTypeGuide {
  id: string;
  number: number;
  title: string;
  construct: string;
  markingRules: string;
  followsTextOrder: string;
  strategy: string[];
  commonMistakes: string[];
  example: {
    sourceTag: string;
    extractLabel: string;
    extract: string;
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
  };
}

export interface BandDescriptorRow {
  band: number;
  criteria: {
    label: string;
    description: string;
  }[];
}

export interface BandDiffRow {
  dimension: string;
  band6: string;
  band7: string;
}

export interface RawConversionRow {
  band: string;
  academicRaw: string;
  generalRaw?: string;
  cefrLevel: string;
  description: string;
}

export interface LexicalGroup {
  title: string;
  items: {
    label: string;
    phrases: string[];
  }[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  detail: string;
}

export interface GapOrUpdateItem {
  title: string;
  detail: string;
}

export interface ModuleKnowledge {
  id: SkillId;
  title: string;
  subtitle: string;
  durationSummary: string;
  weight: string;
  overview: {
    construct: string;
    whyItExists: string;
    skillsMeasured: string[];
    academicAudience: string;
    generalAudience: string;
  };
  formatRows: FormatRow[];
  questionTypes: QuestionTypeGuide[];
  hasQualitativeRubric: boolean;
  rubricNote?: string;
  rawConversionRows?: RawConversionRow[];
  bandDescriptors?: BandDescriptorRow[];
  band6vs7Title: string;
  band6vs7Rows: BandDiffRow[];
  lexicalGroups: LexicalGroup[];
  studyPlan: {
    timeAllocation: string[];
    aiIntegration: string[];
    aiCaution: string;
  };
  checklist: ChecklistItem[];
  cheatSheetLines: string[];
  gapsAndUpdates: GapOrUpdateItem[];
}

export type ReadingQuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'true-false-not-given'
  | 'yes-no-not-given'
  | 'matching-information'
  | 'matching-headings'
  | 'matching-features'
  | 'matching-sentence-endings'
  | 'sentence-completion'
  | 'summary-completion'
  | 'diagram-completion'
  | 'short-answer';

export interface ReadingParagraph {
  label: string;
  text: string;
}

export interface ReadingQuestion {
  id: string;
  questionNumber: number;
  type: ReadingQuestionType;
  typeLabel: string;
  instructionNote?: string;
  prompt: string;
  options?: string[];
  selectCount?: number;
  maxWords?: number;
  allowNumber?: boolean;
  correctAnswer: string | string[];
  acceptedVariants?: string[];
  paragraphRef: string;
  passageQuote: string;
  explanation: string;
}

export interface DiagramVisualSpec {
  title: string;
  subtitle: string;
  type: 'furnace-cross-section' | 'water-purification-flow' | 'aqueduct-profile';
  labels: {
    slot: string;
    hint: string;
  }[];
}

export interface ReadingPassageSet {
  id: string;
  title: string;
  stream: IeltsStream;
  sectionLabel: string;
  topicTag: string;
  difficultyBand: string;
  recommendedMinutes: number;
  wordCount: number;
  sourceStyle: string;
  isDaily?: boolean;
  glossary?: { term: string; definition: string }[];
  paragraphs: ReadingParagraph[];
  diagramSpec?: DiagramVisualSpec;
  questions: ReadingQuestion[];
}

export type ListeningQuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'matching'
  | 'map-labelling'
  | 'note-completion'
  | 'sentence-completion'
  | 'short-answer';

export interface DialogueLine {
  speaker: string;
  voiceRole: 'female-uk' | 'male-uk' | 'female-au' | 'male-us';
  text: string;
}

export interface ListeningQuestion {
  id: string;
  questionNumber: number;
  type: ListeningQuestionType;
  typeLabel: string;
  instructionNote?: string;
  prompt: string;
  options?: string[];
  selectCount?: number;
  maxWords?: number;
  allowNumber?: boolean;
  correctAnswer: string | string[];
  acceptedVariants?: string[];
  audioQuote: string;
  explanation: string;
}

export interface ListeningMapSpec {
  title: string;
  orientationNote: string;
  landmarks: {
    slotLabel: string;
    positionLabel: string;
  }[];
  optionsBox: string[];
}

export interface DynamicAudioSegment {
  lineIndex: number;
  speaker: string;
  voice: string;
  startSec: number;
  endSec: number;
}

export interface DynamicAudioMeta {
  url: string;
  durationSec: number;
  segments: DynamicAudioSegment[];
}

export interface ListeningPartSet {
  id: string;
  partNumber: 1 | 2 | 3 | 4;
  title: string;
  contextType: string;
  accentLabel: string;
  recommendedMinutes: number;
  difficultyBand: string;
  isDaily?: boolean;
  audioMeta?: DynamicAudioMeta;
  dialogue: DialogueLine[];
  mapSpec?: ListeningMapSpec;
  questions: ListeningQuestion[];
}

export interface WritingChartData {
  kind: 'table' | 'grouped-bar' | 'process-flow';
  title: string;
  unit?: string;
  headers?: string[];
  rows?: { label: string; values: (string | number)[] }[];
  bars?: {
    period: string;
    series: { name: string; value: number; color: string }[];
  }[];
  processSteps?: { step: number; stage: string; detail: string }[];
}

export interface WritingTaskPrompt {
  id: string;
  taskNumber: 1 | 2;
  stream: IeltsStream | 'both';
  category: string;
  title: string;
  recommendedMinutes: number;
  minWords: number;
  weightLabel: string;
  isDaily?: boolean;
  promptText: string;
  bullets?: string[];
  chartData?: WritingChartData;
  strategySteps: string[];
  targetVocabulary: string[];
  modelAnswer: {
    bandEstimate: string;
    wordCount: number;
    paragraphs: {
      role: string;
      text: string;
    }[];
    examinerNotes: string[];
  };
}

export interface SpeakingQuestionItem {
  id: string;
  prompt: string;
  tip: string;
  modelAnswer: string;
  usefulPhrases: string[];
}

export interface SpeakingTopicSet {
  id: string;
  title: string;
  theme: string;
  difficultyBand: string;
  isDaily?: boolean;
  part1: {
    topic: string;
    questions: SpeakingQuestionItem[];
  };
  part2: {
    cueCardTitle: string;
    bullets: string[];
    prepSeconds: number;
    speakSeconds: number;
    modelWordCount: number;
    modelParagraphs: string[];
    keyCollocations: string[];
  };
  part3: {
    themeTitle: string;
    questions: SpeakingQuestionItem[];
  };
}

export interface DailyChallengePack {
  packId: string;
  date: string;
  variant: number;
  stream: IeltsStream;
  generatedBy: 'gemini-4-hydrogen' | 'procedural-seed';
  themeTitle: string;
  reading: ReadingPassageSet;
  listening: ListeningPartSet;
  writing: WritingTaskPrompt;
  speaking: SpeakingTopicSet;
}

export interface ErrorLogEntry {
  id: string;
  skill: 'reading' | 'listening';
  setId: string;
  setTitle: string;
  questionId: string;
  questionTypeLabel: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  quote: string;
  explanation: string;
  category: ErrorCategory;
  timestamp: string;
  resolved: boolean;
}

export interface PracticeSessionRecord {
  id: string;
  skill: SkillId;
  setId: string;
  title: string;
  correctCount: number;
  totalCount: number;
  bandEstimate: number;
  minutesSpent: number;
  completedAt: string;
}

export interface VocabCard {
  id: string;
  term: string;
  questionParaphrase: string;
  definition: string;
  contextSentence: string;
  skill: SkillId;
  bandLevel: 'Band 6.5' | 'Band 7.0' | 'Band 7.5' | 'Band 8.0+';
}

export interface UserProfileState {
  candidateName: string;
  stream: IeltsStream;
  targetBand: number;
  xpPoints: number;
  streakDays: number;
  activeWeekDays: number[];
  weeklyMinutes: number[];
  checklistState: Record<string, boolean>;
  completedSets: Record<string, PracticeSessionRecord>;
  errorLog: ErrorLogEntry[];
  writingDrafts: Record<string, string>;
  speakingNotes: Record<string, string>;
  masteredVocabIds?: string[];
  customVocabCards?: VocabCard[];
}

export type QuestionGroupLayout =
  | 'standard-list'
  | 'inline-notes'
  | 'inline-summary'
  | 'inline-table'
  | 'flow-chart';

export interface QuestionGroup {
  id: string;
  rangeLabel: string;
  title?: string;
  instructionNote: string;
  layout: QuestionGroupLayout;
  optionBoxTitle?: string;
  optionBoxItems?: string[];
  inlineTemplate?: {
    heading?: string;
    bullets?: string[];
    paragraphs?: string[];
    tableHeaders?: string[];
    tableRows?: string[][];
  };
  questionNumbers: number[];
}

export interface FullReadingPassage {
  partNumber: 1 | 2 | 3;
  questionRange: [number, number];
  passage: ReadingPassageSet;
  questionGroups: QuestionGroup[];
}

export interface FullReadingMockExam {
  id: string;
  stream: IeltsStream;
  title: string;
  totalMinutes: 60;
  totalQuestions: 40;
  parts: [FullReadingPassage, FullReadingPassage, FullReadingPassage];
}

export interface FullListeningPart {
  partNumber: 1 | 2 | 3 | 4;
  questionRange: [number, number];
  preReadSeconds: number;
  partSet: ListeningPartSet;
  questionGroups: QuestionGroup[];
}

export interface FullListeningMockExam {
  id: string;
  title: string;
  totalQuestions: 40;
  reviewSeconds: 120;
  parts: [FullListeningPart, FullListeningPart, FullListeningPart, FullListeningPart];
}

export interface FullWritingMockExam {
  id: string;
  stream: IeltsStream;
  title: string;
  totalMinutes: 60;
  task1: WritingTaskPrompt;
  task2: WritingTaskPrompt;
}
