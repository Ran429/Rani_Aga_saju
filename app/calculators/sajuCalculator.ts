/**
 * 📄 app/calculators/sajuCalculator.ts
 * 역할: 사주 계산 관련 주요 로직
 * exports: getSaju
 * imports: ../utils/dateUtils, ../utils/elementUtils, ./elementDistribution, ../utils/daewoonUtils, ../utils/fortuneUtils, ../utils/specialGodsUtils, ../utils/goodGodsUtils, ../types/sajuTypes, ./scoreInputBuilder, ./scoreCalculator
 * referenced by: app/page.tsx
 */
import {
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateHourPillar,
} from "../utils/dateUtils";

import { getTenGod, GanKey, JiKey, getHiddenStems } from "../utils/elementUtils";
import { calculateElementDistribution } from "./elementDistribution";
import { calculateDaewoonPeriod, getDaewoonList } from "../utils/daewoonUtils";
import { calculateTwelveFortunes } from "../utils/fortuneUtils";
import { checkSpecialGodsAll } from "../utils/specialGodsUtils";
import { checkGoodGodsAll } from "../utils/goodGodsUtils";
import { buildYearlySeun } from "../utils/dateUtils";
import { FourPillars } from "../types/sajuTypes";

// 점수 관련 추가
import { buildScoreInput } from "./scoreInputBuilder";
import { calculate_score_with_limits } from "./scoreCalculator";

type TenGodType =
  | "알 수 없음"
  | "비견"
  | "겁재"
  | "식신"
  | "상관"
  | "정재"
  | "편재"
  | "정관"
  | "편관"
  | "정인"
  | "편인";

type TenGodCount = Record<TenGodType, number>;

const initTenGods = (): TenGodCount => ({
  "알 수 없음": 0,
  비견: 0,
  겁재: 0,
  식신: 0,
  상관: 0,
  정재: 0,
  편재: 0,
  정관: 0,
  편관: 0,
  정인: 0,
  편인: 0,
});

export const getSaju = (
  birthDate: string,
  birthTime: string,
  gender: string,
  name: string
) => {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const yearPillar: { sky: GanKey; ground: JiKey } = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month, day);
  const dayPillar: { sky: GanKey; ground: JiKey } = calculateDayPillar(year, month, day);
  const hourPillar: { sky: GanKey; ground: JiKey } = calculateHourPillar(dayPillar.sky, birthTime);

  // 지장간 십성 계산
  const calcTenGodGround = (ground: JiKey) => {
    const hiddenStems = getHiddenStems(ground);
    if (hiddenStems.length === 0) return "알 수 없음";
    return hiddenStems.map(stem => getTenGod(dayPillar.sky, stem)).join("/");
  };

  const saju = {
    year: {
      ...yearPillar,
      tenGodSky: getTenGod(dayPillar.sky, yearPillar.sky),
      tenGodGround: calcTenGodGround(yearPillar.ground),
    },
    month: {
      ...monthPillar,
      tenGodSky: getTenGod(dayPillar.sky, monthPillar.sky),
      tenGodGround: calcTenGodGround(monthPillar.ground),
    },
    day: {
      ...dayPillar,
      tenGodSky: getTenGod(dayPillar.sky, dayPillar.sky),
      tenGodGround: calcTenGodGround(dayPillar.ground),
    },
    hour: {
      ...hourPillar,
      tenGodSky: getTenGod(dayPillar.sky, hourPillar.sky),
      tenGodGround: calcTenGodGround(hourPillar.ground),
    },
  };

  const {
    baseElements,
    adjustedElements,
    occurredUnions,
    occurredConflicts,
    adjustedPillars,
  } = calculateElementDistribution(saju, { stages: true });

  const baseTenGods = initTenGods();
  const adjustedTenGods = initTenGods();

  // base
  [saju.year, saju.month, saju.day, saju.hour].forEach((p) => {
    baseTenGods[getTenGod(dayPillar.sky, p.sky) as TenGodType] += 1;
    const main = getHiddenStems(p.ground)[0];
    if (main) baseTenGods[getTenGod(dayPillar.sky, main) as TenGodType] += 1;
  });

  // adjusted
  adjustedPillars.forEach((p: { sky: GanKey; ground: JiKey }) => {
    adjustedTenGods[getTenGod(dayPillar.sky, p.sky) as TenGodType] += 1;
    const main = getHiddenStems(p.ground)[0];
    if (main) adjustedTenGods[getTenGod(dayPillar.sky, main) as TenGodType] += 1;
  });

  const daewoonPeriod = calculateDaewoonPeriod(year, month, day, gender);
  const daewoonList = getDaewoonList(year, month, day, gender);
  const yearlySeun = buildYearlySeun(year, 101);

  const twelveFortunes = {
    year: calculateTwelveFortunes(dayPillar.sky, yearPillar.ground),
    month: calculateTwelveFortunes(dayPillar.sky, monthPillar.ground),
    day: calculateTwelveFortunes(dayPillar.sky, dayPillar.ground),
    hour: calculateTwelveFortunes(dayPillar.sky, hourPillar.ground),
  };

  const pillars: FourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };

  const specialGods = checkSpecialGodsAll(pillars, {
    baekhoMode: "dayOnly",
    dohwaMode: "four",
    yeokmaMode: "strict",
    pairWonjin: false,
  });

  const goodGods = checkGoodGodsAll(pillars);

  const scoreInput = buildScoreInput({
    year: saju.year,
    month: saju.month,
    day: saju.day,
    hour: saju.hour,
    baseElements,
    adjustedElements,
    baseTenGods,
    adjustedTenGods,
    occurredUnions,
    occurredConflicts,
    specialGods,
    goodGods,
    twelveFortunes,
    daewoonList,
    daewoonPeriod,
    yearlySeun,
  }, name);
  const scoreResult = calculate_score_with_limits(scoreInput);

  return {
    ...saju,
    baseElements,
    adjustedElements,
    baseTenGods,
    adjustedTenGods,
    occurredUnions,
    occurredConflicts,
    daewoonPeriod,
    daewoonList,
    twelveFortunes,
    specialGods,
    goodGods,
    yearlySeun,
    score: scoreResult // ← 점수도 같이 반환
  };
};
