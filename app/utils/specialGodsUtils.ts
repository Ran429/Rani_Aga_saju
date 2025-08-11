// C:\Users\zeroj\saju\Rani_Aga_saju\app\utils\specialGodsUtils.ts

import { JiKey, GanKey } from "./elementUtils";
import { FourPillars, SpecialGodHit } from "../types/sajuTypes";

export type SpecialOptions = {
  /** 백호: 일주만 / 모든주 */
  baekhoMode?: "dayOnly" | "anyPillar";
  /** 도화: 자오묘유 / 삼합기준 */
  dohwaMode?: "four" | "trine";
  /** 삼합 도화 기준 지지(연/일) */
  dohwaBase?: "year" | "day";
  /** 역마: 간편 / 엄밀 */
  yeokmaMode?: "simple" | "strict";
  /** 원진(쌍관계) 표시 여부 (기본 Off) */
  pairWonjin?: boolean;
  /** 양인 표시 모드: 양간만 / 둘 다(기본) */
  yanginMode?: "yangOnly" | "both";
  /** 라벨: 'plain'이면 '양인살', 'mark'면 '양인살(양간/음간)' */
  yanginLabel?: "plain" | "mark";
};

/* ===== 공통 ===== */

type PillarKey = "year" | "month" | "day" | "hour";
const KEYS = ["year", "month", "day", "hour"] as const;

/* ===== 삼합 ===== */

const TRINES: JiKey[][] = [
  ["해", "묘", "미"], // 목
  ["인", "오", "술"], // 화
  ["사", "유", "축"], // 금
  ["신", "자", "진"], // 수
];

const TRINE_INDEX: Record<JiKey, number> = (() => {
  const map = {} as Record<JiKey, number>;
  TRINES.forEach((group, idx) => group.forEach((g) => (map[g] = idx)));
  return map;
})();
const prevTrineIndex = (idx: number) => (idx + TRINES.length - 1) % TRINES.length;

/* ===== 도화 ===== */

const FOUR_DOHWA = new Set<JiKey>(["자", "오", "묘", "유"]);
function pickDohwaByTrine(base: JiKey): JiKey {
  if (["신", "자", "진"].includes(base)) return "유";
  if (["인", "오", "술"].includes(base)) return "묘";
  if (["사", "유", "축"].includes(base)) return "오";
  return "자"; // 해묘미
}

/* ===== 역마 ===== */

const YEOKMA_CANDIDATES = new Set<JiKey>(["인", "신", "사", "해"]);

/* ===== 화개 ===== */

function pickHwageByTrine(base: JiKey): JiKey {
  if (["해", "묘", "미"].includes(base)) return "미";
  if (["인", "오", "술"].includes(base)) return "술";
  if (["사", "유", "축"].includes(base)) return "축";
  return "진"; // 신자진
}

/* ===== 기타 신살 ===== */

// 백호 7일주
const BAEKHO_SET = new Set(["갑진", "을미", "병술", "정축", "무진", "임술", "계축"]);

// 괴강 4일주
const GWAIGANG_SET = new Set(["경진", "경술", "무진", "무술"]);

// 양인살: 일간 → 제왕지
const YANG_STEMS = new Set<GanKey>(["갑", "병", "무", "경", "임"]);
const YANG_YANGIN_MAP: Partial<Record<GanKey, JiKey>> = {
  갑: "묘",
  병: "오",
  무: "오",
  경: "유",
  임: "자",
};
const YIN_YANGIN_MAP: Partial<Record<GanKey, JiKey>> = {
  을: "진",
  정: "미",
  기: "미",
  신: "술",
  계: "축",
};

/* ===== 현침살 (가중 규칙: 천간 갑/신, 지지 묘/오/미/신) ===== */

type HyeonchimOptions = {
  strongThreshold?: number; // 3개 이상이면 강
  stemWeight?: number; // 기본 2
  branchWeight?: number; // 기본 1
  markStrongAsRow?: boolean; // 강 요약행 추가
  basis?: "both" | "stems" | "branches";       // 무엇을 볼지
  customStemSet?: GanKey[];                    // 천간 후보 커스텀
  customBranchSet?: JiKey[];                   // 지지 후보 커스텀
};

