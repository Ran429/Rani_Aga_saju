"use client";

import { useState, useEffect } from "react";
import { getSaju } from "./components/SajuCalculator";

// 사주 데이터 타입 정의
type SajuType = {
  year: { sky: string; ground: string };
  month: { sky: string; ground: string };
  day: { sky: string; ground: string };
  hour: { sky: string; ground: string };
};

// 사주 오행별 색상 정의
const elementColors: Record<"목" | "화" | "토" | "금" | "수", string> = {
  목: "text-green-600", // 초록색
  화: "text-red-600", // 빨간색
  토: "text-yellow-600", // 황토색
  금: "text-gray-600", // 회색
  수: "text-blue-600", // 파란색
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

// 일주 동물 및 프레임 색상 반환 함수
const getAnimalAndColor = (daySky: string, dayGround: string) => {
  const animals: Record<string, string> = {
    자: "쥐", 축: "소", 인: "호랑이", 묘: "토끼", 진: "용",
    사: "뱀", 오: "말", 미: "양", 신: "원숭이", 유: "닭",
    술: "개", 해: "돼지"
  };

  const imageNames: Record<string, string> = {
    쥐: "Rat", 소: "Ox", 호랑이: "Tiger", 토끼: "Rabbit", 용: "Dragon",
    뱀: "Snake", 말: "Horse", 양: "Goat", 원숭이: "Monkey", 닭: "Rooster",
    개: "Dog", 돼지: "Pig"
  };

  const element = getElement(daySky);
  const colorPrefix: Record<string, string> = {
    목: "푸른 ",
    화: "붉은 ",
    토: "노란 ",
    금: "흰 ",
    수: "검은 "
  };

  const koreanAnimal = animals[dayGround] || "";
  const englishAnimal = imageNames[koreanAnimal] || "default"; // undefined 방지
  const imageUrl = `https://raw.githubusercontent.com/Ran429/Rani_Aga_suju/main/img/${englishAnimal}.webp`;

  // 🔥 디버깅을 위해 콘솔 로그 추가
  console.log("dayGround:", dayGround);
  console.log("koreanAnimal:", koreanAnimal);
  console.log("englishAnimal:", englishAnimal);
  console.log("imageUrl:", imageUrl);

  return {
    animal: `${colorPrefix[element || ""] || ""}${koreanAnimal}`,
    color: element ? elementColors[element] : "#000",
    imageUrl
  };
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 via-blue-700 to-pink-600 p-6 font-[Pretendard-Regular]">
      <h1 className="text-4xl font-extrabold text-white">샤머니즘의 모·든·것</h1>
      
      <form className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="font-semibold">생년월일</label>
          <input 
            className="p-2 border rounded" 
            type="text" 
            value={birthDate} 
            onChange={(e) => setBirthDate(e.target.value.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"))} 
            placeholder="YYYYMMDD 입력 가능" 
            required 
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold">시간</label>
          <input className="p-2 border rounded" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600">운세 확인</button>
      </form>

      {isClient && sajuResult && (
        <>
          {/* 일주 동물 표시 */}
          <div className="mt-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 flex items-center justify-center" style={{ borderColor: getAnimalAndColor(sajuResult.day.sky, sajuResult.day.ground).color }}>
              <img src={getAnimalAndColor(sajuResult.day.sky, sajuResult.day.ground).imageUrl} alt="Saju Animal" className="w-28 h-28 rounded-full" />
            </div>
            <p className="text-white text-lg font-bold mt-2">{getAnimalAndColor(sajuResult.day.sky, sajuResult.day.ground).animal}</p>
          </div>
        </>
      )}
    </div>
  );
}
