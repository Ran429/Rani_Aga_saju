/**
 * 📄 app/components/SajuExplanation/TenGodInterpretation.tsx
 * 역할: UI 컴포넌트 (React)
 * imports: react
 * referenced by: app/page.tsx
 */
import React from "react";

type TenGodType =
  | "알 수 없음"
  | "비견"
  | "겁재"
  | "식신"
  | "상관"
  | "정재"
  | "편재"
  | "정관"
  | "편관"
  | "정인"
  | "편인";

type TenGodCount = Record<TenGodType, number>;

const GROUPS: { label: "비겁" | "식상" | "재성" | "관성" | "인성"; members: TenGodType[] }[] = [
  { label: "비겁", members: ["비견", "겁재"] },
  { label: "식상", members: ["식신", "상관"] },
  { label: "재성", members: ["정재", "편재"] },
  { label: "관성", members: ["정관", "편관"] },
  { label: "인성", members: ["정인", "편인"] },
];

export default function TenGodInterpretation({ data }: { data: TenGodCount }) {
  // ✅ 1. 전체 십성 개수 합계 계산 (Total Count)
  const totalTenGods = Object.keys(data).reduce((sum, key) => {
    return key !== "알 수 없음" ? sum + (data[key as TenGodType] ?? 0) : sum;
  }, 0);

  // 총합이 0일 경우 나누기 방지
  const denominator = totalTenGods > 0 ? totalTenGods : 1;
  return (
    <section className="mt-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3">📌 3-2. 십성 해석</h3>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full border-collapse text-xs text-slate-600">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-3 py-2 font-medium text-center w-[90px]"> 
                그룹
              </th>
              <th className="border border-slate-200 px-3 py-2 font-medium text-center w-[72px]">
                십성
              </th>
              <th className="border border-slate-200 px-3 py-2 font-medium text-center w-[56px]">
                개수
              </th>
              <th className="border border-slate-200 px-3 py-2 font-medium text-center">
                설명
              </th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map(({ label, members }) => {
              const groupTotal = members.reduce((sum, m) => sum + (data[m] ?? 0), 0);
              const groupPercentage = (groupTotal / denominator) * 100;

              return members.map((tg, idx) => (
                <tr key={`${label}-${tg}`} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  {/* 그룹 셀: 첫 줄에만 표시 + 두 줄 병합 */}
                  {idx === 0 && (
                    <td
                      rowSpan={members.length}
                      className="border border-slate-200 px-3 py-2 text-center align-middle font-semibold text-slate-700"
                      title={`그룹 합계: ${groupTotal}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {/* 그룹 라벨 */}
                        <span>{label}</span>
                        {/* ✅ 구성비 표시 */}
                        <span className="text-sm font-extrabold text-blue-600">
                            {groupPercentage.toFixed(1)}%
                        </span>
                        <span className="rounded-full bg-slate-100 px-1.5 py-[2px] text-[10px] font-medium text-slate-700">
                          {groupTotal}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="border border-slate-200 px-3 py-2 text-center font-medium">{tg}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center">{data[tg] ?? 0}</td>
                  <td className="border border-slate-200 px-3 py-2 text-center">
                    {getTenGodDescription(tg)}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getTenGodDescription(tenGod: TenGodType) {
  const descriptions: Record<TenGodType, string> = {
    "알 수 없음": "십성을 판별할 수 없습니다.",
    비견: "나와 같은 힘을 가진 동료/파트너, 균형·협력(과다 시 경쟁·고집).",
    겁재: "공유·분산·리스크 감수, 빠른 실행(과다 시 손실·충동).",
    식신: "생산·창조·건강·지속성, 결과물을 차곡차곡.",
    상관: "표현·기획·도전·변화(과다 시 규범 충돌).",
    정재: "안정적 수입·관리·실리, 꾸준한 성과.",
    편재: "한방 기회·영업·확장(과다 시 분산·변동성).",
    정관: "규범·책임·리더십, 체계와 질서.",
    편관: "위기대응·도전·경쟁력(과다 시 압박·긴장).",
    정인: "학습·보호·후원, 안정적 백업.",
    편인: "아이디어·전환·유연성(과다 시 산만·과몰입).",
  };
  return descriptions[tenGod] || "";
}
