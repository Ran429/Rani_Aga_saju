alert("📊 FiveElementChart.tsx 실행됨!");
console.log("📊 FiveElementChart.tsx 실행됨!");

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


// Chart.js 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getElement = (char: string): "목" | "화" | "토" | "금" | "수" => {
  if (!char) return "수";
  if ("갑을인묘".includes(char)) return "목";
  if ("병정사오".includes(char)) return "화";
  if ("무기진술축미".includes(char)) return "토";
  if ("경신유".includes(char)) return "금";
  if ("임계자해".includes(char)) return "수";
  return "수";
};

const FiveElementChart = ({ sajuResult }: { sajuResult: any }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    console.log("FiveElementChart의 sajuResult:", sajuResult);
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p>📊 차트를 불러오는 중...</p>;
  }

  useEffect(() => {
    console.log("sajuResult 데이터:", sajuResult);
  }, [sajuResult]);
  console.log("📊 FiveElementChart.tsx에서 받은 sajuResult:", sajuResult);

  const countElements = (saju: any) => {
    const counts: Record<"목" | "화" | "토" | "금" | "수", number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    ["hour", "day", "month", "year"].forEach((pillar) => {
      if (saju[pillar]?.sky) {
        const element = getElement(saju[pillar].sky);
        counts[element]++;
      }
      if (saju[pillar]?.ground) {
        const element = getElement(saju[pillar].ground);
        counts[element]++;
      }
    }); 
    console.log("오행 개수:", elementCounts);
    console.log("총 개수:", total);

    return counts;
  };

  const elementCounts = countElements(sajuResult);
  
  const total = Object.values(elementCounts).reduce((acc, curr) => acc + curr, 0);

  const elementPercents = Object.entries(elementCounts).map(([key, value]) => ({
    element: key,
    count: value,
    percent: total > 0 ? ((value / total) * 100).toFixed(2) : "0.00"
    
  }));
  console.log("오행 비율:", elementPercents);

  const data = {
    labels: elementPercents.map(e => `${e.element} (${e.percent}%)`),
    datasets: [
      {
        label: "오행 개수",
        data: elementPercents.map(e => e.count),
        backgroundColor: ["#4CAF50", "#FF5733", "#FFC107", "#9E9E9E", "#2196F3"], // 목, 화, 토, 금, 수 색상
        borderColor: "#FFFFFF",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-6 bg-white p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-bold text-center text-blue-600">📊 오행의 분포</h3>
      <Bar 
        data={data} 
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (tooltipItem: any) => {
                  return `${tooltipItem.raw}개 (${elementPercents[tooltipItem.dataIndex].percent}%)`;
                }
              }
            }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }} 
      />
    </div>
  );
};

export default FiveElementChart;
