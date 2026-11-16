import asyncio
import json
import os
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT_AUDIO_DIR = ROOT / "public" / "audio"
MANIFEST_PATH = ROOT / "src" / "data" / "audioManifest.ts"

VOICE_MAP = {
    "female-uk": "en-GB-SoniaNeural",
    "male-uk": "en-GB-RyanNeural",
    "female-au": "en-AU-NatashaNeural",
    "male-us": "en-US-GuyNeural",
    "examiner": "en-GB-LibbyNeural",
}

PAUSE_BETWEEN_LINES_SEC = 0.55


def load_ts_banks() -> tuple[list[dict], list[dict]]:
    """Transpile listeningBank.ts and speakingBank.ts via local TypeScript compiler and dump JSON."""
    js = """
    const fs = require('fs');
    const ts = require('typescript');
    function loadTs(relPath) {
      const src = fs.readFileSync(relPath, 'utf8');
      const compiled = ts.transpileModule(src, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
      }).outputText;
      const mod = { exports: {} };
      const fn = new Function('exports', 'require', 'module', compiled);
      fn(
        mod.exports,
        (id) => {
          if (id.includes('types')) return {};
          if (id.includes('writingBank')) return { WRITING_BANK: [{}, {}, {}, {}, {}] };
          return require(id);
        },
        mod
      );
      return mod.exports;
    }
    const { LISTENING_BANK } = loadTs('./src/data/listeningBank.ts');
    const { DAILY_LISTENING_BANK } = loadTs('./src/data/dailyListeningBank.ts');
    const { FULL_LISTENING_EXAM } = loadTs('./src/data/fullMockExams.ts');
    const { SPEAKING_BANK } = loadTs('./src/data/speakingBank.ts');
    const fullMockParts = FULL_LISTENING_EXAM.parts.map((p) => p.partSet);
    console.log(JSON.stringify({ listening: [...LISTENING_BANK, ...DAILY_LISTENING_BANK, ...fullMockParts], speaking: SPEAKING_BANK }));
    """
    raw = subprocess.check_output(
        ["node", "-e", js],
        cwd=str(ROOT),
        text=True,
    )
    data = json.loads(raw)
    return data["listening"], data["speaking"]


async def synthesize_mp3(text: str, voice: str, out_mp3: Path) -> None:
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(out_mp3))


def mp3_to_wav(src_mp3: Path, dst_wav: Path) -> float:
    """Convert MP3 to uniform 24kHz mono 16-bit PCM WAV and return exact duration in seconds."""
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(src_mp3),
            "-ar",
            "24000",
            "-ac",
            "1",
            "-sample_fmt",
            "s16",
            str(dst_wav),
        ],
        check=True,
    )
    with wave.open(str(dst_wav), "rb") as wf:
        return wf.getnframes() / float(wf.getframerate())


def make_silence_wav(dst_wav: Path, duration_sec: float) -> None:
    sample_rate = 24000
    n_frames = int(round(sample_rate * duration_sec))
    with wave.open(str(dst_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * n_frames)


def concat_wavs_to_mp3(wav_paths: list[Path], out_mp3: Path) -> None:
    temp_combined = out_mp3.with_suffix(".tmp.wav")
    with wave.open(str(temp_combined), "wb") as out_wf:
        out_wf.setnchannels(1)
        out_wf.setsampwidth(2)
        out_wf.setframerate(24000)
        for p in wav_paths:
            with wave.open(str(p), "rb") as in_wf:
                out_wf.writeframes(in_wf.readframes(in_wf.getnframes()))

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(temp_combined),
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "128k",
            str(out_mp3),
        ],
        check=True,
    )
    temp_combined.unlink(missing_ok=True)


