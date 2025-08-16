/**
 * 📄 app/components/SajuExplanation/BasicStructure.tsx
 * 역할: UI 컴포넌트 (React)
 * imports: react, next/image, @/app/utils/elementUtils, @/app/calculators/elementDistribution, @/app/utils/daewoonUtils, @/app/types/sajuTypes, @/app/types/sajuTypes, ./data, @/app/calculators/scoreInputBuilder, @/app/calculators/scoreCalculator
 * referenced by: app/page.tsx
 */
// app/components/SajuExplanation/BasicStructure.tsx
import React, { useMemo, useState, useEffect } from "react";

import Image from "next/image";
import { getElement, GanKey, JiKey } from "@/app/utils/elementUtils";
import { calculateElementDistribution } from "@/app/calculators/elementDistribution";

import { getDaewoonList } from "@/app/utils/daewoonUtils";
import type { BasicStructureProps } from "@/app/types/sajuTypes"; // 이미 있다면 유지
import { splitBirthDate, normalizeGender, type Gender } from "@/app/types/sajuTypes";
import { sajuData } from "./data";

import { buildScoreInput } from "@/app/calculators/scoreInputBuilder";
import { calculate_score_with_limits as calculateScore } from "@/app/calculators/scoreCalculator";

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


export default function BasicStructure({
  userName,
  sajuResult,
  sanitizedExplanation,
}: BasicStructureProps) {
  // 1) 먼저 필요한 계산/훅들을 "항상" 호출
  const daySky = sajuResult.day.sky as GanKey;
  const dayGround = sajuResult.day.ground;
  const dayElement = getElement(daySky) as ElementType;

  const animalData = getAnimalAndColor(dayElement, dayGround);


  // ✅ birthDate 문자열 → 연/월/일 안전 파싱 (birthYear/Month/Day가 없을 때 대비)
  const { year: birthYear, month: birthMonth, day: birthDay } = splitBirthDate(sajuResult.userInfo);
  const gender: Gender = normalizeGender(sajuResult.userInfo?.gender);

  // ✅ 옵션 토글 (조후 / 궁성가중 / 합·충)
 const [applyChohu, setApplyChohu] = useState(true);
 const [applyPalace, setApplyPalace] = useState(true);
 const [applyUnions, setApplyUnions] = useState(true);

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
      <hr className="my-4 border-t border-gray-300" />

       {/* 📌 점수 표시 영역 */}
      <ScoreBadge score={scoreResult.total} userName={userName} />

      <hr className="my-4 border-t border-gray-300" />
      {/* 📌 1. 사주의 기본 구성 */}
      <h2 className="text-lg font-bold mb-3">📌 1. 사주의 기본 구성</h2>
      <p className="mb-4 text-sm text-gray-700 leading-relaxed">
        사주는 태어난 <strong>연(年)·월(月)·일(日)·시(時)</strong>를 바탕으로 네 개의 기둥으로 구성됩니다.
        <br />
        상단의 표의 가로를 보면, <strong>연“주”, 월“주”, 일“주”, 시“주”</strong>라고 되어있는 부분이 그것이죠!
        <br />
        또, 세로로 보면 <strong>천간(天干)</strong>과 <strong>지지(地支)</strong>로 이루어져 있으며,
        <br />
        이 조합이 한 사람의 타고난 성향과 평생의 운세 흐름을 형성합니다.
      </p>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-2. 일지 설명 */}
      <p className="text-sm text-left text-gray-700 mt-6 w-full break-words">
        내 사주를 비유하면 무엇일까요? <br />
        아마 사주를 한 번이라도 보러 가셨다면, 이런 말을 들어보셨을걸요? <br />
      </p>
      <div className="text-center mt-2">
        <span className="text-3xl text-gray-700 align-top inline-block">“</span>
        {userName}님은{" "}
        <strong>{skyDescriptions[daySky] || "특별한 비유 설명이 준비되지 않았습니다."}</strong>
        <span className="text-3xl text-gray-700 align-top inline-block">”</span>
      </div>

      {/* 📌 1-1. 인생운 출력 */}
      <div className="text-sm text-left text-gray-700 mt-4 w-full break-words">
        {sajuData[sajuResult.day.sky]?.[
          (sajuResult.userInfo?.gender as "남성" | "여성") ?? "남성"
        ]?.인생운
          ? sajuData[sajuResult.day.sky][
              (sajuResult.userInfo?.gender as "남성" | "여성") ?? "남성"
            ].인생운!.replace("{userName}", userName)
          : "인생운 데이터가 준비되지 않았습니다."}
      </div>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-1. 각 기둥의 의미 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-1. 사주에서 각 기둥의 의미</h3>
      <p className="text-sm text-left text-gray-700">
        <span>① 년주 → 조상과 인생관</span>
        <br />
        <span>② 월주 → 부모, 형제, 사회성</span>
        <br />
        <span>③ 일주 → 배우자궁, 감정관, 나 자신</span>
        <br />
        <span>④ 시주 → 자식, 미래, 지향점</span>
        <br />
      </p>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-2. 나의 일주 동물 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-2. 나의 일주 동물</h3>
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

        {/* 📌 일주동물 설명 */}
        <p className="text-sm text-left text-gray-700 mt-6 w-full break-words">
          <span className="font-bold">{userName}</span>님의 일주 동물은{" "}
          <span className="font-bold">{animalData.animal}</span>입니다.
          <br />
          먼저, {userName}님의 일주는 {daySky}
          {dayGround}일주였죠? 😊
          <br />
          사주는 다섯 가지 요소(오행: 목, 화, 토, 금, 수)로 구성되어 있어요.
          <br />
          오행 중에서 일간인 “<strong>{daySky}</strong>”는 <strong>{dayElement}</strong> 속성이며,
          <br />
          일지인 “<strong>{dayGround}</strong>”의 동물과 조합되면{" "}
          <span className="font-bold">{animalData.animal}</span>이 됩니다.
          <br />
          그렇다면, 나와 같은 일주 동물을 가진 사람들은 어떤 성향을 가지고 있을까요? ✨
        </p>
      </div>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-3. 현재 사주의 오행 분포 (도넛) */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-3. 현재 사주의 오행 분포</h3>
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
    <span className="font-semibold text-slate-800">{formatWithPct(rawForChart, domRaw)}</span> 기운이 강하며,
    <span className="font-semibold text-slate-800"> {formatWithPct(rawForChart, weakRaw)}</span> 기운이 부족합니다.
  </p>
  <p>
    <b className="text-slate-800">조후+궁성 보정 후</b>에서는{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(chohuForChart, domCP)}</span> 기운이 강하며,
    <span className="font-semibold text-slate-800"> {formatWithPct(chohuForChart, weakCP)}</span> 기운이 부족합니다.
  </p>
  <p>
    <b className="text-slate-800">합·충 적용 후</b>에는{" "}
    <span className="font-semibold text-slate-800">{formatWithPct(adjustedElements, domAdj)}</span> 기운이 강하며,
    <span className="font-semibold text-slate-800"> {formatWithPct(adjustedElements, weakAdj)}</span> 기운이 부족합니다.
  </p>
