import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

type AiMode = 'writing' | 'speaking' | 'reading';

interface AiRequestBody {
  mode: AiMode;
  promptTitle: string;
  promptText: string;
  userText: string;
  spokenTranscript?: string;
  wpm?: number;
  fillerCount?: number;
  stream?: string;
}

const DISCOURSE_MARKERS = [
  'however',
  'nevertheless',
  'conversely',
  'consequently',
  'furthermore',
  'moreover',
  'notwithstanding',
  'whereas',
  'overall',
  'although',
  'on the one hand',
  'on the other hand',
  'in conclusion',
  'having said that',
  'on the flip side',
  'it is plausible that',
];

function buildLocalHeuristicFeedback(body: AiRequestBody): string {
  const { mode, promptTitle, promptText, userText } = body;
  const trimmed = userText.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (mode === 'writing') {
    const isTask1 =
      /task 1/i.test(promptTitle) ||
      /table|chart|letter|heating|summarise the information|in your letter/i.test(
        `${promptTitle} ${promptText}`
      );
    const minRequired = isTask1 ? 150 : 250;
    const hasBullets = /^\s*([-*•]|\d+[.)])\s+/m.test(trimmed);
    const sentences = trimmed
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const avgSentenceLen =
      sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;

    const lower = trimmed.toLowerCase();
    const foundMarkers = DISCOURSE_MARKERS.filter((m) => lower.includes(m));
    const hasOverviewSignal = /overall|in general|broadly|taken together/i.test(trimmed);
    const hasThesisSignal = /in my view|i believe|this essay|in conclusion|from my perspective/i.test(trimmed);

    const lines: string[] = [
      `IELTS Writing Rubric Diagnostic`,
      ``,
      `1. Word Count & Format Check`,
      `- Current length: ${wordCount} words (Required minimum: ${minRequired} words). ${
        wordCount >= minRequired
          ? 'Meets minimum length requirement.'
          : `Add at least ${minRequired - wordCount} more words to avoid under-length rubric caps.`
      }`,
      `- Continuous Prose Check: ${
        hasBullets
          ? 'WARNING: Bullet points/numbered lists detected! Convert all bullets into connected paragraphs to avoid TA/CC penalties.'
          : 'Clean continuous prose detected (zero bullet penalties).'
      }`,
      ``,
      `2. Task Achievement / Response & Structure`,
      isTask1
        ? `- Overview Signal: ${
            hasOverviewSignal
              ? 'Detected ("overall"/overview phrasing) — verify it summarizes 2–3 main trends without raw figures.'
              : 'Missing clear Overview paragraph! Add a dedicated paragraph beginning "Overall, ..." summarizing key trends (otherwise Task Achievement caps at Band 5).'
          }`
        : `- Thesis & Stance Signal: ${
            hasThesisSignal
              ? 'Clear personal stance/conclusion signals present — verify your thesis appears in BOTH Introduction and Conclusion.'
              : 'Make sure your position is unmistakably stated in the Introduction and reinforced in the Conclusion.'
          }`,
      ``,
      `3. Coherence, Lexis & Syntactic Variety`,
      `- Sentences detected: ${sentences.length} (avg ~${avgSentenceLen} words/sentence). ${
        avgSentenceLen < 12
          ? 'Try combining short simple sentences using relative clauses ("which", "whereas") or concessives ("Although...").'
          : 'Good complex sentence length variety.'
      }`,
      `- Academic Discourse Markers spotted (${foundMarkers.length}): ${
        foundMarkers.length > 0 ? foundMarkers.join(', ') : 'None detected yet — incorporate natural transitions like "conversely", "nevertheless", "consequently".'
      }`,
      ``,
      `4. Next Upgrade Step (Band 6 -> Band 7+)`,
      `- Proofread for subject-verb agreement and third-person singular / plural -s to maximize error-free sentences.`,
      `- Caution: Treat automated feedback as a structural audit; certified human examiners assess subtle register and logic.`,
    ];

    return lines.join('\n');
  }

  if (mode === 'speaking') {
    const noteCount = words.length;
    const transcript = (body.spokenTranscript ?? '').trim();
    const spokenWords = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
    const fillerCount = body.fillerCount ?? 0;
    const wpm = body.wpm ?? 0;

    const lines = [
      `IELTS Speaking Cue-Card & Fluency Coach`,
      ``,
      `Topic: ${promptTitle}`,
      `- Prep Notes Check: ${
        noteCount === 0
          ? 'No keyword notes yet. Use the 1-minute prep timer to jot 2–3 short keywords/collocations per bullet point.'
          : noteCount > 45
            ? `You wrote ${noteCount} words in your prep pad — condense these into rapid keywords so you finish outlining inside 60 seconds.`
            : `Good concise keyword outline (${noteCount} words) ready for a 2-minute talk.`
      }`,
    ];

    if (spokenWords > 0) {
      const paceStatus =
        wpm >= 115 && wpm <= 160
          ? 'Ideal Band 7.0–8.5 conversational pace (120–150 WPM).'
          : wpm > 0 && wpm < 115
            ? 'Slightly slow pace (<115 WPM) — focus on linking clauses without word-search pauses.'
            : wpm > 160
              ? 'Very rapid pace (>160 WPM) — slow slightly on key content words for clearer pronunciation & stress-timing.'
              : 'Transcript captured cleanly.';

      const lowerSpoken = transcript.toLowerCase();
      const spokenMarkers = DISCOURSE_MARKERS.filter((m) => lowerSpoken.includes(m));
      lines.push(
        `- Spoken Transcript Metrics: ${spokenWords} words captured${wpm > 0 ? ` • ${wpm} WPM (${paceStatus})` : ''}.`,
        `- Filler Word Audit: ${fillerCount} filler occurrence(s) ("um", "uh", "like", "you know", "basically") detected. ${
          fillerCount <= 2
            ? 'Clean delivery with minimal hesitation fillers!'
            : 'Replace repeated "um/like" pauses with natural time-buying phrases like "That is an interesting point..."'
        }`,
        `- Spoken Discourse Markers Detected: ${
          spokenMarkers.length > 0
            ? spokenMarkers.join(', ')
            : 'None detected yet — weave in "Having said that", "On the flip side", or "Another dimension is...".'
        }`
      );
    } else {
      lines.push(
        `- Live Speech Transcript: Click "Record Voice Answer" (or paste/type your spoken response) to measure WPM pace and filler words.`,
        `- Recommended Discourse Markers: "I'd like to talk about...", "What struck me most was...", "On the flip side...", "If we look at the broader picture...".`
      );
    }

    return lines.join('\n');
  }

  // Reading Paraphrase & Lexis Unpacker
  const passageSample = promptText.slice(0, 600);
  const longWords = Array.from(
    new Set(
      (passageSample.match(/\b[a-zA-Z]{8,}\b/g) ?? []).map((w) => w.toLowerCase())
    )
  ).slice(0, 8);

  return [
    `IELTS Reading Paraphrase & Strategy Unpacker`,
    ``,
    `Passage: ${promptTitle}`,
    `- High-Value Academic Vocabulary in Passage: ${
      longWords.length > 0 ? longWords.join(', ') : 'Focus on topic sentences and contrast markers.'
    }`,
    `- Chronological Scanning Strategy:`,
    `  1. Remember: Multiple Choice, True/False/Not Given, Yes/No/Not Given, Sentence Completion, and Short-Answer follow passage order.`,
    `  2. Matching Headings, Matching Information, and Summary/Diagram labels often do NOT follow linear paragraph order.`,
    `  3. For T/F/NG vs Y/N/NG: verify whether the statement contradicts an explicit passage fact/author claim (FALSE/NO) or simply adds an unmentioned detail (NOT GIVEN).`,
    `- Add GEMINI_API_KEY to .env.local to unlock custom sentence-by-sentence paraphrase breakdowns via Gemini 4 Hydrogen.`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiRequestBody;
    if (!body || !body.mode) {
      return NextResponse.json({ error: 'Missing required mode.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const hasLiveKey = Boolean(apiKey && apiKey !== 'your_api_key_here');

    if (!hasLiveKey) {
      return NextResponse.json({
        source: 'local-heuristic',
        feedback: buildLocalHeuristicFeedback(body),
      });
    }

    const client = new GoogleGenAI({ apiKey });

    let systemInstruction =
      'You are an expert IELTS Academic & General Training preparation coach. Be concise, practical, and honest. Remember: never claim to replace an official certified IELTS examiner score.';
    let userPrompt = '';

    if (body.mode === 'writing') {
      systemInstruction +=
        ' Evaluate the candidate draft strictly against the 4 official IELTS Writing criteria (Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy), specifically noting Band 6 vs Band 7 differentiators (clear overview/thesis, error-free complex sentences, natural collocations) and give 2 concrete sentence upgrades.';
      userPrompt = `Track: ${body.stream ?? 'academic'}\nPrompt Title: ${body.promptTitle}\nPrompt:\n${body.promptText}\n\nCandidate Draft:\n${body.userText || '(Empty draft)'}`;
    } else if (body.mode === 'speaking') {
      systemInstruction +=
        ' Coach the candidate on their IELTS Speaking Part 1-3 preparation notes and spoken transcript across Fluency & Coherence, Lexical Resource, and Grammar. Provide concrete upgrades and 4 Band 7.5-8.5 collocations tailored to this cue card.';
      userPrompt = `Cue Card / Topic: ${body.promptTitle}\nDetails:\n${body.promptText}\n\nPrep Keyword Notes:\n${body.userText || '(No notes yet)'}\n\nSpoken Transcript (${body.wpm ?? 0} WPM, ${body.fillerCount ?? 0} fillers):\n${body.spokenTranscript || '(No transcript recorded yet)'}`;
    } else {
      systemInstruction +=
        ' Help the IELTS Reading student decode this passage: extract 5 key academic vocabulary items with likely IELTS question paraphrases, highlight 2 tricky contrast/causal discourse markers, and remind which details could form FALSE vs NOT GIVEN traps.';
      userPrompt = `Passage Title: ${body.promptTitle}\nPassage Text:\n${body.promptText.slice(0, 3500)}`;
    }

    const interaction = await client.interactions.create({
      model: 'gemini-4-hydrogen',
      system_instruction: systemInstruction,
      input: userPrompt,
    });

    const text = interaction.output_text ?? buildLocalHeuristicFeedback(body);
    return NextResponse.json({
      source: 'gemini-4-hydrogen',
      feedback: text,
    });
  } catch (err) {
    console.error('AI Coach route error:', err);
    return NextResponse.json(
      {
        error: 'Failed to generate AI feedback.',
      },
      { status: 500 }
    );
  }
}
