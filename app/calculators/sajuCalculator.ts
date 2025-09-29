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
import { calculateTwelveFortunes, checkDeukryeong, checkDeukji, checkDeukse, determineYongsins } from "../utils/fortuneUtils";
import { checkSpecialGodsAll } from "../utils/specialGodsUtils";
import { checkGoodGodsAll } from "../utils/goodGodsUtils";
import { buildYearlySeun } from "../utils/dateUtils";
import { FourPillars, IlganStrength } from "../types/sajuTypes";

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



const isDeukryeong = checkDeukryeong(dayPillar.sky, monthPillar.ground);
  const isDeukji = checkDeukji(dayPillar.sky, dayPillar.ground);
  const isDeukse = checkDeukse(baseTenGods);
  
  // 일간을 극하는 십신 (재성, 관성, 식상) 합계
  const oppositionCount = (baseTenGods["정재"] ?? 0) + (baseTenGods["편재"] ?? 0) + 
                          (baseTenGods["정관"] ?? 0) + (baseTenGods["편관"] ?? 0) +
                          (baseTenGods["식신"] ?? 0) + (baseTenGods["상관"] ?? 0);
  
  let strengthScore = 0;
  if (isDeukryeong) strengthScore += 10;
  if (isDeukji) strengthScore += 6;
  if (isDeukse) strengthScore += 4;
  
  // 일간을 극하는 힘이 강할수록 점수 감점 (예시: 6개 중 5개 이상일 때 5점 감점)
  if (oppositionCount >= 5) strengthScore -= 3; 
  
  let ilganStrength: IlganStrength;
  
  // 8단계 분류 적용 (위의 예시 점수 기준)
  if (strengthScore >= 19) {
    ilganStrength = "극왕";
  } else if (strengthScore >= 15) {
    ilganStrength = "태강";
  } else if (strengthScore >= 10) {
    ilganStrength = "신강";
  } else if (strengthScore >= 6) {
    ilganStrength = "중화신강";
  } else if (strengthScore >= 3) {
    ilganStrength = "중화신약";
  } else if (strengthScore >= 0) {
    ilganStrength = "신약";
  } else if (strengthScore >= -4) {
    ilganStrength = "태약";
  } else {
    ilganStrength = "극약";
  }
  
  const strengthCheck = { deukryeong: isDeukryeong, deukji: isDeukji, deukse: isDeukse };
  const yongsinElements = determineYongsins(
    dayPillar.sky, 
    ilganStrength, 
    baseElements // 오행 분포 기반으로 용신 결정
);

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
    ilganStrength,
    strengthCheck,
    yongsinElements,
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
    ilganStrength,
    strengthCheck,
    yongsinElements,
    score: scoreResult // ← 점수도 같이 반환
  };
};
