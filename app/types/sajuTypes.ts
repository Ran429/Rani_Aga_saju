/**
 * 📄 app/types/sajuTypes.ts
 * 역할: 타입 정의 모음
 * exports: SajuExplanationKey, GoodGodHit, FourPillars, SpecialGodsSet, Gender, splitBirthDate, SajuDataType, normalizeGender, SajuResult, DaewoonItem, BirthYMD, BasicStructureProps, SpecialGodHit, Pillar, SajuResultType, TenGodCount, FortuneCategory
 * imports: ../utils/elementUtils
 * referenced by: app/utils/specialGodsUtils.ts, app/utils/goodGodsUtils.ts, app/calculators/sajuCalculator.ts
 */
// C:\Users\zeroj\saju\Rani_Aga_saju\app\types\sajuTypes.ts
import { GanKey, JiKey } from "../utils/elementUtils";

/* ──────────────────────────────────────────────────────────
 * 기본 기둥/사주 타입
 * ────────────────────────────────────────────────────────── */
export type Pillar = { sky: GanKey; ground: JiKey };
export type FourPillars = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
};

/* ──────────────────────────────────────────────────────────
 * 특수신살/길신 표시 타입
 * ────────────────────────────────────────────────────────── */
export type SpecialGodHit =
  | {
      name: string;
      where: "year" | "month" | "day" | "hour" | "all";
      basis?: string;
      via?: "stem" | "branch" | "summary";
    }
  | {
      name: string;
      where: Array<"year" | "month" | "day" | "hour">;
      basis?: string;
    };

export type GoodGodHit =
  | {
      name: string;
      where: "year" | "month" | "day" | "hour" | "all";
      basis?: string;
    }
  | {
      name: string;
      where: Array<"year" | "month" | "day" | "hour">;
      basis?: string;
    };

/* (레거시) 기둥별 불린 세트 */
export interface SpecialGodsSet {
  yeokma: boolean;
  dohwa: boolean;
  hwagae: boolean;
  gwaegang: boolean;
  baekho: boolean;
  yangin: boolean;
  jaesal: boolean;
  wolsal: boolean;
  mangsin: boolean;
  geopsal: boolean;
  yukhae: boolean;
  wonjin: boolean;
  jimaang: boolean;
}

/* ──────────────────────────────────────────────────────────
 * 십성 카운트
 * ────────────────────────────────────────────────────────── */
export interface TenGodCount {
  "알 수 없음": number;
  비견: number;
  겁재: number;
  식신: number;
  상관: number;
  편재: number;
  정재: number;
  편관: number;
  정관: number;
  편인: number;
  정인: number;
}

/* ──────────────────────────────────────────────────────────
 * 공통 성별/대운 타입
 * ────────────────────────────────────────────────────────── */
export type Gender = "남성" | "여성";

export interface DaewoonItem {
  age: number;   // 시작 나이
  year: number;  // 시작 양력 연도
  pillar: string; // `${GanKey}${JiKey}`
}

/* ──────────────────────────────────────────────────────────
 * 메인 사주 결과 타입 (기존 구조 유지 + 호환성 개선)
 * ────────────────────────────────────────────────────────── */
export interface SajuResultType {
  baseElements: Record<string, number>;
  adjustedElements: Record<string, number>;
  baseTenGods: TenGodCount;
  adjustedTenGods: TenGodCount;
  daewoonList: { age: number; year: number; pillar: string }[];
  daewoonPeriod: number;
  twelveFortunes: Record<string, string>;
  specialGods: SpecialGodHit[];
  goodGods: GoodGodHit[];
  year: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  month: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  day: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  hour: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  occurredUnions: string[];    // 합 발생 리스트
  occurredConflicts: string[]; // 충 발생 리스트
  userInfo?: {
    name: string;
    birthType: string;
    birthDate: string;
    birthTime: string;
    gender: string | Gender;   // ✅ string도 허용 (실데이터 호환)
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
  };
}

/* BasicStructure 컴포넌트 props */
export interface BasicStructureProps {
  userName: string;
  sajuResult: SajuResultType;
  sanitizedExplanation: string;
}

/* ──────────────────────────────────────────────────────────
 * 설명 데이터 관련 타입
 * ────────────────────────────────────────────────────────── */
export type FortuneCategory =
  | "인생운"
  | "연애운"
  | "궁합운"
  | "직업운"
  | "학업및시험운"
  | "재물운"
  | "건강운";

export interface SajuExplanationKey {
  dayStem: string; // 예: "갑목", "을목"
  gender: "남성" | "여성";
  category: FortuneCategory;
}

export type SajuDataType = {
  [dayStem: string]: {
    남성: Partial<Record<FortuneCategory, string>>;
    여성: Partial<Record<FortuneCategory, string>>;
  };
};

/* ──────────────────────────────────────────────────────────
 * 보조 타입/헬퍼: 생년월일 파싱/성별 정규화
 * ────────────────────────────────────────────────────────── */
export type BirthYMD = { year?: number; month?: number; day?: number };

/** splitBirthDate는 필요한 필드만 받도록 느슨하게 — 어디서든 안전 호출 */
type BirthFieldsOnly = {
  birthDate?: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
};

export function splitBirthDate(userInfo?: BirthFieldsOnly): BirthYMD {
  if (!userInfo) return {};
  // 이미 쪼개져 있으면 우선 사용
  if (userInfo.birthYear && userInfo.birthMonth && userInfo.birthDay) {
    return { year: userInfo.birthYear, month: userInfo.birthMonth, day: userInfo.birthDay };
  }
  // 문자열 파싱
  const s = userInfo.birthDate;
  if (!s) return {};
  const m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return { year: +m[1], month: +m[2], day: +m[3] };

  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime())) {
    return { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
  }
  return {};
}

/** string | Gender | undefined → Gender 로 정규화 */
export function normalizeGender(g?: string | Gender): Gender {
  return g === "여성" ? "여성" : "남성";
}

/* ──────────────────────────────────────────────────────────
 * (옵션) 다른 곳에서 사용하는 간단한 SajuResult 쉼표형 정의
 * ────────────────────────────────────────────────────────── */
export interface SajuResult {
  userInfo: {
    name: string;
    birthType: string;
    birthDate: string;
    birthTime: string;
    gender: string | Gender; // 동일하게 허용
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
  };
  day: { sky: string; ground: string };
  month: { sky: string; ground: string };
  year: { sky: string; ground: string };
  hour: { sky: string; ground: string };
  adjustedElements: Record<string, number>;
  baseElements: Record<string, number>;
  daewoonPeriod?: number;
  twelveFortunes: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}
