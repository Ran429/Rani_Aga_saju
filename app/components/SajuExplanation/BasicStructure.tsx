/**
 * 📄 app/components/SajuExplanation/BasicStructure.tsx
 * 역할: UI 컴포넌트 (React)
 * imports: react, next/image, @/app/utils/elementUtils, @/app/calculators/elementDistribution, @/app/utils/daewoonUtils, @/app/types/sajuTypes, @/app/types/sajuTypes, ./data, @/app/calculators/scoreInputBuilder, @/app/calculators/scoreCalculator
 * referenced by: app/page.tsx
 */
// app/components/SajuExplanation/BasicStructure.tsx
import React, { useMemo, useState, useEffect } from "react";

import Image from "next/image";
import { getElement, GanKey, JiKey, getTenGod, getHiddenStems } from "@/app/utils/elementUtils";
import { calculateElementDistribution } from "@/app/calculators/elementDistribution";

import { getDaewoonList } from "@/app/utils/daewoonUtils";
import type { BasicStructureProps } from "@/app/types/sajuTypes"; // 이미 있다면 유지
import { splitBirthDate, normalizeGender, type Gender } from "@/app/types/sajuTypes";
import { buildScoreInput } from "@/app/calculators/scoreInputBuilder";
import { calculate_score_with_limits as calculateScore } from "@/app/calculators/scoreCalculator";
import { twelveFortunesDescriptions } from "@/app/utils/fortuneUtils";
import YearlySeunCarousel from "@/app/components/YearlySeun/YearlySeunCarousel";
import { getDaewoonBucket } from "@/app/utils/dateUtils";


/** 내부 전용 타입 */
type ElementType = "목" | "화" | "토" | "금" | "수";

/** 표시 순서 */
const ELEMENT_ORDER: ElementType[] = ["목", "화", "토", "금", "수"];

/** 색 (SVG stroke용 + 레전드 BG용) */
const DONUT_COLORS: Record<ElementType, { stroke: string; bg: string }> = {
  목: { stroke: "text-emerald-500", bg: "bg-emerald-500" },
  화: { stroke: "text-rose-500", bg: "bg-rose-500" },
  토: { stroke: "text-amber-500", bg: "bg-amber-500" },
  금: { stroke: "text-slate-500", bg: "bg-slate-500" },
  수: { stroke: "text-sky-500", bg: "bg-sky-500" },
};

const PILL_STYLES: Record<ElementType, string> = {
  목: "bg-emerald-50 text-emerald-700 border border-emerald-300",
  화: "bg-rose-50 text-rose-700 border border-rose-300",
  토: "bg-amber-50 text-amber-800 border border-amber-300",
  금: "bg-slate-50 text-slate-700 border border-slate-300",
  수: "bg-sky-50 text-sky-700 border border-sky-300",
};

