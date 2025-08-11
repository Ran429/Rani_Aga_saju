// app/components/SajuExplanation/SpecialGodsSection.tsx
import React from "react";

/** 현침을 어디 줄에 표시할지: "stems"(천간) | "branches"(지지) */
const HYEONCHIM_BASIS: "stems" | "branches" = "branches";

export type SpecialGodsData = {
  year: string[];
  month: string[];
  day: string[];
  hour: string[];
};

type PillarKey = keyof SpecialGodsData;

type Props = {
  data?: SpecialGodsData;
  title?: string;
};

export default function SpecialGodsSection({
  data,
  title = "📌 1-5. 나의 십이운성 및 신살",
}: Props) {
  if (!data) return <p className="text-slate-500">흉살 데이터가 없습니다.</p>;

  const pillars: { label: string; key: PillarKey }[] = [
    { label: "시주", key: "hour" },
    { label: "일주", key: "day" },
    { label: "월주", key: "month" },
    { label: "년주", key: "year" },
  ];

  const unique = (arr: string[]): string[] => Array.from(new Set(arr));

  // 분류 규칙
  const isGroundOnly = (name: string): boolean =>
    /(도화|화개|양인|귀문|원진|천의성|정록|암록|천문)/.test(name);
  const isBoth = (name: string): boolean => /백호/.test(name);
  const isHyeonchim = (name: string): boolean => /^현침살/.test(name);
  const isHyeonchimStrong = (name: string): boolean => /현침살\(강\)/.test(name);

  const skyBy: Record<PillarKey, string[]> = { year: [], month: [], day: [], hour: [] };
  const groundBy: Record<PillarKey, string[]> = { year: [], month: [], day: [], hour: [] };
  const summaries: string[] = [];

  (Object.keys(data) as PillarKey[]).forEach((k: PillarKey) => {
    (data[k] ?? []).forEach((name: string) => {
      // 요약(강)은 표에서 제외해 상단에만 1회 노출
      if (isHyeonchimStrong(name)) {
        summaries.push(name);
        return;
      }
      // 현침 일반: 기준에 따라 천간/지지에만 분류
      if (isHyeonchim(name)) {
        if (HYEONCHIM_BASIS === "stems") skyBy[k].push(name);
        else groundBy[k].push(name);
        return;
      }
      // 양쪽 모두(백호 등)
      if (isBoth(name)) {
        skyBy[k].push(name);
        groundBy[k].push(name);
        return;
      }
      // 지지 전용
      if (isGroundOnly(name)) {
        groundBy[k].push(name);
        return;
      }
      // 기본값: 지지
      groundBy[k].push(name);
    });

    skyBy[k] = unique(skyBy[k]);
    groundBy[k] = unique(groundBy[k]);
  });

  const Pill: React.FC<{ tone?: "sky" | "ground" | "warn"; children: React.ReactNode }> = ({
    tone = "sky",
    children,
  }) => {
    const toneClass =
      tone === "warn"
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
        : tone === "sky"
        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
        {children}
      </span>
    );
  };

const renderCell = (list: string[], row: "sky" | "ground") => {
    if (list.length === 0) return <span className="text-slate-300">—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {list.map((name) => (
          <Pill
            key={name}
            tone={/^현침살/.test(name) ? "warn" : row === "sky" ? "sky" : "ground"}
          >
            {name}
          </Pill>
        ))}
      </div>
    );
  };

return (
  <section>
    {/* 📌 제목 */}
    <h3 className="text-sm font-bold text-gray-700 mt-6">{title}</h3>

    {/* 표 */}
    <div className="min-w-[520px] mt-2">
      <div className="grid grid-cols-5 items-stretch border border-slate-200">
        {/* 헤더 라인 */}
        <div className="col-span-1 border-b border-slate-200 bg-slate-50 p-3 text-center text-sm font-medium text-slate-600">
          구분
        </div>
        {pillars.map((p) => (
          <div
            key={p.key}
            className="border-b border-slate-200 bg-slate-50 p-3 text-center text-sm font-medium text-slate-600"
          >
            {p.label}
          </div>
        ))}

        {/* 천간 라인 */}
        <div className="bg-white p-3 text-center text-sm font-medium text-slate-600">천간</div>
        {pillars.map((p) => (
          <div
            key={`sky-${p.key}`}
            className="border-l border-slate-100 p-3 text-center"
          >
            {renderCell(skyBy[p.key], "sky")}
          </div>
        ))}

        {/* 지지 라인 */}
        <div className="bg-white p-3 text-center text-sm font-medium text-slate-600">지지</div>
        {pillars.map((p) => (
          <div
            key={`ground-${p.key}`}
            className="border-l border-slate-100 p-3 text-center"
          >
            {renderCell(groundBy[p.key], "ground")}
          </div>
        ))}
      </div>
    </div>
  </section>
);
}