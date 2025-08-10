import { tenKan, twelveJi } from "../constants/elements";

// constants 기반 타입
export type GanJiKey = typeof tenKan[number]; // '갑' | '을' | ...
export type TwelveJiKey = typeof twelveJi[number]; // '자' | '축' | ...

type Pillar = { sky: GanJiKey; ground: TwelveJiKey };

export const calculateYearPillar = (
  year: number,
  month: number,
  day: number
): Pillar => {
  const adjustedYear = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  return {
    sky: tenKan[(adjustedYear + 6) % 10] as GanJiKey,
    ground: twelveJi[(adjustedYear + 8) % 12] as TwelveJiKey
  };
};

export const calculateMonthPillar = (
  year: number,
  month: number
): Pillar => {
  const adjustedYear = month < 2 ? year - 1 : year;
  const yearSkyIndex = (adjustedYear + 6) % 10;
  const monthSkyIndex = (yearSkyIndex * 2 + month) % 10;
  const monthGroundIndex = month % 12;

  return {
    sky: tenKan[monthSkyIndex] as GanJiKey,
    ground: twelveJi[monthGroundIndex] as TwelveJiKey
  };
};

export const calculateDayPillar = (
  year: number,
  month: number,
  day: number
): Pillar => {
  if (month === 1 || month === 2) {
    year -= 1;
    month += 12;
  }

  const baseDate = new Date(1936, 1, 12); // 기준일: 갑자일
  const targetDate = new Date(year, month - 1, day);
  const elapsedDays = Math.floor(
    (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    sky: tenKan[(elapsedDays % 10 + 10) % 10] as GanJiKey,
    ground: twelveJi[(elapsedDays % 12 + 12) % 12] as TwelveJiKey
  };
};

export const calculateHourPillar = (
  daySky: GanJiKey,
  timeStr: string
): Pillar => {
  const timeToJiMap: TwelveJiKey[] = [
    "자", "축", "인", "묘", "진", "사",
    "오", "미", "신", "유", "술", "해"
  ];
  const [hour] = timeStr.split(":").map(Number);
  const timeIndex = Math.floor(hour / 2) % 12;

  const hourGanStart: Record<GanJiKey, number> = {
    "갑": 0, "기": 0,
    "을": 2, "경": 2,
    "병": 4, "신": 4,
    "정": 6, "임": 6,
    "무": 8, "계": 8
  };

  const hourSkyIndex = (hourGanStart[daySky] + timeIndex) % 10;

  return {
    sky: tenKan[hourSkyIndex] as GanJiKey,
    ground: timeToJiMap[timeIndex]
  };
};

export const getCurrentYearGanji = (year: number): `${GanJiKey}${TwelveJiKey}` => {
  return `${tenKan[(year + 6) % 10]}${twelveJi[(year + 8) % 12]}` as `${GanJiKey}${TwelveJiKey}`;
};