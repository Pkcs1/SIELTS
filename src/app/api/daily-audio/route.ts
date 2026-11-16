import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const SAFE_AUDIO_RE = /^daily-\d{4}-\d{2}-\d{2}-(academic|general)-v\d+-listening\.mp3$/;

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file') ?? '';
  const cleanName = path.basename(file);
  if (!SAFE_AUDIO_RE.test(cleanName)) {
    return NextResponse.json({ error: 'Invalid audio file name.' }, { status: 400 });
  }

  const audioPath = path.join(os.tmpdir(), 'selfielts-daily-cache', cleanName);
  try {
    const buffer = await fs.readFile(audioPath);
    const total = buffer.byteLength;
    const rangeHeader = req.headers.get('range');

    if (rangeHeader) {
      const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
        if (start >= 0 && start < total && end >= start) {
          const chunk = buffer.subarray(start, end + 1);
          return new NextResponse(new Uint8Array(chunk), {
            status: 206,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Range': `bytes ${start}-${end}/${total}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': String(chunk.byteLength),
            },
          });
        }
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
        'Content-Length': String(total),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Audio not found.' }, { status: 404 });
  }
}
