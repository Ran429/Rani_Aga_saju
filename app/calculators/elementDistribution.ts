import { fiveElements } from "../constants/elements";
import { heavenlyUnion, earthlyUnion, earthlyConflict } from "../constants/unions";
import { GanKey, JiKey } from "../utils/elementUtils";

type ElementType = "목" | "화" | "토" | "금" | "수";

interface Pillar {
  sky: GanKey;
  ground: JiKey;
}

export const calculateElementDistribution = (saju: {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}) => {
  const baseElements: Record<ElementType, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  let adjustedElements: Record<ElementType, number> = { ...baseElements };
  const occurredUnions: string[] = [];
  const occurredConflicts: string[] = [];

  const pillars: Pillar[] = [saju.year, saju.month, saju.day, saju.hour].map(p => ({ ...p }));
  const adjustedPillars: Pillar[] = pillars.map(p => ({ ...p }));

  const grounds: JiKey[] = pillars.map(p => p.ground);
  const usedChars = new Set<string>();

  // 1. 기본 오행 카운트
  pillars.forEach(({ sky, ground }) => {
    const skyEl = fiveElements[sky as GanKey];
    const groundEl = fiveElements[ground as JiKey];
    if (skyEl) baseElements[skyEl as ElementType] += 1;
    if (groundEl) baseElements[groundEl as ElementType] += 1;
  });
  adjustedElements = { ...baseElements };

  // 2. 천간합
  pillars.forEach(({ sky }, idx) => {
    const pair = heavenlyUnion[sky as GanKey];
    if (
      pair &&
      !usedChars.has(sky) &&
      !usedChars.has(pair) &&
      pillars.some(p => p.sky === pair)
    ) {
      occurredUnions.push(`${sky}+${pair}(천간합)`);
      const fromEl = fiveElements[sky as GanKey];
      const toEl = fiveElements[pair as GanKey];
      if (fromEl && adjustedElements[fromEl as ElementType] > 0) adjustedElements[fromEl as ElementType] -= 1;
      if (toEl) adjustedElements[toEl as ElementType] += 1;
      adjustedPillars[idx].sky = pair as GanKey;
      usedChars.add(sky);
      usedChars.add(pair);
    }
  });

  // 3. 지지합
  pillars.forEach(({ ground }, idx) => {
    const pair = earthlyUnion[ground as JiKey];
    if (
      pair &&
      !usedChars.has(ground) &&
      !usedChars.has(pair) &&
      grounds.includes(pair as JiKey)
    ) {
      occurredUnions.push(`${ground}+${pair}(지지합)`);
      const fromEl = fiveElements[ground as JiKey];
      const toEl = fiveElements[pair as JiKey];
      if (fromEl && adjustedElements[fromEl as ElementType] > 0) adjustedElements[fromEl as ElementType] -= 1;
      if (toEl) adjustedElements[toEl as ElementType] += 1;
      adjustedPillars[idx].ground = pair as JiKey;
      usedChars.add(ground);
      usedChars.add(pair);
    }
  });

  // 4. 지지충
  pillars.forEach(({ ground }) => {
    const pair = earthlyConflict[ground as JiKey];
    if (
      pair &&
      !usedChars.has(ground) &&
      !usedChars.has(pair) &&
      grounds.includes(pair as JiKey)
    ) {
      occurredConflicts.push(`${ground}↔${pair}(지지충)`);
      const el1 = fiveElements[ground as JiKey];
      const el2 = fiveElements[pair as JiKey];
      if (el1 && adjustedElements[el1 as ElementType] > 0) adjustedElements[el1 as ElementType] -= 1;
      if (el2 && adjustedElements[el2 as ElementType] > 0) adjustedElements[el2 as ElementType] -= 1;
      usedChars.add(ground);
      usedChars.add(pair);
    }
  });

  // 5. 음수 방지
  (Object.keys(adjustedElements) as ElementType[]).forEach(key => {
    if (adjustedElements[key] < 0) adjustedElements[key] = 0;
  });

  return { baseElements, adjustedElements, occurredUnions, occurredConflicts, adjustedPillars };
};