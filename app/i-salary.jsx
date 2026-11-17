// 안전근무 수량 표기 — 평일/주말 시간이 섞이면 나눠서 보여줍니다
function guardDesc(total, weekend, gr, gw) {
  if (!total) return '0시간';
  const weekday = total - (weekend || 0);
  if (weekend && weekday) return `${weekday}시간 × ${won(gr)} + ${weekend}시간 × ${won(gw)}`;
  if (weekend) return `${weekend}시간 × ${won(gw)} (주말)`;
  return `${weekday}시간 × ${won(gr)}`;
}

// Instructor — 급여 명세 상세 시트
function SalarySheet({ open, onClose, app }) {
  const sal = tm2Salary(app.state, app.me);
  const user = app.myUser;
  const [tab, setTab] = React.useState('summary');
  const lr = tm2LessonRate(user);
  const gr = tm2GuardRate(TM2_TODAY);
  const gw = tm2GuardRate('2026-10-10'); // 주말 단가

  const rows = [
    ['정규 강습', `${sal.regLt}교시 × ${won(lr)}`, sal.regL],
    ['정규 안전근무', guardDesc(sal.regGt, sal.regGtW, gr, gw), sal.regG],
    ['대직 강습', `${sal.subLt}교시 × ${won(lr)}`, sal.subL],
    sal.subGt > 0 && ['대직 안전근무', guardDesc(sal.subGt, sal.subGtW, gr, gw), sal.subG],
    ['관리자 조정', sal.adjReason || '없음', sal.adjust],
  ].filter(Boolean);

  return (
    <Sheet open={open} onClose={onClose} full>
      <SheetHead title="10월 급여 명세" onClose={onClose}
        right={<button onClick={() => {
          tm2Csv(`턴메이트_급여명세_${user.name}_2026-10.csv`, [
            ['항목', '수량', '단가', '금액'],
            ['정규 강습', sal.regLt + '교시', lr, sal.regL],
            ['정규 안전근무', (sal.regGt - sal.regGtW) + '시간', gr, (sal.regGt - sal.regGtW) * gr],
            ['정규 안전근무(주말)', sal.regGtW + '시간', gw, sal.regGtW * gw],
            ['대직 강습', sal.subLt + '교시', lr, sal.subL],
            ['대직 안전근무', (sal.subGt - sal.subGtW) + '시간', gr, (sal.subGt - sal.subGtW) * gr],
            sal.subGtW > 0 && ['대직 안전근무(주말)', sal.subGtW + '시간', gw, sal.subGtW * gw],
            ['관리자 조정', sal.adjReason, '', sal.adjust],
            ['세전 총액', '', '', sal.gross],
            ['원천징수(3.3%)', '', '', -sal.tax],
            ['실수령액', '', '', sal.net],
          ].filter(Boolean));
          app.notify('급여 명세를 CSV로 내려받았어요');
        }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6 }}><Icon name="Download" size={20} color={T.ink} /></button>} />
      <div className="tm-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 34px' }}>
        <Segmented items={[['summary', '요약'], ['detail', '근무 내역']]} value={tab} onChange={setTab} style={{ marginBottom: 16 }} />

        {tab === 'summary' ? (
          <>
            <Card style={{ background: T.ink, padding: 22 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontWeight: 620 }}>실수령액</div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.2, color: '#fff', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{won(sal.net)}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 650, color: 'rgba(255,255,255,.75)', background: 'rgba(255,255,255,.12)', borderRadius: 5, padding: '4px 8px' }}>세전 {won(sal.gross)}</span>
                <span style={{ fontSize: 12, fontWeight: 650, color: 'rgba(255,255,255,.75)', background: 'rgba(255,255,255,.12)', borderRadius: 5, padding: '4px 8px' }}>3.3% −{won(sal.tax)}</span>
              </div>
            </Card>
            <div style={{ marginTop: 16 }}>
              {rows.map(([k, sub, v], n, a) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0',
                  borderTop: n ? `1px solid ${T.line2}` : 'none', borderBottom: n === a.length - 1 ? `1px solid ${T.line2}` : 'none' }}>
                  <div style={{ minWidth: 0, paddingRight: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 650, color: T.ink }}>{k}</div>
                    <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>{sub}</div>
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 730, color: T.ink, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{won(v)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: T.ink3, lineHeight: 1.55 }}>
              <Icon name="Info" size={14} style={{ marginTop: 2 }} />
              <span>강습은 경력 단가({won(lr)}), 안전근무는 시간당 {won(gr)}(주말 {won(gw)}) 기준이에요. 위촉강사는 3.3%가 원천징수돼요.</span>
            </div>
          </>
        ) : (
          <div>
            {sal.detail.map((s, n) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: n ? `1px solid ${T.line2}` : 'none' }}>
                <div style={{ width: 46, flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.ink2, fontVariantNumeric: 'tabular-nums' }}>{tm2Short(s.date)}</div>
                  <div style={{ fontSize: 11.5, color: tm2IsWeekend(s.date) ? T.red : T.ink3 }}>{tm2Dow(s.date)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 640, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.program}</div>
                  <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>
                    {s.start}–{s.end} · {s.count}{s.type === 'lesson' ? '교시' : '시간'} × {won(s.rate)}{s.isSub ? ' · 대직' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 720, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>{won(s.amt)}</div>
                  <div style={{ fontSize: 11.5, color: s.status === 'done' || s.status === 'sub_done' ? T.green : T.ink3, marginTop: 1 }}>
                    {s.status === 'done' || s.status === 'sub_done' ? '근무 완료' : s.status === 'sub_assigned' ? '대직 예정' : '예정'}</div>
                </div>
              </div>
            ))}
            {!sal.detail.length && <Empty title="이번 달 근무 내역이 없어요" />}
          </div>
        )}
      </div>
    </Sheet>
  );
}

Object.assign(window, { SalarySheet });
