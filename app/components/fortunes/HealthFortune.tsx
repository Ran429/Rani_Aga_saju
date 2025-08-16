"use client";
import React from "react";
import { SajuResultType, normalizeGender, DaewoonItem } from "@/app/types/sajuTypes";
import { sajuData } from "@/app/components/SajuExplanation/data";

type ExtendedSajuResult = SajuResultType & {
  elementCount?: Record<string, number>;
  yinYangCount?: { yin: number; yang: number };
};

export interface HealthFortuneProps {
  sajuResult: ExtendedSajuResult;
}

export default function HealthFortune({ sajuResult }: HealthFortuneProps) {
  if (!sajuResult || !sajuResult.day?.sky) {
    return <div>건강운 정보를 불러올 수 없습니다.</div>;
  }

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

  const daewoonList: DaewoonItem[] = sajuResult.daewoonList || [];

  // --- ① 기본 해석: sajuData 기반 ---
  const data = sajuData?.[dayMaster]?.[gender];
  const healthText = data?.건강운?.replace(/{userName}/g, userName) ?? "";

  // --- ② 심화 해석 ---
  let deepAnalysis = "";

  if (yinYangCount.yang > yinYangCount.yin) {
    deepAnalysis += "양 기운이 강해 활동적이지만 과로와 열성 질환에 주의해야 합니다.\n";
  } else {
    deepAnalysis += "음 기운이 강해 체력이 약하고 소화기·면역계 관리가 필요합니다.\n";
  }

  const weakestElement = Object.entries(elementCounts).sort((a, b) => a[1] - b[1])[0];
  if (weakestElement) {
    deepAnalysis += `${weakestElement[0]} 기운이 부족해 해당 장부(臟腑)에 관련된 건강 관리가 필요합니다.\n`;
  }

  if (daewoonList.length > 1) {
    const nextLuck = daewoonList[1];
    deepAnalysis += `특히 ${nextLuck.year}년(${nextLuck.pillar}) 대운 시기에는 건강 변동이 클 수 있습니다.\n`;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-black">
      <h3 className="text-xl font-bold mb-3">🩺 건강운 (기본 해석)</h3>
      {healthText && <p className="whitespace-pre-line mb-4">{healthText}</p>}

      <h3 className="text-lg font-bold mt-6">📊 심화 해석 (사주 기반)</h3>
      <p className="whitespace-pre-line">{deepAnalysis}</p>

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
