// components/SajuCalculator.js
import { useEffect } from 'react';

const tenKan = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const twelveJi = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const fiveElements = {
  // 천간(十干)
  "갑": "목", "을": "목",
  "병": "화", "정": "화",
  "무": "토", "기": "토",
  "경": "금", "신": "금",
  "임": "수", "계": "수",
  
  // 지지(十二支) 추가
  "자": "수", "축": "토",
  "인": "목", "묘": "목",
  "진": "토", "사": "화",
  "오": "화", "미": "토",
  "신": "금", "유": "금",
  "술": "토", "해": "수",
};

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
 * 🟢 해당 연도의 간지(年柱) 계산
 * @param {number} year - 조회할 연도
 * @returns {string} - 해당 연도의 간지
 */
const getCurrentYearGanji = (year) => {
  return tenKan[(year + 6) % 10] + twelveJi[(year + 8) % 12];
};

/**
 * 🟢 세운(歲運) 계산
 * @param {number} year - 특정 연도
 * @returns {Object} - 해당 연도의 간지와 십이운성
 */
const getYearlyFortune = (year) => {
  const ganji = getCurrentYearGanji(year);
  const tenkan = ganji[0];  // 천간
  const dizhi = ganji[1];  // 지지
  const fortune = calculateTwelveFortunes(tenkan, dizhi);

  return { year, ganji, fortune };
};


/**
 * 🟢 월주(月柱) 계산
 */
