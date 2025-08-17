"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Section = { id: string; label: string };

interface NavigationMenuProps {
  sections: Section[];
  activeSection: string;
  onChange: (id: string) => void;
}

export default function NavigationMenu({
  sections,
  activeSection,
  onChange,
}: NavigationMenuProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  // overflow 감지
  useEffect(() => {
    const el = scrollerRef.current;
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
  }, [sections]);

  // active 버튼 보이도록
  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLButtonElement>(
      `[data-id="${activeSection.replace(/"/g, '\\"')}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeSection]);

  // (선택) 트랙패드/휠: 세로휠을 가로 스크롤로
  useEffect(() => {
    const el = scrollerRef.current;
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

  const idxMap = useMemo(() => {
    const m = new Map<string, number>();
    sections.forEach((s, i) => m.set(s.id, i));
    return m;
  }, [sections]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = idxMap.get(activeSection) ?? 0;
    const next = e.key === "ArrowRight" ? Math.min(i + 1, sections.length - 1) : Math.max(i - 1, 0);
    onChange(sections[next].id);
  };

  return (
    <div className="relative">
      {isOverflow && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent rounded-l-xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent rounded-r-xl" />
        </>
      )}

      <div
        ref={scrollerRef}
        role="tablist"
        aria-orientation="horizontal"
        aria-label="운세 섹션"
        onKeyDown={onKeyDown}
        className={[
          "bg-white/95 backdrop-blur-md rounded-xl shadow-lg",
          "flex gap-2 px-2 py-2",
          "overflow-x-auto snap-x snap-mandatory scrollbar-hide", // 항상 auto여도 문제없음
          isOverflow ? "justify-start" : "justify-center",
        ].join(" ")}
      >
        {sections.map((s) => {
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              data-id={s.id}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${s.id}`}
              onClick={() => onChange(s.id)}
              title={s.label}
              className={[
                // ✅ 항상 줄바꿈 방지 + 중앙 정렬 + 스냅 센터 + 폭 수축 금지
                "inline-flex items-center justify-center shrink-0 snap-center",
                "whitespace-nowrap break-keep leading-none",
                // style
                "px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm",
              ].join(" ")}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