</div>
      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-4. 대운 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-4. 나의 대운</h3>
      <p className="text-sm text-left text-gray-700">
  대운은 10년 주기로 변화하는 운세입니다.&nbsp;
  {myDaewoon.length ? (
    <>
      {userName}님은 <b>{startAge}세</b>부터 시작(
      <span className="text-slate-500">{forwardTxt}</span>)합니다.
    </>
  ) : (
    `${userName}님의 대운 시작 정보를 계산하지 못했습니다.`
  )}
</p>


{/* 그리드 카드형 대운 */}
<div className="mt-3 flex flex-wrap justify-center gap-1.5">
  {myDaewoon.map((item) => {
   // ✅ daewoonUtils.getDaewoonList가 돌려준 대운 간지 사용
   const gan = (item.pillarGan ?? item.pillar?.[0]) as GanKey;
   const ji  = (item.pillarJi  ?? item.pillar?.[1]) as JiKey;
   const elGan = getElement(gan) as ElementType;
   const elJi  = getElement(ji)  as ElementType;

    const currAge = getCurrentAge(birthYear!, birthMonth!, birthDay!);
    const isActive = currAge >= item.age && currAge < item.age + 10;

    return (
      <div
        key={item.age}
        className={[
          "w-[72px] sm:w-[52px] rounded-lg  bg-white/70 p-1.5 border shadow-sm",
          "leading-tight", // 세로 밀도 ↑
          isActive ? "ring-2 ring-rose-500 border-transparent" : "border-slate-200",
        ].join(" ")}
      >
        <div className="text-center text-[13px] font-semibold text-slate-900">{item.age}세</div>
        <div className="text-center text-[12px] text-slate-500">{item.year}년</div>

        {/* 임 / 오 → 세로 배치 */}
        <div className="mt-1 flex flex-col gap-1">
          <span className={`text-center px-1 py-0.5 rounded-md text-[13px] ${PILL_STYLES[elGan]}`}>{gan}</span>
          <span className={`text-center px-1 py-0.5 rounded-md text-[13px] ${PILL_STYLES[elJi]}`}>{ji}</span>
        </div>
      </div>
    );
  })}
</div>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-5. 십이운성 및 신살 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-5. 나의 십이운성 및 신살</h3>
      <p className="text-sm text-left text-gray-700">
        🔹 연주의 십이운성: {sajuResult.twelveFortunes.year}
        <br />
        🔹 월주의 십이운성: {sajuResult.twelveFortunes.month}
        <br />
        🔹 일주의 십이운성: {sajuResult.twelveFortunes.day}
        <br />
        🔹 시주의 십이운성: {sajuResult.twelveFortunes.hour}
      </p>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-6. 일주 해석 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">
        📌 1-6. {daySky}
        {dayGround} 일주의 해석
      </h3>
      <p
        className="text-sm text-left text-gray-700"
        dangerouslySetInnerHTML={{ __html: sanitizedExplanation }}
      />
    </section>
  );
}