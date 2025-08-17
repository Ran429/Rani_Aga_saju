// app/components/YearlySeun/YearlySeunCarousel.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { YearSeunItem } from "@/app/types/sajuTypes";
import { getDaewoonBucket } from "@/app/utils/dateUtils";
import { getElement, type GanKey, type JiKey } from "@/app/utils/elementUtils";
import { pillClassByElement, type ElementType } from "@/app/components/fortunes/pillStyles";

type Props = {
  data: YearSeunItem[];
  activeAge?: number;
  daewoonStartAge: number;
  onSelect?: (age: number) => void;
  showArrows?: boolean;
  dense?: boolean;
  verticalPill?: boolean;
  size?: "xs" | "sm" | "md";
  showRange?: boolean;
  showTenGod?: boolean;
  tenGodOfGan?: (gan: GanKey) => string;
  tenGodOfJi?: (ji: JiKey) => string;
};

/** 기본 회색 pill (간/지 못 찾았을 때) */
const FALLBACK_PILL =
  "bg-slate-50 text-slate-700 border border-slate-300";

/** YearSeunItem에서 간/지 추출: sky/ground 우선 → pillar(문자열/튜플) 보조 */
function pickGanJi(item: YearSeunItem): { gan?: GanKey; ji?: JiKey } {
  const anyItem = item as unknown as Record<string, unknown>;

  // sky/ground(문자열) 형태 지원
  const sg = typeof anyItem.sky === "string" ? (anyItem.sky as GanKey) : undefined;
  const gg = typeof anyItem.ground === "string" ? (anyItem.ground as JiKey) : undefined;
  if (sg && gg) return { gan: sg, ji: gg };

  // pillar가 문자열("갑신")이거나 튜플(["갑","신"]) 형태 지원
  const p = anyItem.pillar;
  if (typeof p === "string" && p.length >= 2) {
    return { gan: p[0] as GanKey, ji: p[1] as JiKey };
  }
  if (Array.isArray(p) && p.length === 2 && typeof p[0] === "string" && typeof p[1] === "string") {
    return { gan: p[0] as GanKey, ji: p[1] as JiKey };
  }

  return {};
}

/** pill 색상 안전 헬퍼(값이 없으면 회색) */
const clsByEl = (el?: ElementType) =>
  el ? pillClassByElement(el) : FALLBACK_PILL;

export default function YearlySeunCarousel({
  data,
  activeAge,
  daewoonStartAge,
  onSelect,
  showArrows = true,
  dense = true,
  verticalPill = true,
  size = "xs",
  showRange = false,
  showTenGod = true,
  tenGodOfGan,
  tenGodOfJi,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  // overflow 감지
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setIsOverflow(el.scrollWidth - el.clientWidth > 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [data]);

  // activeAge 중앙 스크롤
  useEffect(() => {
    if (activeAge == null) return;
    const el = ref.current?.querySelector<HTMLButtonElement>(`[data-age="${activeAge}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeAge]);

  const groups = useMemo(() => data, [data]);

  const scrollBy = (delta: number) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  // 세로 휠 → 가로 스크롤
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // 사이즈 토큰
  const S =
  size === "xs"
    ? {
        cardW: "min-w-[72px] w-[72px] md:w-[80px]",
        pad: "p-1.5",
        age: "text-[10px]",
        year: "text-[10px]",
        pill: "text-[11px] px-1 py-[2px]",   // 🔧 더 작게
        tg:   "text-[11px]",                  // 🔧 십성 더 작게
        range: "text-[10px]",
        gap: "gap-0.5",
      }
    : dense
    ? {
        cardW: "w-[96px] md:w-[104px]",
        pad: "p-2",
        age: "text-[11px]",
        year: "text-[10px]",
        pill: "text-[11px] px-1.5 py-[2px]", // 🔧 한 단계 작게
        tg:   "text-[10px]",
        range: "text-[10px]",
        gap: "gap-1",
      }
    : {
        cardW: "w-[132px]",
        pad: "p-2.5",
        age: "text-sm",
        year: "text-[12px]",
        pill: "text-[12px] px-2 py-0.5",
        tg:   "text-[11px]",
        range: "text-[11px]",
        gap: "gap-1",
      };

  return (
    <div className="relative">
      {isOverflow && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent rounded-l-2xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent rounded-r-2xl" />
        </>
      )}

      {showArrows && isOverflow && (
        <>
          <button
            type="button"
            className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 backdrop-blur border shadow p-2"
            onClick={() => scrollBy(-280)}
            aria-label="왼쪽으로"
          >
            ‹
          </button>
          <button
            type="button"
            className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 backdrop-blur border shadow p-2"
            onClick={() => scrollBy(280)}
            aria-label="오른쪽으로"
          >
            ›
          </button>
        </>
      )}

      <div
        ref={ref}
        className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide snap-x snap-mandatory"
      >
        {groups.map((item) => {
          const isActive = activeAge === item.age;
          const bucket = getDaewoonBucket(daewoonStartAge, item.age);

          // ✔ 간/지 추출
          const { gan, ji } = pickGanJi(item);

          // ✔ 오행 → pill 색상
          const elGan = gan ? (getElement(gan) as ElementType) : undefined;
          const elJi  = ji  ? (getElement(ji)  as ElementType) : undefined;

          // ✔ 십성 텍스트(옵션 켜져 있고 값이 있을 때만)
          const tgGan = showTenGod && tenGodOfGan && gan ? (tenGodOfGan(gan) || "") : "";
          const tgJi  = showTenGod && tenGodOfJi  && ji  ? (tenGodOfJi(ji)  || "") : "";

          return (
            <button
              key={item.age}
              type="button"
              data-age={item.age}
              onClick={() => onSelect?.(item.age)}
              className={[
                "snap-start shrink-0 rounded-2xl border text-center transition-all",
                S.cardW,
                S.pad,
                isActive
                  ? "ring-2 ring-rose-400 border-rose-300"
                  : "border-gray-200 hover:border-gray-300 bg-white/80 shadow-sm",
              ].join(" ")}
              aria-pressed={isActive}
              title={`${bucket.start}~${bucket.end}세`}
            >
              <div className={`${S.age} text-gray-700 font-semibold`}>{item.age}세</div>
              <div className={`${S.year} text-gray-400`}>{item.year}년</div>

              {/* 간/지 pill */}
<div className={`mt-1 grid ${verticalPill ? "grid-cols-1" : "grid-cols-2"} ${S.gap}`}>
  {/* 간 */}
  <span
    className={`inline-flex items-center justify-center gap-0.5 whitespace-nowrap leading-none rounded-md ${S.pill} ${clsByEl(elGan)}`}
  >
    <b className="font-semibold">{gan ?? "?"}</b>
    {tgGan && <span className={`${S.tg} font-normal opacity-80`}>-{tgGan}</span>}
  </span>

  {/* 지 */}
  <span
    className={`inline-flex items-center justify-center gap-0.5 whitespace-nowrap leading-none rounded-md ${S.pill} ${clsByEl(elJi)}`}
  >
    <b className="font-semibold">{ji ?? "?"}</b>
    {tgJi && <span className={`${S.tg} font-normal opacity-80`}>-{tgJi}</span>}
  </span>
</div>

              {showRange && (
                <div className={`mt-1 ${S.range} text-gray-500`}>
                  {bucket.start}–{bucket.end}세
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
