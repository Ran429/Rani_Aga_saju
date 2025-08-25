// app/components/fortunes/DaewoonYearMonthPanel.tsx
"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { getDaewoonBucket, getMonthlySeun, type MonthSeunItem } from "@/app/utils/dateUtils";
import { getElement, getTenGod, getHiddenStems, type GanKey, type JiKey } from "@/app/utils/elementUtils";
import type { YearSeunItem } from "@/app/utils/dateUtils";
import { pillClassByElement, type ElementType } from "@/app/components/fortunes/pillStyles";

// ▽▽ 타입
export type DaewoonItem = {
  age: number;
  year: number;
  pillar?: string | [GanKey, JiKey];
  pillarGan?: GanKey;
  pillarJi?: JiKey;
};

export type PanelProps = {
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
};

export default function DaewoonYearMonthPanel({
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
}: PanelProps) {
  const [activeAge, setActiveAge] = useState<number | null>(null);
  const [activeRange, setActiveRange] = useState<{ start: number; end: number } | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [monthlySeun, setMonthlySeun] = useState<MonthSeunItem[]>([]);

     const refDaewoon = useRef<HTMLDivElement>(null!);
    const refYearly = useRef<HTMLDivElement>(null!);
    const refMonthly = useRef<HTMLDivElement>(null!);

  const [overflowDaewoon, setOverflowDaewoon] = useState(false);
  const [overflowYearly, setOverflowYearly] = useState(false);
  const [overflowMonthly, setOverflowMonthly] = useState(false);

  // 현재 나이 계산
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

  // 십성 계산 헬퍼
  const tenGodOfGan = useCallback((gan: GanKey) => getTenGod(daySky, gan), [daySky]);
  const tenGodOfJi = useCallback((ji: JiKey) => {
    const [main] = getHiddenStems(ji);
    return main ? getTenGod(daySky, main as GanKey) : "";
  }, [daySky]);

  // DaewoonItem → [gan, ji] 변환
  const toPair = (x: DaewoonItem): [GanKey, JiKey] | undefined => {
    if (x.pillarGan && x.pillarJi) return [x.pillarGan, x.pillarJi];
    if (Array.isArray(x.pillar)) return x.pillar as [GanKey, JiKey];
    if (typeof x.pillar === "string" && x.pillar.length >= 2) {
      return [x.pillar[0] as GanKey, x.pillar[1] as JiKey];
    }
    return undefined;
  };

  // 현재 range 안의 연운만 표시
  const yearlySeunForView = useMemo(() => {
    if (!activeRange) return yearlySeun;
    return yearlySeun.filter((x) => x.age >= activeRange.start && x.age <= activeRange.end);
  }, [activeRange, yearlySeun]);

  // 사이즈 스타일
  const S =
    size === "xs"
      ? { cardW: "w-[88px] md:w-[96px]", pad: "p-2", age: "text-[12px]", year: "text-[11px]",
          pill: "text-[13px] px-1 py-0.5", tg: "text-[11px]", range: "text-[10px]" }
      : size === "sm"
      ? { cardW: "w-[112px]", pad: "p-2.5", age: "text-sm", year: "text-[12px]",
          pill: "text-[13px] px-1.5 py-0.5", tg: "text-[12px]", range: "text-[11px]" }
      : { cardW: "w-[132px]", pad: "p-3", age: "text-base", year: "text-sm",
          pill: "text-[14px] px-2 py-0.5", tg: "text-[13px]", range: "text-sm" };

  // 공통 overflow 감지
  useEffect(() => {
    const check = (ref: React.RefObject<HTMLDivElement>, set: (v: boolean) => void) => {
      if (!ref.current) return;
      set(ref.current.scrollWidth > ref.current.clientWidth + 1);
    };
    check(refDaewoon, setOverflowDaewoon);
    check(refYearly, setOverflowYearly);
    check(refMonthly, setOverflowMonthly);
  }, [daewoon, yearlySeun, monthlySeun]);

// 오늘날짜 감지해서 알려주기
useEffect(() => {
  if (!birth) return;
  if (currentAge == null) return;

  // 1) 현재 대운 구간 찾기
  const currentDaewoon = daewoon.find(
    (d) => currentAge >= d.age && currentAge < d.age + 10
  );
  if (currentDaewoon) {
    setActiveRange({ start: currentDaewoon.age, end: currentDaewoon.age + 9 });
  }

  // 2) 올해 연운 찾기
  const thisYear = new Date().getFullYear();
  const currentYearSeun = yearlySeun.find((y) => y.year === thisYear);
  if (currentYearSeun) {
    setActiveYear(thisYear);
    setMonthlySeun(getMonthlySeun(thisYear));
  }
}, [birth, currentAge, daewoon, yearlySeun]);


  // 스크롤 함수
  const scrollBy = (ref: React.RefObject<HTMLDivElement>, delta: number) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="space-y-4 relative">
      {/* ─────────────────────────────
          ① 대운 캐러셀
          ───────────────────────────── */}
      <div className="relative">
        {showArrows && overflowDaewoon && (
          <>
            <button onClick={() => scrollBy(refDaewoon, -240)} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full border shadow p-1">‹</button>
            <button onClick={() => scrollBy(refDaewoon, 240)} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full border shadow p-1">›</button>
          </>
        )}
        <div ref={refDaewoon} className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
          {daewoon.map((item) => {
            const pair = toPair(item);
            const gan = pair?.[0];
            const ji = pair?.[1];
            const elGan = gan ? getElement(gan) : undefined;
            const elJi = ji ? getElement(ji) : undefined;
            const tgGan = gan ? tenGodOfGan(gan) : "";
            const tgJi = ji ? tenGodOfJi(ji) : "";

            const now = currentAge;
            const isNow = now != null ? now >= item.age && now < item.age + 10 : false;
            const isSelected = activeRange ? item.age === activeRange.start : false;
            const bucket = getDaewoonBucket(startAge, item.age);

            return (
              <button
                key={item.age}
                className={`shrink-0 ${S.cardW} ${S.pad} rounded-xl border bg-white/80 text-center ${
                  isSelected
                    ? "ring-2 ring-rose-500"
                    : isNow
                    ? "ring-2 ring-indigo-400"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  setActiveAge(item.age);
                  setActiveRange({ start: item.age, end: item.age + 9 });
                  onSelectAge?.(item.age);
                }}
              >
                <div className={`${S.age} font-semibold`}>{item.age}세</div>
                <div className={`${S.year} text-gray-500`}>{item.year}년</div>
                <div className={`mt-1 grid ${verticalPill ? "grid-cols-1" : "grid-cols-2"} gap-1`}>
                  <span className={`inline-flex items-center justify-center gap-0.5 rounded-md ${S.pill} ${pillClassByElement(elGan as ElementType)}`}>
                    <b>{gan}</b>{tgGan && <span className={`${S.tg} opacity-80`}>-{tgGan}</span>}
                  </span>
                  <span className={`inline-flex items-center justify-center gap-0.5 rounded-md ${S.pill} ${pillClassByElement(elJi as ElementType)}`}>
                    <b>{ji}</b>{tgJi && <span className={`${S.tg} opacity-80`}>-{tgJi}</span>}
                  </span>
                </div>
                {showRangeText && (
                  <div className={`${S.range} text-gray-500 mt-1`}>
                    {bucket.start}–{bucket.end}세
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────
          ② 연운 캐러셀
          ───────────────────────────── */}
      {activeRange && (
        <div className="relative">
          {showArrows && overflowYearly && (
            <>
              <button onClick={() => scrollBy(refYearly, -240)} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full border shadow p-1">‹</button>
              <button onClick={() => scrollBy(refYearly, 240)} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full border shadow p-1">›</button>
            </>
          )}
          <div ref={refYearly} className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            {yearlySeunForView.map((item) => {
                const isActive = activeAge === item.age;
              const gan = item.sky as GanKey;
              const ji = item.ground as JiKey;
              const elGan = getElement(gan);
              const elJi = getElement(ji);
              const tgGan = tenGodOfGan(gan);
              const tgJi = tenGodOfJi(ji);

              return (
                <button
                key={item.age}
                className={`shrink-0 w-[80px] rounded-xl border bg-white/80 p-2 text-center ${
                    isActive ? "ring-2 ring-rose-400 border-rose-300" : "hover:border-gray-300"
                }`}
                onClick={() => {
                    setActiveAge(item.age);
                    setActiveYear(item.year);
                    setMonthlySeun(getMonthlySeun(item.year));
                }}
                >
                <div className="text-xs font-semibold">{item.age}세</div>
                <div className="text-[10px] text-gray-500">{item.year}년</div>
                <div className="mt-1 flex flex-col gap-1">
                    <span className={`rounded px-1 text-[11px] ${pillClassByElement(elGan as ElementType)}`}>
                    <b>{gan}</b>
                    {tgGan && <span className="ml-0.5 opacity-80">-{tgGan}</span>}
                    </span>
                    <span className={`rounded px-1 text-[11px] ${pillClassByElement(elJi as ElementType)}`}>
                    <b>{ji}</b>
                    {tgJi && <span className="ml-0.5 opacity-80">-{tgJi}</span>}
                    </span>
                </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────
          ③ 월운 캐러셀
          ───────────────────────────── */}
      {activeYear && (
        <div className="relative">
          {showArrows && overflowMonthly && (
            <>
              <button onClick={() => scrollBy(refMonthly, -240)} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full border shadow p-1">‹</button>
              <button onClick={() => scrollBy(refMonthly, 240)} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full border shadow p-1">›</button>
            </>
          )}
          <div ref={refMonthly} className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            {monthlySeun.map((m) => {
              const elGan = getElement(m.gan);
              const elJi = getElement(m.ji);
              const tgGan = tenGodOfGan(m.gan);
              const tgJi = tenGodOfJi(m.ji);
              return (
                <div
                  key={`${m.year}-${m.month}`}
                  className="shrink-0 w-[72px] rounded-lg border bg-white/80 p-2 text-center"
                >
                  <div className="text-[10px] text-gray-600">{m.month}월</div>
                  <div className="mt-1 flex flex-col gap-1">
                    <span className={`rounded px-1 text-[11px] ${pillClassByElement(elGan as ElementType)}`}>
                      <b>{m.gan}</b>{tgGan && <span className="ml-0.5 opacity-80">-{tgGan}</span>}
                    </span>
                    <span className={`rounded px-1 text-[11px] ${pillClassByElement(elJi as ElementType)}`}>
                      <b>{m.ji}</b>{tgJi && <span className="ml-0.5 opacity-80">-{tgJi}</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
