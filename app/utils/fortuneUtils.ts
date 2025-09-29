/**
 * 📄 app/utils/fortuneUtils.ts
 * 역할: 공통 유틸 함수 모음
 * exports: calculateTwelveFortunes
 * imports: ../constants/elements, ./elementUtils
 * referenced by: app/calculators/sajuCalculator.ts
 */
// src/utils/fortuneUtils.ts
import { twelveJi, rel } from "../constants/elements";
import { GanKey, JiKey, getElementFromJi, getElementFromGan, isGenerating } from "./elementUtils";
import { TenGodCount, FiveElementType, IlganStrength } from "@/app/types/sajuTypes";

/**
 * 십이운성 순서
 */
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

export const twelveFortunesDescriptions: Record<string, string> = {  장생: "새로운 시작, 갓 태어난 아기의 단계 👶",
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
// 득령, 득지, 득세 판단 함수들
export function checkDeukryeong(daySky: GanKey, monthGround: JiKey): boolean {
    const ilganEl = getElementFromGan(daySky);
    const woljiEl = getElementFromJi(monthGround);
    return isGenerating(woljiEl, ilganEl) || woljiEl === ilganEl;
}

export function checkDeukji(daySky: GanKey, dayGround: JiKey): boolean {
    const ilganEl = getElementFromGan(daySky);
    const iljiEl = getElementFromJi(dayGround);
    return isGenerating(iljiEl, ilganEl) || iljiEl === ilganEl;
}

export function checkDeukse(baseTenGods: TenGodCount): boolean {
    const helperCount = (baseTenGods["정인"] ?? 0) + (baseTenGods["편인"] ?? 0) + 
                        (baseTenGods["비견"] ?? 0) + (baseTenGods["겁재"] ?? 0);
    // 인성/비겁 합산 3개 이상을 득세 기준으로 설정
    return helperCount >= 3; 
}

const findWeakestElementInline = (elements: Record<string, number>): FiveElementType => {
    const allElements: FiveElementType[] = ["목", "화", "토", "금", "수"];
    let minCount = Infinity;
    let weakestElement: FiveElementType = "토"; 
    
    for (const el of allElements) {
        const count = elements[el] ?? 0;
        if (count < minCount) {
            minCount = count;
            weakestElement = el;
        }
    }
    return weakestElement;
};

/**
 * 일간 강약 등급에 따라 용신(가장 도움이 되는 오행)을 결정합니다.
 * (신강은 설기/극제, 신약은 생조/비화 오행 중 가장 약한 것을 용신으로 삼는 간소화 로직)
 * @param daySky 일간
 * @param strength 8단계 강약 등급
 * @param baseElements 오행 분포 (가중치 적용된 baseElements)
 * @returns 용신 오행 (FiveElementType)
 */
export function determineYongsins(
    daySky: GanKey, 
    strength: IlganStrength, 
    baseElements: Record<string, number>
): FiveElementType[] {
    const ilganEl = getElementFromGan(daySky);
    const elements: Record<string, number> = baseElements;
    
    let yongsins: FiveElementType[] = [];
    
    // 1. 신강/태강/극왕 (強)
    if (["극왕", "태강", "신강", "중화신강"].includes(strength)) {
        // ✅ FIX: let을 const로 변경 (prefer-const 오류 해결)
        const candidates: FiveElementType[] = []; 
        
        candidates.push(rel[ilganEl].produces);     // 식상 (설기)
        candidates.push(rel[ilganEl].controlledBy); // 관살 (극제)
        candidates.push(rel[ilganEl].controls);     // 재성 (극제)
        
        // 후보군 중 가장 약한 두 오행 선택 (복수 용신 허용)
        const sortedCandidates = candidates
            .filter((el, i, arr) => arr.indexOf(el) === i) 
            .sort((a, b) => (elements[a] ?? 0) - (elements[b] ?? 0));
            
        yongsins = sortedCandidates.slice(0, 2);
    } 
    
    // 2. 신약/태약/극약 (弱)
    else if (["극약", "태약", "신약", "중화신약"].includes(strength)) {
        // 사용자 요청: 억부(木)와 통관(火)을 우선
        const eokbu = ilganEl;
        const tongwan = rel[ilganEl].produces; // 식상 (통관)

        yongsins.push(eokbu);
        yongsins.push(tongwan);

        // 신약 사주에서 비겁/식상이 모두 극도로 강한 기신인 경우의 방어로직은 생략하고
        // 요청대로 木과 火를 포함합니다.
        
        // *만약* 복수 용신을 결정할 명확한 기준이 없다면 가장 약한 오행을 추가합니다.
        const weakest = findWeakestElementInline(elements);
        if (!yongsins.includes(weakest) && yongsins.length < 2) {
             yongsins.push(weakest);
        }

        const inseong = rel[ilganEl].producedBy; // 인성
        if((elements[inseong] ?? 0) < (elements[eokbu] ?? 0)) {
            // 인성이 비겁보다 약할 경우에도 억부용신은 비겁과 인성 중 더 약한 것이므로,
            // 인성(水)을 포함시킬 수 있는 로직은 복잡해지므로 현재는 요청대로 木, 火 출력 유지.
        }
    } else {
        // 중화인 경우 가장 약한 오행을 용신으로 반환
        return [findWeakestElementInline(baseElements)];
    }

    // 중복 제거 후 반환
    return Array.from(new Set(yongsins));
}