/** 도넛 차트 (순수 SVG) */
function DonutChart({
  data,
  title,
  size = 115,
  strokeWidth = 18,
  titleClassName,
}: {
  data: Record<ElementType, number>;
  title: string;
  size?: number;
  strokeWidth?: number;
  titleClassName?: string;
}) {
  const values = ELEMENT_ORDER.map((el) => data[el] ?? 0);
  const total = values.reduce((a, b) => a + b, 0);

  const top = ELEMENT_ORDER
    .map((el) => ({ el, val: data[el] ?? 0 }))
    .reduce(
      (p, c) => (c.val > p.val ? c : p),
      { el: ELEMENT_ORDER[0], val: data[ELEMENT_ORDER[0]] ?? 0 }
    );

  const r = size / 2 - strokeWidth / 2;
  const c = 2 * Math.PI * r;
  const startAngle = -Math.PI / 2;
  const minPctToLabel = 6;
  const labelRadius = r + strokeWidth / 2 + 8;

  let accRatio = 0;
  const segments = ELEMENT_ORDER.map((el) => {
    const v = data[el] ?? 0;
    const ratio = total > 0 ? v / total : 0;
    const len = ratio * c;
    const offset = accRatio * c;
    const midRatio = accRatio + ratio / 2;
    const angle = startAngle + 2 * Math.PI * midRatio;
    accRatio += ratio;
    return { el, ratio, len, offset, angle };
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="block"
        style={{ overflow: "visible" }}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          className="text-slate-200"
          stroke="currentColor"
          fill="none"
        />

        {/* segments */}
        {segments.map(({ el, len, offset, ratio }) =>
          len <= 0 ? null : (
            <circle
              key={el}
              cx={size / 2}
              cy={size / 2}
              r={r}
              strokeWidth={strokeWidth}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className={DONUT_COLORS[el].stroke}
              stroke="currentColor"
              fill="none"
              strokeLinecap="butt"
              opacity={ratio < 0.02 ? 0.35 : 1}
            />
          )
        )}

        {/* center label */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className={`text-xl font-semibold ${DONUT_COLORS[top.el].stroke}`}
          fill="currentColor"
        >
          {total > 0 ? top.el : "—"}
        </text>

        {/* outer labels */}
        {segments.map(({ el, ratio, angle }) => {
          const pct = Math.round(ratio * 100);
          if (pct < minPctToLabel) return null;

          const cx = size / 2 + labelRadius * Math.cos(angle);
          const cy = size / 2 + labelRadius * Math.sin(angle);
          const anchor = Math.cos(angle) >= 0 ? "start" : "end";
          const dx = Math.cos(angle) >= 0 ? 6 : -6;

          return (
            <g key={`lbl-${el}`} style={{ pointerEvents: "none" }}>
              <circle
                cx={cx}
                cy={cy}
                r={3}
                className={DONUT_COLORS[el].stroke}
                fill="currentColor"
              />
              <text
                x={cx + dx}
                y={cy}
                textAnchor={anchor as "start" | "end"}
                dominantBaseline="central"
                className="text-[10px] fill-slate-700"
              >
                {el} {pct}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* title label */}
      {title && (
        <div
          className={`text-[12px] font-medium text-slate-700 ${
            titleClassName ?? "mt-2"
          }`}
        >
          {title}
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score, userName }: { score: number; userName: string }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const step = Math.ceil(score / (duration / stepTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= score) {
        start = score;
        clearInterval(timer);
      }
      setDisplayScore(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="my-8 flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-800 mb-3">
        어디 보자... {userName}님의 사주는 몇 점일까?
      </h2>
      <div className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg bg-gradient-to-br from-rose-400 to-pink-500 animate-pulse">
        <div className="flex items-baseline">
          <span className="text-white text-4xl font-extrabold">{displayScore}</span>
          <span className="ml-1 text-lg text-white opacity-80">점</span>
        </div>
      </div>
    </div>
  );
}

/** 색상 맵 (ElementType으로 타입 안전) */
const elementColors: Record<ElementType, string> = {
  목: "bg-white border-green-400",
  화: "bg-white border-red-400",
  토: "bg-white border-yellow-400",
  금: "bg-white border-gray-400",
  수: "bg-white border-blue-400",
};

/** 천간 비유 설명 */
const skyDescriptions: Record<GanKey, string> = {
  갑: "큰 나무처럼 곧고 당당하며, 스스로 뿌리를 깊게 내리는 성향입니다.",
  을: "작은 덩굴과 화초처럼 상황에 유연하게 잘 맞추며, 부드러운 힘을 발휘합니다.",
  병: "태양처럼 따뜻하고 밝은 기운을 뿜어내며, 사람들에게 희망을 줍니다.",
  정: "촛불과 같은 은은한 불빛처럼 세심하고 섬세한 매력을 지닙니다.",
  무: "높은 산처럼 듬직하고 묵직하며, 안정적인 기운을 갖고 있습니다.",
  기: "논밭의 흙처럼 포근하고 다정하며, 주변을 보살피는 성향입니다.",
  경: "단단한 금속처럼 결단력 있고 추진력이 뛰어납니다.",
  신: "보석처럼 세련되고 반짝이며, 세밀한 부분에 강점을 지닙니다.",
  임: "넓은 바다처럼 포용력이 크고, 변화를 수용하는 힘이 있습니다.",
  계: "맑은 시냇물처럼 부드럽고, 상황에 맞게 흐르는 유연함을 가집니다.",
};

/** 동물/이미지 매핑 */
const getAnimalAndColor = (
  dayElement: ElementType,
  dayGround: string
): { animal: string; imageUrl: string } => {
  const animals: Record<string, string> = {
    자: "쥐",
    축: "소",
    인: "호랑이",
    묘: "토끼",
    진: "용",
    사: "뱀",
    오: "말",
    미: "양",
    신: "원숭이",
    유: "닭",
    술: "개",
    해: "돼지",
  };

  const imageUrls: Record<string, string> = {
    쥐: "https://i.imgur.com/NfTjvBa.png",
    소: "https://i.imgur.com/2fHObII.png",
    호랑이: "https://i.imgur.com/IRIcKUF.png",
    토끼: "https://i.imgur.com/Wm7lhe5.png",
    용: "https://i.imgur.com/llBGs3f.png",
    뱀: "https://i.imgur.com/RFM4Je5.png",
    말: "https://i.imgur.com/PmdwrW2.png",
    양: "https://i.imgur.com/n5tWHdW.png",
    원숭이: "https://i.imgur.com/wiRHpFx.png",
    닭: "https://i.imgur.com/IakoWOf.png",
    개: "https://i.imgur.com/O71tkpw.png",
    돼지: "https://i.imgur.com/oaT9OTj.png",
  };

  const colorPrefix: Record<ElementType, string> = {
    목: "푸른 ",
    화: "붉은 ",
    토: "노란 ",
    금: "흰 ",
    수: "검은 ",
  };

  const animal = animals[dayGround] ?? "미확인 동물";
  const imageUrl = imageUrls[animal] ?? "";

  return { animal: `${colorPrefix[dayElement]}${animal}`, imageUrl };
};


export default function BasicStructure({ userName, sajuResult,}: BasicStructureProps) {
  // 1) 먼저 필요한 계산/훅들을 "항상" 호출
  const daySky = sajuResult.day.sky as GanKey;
  const dayGround = sajuResult.day.ground;
  const dayElement = getElement(daySky) as ElementType;
  const tenGodOfGan = React.useCallback((gan: GanKey) => {
    return getTenGod(daySky, gan);
  }, [daySky]);

    const tenGodOfJi = React.useCallback((ji: JiKey) => {
    const [main] = getHiddenStems(ji);      // 지장의 주기준
    return main ? getTenGod(daySky, main) : "";
  }, [daySky]);
  const animalData = getAnimalAndColor(dayElement, dayGround);


  // ✅ birthDate 문자열 → 연/월/일 안전 파싱 (birthYear/Month/Day가 없을 때 대비)
  const { year: birthYear, month: birthMonth, day: birthDay } = splitBirthDate(sajuResult.userInfo);
  const gender: Gender = normalizeGender(sajuResult.userInfo?.gender);

  // ✅ 옵션 토글 (조후 / 궁성가중 / 합·충)
 const [applyChohu, setApplyChohu] = useState(true);
 const [applyPalace, setApplyPalace] = useState(true);
 const [applyUnions, setApplyUnions] = useState(true);

 // 대운-세운 연동 상태
const [activeAge, setActiveAge] = useState<number | undefined>(undefined); // 선택된 나이
const [activeRange, setActiveRange] = useState<{start:number; end:number} | null>(null);

const yearlySeunForView = useMemo(() => {
  const all = sajuResult.yearlySeun;
  if (!activeRange) return all; // 선택 전에는 전체
  return all.filter(x => x.age >= activeRange.start && x.age <= activeRange.end);
}, [activeRange, sajuResult.yearlySeun]);

  // ✅ 대운 리스트 (항상 훅은 리턴보다 먼저)
  const myDaewoon = useMemo(() => {
  if (!birthYear || !birthMonth || !birthDay) return [];
  return getDaewoonList(birthYear, birthMonth, birthDay, gender);
}, [birthYear, birthMonth, birthDay, gender]);

// 오늘 기준 만 나이 계산
function getCurrentAge(y: number, m: number, d: number) {
  const today = new Date();
  let age = today.getFullYear() - y;
  const hasNotHadBirthday =
    today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d);
  if (hasNotHadBirthday) age -= 1;
  return age;
}

  // 2) 그 다음 렌더 분기
  const isDataReady =
    !!sajuResult?.day && !!sajuResult?.month && !!sajuResult?.year && !!sajuResult?.hour;

  if (!isDataReady) {
    console.warn("❗ sajuResult 데이터가 준비되지 않았습니다:", sajuResult);
    return <p className="text-sm text-gray-500">사주 데이터 로딩 중...</p>;
  }

 // ✅ pillars 한번에
 const pillars = {
   year:  { sky: sajuResult.year.sky  as GanKey, ground: sajuResult.year.ground  as JiKey },
   month: { sky: sajuResult.month.sky as GanKey, ground: sajuResult.month.ground as JiKey },
   day:   { sky: sajuResult.day.sky   as GanKey, ground: sajuResult.day.ground   as JiKey },
   hour:  { sky: sajuResult.hour.sky  as GanKey, ground: sajuResult.hour.ground  as JiKey },
 };

 // ✅ 단계별 결과 받기 (stages: true)
 const {
   rawElements,              // 원본(무보정)
   chohuPalaceElements,      // 조후+궁성 반영
   baseElements,             // ↑와 동일(호환 키)
   adjustedElements,         // 합·충 반영 후
 } = calculateElementDistribution(pillars, {
   applyChohu, applyPalace, applyUnions, stages: true,
 });

const rawForChart = (rawElements ?? baseElements) as Record<ElementType, number>;
const chohuForChart = (chohuPalaceElements ?? baseElements) as Record<ElementType, number>;

function summarizeElements(data: Record<ElementType, number>) {
  const vals = Object.values(data);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const keys = Object.keys(data) as ElementType[];
  const dominants = keys.filter(k => data[k] === max);
  const weaks     = keys.filter(k => data[k] === min);
  return { dominants, weaks };
}

function formatWithPct(
  data: Record<ElementType, number>,
  keys: ElementType[]
) {
  const total = Object.values(data).reduce((a,b)=>a+b, 0) || 1;
  return keys.map(k => `${k} ${Math.round((data[k] / total) * 100)}%`).join(", ");
}

// 🔎 세 단계 요약
const { dominants: domRaw,   weaks: weakRaw }   = summarizeElements(rawForChart);
const { dominants: domCP,    weaks: weakCP }    = summarizeElements(chohuForChart); // CP = Chohu+Palace
const { dominants: domAdj,   weaks: weakAdj }   = summarizeElements(adjustedElements);

// 대운 안내용 메타
const startAge = myDaewoon[0]?.age ?? sajuResult.daewoonPeriod;

// 순/역행 텍스트 (연간 음양 + 성별)
const yangStems: GanKey[] = ["갑","병","무","경","임"];
const isYangYearStem = yangStems.includes(sajuResult.year.sky as GanKey);
const isMale  = gender === "남성";
const forwardTxt = (isYangYearStem && isMale) || (!isYangYearStem && !isMale) ? "순행" : "역행";
const scoreInput = buildScoreInput(sajuResult, "테스트");
const scoreResult = calculateScore(scoreInput);

  return (
    <section>
       {/* 📌 점수 표시 영역 */}
      <ScoreBadge score={scoreResult.total} userName={userName} />

      <hr className="my-4 border-t border-gray-300" />
{/* 📌 1. 사주의 기본 구조 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-1. 사주의 기본 구조</h3>
<p className="mb-4 text-sm text-gray-700 leading-relaxed">
  사주는 내가 태어난 <strong>연도, 월, 날짜, 시간</strong> 네 가지 정보로 만들어져요.
  <br />
  그래서 흔히 &ldquo;네 개의 기둥&rdquo;이라고 부르는데, 이를 각각 <b>연주 · 월주 · 일주 · 시주</b>라고 해요.
  <br /><br />
  간단히 말하면,
  <br />- 연주 👉 나의 뿌리와 조상, 인생관
  <br />- 월주 👉 부모, 형제, 사회성
  <br />- 일주 👉 나 자신과 배우자, 감정
  <br />- 시주 👉 자녀, 미래, 지향점
  <br /><br />
  즉, 사주는 <b>나와 가족, 그리고 앞으로의 삶</b>을 담고 있는 <span className="underline">인생 지도</span>라고 보면 돼요 ✨
  <br /><br />
  사주는 동양철학을 바탕으로 만들어졌어요.  <br />
  기본 원리는 <b>&ldquo;부족하거나 과하면 좋지 않다&rdquo;</b>는 것이고,  <br />
  <b>음양과 오행의 균형</b>을 맞추는 것을 중요하게 여깁니다.  
  <br /><br />
  그래서 올해의 운세든, 결혼운이든 결국은  
  내 사주에서 <b>부족한 부분을 채워주는 해(혹은 배우자)</b>,  <br/>
  또는 <b>과한 부분을 눌러주는 해(혹은 배우자)</b>를 찾는 것이  
  사주 풀이의 핵심이라고 할 수 있어요.
</p>

<hr className="my-4 border-t border-gray-300" />

{/* 📌 1-3. 나의 일주 성향 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-3. 나의 일주 성향</h3>
<p className="text-sm text-left text-gray-700 mt-2">
  사주에서는 특히 &ldquo;일간(日干)&rdquo;이 중요한데, 쉽게 말해 <b>나 자신을 상징하는 기운</b>이에요.
</p>
<div className="text-center mt-4">
  <span className="text-3xl text-gray-700 align-top inline-block">“</span>
  {userName}님은{" "}
  <strong>{skyDescriptions[daySky] || "아직 설명이 준비되지 않았어요 😅"}</strong>
  <span className="text-3xl text-gray-700 align-top inline-block">”</span>
</div>
<p className="text-sm text-gray-600 mt-2 text-center">
  → 즉, {userName}님은 태어날 때부터 이런 기운을 가지고 세상에 나온 거예요 🌱
</p>

<hr className="my-4 border-t border-gray-300" />

{/* 📌 3. 나의 일주 동물 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-4. 나의 일주 동물</h3>
<div className="mt-6 w-full flex flex-col items-center">
  <div
    className={`w-32 h-32 rounded-full border-4 flex items-center justify-center overflow-hidden ${elementColors[dayElement]}`}
  >
    <Image
      src={animalData.imageUrl}
      alt="Saju Animal"
      width={128}
      height={128}
      className="w-full h-full object-contain"
    />
  </div>
  <p className="text-black-900 text-lg font-bold mt-2">{animalData.animal}</p>

  <p className="text-sm text-left text-gray-700 mt-6 w-full break-words">
    {userName}님의 일주는 <b>{daySky}{dayGround}일주</b>이고, 이를 동물로 비유하면{" "}
    <b>{animalData.animal}</b>이에요 🐾
    <br /><br />
    사주는 다섯 가지 기운(오행: 나무·불·흙·금속·물)과 12지 동물이 함께 어우러져서 만들어지는데,
    이 조합 덕분에 나만의 &ldquo;캐릭터&rdquo;가 생기는 거예요.
    <br />
    예를 들어 같은 말이라도, 붉은 말 🔥과 흰 말 ⚪️은 성향이 완전히 다르답니다!
  </p>
</div>

<hr className="my-4 border-t border-gray-300" />

{/* 📌 2. 내 사주의 오행 분포 */}
<h2 className="text-lg font-bold mb-3">2. 내 사주의 오행</h2>
<p className="text-sm text-gray-700 leading-relaxed mt-2">
  사주는 다섯 가지 기운, 즉 <b>목(木), 화(火), 토(土), 금(金), 수(水)</b>로 이루어져 있어요.  
  도넛 모양의 차트는 지금 {userName}님의 사주에서 어떤 기운이 많고, 어떤 기운이 부족한지를 한눈에 보여주는 거예요.  
  쉽게 말하면, 나에게는 어떤 에너지가 넘치고, 또 어떤 에너지를 보충해야 하는지 확인하는 도구라고 생각하면 돼요.
</p>

<p className="text-sm text-gray-700 leading-relaxed mt-2">
  아래의 체크박스를 눌러보면 조금씩 다른 해석이 적용돼요:
  <br />- <b>조후</b>: 계절에 따른 기운의 균형을 맞추는 보정이에요.
  <br />- <b>궁성 가중</b>: 사주의 핵심 별자리 같은 부분을 강조해주는 해석이에요.
  <br />- <b>합·충</b>: 기운들이 서로 만나서 힘을 합치거나, 충돌하는 관계를 반영한 거예요.
</p>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 2-1. 현재 사주의 오행 분포 (도넛) */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 2-1. 현재 사주의 오행 분포</h3>
      <p className="text-sm text-gray-700 leading-relaxed mt-2">
        아래 옵션은 사주 해석에 영향을 주는 추가 설정이에요. <br /> 깊게 보지 않아도 되고 나에게는 어떤 오행이 많구나, 부족하구나를 알고 넘어가면 됩니다. <br />
        가장 많은 오행은 도넛 차트 중앙에 표시되니 참고하세요! <br /><br />
        현재 {userName}님의 사주에서 오행은 다음과 같이 분포되어 있어요: </p>
{/* 옵션 토글 */}
<div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-slate-700">
  <label className="inline-flex items-center gap-1">
    <input type="checkbox" checked={applyChohu} onChange={e=>setApplyChohu(e.target.checked)} />
    조후
  </label>
  <label className="inline-flex items-center gap-1">
    <input type="checkbox" checked={applyPalace} onChange={e=>setApplyPalace(e.target.checked)} />
    궁성 가중
  </label>
  <label className="inline-flex items-center gap-1">
    <input type="checkbox" checked={applyUnions} onChange={e=>setApplyUnions(e.target.checked)} />
    합·충
  </label>
</div>

{/* 도넛 3개 + 화살표 2개 */}
<div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
  <DonutChart title="원 사주" data={rawForChart} titleClassName="mt-6" />
  <div className="hidden sm:flex items-center justify-center px-1">
    <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300">
      <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>

  <DonutChart title="조후+궁성 보정 후" data={chohuForChart} titleClassName="mt-6" />
  <div className="hidden sm:flex items-center justify-center px-1">
    <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300">
      <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>

  <DonutChart title="합·충 보정 후" data={adjustedElements} titleClassName="mt-6" />
</div>


{/* 단계별 강/약 요약 */}
<div className="mt-3 grid gap-2 text-[12px] text-slate-600 md:grid-cols-3">
 <p>
    <b className="text-slate-800">현재 사주</b>에서는{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(rawForChart, domRaw)}</span> 기운이 강하고,{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(rawForChart, weakRaw)}</span> 기운이 부족해요.
  </p>
  <p>
    <b className="text-slate-800">조후+궁성 보정 후</b>에는{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(chohuForChart, domCP)}</span> 기운이 두드러지고,{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(chohuForChart, weakCP)}</span> 기운이 약해요.
  </p>
  <p>
    <b className="text-slate-800">합·충 적용 후</b>에는{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(adjustedElements, domAdj)}</span> 기운이 강하고,{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(adjustedElements, weakAdj)}</span> 기운이 상대적으로 부족해요.
  </p>
</div>

      <hr className="my-4 border-t border-gray-300" />

 {/* 📌 3. 대운 */}
 <h2 className="text-lg font-bold mb-3">3. 내 사주의 대운과 십이운성</h2>

      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 3-1. 나의 대운</h3>
     <p className="text-sm text-left text-gray-700 leading-relaxed">
  &ldquo;대운&rdquo;이란, <b>10년마다 바뀌는 큰 흐름의 운세</b>예요.  
  쉽게 말해, 인생의 긴 계절 같은 거죠 🍂🌸☀️❄️  <br />
  어떤 시기에는 불 같은 열정이 강조되고, 또 어떤 시기에는 물처럼 차분한 기운이 흐르기도 해요.  
  <br />
  <br />
  {myDaewoon.length ? (
    <>
      {userName}님은 <b>{startAge}세</b>부터 대운이 시작되며, 
      현재 흐름은 <span className="text-slate-500">{forwardTxt}</span> 방향으로 흘러가고 있어요.
    </>
  ) : (
    `${userName}님의 대운 시작 정보를 계산하지 못했습니다.`
  )}
</p>

{/* 대운 가로 스크롤 카드 – 최종 정리 */}
<div className="relative">
  {/* 좌/우 페이드 */}
  <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white/60 to-transparent rounded-l-xl" />
  <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white/60 to-transparent rounded-r-xl" />

  {(() => {
    // 한 번만 계산
    const currentAge = getCurrentAge(birthYear!, birthMonth!, birthDay!);

    return (
      <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide snap-x snap-mandatory">
        {myDaewoon.map((item) => {
          const gan = (item.pillarGan ?? item.pillar?.[0]) as GanKey;
          const ji  = (item.pillarJi  ?? item.pillar?.[1]) as JiKey;
          const elGan = getElement(gan) as ElementType;
          const elJi  = getElement(ji)  as ElementType;

          const isNow = currentAge >= item.age && currentAge < item.age + 10;
          // 🔴 옵션 B: activeRange를 진짜 사용
          const isSelected = activeRange ? item.age === activeRange.start : false;

          const cls = `snap-start shrink-0 w-[88px] md:w-[96px] rounded-xl
            bg-white/80 p-2 border shadow-sm text-center transition-all
            ${isSelected ? "ring-2 ring-rose-500 border-transparent scale-[1.02]"
                         : isNow     ? "ring-2 ring-indigo-400 border-transparent"
                                     : "border-slate-200 hover:border-slate-300"}`;

          return (
            <button
              key={item.age}
              type="button"
              className={cls}
              // 카드 클릭 → activeRange와 activeAge 모두 갱신
              onClick={() => {
                setActiveRange({ start: item.age, end: item.age + 9 });
                setActiveAge(item.age);
              }}
              aria-pressed={isSelected}
              title={`${item.age}~${item.age + 9}세 대운`}
            >

              <div className="text-[12px] font-semibold text-slate-900">
                {item.age}세
              </div>
              <div className="text-[11px] text-slate-500">{item.year}년</div>

              <div className="mt-1 grid grid-cols-1 gap-1">
                <span className={`px-1 py-0.5 rounded-md text-[13px] ${PILL_STYLES[elGan]}`}>{gan}</span>
                <span className={`px-1 py-0.5 rounded-md text-[13px] ${PILL_STYLES[elJi]}`}>{ji}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  })()}
</div>

{/* 연도별 세운 캐러셀 (대운과 연동) */}
<div className="mt-3">
  <YearlySeunCarousel
  data={yearlySeunForView}
  activeAge={activeAge}
  daewoonStartAge={startAge}
  onSelect={(age) => {
    setActiveAge(age);
    setActiveRange(getDaewoonBucket(startAge, age));
  }}
  // 👇 추가
  showTenGod
  tenGodOfGan={tenGodOfGan}
  tenGodOfJi={tenGodOfJi}
  size="xs"
  verticalPill
/>
</div>

      <hr className="my-4 border-t border-gray-300" />


{/* 📌 2-3. 십이운성 및 신살 */}
<h3 className="text-sm font-bold text-gray-700 mt-6">📌 3-2. 나의 십이운성</h3>
<p className="text-sm text-left text-gray-700 leading-relaxed mb-4">
  &ldquo;십이운성&rdquo;은 사람의 인생을 12단계 성장 스토리로 본 거예요.  
  <br />
  <b>태어나고 → 자라고 → 꽃피우고 → 쉬는</b> 흐름처럼,  
  내 사주가 어느 단계에 있는지를 보여주죠.    
</p>

<div className="grid grid-cols-4 gap-3 mt-4">
  {/* 시주 */}
  <div className="p-3 border rounded-lg bg-white/70 shadow-sm text-center">
    <p className="text-sm font-semibold text-slate-800">시주<br/>(미래·지향점)</p>
    <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-1.5 py-0.5 rounded mt-2">
      {sajuResult.twelveFortunes.hour}
    </span>
    <p className="text-xs text-gray-700 mt-2">
      {twelveFortunesDescriptions[sajuResult.twelveFortunes.hour]}
    </p>
  </div>

  {/* 일주 */}
  <div className="p-3 border rounded-lg bg-white/70 shadow-sm text-center">
    <p className="text-sm font-semibold text-slate-800">일주<br/>(나 자신·전환점)</p>
    <span className="inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-1.5 py-0.5 rounded mt-2">
      {sajuResult.twelveFortunes.day}
    </span>
    <p className="text-xs text-gray-700 mt-2">
      {twelveFortunesDescriptions[sajuResult.twelveFortunes.day]}
    </p>
  </div>

  {/* 월주 */}
  <div className="p-3 border rounded-lg bg-white/70 shadow-sm text-center">
    <p className="text-sm font-semibold text-slate-800">월주<br/>(사회성·직업)</p>
    <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-1.5 py-0.5 rounded mt-2">
      {sajuResult.twelveFortunes.month}
    </span>
    <p className="text-xs text-gray-700 mt-2">
      {twelveFortunesDescriptions[sajuResult.twelveFortunes.month]}
    </p>
  </div>

  {/* 년주 */}
  <div className="p-3 border rounded-lg bg-white/70 shadow-sm text-center">
    <p className="text-sm font-semibold text-slate-800">년주<br/>(과거·뿌리)</p>
    <span className="inline-block bg-rose-100 text-rose-700 text-xs font-semibold px-1.5 py-0.5 rounded mt-2">
      {sajuResult.twelveFortunes.year}
    </span>
    <p className="text-xs text-gray-700 mt-2">
      {twelveFortunesDescriptions[sajuResult.twelveFortunes.year]}
    </p>
  </div>
</div>

      <hr className="my-4 border-t border-gray-300" />


    </section>
  );
}