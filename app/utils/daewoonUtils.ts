import { solarTerms } from "../constants/solarTerms";
import { getCurrentYearGanji } from "./dateUtils";

export function calculateDaewoonPeriod(birthYear: number, birthMonth: number, birthDay: number, gender: string) {
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

  const termsThisYear = solarTerms.map(term => {
    let year = birthYear;
    if (term.month === 1) year += 1;
    return new Date(year, term.month - 1, term.day);
  });

  let nextTerm = termsThisYear.find(term => term > birthDate);
  if (!nextTerm) {
    nextTerm = new Date(birthYear + 1, 1, 4);
  }

  const diffDays = Math.ceil((nextTerm.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const yearsToStart = Math.round(diffDays / 3);
  const isYangYear = birthYear % 2 !== 0;
  const forward = (isYangYear && gender === "남") || (!isYangYear && gender === "여");

  return forward ? yearsToStart : 10 - yearsToStart;
}

export const getDaewoonList = (birthYear: number, birthMonth: number, birthDay: number, gender: string) => {
  const startAge = calculateDaewoonPeriod(birthYear, birthMonth, birthDay, gender);
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