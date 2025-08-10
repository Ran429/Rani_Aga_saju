import { fiveElements, yinYang, rel, tenKan, twelveJi } from "../constants/elements";

// 타입 정의
export type GanKey = typeof tenKan[number]; // '갑' | '을' ...
export type JiKey = typeof twelveJi[number]; // '자' | '축' ...
export type FiveElementType = typeof fiveElements[GanKey];
export type YinYangKey = keyof typeof yinYang;
export type RelKey = keyof typeof rel;

// ✅ 오행 색상 매핑 (UI 전용)
export const elementColors: Record<FiveElementType, string> = {
  목: "text-green-600",
  화: "text-red-600",
  토: "text-yellow-600",
  금: "text-gray-600",
  수: "text-blue-600",
};

// ✅ 음/양 배경색 매핑 (UI 전용)
export const yinYangBgColors: Record<string, string> = {
  양: "bg-orange-100", // 연한 주황
  음: "bg-blue-100",   // 연한 파랑
};

// ✅ 오행 값 얻기 (계산용)
export const getElement = (ch: GanKey | JiKey): FiveElementType => {
  return fiveElements[ch as GanKey];
};

// ✅ UI용 오행 색상 키 반환
export const getElementColorKey = (char: GanKey | JiKey): keyof typeof elementColors => {
  const element = getElement(char);
  return element;
};

// ✅ 음양 값 얻기
export const getYY = (ch: GanKey | JiKey): (typeof yinYang)[YinYangKey] | null => {
  return yinYang[ch as YinYangKey] || null;
};

// ✅ 십신 계산
export function getTenGod(daySky: GanKey, target: GanKey): string;
export function getTenGod(daySky: GanKey, target: JiKey): string;
export function getTenGod(daySky: GanKey, target: GanKey | JiKey): string {
  const dayEl = getElement(daySky);
  const tgtEl = getElement(target);

  if (!dayEl || !tgtEl) return "알 수 없음";

  const tgtYY = tenKan.includes(target as GanKey) ? getYY(target as GanKey) : null;
  const sameYY = tgtYY ? getYY(daySky) === tgtYY : null;

  let category = "";
  if (tgtEl === dayEl) category = "비겁";
  else if (tgtEl === rel[dayEl].produces) category = "식상";
  else if (tgtEl === rel[dayEl].controls) category = "재성";
  else if (tgtEl === rel[dayEl].controlledBy) category = "관성";
  else if (tgtEl === rel[dayEl].producedBy) category = "인성";
  else return "알 수 없음";

  if (category === "비겁") return sameYY === true ? "비견" : "겁재";
  if (category === "식상") return sameYY === true ? "식신" : "상관";
  if (category === "재성") return sameYY === false ? "정재" : "편재";
  if (category === "관성") return sameYY === false ? "정관" : "편관";
  if (category === "인성") return sameYY === false ? "정인" : "편인";
  return "알 수 없음";
}

// ✅ 지지별 지장간 매핑
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

// ✅ 지지 → 지장간 반환
export function getHiddenStems(branch: JiKey): GanKey[] {
  return hiddenStemsMap[branch] || [];
}

// ✅ 십신 상세 그룹
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