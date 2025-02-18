"use client";

import { useState, useEffect } from "react";
import { getSaju } from "./components/SajuCalculator";
import Image from 'next/image';

// 사주 데이터 타입 정의
type SajuType = {
  year: { sky: string; ground: string };
  month: { sky: string; ground: string };
  day: { sky: string; ground: string };
  hour: { sky: string; ground: string };
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

// getElement 함수: 한글 문자에 따라 오행 반환
const getElement = (char: string): keyof typeof elementColors => {
  if (!char) return "수"; // 기본값 "수" 보장
  if ("갑을인묘".includes(char)) return "목";
  if ("병정사오".includes(char)) return "화";
  if ("무기진술축미".includes(char)) return "토";
  if ("경신유".includes(char)) return "금";
  if ("임계자해".includes(char)) return "수";
  return "수"; // 최종 안전한 기본값 설정
};

// 일주 동물 및 프레임 색상 반환 함수
const getAnimalAndColor = (daySky: string, dayGround: string) => {
  const animals: Record<string, string> = {
    자: "쥐", 축: "소", 인: "호랑이", 묘: "토끼", 진: "용",
    사: "뱀", 오: "말", 미: "양", 신: "원숭이", 유: "닭",
    술: "개", 해: "돼지"
  };

  const imageUrls: Record<string, string> = {
    쥐: "https://i.imgur.com/NfTjvBa.png",
    소: "https://i.imgur.com/2fHObII.png",
    호랑이: "https://i.imgur.com/IRIcKUF.png",
    토끼: "https://i.imgur.com/Wm7lhe5.png",
    용: "https://i.imgur.com/llBGs3f.png",
    뱀: "https://i.imgur.com/RFM4Je5.png",
    말: "https://i.imgur.com/PmdwrW2.png",
    양: "https://i.imgur.com/n5tWHdW.png",
    원숭이: "https://i.imgur.com/wiRHpFx.png",
    닭: "https://i.imgur.com/IakoWOf.png",
    개: "https://i.imgur.com/O71tkpw.png",
    돼지: "https://i.imgur.com/oaT9OTj.png"
  };

  const element = getElement(daySky) ?? "수"; // 기본값 "수" 설정
  const colorPrefix: Record<string, string> = {
    목: "푸른 ",
    화: "붉은 ",
    토: "노란 ",
    금: "흰 ",
    수: "검은 "
  };

  const animal = animals[dayGround] ?? "알 수 없음";
  const imageUrl = imageUrls[animal] ?? "";
  const color = elementColors[element];

  return {
    animal: `${colorPrefix[element]}${animal}`, // 색상 + 동물명
    color,
    imageUrl
  };
};

// ✅ useState 추가
export default function Home() {
  const [userName, setUserName] = useState(""); // 이름
  const [birthType, setBirthType] = useState<"양력" | "음력">("양력"); // 양력/음력 (기본값)
  const [gender, setGender] = useState("남성"); // 성별 (기본값: "남성")
  const [birthDate, setBirthDate] = useState(""); // 생년월일
  const [birthTime, setBirthTime] = useState(""); // 출생 시간
  const [sajuResult, setSajuResult] = useState<SajuType | null>(null);
  const [isClient, setIsClient] = useState(false);
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
  

  useEffect(() => {
    setIsClient(true);
    console.log("isClient 상태 설정 완료"); // ✅ 디버깅용 로그 추가
  }, []);

  // ✅ handleSubmit 수정 (입력값 검증 개선)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = [];
    if (!userName) missingFields.push("이름");
    if (!birthDate) missingFields.push("생년월일");
    if (!birthTime) missingFields.push("출생 시간");
    if (!gender) missingFields.push("성별");

    if (missingFields.length > 0) {
      alert(`다음 항목을 입력하세요: ${missingFields.join(", ")}`);
      return;
    }

    const result = getSaju(birthDate, birthTime);

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
{isClient && sajuResult && (() => {
    // ✅ sajuResult가 올바른 구조인지 확인
    if (!sajuResult || !sajuResult.year) {
      return null; // sajuResult가 잘못된 경우 렌더링 방지
    }

    // ✅ userInfo 분리하여 타입 오류 방지
    const { userInfo, ...saju } = sajuResult as SajuType; 

    const daySky = saju?.day?.sky ?? "";
    const dayElement = getElement(daySky) as "목" | "화" | "토" | "금" | "수";
    const dayGround = saju?.day?.ground ?? "";
    const animalData = getAnimalAndColor(daySky, dayGround);

    // ✅ userInfo가 존재하지 않으면 기본값 설정
    const user = userInfo || {
      name: "알 수 없음",
      birthType: "양력",
      birthDate: "알 수 없음",
      birthTime: "알 수 없음",
      gender: "알 수 없음"
    };

    const userName = user.name;
    const birthType = user.birthType;
    const birthDate = user.birthDate;
    const genderText = user.gender;

    // ✅ birthDate가 유효한 경우에만 나이 계산
    const birthYear = birthDate !== "알 수 없음" ? parseInt(birthDate.slice(0, 4), 10) : null;
    const ageText = birthYear ? `만 ${new Date().getFullYear() - birthYear}세` : "알 수 없음";

    return (
      <div className="mt-6 bg-white p-4 shadow-lg rounded-lg w-full max-w-md">
        
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-blue-600 text-center">당신의 사주 결과는...!</h2>

        {/* 인트로 메시지 */}
        <p className="text-sm text-center text-gray-700 mt-4">
        <span className="block">안녕하세요! <span className="font-bold">{userName}</span>님,</span>
        입력해 주신 <span className="font-bold">{userName}</span>님의 사주 정보는 다음과 같습니다.
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
              {(["sky", "ground"] as ("sky" | "ground")[]).map((type) => (
                <tr key={type}>
                  <td className="border border-gray-400 p-2 bg-gray-100 font-bold">
                    {type === "sky" ? "천간" : "지지"}
                  </td>
                  {(["hour", "day", "month", "year"] as (keyof Omit<SajuType, "userInfo">)[]).map((pillar) => {
                    const element = getElement(sajuResult?.[pillar]?.[type] ?? "") ?? "목";
                    return (
                      <td key={pillar} className={`border border-gray-400 p-2 ${elementColors[element]}`}>
                        {sajuResult?.[pillar]?.[type] ?? ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* 사주 설명 추가 */}
        <p className="text-sm text-left text-gray-700 mt-4 break-words">
          <span className="font-bold">{userName}</span>님의 사주를 살펴볼까요?  <br />
          예를 들어, <span className="font-semibold text-gray-700">일간(일주의 천간)</span>은 
          <span className="font-semibold text-gray-700"> "{daySky}"</span>이 되고,  <br />
          <span className="font-semibold text-gray-700"> 일지(일주의 지지)</span>는 
          <span className="font-semibold text-gray-700"> "{dayGround}"</span>가 된답니다.  
          <br /><br />
          
          {/* 🔥 저장된 일주를 불러와 예시로 추가 */}
          <span className="font-bold">{userName}</span>님의 일주는  
          <span className="text-lg font-bold text-blue-600">"{daySky}{dayGround}"</span>가 됩니다.  
          <br /><br />

          {/* 🌿 년주~시주의 의미 추가 */}
          <span className="text-sm font-bold text-gray-700">1-1. 사주의 구성</span><br />
            <span className="font-bold">#1. 년주(年柱) → 조상과 인생관</span><br />
              조상, 조국, 국가 성장 배경을 뜻하며, 한 사람의 가치관과 인생관에도 영향을 줍니다.<br />  

              <span className="font-bold">#2. 월주(月柱) → 부모, 형제, 사회성</span><br />
              부모와 형제 관계뿐만 아니라, 사회 속에서의 태도와 사고방식을 결정짓는 요소가 됩니다.<br />  

              <span className="font-bold">#3.일주(日柱) → 배우자궁, 감정관, 나 자신</span><br /> 
              개인의 외형적 특징과 성격을 의미하며, 감정적인 면이나 배우자와의 관계도 포함됩니다.<br />  

              <span className="font-bold">#4.시주(時柱) → 자식, 미래, 지향점</span><br />
              말년운, 자녀와의 관계, 개인의 미래 목표나 지향점을 나타냅니다.<br />  
            <br />

            또한, 사주(네 개의 기둥)는 봄·여름·가을·겨울,  
            아침·낮·저녁·밤의 흐름을 상징하는 등 여러 의미를 가집니다.  
            <br /><br />

            {/* 📌 일주론 추가 */}
            <span className="text-sm font-bold text-gray-700">1-2. 일주(日柱)란?</span><br />  
            일주는 태어난 날의 천간과 지지(간지)를 의미하며,<br />  
            이는 자신을 대표하는 가장 중요한 요소입니다.<br /><br />
            즉, <span className="font-bold">{userName}</span>님의 일주는 "{daySky}{dayGround} 일주"로,<br />  
            해당 일주를 가진 사람들은 특정한 성향과 특징을 공유합니다.  
            <br /><br />


          <span className="font-bold">이제 일간과 일지를 조합해서 나의 일주 동물을 알아볼까요? 🐉🐅</span>
        </p>


        {/* 챕터 2: 나의 일주 동물은? */}
        <h3 className="text-xl font-bold text-blue-400 mt-6 text-left">📌 챕터 2. 나의 일주 동물은?</h3>

        <div className="mt-4 flex flex-col items-center">
          {/* 일주 동물 아이콘 */}
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center overflow-hidden ${elementColors[dayElement]}`}>
            <Image src={animalData.imageUrl} 
                 alt="Saju Animal" 
                 width={128}
                 height={128} 
                 className="w-full h-full object-contain" />
          </div>

          {/* 텍스트로 색상 + 동물 표시 */}
          <p className="text-black-900 text-lg font-bold mt-2">{animalData.animal || "알 수 없음"}</p>

          {/* 추가 설명 */}
          <p className="text-sm text-left text-gray-700 mt-4 break-words">
            <span className="font-bold">{userName}</span>님의 일주 동물은 <span className="font-bold">{animalData.animal || "알 수 없음"}</span>입니다. <br />
            먼저, 일주 기억하시죠? {userName}님의 일주는 {daySky}{dayGround}였어요.<br />
            사주는 오행을 기반으로 해석하는데요. <br />
            오행(목,화,토,금,수) 중에 일간인 "{daySky}"는 {dayElement}이죠. <br />
            해당하는 오행의 색을 가져오고, <br />
            일지인 "{dayGround}"의 동물을 합치면 <span className="font-bold">{animalData.animal || "알 수 없음"}</span>이 됩니다.<br />
          </p>
        </div>
      </div>
    );
})()}
    </div>
  );
}
