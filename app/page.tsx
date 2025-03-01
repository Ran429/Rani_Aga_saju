"use client";

import { useState, useEffect } from "react";
import { getSaju } from "./components/SajuCalculator";
import SajuExplanation from "./components/SajuExplanation";

/**
 * 📌 페이지 구조 개요
 * 1. 사용자 입력 폼 (이름, 생년월일, 출생 시간, 성별 등)
 * 2. 사주 결과 출력 (4x2 사주표 + 십성 추가)
 * 3. 일주 동물 및 색상 표시
 * 4. 텍스트 파일로 사주 데이터 다운로드 기능 추가
 */

// 사주 데이터 타입 정의
type SajuType = {
  year: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  month: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  day: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  hour: { sky: string; ground: string; tenGodSky: string; tenGodGround: string };
  userInfo?: { // 사용자 정보 추가
    name: string;
    birthType: string;
    birthDate: string;
    birthTime: string;
    gender: string;
  };
};

// 사주 오행별 색상 정의
const elementColors: Record<"목" | "화" | "토" | "금" | "수", string> = {
  목: "text-green-600 border-green-600", // 초록색 (텍스트 + 테두리)
  화: "text-red-600 border-red-600", // 빨간색
  토: "text-yellow-600 border-yellow-600", // 노란색
  금: "text-gray-600 border-gray-600", // 회색
  수: "text-blue-600 border-blue-600", // 파란색
};

// 🟢 십성 테이블 스타일 정의 (기존 사주표 강조)
const baseCellStyle = "border border-gray-400 p-2 bg-gray-300 font-bold";
const tenGodCellStyle = "border border-gray-400 p-1 text-sm text-gray-700"; // 십성은 작은 글씨로

// getElement 함수: 한글 문자에 따라 오행 반환
const getElement = (char: string): keyof typeof elementColors => {
  if (!char) return "수"; // 기본값 "수" 보장
  if ("갑을인묘".includes(char)) return "목";
  if ("병정사오".includes(char)) return "화";
  if ("무기진술축미".includes(char)) return "토";
  if ("경신유".includes(char)) return "금";
  if ("임계자해".includes(char)) return "수";
  return "수"; 
};

