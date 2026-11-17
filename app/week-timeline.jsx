// 주간 타임라인 — 08:00~22:00 세로 축, 요일별 블록
function WeekTimeline({ days, shiftAt, sel, onSelect }) {
  const START = 8, END = 22, SPAN = END - START;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ROW = 188; // 전체 높이(px)

  const pos = (t) => {
    const [h, m] = t.split(':').map(Number);
    return Math.max(0, Math.min(1, ((h + m / 60) - START) / SPAN));
  };

  return (
    <div>
          <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(7,1fr)', gap: 2 }}>
            <div />
            {days.map(d => {
          const on = iso(d) === sel;
          return (
            <div key={iso(d)} style={{ textAlign: 'center', paddingBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: on ? 780 : 620, color: on ? T.ink : d.getDay() === 0 ? T.red : T.ink3 }}>
                {['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}
              </span>
            </div>
          );
        })}

        {/* 시간 축 */}
        <div style={{ position: 'relative', height: ROW }}>
          {[8, 11, 14, 17, 20].map(h => (
            <div key={h} style={{ position: 'absolute', top: ((h - START) / SPAN) * ROW - 6, right: 5, fontSize: 9.5, color: T.ink3, fontWeight: 620, whiteSpace: 'nowrap' }}>
              {h}시
            </div>
          ))}
        </div>

        {/* 요일별 컬럼 */}
        {days.map(d => {
          const ds = iso(d);
          const items = shiftAt(ds);
          const on = ds === sel;
          return (
            <div key={ds} onClick={() => onSelect(ds)} style={{ position: 'relative', height: ROW, borderRadius: 7, cursor: 'pointer',
              background: on ? 'oklch(0.975 0.012 248)' : T.line2 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: (i / 4) * ROW, height: 1, background: 'rgba(255,255,255,.9)' }} />
              ))}
              {items.map(s => {
                const top = pos(s.start) * ROW;
                const bottom = pos(s.end) * ROW;
                const h = Math.max(14, bottom - top);
                const tone = s.status === 'sub_assigned' ? { bg: 'oklch(0.94 0.055 72)', fg: T.amberInk, bar: T.amber }
                  : s.status === 'sub_requested' ? { bg: '#fff', fg: T.ink3, bar: '#cfd6dd' }
                  : { bg: T.blueSoft, fg: T.blueInk, bar: T.blue };
                return (
                  <div key={s.id} title={`${s.program} ${s.start}–${s.end}`} style={{ position: 'absolute', top, height: h, left: 2, right: 2,
                    background: tone.bg, borderLeft: `2.5px solid ${tone.bar}`, borderRadius: 4, overflow: 'hidden', padding: '2px 3px' }}>
                    {h > 26 && <div style={{ fontSize: 8.5, fontWeight: 780, color: tone.fg, lineHeight: 1.1 }}>{s.start}</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '10px 4px 0', fontSize: 11.5, color: T.ink3, fontWeight: 620 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 7, height: 7, borderRadius: 2, background: T.blue }} />정규</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 7, height: 7, borderRadius: 2, background: T.amber }} />대직</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 7, height: 7, borderRadius: 2, border: '1px dashed #cfd6dd' }} />요청중</span>
        <span style={{ marginLeft: 'auto' }}>08시 – 22시</span>
      </div>
    </div>
  );
}

Object.assign(window, { WeekTimeline });
