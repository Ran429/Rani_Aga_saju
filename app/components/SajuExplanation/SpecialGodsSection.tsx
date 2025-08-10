import React from "react";
import { SpecialGodsSet } from "@/app/types/sajuTypes";

type SpecialGodsData = {
  year: SpecialGodsSet;
  month: SpecialGodsSet;
  day: SpecialGodsSet;
  hour: SpecialGodsSet;
};

export default function SpecialGodsSection({ data }: { data?: SpecialGodsData }) {
    if (!data) return <p>신살 데이터가 없습니다.</p>;
  const pillars = [
    { label: "년주", key: "year" as const },
    { label: "월주", key: "month" as const },
    { label: "일주", key: "day" as const },
    { label: "시주", key: "hour" as const },
  ];

  // boolean -> "있음"인 신살만 추출
  const getActiveGods = (godSet: SpecialGodsSet) =>
    Object.entries(godSet)
      .filter(([, value]) => value)
      .map(([key]) => key);

  return (
    <section>
      <h2>신살 관련</h2>
      {pillars.map(({ label, key }) => {
        const activeGods = getActiveGods(data[key]);
        return (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <h3>{label}</h3>
            {activeGods.length > 0 ? (
              <ul>
                {activeGods.map((god, idx) => (
                  <li key={idx}>{god}</li>
                ))}
              </ul>
            ) : (
              <p>해당 주에는 신살이 없습니다.</p>
            )}
          </div>
        );
      })}
    </section>
  );
}