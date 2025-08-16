"use client";
import React from "react";
import { SajuResultType, normalizeGender, DaewoonItem } from "@/app/types/sajuTypes";
import { sajuData } from "@/app/components/SajuExplanation/data";

type ExtendedSajuResult = SajuResultType & {
  elementCount?: Record<string, number>;
  yinYangCount?: { yin: number; yang: number };
};

export interface MoneyFortuneProps {
  sajuResult: ExtendedSajuResult;
}

export default function MoneyFortune({ sajuResult }: MoneyFortuneProps) {
  if (!sajuResult || !sajuResult.day?.sky) {
    return <div>재물운 정보를 불러올 수 없습니다.</div>;
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

  // ✅ 대운 리스트
  const daewoonList: DaewoonItem[] = sajuResult.daewoonList || [];

  // --- ① 기본 운세: sajuData 기반 ---
  const data = sajuData?.[dayMaster]?.[gender];
  const moneyText = data?.재물운?.replace(/{userName}/g, userName) ?? "";

  // --- ② 심화 운세: sajuResult 기반 ---
  let deepAnalysis = "";

  // 음양 균형 → 소비·저축 성향
  if (yinYangCount.yang > yinYangCount.yin) {
    deepAnalysis += "양 기운이 많아 도전적인 투자 성향이 강하며, 적극적으로 재물을 불리는 성향이 있습니다.\n";
  } else {
    deepAnalysis += "음 기운이 많아 안정적이고 보수적인 재물 관리 성향을 보입니다.\n";
  }

  // 오행 해석 → 재물과 연결
  const weakestElement = Object.entries(elementCounts).sort((a, b) => a[1] - b[1])[0];
  if (weakestElement) {
    deepAnalysis += `${weakestElement[0]} 기운이 부족해 재물 흐름에서 이 오행과 연관된 시기에는 주의가 필요합니다.\n`;
  }

  // 대운 해석
  if (daewoonList.length > 1) {
    const nextLuck = daewoonList[1];
    deepAnalysis += `특히 ${nextLuck.year}년(${nextLuck.pillar}) 대운 시기에는 재물운이 상승할 가능성이 큽니다.\n`;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-black">
      {/* ✅ ① 기본 운세 */}
      <h3 className="text-xl font-bold mb-3">💰 재물운 (기본 해석)</h3>
      {moneyText && <p className="whitespace-pre-line mb-4">{moneyText}</p>}

      {/* ✅ ② 심화 운세 */}
      <h3 className="text-lg font-bold mt-6">📊 심화 해석 (사주 기반)</h3>
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
