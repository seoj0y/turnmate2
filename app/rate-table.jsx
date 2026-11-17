// 단가 기준표 (읽기 전용 요약) — 설정·강사상세·급여에서 공용 사용
function RateTable({ highlightExp, compact }) {
  const rows = [
    { k: 'lesson', label: '일반 강습', tiers: [['1년차', tm2LessonRate({ exp: '1년차' })], ['2년차', tm2LessonRate({ exp: '2년차' })], ['3년차 이상', tm2LessonRate({ exp: '3년차' })]], unit: '교시(50분)' },
    { k: 'guard', label: '안전근무', tiers: [['평일', tm2GuardRate('2026-10-06')], ['주말', tm2GuardRate('2026-10-10')]], unit: '시간' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map(r => (
        <div key={r.k} style={{ border: `1px solid ${T.line}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: T.line2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 740, color: T.ink }}>{r.label}</span>
            <span style={{ fontSize: 11, color: T.ink3, fontWeight: 620 }}>{r.unit} 기준</span>
          </div>
          <div style={{ display: 'flex' }}>
            {r.tiers.map(([l, v], i) => {
              const hit = highlightExp && (r.k === 'lesson' ? l.replace(' 이상', '') === tm2Tier(highlightExp) + '년차' : false);
              return (
                <div key={l} style={{ flex: 1, padding: '10px 8px', textAlign: 'center', borderLeft: i ? `1px solid ${T.line2}` : 'none',
                  background: hit ? T.blueSoft : '#fff' }}>
                  <div style={{ fontSize: 11, color: hit ? T.blueInk : T.ink3, fontWeight: 650 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 760, color: hit ? T.blueInk : T.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                    {v.toLocaleString()}원
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { RateTable });