export const calculateMonthPillar = (year, month) => {
  const adjustedYear = month < 2 ? year - 1 : year;
  const yearSkyIndex = (adjustedYear + 6) % 10; 

  const monthSkyIndex = (yearSkyIndex * 2 + month) % 10; 
  const monthGroundIndex = (month) % 12;

  return {
    sky: tenKan[monthSkyIndex],
    ground: twelveJi[monthGroundIndex] 
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
 * 🟢 십성(十神) 계산 함수 (천간 기준)
 */
const getTenGod = (daySky, targetSky) => {

  // daySky와 targetSky의 오행 찾기
  const dayElement = fiveElements[daySky];  // ✅ 수정: 직접 접근
  const targetElement = fiveElements[targetSky];  // ✅ 수정: 직접 접근

  if (!dayElement || !targetElement) return "알 수 없음";

  // 십성 관계 매핑 (비겁, 인성, 관성, 재성 등)
  const relationships = {
    "목": { "목": "비견", "화": "식신", "토": "편재", "금": "편관", "수": "정인" },
    "화": { "목": "정인", "화": "비견", "토": "식신", "금": "편재", "수": "편관" },
    "토": { "목": "편관", "화": "정인", "토": "비견", "금": "식신", "수": "편재" },
    "금": { "목": "편재", "화": "편관", "토": "정인", "금": "비견", "수": "식신" },
    "수": { "목": "식신", "화": "편재", "토": "편관", "금": "정인", "수": "비견" },
  };

  // 십성 결정
  const tenGod = relationships[dayElement]?.[targetElement] || "알 수 없음";

  return tenGod;
};

/**
 * 🟢 육친(六親) 분석 (부모, 형제, 배우자, 자식 관계)
 * @param {string} daySky - 일간(日干)
 * @param {string} relation - 분석할 관계 ("father", "mother", "siblings", "spouse", "children")
 * @returns {string} - 해당 육친 정보
 */
const determineFamilyRelation = (daySky, relation) => {
  const relations = {
    father: { 목: "편관", 화: "정관", 토: "편재", 금: "정재", 수: "정인" },
    mother: { 목: "편인", 화: "정인", 토: "정재", 금: "편재", 수: "정관" },
    siblings: { 목: "비견", 화: "비견", 토: "비견", 금: "비견", 수: "비견" },
    spouse: { 목: "정재", 화: "편재", 토: "정관", 금: "편관", 수: "편관" },
    children: { 목: "식신", 화: "상관", 토: "식신", 금: "상관", 수: "식신" }
  };

  return relations[relation][fiveElements[daySky]];
};

/// 천간합(天干合)과 지지합(地支合) 계산
const calculateRelations = (sky, ground) => {
  const heavenlyElementalUnions = {
    "갑": "기", "을": "경", "병": "임", "정": "계",
    "무": "신", "기": "갑", "경": "을", "신": "무",
    "임": "병", "계": "정"
  };

  const earthlyElementalSixUnions = {
    "자": "축", "인": "해", "묘": "술", "진": "유",
    "사": "신", "오": "미"
  };

  const earthlyElementalConflicts = {
    "자": "오", "오": "자",
    "축": "미", "미": "축",
    "인": "신", "신": "인",
    "묘": "유", "유": "묘",
    "진": "술", "술": "진",
    "사": "해", "해": "사"
  };

  let relations = {
    heavenlyUnion: heavenlyElementalUnions[sky] || null,
    earthlyUnion: earthlyElementalSixUnions[ground] || null,
    earthlyConflict: earthlyElementalConflicts[ground] || null,
    occurredUnions: [], // 발생한 합 저장
    occurredConflicts: [] // 발생한 충 저장
  };

  // 클라이언트 전용 코드로 `earthlyElementalThreeUnions` 처리
  useEffect(() => {
    const earthlyElementalThreeUnions = {
      "신": ["자", "진"], "자": ["진", "신"], "진": ["신", "자"],
      "해": ["묘", "미"], "묘": ["미", "해"], "미": ["해", "묘"],
      "인": ["오", "술"], "오": ["술", "인"], "술": ["인", "오"],
      "사": ["유", "축"], "유": ["축", "사"], "축": ["사", "유"]
    };

    console.log(earthlyElementalThreeUnions);
  }, []);  // `useEffect`는 클라이언트 측에서만 실행되므로 컴포넌트가 마운트될 때만 실행됩니다.

  if (relations.heavenlyUnion) {
    relations.occurredUnions.push(`${sky} + ${relations.heavenlyUnion} (천간합)`);
  }
  if (relations.earthlyUnion) {
    relations.occurredUnions.push(`${ground} + ${relations.earthlyUnion} (지지합)`);
  }
  if (relations.earthlyConflict) {
    relations.occurredConflicts.push(`${ground} ↔ ${relations.earthlyConflict} (지지충)`);
  }

  return relations;
};


/**
 * 🟢 간여지동(干與地同) 판별
 * @param {Object} saju - 사주 데이터 (year, month, day, hour)
 * @returns {boolean} - 간여지동 여부
 */
const checkGanYeojidong = (saju) => {
  const pillars = [saju.year, saju.month, saju.day, saju.hour];
  return pillars.some(({ sky, ground }) => fiveElements[sky] === fiveElements[ground]);
};


/**
 * 🟢 십성(十神) 계산 함수 (지지 기준)
 */
const getTenGodGround = (daySky, targetGround) => {
  return getTenGod(daySky, targetGround);
};

/**
 * 🟢 십이운성 계산
 * @param {string} daySky - 일간(日干)
 * @param {string} ground - 지지(地支)
 * @returns {string} - 십이운성 결과
 */
const calculateTwelveFortunes = (daySky, ground) => {
  const fortunes = {
    "목": ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"],
    "화": ["절", "태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘"],
    "토": ["묘", "절", "태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사"],
    "금": ["병", "사", "묘", "절", "태", "양", "장생", "목욕", "관대", "건록", "제왕", "쇠"],
    "수": ["제왕", "쇠", "병", "사", "묘", "절", "태", "양", "장생", "목욕", "관대", "건록"]
  };

  const index = twelveJi.indexOf(ground);
  return fortunes[fiveElements[daySky]][index];
};

/**
 * 🟢 십이신살 계산
 * @param {string} yearGround - 연지(年支)
 * @param {string} targetGround - 비교할 지지
 * @returns {string} - 십이신살 결과
 */
const calculateTwelveGods = (yearGround, targetGround) => {
  const gods = {
    "자": ["장성", "역마", "반안", "재살", "월살", "망신", "천살", "육해", "화개", "겁살", "천문", "천기"],
    "축": ["망신", "천살", "육해", "화개", "겁살", "천문", "천기", "장성", "역마", "반안", "재살", "월살"]
  };

  const index = twelveJi.indexOf(targetGround);
  return gods[yearGround]?.[index] || "없음";
};

/**
 * 🟢 주요 신살(神煞) 판별
 * @param {string} ground - 현재 지지(地支)
 * @param {string} daySky - 일간(日干) (천덕귀인, 문창귀인 계산에 필요)
 * @param {string} otherGround - 상대 지지 (육해살, 원진살, 공망살 계산에 필요)
 * @returns {Object} - 신살 여부
 */
const checkSpecialGods = (ground, daySky, otherGround = null) => {
  const specialGods = {
    yeokma: ["신", "자", "진", "사", "유", "축", "인", "오", "술", "해", "묘", "미"], // 역마살
    dohwa: ["자", "묘", "오", "유"], // 도화살
    hwagae: ["진", "술", "축", "미"], // 화개살
    gwaegang: ["진", "술", "오", "미"], // 괴강살
    baekho: ["갑진", "을미", "병술", "정축", "무진", "임술", "계축"], // 백호대살
    yangin: ["병오", "무오", "임자"], // 양인살
    jaesal: ["사", "유", "축", "신", "자", "진"], // 재살
    wolsal: ["인", "오", "술", "해", "묘", "미"], // 월살
    mangsin: ["진", "술", "축", "미"], // 망신살
    geopsal: ["사", "유", "축", "신", "자", "진"], // 겁살

    // 육해살 (지지가 특정한 다른 지지를 만나야 발생)
    yukhae: { 
      "자": "미", "축": "오", "인": "사", "묘": "진", "신": "해", "유": "술", 
      "미": "자", "오": "축", "사": "인", "진": "묘", "해": "신", "술": "유"
    },

    // 원진살 (지지가 특정한 다른 지지를 만나야 발생)
    wonjin: {
      "진": "해", "오": "축", "사": "술", "묘": "신", "인": "유", "자": "미",
      "해": "진", "축": "오", "술": "사", "신": "묘", "유": "인", "미": "자"
    },

    // 공망살 (일주의 60갑자 배치에 따라 특정 지지가 공망)
    gongmang: {
      "갑자": ["술", "해"], "갑술": ["신", "유"], "갑신": ["오", "미"], 
      "갑오": ["진", "사"], "갑진": ["인", "묘"], "갑인": ["자", "축"]
    },

    // 천덕귀인
    cheondeok: { "甲": "亥", "乙": "子", "丙": "丑", "丁": "寅", "戊": "卯", "己": "辰", "庚": "巳", "辛": "午", "壬": "未", "癸": "申" },

    // 문창귀인
    moonchang: { "甲": "巳", "乙": "午", "丙": "申", "丁": "酉", "戊": "申", "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯" },

    // 반안살 (성공, 승진)
    banan: ["인", "묘", "진", "사", "오", "미"],

    // 혈인살 (상처, 사고)
    hyeolin: ["자", "오", "묘", "유"],

    // 고란살 (결혼 장애)
    goran: ["자", "오", "묘", "유"],

    // 천라지망 (구속, 장애)
    cheonra: ["진", "술"], 
    jimaang: ["축", "미"]
  };

  let result = {
    yeokma: specialGods.yeokma.includes(ground),
    dohwa: specialGods.dohwa.includes(ground),
    hwagae: specialGods.hwagae.includes(ground),
    gwaegang: specialGods.gwaegang.includes(ground),
    baekho: specialGods.baekho.includes(ground),
    yangin: specialGods.yangin.includes(ground),
    jaesal: specialGods.jaesal.includes(ground),
    wolsal: specialGods.wolsal.includes(ground),
    mangsin: specialGods.mangsin.includes(ground),
    geopsal: specialGods.geopsal.includes(ground),

    // 육해살, 원진살, 공망살은 상대 지지(otherGround)와 비교하여 판별
    yukhae: otherGround ? specialGods.yukhae[ground] === otherGround : false,
    wonjin: otherGround ? specialGods.wonjin[ground] === otherGround : false,
    gongmang: specialGods.gongmang[daySky]?.includes(ground) || false,

    // 천덕귀인, 문창귀인 (일간을 기준으로 특정 지지가 있는지 확인)
    cheondeok: specialGods.cheondeok[daySky] === ground,
    moonchang: specialGods.moonchang[daySky] === ground,

    // 추가 신살
    banan: specialGods.banan.includes(ground),
    hyeolin: specialGods.hyeolin.includes(ground),
    goran: specialGods.goran.includes(ground),
    cheonra: specialGods.cheonra.includes(ground),
    jimaang: specialGods.jimaang.includes(ground)
  };

  return result;
};

/**
 * 🟢 대운 주기 계산
 * @param {number} birthYear - 출생 연도
 * @param {number} birthMonth - 출생 월
 * @param {string} gender - 성별 ("남" or "여")
 * @returns {number} - 대운이 시작하는 나이
 */
const calculateDaewoonPeriod = (birthYear, birthMonth, gender) => {
  const isYang = birthYear % 2 === 0; // 짝수 해 = 양년생
  const forward = (isYang && gender === "남") || (!isYang && gender === "여");
  const baseAge = (birthMonth - 1) * 3; // 생월에 따라 대운 시작 나이 결정

  return forward ? baseAge : 10 - baseAge;
};

/**
 * 🟢 대운 리스트(10년 주기)
 * @param {number} birthYear - 출생 연도
 * @param {number} birthMonth - 출생 월
 * @param {string} gender - 성별 ("남" or "여")
 * @returns {Array} - 대운이 오는 연도 리스트
 */
const getDaewoonList = (birthYear, birthMonth, gender) => {
  const startAge = calculateDaewoonPeriod(birthYear, birthMonth, gender);
  let daewoonYears = [];
  
  for (let i = 0; i < 10; i++) {
    daewoonYears.push({
      age: startAge + i * 10,
      year: birthYear + startAge + i * 10,
      pillar: getCurrentYearGanji(birthYear + startAge + i * 10)
    });
  }

  return daewoonYears;
};

/**
 * 🟢 합과 충을 반영한 오행 분포 계산
 * @param {Object} saju - 사주 데이터 (year, month, day, hour)
 * @returns {Object} - 조정된 오행 분포
 */
export const calculateElementDistribution = (saju) => {
  let baseElements = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }; // 합·충 반영 전
  let adjustedElements = Object.assign({}, baseElements); // 별도 객체로 복사 (오류 방지)

  const pillars = [saju.year, saju.month, saju.day, saju.hour];

  // 🌿 1. 합·충 반영 전 기본 오행 계산
  pillars.forEach(({ sky, ground }) => {
    if (fiveElements[sky]) baseElements[fiveElements[sky]]++;
    if (fiveElements[ground]) baseElements[fiveElements[ground]]++;
  });

  // 🌿 2. 합·충 반영 후 오행 계산 (합과 충 반영)
  pillars.forEach(({ sky, ground }) => {
    const relations = calculateRelations(sky, ground);

    if (fiveElements[sky]) adjustedElements[fiveElements[sky]]++;
    if (fiveElements[ground]) adjustedElements[fiveElements[ground]]++;

    if (relations.heavenlyUnion && fiveElements[relations.heavenlyUnion]) {
      adjustedElements[fiveElements[relations.heavenlyUnion]]++;
    }
    if (relations.earthlyUnion && fiveElements[relations.earthlyUnion]) {
      adjustedElements[fiveElements[relations.earthlyUnion]]++;
    }
    if (relations.earthlyConflict && fiveElements[relations.earthlyConflict]) {
      adjustedElements[fiveElements[relations.earthlyConflict]]--;
    }
  });

  return { baseElements, adjustedElements };
};

// ✅ 사용하지 않는 변수를 임시로 활용
console.log(getYearlyFortune, determineFamilyRelation, earthlyElementalThreeUnions, checkGanYeojidong, getTenGodGround);

export const getSaju = (birthDate, birthTime, gender) => {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const yearPillar = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar.sky, birthTime);

  // 🌿 사주 데이터 생성 (tenGodSky, tenGodGround 포함)
  const saju = {
    year: {
      ...yearPillar,
      tenGodSky: getTenGod(dayPillar.sky, yearPillar.sky),
      tenGodGround: getTenGod(dayPillar.sky, yearPillar.ground)
    },
    month: {
      ...monthPillar,
      tenGodSky: getTenGod(dayPillar.sky, monthPillar.sky),
      tenGodGround: getTenGod(dayPillar.sky, monthPillar.ground)
    },
    day: {
      ...dayPillar,
      tenGodSky: getTenGod(dayPillar.sky, dayPillar.sky),
      tenGodGround: getTenGod(dayPillar.sky, dayPillar.ground)
    },
    hour: {
      ...hourPillar,
      tenGodSky: getTenGod(dayPillar.sky, hourPillar.sky),
      tenGodGround: getTenGod(dayPillar.sky, hourPillar.ground)
    }
  };

  // 🌿 합(合)과 충(冲) 분석 (한 번만 실행)
  let occurredUnions = [];
  let occurredConflicts = [];
  const pillars = [saju.year, saju.month, saju.day, saju.hour];

  pillars.forEach(({ sky, ground }) => {
    const relations = calculateRelations(sky, ground);

    // ✅ 오행을 변화시키는 합(合)만 저장
    if (relations.heavenlyUnion) {
      occurredUnions.push(`${sky} + ${relations.heavenlyUnion} → ${fiveElements[relations.heavenlyUnion]} 오행 변환`);
    }
    if (relations.earthlyUnion) {
      occurredUnions.push(`${ground} + ${relations.earthlyUnion} → ${fiveElements[relations.earthlyUnion]} 오행 변환`);
    }

    // ✅ 오행을 깨뜨리는 충(冲)만 저장
    if (relations.earthlyConflict) {
      occurredConflicts.push(`${ground} ↔ ${relations.earthlyConflict} → ${fiveElements[relations.earthlyConflict]} 오행 충격`);
    }
  });

  // 🌿 합과 충을 반영한 오행 분포 계산 (중복 호출 제거)
  const { baseElements, adjustedElements } = calculateElementDistribution(saju);

  // 🌿 대운 주기 계산
  const daewoonPeriod = calculateDaewoonPeriod(year, month, gender);
  const daewoonList = getDaewoonList(year, month, gender);

  // 🌿 십이운성 & 십이신살 계산
  const twelveFortunes = {
    year: calculateTwelveFortunes(dayPillar.sky, yearPillar.ground),
    month: calculateTwelveFortunes(dayPillar.sky, monthPillar.ground),
    day: calculateTwelveFortunes(dayPillar.sky, dayPillar.ground),
    hour: calculateTwelveFortunes(dayPillar.sky, hourPillar.ground)
  };

  const twelveGods = {
    year: calculateTwelveGods(yearPillar.ground, dayPillar.ground),
    month: calculateTwelveGods(monthPillar.ground, dayPillar.ground),
    day: calculateTwelveGods(dayPillar.ground, dayPillar.ground),
    hour: calculateTwelveGods(hourPillar.ground, dayPillar.ground)
  };

  // 🌿 주요 신살 분석
  const specialGods = {
    year: checkSpecialGods(yearPillar.ground, dayPillar.sky, dayPillar.ground),
    month: checkSpecialGods(monthPillar.ground, dayPillar.sky, dayPillar.ground),
    day: checkSpecialGods(dayPillar.ground, dayPillar.sky, dayPillar.ground),
    hour: checkSpecialGods(hourPillar.ground, dayPillar.sky, dayPillar.ground)
  };

  return {
    ...saju, // 기존 사주 데이터 유지
    baseElements,
    adjustedElements,
    daewoonPeriod,
    daewoonList,
    twelveFortunes,
    twelveGods,
    specialGods,
    occurredUnions, // ✅ 최적화된 합 리스트
    occurredConflicts // ✅ 최적화된 충 리스트
  };
};
