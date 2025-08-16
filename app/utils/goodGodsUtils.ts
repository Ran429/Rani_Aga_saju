/**
 * 📄 app/utils/goodGodsUtils.ts
 * 역할: 공통 유틸 함수 모음
 * exports: checkCheondeok, checkSamgi, checkCheoneul, checkMunchang, checkWoldeok, checkAmrok, GoodGodHit, checkGoodGodsAll, checkWolgong, checkCheonui
 * imports: ./elementUtils, ../types/sajuTypes
 * referenced by: app/calculators/sajuCalculator.ts
 */
// C:\Users\zeroj\saju\Rani_Aga_saju\app\utils\goodGodsUtils.ts

import { JiKey, GanKey } from "./elementUtils";
import { FourPillars } from "../types/sajuTypes";

export type GoodGodHit = {
  name: string;
  where: "year" | "month" | "day" | "hour" | "all";
  basis?: string;
};

/* =========================================
   1. 월공(月空)
========================================= */
const SIXTY_GAPJA: string[] = (() => {
  const sky: GanKey[] = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const ground: JiKey[] = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const arr: string[] = [];
  for (let i = 0; i < 60; i++) {
    arr.push(sky[i % 10] + ground[i % 12]);
  }
  return arr;
})();

function getEmptyBranches(daySky: GanKey, dayGround: JiKey): JiKey[] {
  const idx = SIXTY_GAPJA.indexOf(daySky + dayGround);
  if (idx === -1) return [];
  const start = Math.floor(idx / 10) * 10; // 묶음 시작 인덱스
  const emptyIdx1 = (start + 10) % 12;
  const emptyIdx2 = (start + 11) % 12;
  const ground: JiKey[] = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  return [ground[emptyIdx1], ground[emptyIdx2]];
}

export function checkWolgong(pillars: FourPillars): GoodGodHit | undefined {
  const emptyBranches = getEmptyBranches(pillars.day.sky, pillars.day.ground);
  if (emptyBranches.includes(pillars.month.ground)) {
    return { name: "월공", where: "month", basis: `공망지=${emptyBranches.join(",")}` };
  }
}

/* =========================================
   2. 문창귀인
========================================= */
const MUNCHANG_MAP: Record<GanKey, JiKey> = {
  "갑": "사", "을": "오",
  "병": "신", "정": "유",
  "무": "신", "기": "유",
  "경": "해", "신": "자",
  "임": "인", "계": "묘",
};

export function checkMunchang(pillars: FourPillars): GoodGodHit | undefined {
  const target = MUNCHANG_MAP[pillars.day.sky];
  const allGrounds = Object.values(pillars).map(p => p.ground);
  if (target && allGrounds.includes(target)) {
    return { name: "문창귀인", where: "all", basis: `일간=${pillars.day.sky} → 문창=${target}` };
  }
}

/* =========================================
   3. 천의성(천문성)
========================================= */
const CHEONUI_MAP: Record<JiKey, JiKey> = {
  "자": "해", "축": "자", "인": "축", "묘": "인",
  "진": "묘", "사": "진", "오": "사", "미": "오",
  "신": "미", "유": "신", "술": "유", "해": "술",
};

export function checkCheonui(
  pillars: FourPillars,
  label: "천문성" | "천의성" = "천문성"   // 표기 취향: 기본 '천문성'
): GoodGodHit[] {
  const hits: GoodGodHit[] = [];
  const base = pillars.month.ground;                   // ← 월지 기준
  const target = CHEONUI_MAP[base];
  if (!target) return hits;

  (["year","month","day","hour"] as const).forEach((k) => {
    if (pillars[k].ground === target) {
      hits.push({
        name: label,
        where: k,                                      // 해당 주에만 표기
        basis: `월지=${base} → ${label}=${target}`,
      });
    }
  });

  return hits;
}

/* =========================================
   4. 암록 (일간 → 지지)
========================================= */
const AMROK_MAP: Record<GanKey, JiKey> = {
  "갑": "해", "을": "술",
  "병": "신", "정": "미",
  "무": "신", "기": "미",
  "경": "사", "신": "진",
  "임": "인", "계": "축",
};

// 해당 지지가 있는 '모든 기둥'에 표기 (월지/연지 등)
export function checkAmrok(pillars: FourPillars): GoodGodHit[] {
  const daySky = pillars.day.sky;
  const target = AMROK_MAP[daySky];
  const hits: GoodGodHit[] = [];
  if (!target) return hits;

  (["year","month","day","hour"] as const).forEach((k) => {
    if (pillars[k].ground === target) {
      hits.push({
        name: "암록",
        where: k,                     // 주별로 정확히 찍히게
        basis: `일간=${daySky} → 지지=${target}`,
      });
    }
  });
  return hits;
}

/* =========================================
   5. 천덕귀인
========================================= */
type CheondeokPair =
  | { kind: "branch"; list: JiKey[] }  // 지지가 오면 성립
  | { kind: "stem";   list: GanKey[] } // 천간이 오면 성립

