const scoreRules = {
  base_score: 100,

  hyungshinList: [
    "백호대살",
    "괴강살",
    "현침살",
    "원진살",
    "귀문관살"
  ],

  positiveSibun: [
    "장생",
    "건록",
    "제왕"
  ],

  negativeSibun: [
    "쇠",
    "병",
    "사",
    "묘",
    "절"
  ],

  deductions: [
    { condition: "ctx.ilji_wolji_chung", label: "일지-월지 충", change: -15 },
    { condition: "ctx.pyungwan_count >= 2", label: "편관이 2개 이상", change: -15 },
    { condition: "ctx.only_wolji_pyungwan", label: "월지가 편관만 있음", change: -5 },
    { condition: "ctx.has_all_elements", label: "모든 오행을 갖춤", change: -10 },
    { condition: "ctx.hap_count >= 2", label: "합이 2개 이상", change: -5 },
    { condition: "ctx.same_element_count >= 4", label: "동일 오행이 4개 이상", change: -10 },
    { condition: "ctx.same_season == '겨울여름'", label: "겨울·여름 계절 조합", change: -10 },
    { condition: "ctx.same_season == '봄가을'", label: "봄·가을 계절 조합", change: -5 },
    { condition: "ctx.hyungshin_count >= 4", label: "흉신이 4개 이상", change: -10 },
    { condition: "ctx.sibun_negative_count >= 2", label: "12운에서 쇠·병·사·묘·절이 2개 이상", change: -10 },
    { condition: "(!ctx.jaesung) && (!ctx.siksang)", label: "재성·식상이 모두 없음", change: -10 },
    { condition: "(!ctx.jaesung)", label: "재성이 없음", change: -5 },
    { condition: "(ctx.jaesung) && (!ctx.siksang)", label: "재성은 있으나 식상이 없음", change: -5 },
    { condition: "ctx.wonjin", label: "원진살 존재", change: -15 }
  ],

  bonuses: [
    { condition: "ctx.wolji_supports_ilgan", label: "월지가 일간을 생함", change: 25 },
    { condition: "ctx.gilshin_count >= 4", label: "길신이 4개 이상", change: 15 },
    { condition: "ctx.sibun_positive_count >= 2", label: "시분이 긍정적 2개 이상", change: 15 },
    { condition: "ctx.cheon_eul_gui_in", label: "천을귀인 존재", change: 15 }
  ],

  limits: { min: 50, max: 100 }
};

export default scoreRules;
