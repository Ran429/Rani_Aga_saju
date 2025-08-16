/**
 * 📄 app/utils/relationUtils.ts
 * 역할: 공통 유틸 함수 모음
 * exports: processPillars
 * imports: ./elementUtils
 */
import { GanKey, JiKey } from "./elementUtils";

// 예시: p 타입 지정
export function processPillars(pillars: { sky: GanKey; ground: JiKey }[]) {
  pillars.forEach((p: { sky: GanKey; ground: JiKey }) => {
    console.log(p.sky, p.ground);
  });
}