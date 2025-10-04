/**
 * 📄 app/utils/fortuneUtils.ts
 * 역할: 공통 유틸 함수 모음
 * exports: calculateTwelveFortunes, checkDeukryeong, checkDeukji, checkDeukse, checkDeuksi, determineYongsins, twelveFortunesDescriptions
 * imports: ../constants/elements, ./elementUtils
 * referenced by: app/calculators/sajuCalculator.ts
 */
import { twelveJi, rel } from "../constants/elements";
import { GanKey, JiKey, getElementFromJi, getElementFromGan, isGenerating } from "./elementUtils";
import { TenGodCount, FiveElementType, IlganStrength } from "@/app/types/sajuTypes";

/** ──────────────────────────────────────────────────────────
 * 십이운성 (Twelve Fortunes)
 * ────────────────────────────────────────────────────────── */

const twelveFortunesOrder = [
  "장생", "목욕", "관대", "건록", "제왕",
  "쇠", "병", "사", "묘", "절", "태", "양"
] as const;
type TwelveFortuneName = typeof twelveFortunesOrder[number];

const ganStartMap: Record<GanKey, { start: JiKey; forward: boolean }> = {
  "갑": { start: "해", forward: true },
  "을": { start: "오", forward: false },
  "병": { start: "인", forward: true },
  "정": { start: "신", forward: false },
  "무": { start: "인", forward: true },
  "기": { start: "신", forward: false },
  "경": { start: "사", forward: true },
  "신": { start: "자", forward: false },
  "임": { start: "신", forward: true },
  "계": { start: "묘", forward: false },
};

export const calculateTwelveFortunes = (
  daySky: GanKey,
  ground: JiKey
): TwelveFortuneName => {
  const { start, forward } = ganStartMap[daySky];
  const startIndex = twelveJi.indexOf(start);
  const targetIndex = twelveJi.indexOf(ground);
  if (startIndex === -1 || targetIndex === -1) return "장생";

  const distance = forward
    ? (targetIndex - startIndex + 12) % 12
    : (startIndex - targetIndex + 12) % 12;

  return twelveFortunesOrder[distance];
};

export const twelveFortunesDescriptions: Record<string, string> = {  
  장생: "새로운 시작, 갓 태어난 아기의 단계 👶",
  목욕: "깨끗이 씻고 세상에 나서는 단계 🛁",
  관대: "청년기, 사회적으로 활발히 활동하는 시기 💪",
  건록: "안정과 기반을 갖춘 단계 🏡",
  제왕: "정점에 올라 힘이 강한 시기 👑",
  쇠: "기운이 조금씩 줄어드는 단계 🍂",
  병: "몸이 아프듯 약해지는 시기 🤒",
  사: "죽음을 맞이하는 단계 ⚰️",
  묘: "무덤에 들어간 상태, 휴식의 시기 🪦",
  절: "다시 태어나기 전, 끊어짐의 단계 ✂️",
  태: "씨앗처럼 새로운 생명의 시작 🌱",
  양: "태아가 자라나는 시기 🤰",
};

/** ──────────────────────────────────────────────────────────
 * 일간 강약 판단 (득령/득지/득세/득시)
 * ────────────────────────────────────────────────────────── */

export function checkDeukryeong(daySky: GanKey, monthGround: JiKey): boolean {
    const ilganEl = getElementFromGan(daySky);
    const woljiEl = getElementFromJi(monthGround);
    return isGenerating(woljiEl, ilganEl) || woljiEl === ilganEl;
}

// 득지 (일지에서 도움을 받음)
export function checkDeukji(daySky: GanKey, dayGround: JiKey): boolean {
    const ilganEl = getElementFromGan(daySky);
    const iljiEl = getElementFromJi(dayGround);
    return isGenerating(iljiEl, ilganEl) || iljiEl === ilganEl;
}

// 득세 (인성/비겁의 총합이 4개 이상이면 득세로 판단)
export function checkDeukse(baseTenGods: TenGodCount): boolean {
    const helperCount = (baseTenGods["정인"] ?? 0) + (baseTenGods["편인"] ?? 0) + 
                        (baseTenGods["비견"] ?? 0) + (baseTenGods["겁재"] ?? 0);
    return helperCount >= 4; 
}

// 득시 (시지에서 도움을 받음)
export function checkDeuksi(daySky: GanKey, hourGround: JiKey): boolean {
    const ilganEl = getElementFromGan(daySky);
    const hourJiEl = getElementFromJi(hourGround);
    return isGenerating(hourJiEl, ilganEl) || hourJiEl === ilganEl;
}

