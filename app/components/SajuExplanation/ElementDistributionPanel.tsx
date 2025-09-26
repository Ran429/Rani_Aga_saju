// app/components/SajuExplanation/ElementDistributionPanel.tsx
import React from "react";

type ElementType = "목" | "화" | "토" | "금" | "수";

const ELEMENT_ORDER: ElementType[] = ["목", "화", "토", "금", "수"];

const DONUT_COLORS: Record<ElementType, string> = {
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

// ---------------- 도넛 차트 ----------------
function DonutChart({
  data,
  title,
  size = 180,
  strokeWidth = 20,
}: {
  data: Record<ElementType, number>;
  title: string;
  size?: number;
  strokeWidth?: number;
}) {
  const values = ELEMENT_ORDER.map((el) => data[el] ?? 0);
  const total = values.reduce((a, b) => a + b, 0) || 1;

  const r = size / 2 - strokeWidth / 2 - 30;
  const c = 2 * Math.PI * r;

  let accRatio = 0;
  const segments = ELEMENT_ORDER.map((el) => {
    const v = data[el] ?? 0;
    const ratio = v / total;
    const len = ratio * c;
    const offset = accRatio * c;
    const midRatio = accRatio + ratio / 2;
    const angle = -Math.PI / 2 + 2 * Math.PI * midRatio;
    accRatio += ratio;
    return { el, ratio, len, offset, angle };
  });

  // 중앙에 가장 많은 오행
  const top = segments.reduce((p, c) => (c.ratio > p.ratio ? c : p));

  return (
    <div className="flex flex-col items-center">
      <svg width={size+5} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          stroke="#e5e7eb"
          fill="none"
        />
        {segments.map(({ el, len, offset, angle, ratio }) =>
          len <= 0 ? null : (
            <g key={el}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                strokeWidth={strokeWidth}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                stroke={DONUT_COLORS[el]}
                fill="none"
              />
              {/* 퍼센트 라벨 */}
              <text
                x={size / 2 + (r + 28) * Math.cos(angle)}
                y={size / 2 + (r + 23) * Math.sin(angle)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill={DONUT_COLORS[el]}
              >
                {ratio > 0 ? `${(ratio * 100).toFixed(1)}%` : ""}
              </text>
            </g>
          )
        )}
        {/* 중앙 라벨 */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fontWeight="bolder"
          fill={DONUT_COLORS[top.el]}
        >
          {top.el}
        </text>
      </svg>
      <div className="text-xs mt-2 font-medium text-slate-700">{title}</div>
    </div>
  );
}

// ---------------- 오행 다이어그램 ----------------
function ElementDiagram({
  dayElement,
  distribution,
  size = 270,
}: {
  dayElement: ElementType;
  distribution: Record<ElementType, number>;
  size?: number;
}) {
  const radius = size / 2 - 80; 
  const center = size / 2;

  const rotate = ELEMENT_ORDER.indexOf(dayElement);
  const ordered = ELEMENT_ORDER.map(
    (_, i) => ELEMENT_ORDER[(i + rotate) % ELEMENT_ORDER.length]
  );

  // ✅ 타입 강제 지정
  const coords = {} as Record<ElementType, { x: number; y: number }>;
  ordered.forEach((el, i) => {
    const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
    coords[el] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <svg width={size} height={size}>
      <g transform="translate(-45, -10)"> 
      {/* ✅ 생 관계: 파란 선만 */}
+      {RELATIONS.generate.map(([from, to], idx) => {
        const s = coords[from as ElementType]!;
        const e = coords[to as ElementType]!;
        return (
          <path
            key={`g-${idx}`}
            d={`M ${s.x} ${s.y} Q ${(s.x + e.x) / 2} ${(s.y + e.y) / 2}, ${e.x} ${e.y}`}
            stroke="#3b82f6"
            strokeWidth={2}
            fill="none"
            markerEnd="url(#arrow-blue)"
          />
        );
      })}

      {/* ✅ 극 관계: 빨간 선만 */}
      {RELATIONS.overcome.map(([from, to], idx) => {
        const s = coords[from as ElementType]!;
        const e = coords[to as ElementType]!;
        return (
          <line
            key={`o-${idx}`}
            x1={s.x}
            y1={s.y}
            x2={e.x}
            y2={e.y}
            stroke="#ef4444"
            strokeWidth={2}
            markerEnd="url(#arrow-red)"
          />
        );
      })}

      {/* ✅ 범례 추가 */}
      <g transform={`translate(${center}, ${size - 40})`}>
        <text x="-80" y="0" fontSize="11" fill="#3b82f6">─ 生(돕는 관계)</text>
        <text x="0" y="0" fontSize="11" fill="#ef4444">─ 剋(제어 관계)</text>
      </g>

      {/* 오행 원 */}
      {ordered.map((el) => {
        const pct = ((distribution[el] ?? 0) / total) * 100;
        return (
          <g key={el}>
            <circle
              cx={coords[el].x}
              cy={coords[el].y}
              r={28}
              fill="white"
              stroke={DONUT_COLORS[el]}
              strokeWidth={3}
            />
            <text
              x={coords[el].x}
              y={coords[el].y - 10}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill={DONUT_COLORS[el]}
            >
              {el}
            </text>
            <text
              x={coords[el].x}
              y={coords[el].y + 4}
              textAnchor="middle"
              fontSize="10"
              fill="#555"
            >
              {LABELS[el]}
            </text>
            <text
              x={coords[el].x}
              y={coords[el].y + 18}
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="#111"
            >
              {pct.toFixed(1)}%
            </text>
          </g>
        );
      })}
      {/* 화살표 마커 */}
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
      </defs>
      </g>
    </svg>
  );
}

// ---------------- 메인 ----------------
export default function ElementDistributionPanel({
  rawElements,
  chohuPalaceElements,
  adjustedElements,
  dayElement,
}: {
  rawElements: Record<ElementType, number>;
  chohuPalaceElements: Record<ElementType, number>;
  adjustedElements: Record<ElementType, number>;
  dayElement: ElementType;
}) {
  return (
    <div className="flex flex-col gap-1">
      {/* 도넛 3개 + 화살표 */}
      <div className="flex items-center justify-center gap-3">
        <DonutChart title="원 사주" data={rawElements} />
        <span className="text-2xl">→</span>
        <DonutChart title="조후/궁성 보정" data={chohuPalaceElements} />
        <span className="text-2xl">→</span>
        <DonutChart title="합·충 보정" data={adjustedElements} />
      </div>

      {/* 다이어그램 3개 + 화살표 */}
      <div className="flex items-center justify-center gap-1">
        <ElementDiagram dayElement={dayElement} distribution={rawElements} />
        <span className="text-2xl">→</span>
        <ElementDiagram
          dayElement={dayElement}
          distribution={chohuPalaceElements}
        />
        <span className="text-2xl">→</span>
        <ElementDiagram
          dayElement={dayElement}
          distribution={adjustedElements}
        />
      </div>
    </div>
  );
}
