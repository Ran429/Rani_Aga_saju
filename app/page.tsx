"use client";

import { useState, useEffect } from "react";
import { getSaju } from "./components/SajuCalculator";

const elementColors = {
  목: "#228B22", // 초록색
  화: "#FF4500", // 빨간색
  토: "#D2B48C", // 황토색
  금: "#A9A9A9", // 회색
  수: "#1E90FF", // 파란색
};

const getElement = (char) => {
  if (["갑", "을", "인", "묘"].includes(char)) return "목";
  if (["병", "정", "사", "오"].includes(char)) return "화";
  if (["무", "기", "진", "술", "축", "미"].includes(char)) return "토";
  if (["경", "신", "신", "유"].includes(char)) return "금";
  if (["임", "계", "자", "해"].includes(char)) return "수";
  return "";
};

export default function Home() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [calendarType, setCalendarType] = useState("solar");
  const [gender, setGender] = useState("male");
  const [sajuResult, setSajuResult] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!birthDate || !birthTime) {
      alert("생년월일과 시간을 입력하세요!");
      return;
    }
    const result = getSaju(birthDate, birthTime, calendarType, gender);
    setSajuResult(result);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600">사주 입력</h1>

      <form className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        {/* 🟢 줄바꿈 추가: 입력 필드를 세로로 정렬 */}
        <div className="flex flex-col">
          <label className="font-semibold">양력/음력</label>
          <select className="p-2 border rounded" value={calendarType} onChange={(e) => setCalendarType(e.target.value)}>
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold">성별 선택</label>
          <select className="p-2 border rounded" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">남자</option>
            <option value="female">여자</option>
          </select>
        </div>

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
                {['hour', 'day', 'month', 'year'].map((pillar) => (
                  <td key={pillar} className="border border-gray-400 p-2" style={{ color: elementColors[getElement(sajuResult[pillar].sky)] }}>
                    {sajuResult[pillar].sky}
                  </td>
                ))}
              </tr>
              <tr>
                {['hour', 'day', 'month', 'year'].map((pillar) => (
                  <td key={pillar} className="border border-gray-400 p-2" style={{ color: elementColors[getElement(sajuResult[pillar].ground)] }}>
                    {sajuResult[pillar].ground}
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
