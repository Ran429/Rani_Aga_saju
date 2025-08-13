// C:\Users\zeroj\saju\Rani_Aga_saju\app\utils\elementUtils.ts
import { fiveElements, yinYang, rel, tenKan } from "../constants/elements";
import { GanKey as DGanKey, JiKey as DJiKey } from "./dateUtils";

// ✅ dateUtils에서 가져온 타입을 재export
export type GanKey = DGanKey;
export type JiKey = DJiKey;

// ✅ 오행 타입 (목, 화, 토, 금, 수)
export type FiveElementType = keyof typeof elementColors;

// 이 파일 전용 타입
export type YinYangKey = keyof typeof yinYang;
export type RelKey = keyof typeof rel;

type ElementType = "목" | "화" | "토" | "금" | "수";

// ✅ 오행 색상 매핑
export const elementColors: Record<ElementType, string> = {
  목: "text-green-600",
  화: "text-red-600",
  토: "text-yellow-600",
  금: "text-gray-600",
  수: "text-blue-600",
};

// ✅ 음/양 배경색
export const yinYangBgColors: Record<string, string> = {
  양: "bg-orange-100",
  음: "bg-blue-100",
};

// ✅ 오행 얻기
export const getElement = (ch: GanKey | JiKey): ElementType => {
  return fiveElements[ch as GanKey];
};

// ✅ 간에서 오행 얻기
export const getElementFromGan = (gan: GanKey): ElementType => {
  return fiveElements[gan];
};

// ✅ 지에서 오행 얻기
export const getElementFromJi = (ji: JiKey): ElementType => {
  return fiveElements[ji];
};

// ✅ 색상 키
export const getElementColorKey = (char: GanKey | JiKey): keyof typeof elementColors => {
  return getElement(char);
};

// ✅ 음양 얻기
export const getYY = (ch: GanKey | JiKey) => {
  return yinYang[ch as YinYangKey] || null;
};

// ✅ 십신 계산
export function getTenGod(daySky: GanKey, target: GanKey | JiKey): string {
  const dayEl = getElement(daySky);
  const tgtEl = getElement(target);
  if (!dayEl || !tgtEl) return "알 수 없음";

  const tgtYY = tenKan.includes(target as GanKey) ? getYY(target as GanKey) : null;
  const sameYY = tgtYY ? getYY(daySky) === tgtYY : null;

  let category = "";
  if (tgtEl === dayEl) category = "비겁";
  else if (rel[dayEl].produces === tgtEl) category = "식상";
  else if (rel[dayEl].controls === tgtEl) category = "재성";
  else if (rel[dayEl].controlledBy === tgtEl) category = "관성";
  else if (rel[dayEl].producedBy === tgtEl) category = "인성";
  else return "알 수 없음";

  if (category === "비겁") return sameYY === true ? "비견" : "겁재";
  if (category === "식상") return sameYY === true ? "식신" : "상관";
  if (category === "재성") return sameYY === false ? "정재" : "편재";
  if (category === "관성") return sameYY === false ? "정관" : "편관";
  if (category === "인성") return sameYY === false ? "정인" : "편인";
  return "알 수 없음";
}

// ✅ 지지 → 지장간
const hiddenStemsMap: Record<JiKey, GanKey[]> = {
  자: ["임"],
  축: ["기", "계", "신"],
  인: ["갑", "병", "무"],
  묘: ["을"],
  진: ["무", "을", "계"],
  사: ["병", "무", "경"],
  오: ["정", "기"],
  미: ["기", "을", "정"],
  신: ["경", "임"],
  유: ["신"],
  술: ["무", "신", "정"],
  해: ["임", "갑"],
};

export function getHiddenStems(branch: JiKey): GanKey[] {
  return hiddenStemsMap[branch] || [];
}

// ✅ 십신 그룹
export const getTenGodDetail = (daySky: GanKey, target: GanKey) => {
  const name = getTenGod(daySky, target);
  const groupMap: Record<string, string> = {
    비견: "비겁",
    겁재: "비겁",
    식신: "식상",
    상관: "식상",
    정재: "재성",
    편재: "재성",
    정관: "관성",
    편관: "관성",
    정인: "인성",
    편인: "인성",
  };
  return { name, group: groupMap[name] || "알 수 없음" };
};

// ✅ 상생 여부
export const isGenerating = (from: ElementType, to: ElementType): boolean => {
  return rel[from].produces === to;
};

// ✅ 기본 오행 분포
export function baseElements(
  pillars: { sky: GanKey; ground: JiKey }[]
): Record<ElementType, number> {
  const base: Record<ElementType, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  pillars.forEach(({ sky, ground }) => {
    const skyEl = fiveElements[sky];
    const groundEl = fiveElements[ground];
    if (skyEl) base[skyEl] += 1;
    if (groundEl) base[groundEl] += 1;
  });
  return base;
}