export function checkHyeonchimWeighted(
  pillars: FourPillars,
  {
    strongThreshold = 3,
    stemWeight = 2,
    branchWeight = 1,
    markStrongAsRow = true,
    basis = "both",
    customStemSet,
    customBranchSet,
  }: HyeonchimOptions = {}
): SpecialGodHit[] {
  const hits: SpecialGodHit[] = [];

   // 기본 규칙(갑·신 / 묘·오·미·신)을 옵션으로 덮어쓰기
  const STEMS = new Set<GanKey>(customStemSet ?? ["갑","신"]);
  const BRANCHES = new Set<JiKey>(customBranchSet ?? ["묘","오","미","신"]);

  let count = 0;
  let scoreSum = 0;

  (["year","month","day","hour"] as const).forEach((k) => {
    const s = pillars[k].sky;
    const g = pillars[k].ground;

    const stemHit = (basis !== "branches") && STEMS.has(s);
    const branchHit = (basis !== "stems")    && BRANCHES.has(g);

    if (stemHit || branchHit) {
      count += (stemHit ? 1 : 0) + (branchHit ? 1 : 0);
      scoreSum += (stemHit ? stemWeight : 0) + (branchHit ? branchWeight : 0);

      if (stemHit) hits.push({ name: "현침살", where: k, basis: `천간=${s} (x${stemWeight})` });
      if (branchHit) hits.push({ name: "현침살", where: k, basis: `지지=${g} (x${branchWeight})` });
    }
  });

  if (count >= strongThreshold) {
    hits.push({
      name: markStrongAsRow ? "현침살(강)" : "현침살",
      where: "all",
      basis: `등장=${count}개, 가중점수=${scoreSum}`,
    });
  }
  return hits;
}

/* ===== 원진/귀문 ===== */

const WONJIN = new Set([
  "자-미",
  "미-자",
  "축-오",
  "오-축",
  "인-유",
  "유-인",
  "묘-신",
  "신-묘",
  "진-해",
  "해-진",
  "사-술",
  "술-사",
]);

const GUIMUN_CANDIDATES = new Set<JiKey>(["축", "미"]);

/* ===== 개별 판정 ===== */

export function checkDohwa(
  pillars: FourPillars,
  mode: "four" | "trine" = "four",
  baseKey: "year" | "day" = "year"
): SpecialGodHit[] {
  const hits: SpecialGodHit[] = [];
  if (mode === "four") {
    KEYS.forEach((k) => {
      const g = pillars[k].ground;
      if (FOUR_DOHWA.has(g)) hits.push({ name: "도화", where: k, basis: `지지=${g}` });
    });
  } else {
    const base = pillars[baseKey].ground;
    const target = pickDohwaByTrine(base);
    KEYS.forEach((k) => {
      if (pillars[k].ground === target)
        hits.push({ name: "도화", where: k, basis: `${baseKey}지=${base} → 도화=${target}` });
    });
  }
  return hits;
}

export function checkYeokmaStrict(pillars: FourPillars): SpecialGodHit | undefined {
  const allGrounds = Object.values(pillars).map((p) => p.ground);
  for (const g of allGrounds) {
    if (!YEOKMA_CANDIDATES.has(g)) continue;
    const t = TRINE_INDEX[g];
    const prevGroup = TRINES[prevTrineIndex(t)];
    if (allGrounds.some((x) => prevGroup.includes(x))) {
      return {
        name: "역마",
        where: "all",
        basis: `역마지지=${g}, 이전계절(${prevGroup.join("·")}) 동반`,
      };
    }
  }
}

export function checkHwage(
  pillars: FourPillars,
  baseKey: "year" | "day" = "year"
): SpecialGodHit | undefined {
  const base = pillars[baseKey].ground;
  const hw = pickHwageByTrine(base);
  for (const k of KEYS) {
    if (pillars[k].ground === hw) {
      return { name: "화개", where: k, basis: `${baseKey}지=${base} → 화개=${hw}` };
    }
  }
}

export function checkBaekho(
  pillars: FourPillars,
  mode: "dayOnly" | "anyPillar" = "dayOnly"
): SpecialGodHit | undefined {
  const { year, month, day, hour } = pillars;
  const hasBaekhoDay = BAEKHO_SET.has(day.sky + day.ground);
  if (mode === "dayOnly") {
    if (hasBaekhoDay)
      return { name: "백호대살", where: "day", basis: `일주=${day.sky + day.ground}` };
  } else {
    const any = hasBaekhoDay || [year, month, hour].some((p) => BAEKHO_SET.has(p.sky + p.ground));
    if (any) return { name: "백호대살", where: "all", basis: `7일주 중 하나 존재` };
  }
}

