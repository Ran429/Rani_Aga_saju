import React from 'react';
import Image from 'next/image';
import { getElement, GanKey } from '../../utils/elementUtils';
import { BasicStructureProps } from "@/app/types/sajuTypes";
import { sajuData } from "./data"; 

type ElementType = "목" | "화" | "토" | "금" | "수";

// ✅ 색상 맵 (ElementType으로 타입 안전)
const elementColors: Record<ElementType, string> = {
  목: 'bg-white border-green-400',
  화: 'bg-white border-red-400',
  토: 'bg-white border-yellow-400',
  금: 'bg-white border-gray-400',
  수: 'bg-white border-blue-400'
};

// ✅ 천간 비유 설명
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
  계: "맑은 시냇물처럼 부드럽고, 상황에 맞게 흐르는 유연함을 가집니다."
};

// ✅ 동물/이미지 매핑
const getAnimalAndColor = (
  dayElement: ElementType,
  dayGround: string
): { animal: string; imageUrl: string } => {
  const animals: Record<string, string> = {
    자: '쥐', 축: '소', 인: '호랑이', 묘: '토끼', 진: '용',
    사: '뱀', 오: '말', 미: '양', 신: '원숭이', 유: '닭',
    술: '개', 해: '돼지'
  };

  const imageUrls: Record<string, string> = {
    쥐: 'https://i.imgur.com/NfTjvBa.png',
    소: 'https://i.imgur.com/2fHObII.png',
    호랑이: 'https://i.imgur.com/IRIcKUF.png',
    토끼: 'https://i.imgur.com/Wm7lhe5.png',
    용: 'https://i.imgur.com/llBGs3f.png',
    뱀: 'https://i.imgur.com/RFM4Je5.png',
    말: 'https://i.imgur.com/PmdwrW2.png',
    양: 'https://i.imgur.com/n5tWHdW.png',
    원숭이: 'https://i.imgur.com/wiRHpFx.png',
    닭: 'https://i.imgur.com/IakoWOf.png',
    개: 'https://i.imgur.com/O71tkpw.png',
    돼지: 'https://i.imgur.com/oaT9OTj.png'
  };

  const colorPrefix: Record<ElementType, string> = {
    목: '푸른 ', 화: '붉은 ', 토: '노란 ', 금: '흰 ', 수: '검은 '
  };

  const animal = animals[dayGround] ?? '미확인 동물';
  const imageUrl = imageUrls[animal] ?? '';

  return { animal: `${colorPrefix[dayElement]}${animal}`, imageUrl };
};

