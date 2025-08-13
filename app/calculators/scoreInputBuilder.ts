import { SajuResultType } from "@/app/types/sajuTypes";
import { ScoreInput } from "./scoreCalculator";
import { GanKey, JiKey,getElementFromGan, getElementFromJi, isGenerating } from "@/app/utils/elementUtils";
import { BRANCH_TO_SEASON } from "@/app/calculators/elementDistribution";
import scoreRules from "@/app/constants/scoreRules";

export function buildScoreInput(result: SajuResultType, name: string): ScoreInput {
  return {
    name,
    ilji_wolji_chung: checkIljiWoljiChung(result),
    pyungwan_count: countTenGod(result, "편관"),
    only_wolji_pyungwan: checkOnlyWoljiPyungwan(result),
    has_all_elements: hasAllFiveElements(result),
    hap_count: result.occurredUnions?.length ?? 0,
    same_element_count: getMaxSameElementCount(result.baseElements),
    same_season: getSameSeason(result),
    wolji_supports_ilgan: checkWoljiSupportsIlgan(result),
    gilshin_count: result.goodGods?.length ?? 0,
    hyungshin_count: countHyungshin(result), // ← JSON 기반으로 변경
    sibun_positive_count: countSibunPositive(result),
    sibun_negative_count: countSibunNegative(result),
    jaesung: hasTenGod(result, "정재") || hasTenGod(result, "편재"),
    siksang: hasTenGod(result, "식신") || hasTenGod(result, "상관"),
    wonjin: hasWonjin(result),
    cheon_eul_gui_in: hasCheonEulGuiIn(result),
  };
}

// ========= 함수들 =========

function checkIljiWoljiChung(result: SajuResultType): boolean {
  return result.occurredConflicts?.some((c: string) => c.includes("일지-월지")) ?? false;
}

function countTenGod(result: SajuResultType, god: string): number {
  return Object.entries(result.baseTenGods).reduce(
    (sum, [key, val]) => (key === god ? sum + val : sum),
    0
  );
}

function checkOnlyWoljiPyungwan(result: SajuResultType): boolean {
  const monthTenGods = [result.month.tenGodSky, result.month.tenGodGround];
  const count = monthTenGods.filter((g) => g === "편관").length;
  return count === 1 && countTenGod(result, "편관") === 1;
}

function hasAllFiveElements(result: SajuResultType): boolean {
  return Object.keys(result.baseElements).filter((e) => result.baseElements[e] > 0).length === 5;
}

function getMaxSameElementCount(elements: Record<string, number>): number {
  return Math.max(...Object.values(elements));
}

function getSameSeason(result: SajuResultType): string | null {
  const monthSeason = BRANCH_TO_SEASON[result.month.ground as JiKey];
    const daySeason = BRANCH_TO_SEASON[result.day.ground as JiKey];
  if (!monthSeason || !daySeason) return null;

  if ((monthSeason === "winter" && daySeason === "summer") ||
      (monthSeason === "summer" && daySeason === "winter")) {
    return "겨울여름";
  }
  if ((monthSeason === "spring" && daySeason === "autumn") ||
      (monthSeason === "autumn" && daySeason === "spring")) {
    return "봄가을";
  }
  return null;
}

function checkWoljiSupportsIlgan(result: SajuResultType): boolean {
  const woljiElement = getElementFromJi(result.month.ground as JiKey);
    const ilganElement = getElementFromGan(result.day.sky as GanKey);
  return isGenerating(woljiElement, ilganElement);
}

function countHyungshin(result: SajuResultType): number {
  const hyungshinList = scoreRules.hyungshinList;
  return result.specialGods?.filter(sg => hyungshinList.includes(sg.name)).length ?? 0;
}

function countSibunPositive(result: SajuResultType): number {
  return Object.values(result.twelveFortunes).filter((f) =>
    scoreRules.positiveSibun.includes(f)
  ).length;
}

function countSibunNegative(result: SajuResultType): number {
  return Object.values(result.twelveFortunes).filter((f) =>
    scoreRules.negativeSibun.includes(f)
  ).length;
}

function hasTenGod(result: SajuResultType, god: string): boolean {
  return countTenGod(result, god) > 0;
}

function hasWonjin(result: SajuResultType): boolean {
  return result.specialGods?.some((sg) => sg.name === "원진살") ?? false;
}

function hasCheonEulGuiIn(result: SajuResultType): boolean {
  return result.goodGods?.some((gg) => gg.name === "천을귀인") ?? false;
}