/** ──────────────────────────────────────────────────────────
 * 용신 결정 로직 (억부, 조후, 통관 통합)
 * ────────────────────────────────────────────────────────── */

// 🔹 Eokbu Yongsin Helper (Rule 1 & 2)
function determineEokbu(
  daySky: GanKey,
  ilganStrength: IlganStrength,
  baseElements: Record<FiveElementType, number>
): FiveElementType[] {
  const ilganEl = getElementFromGan(daySky);
  const candidates: FiveElementType[] = [];

  // 1. 신강한 사주: 힘을 덜어내거나 제어하는 오행(식상, 재성, 관성)
  if (ilganStrength.includes("신강") || ilganStrength.includes("태강") || ilganStrength.includes("극왕")) {
    candidates.push(rel[ilganEl].produces as FiveElementType);     // 식상 (설기)
    candidates.push(rel[ilganEl].controlledBy as FiveElementType); // 관살 (극제)
    candidates.push(rel[ilganEl].controls as FiveElementType);     // 재성 (극제)
  } 
  // 2. 신약한 사주: 생해주거나 보태주는 오행(인성, 비겁)
  else if (ilganStrength.includes("신약") || ilganStrength.includes("태약") || ilganStrength.includes("극약")) {
    // 2-1. 후보군: 인성과 비겁
    const inSeong = rel[ilganEl].producedBy as FiveElementType;
    const biKyeop = ilganEl;

    // 2-2. 특수 보정: 재성/관살 과다 체크 (재다신약, 살태과)
    const opposingElements = [rel[ilganEl].controls, rel[ilganEl].controlledBy];
    const totalOpposition = opposingElements.reduce((sum, el) => sum + (baseElements[el] ?? 0), 0);

    // [핵심 수정]: 신약 & 반대 기운(재성/관살) 합이 4점 이상일 때 
    if (totalOpposition >= 4) { 
        // 乙木(木) vs 土(財)처럼 재다신약: 比劫(木)이 土를 감당해야 함.
        // 壬水(水) vs 土(殺)처럼 살태과: 食傷(木)이 土를 제압해야 함.
        
        const strongestOpposite = opposingElements.sort((a, b) => (baseElements[b] ?? 0) - (baseElements[a] ?? 0))[0] as FiveElementType;
        
        if (strongestOpposite === rel[ilganEl].controls) { // 재성 과다 (財多身弱)
            // 재성을 극하는 비겁(比劫)을 용신으로: 木 (을목)
            candidates.push(biKyeop);
            candidates.push(inSeong);
        } else if (strongestOpposite === rel[ilganEl].controlledBy) { // 관살 과다 (殺太過)
            // 관살을 제하는 식상(食傷)을 용신으로: 食傷
            candidates.push(rel[ilganEl].produces as FiveElementType); 
            candidates.push(inSeong);
        } else {
             // 일반적인 扶弱 원칙 (인성/비겁)
            candidates.push(inSeong);
            candidates.push(biKyeop);
        }
    } else {
        // 일반적인 扶弱 원칙 (인성/비겁)
        candidates.push(inSeong);
        candidates.push(biKyeop);
    }
  }
  // 3. 중화는 가장 부족한 요소로 대체 (가장 약한 오행)
  else {
    const sorted = (Object.entries(baseElements) as [FiveElementType, number][])
        .filter(([, count]) => count > 0)
        .sort((a, b) => a[1] - b[1]);
    return sorted.length > 0 ? [sorted[0][0] as FiveElementType] : [];
  }

  const uniqueCandidates = Array.from(new Set(candidates));

  // 후보군 중 오행 분포가 높은 순으로 2개 선택 (신약/신강 로직을 통과한 '필요한' 요소들 중)
  // 재다신약/살태과에서는 이미 강력한 요소(비겁/식상)가 우선순위에 배치되었으므로,
  // 이제 오행 점수가 높은 순으로 2개를 선택하는 것이 합리적입니다.

  const sortedCandidates = uniqueCandidates
    .map(el => ({ el, count: baseElements[el] ?? 0 }))
    .sort((a, b) => b.count - a.count); // 높은 순으로 변경

  // [수정 이유]: 재다신약(木)은 이미 3개로 약하지 않으나 '가장 필요한' 요소이므로, 
  // 기존의 '가장 약한 요소(0개인 水)'를 찾는 대신, '가장 필요한 요소'를 후보군에 넣고, 
  // 여기서는 후보군 중 순서를 정하는 방식으로 전환합니다.
    
  // 최종적으로 가장 많이 보조할 수 있는 두 요소를 선택 (일반적인 억부 원칙을 따름)
  return sortedCandidates.slice(0, 2).map(c => c.el);
}