export default function BasicStructure({
  userName,
  sajuResult,
  sanitizedExplanation
}: BasicStructureProps) {
  const isDataReady =
    !!sajuResult?.day &&
    !!sajuResult?.month &&
    !!sajuResult?.year &&
    !!sajuResult?.hour;

  if (!isDataReady) {
    console.warn('❗ sajuResult 데이터가 준비되지 않았습니다:', sajuResult);
    return <p className="text-sm text-gray-500">사주 데이터 로딩 중...</p>;
  }

  const daySky = sajuResult.day.sky as GanKey;
  const dayGround = sajuResult.day.ground;
  const dayElement = getElement(daySky) as ElementType;

  const animalData = getAnimalAndColor(dayElement, dayGround);

  // ✅ 퍼센트 계산
  const safePercentage = (value: number, total: number): string =>
    total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

  const totalBase = Object.values(sajuResult.baseElements).reduce((a, b) => a + b, 0);
  const totalAdjusted = Object.values(sajuResult.adjustedElements).reduce((a, b) => a + b, 0);

  const dominantElement = Object.keys(sajuResult.adjustedElements).reduce((a, b) =>
    sajuResult.adjustedElements[a as ElementType] > sajuResult.adjustedElements[b as ElementType]
      ? a
      : b
  );

  const minCount = Math.min(...Object.values(sajuResult.adjustedElements));
  const weakElements = Object.keys(sajuResult.adjustedElements).filter(
    (k) => sajuResult.adjustedElements[k as ElementType] === minCount
  );

  return (
    <section>
      {/* 📌 1. 사주의 기본 구성 */}
      <h2 className="text-lg font-bold mb-3">📌 1. 사주의 기본 구성</h2>
      <p className="mb-4 text-sm text-gray-700 leading-relaxed">
        사주는 태어난 <strong>연(年)·월(月)·일(日)·시(時)</strong>를 바탕으로 네 개의 기둥으로 구성됩니다.  <br />
        상단의 표의 가로를 보면, <strong>연&ldquo;주&rdquo;, 월&ldquo;주&rdquo;, 일&ldquo;주&rdquo;, 시&ldquo;주&rdquo;</strong>라고 되어있는 부분이 그것이죠! <br />
        또, 세로로 보면 <strong>천간(天干)</strong>과 <strong>지지(地支)</strong>로 이루어져 있으며, <br />
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
        {userName}님은 <strong>{skyDescriptions[daySky] || "특별한 비유 설명이 준비되지 않았습니다."}</strong>
        <span className="text-3xl text-gray-700 align-top inline-block">”</span>
      </div>
      {/* 📌 1-1. 인생운 출력 */}
      <div className="text-sm text-left text-gray-700 mt-4 w-full break-words">
        {
          sajuData[sajuResult.day.sky]?.[sajuResult.userInfo?.gender as "남성" | "여성"]?.인생운
            ? sajuData[sajuResult.day.sky][sajuResult.userInfo?.gender as "남성" | "여성"]
                .인생운!.replace("{userName}", userName)
            : "인생운 데이터가 준비되지 않았습니다."
        }
      </div>
      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-1. 각 기둥의 의미 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-1. 사주에서 각 기둥의 의미</h3>
      <p className="text-sm text-left text-gray-700">
        <span>① 년주 → 조상과 인생관</span><br />
        <span>② 월주 → 부모, 형제, 사회성</span><br />
        <span>③ 일주 → 배우자궁, 감정관, 나 자신</span><br />
        <span>④ 시주 → 자식, 미래, 지향점</span><br />
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
          <span className="font-bold">{animalData.animal}</span>입니다.<br />
          먼저, {userName}님의 일주는 {daySky}{dayGround}일주 였죠? 😊<br />
          사주는 다섯 가지 요소(오행: 목, 화, 토, 금, 수)로 구성되어 있어요.<br />
          오행 중에서 일간인 &ldquo;<strong>{daySky}</strong>&rdquo;는{" "}
          <strong>{dayElement}</strong> 속성이며,<br />
          일지인 &ldquo;<strong>{dayGround}</strong>&rdquo;의 동물과 조합되면{" "}
          <span className="font-bold">{animalData.animal}</span>이 됩니다.<br />
          그렇다면, 나와 같은 일주 동물을 가진 사람들은 어떤 성향을 가지고 있을까요? ✨
        </p>
      </div>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-3. 오행 분포 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-3. 현재 사주의 오행 분포</h3>
      {(Object.keys(sajuResult.baseElements) as ElementType[]).map((el) => (
        <div key={el} className="text-sm text-left">
          {el}: {sajuResult.baseElements[el]} ({safePercentage(sajuResult.baseElements[el], totalBase)}%)
          {" → "}
          {sajuResult.adjustedElements[el]} ({safePercentage(sajuResult.adjustedElements[el], totalAdjusted)}%)
        </div>
      ))}
      <p className="mt-2 text-sm">
        현재 사주에서는 <span className="font-bold">{dominantElement}</span> 기운이 강하며,
        <span className="font-bold">{weakElements.join(', ')}</span> 기운이 부족합니다.
      </p>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-4. 대운 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-4. 나의 대운</h3>
      <p className="text-sm text-left text-gray-700">
        대운은 10년 주기로 변화하는 운세입니다. {userName}님의 경우, {sajuResult.daewoonPeriod}세부터 시작됩니다.
      </p>
      {sajuResult.daewoonList.map((item) => (
        <span key={item.age} className="block">🔹 {item.age}세 ({item.year}년) → {item.pillar}</span>
      ))}

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-5. 십이운성 및 신살 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-5. 나의 십이운성 및 신살</h3>
      <p className="text-sm text-left text-gray-700">
        🔹 올해의 십이운성: {sajuResult.twelveFortunes.year}<br />
        🔹 월주의 십이운성: {sajuResult.twelveFortunes.month}<br />
        🔹 일주의 십이운성: {sajuResult.twelveFortunes.day}<br />
        🔹 시주의 십이운성: {sajuResult.twelveFortunes.hour}
      </p>

      <hr className="my-4 border-t border-gray-300" />

      {/* 📌 1-6. 일주 해석 */}
      <h3 className="text-sm font-bold text-gray-700 mt-6">📌 1-6. {daySky}{dayGround} 일주의 해석</h3>
      <p className="text-sm text-left text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizedExplanation }}></p>
    </section>
  );
}