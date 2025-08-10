export interface SpecialGodsSet {
  yeokma: boolean;
  dohwa: boolean;
  hwagae: boolean;
  gwaegang: boolean;
  baekho: boolean;
  yangin: boolean;
  jaesal: boolean;
  wolsal: boolean;
  mangsin: boolean;
  geopsal: boolean;
  yukhae: boolean;
  wonjin: boolean;
  jimaang: boolean;
}


export interface TenGodCount {
  "알 수 없음": number;
  비견: number;
  겁재: number;
  식신: number;
  상관: number;
  편재: number;
  정재: number;
  편관: number;
  정관: number;
  편인: number;
  정인: number;
}

export interface SajuResultType {
  baseElements: Record<string, number>;
  adjustedElements: Record<string, number>;
  baseTenGods: TenGodCount;
  adjustedTenGods: TenGodCount;
  daewoonList: { age: number; year: number; pillar: string }[];
  daewoonPeriod: number;
  twelveFortunes: Record<string, string>;
  twelveGods: Record<string, string>;
  specialGods: {
    year: SpecialGodsSet;
    month: SpecialGodsSet;
    day: SpecialGodsSet;
    hour: SpecialGodsSet;
  };
  year: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  month: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  day: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  hour: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  userInfo?: {
    name: string;
    birthType: string;
    birthDate: string;
    birthTime: string;
    gender: string;
  };
}

export interface BasicStructureProps {
  userName: string;
  sajuResult: SajuResultType;
  sanitizedExplanation: string;
}

// 운세 카테고리 타입
export type FortuneCategory =
  | "인생운"
  | "연애운"
  | "궁합운"
  | "직업운"
  | "학업및시험운"
  | "재물운"
  | "건강운";

// 설명을 꺼낼 때 사용할 키
export interface SajuExplanationKey {
  dayStem: string; // 예: "갑목", "을목" 등
  gender: "남성" | "여성";
  category: FortuneCategory;
}

// 데이터 타입
export type SajuDataType = {
  [dayStem: string]: {
    남성: Partial<Record<FortuneCategory, string>>;
    여성: Partial<Record<FortuneCategory, string>>;
  };
};