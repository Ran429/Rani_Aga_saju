//C:\Users\zeroj\saju\Rani_Aga_saju\app\calculators\elementDistribution.ts
import { fiveElements } from "../constants/elements";
import { heavenlyUnion, earthlyUnion, earthlyConflict } from "../constants/unions";
import { getElement, GanKey, JiKey } from "../utils/elementUtils";

// === [추가] 타입/상수/헬퍼 ===
type ElementType = "목" | "화" | "토" | "금" | "수";
type Pos = "year" | "month" | "day" | "hour";
type Layer = "sky" | "ground";
type Season = "spring" | "summer" | "lateSummer" | "autumn" | "winter";
type ChohuRule = {
  seasons?: Season[];
  pos: Pos;
  layer: Layer;
  branch?: JiKey;          // 한 글자 지정
  branchSet?: Set<JiKey>;  // 여러 글자 집합 지정 (택1만 사용)
  from: ElementType;
  to: ElementType;
  factor?: number;         // 1.0 = 완전 치환
};


interface Pillar { sky: GanKey; ground: JiKey; }

const GROUND_W: Record<Pos, number> = { month: 1.0, day: 0.8, hour: 0.6, year: 0.6 };
const SKY_FACTOR = 0.7;

export const BRANCH_TO_SEASON: Record<JiKey, Season> = {
  인:"spring", 묘:"spring", 진:"spring",
  사:"summer", 오:"summer",
  미:"lateSummer",
  신:"autumn", 유:"autumn", 술:"autumn",
  해:"winter", 자:"winter", 축:"winter",
};

const CHOHU_RULES: ChohuRule[] = [
  { seasons:["summer","lateSummer"], pos:"month", layer:"ground", branch:"미", from:"토", to:"화", factor:1 },
];

