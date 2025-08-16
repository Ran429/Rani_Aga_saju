/**
 * 📄 app/page.tsx
 * 역할: Next.js 페이지 (라우트 진입점)
 * exports: SpecialGodHit
 * imports: react, next/image, ./crystal-ball.png, ./calculators/sajuCalculator, ./components/SajuExplanation/BasicStructure, ./components/SajuExplanation/TenGodInterpretation, ./components/SajuExplanation/SpecialGodsSection, @/app/types/sajuTypes, @/app/utils/elementUtils
 */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"
import crystalBall from "./crystal-ball.png"; // ✅ public/ 기준
import { getSaju } from "./calculators/sajuCalculator";
import BasicStructure from "./components/SajuExplanation/BasicStructure";
import TenGodInterpretation from "./components/SajuExplanation/TenGodInterpretation";
import SpecialGodsSection from "./components/SajuExplanation/SpecialGodsSection";
import { SajuResultType } from "@/app/types/sajuTypes";
import {
  getTenGod,
  getHiddenStems,
  GanKey,
  JiKey,
  getYY,
  getElementColorKey,
  elementColors,
  yinYangBgColors,
} from "@/app/utils/elementUtils";

const tenGodCellStyle = "border border-gray-400 p-1 text-sm text-gray-700";
export type SpecialGodHit = {
  name: string;
  where: "year" | "month" | "day" | "hour" | "all" | string | ("year"|"month"|"day"|"hour")[];
  basis?: string;
};


// --- Add: SpecialGodsSection에 맞게 변환하는 헬퍼 ---
type WhereKey = "year" | "month" | "day" | "hour";
type SpecialGodHitLite = { name: string; where: WhereKey | "all" | string | WhereKey[] };
type SpecialGodsData = { year: string[]; month: string[]; day: string[]; hour: string[] };

const ALL_KEYS: WhereKey[] = ["year", "month", "day", "hour"];

function toSpecialGodsData(sg: unknown): SpecialGodsData {
  const out: SpecialGodsData = { year: [], month: [], day: [], hour: [] };
  if (!Array.isArray(sg)) return out; // sg가 없거나 배열이 아니면 빈값

  sg.forEach((h: SpecialGodHitLite) => {
    const w = h?.where;
    const targets: WhereKey[] = Array.isArray(w)
      ? (w as WhereKey[])
      : w === "all"
      ? ALL_KEYS
      : ALL_KEYS.includes(w as WhereKey)
      ? [w as WhereKey]
      : []; // 알 수 없는 값이면 무시

    targets.forEach((k) => out[k].push(h.name));
  });

  // 중복 제거
  (Object.keys(out) as (keyof SpecialGodsData)[]).forEach((k) => {
    out[k] = Array.from(new Set(out[k]));
  });

  return out;
}


export default function Home() {
  const [userName, setUserName] = useState("");
  const [birthType, setBirthType] = useState<"양력" | "음력">("양력");
  const [gender, setGender] = useState("남성");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [sajuResult, setSajuResult] = useState<SajuResultType | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const raw = e.target.value;
  if (e.nativeEvent instanceof InputEvent && e.nativeEvent.inputType === "deleteContentBackward") {
    setBirthDate(raw);
    return;
  }
  let value = raw.replace(/\D/g, "");
  if (value.length > 8) value = value.slice(0, 8);
  if (value.length >= 6) {
    value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
  } else if (value.length >= 4) {
    value = `${value.slice(0, 4)}-${value.slice(4)}`;
  }

  setBirthDate(value);
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields: string[] = [];
    if (!userName) missingFields.push("이름");
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate))
      missingFields.push("올바른 생년월일");
    if (!birthTime || !/^\d{2}:\d{2}$/.test(birthTime))
      missingFields.push("올바른 출생 시간");
    if (!gender || !["남성", "여성"].includes(gender))
      missingFields.push("성별");

    if (missingFields.length > 0) {
      alert(`다음 항목을 입력해 주세요: ${missingFields.join(", ")}`);
      return;
    }

