import React from 'react';
import { WritingChartData, DiagramVisualSpec, ListeningMapSpec } from '../types/ielts';

export const WritingVisualRenderer: React.FC<{ data: WritingChartData }> = ({ data }) => {
  if (data.kind === 'table' && data.headers && data.rows) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900">{data.title}</h4>
          {data.unit && (
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
              {data.unit}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {data.headers.map((h) => (
                  <th key={h} className="px-3 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-none hover:bg-orange-50/30">
                  <td className="px-3 py-2.5 font-semibold text-slate-800">{row.label}</td>
                  {row.values.map((val, idx) => (
                    <td
                      key={idx}
                      className={`px-3 py-2.5 font-mono text-xs ${
                        idx === row.values.length - 1
                          ? 'font-bold text-orange-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.kind === 'grouped-bar' && data.bars) {
    const maxVal = 1200;
    const legendItems = data.bars[0]?.series ?? [];
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-xs">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900">{data.title}</h4>
          {data.unit && <span className="text-xs text-slate-500">{data.unit}</span>}
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          {legendItems.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-700">
              <span className="h-2.5 w-2.5 rounded-xs" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
        <div className="relative flex h-56 items-end justify-around gap-4 border-b border-l border-slate-200 px-4 pt-6 pb-2">
          {data.bars.map((group) => (
            <div key={group.period} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-44 w-full items-end justify-center gap-1.5">
                {group.series.map((bar) => {
                  const pct = Math.max(4, Math.round((bar.value / maxVal) * 100));
                  return (
                    <div key={bar.name} className="group relative flex h-full w-6 flex-col items-center justify-end sm:w-8">
                      <span className="mb-1 text-[10px] font-semibold text-slate-600">
                        {bar.value}
                      </span>
                      <div
                        className="w-full rounded-t-md transition-all group-hover:opacity-90"
                        style={{ height: `${pct}%`, backgroundColor: bar.color }}
                        title={`${bar.name} (${group.period}): ${bar.value}k`}
                      />
                    </div>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-slate-700">{group.period}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export const FurnaceDiagramSvg: React.FC<{ spec: DiagramVisualSpec }> = ({ spec }) => {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4">
      <div className="mb-2">
        <h4 className="text-sm font-bold text-slate-900">{spec.title}</h4>
        <p className="text-xs text-slate-600">{spec.subtitle}</p>
      </div>
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <svg viewBox="0 0 360 220" className="w-full max-w-sm rounded-xl border border-orange-100 bg-white p-2">
          {/* Outer Furnace Shell */}
          <rect x="85" y="32" width="190" height="156" rx="14" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2.5" />
          {/* Lower Intake Pipe */}
          <path d="M 15 152 L 95 152 L 95 170 L 15 170" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <polygon points="68,156 82,161 68,166" fill="#0284C7" />
          <text x="12" y="143" fontSize="10" fontWeight="700" fill="#0369A1">
            Cold Air In
          </text>
          {/* Central Ceramic Honeycomb Core */}
          <rect x="115" y="72" width="130" height="74" rx="6" fill="#FDBA74" stroke="#C2410C" strokeWidth="2" />
          <line x1="115" y1="90" x2="245" y2="90" stroke="#9A3412" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="115" y1="110" x2="245" y2="110" stroke="#9A3412" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="115" y1="130" x2="245" y2="130" stroke="#9A3412" strokeWidth="1" strokeDasharray="4 3" />
          <text x="180" y="114" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C2D12">
            1,100°C [Q6]
          </text>
          {/* Upper Exhaust Outlet */}
          <path d="M 265 48 L 345 48 L 345 66 L 265 66" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
          <polygon points="315,52 330,57 315,62" fill="#DC2626" />
          <text x="275" y="40" fontSize="10" fontWeight="700" fill="#B91C1C">
            Hot Air Out [Q7]
          </text>
          {/* Label Callouts */}
          <circle cx="58" cy="184" r="11" fill="#FF6B2C" />
          <text x="58" y="188" textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFF">
            Q5
          </text>
          <line x1="58" y1="173" x2="58" y2="165" stroke="#FF6B2C" strokeWidth="1.5" />
        </svg>
        <div className="flex-1 space-y-2 text-xs">
          {spec.labels.map((item) => (
            <div key={item.slot} className="rounded-xl border border-orange-100 bg-white px-3 py-2">
              <span className="font-bold text-orange-600">{item.slot}:</span>{' '}
              <span className="text-slate-600">{item.hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TownMapSvg: React.FC<{ spec: ListeningMapSpec }> = ({ spec }) => {
  const isParkMap = spec.title.toLowerCase().includes('botanical');
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{spec.title}</h4>
          <p className="text-xs text-slate-600">{spec.orientationNote}</p>
        </div>
        <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs">
          ↑ NORTH
        </span>
      </div>
      <div className="space-y-3">
        {isParkMap ? (
          <svg viewBox="0 0 360 230" className="w-full rounded-xl border border-orange-100 bg-white p-2">
            {/* Park Outer Path & River */}
            <path d="M 35 190 Q 15 110 45 45 L 310 45 Q 340 115 320 190 Z" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="2" />
            <path d="M 285 20 Q 345 100 330 220" fill="none" stroke="#BAE6FD" strokeWidth="14" />
            <text x="336" y="135" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0369A1" transform="rotate(-82 336 135)">
              River Bend
            </text>
            {/* Central Pond */}
            <ellipse cx="180" cy="115" rx="52" ry="28" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
            <text x="180" y="118" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0369A1">
              Central Pond
            </text>
            {/* North Gate & Car Park */}
            <rect x="132" y="8" width="96" height="22" rx="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
            <text x="180" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="#334155">
              North Gate & Car Park
            </text>
            {/* Fountain Terrace & West Terrace */}
            <rect x="242" y="132" width="44" height="24" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
            <text x="264" y="147" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#92400E">
              Fountain
            </text>
            <rect x="42" y="128" width="48" height="24" rx="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
            <text x="66" y="143" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#334155">
              West Terrace
            </text>
            {/* Wooden Footbridge */}
            <rect x="296" y="160" width="38" height="14" rx="3" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
            <text x="315" y="155" textAnchor="middle" fontSize="7" fontWeight="700" fill="#92400E">
              Footbridge
            </text>
            {/* Slots [16] - [20] */}
            <rect x="256" y="96" width="42" height="28" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
            <text x="277" y="113" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
              [16]
            </text>
            <rect x="158" y="60" width="44" height="24" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
            <text x="180" y="76" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
              [17]
            </text>
            <rect x="92" y="34" width="44" height="26" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
            <text x="114" y="51" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
              [18]
            </text>
            <rect x="44" y="88" width="44" height="28" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
            <text x="66" y="106" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
              [19]
            </text>
            <rect x="260" y="178" width="44" height="26" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
            <text x="282" y="195" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
              [20]
            </text>
            {/* South Main Gate */}
            <rect x="136" y="198" width="88" height="22" rx="11" fill="#FF6B2C" />
            <text x="180" y="212" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#FFFFFF">
              ★ MAIN GATE (START)
            </text>
          </svg>
        ) : (
        <svg viewBox="0 0 340 220" className="w-full rounded-xl border border-orange-100 bg-white p-2">
          {/* Roads */}
          <rect x="155" y="35" width="30" height="160" fill="#E2E8F0" />
          <rect x="65" y="45" width="235" height="28" fill="#E2E8F0" />
          <text x="170" y="140" textAnchor="middle" fontSize="9" fill="#475569" transform="rotate(-90 170 140)">
            Market Street
          </text>
          <text x="235" y="63" textAnchor="middle" fontSize="9" fill="#475569">
            River Road →
          </text>
          {/* Central Fountain */}
          <circle cx="170" cy="59" r="14" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
          <text x="170" y="62" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0369A1">
            Fountain
          </text>
          {/* Pedestrian Bridge */}
          <rect x="285" y="42" width="38" height="34" rx="4" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
          <text x="304" y="62" textAnchor="middle" fontSize="8" fontWeight="700" fill="#92400E">
            Bridge
          </text>
          {/* Q1 Slot: Left of Market St opposite fountain */}
          <rect x="92" y="82" width="52" height="36" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
          <text x="118" y="103" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
            [Q1]
          </text>
          {/* Q3 Slot: Courtyard behind clocktower */}
          <rect x="26" y="82" width="56" height="36" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" strokeDasharray="4 2" />
          <text x="54" y="103" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
            [Q3]
          </text>
          {/* Q2 Slot: NE corner on River Road */}
          <rect x="220" y="8" width="60" height="32" rx="6" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2" />
          <text x="250" y="28" textAnchor="middle" fontSize="11" fontWeight="800" fill="#C2410C">
            [Q2]
          </text>
          {/* Start Star */}
          <rect x="132" y="185" width="76" height="24" rx="12" fill="#FF6B2C" />
          <text x="170" y="200" textAnchor="middle" fontSize="9" fontWeight="700" fill="#FFFFFF">
            ★ YOU ARE HERE
          </text>
        </svg>
        )}

        <div className="space-y-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Options Box
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium text-slate-800">
              {spec.optionsBox.map((opt) => (
                <div key={opt} className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                  {opt}
                </div>
              ))}
            </div>
          </div>
          {spec.landmarks.map((lm) => (
            <div key={lm.slotLabel} className="rounded-xl border border-orange-100 bg-white px-3 py-2 text-xs text-slate-700">
              <span className="font-bold text-orange-600">{lm.slotLabel}</span> — {lm.positionLabel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
