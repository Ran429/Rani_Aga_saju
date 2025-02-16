// components/SajuCalculator.js

const tenKan = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const twelveJi = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

/**
 * 🟢 연주(年柱) 계산
 */
export const calculateYearPillar = (year, month, day) => {
  const adjustedYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
  return {
    sky: tenKan[(adjustedYear + 6) % 10], // (y + 7) % 10 공식 반영
    ground: twelveJi[(adjustedYear + 8) % 12] // (y + 9) % 12 공식 반영
  };
};

/**
 * 🟢 월주(月柱) 계산 - 공식 반영
 */
export const calculateMonthPillar = (year, month) => {
  const adjustedYear = month < 2 ? year - 1 : year;
  const yearSkyIndex = (adjustedYear + 6) % 10; // 연간 인덱스

  const monthSkyIndex = (yearSkyIndex * 2 + month) % 10; // 월간 공식 적용
  const monthGroundIndex = (month) % 12; // ✅ **월지 공식 수정**

  return {
    sky: tenKan[monthSkyIndex],
    ground: twelveJi[monthGroundIndex] // 🔥 **월지 인덱스 수정**
  };
};

/**
 * 🟢 일주(日柱) 계산
 */
export const calculateDayPillar = (year, month, day) => {
  if (month === 1 || month === 2) {
    year -= 1;
    month += 12;
  }

  const baseDate = new Date(1936, 1, 12); // 기준일 (양력 1936-02-12, 갑자일)
  const targetDate = new Date(year, month - 1, day);
  const elapsedDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));

  return {
    sky: tenKan[(elapsedDays % 10 + 10) % 10], // 음수 방지
    ground: twelveJi[(elapsedDays % 12 + 12) % 12] // 음수 방지
  };
};

/**
 * 🟢 시주(時柱) 계산
 */
export const calculateHourPillar = (daySky, timeStr) => {
  const timeToJiMap = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const [hour] = timeStr.split(":").map(Number);
  const timeIndex = Math.floor(hour / 2) % 12;

  // 일간에 따른 시간(天干) 설정
  const hourGanStart = {
    "갑": 0, "기": 0,
    "을": 2, "경": 2,
    "병": 4, "신": 4,
    "정": 6, "임": 6,
    "무": 8, "계": 8
  };

  const hourSkyIndex = (hourGanStart[daySky] + timeIndex) % 10;

  return {
    sky: tenKan[hourSkyIndex],
    ground: timeToJiMap[timeIndex]
  };
};

/**
 * 🟢 사주 계산
 */
export const getSaju = (birthDate, birthTime) => {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const yearPillar = calculateYearPillar(year, month, day); // ✅ 연주 계산
  const monthPillar = calculateMonthPillar(year, month); // ✅ 수정된 월주 계산
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar.sky, birthTime);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar
  };
};