const result = getSaju(birthDate, birthTime, gender, userName);
    setSajuResult({
      ...result,
      userInfo: { name: userName, birthType, birthDate, birthTime, gender },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 via-blue-700 to-pink-600 p-6 font-[Pretendard-Regular]">
      <h1 className="text-4xl font-extrabold text-white">샤머니즘의 모·든·것</h1>

      {/* 입력 폼 */}
      <form
        className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-md space-y-4"
        onSubmit={handleSubmit}
      >
        {/* 이름 */}
        <div className="flex flex-col">
          <label className="font-semibold text-black">이름</label>
          <input
            className="p-2 border border-gray-300 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름 입력"
            required
          />
        </div>

        {/* 양/음력 */}
        <div className="flex flex-col">
          <label className="font-semibold text-black">양/음력</label>
          <div className="flex space-x-4 text-black">
            {["양력", "음력"].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="birthType"
                  value={type}
                  checked={birthType === type}
                  onChange={() => setBirthType(type as "양력" | "음력")}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 생년월일 */}
        <div className="flex flex-col">
          <label className="font-semibold text-black">생년월일</label>
          <input
            className="p-2 border border-gray-300 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={birthDate}
            onChange={handleBirthDateChange}
            placeholder="YYYY-MM-DD"
            required
          />
        </div>

        {/* 시간 */}
        <div className="flex flex-col">
          <label className="font-semibold text-black">시간</label>
          <input
            className="p-2 border border-gray-300 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            required
          />
        </div>

        {/* 성별 */}
        <div className="flex flex-col">
          <label className="font-semibold text-black">성별</label>
          <div className="flex space-x-4 text-black">
            {["남성", "여성"].map((g) => (
              <label key={g} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="p-2 rounded w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          운세 확인
        </button>
      </form>

 {/* 결과 */}
      {isClient && sajuResult && sajuResult.year ? (() => {
        const user = sajuResult.userInfo || {
          name: "알 수 없음",
          birthType: "양력",
          birthDate: "알 수 없음",
          birthTime: "알 수 없음",
          gender: "알 수 없음",
        };
        const birthYear = user.birthDate !== "알 수 없음" ? parseInt(user.birthDate.slice(0, 4), 10) : null;
        const ageText = birthYear ? `만 ${new Date().getFullYear() - birthYear}세` : "알 수 없음";

        return (
          <>
            {/* ✅ 카드 #1: 히어로 + 인사/요약 (표 없음) */}
            <div className="relative mt-6 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 text-black">
              {/* 상단만 투명→흰색 그라데이션 */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/0 via-white/60 to-white rounded-t-lg z-0" />
              <div className="relative z-10">
                <div className="flex flex-col items-center mb-3">
                  <div className="relative w-full h-32 sm:h-40 md:h-48">
                    <div className="absolute inset-0 rounded-full blur-2xl bg-blue-500/30 -z-10" />
                    <Image
                      src={crystalBall}
                      alt="수정구슬"
                      fill
                      sizes="100vw"
                      className="object-contain drop-shadow-xl select-none pointer-events-none"
                      priority
                    />
                  </div>
                  <h2 className="mt-3 text-2xl font-extrabold text-black tracking-wide text-center">
                    당신의 사주 결과는...!
                  </h2>
                </div>

                {/* 인사/요약 */}
                <p className="text-sm text-center mt-2">
                  <span className="block">
                    안녕하세요! <span className="font-bold">{user.name}</span>님 😊
                  </span>
                  입력해 주신 정보를 바탕으로 <span className="font-bold">{user.name}</span>님의 사주를 분석해 드릴게요.
                </p>
                <p className="text-center font-bold mt-2">
                  {user.birthType} / {user.birthDate} / {ageText}, {user.gender}
                </p>
              </div>
            </div>

            {/* ✅ 독립 sticky 사주표 */}
            <div className="sticky top-0 z-50 w-full max-w-2xl mt-4">
              <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 rounded-md shadow-md">
                <table className="w-full border-collapse border border-gray-400 text-center text-lg font-bold">
                  <thead>
                    <tr>
                      <th className="border border-gray-400 p-2 bg-gray-200">구분</th>
                      <th className="border border-gray-400 p-2 bg-gray-200">시주</th>
                      <th className="border border-gray-400 p-2 bg-gray-200">일주</th>
                      <th className="border border-gray-400 p-2 bg-gray-200">월주</th>
                      <th className="border border-gray-400 p-2 bg-gray-200">년주</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 천간 */}
                    <tr>
                      <td className="border border-gray-400 p-2 bg-gray-100 font-bold">천간</td>
                      {(["hour", "day", "month", "year"] as const).map((pillarKey) => {
                        const skyValue = sajuResult?.[pillarKey]?.sky ?? "";
                        const elementType = getElementColorKey(skyValue as GanKey | JiKey);
                        const yy = getYY(skyValue as GanKey);
                        return (
                          <td
                            key={pillarKey}
                            className={`border border-gray-400 p-2 ${elementColors[elementType] ?? ""} ${
                              yy ? yinYangBgColors[yy] : ""
                            }`}
                          >
                            {skyValue}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 십성(천간) */}
                    <tr>
                      <td className={tenGodCellStyle}>십성</td>
                      {(["hour", "day", "month", "year"] as const).map((pillarKey) => (
                        <td key={pillarKey} className={tenGodCellStyle}>
                          {getTenGod(sajuResult.day.sky as GanKey, sajuResult?.[pillarKey]?.sky as GanKey) ?? ""}
                        </td>
                      ))}
                    </tr>

                    {/* 지지 */}
                    <tr>
                      <td className="border border-gray-400 p-2 bg-gray-100 font-bold">지지</td>
                      {(["hour", "day", "month", "year"] as const).map((pillarKey) => {
                        const groundValue = sajuResult?.[pillarKey]?.ground ?? "";
                        const elementType = getElementColorKey(groundValue as GanKey | JiKey);
                        const yy = getYY(groundValue as GanKey);
                        return (
                          <td
                            key={pillarKey}
                            className={`border border-gray-400 p-2 ${elementColors[elementType] ?? ""} ${
                              yy ? yinYangBgColors[yy] : ""
                            }`}
                          >
                            {groundValue}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 십성(지지) */}
                    <tr>
                      <td className={tenGodCellStyle}>십성</td>
                      {(["hour", "day", "month", "year"] as const).map((pillarKey) => {
                        const ground = sajuResult?.[pillarKey]?.ground ?? "";
                        const hidden = getHiddenStems(ground as JiKey);
                        const first = hidden[0] ?? null;
                        return (
                          <td key={pillarKey} className={tenGodCellStyle}>
                            {first ? getTenGod(sajuResult.day.sky as GanKey, first) : ""}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 여백 */}
            <div className="h-8" />

            {/* ✅ 카드 #2: 상세 설명 */}
            <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-2xl text-black">
              <div className="mt-2 space-y-8">
                <BasicStructure userName={user.name} sajuResult={sajuResult} sanitizedExplanation="" />
                <TenGodInterpretation data={sajuResult.baseTenGods} />
                <SpecialGodsSection
                  data={toSpecialGodsData([
                    ...(sajuResult.specialGods ?? []),
                    ...(sajuResult.goodGods ?? []),
                  ])}
                />
              </div>
            </div>
          </>
        );
      })() : null}
    </div>
  );
}