export function checkGwaigang(pillars: FourPillars): SpecialGodHit | undefined {
  const { day } = pillars;
  if (GWAIGANG_SET.has(day.sky + day.ground)) {
    return { name: "괴강살", where: "day", basis: `일주=${day.sky + day.ground}` };
  }
}

export function checkYangin(
  pillars: FourPillars,
  mode: "yangOnly" | "both" = "both",
  label: "plain" | "mark" = "mark"
): SpecialGodHit[] {
  const hits: SpecialGodHit[] = [];
  const dayStem = pillars.day.sky as GanKey;
  const isYang = YANG_STEMS.has(dayStem);
  if (mode === "yangOnly" && !isYang) return hits;

  const target = (isYang ? YANG_YANGIN_MAP[dayStem] : YIN_YANGIN_MAP[dayStem]) as
    | JiKey
    | undefined;
  if (!target) return hits;

  const name = label === "mark" ? `양인살(${isYang ? "양간" : "음간"})` : "양인살";

  KEYS.forEach((k) => {
    if (pillars[k].ground === target) {
      hits.push({ name, where: k, basis: `일간=${dayStem}, 양인지지=${target}` });
    }
  });
  return hits;
}

export function checkWonjing(pillars: FourPillars): SpecialGodHit[] {
  // 일지 기준 원진 — 모든 기둥과 일지 페어 비교, 배열 where 사용 대신 기둥별로 push
  const results: SpecialGodHit[] = [];
  const pair = (a: JiKey, b: JiKey) => `${a}-${b}`;
  const dayG = pillars.day.ground;
  (["year", "month", "hour"] as PillarKey[]).forEach((k) => {
    const g = pillars[k].ground;
    const ab = pair(g, dayG),
      ba = pair(dayG, g);
    if (WONJIN.has(ab) || WONJIN.has(ba)) {
      results.push({ name: "원진살", where: k, basis: `(${g}, ${dayG})` });
    }
  });
  return results;
}

export function checkGuimun(pillars: FourPillars): SpecialGodHit[] {
  const out: SpecialGodHit[] = [];
  const { day, hour } = pillars;
  if (GUIMUN_CANDIDATES.has(day.ground) && GUIMUN_CANDIDATES.has(hour.ground)) {
    out.push({ name: "귀문관살", where: "day", basis: `일지=${day.ground}` });
    out.push({ name: "귀문관살", where: "hour", basis: `시지=${hour.ground}` });
  }
  return out;
}

/* ===== 종합 ===== */

export function checkSpecialGodsAll(
  pillars: FourPillars,
  options: SpecialOptions = {}
): SpecialGodHit[] {
  const results: SpecialGodHit[] = [];
  const pushIf = (r?: SpecialGodHit | SpecialGodHit[]) => {
    if (!r) return;
    if (Array.isArray(r)) results.push(...r);
    else results.push(r);
  };

  const {
    baekhoMode = "dayOnly",
    dohwaMode = "four",
    dohwaBase = "year",
    yeokmaMode = "strict",
    pairWonjin = false,
    yanginMode = "both",
    yanginLabel = "mark",
  } = options;

  // 도화
  pushIf(checkDohwa(pillars, dohwaMode, dohwaBase));
  // 역마
  if (yeokmaMode === "simple") {
    const any = Object.values(pillars).some((p) => YEOKMA_CANDIDATES.has(p.ground));
    if (any) results.push({ name: "역마", where: "all", basis: "寅申巳亥 존재(간편)" });
  } else {
    pushIf(checkYeokmaStrict(pillars));
  }
  // 화개
  pushIf(checkHwage(pillars));
  // 백호
  pushIf(checkBaekho(pillars, baekhoMode));
  // 괴강
  pushIf(checkGwaigang(pillars));
  // 양인
  pushIf(checkYangin(pillars, yanginMode, yanginLabel));
  // 현침(가중 규칙)
 pushIf(
  checkHyeonchimWeighted(pillars, {
    basis: "branches",            // 지지만 본다
    customBranchSet: ["묘", "술"],// 네 기준
    strongThreshold: 99,          // ← 요약(강) 발생 안 하도록 크게
    stemWeight: 0,
    branchWeight: 1,
    markStrongAsRow: false,       // 라벨도 숨김(보조)
  })
);

  // 원진(기본 OFF)
  if (pairWonjin) pushIf(checkWonjing(pillars));
  // 귀문
  pushIf(checkGuimun(pillars));

  return results;
}
