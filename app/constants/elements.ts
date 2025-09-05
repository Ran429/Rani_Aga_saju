// 오행, 천간, 지지, 음양, 오행 상관관계
export const tenKan = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]as const;
export const twelveJi = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]as const;

export const fiveElements = {
  "갑": "목", "을": "목",
  "병": "화", "정": "화",
  "무": "토", "기": "토",
  "경": "금", "신": "금",
  "임": "수", "계": "수",
  "자": "수", "축": "토",
  "인": "목", "묘": "목",
  "진": "토", "사": "화",
  "오": "화", "미": "토", "유": "금",
  "술": "토", "해": "수",
} as const;

export const yinYang = {
  "갑":"양","을":"음","병":"양","정":"음","무":"양","기":"음","경":"양","신":"음","임":"양","계":"음",
  "자":"양","축":"음","인":"양","묘":"음","진":"양","사":"음","오":"양","미":"음","유":"음","술":"양","해":"음",
} as const;

export const rel = {
  "목": { produces:"화", producedBy:"수", controls:"토", controlledBy:"금" },
  "화": { produces:"토", producedBy:"목", controls:"금", controlledBy:"수" },
  "토": { produces:"금", producedBy:"화", controls:"수", controlledBy:"목" },
  "금": { produces:"수", producedBy:"토", controls:"목", controlledBy:"화" },
  "수": { produces:"목", producedBy:"금", controls:"화", controlledBy:"토" },
} as const;

