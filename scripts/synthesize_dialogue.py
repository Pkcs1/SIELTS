import argparse
import asyncio
import json
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path

import edge_tts

VOICE_MAP = {
    "female-uk": "en-GB-SoniaNeural",
    "male-uk": "en-GB-RyanNeural",
    "female-au": "en-AU-NatashaNeural",
    "male-us": "en-US-GuyNeural",
}

PAUSE_BETWEEN_LINES_SEC = 0.55


async def synthesize_mp3(text: str, voice: str, out_mp3: Path) -> None:
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(out_mp3))


def mp3_to_wav(src_mp3: Path, dst_wav: Path) -> float:
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


async def run(input_path: Path, output_mp3: Path, meta_path: Path) -> None:
    payload = json.loads(input_path.read_text(encoding="utf-8"))
    dialogue = payload.get("dialogue", [])
    if not dialogue:
        raise ValueError("Dialogue list is empty")

    output_mp3.parent.mkdir(parents=True, exist_ok=True)
    meta_path.parent.mkdir(parents=True, exist_ok=True)

    tmp_dir = Path(tempfile.mkdtemp(prefix="selfielts_daily_"))
    try:
        silence_wav = tmp_dir / "silence.wav"
        make_silence_wav(silence_wav, PAUSE_BETWEEN_LINES_SEC)

        wav_sequence: list[Path] = []
        segments: list[dict] = []
        cursor = 0.0

        for idx, line in enumerate(dialogue):
            voice = VOICE_MAP.get(line.get("voiceRole", "male-uk"), VOICE_MAP["male-uk"])
            raw_mp3 = tmp_dir / f"line_{idx}.mp3"
            norm_wav = tmp_dir / f"line_{idx}.wav"

            await synthesize_mp3(line["text"], voice, raw_mp3)
            dur = mp3_to_wav(raw_mp3, norm_wav)

            segments.append(
                {
                    "lineIndex": idx,
                    "speaker": line["speaker"],
                    "voice": voice,
                    "startSec": round(cursor, 3),
                    "endSec": round(cursor + dur, 3),
                }
            )
            wav_sequence.append(norm_wav)
            cursor += dur

            if idx < len(dialogue) - 1:
                wav_sequence.append(silence_wav)
                cursor += PAUSE_BETWEEN_LINES_SEC

        concat_wavs_to_mp3(wav_sequence, output_mp3)
        meta_path.write_text(
            json.dumps(
                {"durationSec": round(cursor, 3), "segments": segments},
                indent=2,
            ),
            encoding="utf-8",
        )
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--meta", required=True)
    args = parser.parse_args()
    asyncio.run(run(Path(args.input), Path(args.output), Path(args.meta)))


if __name__ == "__main__":
    main()
