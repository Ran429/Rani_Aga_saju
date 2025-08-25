// C:\Users\zeroj\saju\Rani_Aga_saju\app\utils\dateUtils.ts
import { tenKan, twelveJi } from "../constants/elements";
import { solarTerms } from "../constants/solarTerms";

/** 절기 항목 타입 */
type SolarTerm = { month: number; day: number; name?: string };

/** ─────────────────────────────
 *  타입 & 공통 유틸
 *  ──────────────────────────── */
export type GanKey = (typeof tenKan)[number];   // '갑' | '을' | ...
export type JiKey  = (typeof twelveJi)[number]; // '자' | '축' | ...
export type Gender = "남성" | "여성";
export type DaewoonItem = {
  age: number;
  year: number;
  pillar: `${GanKey}${JiKey}`;
};

export const getCurrentYearGanji = (year: number): `${GanKey}${JiKey}` => {
  const { sky, ground } = calculateYearPillar(year, 7, 15);
  return `${sky}${ground}` as `${GanKey}${JiKey}`;
};

type Pillar = { sky: GanKey; ground: JiKey };

const asGan = (i: number) => tenKan[(i % 10 + 10) % 10] as GanKey;
const asJi  = (i: number) => twelveJi[(i % 12 + 12) % 12] as JiKey;

const toUTCDate = (y: number, m1to12: number, d: number) =>
  Date.UTC(y, m1to12 - 1, d); // UTC 기준 타임존 영향 제거

/** ─────────────────────────────
 *  연주(연간지)
 *  - 입춘(2/4) 이전은 전년도 처리
 *  - (year+6)%10, (year+8)%12 공식 유지
 *  ──────────────────────────── */
export const calculateYearPillar = (
  year: number,
  month: number,
  day: number
): Pillar => {
  const adjustedYear = month < 2 || (month === 2 && day < 4) ? year - 1 : year;
  return {
    sky: asGan(adjustedYear + 6),
    ground: asJi(adjustedYear + 8),
  };
};

/** ─────────────────────────────
 *  월주(월간지)
 *  핵심 포인트
 *   1) 지지: 절기 기준으로 寅월이 시작(보통 양력 2월이 寅월 역할)
 *      → 간단 근사: (month+10)%12 로 寅(2월) 정렬
 *         - 2월→寅, 3월→卯, ..., 1월→丑
 *   2) 천간: 연간(해의 천간)에 따라 寅월의 천간 시작점이 다름
 *      - 甲/己年: 寅월 丙 시작
 *      - 乙/庚年: 寅월 戊 시작
 *      - 丙/辛年: 寅월 庚 시작
 *      - 丁/壬年: 寅월 壬 시작
 *      - 戊/癸年: 寅월 甲 시작
 *     이후 월이 하나 진행될 때마다 천간도 +1
 *  ──────────────────────────── */
export const calculateMonthPillar = (
  year: number,
  month: number,
  day: number =15
): Pillar => {
  const beforeIpchun = month === 2 && day < 4;
  const solarYear = month < 2 || beforeIpchun ? year - 1 : year;
    // 2) 대상 날짜 (보정된 '절기년' 안의 실제 날짜)
  const target = new Date(year, month - 1, day);

    // 3) 해당 절기년의 12절기 시작일(월지 경계) 생성
  //    - solarTerms는 각 월의 시작 절기(입춘, 경칩, 청명, ..., 소한)를 12개 담고 있다고 가정
  //    - 1월 항목은 다음 해로 넘어가므로 solarYear+1로 생성 (getDaewoonStartAge와 동일 규칙)
  const monthStarts = (solarTerms as SolarTerm[]).map(t => {
    const y = t.month === 1 ? solarYear + 1 : solarYear;
    return new Date(y, t.month - 1, t.day);
  });

  // 4) 타깃 날짜가 속한 "마지막 경계" 찾기 (해당 절기년에서)
  //    입춘(2월)부터 순서대로 0..11 => 0=寅, 1=卯, ..., 11=丑
  let idx = 0;
  for (let i = 0; i < monthStarts.length; i++) {
    if (monthStarts[i].getTime() <= target.getTime()) idx = i;
    else break;
  }

  // 5) 지지(월지) & 천간(월간)
  const IN_OFFSET = twelveJi.indexOf("인"); // 보통 2
  const ground = asJi(IN_OFFSET + idx);

  // 연간의 천간으로 寅월의 시작 천간 결정
  const yearSky = asGan(solarYear + 6);
  const startStemIndexByYearStem: Record<GanKey, number> = {
    갑: 2, 기: 2,  // 丙
    을: 4, 경: 4,  // 戊
    병: 6, 신: 6,  // 庚
    정: 8, 임: 8,  // 壬
    무: 0, 계: 0,  // 甲
  };
  const sky = asGan(startStemIndexByYearStem[yearSky] + idx); // 寅월을 0으로 두고 +idx

  return { sky, ground };
};


