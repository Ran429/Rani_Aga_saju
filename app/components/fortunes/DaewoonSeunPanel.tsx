// app/components/fortunes/DaewoonSeunPanel.tsx
"use client";
import React, { useCallback, useMemo, useState } from "react";
import YearlySeunCarousel from "@/app/components/YearlySeun/YearlySeunCarousel";
import { getDaewoonBucket } from "@/app/utils/dateUtils";
import { getElement, getTenGod, getHiddenStems, type GanKey, type JiKey } from "@/app/utils/elementUtils";
import type { YearSeunItem } from "@/app/types/sajuTypes";

// ▽▽ 기존 타입 유지
export type DaewoonItem = {
  age: number;
  year: number;
  pillarGan?: GanKey;
  pillarJi?: JiKey;
  pillar?: [GanKey, JiKey]; // 주 타입(튜플). 런타임에 문자열이 오면 toPair에서 처리
};


// 색상은 그대로
type ElementType = "목" | "화" | "토" | "금" | "수";
const PILL_STYLES: Record<ElementType, string> = {
  목: "bg-emerald-50 text-emerald-700 border border-emerald-300",
  화: "bg-rose-50 text-rose-700 border border-rose-300",
  토: "bg-amber-50 text-amber-800 border border-amber-300",
  금: "bg-slate-50 text-slate-700 border border-slate-300",
  수: "bg-sky-50 text-sky-700 border border-sky-300",
};

const FALLBACK_PILL = "bg-slate-50 text-slate-700 border border-slate-300";


export type DaewoonSeunPanelProps = {
  daewoon: DaewoonItem[];
  yearlySeun: YearSeunItem[];
  startAge: number;
  birth?: { year: number; month: number; day: number };
  daySky: GanKey;

  size?: "xs" | "sm" | "md";
  verticalPill?: boolean;
  showRangeText?: boolean;
  showArrows?: boolean;

  onSelectAge?: (age: number) => void;
  className?: string;
};