// ✅ useState 추가
export default function Home() {
  const [userName, setUserName] = useState(""); // 이름
  const [birthType, setBirthType] = useState<"양력" | "음력">("양력"); // 양력/음력 (기본값)
  const [gender, setGender] = useState("남성"); // 성별 (기본값: "남성")
  const [birthDate, setBirthDate] = useState(""); // 생년월일
  const [birthTime, setBirthTime] = useState(""); // 출생 시간
  const [sajuResult, setSajuResult] = useState<SajuType | null>(null);
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // 숫자 이외의 문자 제거
    if (value.length > 8) value = value.slice(0, 8); // 8자리까지만 허용
  
    if (value.length >= 6) {
      value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
    } else if (value.length >= 4) {
      value = `${value.slice(0, 4)}-${value.slice(4)}`;
    }
  
    setBirthDate(value);
  };
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ handleSubmit 수정 (입력값 검증 개선)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const missingFields = [];
    if (!userName) missingFields.push("이름");
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) missingFields.push("올바른 생년월일");
    if (!birthTime || !/^\d{2}:\d{2}$/.test(birthTime)) missingFields.push("올바른 출생 시간");
    if (!gender || !["남성", "여성"].includes(gender)) missingFields.push("성별");
  
    if (missingFields.length > 0) {
      alert(`다음 항목을 입력하세요: ${missingFields.join(", ")}`);
      return;
    }
  
    const result = getSaju(birthDate, birthTime, gender);
  
    setSajuResult({
      ...result,
      userInfo: {
        name: userName,
        birthType: birthType,
        birthDate: birthDate,
        birthTime: birthTime,
        gender: gender
      }
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 via-blue-700 to-pink-600 p-6 font-[Pretendard-Regular]">
      <h1 className="text-4xl font-extrabold text-white">샤머니즘의 모·든·것</h1>

      <form className="mt-6 bg-white p-6 shadow-lg rounded-lg w-full max-w-md space-y-4" onSubmit={handleSubmit}>

      {/* 이름 입력 */}
      <div className="flex flex-col">
        <label className="font-semibold">이름</label>
        <input 
          className="p-2 border rounded" 
          type="text" 
          value={userName} 
          onChange={(e) => setUserName(e.target.value)} 
          placeholder="이름 입력" 
          required 
        />
      </div>

      {/* 양/음력 선택 */}
      <div className="flex flex-col">
        <label className="font-semibold">양/음력</label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input type="radio" name="birthType" value="양력" checked={birthType === "양력"} onChange={() => setBirthType("양력")} />
            <span>양력</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" name="birthType" value="음력" checked={birthType === "음력"} onChange={() => setBirthType("음력")} />
            <span>음력</span>
          </label>
        </div>
      </div>

      {/* 생년월일 입력 */}
      <div className="flex flex-col">
        <label className="font-semibold">생년월일</label>
        <input 
          className="p-2 border rounded" 
          type="text"
          value={birthDate} 
          onChange={handleBirthDateChange} 
          placeholder="YYYY-MM-DD 입력 가능" 
          pattern="\d{4}-\d{2}-\d{2}" 
          required 
        />
      </div>

      {/* 시간 입력 */}
      <div className="flex flex-col">
        <label className="font-semibold">시간</label>
        <input 
          className="p-2 border rounded" 
          type="time" 
          value={birthTime} 
          onChange={(e) => setBirthTime(e.target.value)}
          min="00:00"
          max="23:59"
          required 
        />
      </div>

      {/* 성별 선택 */}
      <div className="flex flex-col">
        <label className="font-semibold">성별</label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input type="radio" name="gender" value="남성" checked={gender === "남성"} onChange={() => setGender("남성")} />
            <span>남성</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" name="gender" value="여성" checked={gender === "여성"} onChange={() => setGender("여성")} />
            <span>여성</span>
          </label>
        </div>
      </div>

      {/* 제출 버튼 */}
      <button 
        type="submit" 
        className={`p-2 rounded w-full ${userName && birthDate && birthTime && gender ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`}
        disabled={!userName || !birthDate || !birthTime || !gender}
      >
        운세 확인
      </button>
      </form>

      {/* 사주 결과 표시 */}
      {isClient && sajuResult && sajuResult.year ? (
        <div className="mt-6 bg-white p-4 shadow-lg rounded-lg w-full max-w-md">
          
          {/* 제목 */}
          <h2 className="text-2xl font-bold text-blue-600 text-center">당신의 사주 결과는...!</h2>

          {/* 유저 정보 정리 */}
          {(() => {
            const { userInfo, ...saju } = sajuResult as SajuType;
            console.log(saju);
            const user = userInfo || {
              name: "알 수 없음",
              birthType: "양력",
              birthDate: "알 수 없음",
              birthTime: "알 수 없음",
              gender: "알 수 없음",
            };

            const userName = user.name;
            const birthType = user.birthType;
            const birthDate = user.birthDate;
            const genderText = user.gender;

            const birthYear = birthDate !== "알 수 없음" ? parseInt(birthDate.slice(0, 4), 10) : null;
            const ageText = birthYear ? `만 ${new Date().getFullYear() - birthYear}세` : "알 수 없음";

            return (
              <>
                {/* 인트로 메시지 */}
                <p className="text-sm text-center text-gray-700 mt-4">
                  <span className="block">안녕하세요! <span className="font-bold">{userName}</span>님,😊</span>
                  입력해 주신 사주 정보를 기반으로 <span className="font-bold">{userName}</span>님의 사주를 분석해 드릴게요.
                </p>
                <p className="text-center text-black-700 font-bold mt-2">
                  {birthType} {birthDate} {ageText}, {genderText}
                </p>

                {/* 챕터 1: 나의 사주 구성은? */}
                <h3 className="text-xl font-bold text-blue-400 mt-6 text-left">📌 챕터 1. 나의 사주 구성은?</h3>

                {/* 사주 표 컨테이너 */}
                <div className="sticky top-0 bg-white shadow-md z-50">
                  {/* 4x2 사주팔자 표 */}
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
                      <tr>
                        <td className="border border-gray-400 p-2 bg-gray-100 font-bold">천간</td>
                        {(["hour", "day", "month", "year"] as const).map((pillarKey) => {
                          const skyValue = sajuResult?.[pillarKey]?.sky ?? "";
                          const elementType = getElement(skyValue);
                          return (
                            <td key={pillarKey} className={`border border-gray-400 p-2 bg-gray-300 ${elementColors[elementType] ?? ""}`}>
                              {skyValue}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className={tenGodCellStyle}>십성</td>
                        {(["hour", "day", "month", "year"] as const).map((pillarKey) => (
                          <td key={pillarKey} className={tenGodCellStyle}>{sajuResult?.[pillarKey]?.tenGodSky ?? ""}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-gray-400 p-2 bg-gray-100 font-bold">지지</td>
                        {(["hour", "day", "month", "year"] as const).map((pillarKey) => {
                          const groundValue = sajuResult?.[pillarKey]?.ground ?? "";
                          const elementType = getElement(groundValue);
                          return (
                            <td key={pillarKey} className={`border border-gray-400 p-2 bg-gray-300 ${elementColors[elementType] ?? ""}`}>
                              {groundValue}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className={tenGodCellStyle}>십성</td>
                        {(["hour", "day", "month", "year"] as const).map((pillarKey) => (
                          <td key={pillarKey} className={tenGodCellStyle}>{sajuResult?.[pillarKey]?.tenGodGround ?? ""}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 사주 풀이 설명을 별도 컴포넌트로 분리 */}
                <SajuExplanation sajuResult={sajuResult} userName={userName} gender={gender as "남성" | "여성"}/>
              </>
            );
          })()}
        </div>
          ) : null}
        </div>
      );
    }