async def generate_all() -> None:
    OUT_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    listening_bank, speaking_bank = load_ts_banks()

    listening_manifest: dict[str, dict] = {}
    speaking_manifest: dict[str, str] = {}

    tmp_dir = Path(tempfile.mkdtemp(prefix="selfielts_tts_"))
    try:
        silence_wav = tmp_dir / "silence.wav"
        make_silence_wav(silence_wav, PAUSE_BETWEEN_LINES_SEC)

        # 1. Generate multi-speaker Listening tracks
        for part in listening_bank:
            part_id = part["id"]
            print(f"[Listening] Generating {part_id} ({len(part['dialogue'])} lines)...")
            wav_sequence: list[Path] = []
            segments: list[dict] = []
            cursor = 0.0

            for idx, line in enumerate(part["dialogue"]):
                voice = VOICE_MAP.get(line["voiceRole"], VOICE_MAP["male-uk"])
                raw_mp3 = tmp_dir / f"{part_id}_{idx}.mp3"
                norm_wav = tmp_dir / f"{part_id}_{idx}.wav"

                await synthesize_mp3(line["text"], voice, raw_mp3)
                dur = mp3_to_wav(raw_mp3, norm_wav)

                start_sec = round(cursor, 3)
                end_sec = round(cursor + dur, 3)
                segments.append(
                    {
                        "lineIndex": idx,
                        "speaker": line["speaker"],
                        "voice": voice,
                        "startSec": start_sec,
                        "endSec": end_sec,
                    }
                )
                wav_sequence.append(norm_wav)
                cursor += dur

                if idx < len(part["dialogue"]) - 1:
                    wav_sequence.append(silence_wav)
                    cursor += PAUSE_BETWEEN_LINES_SEC

            out_mp3 = OUT_AUDIO_DIR / f"{part_id}.mp3"
            concat_wavs_to_mp3(wav_sequence, out_mp3)
            listening_manifest[part_id] = {
                "url": f"/audio/{part_id}.mp3",
                "durationSec": round(cursor, 3),
                "segments": segments,
            }
            print(f"  -> Saved {out_mp3.relative_to(ROOT)} ({cursor:.2f}s)")

        # 2. Generate British Examiner prompts for Speaking Parts 1, 2, and 3
        examiner_voice = VOICE_MAP["examiner"]
        for topic in speaking_bank:
            for q in topic["part1"]["questions"]:
                out_mp3 = OUT_AUDIO_DIR / f"{q['id']}.mp3"
                await synthesize_mp3(q["prompt"], examiner_voice, out_mp3)
                speaking_manifest[q["id"]] = f"/audio/{q['id']}.mp3"

            part2_key = f"{topic['id']}-part2"
            part2_text = (
                f"{topic['part2']['cueCardTitle']}. "
                f"You should say: {', '.join(topic['part2']['bullets'])}."
            )
            out_p2_mp3 = OUT_AUDIO_DIR / f"{part2_key}.mp3"
            await synthesize_mp3(part2_text, examiner_voice, out_p2_mp3)
            speaking_manifest[part2_key] = f"/audio/{part2_key}.mp3"

            for q in topic["part3"]["questions"]:
                out_mp3 = OUT_AUDIO_DIR / f"{q['id']}.mp3"
                await synthesize_mp3(q["prompt"], examiner_voice, out_mp3)
                speaking_manifest[q["id"]] = f"/audio/{q['id']}.mp3"

        # 3. Write TypeScript manifest
        manifest_obj = {
            "listening": listening_manifest,
            "speaking": speaking_manifest,
        }
        ts_content = (
            "// Auto-generated by scripts/generate_audio.py using edge-tts neural voices\n"
            "export interface AudioSegmentTiming {\n"
            "  lineIndex: number;\n"
            "  speaker: string;\n"
            "  voice: string;\n"
            "  startSec: number;\n"
            "  endSec: number;\n"
            "}\n\n"
            "export interface ListeningAudioEntry {\n"
            "  url: string;\n"
            "  durationSec: number;\n"
            "  segments: AudioSegmentTiming[];\n"
            "}\n\n"
            "export const AUDIO_MANIFEST: {\n"
            "  listening: Record<string, ListeningAudioEntry>;\n"
            "  speaking: Record<string, string>;\n"
            f"}} = {json.dumps(manifest_obj, indent=2)};\n"
        )
        MANIFEST_PATH.write_text(ts_content, encoding="utf-8")
        print(f"[Manifest] Wrote {MANIFEST_PATH.relative_to(ROOT)}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    asyncio.run(generate_all())
