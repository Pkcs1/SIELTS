import React, { useState } from 'react';
import { Calculator, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { IeltsStream } from '../types/ielts';
import {
  rawListeningToBand,
  rawReadingToBand,
  roundIeltsBand,
} from '../utils/grading';
import { OFFICIAL_EXTRAS } from '../data/knowledgeBase';

interface BandCalculatorViewProps {
  stream: IeltsStream;
}

export const BandCalculatorView: React.FC<BandCalculatorViewProps> = ({ stream }) => {
  const [calcStream, setCalcStream] = useState<IeltsStream>(stream);
  const [listeningRaw, setListeningRaw] = useState<number>(31);
  const [readingRaw, setReadingRaw] = useState<number>(30);

  // Writing 4 rubrics for Task 1 (1/3) & Task 2 (2/3)
  const [wTask1Band, setWTask1Band] = useState<number>(6.5);
  const [wTask2Band, setWTask2Band] = useState<number>(7.0);

  // Speaking 4 rubrics (25% each)
  const [sFC, setSFC] = useState<number>(7.0);
  const [sLR, setSLR] = useState<number>(7.0);
  const [sGRA, setSGRA] = useState<number>(6.5);
  const [sP, setSP] = useState<number>(7.0);

  const listeningBand = rawListeningToBand(listeningRaw);
  const readingBand = rawReadingToBand(readingRaw, calcStream);
  const writingBand = roundIeltsBand(wTask1Band / 3 + (wTask2Band * 2) / 3);
  const speakingBand = roundIeltsBand((sFC + sLR + sGRA + sP) / 4);

  const rawAvg = (listeningBand + readingBand + writingBand + speakingBand) / 4;
  const overallBand = roundIeltsBand(rawAvg);

  return (
    <div className="space-y-5">
      {/* Overall Band Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#EA580C] p-6 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-300">
            <Calculator className="h-4 w-4" />
            <span>Official IELTS Band Score Calculator</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold">
            Overall Band Score: {overallBand.toFixed(1)}
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Unweighted 4-skill arithmetic mean ({rawAvg.toFixed(3)}) rounded to nearest 0.5 band (.25 rounds up to .5; .75 rounds up to next whole band).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Listening', val: listeningBand },
            { label: 'Reading', val: readingBand },
            { label: 'Writing', val: writingBand },
            { label: 'Speaking', val: speakingBand },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-white/10 px-3.5 py-2 text-center backdrop-blur-xs"
            >
              <p className="text-[10px] font-semibold uppercase text-orange-200">{s.label}</p>
              <p className="text-lg font-extrabold">{s.val.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Component Sliders */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Listening & Reading Raw Sliders */}
        <div className="space-y-5 rounded-2xl border border-orange-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Receptive Skills (Deterministic Raw Marks / 40)
            </h3>
            <button
              onClick={() =>
                setCalcStream((s) => (s === 'academic' ? 'general' : 'academic'))
              }
              className="inline-flex items-center gap-1 rounded-lg bg-[#FFF1EB] px-2.5 py-1 text-[11px] font-bold text-[#FF6B2C]"
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span>{calcStream === 'academic' ? 'Academic Reading' : 'GT Reading'}</span>
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Listening Raw Score: {listeningRaw} / 40</span>
              <span className="text-[#FF6B2C]">Band {listeningBand.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              value={listeningRaw}
              onChange={(e) => setListeningRaw(Number(e.target.value))}
              className="mt-2 w-full accent-[#FF6B2C]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">
                Reading ({calcStream === 'academic' ? 'Academic' : 'General Training'}) Raw Score: {readingRaw} / 40
              </span>
              <span className="text-[#FF6B2C]">Band {readingBand.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              value={readingRaw}
              onChange={(e) => setReadingRaw(Number(e.target.value))}
              className="mt-2 w-full accent-[#FF6B2C]"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Note: General Training Reading requires higher raw marks (e.g., 34–35 for Band 7 vs. 30–32 for Academic).
            </p>
          </div>
        </div>

        {/* Writing & Speaking Weighted Inputs */}
        <div className="space-y-4 rounded-2xl border border-orange-100 bg-white p-5">
          <h3 className="text-sm font-extrabold text-slate-900">
            Productive Skills (Rubric Weighting)
          </h3>

          <div className="rounded-xl border border-slate-100 bg-[#FAF8F6] p-3.5">
            <div className="mb-2 flex justify-between text-xs font-bold">
              <span>Writing (Task 1 = 33.3% • Task 2 = 66.7%)</span>
              <span className="text-indigo-600">Band {writingBand.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="text-slate-600">Task 1 Score: {wTask1Band.toFixed(1)}</span>
                <input
                  type="range"
                  min={4}
                  max={9}
                  step={0.5}
                  value={wTask1Band}
                  onChange={(e) => setWTask1Band(Number(e.target.value))}
                  className="mt-1 w-full accent-indigo-600"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Task 2 Score (2x): {wTask2Band.toFixed(1)}</span>
                <input
                  type="range"
                  min={4}
                  max={9}
                  step={0.5}
                  value={wTask2Band}
                  onChange={(e) => setWTask2Band(Number(e.target.value))}
                  className="mt-1 w-full accent-indigo-600"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-[#FAF8F6] p-3.5">
            <div className="mb-2 flex justify-between text-xs font-bold">
              <span>Speaking (4 Equal Rubrics × 25%)</span>
              <span className="text-emerald-600">Band {speakingBand.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { label: 'Fluency & Coherence', val: sFC, set: setSFC },
                { label: 'Lexical Resource', val: sLR, set: setSLR },
                { label: 'Grammar Range', val: sGRA, set: setSGRA },
                { label: 'Pronunciation', val: sP, set: setSP },
              ].map((item) => (
                <label key={item.label} className="block">
                  <span className="text-[11px] text-slate-600">
                    {item.label}: {item.val.toFixed(1)}
                  </span>
                  <input
                    type="range"
                    min={4}
                    max={9}
                    step={0.5}
                    value={item.val}
                    onChange={(e) => item.set(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* One Skill Retake & Computer-Delivered Reference */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#FF6B2C]" />
            <h3 className="text-sm font-bold text-slate-900">IELTS One Skill Retake (OSR) Rules</h3>
          </div>
          <p className="mt-2 text-xs text-slate-600">{OFFICIAL_EXTRAS.oneSkillRetake.summary}</p>
          <ul className="mt-2.5 list-disc space-y-1 pl-4 text-xs text-slate-700">
            {OFFICIAL_EXTRAS.oneSkillRetake.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">
            Computer-Delivered Test Tools Built Into SIELTS
          </h3>
          <div className="mt-2.5 space-y-2">
            {OFFICIAL_EXTRAS.computerDeliveredFeatures.map((f) => (
              <div key={f.title} className="rounded-xl bg-[#FAF8F6] px-3 py-2 text-xs">
                <p className="font-bold text-slate-800">{f.title}</p>
                <p className="text-slate-600">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
