// app/components/ElementDiagram.tsx
import React from "react";

type ElementType = "목" | "화" | "토" | "금" | "수";

const RELATIONS = {
  generate: [
    ["목", "화"],
    ["화", "토"],
    ["토", "금"],
    ["금", "수"],
    ["수", "목"],
  ],
  overcome: [
    ["목", "토"],
    ["토", "수"],
    ["수", "화"],
    ["화", "금"],
    ["금", "목"],
  ],
};

const ELEMENT_ORDER: ElementType[] = ["목", "화", "토", "금", "수"];

const COLORS: Record<ElementType, string> = {
  목: "#22c55e",
  화: "#ef4444",
  토: "#eab308",
  금: "#6b7280",
  수: "#0ea5e9",
};

const LABELS: Record<ElementType, string> = {
  목: "비겁",
  화: "식상",
  토: "재성",
  금: "관성",
  수: "인성",
};

export default function ElementDiagram({
  dayElement,
  distribution,
  size = 320,
}: {
  dayElement: ElementType;
  distribution: Record<ElementType, number>;
  size?: number;
}) {
  const radius = size / 2 - 50;
  const center = size / 2;

  const rotate = ELEMENT_ORDER.indexOf(dayElement);
  const ordered = ELEMENT_ORDER.map(
    (_, i) => ELEMENT_ORDER[(i + rotate) % ELEMENT_ORDER.length]
  );

  const coords: Partial<Record<ElementType, { x: number; y: number }>> = {};
  ordered.forEach((el, i) => {
    const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
    coords[el as ElementType] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* 生 (곡선 화살표) */}
        {RELATIONS.generate.map(([from, to], idx) => {
          const start = coords[from as ElementType]!;
          const end = coords[to as ElementType]!;
          const midX = (start.x + end.x) / 2 + (end.y - start.y) * 0.2;
          const midY = (start.y + end.y) / 2 - (end.x - start.x) * 0.2;
          return (
            <g key={`gen-${idx}`}>
              <path
                d={`M ${start.x} ${start.y} Q ${midX} ${midY}, ${end.x} ${end.y}`}
                stroke="#3b82f6"
                strokeWidth={2}
                fill="none"
                markerEnd="url(#arrow-blue)"
              />
              <circle cx={midX} cy={midY} r={10} fill="white" stroke="#3b82f6" />
              <text
                x={midX}
                y={midY + 3}
                textAnchor="middle"
                fontSize="10"
                fill="#3b82f6"
              >
                生
              </text>
            </g>
          );
        })}

        {/* 剋 (직선 화살표) */}
        {RELATIONS.overcome.map(([from, to], idx) => {
          const start = coords[from as ElementType]!;
          const end = coords[to as ElementType]!;
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          return (
            <g key={`over-${idx}`}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#ef4444"
                strokeWidth={2}
                markerEnd="url(#arrow-red)"
              />
              <circle cx={midX} cy={midY} r={10} fill="white" stroke="#ef4444" />
              <text
                x={midX}
                y={midY + 3}
                textAnchor="middle"
                fontSize="10"
                fill="#ef4444"
              >
                剋
              </text>
            </g>
          );
        })}

        {/* 오행 원 */}
        {ordered.map((el) => {
          const pct = ((distribution[el] ?? 0) / total) * 100;
          return (
            <g key={el} filter="url(#shadow)">
              <circle
                cx={coords[el]!.x}
                cy={coords[el]!.y}
                r={34}
                fill="white"
                stroke={COLORS[el]}
                strokeWidth={3}
              />
              <text
                x={coords[el]!.x}
                y={coords[el]!.y - 12}
                textAnchor="middle"
                fontSize="17"
                fontWeight="bold"
                fill={COLORS[el]}
              >
                {el}
              </text>
              <text
                x={coords[el]!.x}
                y={coords[el]!.y + 6}
                textAnchor="middle"
                fontSize="11"
                fill="#555"
              >
                ({LABELS[el]})
              </text>
              <text
                x={coords[el]!.x}
                y={coords[el]!.y + 22}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#111"
              >
                {pct.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* 화살표 마커 & 그림자 */}
        <defs>
          <marker
            id="arrow-blue"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" />
          </marker>
          <marker
            id="arrow-red"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
          </marker>
          <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>
      </svg>

      {/* 범례 */}
      <div className="flex justify-center gap-6 mt-3 text-sm">
        <div className="flex items-center gap-1 text-blue-600">
          <svg width="14" height="14">
            <path d="M0,7 Q7,0 14,7" stroke="#3b82f6" strokeWidth="2" fill="none" />
          </svg>
          生 (돕는 관계)
        </div>
        <div className="flex items-center gap-1 text-red-600">
          <svg width="14" height="14">
            <line x1="0" y1="7" x2="14" y2="7" stroke="#ef4444" strokeWidth="2" />
          </svg>
          剋 (제어 관계)
        </div>
      </div>
    </div>
  );
}