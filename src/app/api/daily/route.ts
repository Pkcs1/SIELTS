import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';
import { DailyChallengePack, IeltsStream } from '../../../types/ielts';
import { buildProceduralDailyPack } from '../../../utils/dailyGenerator';

const execFileAsync = promisify(execFile);

function getSafeDateString(rawDate: string | null): string {
  if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }
  return new Date().toISOString().slice(0, 10);
}

async function maybeEnhanceWithGemini(
  basePack: DailyChallengePack
): Promise<DailyChallengePack> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_api_key_here') {
    return basePack;
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const prompt = `Generate a brand-new, unseen IELTS Speaking Part 2 Cue Card + Part 1 & Part 3 prompt JSON tailored to date ${basePack.date} (variant ${basePack.variant}, stream ${basePack.stream}), distinct from "${basePack.speaking.part2.cueCardTitle}".
Return strictly valid JSON with keys: title, cueCardTitle, bullets (array of 4 strings), part1Prompt, part3Prompt.`;

    const interaction = await client.interactions.create({
      model: 'gemini-4-hydrogen',
      system_instruction:
        'You are an official IELTS test designer creating fresh daily prompts. Output strict JSON only.',
      input: prompt,
      response_format: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          cueCardTitle: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
          part1Prompt: { type: 'string' },
          part3Prompt: { type: 'string' },
        },
        required: ['title', 'cueCardTitle', 'bullets', 'part1Prompt', 'part3Prompt'],
      },
    });

    if (interaction.output_text) {
      const parsed = JSON.parse(interaction.output_text) as {
        title: string;
        cueCardTitle: string;
        bullets: string[];
        part1Prompt: string;
        part3Prompt: string;
      };
      return {
        ...basePack,
        generatedBy: 'gemini-4-hydrogen',
        speaking: {
          ...basePack.speaking,
          title: `${parsed.title} (${basePack.date})`,
          part1: {
            ...basePack.speaking.part1,
            questions: [
              {
                ...basePack.speaking.part1.questions[0],
                prompt: parsed.part1Prompt,
              },
            ],
          },
          part2: {
            ...basePack.speaking.part2,
            cueCardTitle: parsed.cueCardTitle,
            bullets: parsed.bullets.slice(0, 4),
          },
          part3: {
            ...basePack.speaking.part3,
            questions: [
              {
                ...basePack.speaking.part3.questions[0],
                prompt: parsed.part3Prompt,
              },
            ],
          },
        },
      };
    }
  } catch (err) {
    console.warn('Gemini daily enhancement fallback to procedural seed:', err);
  }
  return basePack;
}

async function synthesizeDailyListeningAudio(
  pack: DailyChallengePack,
  dailyDir: string
): Promise<DailyChallengePack> {
  const cwdFn = process['cwd'].bind(process);
  const root = cwdFn();
  const pythonExe = path.join(root, '.venv', 'Scripts', 'python.exe');
  const scriptPath = path.join(root, 'scripts', 'synthesize_dialogue.py');
  const dialogueJsonPath = path.join(dailyDir, `${pack.packId}-dialogue.json`);
  const outMp3Path = path.join(dailyDir, `${pack.packId}-listening.mp3`);
  const metaJsonPath = path.join(dailyDir, `${pack.packId}-meta.json`);

  try {
    await fs.access(pythonExe);
    await fs.writeFile(
      dialogueJsonPath,
      JSON.stringify({ dialogue: pack.listening.dialogue }, null, 2),
      'utf-8'
    );
    await execFileAsync(
      pythonExe,
      [
        scriptPath,
        '--input',
        dialogueJsonPath,
        '--output',
        outMp3Path,
        '--meta',
        metaJsonPath,
      ],
      { cwd: root, timeout: 60000 }
    );
    const metaRaw = await fs.readFile(metaJsonPath, 'utf-8');
    const meta = JSON.parse(metaRaw) as {
      durationSec: number;
      segments: {
        lineIndex: number;
        speaker: string;
        voice: string;
        startSec: number;
        endSec: number;
      }[];
    };
    return {
      ...pack,
      listening: {
        ...pack.listening,
        audioMeta: {
          url: `/api/daily-audio?file=${encodeURIComponent(`${pack.packId}-listening.mp3`)}`,
          durationSec: meta.durationSec,
          segments: meta.segments,
        },
      },
    };
  } catch (err) {
    console.warn('Daily edge-tts synthesis skipped/unavailable:', err);
    return pack;
  } finally {
    await fs.unlink(dialogueJsonPath).catch(() => {});
    await fs.unlink(metaJsonPath).catch(() => {});
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = getSafeDateString(searchParams.get('date'));
    const stream: IeltsStream =
      searchParams.get('stream') === 'general' ? 'general' : 'academic';
    const variant = Math.max(0, Math.min(30, Number(searchParams.get('variant') ?? '0') || 0));

    const packId = `daily-${date}-${stream}-v${variant}`;
    const dailyDir = path.join(os.tmpdir(), 'selfielts-daily-cache');
    await fs.mkdir(dailyDir, { recursive: true });
    const cachePath = path.join(dailyDir, `${packId}.json`);

    try {
      const cached = await fs.readFile(cachePath, 'utf-8');
      return NextResponse.json(JSON.parse(cached) as DailyChallengePack);
    } catch {
      // Cache miss -> generate and synthesize neural MP3 for today's pack
    }

    const basePack = buildProceduralDailyPack(date, stream, variant);
    const maybeAiPack = await maybeEnhanceWithGemini(basePack);
    const finalPack = await synthesizeDailyListeningAudio(maybeAiPack, dailyDir);

    await fs.writeFile(cachePath, JSON.stringify(finalPack, null, 2), 'utf-8');
    return NextResponse.json(finalPack);
  } catch (err) {
    console.error('Daily generator API error:', err);
    return NextResponse.json(
      { error: 'Unable to generate daily IELTS pack.' },
      { status: 500 }
    );
  }
}
