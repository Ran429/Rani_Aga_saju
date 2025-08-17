// app/components/SajuExplanation/SpecialGodsSection.tsx
"use client";
import React, { useMemo } from "react";

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

const PILLARS: { label: string; key: PillarKey }[] = [
  { label: "시주", key: "hour" },
  { label: "일주", key: "day" },
  { label: "월주", key: "month" },
  { label: "년주", key: "year" },
];

// ── 분류 규칙
const isGroundOnly = (name: string): boolean =>
  /(도화|화개|양인|귀문|원진|천의성|정록|암록|천문)/.test(name);
const isBoth = (name: string): boolean => /백호/.test(name);
const isHyeonchim = (name: string): boolean => /^현침살/.test(name);

const Pill = ({
  tone = "ground",
  className = "",
  children,
}: {
  tone?: "sky" | "ground" | "warn";
  className?: string;
  children: React.ReactNode;
}) => {
  const toneClass =
    tone === "warn"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : tone === "sky"
      ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  return (
    <span
      className={[
        "inline-flex items-center justify-center text-center rounded-full px-2 py-1 font-medium",
        "text-xs md:text-[13px]",
        toneClass,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
};

// ===== 신살 해석 사전 & 헬퍼 =====
export const specialGodsDescriptions: Record<string, string> = {
  // 흉살/경계
  "도화": "매력과 인기를 뜻해요 ✨ 이성이 많이 따르지만, 관계 문제로 번잡할 수 있어요.",
  "화개": "예술·종교적 기질 🎨📚 혼자 있는 걸 좋아하고 고독을 즐기기도 해요.",
  "역마": "이동·변화·출장·이사와 관련된 기운 🚗✈️ 늘 움직이고 변화를 추구하는 성향이에요.",
  "백호대살": "강렬한 기운 ⚡ 용기·결단력은 좋지만, 사고·다툼에 조심해야 해요.",
  "괴강살": "강한 카리스마와 독립성 💥 추진력이 강하지만, 고집이 세 보일 수 있어요.",
  "양인살": "활발하고 추진력 넘치는 기운 💪 다소 강압적일 수 있어 균형이 필요해요.",
  "양인살(양간)": "양간에서 오는 양인살 🔥 강인하고 추진력이 강해요.",
  "양인살(음간)": "음간에서 오는 양인살 🌙 섬세하면서도 밀어붙이는 힘이 있어요.",
  "현침살": "예리한 바늘 같은 성향 🪡 집착·고집으로 보일 수 있지만 집중력과 돌파력으로 재해석돼요.",
  "현침살(강)": "현침의 영향이 강하게 작용 ⚠️ 요즘은 연구·전문성으로도 빛날 수 있어요.",
  "원진살": "대인관계에서 오해·갈등이 잦을 수 있어요 ⚡ 감정 조절이 포인트예요.",
  "귀문관살": "직관력·영감이 뛰어나요 🔮 다만 혼자 고민이 많고 외로움이 생길 수 있어요.",

  // 길신(귀인)
  "문창귀인": "재능·글쓰기·창의력의 별 ✍️ 학문·예술적 재능이 돋보여요.",
  "천덕귀인": "하늘의 덕을 입는 별 ☁️ 위기 때 귀인의 도움을 받아요.",
  "월덕귀인": "사람들의 사랑과 도움을 받는 별 💞 관계가 원만해요.",
  "천을귀인": "천상의 은혜 🙏 어려움 속에서도 보호받는 복을 뜻해요.",
  "삼기귀인": "갑·을·병이 모일 때 생기는 귀인 ⭐ 큰 기회와 인연을 상징해요.",

  // 기타 길신/기타
  "월공": "해당 기둥의 기운이 공허한 상태 🌑 빈칸처럼 느껴질 수 있어요.",
  "천문성": "지혜와 통찰의 별 🌌 학문·연구·직관이 뛰어나요.",
  "정록": "안정된 기반과 녹(禄) 🍃 현실적인 안정감이 있습니다.",
  "암록": "보이지 않는 복록 💰 생활의 뿌리를 지켜주는 복이 숨어 있어요.",
  "천의성": "자비와 돌봄의 기운 🤍 봉사·치유·케어에 강점이 있어요.",
};

export function getSpecialGodDesc(name: string): string {
  return specialGodsDescriptions[name] ?? "설명이 준비되지 않았어요.";
}

export default function SpecialGodsSection({
  data,
  title = "4. 내 사주의 신살",
}: Props) {
  // 안전 데이터
  const safeData = useMemo<SpecialGodsData>(
    () => data ?? { year: [], month: [], day: [], hour: [] },
    [data]
  );

  // 천간/지지 분류
  const { skyBy, groundBy } = useMemo(() => {
    const sky: Record<PillarKey, string[]> = { year: [], month: [], day: [], hour: [] };
    const ground: Record<PillarKey, string[]> = { year: [], month: [], day: [], hour: [] };

    (Object.keys(safeData) as PillarKey[]).forEach((k) => {
      const names = safeData[k] ?? [];
      names.forEach((name) => {
        if (isHyeonchim(name)) {
          if (HYEONCHIM_BASIS === "stems") sky[k].push(name);
          else ground[k].push(name);
          return;
        }
        if (isBoth(name)) {
          sky[k].push(name);
          ground[k].push(name);
          return;
        }
        if (isGroundOnly(name)) {
          ground[k].push(name);
          return;
        }
        ground[k].push(name);
      });
      sky[k] = Array.from(new Set(sky[k]));
      ground[k] = Array.from(new Set(ground[k]));
    });

    return { skyBy: sky, groundBy: ground };
  }, [safeData]);

  // 표에 실제로 표시된 신살 이름 목록(중복 제거)
  const presentNames = useMemo(
    () =>
      Array.from(
        new Set(([] as string[]).concat(...Object.values(skyBy), ...Object.values(groundBy)))
      ).filter(Boolean),
    [skyBy, groundBy]
  );

  // 셀 렌더: 모바일=세로 1열(가운데 정렬), 데스크탑=가로 랩(왼쪽 정렬)
  const renderCell = (list: string[], row: "sky" | "ground") => {
    if (!list || list.length === 0) return <span className="text-slate-300">—</span>;
    return (
      <div className="flex flex-col items-center gap-1.5 md:flex-row md:flex-wrap md:items-start">
        {list.map((name) => (
          <Pill
            key={`${row}-${name}`}
            tone={/^현침살/.test(name) ? "warn" : row === "sky" ? "sky" : "ground"}
            className="w-full justify-center md:w-auto md:justify-start"
          >
            {name}
          </Pill>
        ))}
      </div>
    );
  };

  return (
    <section>
      <hr className="my-4 border-t border-gray-300" />
      <h2 className="text-lg font-bold mb-3">{title}</h2>

      {/* 단일 표: 모바일/데스크탑 공용 */}
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-200 text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="w-14 md:w-16 border-b border-slate-200 p-2 md:p-3 text-center font-medium">
                구분
              </th>
              {PILLARS.map((p) => (
                <th
                  key={p.key}
                  className="border-b border-l border-slate-200 p-2 md:p-3 text-center font-medium"
                >
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 천간 */}
            <tr>
              <th className="bg-white p-2 md:p-3 text-center text-slate-600 font-medium">천간</th>
              {PILLARS.map((p) => (
                <td
                  key={`sky-${p.key}`}
                  className="border-l border-slate-200 p-2 md:p-3 align-top text-center md:text-left"
                >
                  {renderCell(skyBy[p.key], "sky")}
                </td>
              ))}
            </tr>
            {/* 지지 */}
            <tr>
              <th className="bg-white p-2 md:p-3 text-center text-slate-600 font-medium">지지</th>
              {PILLARS.map((p) => (
                <td
                  key={`ground-${p.key}`}
                  className="border-l border-slate-200 p-2 md:p-3 align-top text-center md:text-left"
                >
                  {renderCell(groundBy[p.key], "ground")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 표 아래 해석 리스트 */}
      {presentNames.length > 0 ? (
        <div className="mt-6">
          <h4 className="text-sm font-bold text-gray-700 mb-2">✨ 4-1. 내 사주의 신살 풀이</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-disc list-inside text-sm text-gray-700 leading-relaxed">
            {presentNames.map((name) => (
              <li key={name}>
                <b>{name}</b>: {getSpecialGodDesc(name)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">표시할 신살이 없습니다.</p>
      )}
    </section>
  );
}
