import React from 'react';

type TenGodType =
  | '알 수 없음'
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '정재'
  | '편재'
  | '정관'
  | '편관'
  | '정인'
  | '편인';

type TenGodCount = Record<TenGodType, number>;

export default function TenGodInterpretation({ data }: { data: TenGodCount }) {
  return (
    <section>
      <h2>십성 해석</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>십성</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>개수</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>설명</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([tenGod, count]) => (
            <tr key={tenGod}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{tenGod}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{count}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {getTenGodDescription(tenGod as TenGodType)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function getTenGodDescription(tenGod: TenGodType) {
  const descriptions: Record<TenGodType, string> = {
    '알 수 없음': '십성을 판별할 수 없습니다.',
    비견: '나와 같은 힘을 가진 동료나 경쟁자.',
    겁재: '내 자원을 빼앗거나 경쟁하는 존재.',
    식신: '창조적, 생산적 활동과 결과물.',
    상관: '자유로운 표현과 규범을 깨는 힘.',
    정재: '안정적인 재물과 현실적인 성과.',
    편재: '빠른 이익, 기회 포착 능력.',
    정관: '규율과 질서를 중시하는 힘.',
    편관: '도전과 위기 대응 능력.',
    정인: '보호와 학문, 안정적인 지원.',
    편인: '변화와 유연성, 창의적 지원.',
  };
  return descriptions[tenGod] || '';
}