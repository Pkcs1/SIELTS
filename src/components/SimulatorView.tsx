import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock,
  Highlighter,
  Flag,
  CheckCircle2,
  XCircle,
  Volume2,
  Square,
  Pause,
  Play,
  RotateCcw,
  Eye,
  EyeOff,
  Mic,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Headphones,
  PenTool,
  Sun,
  Moon,
  Contrast,
  RefreshCw,
  Award,
  Unlock,
  Lock,
  Layers,
} from 'lucide-react';
import {
  DailyChallengePack,
  ErrorLogEntry,
  ExamContrastTheme,
  IeltsStream,
  ListeningQuestion,
  PracticeSessionRecord,
  ReadingQuestion,
  SkillId,
  UserProfileState,
} from '../types/ielts';
import { READING_BANK } from '../data/readingBank';
import { LISTENING_BANK } from '../data/listeningBank';
import { WRITING_BANK } from '../data/writingBank';
import { SPEAKING_BANK } from '../data/speakingBank';
import {
  FULL_LISTENING_EXAM,
  FULL_READING_EXAMS,
  FULL_WRITING_EXAMS,
} from '../data/fullMockExams';
import { AUDIO_MANIFEST } from '../data/audioManifest';
import {
  countIeltsWords,
  detectWritingBulletPenalty,
  estimateBandFromSet,
  FullExamGradeSummary,
  gradeFullExamSection,
  gradeObjectiveQuestion,
} from '../utils/grading';
import { FurnaceDiagramSvg, TownMapSvg, WritingVisualRenderer } from './VisualCharts';
import { QuestionGroupRenderer } from './QuestionGroupRenderer';
import { ExamBottomNav, ExamNavPart } from './ExamBottomNav';

interface SimulatorViewProps {
  initialSkill: SkillId;
  initialSetId?: string;
  stream: IeltsStream;
  profile: UserProfileState;
  dailyPack?: DailyChallengePack | null;
  dailyLoading?: boolean;
  onGenerateBonusDaily?: () => void;
  onRecordCompletion: (record: PracticeSessionRecord, newErrors: ErrorLogEntry[]) => void;
  onSaveWritingDraft: (promptId: string, text: string) => void;
  onSaveSpeakingNote: (setId: string, notes: string) => void;
}

