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

  // 1) 오버플로우 감지(모바일에선 true, 데스크톱에선 보통 false)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const check = () => setIsOverflow(el.scrollWidth - el.clientWidth > 1);

    // 처음 + 리사이즈 + 폰트로드 변화까지 반영
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [sections]);

  // 2) active 아이템이 보이도록
  useEffect(() => {
    if (!isOverflow) return;
    const el = scrollerRef.current?.querySelector<HTMLButtonElement>(
      `[data-id="${activeSection.replace(/"/g, '\\"')}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeSection, isOverflow]);

  // 3) 키보드 내비
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
      {/* 페이드는 오버플로우일 때만 노출 */}
      {isOverflow && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent rounded-l-xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent rounded-r-xl" />
        </>
      )}

      <div
        ref={scrollerRef}
        role="tablist"
        aria-label="운세 섹션"
        onKeyDown={onKeyDown}
        className={[
          "bg-white/95 backdrop-blur-md rounded-xl shadow-lg",
          "flex gap-2 px-2 py-2",
          isOverflow
            ? "overflow-x-auto snap-x snap-mandatory scroll-px-3 scrollbar-hide justify-start"
            : "overflow-x-hidden justify-center", // 데스크톱 등 남을 땐 중앙 정렬
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
              className={[
                // 오버플로우일 땐 줄바꿈 방지 + 스냅 대상, 남을 땐 자연 폭
                isOverflow ? "shrink-0 snap-start whitespace-nowrap" : "",
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
