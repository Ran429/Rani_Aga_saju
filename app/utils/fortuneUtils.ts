import { fiveElements, twelveJi } from "../constants/elements";

// 타입 추출
type GanJiKey = keyof typeof fiveElements; // "갑" | "을" | "병" ...
type FiveElementValue = typeof fiveElements[GanJiKey]; // "목" | "화" | ...
type TwelveJiKey = typeof twelveJi[number]; // "자" | "축" | ...

export const calculateTwelveFortunes = (
  daySky: GanJiKey,
  ground: TwelveJiKey
) => {
  const fortunes: Record<FiveElementValue, string[]> = {
    "목": ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"],
    "화": ["절", "태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘"],
    "토": ["묘", "절", "태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사"],
    "금": ["병", "사", "묘", "절", "태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠"],
    "수": ["제왕", "쇠", "병", "사", "묘", "절", "태", "양", "장생", "목욕", "관대", "건록"]
  };
  const index = twelveJi.indexOf(ground);
  return fortunes[fiveElements[daySky]][index];
};

export const calculateTwelveGods = (
  yearGround: TwelveJiKey,
  targetGround: TwelveJiKey
) => {
  const gods: Record<TwelveJiKey, string[]> = {
    "자": ["장성", "역마", "반안", "재살", "월살", "망신", "천살", "육해", "화개", "겁살", "천문", "천기"],
    "축": ["망신", "천살", "육해", "화개", "겁살", "천문", "천기", "장성", "역마", "반안", "재살", "월살"],
    "인": [], "묘": [], "진": [], "사": [], "오": [], "미": [], "신": [], "유": [], "술": [], "해": []
  };
  const index = twelveJi.indexOf(targetGround);
  return gods[yearGround]?.[index] || "없음";
};

export const checkSpecialGods = (
  ground: TwelveJiKey,
  daySky: GanJiKey,
  otherGround: TwelveJiKey | null = null
) => {
  const specialGods = {
    yeokma: ["신", "자", "진", "사", "유", "축", "인", "오", "술", "해", "묘", "미"] as TwelveJiKey[],
    dohwa: ["자", "묘", "오", "유"] as TwelveJiKey[],
    hwagae: ["진", "술", "축", "미"] as TwelveJiKey[],
    gwaegang: ["진", "술", "오", "미"] as TwelveJiKey[],
    baekho: ["갑진", "을미", "병술", "정축", "무진", "임술", "계축"],
    yangin: ["병오", "무오", "임자"],
    jaesal: ["사", "유", "축", "신", "자", "진"] as TwelveJiKey[],
    wolsal: ["인", "오", "술", "해", "묘", "미"] as TwelveJiKey[],
    mangsin: ["진", "술", "축", "미"] as TwelveJiKey[],
    geopsal: ["사", "유", "축", "신", "자", "진"] as TwelveJiKey[],
    yukhae: { "자": "미", "축": "오", "인": "사", "묘": "진", "신": "해", "유": "술", "미": "자", "오": "축", "사": "인", "진": "묘", "해": "신", "술": "유" } as Record<TwelveJiKey, TwelveJiKey>,
    wonjin: { "진": "해", "오": "축", "사": "술", "묘": "신", "인": "유", "자": "미", "해": "진", "축": "오", "술": "사", "신": "묘", "유": "인", "미": "자" } as Record<TwelveJiKey, TwelveJiKey>,
    cheondeok: { "갑": "해", "을": "자", "병": "축", "정": "인", "무": "묘", "기": "진", "경": "사", "신": "오", "임": "미", "계": "신" } as Record<GanJiKey, TwelveJiKey>,
    moonchang: { "갑": "사", "을": "오", "병": "신", "정": "유", "무": "신", "기": "유", "경": "해", "신": "자", "임": "인", "계": "묘" } as Record<GanJiKey, TwelveJiKey>,
    banan: ["인", "묘", "진", "사", "오", "미"] as TwelveJiKey[],
    hyeolin: ["자", "오", "묘", "유"] as TwelveJiKey[],
    goran: ["자", "오", "묘", "유"] as TwelveJiKey[],
    cheonra: ["진", "술"] as TwelveJiKey[],
    jimaang: ["축", "미"] as TwelveJiKey[]
  };

  return {
    yeokma: specialGods.yeokma.includes(ground),
    dohwa: specialGods.dohwa.includes(ground),
    hwagae: specialGods.hwagae.includes(ground),
    gwaegang: specialGods.gwaegang.includes(ground),
    baekho: specialGods.baekho.includes(ground),
    yangin: specialGods.yangin.includes(ground),
    jaesal: specialGods.jaesal.includes(ground),
    wolsal: specialGods.wolsal.includes(ground),
    mangsin: specialGods.mangsin.includes(ground),
    geopsal: specialGods.geopsal.includes(ground),
    yukhae: otherGround ? specialGods.yukhae[ground] === otherGround : false,
    wonjin: otherGround ? specialGods.wonjin[ground] === otherGround : false,
    cheondeok: specialGods.cheondeok[daySky] === ground,
    moonchang: specialGods.moonchang[daySky] === ground,
    banan: specialGods.banan.includes(ground),
    hyeolin: specialGods.hyeolin.includes(ground),
    goran: specialGods.goran.includes(ground),
    cheonra: specialGods.cheonra.includes(ground),
    jimaang: specialGods.jimaang.includes(ground)
  };
};