function formatTimer(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  initialSkill,
  initialSetId,
  stream,
  profile,
  dailyPack,
  dailyLoading,
  onGenerateBonusDaily,
  onRecordCompletion,
  onSaveWritingDraft,
  onSaveSpeakingNote,
}) => {
  const [skill, setSkill] = useState<SkillId>(initialSkill);
  const [simMode, setSimMode] = useState<'full-exam' | 'quick-drill'>(
    initialSetId ? 'quick-drill' : 'full-exam'
  );
  const [contrastTheme, setContrastTheme] = useState<ExamContrastTheme>('standard');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const allReadingSets = dailyPack ? [dailyPack.reading, ...READING_BANK] : READING_BANK;
  const allListeningSets = dailyPack ? [dailyPack.listening, ...LISTENING_BANK] : LISTENING_BANK;
  const allWritingPrompts = dailyPack ? [dailyPack.writing, ...WRITING_BANK] : WRITING_BANK;
  const allSpeakingSets = dailyPack ? [dailyPack.speaking, ...SPEAKING_BANK] : SPEAKING_BANK;

  // Full 1:1 Exam active structures
  const fullReadingExam = FULL_READING_EXAMS[stream];
  const fullListeningExam = FULL_LISTENING_EXAM;
  const fullWritingExam = FULL_WRITING_EXAMS[stream];

  const [fullReadPartNum, setFullReadPartNum] = useState<1 | 2 | 3>(1);
  const [fullListPartNum, setFullListPartNum] = useState<1 | 2 | 3 | 4>(1);
  const [fullWriteTaskNum, setFullWriteTaskNum] = useState<1 | 2>(1);
  const [fullActiveQNum, setFullActiveQNum] = useState<number>(1);
  const [fullExamSummaries, setFullExamSummaries] = useState<
    Record<string, FullExamGradeSummary | null>
  >({});

  // Full 1:1 Listening strict single-play + pre-read + 2:00 check state
  const [unlockFullListeningAudio, setUnlockFullListeningAudio] = useState<boolean>(false);
  const [fullListPreReadLeft, setFullListPreReadLeft] = useState<number>(0);
  const [fullListPreReadActive, setFullListPreReadActive] = useState<boolean>(false);
  const [fullListReviewLeft, setFullListReviewLeft] = useState<number>(120);
  const [fullListReviewActive, setFullListReviewActive] = useState<boolean>(false);
  const [fullListPlayedParts, setFullListPlayedParts] = useState<Record<number, boolean>>({});
  const [fullListPlayingPart, setFullListPlayingPart] = useState<number | null>(null);
  const [fullListAudioSec, setFullListAudioSec] = useState<number>(0);
  const [fullListAudioDur, setFullListAudioDur] = useState<number>(0);
  const [fullListLineIdx, setFullListLineIdx] = useState<number>(-1);
  const [fullListShowScript, setFullListShowScript] = useState<boolean>(false);
  const [fullListPlaybackRate, setFullListPlaybackRate] = useState<number>(1.0);
  const fullListAudioRef = useRef<HTMLAudioElement | null>(null);
  const [timeExpiredNotice, setTimeExpiredNotice] = useState<string | null>(null);

  // Active dataset selection per skill (Quick & Daily Drills)
  const [readingId, setReadingId] = useState<string>(
    initialSkill === 'reading' && initialSetId ? initialSetId : allReadingSets[0].id
  );
  const [listeningId, setListeningId] = useState<string>(
    initialSkill === 'listening' && initialSetId ? initialSetId : allListeningSets[0].id
  );
  const [writingId, setWritingId] = useState<string>(
    initialSkill === 'writing' && initialSetId ? initialSetId : allWritingPrompts[0].id
  );
  const [speakingId, setSpeakingId] = useState<string>(
    initialSkill === 'speaking' && initialSetId ? initialSetId : allSpeakingSets[0].id
  );

  const jumpToDailyOnRefreshRef = useRef<boolean>(false);

  // Sync incoming selection changes from Dashboard / Exercises
  useEffect(() => {
    setSkill(initialSkill);
    if (initialSetId) {
      setSimMode('quick-drill');
      if (initialSkill === 'reading') setReadingId(initialSetId);
      if (initialSkill === 'listening') setListeningId(initialSetId);
      if (initialSkill === 'writing') setWritingId(initialSetId);
      if (initialSkill === 'speaking') setSpeakingId(initialSetId);
    } else {
      setSimMode('full-exam');
    }
  }, [initialSkill, initialSetId]);

  useEffect(() => {
    if (dailyPack && jumpToDailyOnRefreshRef.current) {
      jumpToDailyOnRefreshRef.current = false;
      setSimMode('quick-drill');
      setReadingId(dailyPack.reading.id);
      setListeningId(dailyPack.listening.id);
      setWritingId(dailyPack.writing.id);
      setSpeakingId(dailyPack.speaking.id);
    }
  }, [dailyPack]);

  const activeReading = allReadingSets.find((r) => r.id === readingId) ?? allReadingSets[0];
  const activeListening = allListeningSets.find((l) => l.id === listeningId) ?? allListeningSets[0];
  const activeWriting = allWritingPrompts.find((w) => w.id === writingId) ?? allWritingPrompts[0];
  const activeSpeaking = allSpeakingSets.find((s) => s.id === speakingId) ?? allSpeakingSets[0];

  // Computer-delivered highlighter + right-click note state
  const [highlightedSentences, setHighlightedSentences] = useState<Record<string, boolean>>({});
  const [examNote, setExamNote] = useState<string>('');
  const [showNotePad, setShowNotePad] = useState<boolean>(false);

  // Reading & Listening answers, flags & grading
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submittedSets, setSubmittedSets] = useState<Record<string, boolean>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Exam countdown timer
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(
    simMode === 'full-exam' ? 60 * 60 : activeReading.recommendedMinutes * 60
  );

  useEffect(() => {
    setTimeExpiredNotice(null);
    if (simMode === 'full-exam') {
      const fullMins =
        skill === 'reading'
          ? 60
          : skill === 'listening'
            ? 32
            : skill === 'writing'
              ? 60
              : 14;
      setSecondsLeft(fullMins * 60);
      setTimerRunning(false);
      setFullActiveQNum(1);
      setFullReadPartNum(1);
      setFullListPartNum(1);
      setFullWriteTaskNum(1);
      return;
    }

    let defaultMins = 20;
    if (skill === 'reading') defaultMins = activeReading.recommendedMinutes;
    if (skill === 'listening') defaultMins = activeListening.recommendedMinutes;
    if (skill === 'writing') defaultMins = activeWriting.recommendedMinutes;
    if (skill === 'speaking') defaultMins = 14;
    setSecondsLeft(defaultMins * 60);
    setTimerRunning(false);
    setActiveQuestionIdx(0);
  }, [skill, simMode, stream, readingId, listeningId, writingId, speakingId]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // Listening Neural Audio (.mp3) player state
  const activeListeningManifest =
    activeListening.audioMeta ?? AUDIO_MANIFEST.listening[activeListening.id];
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [strictSinglePlay, setStrictSinglePlay] = useState<boolean>(false);
  const [playedOnceIds, setPlayedOnceIds] = useState<Record<string, boolean>>({});
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const [audioCurrentSec, setAudioCurrentSec] = useState<number>(0);
  const [audioDurationSec, setAudioDurationSec] = useState<number>(
    activeListeningManifest?.durationSec ?? 0
  );
  const listeningAudioRef = useRef<HTMLAudioElement | null>(null);
  const promptAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudioCurrentSec(0);
    const matched = allListeningSets.find((l) => l.id === listeningId);
    setAudioDurationSec(
      matched?.audioMeta?.durationSec ?? AUDIO_MANIFEST.listening[listeningId]?.durationSec ?? 0
    );
    setActiveLineIdx(-1);
    setAudioPlaying(false);
    if (listeningAudioRef.current) {
      listeningAudioRef.current.pause();
      listeningAudioRef.current.currentTime = 0;
    }
  }, [listeningId, dailyPack]);

  useEffect(() => {
    if (listeningAudioRef.current) {
      listeningAudioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    return () => {
      listeningAudioRef.current?.pause();
      fullListAudioRef.current?.pause();
      promptAudioRef.current?.pause();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (fullListAudioRef.current) {
      fullListAudioRef.current.playbackRate = fullListPlaybackRate;
    }
  }, [fullListPlaybackRate]);

  useEffect(() => {
    if (!fullListPreReadActive) return;
    const id = window.setInterval(() => {
      setFullListPreReadLeft((s) => {
        if (s <= 1) {
          setFullListPreReadActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [fullListPreReadActive]);

  useEffect(() => {
    if (!fullListReviewActive) return;
    const id = window.setInterval(() => {
      setFullListReviewLeft((s) => {
        if (s <= 1) {
          setFullListReviewActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [fullListReviewActive]);

  const stopAudio = () => {
    if (listeningAudioRef.current) {
      listeningAudioRef.current.pause();
      listeningAudioRef.current.currentTime = 0;
    }
    setAudioPlaying(false);
    setAudioCurrentSec(0);
    setActiveLineIdx(-1);
  };

  const toggleListeningPlayback = () => {
    const audioEl = listeningAudioRef.current;
    if (!activeListeningManifest?.url) {
      if ('speechSynthesis' in window) {
        if (audioPlaying) {
          window.speechSynthesis.cancel();
          setAudioPlaying(false);
          setActiveLineIdx(-1);
          return;
        }
        setAudioPlaying(true);
        setPlayedOnceIds((prev) => ({ ...prev, [activeListening.id]: true }));
        let idx = 0;
        const lines = activeListening.dialogue;
        const nextUtter = () => {
          if (idx >= lines.length) {
            setAudioPlaying(false);
            setActiveLineIdx(-1);
            return;
          }
          setActiveLineIdx(idx);
          const u = new SpeechSynthesisUtterance(lines[idx].text);
          u.rate = playbackRate;
          u.onend = () => {
            idx += 1;
            nextUtter();
          };
          window.speechSynthesis.speak(u);
        };
        nextUtter();
      } else {
        setShowTranscript(true);
      }
      return;
    }

    if (!audioEl) return;

    if (audioPlaying) {
      if (strictSinglePlay) return;
      audioEl.pause();
      setAudioPlaying(false);
      return;
    }

    if (strictSinglePlay && playedOnceIds[activeListening.id]) return;

    audioEl.playbackRate = playbackRate;
    setPlayedOnceIds((prev) => ({ ...prev, [activeListening.id]: true }));
    if (!timerRunning) setTimerRunning(true);
    void audioEl.play().then(
      () => setAudioPlaying(true),
      () => setShowTranscript(true)
    );
  };

  const handleScrubAudio = (newTimeSec: number) => {
    if (strictSinglePlay || !listeningAudioRef.current) return;
    listeningAudioRef.current.currentTime = newTimeSec;
    setAudioCurrentSec(newTimeSec);
  };

  // Writing Studio state
  const [showWritingModel, setShowWritingModel] = useState<boolean>(false);
  const currentWritingDraft = profile.writingDrafts[activeWriting.id] ?? '';
  const writingWordCount = countIeltsWords(currentWritingDraft);
  const hasBulletPenalty = detectWritingBulletPenalty(currentWritingDraft);

  // Speaking Studio state (1-min prep, 2-min speak, MediaRecorder)
  const [speakPhase, setSpeakPhase] = useState<'part1' | 'part2' | 'part3'>('part2');
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(60);
  const [prepRunning, setPrepRunning] = useState<boolean>(false);
  const [talkSecondsLeft, setTalkSecondsLeft] = useState<number>(120);
  const [talkRunning, setTalkRunning] = useState<boolean>(false);
  const [hidePart2Timer, setHidePart2Timer] = useState<boolean>(false);
  const [showSpeakingModel, setShowSpeakingModel] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [recordingElapsedSec, setRecordingElapsedSec] = useState<number>(0);
  const [sttSupported, setSttSupported] = useState<boolean>(true);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => {
      setRecordingElapsedSec((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  const spokenWordCount = countIeltsWords(spokenTranscript);
  const spokenFillerCount = (
    spokenTranscript
      .toLowerCase()
      .match(/\b(um+|uh+|er+|ah+|like|you know|basically|literally)\b/g) ?? []
  ).length;
  const spokenWpm =
    recordingElapsedSec >= 3 && spokenWordCount > 0
      ? Math.round((spokenWordCount / recordingElapsedSec) * 60)
      : 0;
  const spokenDiscourseFound = [
    'first off',
    'having said that',
    'on the flip side',
    'to a certain extent',
    'however',
    'moreover',
    'for instance',
    'personally',
    'in conclusion',
  ].filter((m) => spokenTranscript.toLowerCase().includes(m));

  // Next.js AI Study & Rubric Coach state (POST /api/ai)
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setAiFeedback(null);
    setAiError(null);
    setAiSource(null);
  }, [skill, readingId, writingId, speakingId]);

  const requestAiCoach = async (
    mode: 'reading' | 'writing' | 'speaking',
    promptTitle: string,
    promptText: string,
    userText: string,
    extra?: { spokenTranscript?: string; wpm?: number; fillerCount?: number }
  ) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          promptTitle,
          promptText,
          userText,
          stream,
          ...extra,
        }),
      });
      const data = (await res.json()) as {
        source?: string;
        feedback?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'AI Coach request failed.');
      }
      setAiSource(data.source ?? 'local-heuristic');
      setAiFeedback(data.feedback ?? '');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach AI Coach.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!prepRunning) return;
    const id = window.setInterval(() => {
      setPrepSecondsLeft((s) => {
        if (s <= 1) {
          setPrepRunning(false);
          if (simMode === 'full-exam') {
            setTalkSecondsLeft(120);
            setTalkRunning(true);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [prepRunning, simMode]);

  useEffect(() => {
    if (!talkRunning) return;
    const id = window.setInterval(() => {
      setTalkSecondsLeft((s) => {
        if (s <= 1) {
          setTalkRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [talkRunning]);

  const startMicRecording = async () => {
    setMicError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Microphone recording is unavailable in this browser.');
      return;
    }
    try {
      const streamObj = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(streamObj);
      audioChunksRef.current = [];
      setRecordingElapsedSec(0);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        streamObj.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start live browser SpeechRecognition alongside MediaRecorder when supported
      type SpeechRecCtor = new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
        onerror: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      const win = window as unknown as {
        SpeechRecognition?: SpeechRecCtor;
        webkitSpeechRecognition?: SpeechRecCtor;
      };
      const SpeechCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechCtor) {
        setSttSupported(true);
        const rec = new SpeechCtor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-GB';
        rec.onresult = (ev) => {
          const combined: string[] = [];
          for (let i = 0; i < ev.results.length; i += 1) {
            combined.push(ev.results[i][0].transcript);
          }
          setSpokenTranscript(combined.join(' ').trim());
        };
        rec.onerror = () => {
          // Non-fatal; audio recording still continues cleanly
        };
        rec.start();
        recognitionRef.current = rec;
      } else {
        setSttSupported(false);
      }
    } catch {
      setMicError('Microphone permission denied or no mic connected.');
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore already stopped recognition
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const speakPromptAloud = (text: string, promptKey?: string) => {
    const mp3Url = promptKey ? AUDIO_MANIFEST.speaking[promptKey] : undefined;
    if (mp3Url) {
      if (!promptAudioRef.current) {
        promptAudioRef.current = new Audio(mp3Url);
      } else {
        promptAudioRef.current.pause();
        promptAudioRef.current.src = mp3Url;
      }
      promptAudioRef.current.currentTime = 0;
      void promptAudioRef.current.play().catch(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
      });
      return;
    }

    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98;
    window.speechSynthesis.speak(utter);
  };

  const toggleHighlight = (key: string) => {
    setHighlightedSentences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle Objective Submit for Reading / Listening
  const currentSetId = skill === 'reading' ? activeReading.id : activeListening.id;
  const currentQuestions =
    skill === 'reading' ? activeReading.questions : activeListening.questions;
  const isCurrentSubmitted = !!submittedSets[currentSetId];

  const handleObjectiveSubmit = () => {
    const newErrors: ErrorLogEntry[] = [];
    let correctCount = 0;

    currentQuestions.forEach((q) => {
      const userAns = answers[q.id] ?? '';
      const res = gradeObjectiveQuestion(q, userAns);
      if (res.isCorrect) {
        correctCount += 1;
      } else {
        const isReading = skill === 'reading';
        const qTyped = q as typeof activeReading.questions[number] &
          typeof activeListening.questions[number];

        let autoCategory: ErrorLogEntry['category'] = 'lexical-paraphrase';
        if (res.exceededLimit) autoCategory = 'word-limit-spelling';
        else if (
          q.type === 'true-false-not-given' ||
          q.type === 'yes-no-not-given'
        ) {
          autoCategory = 'logic-tfng';
        } else if (skill === 'listening') {
          autoCategory = 'distractor-trap';
        }

        newErrors.push({
          id: `${currentSetId}-${q.id}-${Date.now()}`,
          skill: isReading ? 'reading' : 'listening',
          setId: currentSetId,
          setTitle: isReading ? activeReading.title : activeListening.title,
          questionId: q.id,
          questionTypeLabel: q.typeLabel,
          prompt: q.prompt,
          userAnswer: userAns || '(Blank)',
          correctAnswer: Array.isArray(q.correctAnswer)
            ? q.correctAnswer.join(', ')
            : q.correctAnswer,
          quote: isReading ? qTyped.passageQuote : qTyped.audioQuote,
          explanation: q.explanation,
          category: autoCategory,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }
    });

    const bandEst = estimateBandFromSet(
      correctCount,
      currentQuestions.length,
      skill === 'reading' ? 'reading' : 'listening',
      stream
    );

    setSubmittedSets((prev) => ({ ...prev, [currentSetId]: true }));
    setTimerRunning(false);
    stopAudio();

    onRecordCompletion(
      {
        id: `${currentSetId}-${Date.now()}`,
        skill,
        setId: currentSetId,
        title: skill === 'reading' ? activeReading.title : activeListening.title,
        correctCount,
        totalCount: currentQuestions.length,
        bandEstimate: bandEst,
        minutesSpent: Math.max(
          1,
          Math.round(
            ((skill === 'reading'
              ? activeReading.recommendedMinutes
              : activeListening.recommendedMinutes) *
              60 -
              secondsLeft) /
              60
          )
        ),
        completedAt: new Date().toISOString(),
      },
      newErrors
    );
  };

  const resetObjectiveSet = () => {
    const cleared = { ...answers };
    currentQuestions.forEach((q) => {
      delete cleared[q.id];
    });
    setAnswers(cleared);
    setSubmittedSets((prev) => ({ ...prev, [currentSetId]: false }));
    setSecondsLeft(
      (skill === 'reading'
        ? activeReading.recommendedMinutes
        : activeListening.recommendedMinutes) * 60
    );
    setTimerRunning(false);
  };

  // ==================== FULL 1:1 EXAM HELPERS ====================
  const fullReadPart =
    fullReadingExam.parts.find((p) => p.partNumber === fullReadPartNum) ?? fullReadingExam.parts[0];
  const fullListPart =
    fullListeningExam.parts.find((p) => p.partNumber === fullListPartNum) ?? fullListeningExam.parts[0];
  const fullWriteTask = fullWriteTaskNum === 1 ? fullWritingExam.task1 : fullWritingExam.task2;
  const fullListManifest = AUDIO_MANIFEST.listening[fullListPart.partSet.id];

  const fullListPendingAutoPlayRef = useRef<boolean>(false);

  const playFullListeningPartAudio = (partNum: number) => {
    const targetPart = fullListeningExam.parts.find((p) => p.partNumber === partNum);
    const manifest = targetPart ? AUDIO_MANIFEST.listening[targetPart.partSet.id] : undefined;
    const el = fullListAudioRef.current;
    if (!el || !manifest?.url) return;

    if (!unlockFullListeningAudio && fullListPlayedParts[partNum]) return;
    if (fullListPlayingPart === partNum) {
      if (!unlockFullListeningAudio) return;
      el.pause();
      setFullListPlayingPart(null);
      return;
    }

    if (!el.src.endsWith(manifest.url)) {
      el.src = manifest.url;
    }
    el.playbackRate = fullListPlaybackRate;
    setFullListPlayedParts((prev) => ({ ...prev, [partNum]: true }));
    if (!timerRunning) setTimerRunning(true);
    void el.play().then(
      () => setFullListPlayingPart(partNum),
      () => setFullListShowScript(true)
    );
  };

  useEffect(() => {
    if (!fullListPreReadActive && fullListPreReadLeft === 0 && fullListPendingAutoPlayRef.current) {
      fullListPendingAutoPlayRef.current = false;
      playFullListeningPartAudio(fullListPartNum);
    }
  }, [fullListPreReadActive, fullListPreReadLeft, fullListPartNum]);

  const startFullListeningPreRead = () => {
    fullListPendingAutoPlayRef.current = true;
    setFullListPreReadLeft(fullListPart.preReadSeconds);
    setFullListPreReadActive(true);
    if (!timerRunning) setTimerRunning(true);
  };

  const fullReadNavParts: ExamNavPart[] = useMemo(
    () =>
      fullReadingExam.parts.map((p) => ({
        partNumber: p.partNumber,
        label: `Part ${p.partNumber} (${p.questionRange[0]}–${p.questionRange[1]})`,
        questionNumbers: p.passage.questions.map((q) => q.questionNumber),
      })),
    [fullReadingExam]
  );

  const fullListNavParts: ExamNavPart[] = useMemo(
    () =>
      fullListeningExam.parts.map((p) => ({
        partNumber: p.partNumber,
        label: `Part ${p.partNumber} (${p.questionRange[0]}–${p.questionRange[1]})`,
        questionNumbers: p.partSet.questions.map((q) => q.questionNumber),
      })),
    [fullListeningExam]
  );

  const fullReadQuestionIdByNum = useMemo(() => {
    const map: Record<number, string> = {};
    fullReadingExam.parts.forEach((p) => {
      p.passage.questions.forEach((q) => {
        map[q.questionNumber] = q.id;
      });
    });
    return map;
  }, [fullReadingExam]);

  const fullListQuestionIdByNum = useMemo(() => {
    const map: Record<number, string> = {};
    fullListeningExam.parts.forEach((p) => {
      p.partSet.questions.forEach((q) => {
        map[q.questionNumber] = q.id;
      });
    });
    return map;
  }, [fullListeningExam]);

  const jumpToFullQuestion = (qNum: number) => {
    if (skill === 'reading') {
      const targetPart = fullReadingExam.parts.find(
        (p) => qNum >= p.questionRange[0] && qNum <= p.questionRange[1]
      );
      if (targetPart) setFullReadPartNum(targetPart.partNumber);
    } else if (skill === 'listening') {
      const targetPart = fullListeningExam.parts.find(
        (p) => qNum >= p.questionRange[0] && qNum <= p.questionRange[1]
      );
      if (targetPart && targetPart.partNumber !== fullListPartNum) {
        fullListAudioRef.current?.pause();
        setFullListPlayingPart(null);
        setFullListPartNum(targetPart.partNumber);
      }
    }
    setFullActiveQNum(qNum);
    window.setTimeout(() => {
      const inputEl = document.getElementById(`exam-q-${qNum}`);
      const cardEl = document.getElementById(`exam-card-${qNum}`);
      const el = inputEl ?? cardEl;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (inputEl instanceof HTMLInputElement) inputEl.focus();
      }
    }, 50);
  };

  const buildErrorEntriesFromSummary = (
    targetSkill: 'reading' | 'listening',
    examId: string,
    examTitle: string,
    allQuestions: (ReadingQuestion | ListeningQuestion)[],
    summary: FullExamGradeSummary
  ): ErrorLogEntry[] => {
    const errors: ErrorLogEntry[] = [];
    allQuestions.forEach((q) => {
      const res = summary.resultsByQNum[q.questionNumber];
      if (!res || res.isCorrect) return;
      const userAns = answers[q.id] ?? '';
      let autoCategory: ErrorLogEntry['category'] = 'lexical-paraphrase';
      if (res.exceededLimit) autoCategory = 'word-limit-spelling';
      else if (q.type === 'true-false-not-given' || q.type === 'yes-no-not-given') {
        autoCategory = 'logic-tfng';
      } else if (targetSkill === 'listening') {
        autoCategory = 'distractor-trap';
      }

      const quote =
        'passageQuote' in q ? q.passageQuote : q.audioQuote;
      errors.push({
        id: `${examId}-${q.id}-${Date.now()}`,
        skill: targetSkill,
        setId: examId,
        setTitle: examTitle,
        questionId: q.id,
        questionTypeLabel: q.typeLabel,
        prompt: q.prompt,
        userAnswer: userAns || '(Blank)',
        correctAnswer: Array.isArray(q.correctAnswer)
          ? q.correctAnswer.join(', ')
          : q.correctAnswer,
        quote,
        explanation: q.explanation,
        category: autoCategory,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    });
    return errors;
  };

  const handleSubmitFullReading = () => {
    const summary = gradeFullExamSection(
      fullReadingExam.parts.map((p) => ({
        partNumber: p.partNumber,
        questions: p.passage.questions,
      })),
      answers,
      'reading',
      stream
    );
    const allQs = fullReadingExam.parts.flatMap((p) => p.passage.questions);
    const newErrors = buildErrorEntriesFromSummary(
      'reading',
      fullReadingExam.id,
      fullReadingExam.title,
      allQs,
      summary
    );
    setFullExamSummaries((prev) => ({ ...prev, [fullReadingExam.id]: summary }));
    setTimerRunning(false);
    onRecordCompletion(
      {
        id: `${fullReadingExam.id}-${Date.now()}`,
        skill: 'reading',
        setId: fullReadingExam.id,
        title: fullReadingExam.title,
        correctCount: summary.rawCorrect,
        totalCount: 40,
        bandEstimate: summary.bandScore,
        minutesSpent: Math.max(5, Math.round((60 * 60 - secondsLeft) / 60)),
        completedAt: new Date().toISOString(),
      },
      newErrors
    );
  };

  const handleSubmitFullListening = () => {
    const summary = gradeFullExamSection(
      fullListeningExam.parts.map((p) => ({
        partNumber: p.partNumber,
        questions: p.partSet.questions,
      })),
      answers,
      'listening',
      stream
    );
    const allQs = fullListeningExam.parts.flatMap((p) => p.partSet.questions);
    const newErrors = buildErrorEntriesFromSummary(
      'listening',
      fullListeningExam.id,
      fullListeningExam.title,
      allQs,
      summary
    );
    setFullExamSummaries((prev) => ({ ...prev, [fullListeningExam.id]: summary }));
    setTimerRunning(false);
    setFullListPreReadActive(false);
    setFullListReviewActive(false);
    fullListPendingAutoPlayRef.current = false;
    fullListAudioRef.current?.pause();
    setFullListPlayingPart(null);
    onRecordCompletion(
      {
        id: `${fullListeningExam.id}-${Date.now()}`,
        skill: 'listening',
        setId: fullListeningExam.id,
        title: fullListeningExam.title,
        correctCount: summary.rawCorrect,
        totalCount: 40,
        bandEstimate: summary.bandScore,
        minutesSpent: Math.max(5, Math.round((32 * 60 - secondsLeft) / 60)),
        completedAt: new Date().toISOString(),
      },
      newErrors
    );
  };

  const handleResetFullReading = () => {
    const cleared = { ...answers };
    fullReadingExam.parts.forEach((p) =>
      p.passage.questions.forEach((q) => {
        delete cleared[q.id];
      })
    );
    setAnswers(cleared);
    setFullExamSummaries((prev) => ({ ...prev, [fullReadingExam.id]: null }));
    setFullReadPartNum(1);
    setFullActiveQNum(1);
    setSecondsLeft(60 * 60);
    setTimerRunning(false);
    setTimeExpiredNotice(null);
  };

  const handleResetFullListening = () => {
    const cleared = { ...answers };
    fullListeningExam.parts.forEach((p) =>
      p.partSet.questions.forEach((q) => {
        delete cleared[q.id];
      })
    );
    setAnswers(cleared);
    setFullExamSummaries((prev) => ({ ...prev, [fullListeningExam.id]: null }));
    setFullListPlayedParts({});
    setFullListPartNum(1);
    setFullActiveQNum(1);
    setFullListPreReadActive(false);
    setFullListPreReadLeft(0);
    setFullListReviewActive(false);
    setFullListReviewLeft(120);
    setSecondsLeft(32 * 60);
    setTimerRunning(false);
    setTimeExpiredNotice(null);
    fullListAudioRef.current?.pause();
    setFullListPlayingPart(null);
  };

  useEffect(() => {
    if (!timerRunning || secondsLeft > 0 || simMode !== 'full-exam') return;
    setTimerRunning(false);
    if (skill === 'reading' && !fullExamSummaries[fullReadingExam.id]) {
      handleSubmitFullReading();
      setTimeExpiredNotice('60:00 Reading exam timer finished — all 40 answers automatically graded.');
    } else if (skill === 'listening' && !fullExamSummaries[fullListeningExam.id]) {
      handleSubmitFullListening();
      setTimeExpiredNotice('32:00 Listening exam timer finished — all 40 answers automatically graded.');
    } else if (skill === 'writing') {
      setTimeExpiredNotice('60:00 Writing exam timer finished — Task 1 & Task 2 drafts saved automatically.');
    }
  }, [timerRunning, secondsLeft, simMode, skill]);

  const fullReadingSummary = fullExamSummaries[fullReadingExam.id] ?? null;
  const fullListeningSummary = fullExamSummaries[fullListeningExam.id] ?? null;
  const fullWriteT1Words = countIeltsWords(profile.writingDrafts[fullWritingExam.task1.id] ?? '');
  const fullWriteT2Words = countIeltsWords(profile.writingDrafts[fullWritingExam.task2.id] ?? '');

  const themeClass =
    contrastTheme === 'yellow'
      ? 'exam-theme-yellow'
      : contrastTheme === 'dark'
        ? 'exam-theme-dark'
        : 'exam-theme-standard';

  const textSizeClass =
    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className={`space-y-4 ${themeClass}`}>
      {/* Mode Switcher Bar: Full 1:1 Exam vs Quick & Daily Drills */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-200/80 bg-[#FFF8F4] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-orange-200 bg-white p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSimMode('full-exam')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                simMode === 'full-exam'
                  ? 'bg-[#FF6B2C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Full 1:1 IELTS Test (40Q • 60m)</span>
            </button>
            <button
              type="button"
              onClick={() => setSimMode('quick-drill')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                simMode === 'quick-drill'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Quick & Daily Drills</span>
            </button>
          </div>
          <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600">
            Candidate: {profile.candidateName} ({stream === 'academic' ? 'AC' : 'GT'})
          </span>
        </div>

        <p className="text-[11px] font-semibold text-slate-500">
          {simMode === 'full-exam'
            ? 'Computer-Delivered IELTS simulation matching official timings & question layouts'
            : 'Focused daily challenges & single-passage drills'}
        </p>
      </div>

      {timeExpiredNotice && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900">
          <span>{timeExpiredNotice}</span>
          <button
            type="button"
            onClick={() => setTimeExpiredNotice(null)}
            className="rounded-md bg-white px-2 py-0.5 text-[11px] text-amber-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top IELTS-on-Computer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200/80 bg-white px-4 py-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'reading' as SkillId, label: 'Reading', icon: BookOpen },
            { id: 'listening' as SkillId, label: 'Listening', icon: Headphones },
            { id: 'writing' as SkillId, label: 'Writing', icon: PenTool },
            { id: 'speaking' as SkillId, label: 'Speaking', icon: Mic },
          ].map((item) => {
            const Icon = item.icon;
            const active = skill === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSkill(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'bg-[#FF6B2C] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Display Tools & Timer */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[11px]">
            <button
              onClick={() => setContrastTheme('standard')}
              title="Standard Light Theme"
              className={`rounded-lg p-1.5 ${
                contrastTheme === 'standard' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setContrastTheme('yellow')}
              title="High Contrast Black-on-Yellow"
              className={`rounded-lg p-1.5 ${
                contrastTheme === 'yellow' ? 'bg-yellow-300 text-slate-950 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <Contrast className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setContrastTheme('dark')}
              title="High Contrast Dark"
              className={`rounded-lg p-1.5 ${
                contrastTheme === 'dark' ? 'bg-slate-900 text-orange-400 shadow-2xs' : 'text-slate-500'
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold">
            {(['sm', 'base', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`rounded-lg px-2 py-1 uppercase ${
                  fontSize === sz ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {sz === 'sm' ? 'A-' : sz === 'base' ? 'A' : 'A+'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNotePad((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold ${
              showNotePad
                ? 'border-orange-300 bg-orange-50 text-orange-700'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <Highlighter className="h-3.5 w-3.5" />
            <span>Notes</span>
          </button>

          {onGenerateBonusDaily && (
            <button
              onClick={() => {
                jumpToDailyOnRefreshRef.current = true;
                onGenerateBonusDaily();
              }}
              disabled={dailyLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-[#FFF8F4] px-2.5 py-1.5 text-xs font-bold text-[#EA580C] hover:bg-[#FF6B2C] hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${dailyLoading ? 'animate-spin' : ''}`} />
              <span>{dailyLoading ? 'Refreshing...' : 'New Daily Set'}</span>
            </button>
          )}

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs font-extrabold ${
              secondsLeft < 180
                ? 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-slate-200 bg-slate-900 text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span>{formatTimer(secondsLeft)}</span>
            <button
              onClick={() => setTimerRunning((r) => !r)}
              className="rounded bg-white/15 px-1.5 py-0.5 font-sans text-[10px] hover:bg-white/25"
            >
              {timerRunning ? 'Pause' : 'Start'}
            </button>
          </div>
        </div>
      </div>

      {/* Optional Exam Scratchpad */}
      {showNotePad && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
            Computer-Delivered Candidate Scratchpad (Keywords & Paraphrase Notes)
          </p>
          <textarea
            value={examNote}
            onChange={(e) => setExamNote(e.target.value)}
            rows={2}
            placeholder="Jot down keywords, paragraph summaries, or distractor warnings..."
            className="w-full rounded-xl border border-amber-200 bg-white p-2.5 text-xs text-slate-800 focus:border-orange-400 focus:outline-none"
          />
        </div>
      )}

      {/* ==================== READING SIMULATOR ==================== */}
      {skill === 'reading' && simMode === 'full-exam' && (
        <div className="space-y-4">
          {/* Post-Submission Full 40Q Band Score Report */}
          {fullReadingSummary && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    Official 40-Question Reading Result ({stream === 'academic' ? 'Academic' : 'General Training'})
                  </p>
                  <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">
                    Raw Score: {fullReadingSummary.rawCorrect} / 40 → Band {fullReadingSummary.bandScore.toFixed(1)}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fullReadingSummary.partSummaries.map((ps) => (
                    <div
                      key={ps.partNumber}
                      className="rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                    >
                      Part {ps.partNumber}: <span className="text-[#FF6B2C]">{ps.correct}/{ps.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Split-Screen IELTS on Computer Layout */}
          <div
            className="grid gap-4 rounded-2xl border p-4 lg:grid-cols-2"
            style={{
              backgroundColor: 'var(--exam-bg)',
              color: 'var(--exam-text)',
              borderColor: 'var(--exam-border)',
            }}
          >
            {/* Left Pane: Active Passage (Part 1, 2, or 3) */}
            <div className="max-h-[560px] space-y-4 overflow-y-auto pr-2">
              <div className="border-b pb-3" style={{ borderColor: 'var(--exam-border)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-bold text-[#FF6B2C]">
                    {fullReadPart.passage.sectionLabel} • {fullReadPart.passage.topicTag}
                  </span>
                  <span className="text-[11px] opacity-75">
                    Click any sentence to highlight yellow
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold">{fullReadPart.passage.title}</h3>
              </div>

              {fullReadPart.passage.paragraphs.map((para) => {
                const sentences = para.text.split(/(?<=[.!?])\s+/);
                return (
                  <div key={para.label} className={`leading-relaxed ${textSizeClass}`}>
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/15 text-xs font-extrabold text-[#FF6B2C]">
                      {para.label}
                    </span>
                    {sentences.map((sent, sIdx) => {
                      const hKey = `${fullReadPart.passage.id}-${para.label}-${sIdx}`;
                      const isLit = !!highlightedSentences[hKey];
                      return (
                        <span
                          key={hKey}
                          onClick={() => toggleHighlight(hKey)}
                          className={`cursor-pointer rounded transition ${
                            isLit ? 'bg-yellow-300/75 text-slate-950' : 'hover:bg-orange-200/25'
                          }`}
                        >
                          {sent}{' '}
                        </span>
                      );
                    })}
                  </div>
                );
              })}

              {fullReadPart.passage.glossary && (
                <div
                  className="rounded-xl border p-3 text-xs"
                  style={{
                    backgroundColor: 'var(--exam-surface)',
                    borderColor: 'var(--exam-border)',
                  }}
                >
                  <p className="font-bold">Passage Glossary</p>
                  {fullReadPart.passage.glossary.map((g) => (
                    <p key={g.term} className="mt-1">
                      <strong>{g.term}:</strong> {g.definition}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Right Pane: Grouped Questions & Inline Completion */}
            <div
              className="max-h-[560px] overflow-y-auto rounded-xl border p-3"
              style={{
                backgroundColor: 'var(--exam-surface)',
                borderColor: 'var(--exam-border)',
              }}
            >
              <QuestionGroupRenderer
                groups={fullReadPart.questionGroups}
                questions={fullReadPart.passage.questions}
                answers={answers}
                flagged={flagged}
                activeQuestionNumber={fullActiveQNum}
                submitted={Boolean(fullReadingSummary)}
                textSizeClass={textSizeClass}
                onSelectQuestion={(qNum) => setFullActiveQNum(qNum)}
                onChangeAnswer={(qId, val) => setAnswers((prev) => ({ ...prev, [qId]: val }))}
                onToggleFlag={(qId) => setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }))}
              />
            </div>
          </div>

          <ExamBottomNav
            parts={fullReadNavParts}
            activePartNumber={fullReadPartNum}
            activeQuestionNumber={fullActiveQNum}
            questionIdByNumber={fullReadQuestionIdByNum}
            answers={answers}
            flagged={flagged}
            resultsByQNum={fullReadingSummary?.resultsByQNum}
            submitted={Boolean(fullReadingSummary)}
            submitLabel="Submit Full Reading (40Q)"
            retakeLabel="Retake Full Reading"
            scoreSummaryText={
              fullReadingSummary
                ? `Score: ${fullReadingSummary.rawCorrect}/40 • Band ${fullReadingSummary.bandScore.toFixed(1)}`
                : undefined
            }
            isActiveFlagged={Boolean(
              fullReadQuestionIdByNum[fullActiveQNum] &&
                flagged[fullReadQuestionIdByNum[fullActiveQNum]]
            )}
            onSelectPart={(pn) => {
              const typedPn = pn as 1 | 2 | 3;
              setFullReadPartNum(typedPn);
              const firstQ = fullReadingExam.parts[typedPn - 1]?.questionRange[0] ?? 1;
              setFullActiveQNum(firstQ);
            }}
            onSelectQuestion={jumpToFullQuestion}
            onToggleActiveFlag={() => {
              const qId = fullReadQuestionIdByNum[fullActiveQNum];
              if (qId) setFlagged((p) => ({ ...p, [qId]: !p[qId] }));
            }}
            onSubmit={handleSubmitFullReading}
            onRetake={handleResetFullReading}
          />
        </div>
      )}

      {skill === 'reading' && simMode === 'quick-drill' && (
        <div className="space-y-4">
          {/* Set Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {allReadingSets.map((r) => (
              <button
                key={r.id}
                onClick={() => setReadingId(r.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  r.id === activeReading.id
                    ? 'border-[#FF6B2C] bg-[#FFF1EB] text-[#EA580C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                {r.isDaily ? '★ DAILY • ' : `${r.stream === 'academic' ? 'AC' : 'GT'} • `}
                {r.title}
              </button>
            ))}
          </div>

          {/* Split-Screen IELTS on Computer Layout */}
          <div
            className="grid gap-4 rounded-2xl border p-4 lg:grid-cols-2"
            style={{
              backgroundColor: 'var(--exam-bg)',
              color: 'var(--exam-text)',
              borderColor: 'var(--exam-border)',
            }}
          >
            {/* Left Pane: Passage + Click-to-Highlight */}
            <div className="max-h-[560px] space-y-4 overflow-y-auto pr-2">
              <div className="border-b pb-3" style={{ borderColor: 'var(--exam-border)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-bold text-[#FF6B2C]">
                    {activeReading.sectionLabel} • {activeReading.topicTag}
                  </span>
                  <span className="text-[11px] opacity-75">
                    Click any sentence to highlight yellow
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold">{activeReading.title}</h3>
              </div>

              {activeReading.paragraphs.map((para) => {
                const sentences = para.text.split(/(?<=[.!?])\s+/);
                return (
                  <div key={para.label} className={`leading-relaxed ${textSizeClass}`}>
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/15 text-xs font-extrabold text-[#FF6B2C]">
                      {para.label}
                    </span>
                    {sentences.map((sent, sIdx) => {
                      const hKey = `${activeReading.id}-${para.label}-${sIdx}`;
                      const isLit = !!highlightedSentences[hKey];
                      return (
                        <span
                          key={hKey}
                          onClick={() => toggleHighlight(hKey)}
                          className={`cursor-pointer rounded transition ${
                            isLit ? 'bg-yellow-300/75 text-slate-950' : 'hover:bg-orange-200/25'
                          }`}
                        >
                          {sent}{' '}
                        </span>
                      );
                    })}
                  </div>
                );
              })}

              {activeReading.glossary && (
                <div
                  className="rounded-xl border p-3 text-xs"
                  style={{
                    backgroundColor: 'var(--exam-surface)',
                    borderColor: 'var(--exam-border)',
                  }}
                >
                  <p className="font-bold">Passage Glossary</p>
                  {activeReading.glossary.map((g) => (
                    <p key={g.term} className="mt-1">
                      <strong>{g.term}:</strong> {g.definition}
                    </p>
                  ))}
                </div>
              )}

              {activeReading.diagramSpec && <FurnaceDiagramSvg spec={activeReading.diagramSpec} />}
            </div>

            {/* Right Pane: Interactive Questions */}
            <div
              className="flex max-h-[560px] flex-col justify-between overflow-y-auto rounded-xl border p-4"
              style={{
                backgroundColor: 'var(--exam-surface)',
                borderColor: 'var(--exam-border)',
              }}
            >
              <div className="space-y-4">
                {activeReading.questions.map((q, idx) => {
                  const userVal = answers[q.id] ?? '';
                  const res = isCurrentSubmitted ? gradeObjectiveQuestion(q, userVal) : null;
                  const wordsTyped = countIeltsWords(userVal);
                  const overLimit = q.maxWords !== undefined && wordsTyped > q.maxWords;

                  return (
                    <div
                      key={q.id}
                      onClick={() => setActiveQuestionIdx(idx)}
                      className={`rounded-xl border p-3.5 transition ${
                        activeQuestionIdx === idx ? 'ring-2 ring-[#FF6B2C]/60' : ''
                      }`}
                      style={{
                        backgroundColor: 'var(--exam-bg)',
                        borderColor: 'var(--exam-border)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-[#FF6B2C]">
                          Q{q.questionNumber} • {q.typeLabel}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlagged((p) => ({ ...p, [q.id]: !p[q.id] }));
                          }}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            flagged[q.id]
                              ? 'bg-amber-400/25 text-amber-600'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Flag className="h-3 w-3" />
                          <span>{flagged[q.id] ? 'Flagged' : 'Flag'}</span>
                        </button>
                      </div>

                      {q.instructionNote && (
                        <p className="mt-1 text-[11px] font-semibold opacity-75">
                          {q.instructionNote}
                        </p>
                      )}
                      <p className={`mt-1.5 font-medium ${textSizeClass}`}>{q.prompt}</p>

                      {q.options ? (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {q.options.map((opt) => {
                            // Extract option key if option starts with "A. " or "ii. "
                            const optValue =
                              q.type === 'true-false-not-given' ||
                              q.type === 'yes-no-not-given' ||
                              q.type === 'matching-information'
                                ? opt
                                : opt.split('.')[0].trim();
                            const selected = userVal === optValue;
                            return (
                              <button
                                key={opt}
                                disabled={isCurrentSubmitted}
                                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optValue }))}
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
                      ) : (
                        <div className="mt-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              disabled={isCurrentSubmitted}
                              value={userVal}
                              onChange={(e) =>
                                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              placeholder="Type exact word(s) from passage..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#FF6B2C] focus:outline-none"
                            />
                            {q.maxWords && (
                              <span
                                className={`shrink-0 rounded-md px-2 py-1 font-mono text-[10px] font-bold ${
                                  overLimit
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {wordsTyped}/{q.maxWords}w
                              </span>
                            )}
                          </div>
                          {overLimit && (
                            <p className="mt-1 text-[11px] font-bold text-rose-600">
                              Warning: Exceeds strict {q.maxWords}-word limit (scores 0 marks)!
                            </p>
                          )}
                        </div>
                      )}

                      {res && (
                        <div
                          className={`mt-3 rounded-lg p-2.5 text-xs ${
                            res.isCorrect
                              ? 'bg-emerald-500/15 text-emerald-700'
                              : 'bg-rose-500/15 text-rose-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            {res.isCorrect ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span>{res.reason}</span>
                          </div>
                          <p className="mt-1 text-slate-700">
                            <strong>Evidence ({q.paragraphRef}):</strong> "{q.passageQuote}" —{' '}
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Question Palette & Submit Bar */}
              <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--exam-border)' }}>
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  {activeReading.questions.map((q, idx) => {
                    const answered = !!(answers[q.id] ?? '').trim();
                    const isFlag = !!flagged[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`relative flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition ${
                          activeQuestionIdx === idx
                            ? 'ring-2 ring-slate-900'
                            : ''
                        } ${
                          answered
                            ? 'bg-[#FF6B2C] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {q.questionNumber}
                        {isFlag && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {isCurrentSubmitted ? (
                    <>
                      <span className="text-xs font-extrabold text-emerald-600">
                        Score:{' '}
                        {
                          activeReading.questions.filter(
                            (q) => gradeObjectiveQuestion(q, answers[q.id]).isCorrect
                          ).length
                        }
                        /{activeReading.questions.length} • Est. Band{' '}
                        {estimateBandFromSet(
                          activeReading.questions.filter(
                            (q) => gradeObjectiveQuestion(q, answers[q.id]).isCorrect
                          ).length,
                          activeReading.questions.length,
                          'reading',
                          stream
                        ).toFixed(1)}
                      </span>
                      <button
                        onClick={resetObjectiveSet}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Retake Passage</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleObjectiveSubmit}
                      className="ml-auto rounded-xl bg-[#FF6B2C] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#EA580C]"
                    >
                      Submit & Grade Answers
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reading AI Paraphrase & Lexis Unpacker */}
          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  AI Paraphrase & Academic Vocabulary Unpacker
                </p>
                <p className="text-[11px] text-slate-500">
                  Analyze passage vocabulary, discourse markers, and common IELTS paraphrase traps.
                </p>
              </div>
              <button
                onClick={() =>
                  requestAiCoach(
                    'reading',
                    activeReading.title,
                    activeReading.paragraphs.map((p) => `[${p.label}] ${p.text}`).join('\n\n'),
                    ''
                  )
                }
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-[#FF6B2C] disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{aiLoading ? 'Analyzing Passage...' : 'AI Paraphrase & Lexis Unpacker'}</span>
              </button>
            </div>

            {aiError && <p className="mt-2 text-xs font-semibold text-rose-600">{aiError}</p>}
            {aiFeedback && (
              <div className="mt-3 rounded-xl border border-orange-200 bg-[#FAF8F6] p-4 text-xs">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-extrabold text-[#FF6B2C]">Reading Study Breakdown</span>
                  <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                    {aiSource}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-800">
                  {aiFeedback}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== LISTENING SIMULATOR ==================== */}
      {skill === 'listening' && simMode === 'full-exam' && (
        <div className="space-y-4">
          {fullListeningSummary && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    Official 40-Question Listening Result
                  </p>
                  <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">
                    Raw Score: {fullListeningSummary.rawCorrect} / 40 → Band{' '}
                    {fullListeningSummary.bandScore.toFixed(1)}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fullListeningSummary.partSummaries.map((ps) => (
                    <div
                      key={ps.partNumber}
                      className="rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                    >
                      Part {ps.partNumber}:{' '}
                      <span className="text-[#FF6B2C]">
                        {ps.correct}/{ps.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audio Player Exam Control Bar */}
          <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-sm">
            <audio
              key={fullListManifest?.url}
              ref={fullListAudioRef}
              src={fullListManifest?.url}
              preload="metadata"
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                if (Number.isFinite(dur) && dur > 0) setFullListAudioDur(dur);
              }}
              onTimeUpdate={(e) => {
                const t = e.currentTarget.currentTime;
                setFullListAudioSec(t);
                const seg = fullListManifest?.segments.find(
                  (s) => t >= s.startSec && t <= s.endSec + 0.15
                );
                setFullListLineIdx(seg ? seg.lineIndex : -1);
              }}
              onEnded={() => {
                setFullListPlayingPart(null);
                setFullListLineIdx(-1);
                if (!fullListeningSummary) {
                  if (fullListPartNum < 4) {
                    const nextNum = (fullListPartNum + 1) as 2 | 3 | 4;
                    const nextPart = fullListeningExam.parts[nextNum - 1];
                    setFullListPartNum(nextNum);
                    setFullActiveQNum(nextPart.questionRange[0]);
                    if (!unlockFullListeningAudio) {
                      fullListPendingAutoPlayRef.current = true;
                      setFullListPreReadLeft(nextPart.preReadSeconds);
                      setFullListPreReadActive(true);
                    }
                  } else {
                    setFullListReviewLeft(fullListeningExam.reviewSeconds);
                    setFullListReviewActive(true);
                  }
                }
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FF6B2C]/25 px-2.5 py-0.5 text-[11px] font-extrabold text-orange-300">
                    Part {fullListPart.partNumber} (Questions {fullListPart.questionRange[0]}–
                    {fullListPart.questionRange[1]})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300">
                    {fullListPart.partSet.contextType} • {fullListPart.partSet.accentLabel}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-extrabold">{fullListPart.partSet.title}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {fullListPreReadActive && (
                  <span className="rounded-lg bg-amber-400/20 px-3 py-1.5 font-mono text-xs font-extrabold text-amber-300">
                    Look-Ahead: 00:{String(fullListPreReadLeft).padStart(2, '0')}
                  </span>
                )}
                {fullListReviewActive && (
                  <span className="rounded-lg bg-emerald-400/20 px-3 py-1.5 font-mono text-xs font-extrabold text-emerald-300">
                    2-Min Check: {formatTimer(fullListReviewLeft)}
                  </span>
                )}

                {!unlockFullListeningAudio &&
                  !fullListPreReadActive &&
                  fullListPlayingPart !== fullListPartNum &&
                  !fullListPlayedParts[fullListPartNum] && (
                    <button
                      type="button"
                      onClick={startFullListeningPreRead}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                    >
                      <Clock className="h-3.5 w-3.5 text-orange-400" />
                      <span>Start {fullListPart.preReadSeconds}s Pre-Read & Auto-Play</span>
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => playFullListeningPartAudio(fullListPartNum)}
                  disabled={
                    !unlockFullListeningAudio &&
                    (fullListPlayingPart === fullListPartNum || !!fullListPlayedParts[fullListPartNum])
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#EA580C] disabled:opacity-45"
                >
                  {fullListPlayingPart === fullListPartNum ? (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>
                        {unlockFullListeningAudio ? 'Pause Audio' : `Playing Part ${fullListPartNum} (Locked)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>
                        {!unlockFullListeningAudio && fullListPlayedParts[fullListPartNum]
                          ? `Part ${fullListPartNum} Played Once`
                          : `Play Part ${fullListPartNum} Audio`}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setUnlockFullListeningAudio((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    unlockFullListeningAudio
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {unlockFullListeningAudio ? (
                    <Unlock className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {unlockFullListeningAudio ? 'Audio Unlocked (Self-Study)' : 'Self-Study Unlock Audio'}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="font-mono text-[11px] font-semibold text-slate-300">
                {formatTimer(Math.floor(fullListAudioSec))}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(1, fullListAudioDur || fullListManifest?.durationSec || 120)}
                step={0.1}
                value={fullListAudioSec}
                disabled={!unlockFullListeningAudio}
                onChange={(e) => {
                  const t = parseFloat(e.target.value);
                  if (fullListAudioRef.current) fullListAudioRef.current.currentTime = t;
                  setFullListAudioSec(t);
                }}
                aria-label="Full exam listening scrubber"
                className="h-1.5 flex-1 cursor-pointer accent-[#FF6B2C] disabled:cursor-not-allowed"
              />
              <span className="font-mono text-[11px] font-semibold text-slate-300">
                {formatTimer(Math.round(fullListAudioDur || fullListManifest?.durationSec || 0))}
              </span>

              <select
                value={fullListPlaybackRate}
                onChange={(e) => setFullListPlaybackRate(parseFloat(e.target.value))}
                disabled={!unlockFullListeningAudio}
                className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-white focus:outline-none disabled:opacity-45"
              >
                <option value={0.9} className="text-slate-900">
                  0.9x
                </option>
                <option value={1.0} className="text-slate-900">
                  1.0x
                </option>
                <option value={1.15} className="text-slate-900">
                  1.15x
                </option>
              </select>

              <button
                type="button"
                onClick={() => setFullListShowScript((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-300 hover:text-orange-200"
              >
                {fullListShowScript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{fullListShowScript ? 'Hide Script' : 'Show Script'}</span>
              </button>
            </div>
          </div>

          <div
            className={`grid gap-4 rounded-2xl border p-4 ${
              fullListPart.partSet.mapSpec || fullListShowScript ? 'lg:grid-cols-2' : ''
            }`}
            style={{
              backgroundColor: 'var(--exam-bg)',
              color: 'var(--exam-text)',
              borderColor: 'var(--exam-border)',
            }}
          >
            {(fullListPart.partSet.mapSpec || fullListShowScript) && (
              <div className="space-y-4">
                {fullListPart.partSet.mapSpec && <TownMapSvg spec={fullListPart.partSet.mapSpec} />}
                {fullListShowScript && (
                  <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800">
                    {fullListPart.partSet.dialogue.map((line, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-2 ${
                          fullListLineIdx === i ? 'bg-orange-100 text-slate-950' : ''
                        }`}
                      >
                        <strong className="text-[#EA580C]">{line.speaker}: </strong>
                        <span>{line.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <QuestionGroupRenderer
                groups={fullListPart.questionGroups}
                questions={fullListPart.partSet.questions}
                answers={answers}
                flagged={flagged}
                activeQuestionNumber={fullActiveQNum}
                submitted={Boolean(fullListeningSummary)}
                textSizeClass={textSizeClass}
                onSelectQuestion={(qNum) => setFullActiveQNum(qNum)}
                onChangeAnswer={(qId, val) => setAnswers((prev) => ({ ...prev, [qId]: val }))}
                onToggleFlag={(qId) => setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }))}
              />
            </div>
          </div>

          <ExamBottomNav
            parts={fullListNavParts}
            activePartNumber={fullListPartNum}
            activeQuestionNumber={fullActiveQNum}
            questionIdByNumber={fullListQuestionIdByNum}
            answers={answers}
            flagged={flagged}
            resultsByQNum={fullListeningSummary?.resultsByQNum}
            submitted={Boolean(fullListeningSummary)}
            submitLabel="Submit Full Listening (40Q)"
            retakeLabel="Retake Full Listening"
            scoreSummaryText={
              fullListeningSummary
                ? `Score: ${fullListeningSummary.rawCorrect}/40 • Band ${fullListeningSummary.bandScore.toFixed(1)}`
                : undefined
            }
            isActiveFlagged={Boolean(
              fullListQuestionIdByNum[fullActiveQNum] &&
                flagged[fullListQuestionIdByNum[fullActiveQNum]]
            )}
            onSelectPart={(pn) => {
              const typedPn = pn as 1 | 2 | 3 | 4;
              fullListAudioRef.current?.pause();
              setFullListPlayingPart(null);
              setFullListPartNum(typedPn);
              const firstQ = fullListeningExam.parts[typedPn - 1]?.questionRange[0] ?? 1;
              setFullActiveQNum(firstQ);
            }}
            onSelectQuestion={jumpToFullQuestion}
            onToggleActiveFlag={() => {
              const qId = fullListQuestionIdByNum[fullActiveQNum];
              if (qId) setFlagged((p) => ({ ...p, [qId]: !p[qId] }));
            }}
            onSubmit={handleSubmitFullListening}
            onRetake={handleResetFullListening}
          />
        </div>
      )}

      {skill === 'listening' && simMode === 'quick-drill' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {allListeningSets.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  stopAudio();
                  setListeningId(l.id);
                }}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  l.id === activeListening.id
                    ? 'border-[#FF6B2C] bg-[#FFF1EB] text-[#EA580C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                {l.isDaily ? '★ DAILY • ' : `Part ${l.partNumber} • `}
                {l.title}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left Audio Deck + Map Visual + Transcript */}
            <div className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    {activeListening.contextType} • {activeListening.accentLabel}
                  </span>
                  <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">
                    {activeListening.title}
                  </h3>
                </div>
              </div>

              {/* Neural Multi-Accent MP3 Audio Deck */}
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <audio
                  ref={listeningAudioRef}
                  src={activeListeningManifest?.url}
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const dur = e.currentTarget.duration;
                    if (Number.isFinite(dur) && dur > 0) setAudioDurationSec(dur);
                  }}
                  onTimeUpdate={(e) => {
                    const t = e.currentTarget.currentTime;
                    setAudioCurrentSec(t);
                    const seg = activeListeningManifest?.segments.find(
                      (s) => t >= s.startSec && t <= s.endSec + 0.15
                    );
                    setActiveLineIdx(seg ? seg.lineIndex : -1);
                  }}
                  onEnded={() => {
                    setAudioPlaying(false);
                    setActiveLineIdx(-1);
                  }}
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={toggleListeningPlayback}
                      disabled={
                        strictSinglePlay &&
                        (audioPlaying || !!playedOnceIds[activeListening.id])
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#EA580C] disabled:opacity-45"
                    >
                      {audioPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          <span>{strictSinglePlay ? 'Playing (Locked)' : 'Pause'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>
                            {strictSinglePlay && playedOnceIds[activeListening.id]
                              ? 'Played Once (Exam Rule)'
                              : audioCurrentSec > 0.5
                                ? 'Resume Track'
                                : 'Play IELTS Audio'}
                          </span>
                        </>
                      )}
                    </button>

                    {!strictSinglePlay && (audioPlaying || audioCurrentSec > 0) && (
                      <button
                        onClick={stopAudio}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"
                      >
                        <Square className="h-3 w-3 fill-current" />
                        <span>Reset</span>
                      </button>
                    )}

                    <select
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      disabled={strictSinglePlay}
                      className="rounded-lg bg-white/10 px-2 py-1.5 text-xs font-semibold text-white focus:outline-none disabled:opacity-45"
                    >
                      <option value={0.9} className="text-slate-900">0.9x Speed</option>
                      <option value={1.0} className="text-slate-900">1.0x Normal</option>
                      <option value={1.15} className="text-slate-900">1.15x Fast</option>
                    </select>
                  </div>

                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={strictSinglePlay}
                      onChange={(e) => setStrictSinglePlay(e.target.checked)}
                      className="accent-[#FF6B2C]"
                    />
                    <span>Strict Single-Play Exam Mode</span>
                  </label>
                </div>

                {/* Audio Scrubber & Time Display */}
                <div className="mt-3.5 flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold text-slate-300">
                    {formatTimer(Math.floor(audioCurrentSec))}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, audioDurationSec)}
                    step={0.1}
                    value={audioCurrentSec}
                    disabled={strictSinglePlay}
                    onChange={(e) => handleScrubAudio(parseFloat(e.target.value))}
                    aria-label="Listening audio timeline"
                    className="h-1.5 flex-1 cursor-pointer accent-[#FF6B2C] disabled:cursor-not-allowed"
                  />
                  <span className="font-mono text-[11px] font-semibold text-slate-300">
                    {formatTimer(Math.round(audioDurationSec))}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400">
                    Neural Voices:{' '}
                    <strong className="text-slate-200">
                      {Array.from(
                        new Set(
                          (activeListeningManifest?.segments ?? []).map((s) => s.voice)
                        )
                      ).join(' + ')}
                    </strong>
                  </span>
                  {activeLineIdx >= 0 && (
                    <span className="text-orange-300">
                      Speaking: <strong>{activeListening.dialogue[activeLineIdx]?.speaker}</strong> (Line{' '}
                      {activeLineIdx + 1}/{activeListening.dialogue.length})
                    </span>
                  )}
                </div>
              </div>

              {activeListening.mapSpec && <TownMapSvg spec={activeListening.mapSpec} />}

              <div>
                <button
                  onClick={() => setShowTranscript((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B2C] hover:underline"
                >
                  {showTranscript ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showTranscript ? 'Hide Audio Script' : 'Show Audio Script (Study Check)'}</span>
                </button>

                {showTranscript && (
                  <div className="mt-3 max-h-60 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-[#FAF8F6] p-3.5 text-xs">
                    {activeListening.dialogue.map((line, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-2 ${
                          activeLineIdx === i ? 'bg-orange-100 text-slate-950' : 'text-slate-700'
                        }`}
                      >
                        <strong className="text-[#EA580C]">{line.speaker}: </strong>
                        <span>{line.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Listening Questions */}
            <div className="flex flex-col justify-between rounded-2xl border border-orange-100 bg-white p-5">
              <div className="space-y-3.5">
                {activeListening.questions.map((q) => {
                  const userVal = answers[q.id] ?? '';
                  const res = isCurrentSubmitted ? gradeObjectiveQuestion(q, userVal) : null;
                  const wordsTyped = countIeltsWords(userVal);
                  const overLimit = q.maxWords !== undefined && wordsTyped > q.maxWords;

                  return (
                    <div key={q.id} className="rounded-xl border border-slate-200 bg-[#FAF8F6] p-3.5">
                      <span className="text-xs font-extrabold text-[#FF6B2C]">
                        Q{q.questionNumber} • {q.typeLabel}
                      </span>
                      {q.instructionNote && (
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                          {q.instructionNote}
                        </p>
                      )}
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">{q.prompt}</p>

                      {q.options ? (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {q.options.map((opt) => {
                            const val = opt.split('.')[0].trim();
                            return (
                              <button
                                key={opt}
                                disabled={isCurrentSubmitted}
                                onClick={() => setAnswers((p) => ({ ...p, [q.id]: val }))}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                                  userVal === val
                                    ? 'border-[#FF6B2C] bg-[#FF6B2C] text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mt-2.5 flex items-center gap-2">
                          <input
                            type="text"
                            disabled={isCurrentSubmitted}
                            value={userVal}
                            onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                            placeholder="Transcribe exact word/number heard..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-[#FF6B2C] focus:outline-none"
                          />
                          {q.maxWords && (
                            <span
                              className={`rounded-md px-2 py-1 font-mono text-[10px] font-bold ${
                                overLimit ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-600'
                              }`}
                            >
                              {wordsTyped}/{q.maxWords}w
                            </span>
                          )}
                        </div>
                      )}

                      {res && (
                        <div
                          className={`mt-2.5 rounded-lg p-2.5 text-xs ${
                            res.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          <p className="font-bold">{res.reason}</p>
                          <p className="mt-1">
                            <strong>Audio Quote:</strong> "{q.audioQuote}" — {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                {isCurrentSubmitted ? (
                  <>
                    <span className="text-xs font-extrabold text-emerald-700">
                      Result:{' '}
                      {
                        activeListening.questions.filter(
                          (q) => gradeObjectiveQuestion(q, answers[q.id]).isCorrect
                        ).length
                      }
                      /{activeListening.questions.length}
                    </span>
                    <button
                      onClick={resetObjectiveSet}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Retry Listening</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleObjectiveSubmit}
                    className="ml-auto rounded-xl bg-[#FF6B2C] px-5 py-2 text-xs font-bold text-white hover:bg-[#EA580C]"
                  >
                    Check Listening Answers
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== WRITING STUDIO SIMULATOR ==================== */}
      {skill === 'writing' && simMode === 'full-exam' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-200/80 bg-white px-4 py-3">
            <div>
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-[#FF6B2C]">
                {fullWritingExam.title}
              </span>
              <p className="mt-1 text-xs text-slate-600">
                Both tasks share one 60-minute clock (Task 2 carries double weight: 66.7%). Drafts save automatically as you switch parts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
              <span
                className={`rounded-lg px-2.5 py-1 ${
                  fullWriteT1Words >= 150 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                Task 1: {fullWriteT1Words}/150w
              </span>
              <span
                className={`rounded-lg px-2.5 py-1 ${
                  fullWriteT2Words >= 250 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                Task 2: {fullWriteT2Words}/250w
              </span>
            </div>
          </div>

          <div
            className="grid gap-4 rounded-2xl border p-4 lg:grid-cols-2"
            style={{
              backgroundColor: 'var(--exam-bg)',
              color: 'var(--exam-text)',
              borderColor: 'var(--exam-border)',
            }}
          >
            {/* Left: Prompt & Visual Data */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[#FF6B2C]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#FF6B2C]">
                  {fullWriteTask.category}
                </span>
                <span className="text-xs font-semibold opacity-75">{fullWriteTask.weightLabel}</span>
              </div>
              <h3 className="text-lg font-extrabold">{fullWriteTask.title}</h3>
              <p
                className={`whitespace-pre-line rounded-xl border p-4 leading-relaxed ${textSizeClass}`}
                style={{
                  backgroundColor: 'var(--exam-surface)',
                  borderColor: 'var(--exam-border)',
                }}
              >
                {fullWriteTask.promptText}
              </p>
              {fullWriteTask.chartData && <WritingVisualRenderer data={fullWriteTask.chartData} />}
            </div>

            {/* Right: Computer-Delivered Writing Editor */}
            <div
              className="flex flex-col justify-between space-y-3 rounded-xl border p-4"
              style={{
                backgroundColor: 'var(--exam-surface)',
                borderColor: 'var(--exam-border)',
              }}
            >
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold">
                    Part {fullWriteTaskNum} Editor (Auto-Saved)
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs font-extrabold ${
                      (fullWriteTaskNum === 1 ? fullWriteT1Words : fullWriteT2Words) >=
                      fullWriteTask.minWords
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    Words: {fullWriteTaskNum === 1 ? fullWriteT1Words : fullWriteT2Words} /{' '}
                    {fullWriteTask.minWords} min
                  </span>
                </div>

                {detectWritingBulletPenalty(profile.writingDrafts[fullWriteTask.id] ?? '') && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Penalty Alert: Bullet points or numbered lists detected! IELTS requires continuous connected prose.
                    </span>
                  </div>
                )}

                <textarea
                  value={profile.writingDrafts[fullWriteTask.id] ?? ''}
                  onChange={(e) => onSaveWritingDraft(fullWriteTask.id, e.target.value)}
                  rows={14}
                  placeholder={`Write your Task ${fullWriteTaskNum} continuous prose response (minimum ${fullWriteTask.minWords} words)...`}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 focus:border-[#FF6B2C] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3" style={{ borderColor: 'var(--exam-border)' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      requestAiCoach(
                        'writing',
                        `Task ${fullWriteTask.taskNumber} (${fullWriteTask.category}): ${fullWriteTask.title}`,
                        fullWriteTask.promptText,
                        profile.writingDrafts[fullWriteTask.id] ?? ''
                      )
                    }
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#EA580C] disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{aiLoading ? 'Evaluating...' : `AI Evaluate Task ${fullWriteTaskNum}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWritingModel((v) => !v)}
                    className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    {showWritingModel
                      ? 'Hide Model Answer'
                      : `View ${fullWriteTask.modelAnswer.bandEstimate} Model`}
                  </button>
                </div>
              </div>

              {aiError && <p className="text-xs font-semibold text-rose-600">{aiError}</p>}
              {aiFeedback && (
                <div className="rounded-xl border border-orange-200 bg-[#FAF8F6] p-4 text-xs text-slate-800">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-extrabold text-[#FF6B2C]">
                      AI Writing Rubric Feedback (Task {fullWriteTaskNum})
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                      {aiSource}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">{aiFeedback}</pre>
                </div>
              )}

              {showWritingModel && (
                <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-800">
                      Model Response ({fullWriteTask.modelAnswer.bandEstimate})
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {fullWriteTask.modelAnswer.wordCount} words
                    </span>
                  </div>
                  {fullWriteTask.modelAnswer.paragraphs.map((p) => (
                    <div key={p.role} className="rounded-lg bg-white p-3">
                      <p className="text-[11px] font-bold uppercase text-[#FF6B2C]">{p.role}</p>
                      <p className="mt-1 whitespace-pre-line leading-relaxed">{p.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ExamBottomNav
            parts={[
              {
                partNumber: 1,
                label: 'Part 1: Task 1 (1/3 Weight)',
                questionNumbers: [],
                badgeText: `${fullWriteT1Words}/${fullWritingExam.task1.minWords}w`,
              },
              {
                partNumber: 2,
                label: 'Part 2: Task 2 (2/3 Weight)',
                questionNumbers: [],
                badgeText: `${fullWriteT2Words}/${fullWritingExam.task2.minWords}w`,
              },
            ]}
            activePartNumber={fullWriteTaskNum}
            onSelectPart={(pn) => {
              setFullWriteTaskNum(pn as 1 | 2);
              setShowWritingModel(false);
              setAiFeedback(null);
            }}
          />
        </div>
      )}

      {skill === 'writing' && simMode === 'quick-drill' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {allWritingPrompts.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setWritingId(w.id);
                  setShowWritingModel(false);
                }}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  w.id === activeWriting.id
                    ? 'border-[#FF6B2C] bg-[#FFF1EB] text-[#EA580C]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                {w.isDaily ? '★ DAILY • ' : `Task ${w.taskNumber} • `}
                {w.title}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left Prompt & Visual Data */}
            <div className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-[#FF6B2C]">
                  {activeWriting.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {activeWriting.weightLabel}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">{activeWriting.title}</h3>
              <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-[#FAF8F6] p-4 text-sm leading-relaxed text-slate-800">
                {activeWriting.promptText}
              </p>

              {activeWriting.chartData && <WritingVisualRenderer data={activeWriting.chartData} />}

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Strategy & Academic Phrases
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-700">
                  {activeWriting.strategySteps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activeWriting.targetVocabulary.map((vocab) => (
                    <span
                      key={vocab}
                      className="rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-800"
                    >
                      {vocab}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Writing Editor + Live Word Counter + Band 8 Model */}
            <div className="flex flex-col justify-between space-y-3 rounded-2xl border border-orange-100 bg-white p-5">
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Computer-Delivered Prose Editor (Auto-Saved)
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs font-extrabold ${
                      writingWordCount >= activeWriting.minWords
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    Words: {writingWordCount} / {activeWriting.minWords} min
                  </span>
                </div>

                {hasBulletPenalty && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Penalty Alert: Bullet points or numbered lists detected! IELTS requires continuous connected prose.
                    </span>
                  </div>
                )}

                <textarea
                  value={currentWritingDraft}
                  onChange={(e) => onSaveWritingDraft(activeWriting.id, e.target.value)}
                  rows={14}
                  placeholder={`Write your continuous prose response here (minimum ${activeWriting.minWords} words)...`}
                  className="w-full rounded-xl border border-slate-200 bg-[#FAF8F6] p-4 text-sm leading-relaxed text-slate-900 focus:border-[#FF6B2C] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      requestAiCoach(
                        'writing',
                        `Task ${activeWriting.taskNumber} (${activeWriting.category}): ${activeWriting.title}`,
                        activeWriting.promptText,
                        currentWritingDraft
                      )
                    }
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#EA580C] disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{aiLoading ? 'Reviewing Draft...' : 'AI Writing Rubric Coach'}</span>
                  </button>

                  <button
                    onClick={() => setShowWritingModel((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <span>
                      {showWritingModel
                        ? 'Hide Band 8+ Model Answer'
                        : `Compare with ${activeWriting.modelAnswer.bandEstimate} Model`}
                    </span>
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  Tip: Reserve 3–5 min at the end to proofread punctuation & plural -s.
                </span>
              </div>

              {aiError && <p className="text-xs font-semibold text-rose-600">{aiError}</p>}
              {aiFeedback && (
                <div className="rounded-xl border border-orange-200 bg-[#FAF8F6] p-4 text-xs">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-extrabold text-[#FF6B2C]">
                      AI Writing Rubric Feedback (TA/TR • CC • LR • GRA)
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                      {aiSource}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-800">
                    {aiFeedback}
                  </pre>
                </div>
              )}

              {showWritingModel && (
                <div className="space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-800">
                      Model Response ({activeWriting.modelAnswer.bandEstimate})
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {activeWriting.modelAnswer.wordCount} words
                    </span>
                  </div>
                  {activeWriting.modelAnswer.paragraphs.map((p) => (
                    <div key={p.role} className="rounded-lg bg-white p-3">
                      <p className="text-[11px] font-bold uppercase text-[#FF6B2C]">{p.role}</p>
                      <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-800">
                        {p.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SPEAKING SIMULATOR ==================== */}
      {skill === 'speaking' && (
        <div className="space-y-4">
          {simMode === 'full-exam' && (
            <div className="rounded-2xl border border-orange-200/80 bg-white p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="rounded-full bg-[#FF6B2C]/15 px-2.5 py-0.5 text-[11px] font-extrabold text-[#FF6B2C]">
                    1:1 IELTS Speaking Test Flow (11–14 Minutes)
                  </span>
                  <h3 className="mt-1 text-base font-extrabold text-slate-900">
                    {activeSpeaking.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSpeakPhase('part1');
                      setPrepRunning(false);
                      setTalkRunning(false);
                      setSecondsLeft(14 * 60);
                      setTimerRunning(true);
                      const firstQ = activeSpeaking.part1.questions[0];
                      if (firstQ) speakPromptAloud(firstQ.prompt, firstQ.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B2C] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#EA580C]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Begin Sequential Exam (Part 1 → 3)</span>
                  </button>
                  {speakPhase !== 'part3' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (speakPhase === 'part1') {
                          setSpeakPhase('part2');
                          setPrepSecondsLeft(60);
                          setPrepRunning(true);
                        } else {
                          setPrepRunning(false);
                          setTalkRunning(false);
                          setSpeakPhase('part3');
                        }
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      {speakPhase === 'part1'
                        ? 'Next: Part 2 Cue Card (Auto 1m Prep) →'
                        : 'Next: Part 3 Discussion →'}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  {
                    id: 'part1' as const,
                    title: 'Stage 1: Part 1 Interview',
                    sub: '4–5 min • Everyday Personal Questions',
                  },
                  {
                    id: 'part2' as const,
                    title: 'Stage 2: Part 2 Long Turn',
                    sub: '1:00 Prep → Auto 2:00 Speaking Cue Card',
                  },
                  {
                    id: 'part3' as const,
                    title: 'Stage 3: Part 3 Discussion',
                    sub: '4–5 min • Abstract Policy Follow-Ups',
                  },
                ].map((stage, idx) => {
                  const active = speakPhase === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSpeakPhase(stage.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-[#FF6B2C] bg-[#FFF8F4]'
                          : 'border-slate-200 bg-[#FAF8F6] hover:border-orange-200'
                      }`}
                    >
                      <p className="text-xs font-extrabold text-slate-900">
                        {idx + 1}. {stage.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{stage.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {allSpeakingSets.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setSpeakingId(sp.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    sp.id === activeSpeaking.id
                      ? 'border-[#FF6B2C] bg-[#FFF1EB] text-[#EA580C]'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {sp.isDaily ? '★ DAILY • ' : ''}
                  {sp.title}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              {(['part1', 'part2', 'part3'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSpeakPhase(p)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase ${
                    speakPhase === p
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-orange-50'
                  }`}
                >
                  {p === 'part1' ? 'Part 1 (Interview)' : p === 'part2' ? 'Part 2 (Cue Card)' : 'Part 3 (Abstract)'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Examiner Prompt & Timers */}
            <div className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5">
              {speakPhase === 'part1' && (
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Part 1: {activeSpeaking.part1.topic}
                  </h3>
                  {activeSpeaking.part1.questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-slate-200 bg-[#FAF8F6] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">{q.prompt}</p>
                        <button
                          onClick={() => speakPromptAloud(q.prompt, q.id)}
                          className="shrink-0 rounded-lg bg-[#FF6B2C] p-1.5 text-white"
                          title="Hear Examiner Ask Question"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">Tip: {q.tip}</p>
                      {showSpeakingModel && (
                        <div className="mt-2 rounded-lg bg-white p-3 text-xs text-slate-700">
                          <strong className="text-emerald-700">Band 7.5–8.0 Sample: </strong>
                          {q.modelAnswer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {speakPhase === 'part2' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-[#FFF6F0] to-white p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B2C]">
                        Candidate Task Card (Cue Card)
                      </span>
                      <button
                        onClick={() =>
                          speakPromptAloud(
                            `${activeSpeaking.part2.cueCardTitle}. You should say: ${activeSpeaking.part2.bullets.join(', ')}`,
                            `${activeSpeaking.id}-part2`
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#FF6B2C] shadow-2xs"
                      >
                        <Volume2 className="h-3 w-3" /> Read Prompt
                      </button>
                    </div>
                    <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                      {activeSpeaking.part2.cueCardTitle}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-slate-500">You should say:</p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm font-medium text-slate-800">
                      {activeSpeaking.part2.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Official 1-Minute Prep + 2-Minute Speaking Timers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-[#FAF8F6] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">1-Min Prep Timer</span>
                        <button
                          onClick={() => setHidePart2Timer((v) => !v)}
                          className="text-[10px] font-semibold text-orange-600"
                        >
                          {hidePart2Timer ? 'Show' : 'VCS Hide'}
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                        {hidePart2Timer ? '••:••' : formatTimer(prepSecondsLeft)}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          onClick={() => setPrepRunning((r) => !r)}
                          className="rounded-lg bg-[#FF6B2C] px-2.5 py-1 text-[11px] font-bold text-white"
                        >
                          {prepRunning ? 'Pause' : 'Start 1m Prep'}
                        </button>
                        <button
                          onClick={() => {
                            setPrepRunning(false);
                            setPrepSecondsLeft(60);
                          }}
                          className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-slate-600"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-[#FAF8F6] p-3">
                      <span className="text-[11px] font-bold text-slate-500">2-Min Long Turn</span>
                      <p className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                        {formatTimer(talkSecondsLeft)}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          onClick={() => setTalkRunning((r) => !r)}
                          className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white"
                        >
                          {talkRunning ? 'Pause' : 'Start 2m Talk'}
                        </button>
                        <button
                          onClick={() => {
                            setTalkRunning(false);
                            setTalkSecondsLeft(120);
                          }}
                          className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-slate-600"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {speakPhase === 'part3' && (
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Part 3 Abstract Discussion: {activeSpeaking.part3.themeTitle}
                  </h3>
                  {activeSpeaking.part3.questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-slate-200 bg-[#FAF8F6] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">{q.prompt}</p>
                        <button
                          onClick={() => speakPromptAloud(q.prompt, q.id)}
                          className="shrink-0 rounded-lg bg-[#FF6B2C] p-1.5 text-white"
                          title="Hear Examiner Ask Question"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">Strategy: {q.tip}</p>
                      {showSpeakingModel && (
                        <div className="mt-2 rounded-lg bg-white p-3 text-xs text-slate-700">
                          <strong className="text-emerald-700">Band 8.0 Sample: </strong>
                          {q.modelAnswer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Keyword Notepad + Voice Recorder + Model Answer */}
            <div className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  1-Minute Cue Card Keyword Notepad (Write Keywords Only — No Full Sentences)
                </p>
                <textarea
                  value={profile.speakingNotes[activeSpeaking.id] ?? ''}
                  onChange={(e) => onSaveSpeakingNote(activeSpeaking.id, e.target.value)}
                  rows={5}
                  placeholder="- Bullet 1: airborne particulates / traffic&#10;- Bullet 2: fossil fuel plants + temperature inversion&#10;- Bullet 3: respiratory spike&#10;- Bullet 4: electric transit + emission caps"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-[#FAF8F6] p-3 text-xs leading-relaxed focus:border-[#FF6B2C] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Microphone Recorder */}
              <div className="rounded-xl border border-orange-100 bg-[#FFF8F4] p-4">
                <p className="text-xs font-bold text-slate-900">
                  Practice Recording Booth (Browser Microphone)
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Record your 2-minute talk and play it back to inspect pauses ("um/uh") and stress-timing.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!isRecording ? (
                    <button
                      onClick={startMicRecording}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B2C] px-4 py-2 text-xs font-bold text-white"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Record Voice Answer</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopMicRecording}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white animate-pulse"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  <button
                    onClick={() =>
                      requestAiCoach(
                        'speaking',
                        activeSpeaking.part2.cueCardTitle,
                        activeSpeaking.part2.bullets.join('; '),
                        profile.speakingNotes[activeSpeaking.id] ?? '',
                        {
                          spokenTranscript,
                          wpm: spokenWpm,
                          fillerCount: spokenFillerCount,
                        }
                      )
                    }
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{aiLoading ? 'Coaching...' : 'AI Cue-Card & Fluency Coach'}</span>
                  </button>

                  <button
                    onClick={() => setShowSpeakingModel((v) => !v)}
                    className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white"
                  >
                    {showSpeakingModel ? 'Hide Model Transcript' : 'Show Band 8.0 Transcript'}
                  </button>
                </div>

                {micError && <p className="mt-2 text-xs font-semibold text-rose-600">{micError}</p>}
                {recordedAudioUrl && (
                  <audio controls src={recordedAudioUrl} className="mt-3 w-full" />
                )}

                {/* Live Speech-to-Text + WPM & Filler Telemetry */}
                <div className="mt-4 space-y-2.5 border-t border-orange-200/70 pt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white px-2.5 py-2 text-center shadow-2xs">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Spoken Words</p>
                      <p className="font-mono text-sm font-extrabold text-slate-900">
                        {spokenWordCount}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white px-2.5 py-2 text-center shadow-2xs">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Pace (Band 7: 120–150)
                      </p>
                      <p
                        className={`font-mono text-sm font-extrabold ${
                          spokenWpm >= 115 && spokenWpm <= 160
                            ? 'text-emerald-600'
                            : spokenWpm > 0
                              ? 'text-amber-600'
                              : 'text-slate-900'
                        }`}
                      >
                        {spokenWpm > 0 ? `${spokenWpm} WPM` : '-- WPM'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white px-2.5 py-2 text-center shadow-2xs">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Filler Words</p>
                      <p
                        className={`font-mono text-sm font-extrabold ${
                          spokenFillerCount > 3 ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {spokenFillerCount}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700">
                        Live Speech Transcript {isRecording && sttSupported ? '(Listening...)' : '(Editable)'}
                      </span>
                      {spokenDiscourseFound.length > 0 && (
                        <span className="font-semibold text-emerald-700">
                          Markers: {spokenDiscourseFound.join(', ')}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={spokenTranscript}
                      onChange={(e) => setSpokenTranscript(e.target.value)}
                      rows={3}
                      placeholder={
                        sttSupported
                          ? 'Click "Record Voice Answer" to transcribe live as you speak — or type/paste your answer here to analyze fillers and WPM...'
                          : 'Speech recognition is unavailable in this browser — type or paste your spoken answer here for AI Fluency Coach review.'
                      }
                      className="w-full rounded-xl border border-orange-200/80 bg-white p-2.5 text-xs leading-relaxed text-slate-800 focus:border-[#FF6B2C] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {aiError && <p className="text-xs font-semibold text-rose-600">{aiError}</p>}
              {aiFeedback && (
                <div className="rounded-xl border border-orange-200 bg-[#FAF8F6] p-4 text-xs">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-extrabold text-emerald-700">
                      AI Cue-Card & Fluency Coach
                    </span>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                      {aiSource}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-800">
                    {aiFeedback}
                  </pre>
                </div>
              )}

              {showSpeakingModel && speakPhase === 'part2' && (
                <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs">
                  <p className="font-extrabold text-emerald-800">
                    Band 8.0 Model Long Turn ({activeSpeaking.part2.modelWordCount} words)
                  </p>
                  {activeSpeaking.part2.modelParagraphs.map((p, idx) => (
                    <p key={idx} className="leading-relaxed text-slate-800">
                      {p}
                    </p>
                  ))}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {activeSpeaking.part2.keyCollocations.map((c) => (
                      <span
                        key={c}
                        className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {simMode === 'full-exam' && (
            <ExamBottomNav
              parts={[
                { partNumber: 1, label: 'Part 1: Interview (4–5m)', questionNumbers: [] },
                { partNumber: 2, label: 'Part 2: Cue Card (3–4m)', questionNumbers: [] },
                { partNumber: 3, label: 'Part 3: Discussion (4–5m)', questionNumbers: [] },
              ]}
              activePartNumber={speakPhase === 'part1' ? 1 : speakPhase === 'part2' ? 2 : 3}
              onSelectPart={(pn) =>
                setSpeakPhase(pn === 1 ? 'part1' : pn === 2 ? 'part2' : 'part3')
              }
            />
          )}
        </div>
      )}
    </div>
  );
};
