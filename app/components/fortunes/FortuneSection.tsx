"use client";
import React from "react";
import { SajuResultType } from "@/app/types/sajuTypes";

// 📌 각 테마별 컴포넌트 import
import LoveFortune from "./LoveFortune";
import CareerFortune from "./CareerFortune";
import MoneyFortune from "./MoneyFortune";
import HealthFortune from "./HealthFortune";
import StudyFortune from "./StudyFortune";

type ExtendedSajuResult = SajuResultType & {
  elementCount?: Record<string, number>;
  yinYangCount?: { yin: number; yang: number };
  bigLuck?: { sky: string; ground: string }[];
};

export interface FortuneSectionProps {
  sajuResult: ExtendedSajuResult;
  theme: "love" | "career" | "money" | "health" | "study";
}

export default function FortuneSection({ sajuResult, theme }: FortuneSectionProps) {
  if (!sajuResult) return null;

  switch (theme) {
    case "love":
      return <LoveFortune sajuResult={sajuResult} />;
    case "career":
      return <CareerFortune sajuResult={sajuResult} />;
    case "money":
      return <MoneyFortune sajuResult={sajuResult} />;
    case "health":
      return <HealthFortune sajuResult={sajuResult} />;
    case "study":
      return <StudyFortune sajuResult={sajuResult} />;
    default:
      return null;
  }
}
