// app/components/fortunes/pillStyles.ts
export type ElementType = "목" | "화" | "토" | "금" | "수";

export const PILL_STYLES: Record<ElementType, string> = {
  목: "bg-emerald-50 text-emerald-700 border border-emerald-300",
  화: "bg-rose-50 text-rose-700 border border-rose-300",
  토: "bg-amber-50 text-amber-800 border border-amber-300",
  금: "bg-slate-50 text-slate-700 border border-slate-300",
  수: "bg-sky-50 text-sky-700 border border-sky-300",
};

// 엘리먼트가 비어있거나 이상하면 무난한 스타일로
export function pillClassByElement(el?: ElementType): string {
  return el
    ? PILL_STYLES[el]
    : "bg-slate-50 text-slate-700 border border-slate-300"; // fallback
}
