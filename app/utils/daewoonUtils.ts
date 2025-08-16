/**
 * 📄 app/utils/daewoonUtils.ts
 * 역할: 공통 유틸 함수 모음
 * exports: JiKey, GanKey, getDaewoonList, calculateDaewoonPeriod
 * imports: ../constants/solarTerms, ../constants/elements, ./dateUtils
 * referenced by: app/calculators/sajuCalculator.ts
 */
// app/utils/daewoonUtils.ts
import { solarTerms } from "../constants/solarTerms";
import { tenKan, twelveJi } from "../constants/elements";
import { calculateMonthPillar, calculateYearPillar } from "./dateUtils";

export type GanKey = (typeof tenKan)[number];
export type JiKey  = (typeof twelveJi)[number];

// 60갑자 테이블
const SIXTY = Array.from({ length: 60 }, (_, i) => ({
  gan: tenKan[i % 10] as GanKey,
  ji:  twelveJi[i % 12] as JiKey,
}));

const idxOf = (gan: GanKey, ji: JiKey) =>
  SIXTY.findIndex(p => p.gan === gan && p.ji === ji);

type DaewoonItem = {
  age: number;
  year: number;
  pillar: `${GanKey}${JiKey}`;
  pillarGan: GanKey;
  pillarJi: JiKey;
};

// 성별 정규화
const normGender = (g?: string): "남" | "여" =>
  g === "여성" || g === "여" ? "여" : "남";

// 양간/음간
const YANG_STEMS: GanKey[] = ["갑", "병", "무", "경", "임"];
const isYangStem = (g: GanKey) => YANG_STEMS.includes(g);

// 절기 경계(월 시작 절기) 생성
type SolarTerm = { month: number; day: number; name?: string };
const makeTermBoundaries = (baseYear: number) =>
  (solarTerms as SolarTerm[]).map(t => {
    const y = t.month === 1 ? baseYear + 1 : baseYear;
    return new Date(y, t.month - 1, t.day);
  });

/** 대운 시작나이(절기법) */
export function calculateDaewoonPeriod(
  birthYear: number, birthMonth: number, birthDay: number, gender: string
) {
  // 출생 시각(시/분까지 쓰고 싶으면 여기서 더 파싱)
  const birth = new Date(birthYear, birthMonth - 1, birthDay);

  // 순/역행 판단: 연간의 음양 + 성별
  const { sky: yearStem } = calculateYearPillar(birthYear, birthMonth, birthDay);
  const forward = (isYangStem(yearStem) && normGender(gender) === "남")
               || (!isYangStem(yearStem) && normGender(gender) === "여");

  // 경계 목록: 출생년도와 전년도까지 합쳐서 직전/다음을 안정적으로 구함
  const termsPrev = makeTermBoundaries(birthYear - 1);
  const termsCurr = makeTermBoundaries(birthYear);
  const allTerms  = [...termsPrev, ...termsCurr];

  // 직전/다음 절기
  let prevTerm = allTerms[0];
  let nextTerm = allTerms[allTerms.length - 1];
  for (const t of allTerms) {
    if (t.getTime() <= birth.getTime()) prevTerm = t;
    if (t.getTime() >  birth.getTime()) { nextTerm = t; break; }
  }

  // 순행: 다음 절기까지 / 역행: 직전 절기까지
  const target = forward ? nextTerm : prevTerm;
  const diffDays = Math.abs(target.getTime() - birth.getTime()) / 86400000;

  // 3일 = 1년, 반올림
  const yearsToStart = Math.round(diffDays / 3);

  return yearsToStart; // 순/역행에 따라 경계는 위에서 이미 선택
}

export function getDaewoonList(
  birthYear: number, birthMonth: number, birthDay: number, gender: string
): DaewoonItem[] {
  const startAge = calculateDaewoonPeriod(birthYear, birthMonth, birthDay, gender);

  // 진행 방향 재계산(순/역)
  const { sky: yearStem } = calculateYearPillar(birthYear, birthMonth, birthDay);
  const forward =
    (isYangStem(yearStem) && normGender(gender) === "남") ||
    (!isYangStem(yearStem) && normGender(gender) === "여");
  const dir = forward ? +1 : -1;

  // 출생 월주 다음(또는 이전)이 첫 대운
  const monthPillar = calculateMonthPillar(birthYear, birthMonth, birthDay);
  const startFrom = idxOf(monthPillar.sky, monthPillar.ground);
  const firstIdx  = (startFrom + dir + 60) % 60;

  const list: DaewoonItem[] = [];
  for (let i = 0; i < 10; i++) {
    const idx = (firstIdx + dir * i + 60) % 60;
    const gan = SIXTY[idx].gan;
    const ji  = SIXTY[idx].ji;
    list.push({
      age: startAge + i * 10,
      year: birthYear + startAge + i * 10,
      pillar: `${gan}${ji}` as `${GanKey}${JiKey}`,
      pillarGan: gan,
      pillarJi: ji,
    });
  }
  return list;
}