function zero(): Record<ElementType, number> {
  return { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
}

function addWeighted(
  out: Record<ElementType, number>,
  el: ElementType,
  pos: Pos,
  layer: Layer
) {
  const w = layer === "ground" ? GROUND_W[pos] : GROUND_W[pos] * SKY_FACTOR;
  out[el] = (out[el] ?? 0) + w;
}

function chohuTransform(
  el: ElementType,
  char: JiKey,
  pos: Pos,
  layer: Layer,
  monthBranch: JiKey,
  useChohu: boolean
): ElementType {
  if (!useChohu) return el;
  if (layer !== "ground") return el;

  const season = BRANCH_TO_SEASON[monthBranch];
  if (!season) return el;

  for (const r of CHOHU_RULES) {
    const okSeason = (r.seasons ?? []).includes(season);
     const okPos    = r.pos === pos && r.layer === layer;
    let okChar = false;
    if (r.branch) okChar = r.branch === char;
    else if (r.branchSet) okChar = r.branchSet.has(char);

    const okFrom   = r.from === el;

    if (okSeason && okPos && okChar && okFrom) {
      if ((r.factor ?? 1) >= 1) return r.to; // 완전 치환만
    }
  }
  return el;
}

// 🔧 합/충 적용(현재 네 로직 유지: from -1, pair +1)
function applyUnionsInPlace(
  adjusted: Record<ElementType, number>,
  pillarList: Pillar[],
  occurredUnions: string[],
  occurredConflicts: string[],
): Pillar[] {
  const usedChars = new Set<string>();
  const grounds: JiKey[] = pillarList.map(p => p.ground);

// ✅ 천간합: index loop로 변경(기둥 sky 갱신)
  pillarList.forEach(({ sky }, idx) => {
    const pair = heavenlyUnion[sky as GanKey];
    if (pair && !usedChars.has(sky) && !usedChars.has(pair) && pillarList.some(p => p.sky === pair)) {
      occurredUnions.push(`${sky}+${pair}(천간합)`);
      const fromEl = fiveElements[sky as GanKey] as ElementType | undefined;
      const toEl   = fiveElements[pair as GanKey] as ElementType | undefined;
      if (fromEl && adjusted[fromEl] > 0) adjusted[fromEl] -= 1;
      if (toEl) adjusted[toEl] = (adjusted[toEl] ?? 0) + 1;

      // ⬇️ Pillar도 합의 상대 글자로 치환 (십성 재계산용)
      pillarList[idx].sky = pair as GanKey;

      usedChars.add(sky); usedChars.add(pair);
    }
  });

  // ✅ 지지합: index loop로 변경(기둥 ground 갱신)
  pillarList.forEach(({ ground }, idx) => {
    const pair = earthlyUnion[ground as JiKey];
    if (pair && !usedChars.has(ground) && !usedChars.has(pair) && grounds.includes(pair as JiKey)) {
      occurredUnions.push(`${ground}+${pair}(지지합)`);
      const fromEl = fiveElements[ground as JiKey] as ElementType | undefined;
      const toEl   = fiveElements[pair as JiKey]   as ElementType | undefined;
      if (fromEl && adjusted[fromEl] > 0) adjusted[fromEl] -= 1;
      if (toEl) adjusted[toEl] = (adjusted[toEl] ?? 0) + 1;

      // ⬇️ Pillar도 합의 상대 글자로 치환
      pillarList[idx].ground = pair as JiKey;

      usedChars.add(ground); usedChars.add(pair);
    }
  });


    // 4. 지지충
  pillarList.forEach(({ ground }) => {
    const pair = earthlyConflict[ground as JiKey];
    if (pair && !usedChars.has(ground) && !usedChars.has(pair) && grounds.includes(pair as JiKey)) {
      occurredConflicts.push(`${ground}↔${pair}(지지충)`);
      const el1 = fiveElements[ground as JiKey];
      const el2 = fiveElements[pair as JiKey];
      if (el1 && adjusted[el1 as ElementType] > 0) adjusted[el1 as ElementType] -= 1;
      if (el2 && adjusted[el2 as ElementType] > 0) adjusted[el2 as ElementType] -= 1;
      usedChars.add(ground); usedChars.add(pair);
    }
  });

  (Object.keys(adjusted) as ElementType[]).forEach(k => {
    if (adjusted[k] < 0) adjusted[k] = 0;
  });

  return pillarList; // ⬅️ 중요!
}

export const calculateElementDistribution = (
  saju: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  opts: { applyChohu?: boolean; applyPalace?: boolean; applyUnions?: boolean; stages?: boolean } = {}
) => {
  const { applyChohu = true, applyPalace = true, applyUnions = true, stages = false } = opts;

  // -------------------------------
  // A) 원본(raw) 카운트 (가중/조후 無)
  // -------------------------------
  const rawElements = zero();
  ([
    [saju.year.sky,  saju.year.ground],
    [saju.month.sky, saju.month.ground],
    [saju.day.sky,   saju.day.ground],
    [saju.hour.sky,  saju.hour.ground],
  ] as [GanKey, JiKey][]).forEach(([sky, ground]) => {
    const es = getElement(sky)    as ElementType;
    const eg = getElement(ground) as ElementType;
    rawElements[es] += 1;
    rawElements[eg] += 1;
  });

  // -----------------------------------------
  // B) 조후 + 궁성(자리) 가중 카운트 (baseElements)
  // -----------------------------------------
  const monthBranch = saju.month.ground; // 월령(조후 기준)

  const weighted = zero();
  const addBoth = (pos: Pos, sky: GanKey, ground: JiKey) => {
    const skyEl  = getElement(sky)    as ElementType;
    const gnd0   = getElement(ground) as ElementType;
    const gndEl  = chohuTransform(gnd0, ground, pos, "ground", monthBranch, applyChohu);

    if (applyPalace) {
      addWeighted(weighted, skyEl, pos, "sky");
      addWeighted(weighted, gndEl, pos, "ground");
    } else {
      weighted[skyEl] += 1;
      weighted[gndEl] += 1;
    }
  };

  addBoth("year",  saju.year.sky,  saju.year.ground);
  addBoth("month", saju.month.sky, saju.month.ground);
  addBoth("day",   saju.day.sky,   saju.day.ground);
  addBoth("hour",  saju.hour.sky,  saju.hour.ground);

  // 화면에서 "현재/보정 전" 기준은 weighted를 사용
  const baseElements = weighted;

  // -----------------------------------------
  // C) 합/충 보정 (최종 adjustedElements)
  // -----------------------------------------
  const adjustedElements = { ...baseElements };
const occurredUnions: string[] = [];
const occurredConflicts: string[] = [];

let adjustedPillars: Pillar[] = [saju.year, saju.month, saju.day, saju.hour].map(p => ({ ...p }));

if (applyUnions) {
  adjustedPillars = applyUnionsInPlace(
    adjustedElements,
    adjustedPillars,
    occurredUnions,
    occurredConflicts
  );
}

// 음수 방지(안전)
(Object.keys(adjustedElements) as ElementType[]).forEach(k => {
  if (adjustedElements[k] < 0) adjustedElements[k] = 0;
});

// ✔ stages=true면 3단계 결과도 함께 반환
if (stages) {
  return {
    rawElements,
    chohuPalaceElements: baseElements,
    baseElements,
    adjustedElements,
    occurredUnions,
    occurredConflicts,
    adjustedPillars, // ⬅️ 여기서도 포함
  };
}

// 기본 반환
return {
  baseElements,
  adjustedElements,
  occurredUnions,
  occurredConflicts,
  adjustedPillars, // ⬅️ 기본 반환에도 포함
}; }