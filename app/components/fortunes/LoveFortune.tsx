"use client";
import React from "react";
import { SajuResultType, normalizeGender, DaewoonItem } from "@/app/types/sajuTypes";
import { sajuData } from "@/app/components/SajuExplanation/data";

type ExtendedSajuResult = SajuResultType & {
  elementCount?: Record<string, number>;
  yinYangCount?: { yin: number; yang: number };
};

export interface LoveFortuneProps {
  sajuResult: ExtendedSajuResult;
}

export default function LoveFortune({ sajuResult }: LoveFortuneProps) {
  if (!sajuResult || !sajuResult.day?.sky) {
    return <div>연애운 정보를 불러올 수 없습니다.</div>;
  }

  // --- 기본 데이터 준비 ---
  const user = sajuResult.userInfo;
  const userName = user?.name ?? "당신";
  const gender = normalizeGender(user?.gender);
  const dayMaster = sajuResult.day.sky;

  const elementCounts = sajuResult.elementCount || {};
  const yinYangCount = sajuResult.yinYangCount || { yin: 0, yang: 0 };

  const pillars = {
    year: `${sajuResult.year.sky}${sajuResult.year.ground}`,
    month: `${sajuResult.month.sky}${sajuResult.month.ground}`,
    day: `${sajuResult.day.sky}${sajuResult.day.ground}`,
    hour: `${sajuResult.hour.sky}${sajuResult.hour.ground}`,
  };

  // ✅ 대운 리스트 (daewoonList 활용)
  const daewoonList: DaewoonItem[] = sajuResult.daewoonList || [];

  // --- ① 기본 운세: sajuData 기반 ---
  const data = sajuData?.[dayMaster]?.[gender];
  const loveText = data?.연애운?.replace(/{userName}/g, userName) ?? "";
  const matchText = data?.궁합운?.replace(/{userName}/g, userName) ?? "";

  // --- ② 심화 운세: sajuResult 기반 ---
  let deepAnalysis = "";
  if (yinYangCount.yang > yinYangCount.yin) {
    deepAnalysis += "양 기운이 강해 열정적이고 직선적인 연애 스타일을 보일 가능성이 있습니다.\n";
  } else {
    deepAnalysis += "음 기운이 강해 차분하고 신중한 연애 경향을 보일 수 있습니다.\n";
  }

  const weakestElement = Object.entries(elementCounts).sort((a, b) => a[1] - b[1])[0];
  if (weakestElement) {
    deepAnalysis += `${weakestElement[0]} 기운이 부족하여 이 오행이 강해지는 해에 인연운이 상승할 수 있습니다.\n`;
  }

  // ✅ 다음 대운 예시
  if (daewoonList.length > 1) {
    const nextLuck = daewoonList[1];
    deepAnalysis += `특히 ${nextLuck.year}년(${nextLuck.pillar}) 대운 시기에는 새로운 인연을 만날 가능성이 높습니다.\n`;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-black">
      {/* ✅ ① 기본 운세 */}
      <h3 className="text-xl font-bold mb-3">💕 연애 & 궁합운 (기본 해석)</h3>
      {loveText && <p className="whitespace-pre-line mb-4">{loveText}</p>}
      {matchText && <p className="whitespace-pre-line mb-4">{matchText}</p>}

      {/* ✅ ② 심화 운세 */}
      <h3 className="text-lg font-bold mt-6">💖 심화 해석 (사주 기반)</h3>
      <p className="whitespace-pre-line">{deepAnalysis}</p>

      {/* 🔖 참고 정보 */}
      <div className="mt-4 text-sm text-gray-600">
        <p>📌 사주 기둥: {pillars.year}(년), {pillars.month}(월), {pillars.day}(일), {pillars.hour}(시)</p>
        <p>📌 음양 분포: 양 {yinYangCount.yang}, 음 {yinYangCount.yin}</p>
        <p>
          📌 오행 분포:{" "}
          {Object.entries(elementCounts)
            .map(([el, cnt]) => `${el}:${cnt}`)
            .join(", ")}
        </p>
      </div>
    </div>
  );
}
