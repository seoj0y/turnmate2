// Admin — 급여 관리 (월 정산 · 강사별 조정) + 설정
function ASalary({ app }) {
  const { state } = app;
  const staff = TM2_USERS.filter(u => !u.admin);
  const rows = staff.map(u => ({ u, s: tm2Salary(state, u.id) }));
  const gross = rows.reduce((a, r) => a + r.s.gross, 0);
  const tax = rows.reduce((a, r) => a + r.s.tax, 0);
  const settled = !!state.settled[TM2_MONTH];
  const [adj, setAdj] = React.useState(null);
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');

  const openAdj = (u, s) => { setAdj({ u, s }); setAmount(String(s.adjust || '')); setReason(s.adjReason || ''); };
  const saveAdj = () => { app.adjustSalary(adj.u.id, amount, reason); setAdj(null); };

  const exportCsv = () => {
    const rowsCsv = [['강사', '경력', '강습단가', '정규강습', '정규안전', '대직강습', '대직안전', '안전주말시간', '조정', '세전', '원천징수', '실수령']];
    rows.forEach(({ u, s }) => rowsCsv.push([u.name, u.exp, tm2LessonRate(u), s.regL, s.regG, s.subL, s.subG, s.regGtW + s.subGtW, s.adjust, s.gross, s.tax, s.net]));
    tm2Csv('턴메이트_급여정산표_흑석체육센터_2026-10.csv', rowsCsv);
    app.notify('급여 정산표를 CSV로 내려받았어요');
  };

  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: T.ink }}>급여</h1>
          <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 3 }}>2026년 10월 · 매월 말일 정산</div>
        </div>
        <button onClick={exportCsv} className="tm-press" style={{ height: 38, padding: '0 13px', borderRadius: 10, border: `1px solid ${T.line}`, background: '#fff',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.ink, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="Download" size={15} />엑셀
        </button>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 12.5, color: T.ink3, fontWeight: 650 }}>실지급 총액</div>
          <div style={{ fontSize: 31, fontWeight: 800, letterSpacing: -1, color: T.ink, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{won(gross - tax)}</div>
          <div style={{ display: 'flex', gap: 9, marginTop: 15 }}>
            <div style={{ flex: 1, background: T.bg, borderRadius: 11, padding: '10px 12px' }}>
              <div style={{ fontSize: 11.5, color: T.ink3, fontWeight: 650 }}>세전</div>
              <div style={{ fontSize: 14.5, fontWeight: 740, color: T.ink, marginTop: 2 }}>{won(gross)}</div>
            </div>
            <div style={{ flex: 1, background: T.bg, borderRadius: 11, padding: '10px 12px' }}>
              <div style={{ fontSize: 11.5, color: T.ink3, fontWeight: 650 }}>원천징수 3.3%</div>
              <div style={{ fontSize: 14.5, fontWeight: 740, color: T.red, marginTop: 2 }}>−{won(tax)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 13 }}>
            {settled ? <Tag tone="green">10월 정산 확정</Tag> : <Tag tone="amber">정산 대기 · {rows.length}명</Tag>}
          </div>
        </Card>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <SectionHead title="강사별 정산" sub="금액을 눌러 조정할 수 있어요" />
        <Card style={{ padding: '14px 18px', marginTop: -2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr 1fr 26px', gap: 6, padding: '0 2px 8px', fontSize: 11.5, color: T.ink3, fontWeight: 720 }}>
            <span>강사</span><span style={{ textAlign: 'right' }}>대직</span><span style={{ textAlign: 'right' }}>실지급</span><span />
          </div>
          {rows.map(({ u, s }) => (
            <div key={u.id} onClick={() => !settled && openAdj(u, s)} style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr 1fr 26px', gap: 6,
              alignItems: 'center', padding: '11px 2px', borderTop: `1px solid ${T.line2}`, cursor: settled ? 'default' : 'pointer' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 1 }}>{u.exp} · {won(tm2LessonRate(u))}{s.adjust !== 0 ? ' · 조정' : ''}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: T.ink2, fontWeight: 650 }}>{s.subLt + s.subGt}건</div>
              <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 750, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>{won(s.net)}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Icon name={settled ? 'Lock' : 'ChevronRight'} size={15} color={T.ink3} /></div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 13, marginTop: 2, borderTop: `1px solid ${T.line}` }}>
            <span style={{ fontSize: 13, color: T.ink2, fontWeight: 650 }}>{rows.length}명 합계</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{won(gross - tax)}</span>
          </div>
        </Card>

        {!settled
          ? <Btn kind="dark" style={{ marginTop: 12 }} icon="Lock" onClick={() => app.settleMonth()}>10월 정산 확정</Btn>
          : <Btn kind="secondary" style={{ marginTop: 12 }} icon="Check" disabled>확정됨 · 수정 잠김</Btn>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, fontSize: 12.5, color: T.ink3, lineHeight: 1.55, padding: '0 4px' }}>
          <Icon name="Info" size={14} style={{ marginTop: 1 }} />
          <span>확정하면 금액 조정이 잠겨요. 조정이 필요하면 확정 전에 입력하세요.</span>
        </div>
      </div>

      {adj && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(12,18,26,.44)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setAdj(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderRadius: '22px 22px 0 0', padding: '20px 22px 34px' }}>
            <div style={{ fontSize: 17, fontWeight: 780, color: T.ink }}>{adj.u.name} 급여 조정</div>
            <div style={{ fontSize: 13, color: T.ink3, marginTop: 3 }}>기본 계산액 {won(adj.s.gross - adj.s.adjust)} · 조정 사유는 이력에 남아요</div>
            <div style={{ marginTop: 16 }}>
              <Field label="조정 금액" hint="+ 추가 / − 차감">
                <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d-]/g, ''))} placeholder="0" inputMode="numeric" style={inputStyle} />
              </Field>
              <Field label="사유">
                <input value={reason} onChange={e => setReason(e.target.value)} placeholder="예: 초과근무 수당 반영, 지각 차감" style={inputStyle} />
              </Field>
            </div>
            <div style={{ background: T.bg, borderRadius: 12, padding: '13px 15px', fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: T.ink2 }}>조정 후 실수령</span>
              <span style={{ fontWeight: 780, color: T.ink }}>{won(Math.round((adj.s.gross - adj.s.adjust + (Number(amount) || 0)) * 0.967))}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Btn kind="secondary" onClick={() => setAdj(null)}>취소</Btn>
              <Btn kind="dark" onClick={saveAdj}>저장</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ASettings({ app }) {
  const s = app.state.settings;
  const [rates, setRates] = React.useState({ lesson1: s.lesson1, lesson2: s.lesson2, lesson3: s.lesson3, guard: s.guard, guardWeekend: s.guardWeekend });
  const [threshold, setThreshold] = React.useState(s.threshold);
  const [alerts, setAlerts] = React.useState(s.alerts);
  const [radius, setRadius] = React.useState(s.radius);

  const FIELDS = [
    ['lesson1', '일반 강습 · 1년차', '50분 1회'],
    ['lesson2', '일반 강습 · 2년차', '50분 1회'],
    ['lesson3', '일반 강습 · 3년차 이상', '50분 1회'],
    ['guard', '안전근무 · 평일', '1시간'],
    ['guardWeekend', '안전근무 · 주말', '1시간'],
  ];

  return (
    <div style={{ padding: '8px 16px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '6px 4px 0' }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: T.ink }}>설정</h1>
        <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 3 }}>흑석체육센터 수영장</div>
      </div>

      <Card>
        <div style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>지급 단가</div>
        <div style={{ fontSize: 12.5, color: T.ink3, marginBottom: 14, marginTop: 2 }}>저장하면 급여·명세·정산표가 바로 다시 계산돼요</div>
        <div style={{ marginTop: 2 }}>
          {FIELDS.map(([k, l, sub], n) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${T.line2}` }}>
              <div>
                <div style={{ fontSize: 14.5, color: T.ink, fontWeight: 640 }}>{l}</div>
                <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 1 }}>{sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input value={rates[k]} onChange={e => setRates({ ...rates, [k]: e.target.value.replace(/\D/g, '') })} inputMode="numeric"
                  style={{ width: 84, height: 40, borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg, textAlign: 'right',
                    fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, color: T.ink, padding: '0 10px', outline: 'none' }} />
                <span style={{ fontSize: 12.5, color: T.ink3, width: 16 }}>원</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 10, lineHeight: 1.5 }}>
          강습 단가는 강사 경력(1·2·3년차 이상)으로 자동 적용되고, 안전근무는 평일/주말로 구분돼요.
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>주간 시간 안내</div>
            <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 3, lineHeight: 1.45 }}>이 시간을 넘으면 강사에게 안내가 표시돼요</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <input value={threshold} onChange={e => setThreshold(e.target.value.replace(/\D/g, ''))} inputMode="numeric"
              style={{ width: 50, height: 42, borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg, textAlign: 'center',
                fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: T.ink, outline: 'none' }} />
            <span style={{ fontSize: 13.5, color: T.ink3 }}>시간</span>
          </div>
        </div>
      </Card>

      <Card style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>신규 대직 알림</div>
          <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 3 }}>등록 즉시 강사 전원에게 발송</div>
        </div>
        <Toggle on={alerts} onChange={setAlerts} />
      </Card>

      <Card style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>도착 인증 반경</div>
          <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 3 }}>센터 기준 출근 인정 거리</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <input value={radius} onChange={e => setRadius(e.target.value.replace(/\D/g, ''))} inputMode="numeric"
            style={{ width: 58, height: 42, borderRadius: 10, border: `1px solid ${T.line}`, background: T.bg, textAlign: 'center',
              fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: T.ink, outline: 'none' }} />
          <span style={{ fontSize: 13.5, color: T.ink3 }}>m</span>
        </div>
      </Card>

      <Btn kind="dark" onClick={() => app.saveSettings({ lesson1: Number(rates.lesson1), lesson2: Number(rates.lesson2),
        lesson3: Number(rates.lesson3), guard: Number(rates.guard), guardWeekend: Number(rates.guardWeekend),
        threshold: Number(threshold), alerts, radius: Number(radius) })}>설정 저장</Btn>

      <Card style={{ padding: '4px 18px', marginTop: 2 }}>
        {[['Users', '강사 계정', '5명'], ['Building2', '센터 정보', '흑석체육센터'], ['RotateCcw', '데모 데이터 초기화', '']].map(([ic, k, v], n, a) => (
          <div key={k} className="tm-press" onClick={() => { if (k.includes('초기화')) { app.resetAll(); } }}
            style={{ display: 'flex', alignItems: 'center', gap: 13, height: 54, borderBottom: n < a.length - 1 ? `1px solid ${T.line2}` : 'none', cursor: 'pointer' }}>
            <Icon name={ic} size={19} color={k.includes('초기화') ? T.red : T.ink2} />
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 640, color: k.includes('초기화') ? T.red : T.ink }}>{k}</span>
            <span style={{ fontSize: 13, color: T.ink3 }}>{v}</span>
            {!v && <Icon name="ChevronRight" size={16} color={T.ink3} />}
          </div>
        ))}
      </Card>
    </div>
  );
}

Object.assign(window, { ASalary, ASettings });
