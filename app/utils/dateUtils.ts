// utils/dateUtils.ts
import { tenKan, twelveJi } from "../constants/elements";
import { solarTerms } from "../constants/solarTerms";

/** 절기 항목 타입 */
type SolarTerm = { month: number; day: number; name?: string };

/** ─────────────────────────────
 *  타입 & 공통 유틸
 *  ──────────────────────────── */
export type GanKey = (typeof tenKan)[number];   // '갑' | '을' | ...
export type JiKey  = (typeof twelveJi)[number]; // '자' | '축' | ...

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
  day?: number
): Pillar => {
  const beforeIpchun = month === 2 && day !== undefined && day < 4;
  const adjustedYear = month < 2 || beforeIpchun ? year - 1 : year;

  // 연간지
  const yearSky = asGan(adjustedYear + 6);

  // 寅월 기준 지지 인덱스(지지: 寅=2월부터)
  const monthGroundIdx = (month + 10) % 12; // 2→0(寅), 3→1(卯) ... 1→11(丑)
  const ground = asJi(monthGroundIdx);

  // 寅월의 천간 시작 인덱스(above rule)
  const startStemIndexByYearStem: Record<GanKey, number> = {
    갑: 2, 기: 2,  // 丙
    을: 4, 경: 4,  // 戊
    병: 6, 신: 6,  // 庚
    정: 8, 임: 8,  // 壬
    무: 0, 계: 0,  // 甲
  };
  const startIdx = startStemIndexByYearStem[yearSky];
  const sky = asGan(startIdx + monthGroundIdx); // 寅월을 0으로 둔 상대 오프셋

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

/** ─────────────────────────────
 *  대운 관련 (원본 daewoonUtils 로직과 동일)
 *  ──────────────────────────── */
export type Gender = "남성" | "여성";

export type DaewoonItem = {
  age: number;                 // 시작 나이 (예: 7, 17, 27 …)
  year: number;                // 시작 양력 연도
  pillar: `${GanKey}${JiKey}`; // 대운 간지(여기서는 "연간지"로 표기)
};

/** "남성/여성/남/여" → "남" | "여" 로 정규화 */
const normalizeGenderShort = (g?: string | Gender): "남" | "여" =>
  g === "여" || g === "여성" ? "여" : "남";

/** ✅ 대운 시작 나이 (= daewoonUtils.calculateDaewoonPeriod) */
export function getDaewoonStartAge(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender: string | Gender
): number {
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

  // 절기 테이블(1월 항목은 다음 해로 보정)
  const termsThisYear = (solarTerms as SolarTerm[]).map((term: SolarTerm) => {
    let y = birthYear;
    if (term.month === 1) y += 1;
    return new Date(y, term.month - 1, term.day);
  });

  // 출생일 이후 첫 절기
  let nextTerm = termsThisYear.find((d: Date) => d.getTime() > birthDate.getTime());
  // 못 찾으면 익년 입춘(2/4)로 안전 Fallback
  if (!nextTerm) nextTerm = new Date(birthYear + 1, 1, 4);

  const diffDays = Math.ceil((nextTerm.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const yearsToStart = Math.round(diffDays / 3); // 3일 = 1년 환산

  // ⚠️ 원본 규칙: 출생 연도 홀수면 양년
  const isYangYear = birthYear % 2 !== 0;
  const g = normalizeGenderShort(gender);
  const forward = (isYangYear && g === "남") || (!isYangYear && g === "여");

  return forward ? yearsToStart : 10 - yearsToStart;
}

/** ✅ 대운 타임라인 (= daewoonUtils.getDaewoonList) */
export function getDaewoonTimeline(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender: string | Gender
): DaewoonItem[] {
  const startAge = getDaewoonStartAge(birthYear, birthMonth, birthDay, gender);
  const items: DaewoonItem[] = [];

  for (let i = 0; i < 10; i++) {
    const age = startAge + i * 10;
    const year = birthYear + age;
    const yg = getYearGanji(year);
    items.push({ age, year, pillar: yg.ganji });
  }
  return items;
}

/** 현재연도 간지(연산 통일: calculateYearPillar 재사용) */
export const getCurrentYearGanji = (year: number): `${GanKey}${JiKey}` => {
  const { sky, ground } = calculateYearPillar(year, 7, 15);
  return `${sky}${ground}` as `${GanKey}${JiKey}`;
};
