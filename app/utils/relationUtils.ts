import { GanKey, JiKey } from "./elementUtils";

// 예시: p 타입 지정
export function processPillars(pillars: { sky: GanKey; ground: JiKey }[]) {
  pillars.forEach((p: { sky: GanKey; ground: JiKey }) => {
    console.log(p.sky, p.ground);
  });
}