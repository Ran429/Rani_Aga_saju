/**
 * 📄 app/calculators/scoreCalculator.ts
 * 역할: 사주 계산 관련 주요 로직
 * exports: ScoreInput, ScoreResult, calculate_score_with_limits
 * imports: @/app/constants/scoreRules
 * referenced by: app/calculators/sajuCalculator.ts, app/calculators/scoreInputBuilder.ts
 */
// app/calculators/scoreCalculator.ts
import rules from "@/app/constants/scoreRules";

export interface ScoreInput {
  name: string;
  ilji_wolji_chung: boolean;
  pyungwan_count: number;
  only_wolji_pyungwan: boolean;
  has_all_elements: boolean;
  hap_count: number;
  same_element_count: number;
  same_season: string | null; // "겨울여름" | "봄가을" | null
  wolji_supports_ilgan: boolean;
  gilshin_count: number;
  hyungshin_count: number;
  sibun_positive_count: number;
  sibun_negative_count: number;
  jaesung: boolean;
  siksang: boolean;
  wonjin: boolean;
  cheon_eul_gui_in: boolean;
}

export interface ScoreResult {
  name: string;
  total: number;
  details: Record<string, number>;
}


/**
 * 사주 점수를 계산하는 함수
 * @param data ScoreInput 형태의 데이터
 * @returns ScoreResult (총점, 조건 로그)
 */
export function calculate_score_with_limits(data: ScoreInput): ScoreResult {
  let score = rules.base_score;
  const log: Record<string, number> = {};

  // 감점 조건
rules.deductions.forEach((rule) => {
  if (evalCondition(rule.condition, data)) {
    score += rule.change;
    log[rule.label] = rule.change; // label 사용
  }
});

rules.bonuses.forEach((rule) => {
  if (evalCondition(rule.condition, data)) {
    score += rule.change;
    log[rule.label] = rule.change; // label 사용
  }
});

  // 제한 적용
  if (score > rules.limits.max) score = rules.limits.max;
  if (score < rules.limits.min) score = rules.limits.min;

  return { name: data.name, total: score, details: log };
}

/**
 * 문자열 조건을 실행하여 true/false 반환
 * @param condition string 조건식
 * @param ctx 데이터 객체
 */
function evalCondition(condition: string, ctx: ScoreInput): boolean {
  try {
    return Function("ctx", `with (ctx) { return ${condition}; }`)(ctx);
  } catch (e) {
    console.error(`조건 실행 오류: ${condition}`, e);
    return false;
  }
}

