/**
 * 📄 app/components/SajuExplanation/SpecialGodsSection.tsx
 * 역할: UI 컴포넌트 (React)
 * exports: SpecialGodsData
 * imports: react
 * referenced by: app/page.tsx
 */
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
}: Props) {
  if (!data) return <p className="text-slate-500">흉살 데이터가 없습니다.</p>;

  const pillars: { label: string; key: PillarKey }[] = [
    { label: "시주", key: "hour" },
    { label: "일주", key: "day" },
    { label: "월주", key: "month" },
    { label: "년주", key: "year" },
  ];

  const unique = (arr: string[]): string[] => Array.from(new Set(arr));


const specialGodsDescriptions: Record<string, string> = {
  // ===== 흉살 계열 =====
  "도화": "매력과 인기를 뜻해요 ✨ 이성이 많이 따르지만, 관계 문제로 번잡할 수 있어요.",
  "화개": "예술·종교적 기질 🎨📚 혼자 있는 걸 좋아하고 고독을 즐기기도 해요.",
  "역마": "이동·변화·출장·이사와 관련된 기운 🚗✈️ 늘 움직이고 변화를 추구하는 성향이에요.",
  "백호대살": "강렬한 기운 ⚡ 용기·결단력은 좋지만, 사고·다툼에 조심해야 해요.",
  "괴강살": "강한 카리스마와 독립성 💥 추진력이 강하지만, 고집이 세 보일 수 있어요.",
  "양인살": "활발하고 추진력 넘치는 기운 💪 다만 다소 강압적으로 보일 수 있어 균형이 필요해요.",
  "양인살(양간)": "양간에서 오는 양인살 🔥 강인하고 추진력이 강하지만 다소 강한 인상으로 보일 수 있어요.",
  "양인살(음간)": "음간에서 오는 양인살 🌙 섬세하면서도 독특한 추진력을 발휘해요.",
  "현침살": "예리한 바늘 같은 성향 🪡 집착·고집으로 보일 수 있지만, 집중력과 돌파력으로 재해석돼요.",
  "현침살(강)": "현침의 영향이 더욱 강하게 작용해요 ⚠️ 그러나 오늘날에는 연구·전문성으로도 빛날 수 있어요.",
  "원진살": "대인관계에서 오해·갈등이 잦을 수 있어요 ⚡ 그러나 감정을 잘 다루면 인연을 지킬 수 있어요.",
  "귀문관살": "직관력·영감이 뛰어나요 🔮 하지만 혼자 고민이 많고 외로움을 느끼기 쉬워요.",

  // ===== 길신(귀인) 계열 =====
  "문창귀인": "재능·글쓰기·창의력의 별 ✍️ 학문과 예술적 재능이 뛰어나요.",
  "천덕귀인": "하늘의 덕을 입는 별 ☁️ 위기 때 귀인의 도움을 받아요.",
  "월덕귀인": "사람들의 사랑과 도움을 받는 별 💞 주변 관계가 원만해요.",
  "천을귀인": "천상의 은혜 🙏 어려움 속에서도 보호받는 복을 뜻해요.",
  "삼기귀인": "천간 갑·을·병이 모두 모였을 때 생기는 귀인 ⭐ 큰 기회와 인연을 상징해요.",

  // ===== 기타 길신 =====
  "월공": "사주의 빈자리 🌑 해당 기둥의 기운이 약하거나 공허한 상태를 뜻해요.",
  "천문성": "지혜와 통찰의 별 🌌 학문·연구·직관이 뛰어난 기운이에요.",
  "암록": "안정된 재물과 기반 💰 생활의 뿌리를 지켜주는 복록이에요.",
};

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
          <hr className="my-4 border-t border-gray-300" />

    {/* 큰 제목 */}
    <h2 className="text-lg font-bold mb-3">4. 내 사주의 신살</h2>

    {/* 친절한 설명 */}
    <p className="text-sm text-gray-700 leading-relaxed mt-2">
      &ldquo;신살&rdquo;은 사주에 붙는 별자리 키워드 같은 거예요 ✨  
      마치 게임에서 특수 능력 같은 느낌으로,  
      <b>내 성향이나 특별한 사건, 기운을 더해주는 힌트</b>라고 보면 돼요.  
      <br /><br />
      ▸ <span className="bg-emerald-50 text-emerald-700 px-1 rounded">초록색</span>은 보통 좋은 의미로 해석되는 신살이에요 🌱  
        (예: 인기, 재능, 귀인의 도움 같은 흐름)  
      <br />
      ▸ <span className="bg-amber-50 text-amber-700 px-1 rounded">노란색</span>은 전통적으로는 조심이 필요하다 했지만 ⚠️  
        요즘은 &ldquo;집중력, 돌파력, 개성&rdquo;처럼 현대적으로 장점으로도 재해석돼요 ✨  
      <br /><br />
      아래 표는 <b>시주 → 일주 → 월주 → 년주</b> 순서로 정리되어 있고,  
      각 주(柱)에 어떤 신살이 들어와 있는지를 한눈에 볼 수 있어요.
    </p>
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

{/* 소제목 + 설명 리스트 */}
    <div className="mt-6">
      <h4 className="text-sm font-bold text-gray-700 mb-2">✨ 4-1. 내 사주의 신살 풀이</h4>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 leading-relaxed">
    {Array.from(
      new Set(
        Object.values(data).flat() // year, month, day, hour 전부 모아서
      )
    ).map((name) => (
      <li key={name}>
        <b>{name}</b>: {specialGodsDescriptions[name] ?? "설명이 준비되지 않았어요."}
      </li>
    ))}
  </ul>
</div>
  </section>
);
}