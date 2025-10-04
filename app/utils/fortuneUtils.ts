/**
 * 📄 app/utils/fortuneUtils.ts
 * 역할: 공통 유틸 함수 모음
 * exports: calculateTwelveFortunes
 * imports: ../constants/elements, ./elementUtils
 * referenced by: app/calculators/sajuCalculator.ts
 */
// src/utils/fortuneUtils.ts
import { twelveJi} from "../constants/elements";
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

/**
 * 일간 강약 등급에 따라 용신(가장 도움이 되는 오행)을 결정합니다.
 * (신강은 설기/극제, 신약은 생조/비화 오행 중 가장 약한 것을 용신으로 삼는 간소화 로직)
 * @param daySky 일간
 * @param strength 8단계 강약 등급
 * @param baseElements 오행 분포 (가중치 적용된 baseElements)
 * @returns 용신 오행 (FiveElementType)
 */

// 🔹 조후용신 기본 매핑
const JO_HU_MAP: Record<string, { main: FiveElementType; sub?: FiveElementType }> = {
  "寅": { main: "화", sub: "목" }, // 봄
  "卯": { main: "화", sub: "목" },
  "辰": { main: "목", sub: "화" },

  "巳": { main: "토", sub: "화" }, // 여름
  "午": { main: "토", sub: "화" },
  "未": { main: "토", sub: "화" },

  "申": { main: "금", sub: "수" }, // 가을
  "酉": { main: "금", sub: "수" },
  "戌": { main: "화", sub: "토" },

  "亥": { main: "목", sub: "수" }, // 겨울
  "子": { main: "수", sub: "목" },
  "丑": { main: "수", sub: "토" },
};

function determineEokbu(ilganStrength: IlganStrength, baseElements: Record<FiveElementType, number>): FiveElementType {
  // 일간이 신약이면 → 같은 오행(비겁) + 생해주는 오행(인성)
  // 일간이 신강이면 → 극하는 오행(재·관) + 누르는 오행
  // 단순화: 부족 오행 우선
  const sorted = Object.entries(baseElements).sort((a, b) => a[1] - b[1]); 
  return sorted[0][0] as FiveElementType;
}

// 🔹 조후용신 계산
function determineJoHu(monthBranch: string): FiveElementType {
  const mapping = JO_HU_MAP[monthBranch];
  return mapping?.main ?? "토"; // 기본 안전값
}

// 🔹 최종 용신 결정
export function determineJoHuYongsin(
  dayStem: string,
  monthBranch: string,
  ilganStrength: IlganStrength,
  baseElements: Record<FiveElementType, number>
): FiveElementType[] {
  const joHu = determineJoHu(monthBranch); // 계절 조후
  const eokbu = determineEokbu(ilganStrength, baseElements); // 억부

  return mergeYongsin(ilganStrength, joHu, eokbu);
}

// 🔹 조후·억부 병합 규칙
export function mergeYongsin(
  ilganStrength: IlganStrength,
  joHu: FiveElementType,
  eokbu: FiveElementType
): FiveElementType[] {
  if (ilganStrength.includes("신강")) {
    // 신강 계열: 조후 → 억부
    return joHu === eokbu ? [joHu] : [joHu, eokbu];
  }
  if (ilganStrength.includes("신약")) {
    // 신약 계열: 억부 → (조건부) 조후
    return joHu === eokbu ? [eokbu] : [eokbu, joHu];
  }
  if (ilganStrength.includes("중화")) {
    // 중화: 부족 오행 위주
    return joHu === eokbu ? [joHu] : [joHu, eokbu];
  }
  // 태약/극약 등은 신약과 동일 처리
  return joHu === eokbu ? [eokbu] : [eokbu, joHu];
}