const CHEONDEOK_MAP: Record<JiKey, CheondeokPair[]> = {
   "인": [{ kind: "stem",   list: ["정"] }], // 寅→丁
  "묘": [{ kind: "branch", list: ["신"] }], // 卯→申
  "진": [{ kind: "stem",   list: ["임"] }], // 辰→壬
  "사": [{ kind: "stem",   list: ["신"] }], // 巳→辛
  "오": [{ kind: "branch", list: ["해"] }], // 午→亥
  "미": [{ kind: "stem",   list: ["갑"] }], // 未→甲
  "신": [{ kind: "stem",   list: ["계"] }], // 申→癸
  "유": [{ kind: "branch", list: ["인"] }], // 酉→寅
  "술": [{ kind: "stem",   list: ["병"] }], // 戌→丙
  "해": [{ kind: "stem",   list: ["을"] }], // 亥→乙
  "자": [{ kind: "branch", list: ["사"] }], // 子→巳
  "축": [{ kind: "stem",   list: ["경"] }], // 丑→庚
};

export function checkCheondeok(pillars: FourPillars, label = "천덕귀인"): GoodGodHit[] {
  const out: GoodGodHit[] = [];
  const month = pillars.month.ground;
  const rules = CHEONDEOK_MAP[month] ?? [];

  (["year","month","day","hour"] as const).forEach((k) => {
    const g = pillars[k].ground;
    const s = pillars[k].sky;
    for (const r of rules) {
      if (r.kind === "branch" && r.list.includes(g)) {
        out.push({ name: label, where: k, basis: `월지=${month} ↔ 지지=${g}` });
      }
      if (r.kind === "stem" && r.list.includes(s)) {
        out.push({ name: label, where: k, basis: `월지=${month} ↔ 천간=${s}` });
      }
    }
  });
  return out;
}
/* =========================================
   6. 월덕귀인
========================================= */
const WOLDEOK_MAP: Record<JiKey, GanKey[]> = {
  // 水 삼합(申子辰) → 壬
  "신": ["임"], "자": ["임"], "진": ["임"],
  // 木 삼합(亥卯未) → 甲
  "해": ["갑"], "묘": ["갑"], "미": ["갑"],
  // 火 삼합(寅午戌) → 丙
  "인": ["병"], "오": ["병"], "술": ["병"],
  // 金 삼합(巳酉丑) → 庚
  "사": ["경"], "유": ["경"], "축": ["경"],
};

export function checkWoldeok(pillars: FourPillars, label = "월덕귀인"): GoodGodHit[] {
  const out: GoodGodHit[] = [];
  const month = pillars.month.ground;
  const targets = WOLDEOK_MAP[month] ?? [];
  const allSkies = Object.values(pillars).map(p => p.sky);

  (["year","month","day","hour"] as const).forEach((k, idx) => {
    if (targets.includes(allSkies[idx])) {
      out.push({ name: label, where: k, basis: `월지=${month} ↔ 천간=${allSkies[idx]}` });
    }
  });
  return out;
}

/* =========================================
   7. 천을귀인
========================================= */
const CHEONEUL_MAP: Record<GanKey, JiKey[]> = {
  "갑": ["축", "미"], "을": ["자", "신"], "병": ["해", "유"], "정": ["술", "유"],
  "무": ["해", "유"], "기": ["술", "유"], "경": ["사", "미"], "신": ["오", "진"],
  "임": ["묘", "사"], "계": ["인", "자"],
};

export function checkCheoneul(pillars: FourPillars): GoodGodHit | undefined {
  const targets = CHEONEUL_MAP[pillars.day.sky];
  const allGrounds = Object.values(pillars).map(p => p.ground);
  if (targets.some(t => allGrounds.includes(t))) {
    return { name: "천을귀인", where: "all", basis: `일간=${pillars.day.sky} → 천을=${targets.join(",")}` };
  }
}

/* =========================================
   8. 삼기귀인
========================================= */
const SAMGI_SET = new Set<GanKey>(["갑", "을", "병"]);

export function checkSamgi(pillars: FourPillars): GoodGodHit | undefined {
  const allSkies = Object.values(pillars).map(p => p.sky);
  if (Array.from(SAMGI_SET).every((k: GanKey) => allSkies.includes(k))) {
    return { name: "삼기귀인", where: "all", basis: `천간에 ${Array.from(SAMGI_SET).join("·")} 모두 존재` };
  }
}

/* =========================================
   종합 호출
========================================= */
export function checkGoodGodsAll(pillars: FourPillars): GoodGodHit[] {
  const results: GoodGodHit[] = [];

  // 단건 | 배열 모두 처리
  const push = (r?: GoodGodHit | GoodGodHit[]) => {
    if (!r) return;
    if (Array.isArray(r)) results.push(...r);
    else results.push(r);
  };

  push(checkWolgong(pillars));
  push(checkMunchang(pillars));
  push(checkCheonui(pillars));
  push(checkAmrok(pillars));      // ← 배열 반환이어도 OK
  push(checkCheondeok(pillars));
  push(checkWoldeok(pillars));
  push(checkCheoneul(pillars));
  push(checkSamgi(pillars));

  return results;
}