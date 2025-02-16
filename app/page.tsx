"use client";

import { useState, useEffect } from "react";
import { getSaju } from "./components/SajuCalculator";

// 사주 오행별 색상 정의
const elementColors: Record<"목" | "화" | "토" | "금" | "수", string> = {
  목: "#228B22", // 초록색
  화: "#FF4500", // 빨간색
  토: "#D2B48C", // 황토색
  금: "#A9A9A9", // 회색
  수: "#1E90FF", // 파란색
};

// getElement 함수 수정: 빈 문자열을 방지
const getElement = (char: string): keyof typeof elementColors | undefined => {
  if (["갑", "을", "인", "묘"].includes(char)) return "목";
  if (["병", "정", "사", "오"].includes(char)) return "화";
  if (["무", "기", "진", "술", "축", "미"].includes(char)) return "토";
  if (["경", "신", "유"].includes(char)) return "금";
  if (["임", "계", "자", "해"].includes(char)) return "수";
  return undefined;
};

// 사주 데이터 타입 정의
type SajuType = {
  hour: { sky: string; ground: string };
  day: { sky: string; ground: string };
  month: { sky: string; ground: string };
  year: { sky: string; ground: string };
};

export default function Home() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [sajuResult, setSajuResult] = useState<SajuType | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !birthTime) {
      alert("생년월일과 시간을 입력하세요!");
      return;
    }
    const result = getSaju(birthDate, birthTime);
    setSajuResult(result);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600">사주 입력</h1>

      <form className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="font-semibold">생년월일</label>
          <input className="p-2 border rounded" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold">시간</label>
          <input className="p-2 border rounded" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">운세 확인</button>
      </form>

      {isClient && sajuResult && (
        <div className="mt-6 bg-white p-4 shadow-lg rounded-lg w-full max-w-md">
          <h2 className="text-xl font-bold text-blue-600 text-center">정통사주 결과</h2>
          <table className="w-full border-collapse border border-gray-400 text-center text-lg font-bold">
            <tbody>
              <tr>
                {(["hour", "day", "month", "year"] as (keyof SajuType)[]).map((pillar) => (
                  <td
                    key={pillar}
                    className="border border-gray-400 p-2"
                    style={{
                      color: sajuResult[pillar]
                        ? elementColors[getElement(sajuResult[pillar].sky) ?? "목"]
                        : "#000",
                    }}
                  >
                    {sajuResult[pillar]?.sky ?? ""}
                  </td>
                ))}
              </tr>
              <tr>
                {(["hour", "day", "month", "year"] as (keyof SajuType)[]).map((pillar) => (
                  <td
                    key={pillar}
                    className="border border-gray-400 p-2"
                    style={{
                      color: sajuResult[pillar]
                        ? elementColors[getElement(sajuResult[pillar].ground) ?? "목"]
                        : "#000",
                    }}
                  >
                    {sajuResult[pillar]?.ground ?? ""}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