export default function DaewoonSeunPanel({
  daewoon,
  yearlySeun,
  startAge,
  birth,
  daySky,
  size = "xs",
  verticalPill = true,
  showRangeText = false,
  showArrows = true,
  onSelectAge,
  className,
}: DaewoonSeunPanelProps) {
  const [activeAge, setActiveAge] = useState<number | undefined>(undefined);
  const [activeRange, setActiveRange] = useState<{ start: number; end: number } | null>(null);

  // 현재 나이(옵션)
  const currentAge = useMemo(() => {
    if (!birth) return undefined;
    const today = new Date();
    let age = today.getFullYear() - birth.year;
    const notYetBirthday =
      today.getMonth() + 1 < birth.month ||
      (today.getMonth() + 1 === birth.month && today.getDate() < birth.day);
    if (notYetBirthday) age -= 1;
    return age;
  }, [birth]);

  // 🔧 런타임 가드: 문자열 pillar("갑신")도 안전하게 튜플로 변환
  const toPair = (x: DaewoonItem): [GanKey, JiKey] | undefined => {
    if (x.pillarGan && x.pillarJi) return [x.pillarGan, x.pillarJi];
    if (Array.isArray(x.pillar) && x.pillar.length === 2) return x.pillar as [GanKey, JiKey];
    const raw = (x as unknown as { pillar?: string }).pillar;
    if (typeof raw === "string" && raw.length >= 2) {
      return [raw[0] as GanKey, raw[1] as JiKey];
    }
    return undefined;
  };

  // 십성 헬퍼
  const tenGodOfGan = useCallback((gan: GanKey) => getTenGod(daySky, gan), [daySky]);
  const tenGodOfJi = useCallback(
    (ji: JiKey) => {
      const [main] = getHiddenStems(ji);
      return main ? getTenGod(daySky, main as GanKey) : "";
    },
    [daySky]
  );


  // 세운 뷰 필터
  const yearlySeunForView = useMemo(() => {
    if (!activeRange) return yearlySeun;
    return yearlySeun.filter((x) => x.age >= activeRange.start && x.age <= activeRange.end);
  }, [activeRange, yearlySeun]);

  // 사이즈 토큰 + 십성은 살짝 더 작게
// 카드 사이즈 토큰
const S =
  size === "xs"
    ? { cardW: "w-[88px] md:w-[96px]", pad: "p-2",  age: "text-[12px]", year: "text-[11px]",
        pill: "text-[13px] px-1 py-0.5", tg: "text-[11px]" }
  : size === "sm"
    ? { cardW: "w-[112px]", pad: "p-2.5", age: "text-sm", year: "text-[12px]",
        pill: "text-[13px] px-1.5 py-0.5", tg: "text-[12px]" }
    : { cardW: "w-[132px]", pad: "p-3",  age: "text-base", year: "text-sm",
        pill: "text-[14px] px-2 py-0.5",   tg: "text-[13px]" };

    return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      {/* 가로 스크롤 그라데이션 */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white/60 to-transparent rounded-l-xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white/60 to-transparent rounded-r-xl" />

      {/* 대운 리스트 */}
      <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide snap-x snap-mandatory">
        {daewoon.map((item) => {
          const pair = toPair(item);
          const gan = pair?.[0];
          const ji = pair?.[1];

          const elGan = gan ? (getElement(gan) as ElementType) : undefined;
          const elJi = ji ? (getElement(ji) as ElementType) : undefined;

          // 십성 텍스트(한 번만 계산!)
          const tgGan = gan ? tenGodOfGan(gan) : "";
          const tgJi = ji ? tenGodOfJi(ji) : "";

          const now = currentAge;
          const isNow = now != null ? now >= item.age && now < item.age + 10 : false;
          const isSelected = activeRange ? item.age === activeRange.start : false;

          const cls = [
            "snap-start shrink-0 rounded-xl bg-white/80 border text-center transition-all",
            S.cardW,
            S.pad,
            isSelected
              ? "ring-2 ring-rose-500 border-transparent scale-[1.02]"
              : isNow
              ? "ring-2 ring-indigo-400 border-transparent"
              : "border-slate-200 hover:border-slate-300 shadow-sm",
          ].join(" ");

          return (
            <button
              key={item.age}
              type="button"
              className={cls}
              aria-pressed={isSelected}
              title={`${item.age}~${item.age + 9}세 대운`}
              onClick={() => {
                setActiveAge(item.age);
                setActiveRange({ start: item.age, end: item.age + 9 });
                onSelectAge?.(item.age);
              }}
            >
              <div className={`${S.age} font-semibold text-slate-900`}>{item.age}세</div>
              <div className={`${S.year} text-slate-500`}>{item.year}년</div>

              <div className={`mt-1 grid ${verticalPill ? "grid-cols-1" : "grid-cols-2"} gap-1`}>
                {/* 간 */}
                <span className={`inline-flex items-center justify-center gap-0.5 whitespace-nowrap leading-none rounded-md ${S.pill} ${elGan ? PILL_STYLES[elGan] : FALLBACK_PILL}`}>
                  <b className="font-semibold">{gan ?? "?"}</b>
                  {tgGan && <span className={`${S.tg} font-normal opacity-80`}>-{tgGan}</span>}
                </span>
                {/* 지 */}
                <span className={`inline-flex items-center justify-center gap-0.5 whitespace-nowrap leading-none rounded-md ${S.pill} ${elJi ? PILL_STYLES[elJi] : FALLBACK_PILL}`}>
                  <b className="font-semibold">{ji ?? "?"}</b>
                  {tgJi && <span className={`${S.tg} font-normal opacity-80`}>-{tgJi}</span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 세운 캐러셀 */}
      <div className="mt-3">
        <YearlySeunCarousel
          data={yearlySeunForView}
          activeAge={activeAge}
          daewoonStartAge={startAge}
          onSelect={(age) => {
            setActiveAge(age);
            setActiveRange(getDaewoonBucket(startAge, age));
            onSelectAge?.(age);
          }}
          showArrows={showArrows}
          size="xs"
          verticalPill
          showTenGod
          tenGodOfGan={(gan) => tenGodOfGan(gan)}
          tenGodOfJi={(ji) => tenGodOfJi(ji)}
          showRange={showRangeText}
        />
      </div>
    </div>
  );
}