// 🔹 Tonggwan Yongsin Logic (Rule 3)
function determineTonggwanYongsin(
    baseElements: Record<FiveElementType, number>
): FiveElementType | undefined {
    // 1. 오행 분포를 내림차순으로 정렬
    const sortedElements = Object.entries(baseElements) as [FiveElementType, number][];
    const filteredAndSorted = sortedElements
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]); 

    // 2. 가장 강한 두 오행 추출
    if (filteredAndSorted.length < 2) return undefined;

    const [E1, E1_count] = filteredAndSorted[0];
    const [E2, E2_count] = filteredAndSorted[1];
    
    // 두 오행의 강도 차이가 1.5점 이내일 때만 통관을 고려 (팽팽한 충돌 상황 가정)
    if (E1_count < 2 || E2_count < 2 || (E1_count - E2_count) > 1.5) return undefined;

    // 3. 剋 관계인지 확인 (상극 관계가 없으면 통관 필요 없음)
    const E1_controls_E2 = rel[E1].controls === E2;
    const E2_controls_E1 = rel[E2].controls === E1;
    
    if (!E1_controls_E2 && !E2_controls_E1) return undefined;

    // 4. 통관 오행 찾기: (剋하는 오행)이 (통관 오행)을 생(生)하고, (통관 오행)이 (剋 당하는 오행)을 생(生)함.
    if (E1_controls_E2) { // E1 剋 E2: E1 -> X -> E2, X = E1.produces
        return rel[E1].produces as FiveElementType; 
    } else if (E2_controls_E1) { // E2 剋 E1: E2 -> X -> E1, X = E2.produces
        return rel[E2].produces as FiveElementType;
    }
    return undefined; 
}

// 🔹 조후 용신 계산 (Rule 3)
function determineJoHu(monthBranch: JiKey): FiveElementType[] {
  // 계절의 한열조습을 중화하는 오행
  
  // 겨울 (亥子丑) -> 火 (따뜻함)
  if (["해", "자", "축"].includes(monthBranch)) return ["화"]; 
  
  // 여름 (巳午未) -> 水 (차가움)
  if (["사", "오", "미"].includes(monthBranch)) return ["수"]; 
  
  // 봄 (寅卯辰) -> 火 (습한 경우 조(燥))
  if (["인", "묘", "진"].includes(monthBranch)) return ["화"];
  
  // 가을 (申酉戌) -> 水 (건조함)
  if (["신", "유", "술"].includes(monthBranch)) {
      return ["수"]; 
  }
  return [];
}

/**
 * 일간 강약 등급에 따라 용신(가장 도움이 되는 오행)을 결정합니다.
 * (우선순위: 통관 > 조후 > 억부)
 * @param daySky 일간
 * @param monthGround 월지
 * @param ilganStrength 8단계 강약 등급
 * @param baseElements 오행 분포 (가중치 적용된 baseElements)
 * @returns 용신 오행 목록 (최대 2개)
 */
export function determineYongsins(
    daySky: GanKey, 
    monthGround: JiKey, 
    ilganStrength: IlganStrength, 
    baseElements: Record<FiveElementType, number>
): FiveElementType[] {
    const johuYongsins = determineJoHu(monthGround);
    const eokbuYongsins = determineEokbu(daySky, ilganStrength, baseElements);
    const tonggwanYongsin = determineTonggwanYongsin(baseElements);
    
    // 1. 후보군 합치기 (조후, 억부 순)
    const combined = Array.from(new Set([...johuYongsins, ...eokbuYongsins]));
    
    // 2. 통관 용신을 최고 순위로 배치
    if (tonggwanYongsin) {
        if (!combined.includes(tonggwanYongsin)) {
            // 목록에 없으면 추가하고 최우선 순위 부여
            combined.unshift(tonggwanYongsin);
        } else {
            // 이미 목록에 있다면, 최상위로 올림 (우선순위 부여)
            const index = combined.indexOf(tonggwanYongsin);
            combined.splice(index, 1);
            combined.unshift(tonggwanYongsin);
        }
    }
    
    // 최대 2개 반환
    return combined.slice(0, 2);
}