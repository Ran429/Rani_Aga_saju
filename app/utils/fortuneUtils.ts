/**
 * 📄 app/utils/fortuneUtils.ts
 * 역할: 공통 유틸 함수 모음
 * exports: calculateTwelveFortunes
 * imports: ../constants/elements, ./elementUtils
 * referenced by: app/calculators/sajuCalculator.ts
 */
// src/utils/fortuneUtils.ts
import { twelveJi } from "../constants/elements";
import { GanKey, JiKey } from "./elementUtils";

/**
 * 십이운성 순서
 */
const twelveFortunesOrder = [
  "장생", "목욕", "관대", "건록", "제왕",
  "쇠", "병", "사", "묘", "절", "태", "양"
] as const;
type TwelveFortuneName = typeof twelveFortunesOrder[number];

const ganStartMap: Record<GanKey, { start: JiKey; forward: boolean }> = {
  "갑": { start: "해", forward: true },
  "을": { start: "오", forward: false },
  "병": { start: "인", forward: true },
  "정": { start: "신", forward: false },
  "무": { start: "인", forward: true },
  "기": { start: "신", forward: false },
  "경": { start: "사", forward: true },
  "신": { start: "자", forward: false },
  "임": { start: "신", forward: true },
  "계": { start: "묘", forward: false },
};

export const calculateTwelveFortunes = (
  daySky: GanKey,
  ground: JiKey
): TwelveFortuneName => {
  const { start, forward } = ganStartMap[daySky];
  const startIndex = twelveJi.indexOf(start);
  const targetIndex = twelveJi.indexOf(ground);
  if (startIndex === -1 || targetIndex === -1) return "장생";

  const distance = forward
    ? (targetIndex - startIndex + 12) % 12
    : (startIndex - targetIndex + 12) % 12;

  return twelveFortunesOrder[distance];
};

export const twelveFortunesDescriptions: Record<string, string> = {  장생: "새로운 시작, 갓 태어난 아기의 단계 👶",
  목욕: "깨끗이 씻고 세상에 나서는 단계 🛁",
  관대: "청년기, 사회적으로 활발히 활동하는 시기 💪",
  건록: "안정과 기반을 갖춘 단계 🏡",
  제왕: "정점에 올라 힘이 강한 시기 👑",
  쇠: "기운이 조금씩 줄어드는 단계 🍂",
  병: "몸이 아프듯 약해지는 시기 🤒",
  사: "죽음을 맞이하는 단계 ⚰️",
  묘: "무덤에 들어간 상태, 휴식의 시기 🪦",
  절: "다시 태어나기 전, 끊어짐의 단계 ✂️",
  태: "씨앗처럼 새로운 생명의 시작 🌱",
  양: "태아가 자라나는 시기 🤰",
};
