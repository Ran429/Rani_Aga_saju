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
import type { BasicStructureProps } from "@/app/types/sajuTypes";
import { splitBirthDate, normalizeGender, type Gender } from "@/app/types/sajuTypes";
import { buildScoreInput } from "@/app/calculators/scoreInputBuilder";
import { calculate_score_with_limits as calculateScore } from "@/app/calculators/scoreCalculator";
import { twelveFortunesDescriptions } from "@/app/utils/fortuneUtils";
import DaewoonYearMonthPanel from "@/app/components/fortunes/DaewoonYearMonthPanel";
import ElementDistributionPanel from "./ElementDistributionPanel";


// ---------------- 타입/상수 ----------------
type ElementType = "목" | "화" | "토" | "금" | "수";

const elementColors: Record<ElementType, string> = {
  목: "bg-white border-green-400",
  화: "bg-white border-red-400",
  토: "bg-white border-yellow-400",
  금: "bg-white border-gray-400",
  수: "bg-white border-blue-400",
};

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

const getAnimalAndColor = (dayElement: ElementType, dayGround: string) => {
  const animals: Record<string, string> = {
    자: "쥐", 축: "소", 인: "호랑이", 묘: "토끼", 진: "용", 사: "뱀",
    오: "말", 미: "양", 신: "원숭이", 유: "닭", 술: "개", 해: "돼지",
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
    목: "푸른 ", 화: "붉은 ", 토: "노란 ", 금: "흰 ", 수: "검은 ",
  };
  const animal = animals[dayGround] ?? "미확인 동물";
  const imageUrl = imageUrls[animal] ?? "";
  return { animal: `${colorPrefix[dayElement]}${animal}`, imageUrl };
};

// ---------------- 점수 뱃지 ----------------
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

