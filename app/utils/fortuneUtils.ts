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
    // 인성/비겁 합산 4개 이상으로 기준 강화 (신강 오진단을 줄이고 신약으로 유도)
    return helperCount >= 4; 
}

export function checkDeuksi(daySky: GanKey, hourGround: JiKey): boolean {
    const ilganEl = getElementFromGan(daySky);
    const hourJiEl = getElementFromJi(hourGround);
    return isGenerating(hourJiEl, ilganEl) || hourJiEl === ilganEl;
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

const JO_HU_MAP: Record<JiKey, FiveElementType[]> = {
    // 寅卯辰 - 봄
    "인": ["화"], "묘": ["화"], "진": ["수"], 
    // 巳午未 - 여름
    "사": ["수"], "오": ["수"], "미": ["수"],
    // 申酉戌 - 가을
    "신": ["화"], "유": ["화"], "술": ["수"],
    // 亥子丑 - 겨울
    "해": ["화"], "자": ["화"], "축": ["화"],
};

export function determineJoHuYongsin(monthGround: JiKey): FiveElementType[] {
    return JO_HU_MAP[monthGround] ?? [];
}


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
    monthGround: JiKey, // <-- 조후 계산을 위해 월지(JiKey) 추가
    strength: IlganStrength, 
    baseElements: Record<string, number>
): FiveElementType[] {
    const ilganEl = getElementFromGan(daySky);
    const elements: Record<string, number> = baseElements;
    
    let yongsins: FiveElementType[] = [];
    
    // 1. 억부 용신 후보 계산 및 정렬
    // 1. 신강/태강/극왕 (強)
    if (["극왕", "태강", "신강", "중화신강"].includes(strength)) {
        const candidates: FiveElementType[] = []; 
        
        // 신강한 사주는 힘을 빼거나 극하는 오행(식상, 관살, 재성)이 용신 후보가 됨
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
        // 신약한 사주는 일간을 돕는 인성(生助)과 비겁(比和)이 용신 후보가 됨 (억부용신)
        const inseong = rel[ilganEl].producedBy; // 인성
        const bigeop = ilganEl;                 // 비겁
        
        const candidates: FiveElementType[] = [inseong, bigeop];

        // 후보군 중 오행 분포(baseElements)가 가장 약한 순서대로 정렬
        const sortedCandidates = candidates
            .filter((el, i, arr) => arr.indexOf(el) === i) 
            .sort((a, b) => (elements[a] ?? 0) - (elements[b] ?? 0));
            
        // 신약 사주에서는 인성과 비겁 중 가장 필요한 2개 반환
        yongsins = sortedCandidates.slice(0, 2);
    } else {
        // 중화인 경우 가장 약한 오행을 용신으로 반환
        return [findWeakestElementInline(baseElements)];
    }

    // 3. 조후 용신 계산 및 통합
    const joHuYongsin = determineJoHuYongsin(monthGround);
    
    // 조후 용신을 1순위로 배치하고 억부 용신을 뒤에 배치 (최대 2개 반환)
    const combined = Array.from(new Set([...joHuYongsin, ...yongsins]));

    // 중복 제거 후 반환
    return combined.slice(0, 2);
}