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