// ---------------- 메인 컴포넌트 ----------------
export default function BasicStructure({ userName, sajuResult }: BasicStructureProps) {
  const daySky = sajuResult.day.sky as GanKey;
  const dayGround = sajuResult.day.ground;
  const dayElement = getElement(daySky) as ElementType;
  const animalData = getAnimalAndColor(dayElement, dayGround);

  const { year: birthYear, month: birthMonth, day: birthDay } = splitBirthDate(sajuResult.userInfo);
  const gender: Gender = normalizeGender(sajuResult.userInfo?.gender);

  const pillars = {
    year:  { sky: sajuResult.year.sky as GanKey, ground: sajuResult.year.ground as JiKey },
    month: { sky: sajuResult.month.sky as GanKey, ground: sajuResult.month.ground as JiKey },
    day:   { sky: sajuResult.day.sky as GanKey, ground: sajuResult.day.ground as JiKey },
    hour:  { sky: sajuResult.hour.sky as GanKey, ground: sajuResult.hour.ground as JiKey },
  };

 const emptyDist: Record<ElementType, number> = {
  목: 0,
  화: 0,
  토: 0,
  금: 0,
  수: 0,
};

const {
  rawElements = emptyDist,
  chohuPalaceElements = emptyDist,
  adjustedElements = emptyDist,
} = calculateElementDistribution(pillars, { stages: true }) ?? {};

  const myDaewoon = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return [];
    return getDaewoonList(birthYear, birthMonth, birthDay, gender);
  }, [birthYear, birthMonth, birthDay, gender]);

  const isDataReady = !!sajuResult?.day && !!sajuResult?.month && !!sajuResult?.year && !!sajuResult?.hour;
  if (!isDataReady) {
    return <p className="text-sm text-gray-500">사주 데이터 로딩 중...</p>;
  }

  const startAge = myDaewoon[0]?.age ?? sajuResult.daewoonPeriod;
  const yangStems: GanKey[] = ["갑", "병", "무", "경", "임"];
  const isYangYearStem = yangStems.includes(sajuResult.year.sky as GanKey);
  const isMale = gender === "남성";
  const forwardTxt = (isYangYearStem && isMale) || (!isYangYearStem && !isMale) ? "순행" : "역행";
  const scoreInput = buildScoreInput(sajuResult, "테스트");
  const scoreResult = calculateScore(scoreInput);

  return (
    <section>
      {/* 점수 */}
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
    사주는 다섯 가지 기운(오행: 나무·불·흙·금속·물)과 12지 동물이 함께 어우러져서 만들어지는데,<br />
    이 조합 덕분에 나만의 &ldquo;캐릭터&rdquo;가 생기는 거예요.
    <br />
    예를 들어 같은 말이라도, 붉은 말 🔥과 흰 말 ⚪️은 성향이 완전히 다르답니다!
  </p>
</div>

<hr className="my-4 border-t border-gray-300" />

{/* 📌 2. 내 사주의 오행 분포 */}
<h2 className="text-lg font-bold mb-3">2. 내 사주의 오행</h2>
<p className="text-sm text-gray-700 leading-relaxed mt-2">
  사주는 다섯 가지 기운, 즉 <b>목(木), 화(火), 토(土), 금(金), 수(水)</b>로 이루어져 있어요.  <br />
  도넛 모양의 차트는 지금 {userName}님의 사주에서 어떤 기운이 많고, <br />어떤 기운이 부족한지를 한눈에 보여주는 거예요.  <br />
  쉽게 말하면, 나에게는 어떤 에너지가 넘치고, 또 어떤 에너지를 보충해야 하는지 확인하는 도구라고 생각하면 돼요.<br />
</p>
{/* 📌 2-1. 현재 사주의 오행 분포 */}
<h3 className="text-sm font-bold text-gray-700 mt-6">📌 2-1. 현재 사주의 오행 분포</h3>
<p className="text-sm text-gray-700 leading-relaxed mt-2">
  현재 {userName}님의 사주에서 오행은 다음과 같이 분포되어 있어요: 
</p>

<p className="text-sm text-gray-700 leading-relaxed mt-2">
  깊게 보지 않아도 되고 나에게는 어떤 오행이 많구나, 부족하구나를 알고 넘어가면 됩니다. <br />

  <br />- <b>조후</b>: 계절에 따른 기운의 균형을 맞추는 보정이에요.
  <br />- <b>궁성 가중</b>: 사주의 핵심 별자리 같은 부분을 강조해주는 해석이에요.
  <br />- <b>합·충</b>: 기운들이 서로 만나서 힘을 합치거나, 충돌하는 관계를 반영한 거예요.<br /><br />
  가장 많은 오행은 도넛 차트 중앙에 표시되니 참고하세요! <br /><br />
</p>

<ElementDistributionPanel
        rawElements={rawElements}
        chohuPalaceElements={chohuPalaceElements}
        adjustedElements={adjustedElements}
        dayElement={dayElement}
      />

{/* 📌 3. 대운 */}
<h2 className="text-lg font-bold mb-3">3. 내 사주의 대운과 십이운성</h2>

<h3 className="text-sm font-bold text-gray-700 mt-6">📌 3-1. 나의 대운</h3>
<p className="text-sm text-left text-gray-700 leading-relaxed">
  &ldquo;대운&rdquo;이란, <b>10년마다 바뀌는 큰 흐름의 운세</b>예요.  
  쉽게 말해, 인생의 긴 계절 같은 거죠 🍂🌸☀️❄️  
  <br />
  어떤 시기에는 불 같은 열정이 강조되고,  
  또 어떤 시기에는 물처럼 차분한 기운이 흐르기도 해요.  
  <br />
  <br />
  {myDaewoon.length ? (
    <>
      {userName}님은 <b>{startAge}세</b>부터 대운이 시작되며,  
      현재 흐름은 <span className="text-slate-500">{forwardTxt}</span> 방향으로 흘러가고 있어요. <br />
      직접 클릭해 보면서 각 대운의 시작 나이와 기운을 확인해 보세요!
    </>
  ) : (
    `${userName}님의 대운 시작 정보를 계산하지 못했습니다.`
  )}
</p>

{/* 대운 + 연운 + 월운 패널 */}
<div className="mt-4">
  <DaewoonYearMonthPanel
    daewoon={myDaewoon}
    yearlySeun={sajuResult.yearlySeun}
    startAge={startAge}
    birth={{ year: birthYear!, month: birthMonth!, day: birthDay! }}
    daySky={daySky}
    size="xs"
    verticalPill
    showRangeText
    showArrows
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