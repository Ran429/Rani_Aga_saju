/**
 * 📄 app/components/SajuExplanation/data/index.ts
 * 역할: UI 컴포넌트 (React)
 * exports: sajuData
 * imports: @/app/types/sajuTypes, ./1gapData, ./2eulData, ./3byeongData, ./4jeongData, ./5muData, ./6giData, ./7gyeongData, ./8sinData, ./9imData, ./10gyeData
 * referenced by: app/components/SajuExplanation/BasicStructure.tsx
 */
// /Users/lovek/Documents/GitHub/Rani_Aga_saju/app/components/SajuExplanation/data/index.ts

import { SajuDataType } from "@/app/types/sajuTypes";

import { gapData } from "./1gapData";
import { eulData } from "./2eulData";
import { byeongData } from "./3byeongData";
import { jeongData } from "./4jeongData";
import { muData } from "./5muData";
import { giData } from "./6giData";
import { gyeongData } from "./7gyeongData";
import { sinData } from "./8sinData";
import { imData } from "./9imData";
import { gyeData } from "./10gyeData";

export const sajuData: SajuDataType = {
  ...gapData,
  ...eulData,
  ...byeongData,
  ...jeongData,
  ...muData,
  ...giData,
  ...gyeongData,
  ...sinData,
  ...imData,
  ...gyeData,
};