/** ─────────────────────────────
 *  일주(일간지)
 *  - 기준 갑자일(anchor)로부터 경과일수로 계산
 *  - 시간대/서머타임 영향을 피하려 UTC로 계산
 *  - anchor는 현재 코드와 호환되게 유지 (1936-02-12, 갑자일)
 *  ──────────────────────────── */
export const calculateDayPillar = (
  year: number,
  month: number,
  day: number
): Pillar => {
  // 1,2월의 전년도 처리(전통식 보정) – 기존 로직 유지
  if (month === 1 || month === 2) {
    year -= 1;
    month += 12;
  }

  const baseUTC   = Date.UTC(1936, 1, 12); // 1936-02-12 (UTC)
  const targetUTC = toUTCDate(year, month, day);

  const elapsedDays = Math.floor((targetUTC - baseUTC) / (1000 * 60 * 60 * 24));
  return {
    sky: asGan(elapsedDays),
    ground: asJi(elapsedDays),
  };
};

/** ─────────────────────────────
 *  시주(시간 간지)
 *  - 23:00~00:59 = 子시, 01:00~02:59 = 丑시 ...
 *  - 시의 천간 시작점: 일간 기준 5그룹 규칙(갑기/을경/병신/정임/무계)
 *  ──────────────────────────── */
export const calculateHourPillar = (
  daySky: GanKey,
  timeStr: string
): Pillar => {
  // 23~00:59 => 0(子), 01~02:59 => 1(丑) ...
  const [h] = timeStr.split(":").map(Number);
  const timeIndex = Math.floor(((h + 1) % 24) / 2); // 0~11

  const timeToJiMap: JiKey[] = [
    "자", "축", "인", "묘", "진", "사",
    "오", "미", "신", "유", "술", "해",
  ];

  // 일간별 子시의 천간 시작 인덱스
  const hourGanStart: Record<GanKey, number> = {
    갑: 0, 기: 0,  // 甲
    을: 2, 경: 2,  // 丙
    병: 4, 신: 4,  // 戊
    정: 6, 임: 6,  // 庚
    무: 8, 계: 8,  // 壬
  };
  const sky = asGan(hourGanStart[daySky] + timeIndex);
  const ground = timeToJiMap[timeIndex];

  return { sky, ground };
};

/** ─────────────────────────────
 *  연간지 + 띠
 *  ──────────────────────────── */
const ZODIAC: Record<JiKey, string> = {
  자: "쥐", 축: "소", 인: "호랑이", 묘: "토끼", 진: "용", 사: "뱀",
  오: "말", 미: "양", 신: "원숭이", 유: "닭", 술: "개", 해: "돼지",
};

export function getYearGanji(
  year: number,
  month = 7,
  day = 15
): { ganji: `${GanKey}${JiKey}`; zodiac: string } {
  const { sky, ground } = calculateYearPillar(year, month, day);
  return { ganji: `${sky}${ground}` as `${GanKey}${JiKey}`, zodiac: ZODIAC[ground] };
}

// Date로도 받기(입춘 보정 자동 반영)
export function getYearGanjiFromDate(date: Date) {
  return getYearGanji(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export type MonthSeunItem = {
  year: number;
  month: number; // 1~12
  gan: GanKey;
  ji: JiKey;
};

/** 12개월 월운 생성 */
export function getMonthlySeun(year: number): MonthSeunItem[] {
  const result: MonthSeunItem[] = [];

  // 절기 리스트 순회 (입춘~소한, 총 12개)
  (solarTerms as SolarTerm[]).forEach((term, idx) => {
    const y = term.month === 1 ? year + 1 : year;
    const { sky, ground } = calculateMonthPillar(y, term.month, term.day);

    result.push({
      year,
      month: idx + 1,  // 1=寅월 … 12=丑월
      gan: sky,
      ji: ground,
    });
  });

  return result;
}



// 연운 타입
export type YearSeunItem = {
  age: number;
  year: number;
  pillar?: string | [GanKey, JiKey];
  sky?: GanKey;
  ground?: JiKey;
};

// 나이 → 대운 범위(시작, 끝) 계산
export function getDaewoonBucket(startAge: number, age: number) {
  if (age < startAge) return { start: 0, end: startAge - 1 }; // 아직 대운 시작 전
  const offset = age - startAge;
  const bucketIndex = Math.floor(offset / 10);
  const start = startAge + bucketIndex * 10;
  const end = start + 9;
  return { start, end };
}

// 연운(年運) 리스트 생성
export function buildYearlySeun(startYear: number, endAge: number): YearSeunItem[] {
  const result: YearSeunItem[] = [];
  for (let age = 1; age <= endAge; age++) {
    const year = startYear + (age - 1);
    const { sky, ground } = calculateYearPillar(year, 7, 15); // 기준일: 7월 15일 (입춘 보정)
    result.push({
      age,
      year,
      sky,
      ground,
      pillar: `${sky}${ground}` as `${GanKey}${JiKey}`,
    });
  }
  return result;
}
