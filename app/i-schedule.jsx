// Instructor — 일정 (월간 캘린더 / 주간) + 내 정보 (프로필·급여명세·알림)
function ISchedule({ app }) {
  const [view, setView] = React.useState('month');
  const [sel, setSel] = React.useState(TM2_TODAY);
  const { state, me } = app;
  const mine = state.schedules.filter(s => s.uid === me && tm2Active(s));

  // October 2026 starts Thursday
  const first = new Date('2026-10-01T00:00:00');
  const startPad = first.getDay();
  const daysInMonth = 31;
  const cells = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  // week view: week containing sel
  const selDate = tm2Date(sel);
  const monday = new Date(selDate); monday.setDate(selDate.getDate() - ((selDate.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const dayShifts = mine.filter(s => s.date === sel).sort((a, b) => a.start.localeCompare(b.start));
  const shiftAt = (ds) => mine.filter(s => s.date === ds);

  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: T.ink }}>일정</h1>
        <div style={{ display: 'flex', padding: 3, background: T.line2, borderRadius: 10 }}>
          {[['month', '월간'], ['week', '주간']].map(([id, l]) => (
            <button key={id} onClick={() => setView(id)} style={{ height: 30, padding: '0 12px', border: 'none', borderRadius: 8, fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', background: view === id ? '#fff' : 'transparent', color: view === id ? T.ink : T.ink3,
              boxShadow: view === id ? '0 1px 2px rgba(16,24,40,.08)' : 'none' }}>{l}</button>
          ))}
        </div>
      </div>

      {view === 'month' ? (
        <div style={{ padding: '16px 12px 0' }}>
          <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: T.ink2, marginBottom: 10 }}>2026년 10월</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: d === '일' ? T.red : T.ink3, paddingBottom: 4 }}>{d}</div>
            ))}
            {cells.map((d, i) => {
              if (!d) return <div key={'e' + i} />;
              const ds = `2026-10-${String(d).padStart(2, '0')}`;
              const items = shiftAt(ds);
              const hasSub = items.some(s => s.status === 'sub_assigned');
              const hasReq = items.some(s => s.status === 'sub_requested');
              const on = ds === sel;
              const isToday = ds === TM2_TODAY;
              return (
                <button key={ds} onClick={() => setSel(ds)} style={{ border: 'none', background: on ? T.ink : isToday ? T.blueSoft : 'transparent',
                  borderRadius: 10, height: 46, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 14.5, fontWeight: on || isToday ? 780 : 600, color: on ? '#fff' : isToday ? T.blueInk : T.ink }}>{d}</span>
                  <span style={{ display: 'flex', gap: 2.5, height: 4 }}>
                    {items.length > 0 && <i style={{ width: 4.5, height: 4.5, borderRadius: 2.5, background: on ? '#fff' : hasSub ? T.amber : T.blue }} />}
                    {hasReq && <i style={{ width: 4.5, height: 4.5, borderRadius: 2.5, background: on ? 'rgba(255,255,255,.5)' : T.ink3 }} />}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, padding: '14px 10px 4px', fontSize: 12.5, color: T.ink3, fontWeight: 620 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 7, height: 7, borderRadius: 4, background: T.blue }} />정규</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 7, height: 7, borderRadius: 4, background: T.amber }} />대직</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 7, height: 7, borderRadius: 4, background: T.ink3 }} />대직 요청중</span>
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px 12px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {weekDays.map(d => {
              const ds = iso(d);
              const on = ds === sel;
              const items = shiftAt(ds);
              return (
                <button key={ds} onClick={() => setSel(ds)} style={{ border: 'none', borderRadius: 11, background: on ? T.ink : 'transparent', padding: '7px 0 9px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 620, color: on ? 'rgba(255,255,255,.72)' : d.getDay() === 0 ? T.red : T.ink3 }}>
                    {['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}</span>
                  <span style={{ fontSize: 16.5, fontWeight: 760, color: on ? '#fff' : T.ink }}>{d.getDate()}</span>
                  <span style={{ height: 5, display: 'flex', gap: 2 }}>
                    {items.length > 0 && <i style={{ width: 5, height: 5, borderRadius: 3, background: items[0].status === 'sub_assigned' ? T.amber : on ? '#fff' : T.blue }} />}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 730, color: T.ink, padding: '0 4px', marginBottom: 10 }}>이번 주 시간표</div>
            <WeekTimeline days={weekDays} shiftAt={shiftAt} sel={sel} onSelect={setSel} />
          </div>
        </div>
      )}

      <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 720, color: T.ink3, padding: '0 4px' }}>{tm2Label(sel)}</div>
        {dayShifts.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '34px 20px' }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink }}>근무가 없는 날이에요</div>
            <div style={{ fontSize: 13.5, color: T.ink3, marginTop: 4 }}>대직을 지원해 수당을 더 받을 수 있어요</div>
          </Card>
        )}
        {dayShifts.map(s => (
          <Card key={s.id} style={{ padding: 0, display: 'flex', overflow: 'hidden' }}>
            <div style={{ width: 4, background: s.status === 'sub_assigned' ? T.amber : s.status === 'sub_requested' ? T.ink3 : T.blue }} />
            <div style={{ padding: '16px 18px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 17, fontWeight: 760, color: T.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3 }}>{s.start} – {s.end}</span>
                {s.status === 'sub_assigned' ? <Tag tone="amber">대직</Tag> : s.status === 'sub_requested' ? <Tag>요청중</Tag> : <Tag tone="blue">정규</Tag>}
              </div>
              <div style={{ fontSize: 14.5, color: T.ink, fontWeight: 620, marginTop: 3 }}>{s.program}</div>
              <div style={{ fontSize: 13, color: T.ink3, marginTop: 5 }}>
                {s.type === 'lesson' ? `강습 ${s.count}교시 · ${s.target} ${s.level}` : `안전근무 ${s.count}시간`}
                {s.subFor && ` · ${s.subFor} 강사 대신`}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function IMe({ app, openSalary, openOnboarding }) {
  const { state, myUser, me } = app;
  const sal = tm2Salary(state, me);
  const [notif, setNotif] = React.useState(true);
  const [showUsers, setShowUsers] = React.useState(false);

  return (
    <div style={{ padding: '8px 16px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 4px 4px' }}>
        <Avatar name={myUser.avatar} size={58} tone="blue" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 21, fontWeight: 800, color: T.ink, letterSpacing: -0.45 }}>{myUser.name}</span>
            <Tag tone="blue">{myUser.pos}</Tag>
          </div>
          <div style={{ fontSize: 13.5, color: T.ink3, fontWeight: 600, marginTop: 3 }}>흑석체육센터 · 경력 {myUser.exp}</div>
        </div>
      </div>

      {/* profile detail */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>정규 근무</span>
          <span style={{ fontSize: 14, fontWeight: 680, color: T.blueInk }}>{myUser.regular}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={ms.box}><div style={ms.boxL}>주간 배정</div><div style={ms.boxV}>{tm2WeeklyHours(state, me)}시간</div></div>
          <div style={ms.box}><div style={ms.boxL}>10월 누적</div><div style={ms.boxV}>{state.schedules.filter(s => s.uid === me && tm2Active(s)).reduce((a, s) => a + s.count, 0)}시간</div></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3, marginBottom: 7 }}>보유 자격증</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {myUser.quals.map(q => <Tag key={q} tone="neutral" style={{ height: 28, fontSize: 12.5 }}><Icon name="Award" size={13} color={T.ink3} />{q}</Tag>)}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: T.ink3, marginBottom: 7 }}>지도 가능 프로그램</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {myUser.programs.map(p => <Tag key={p} tone="green" style={{ height: 28, fontSize: 12.5 }}>{p}</Tag>)}
          </div>
        </div>
      </Card>

      {/* salary summary card */}
      <Card onClick={openSalary}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>10월 급여 명세</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {sal.settled ? <Tag tone="green">정산 확정</Tag> : <Tag tone="amber">정산 대기</Tag>}
            <Icon name="ChevronRight" size={17} color={T.ink3} />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          {[['정규 강습', `${sal.regLt}교시 × ${won(tm2LessonRate(myUser))}`, sal.regL],
            ['정규 안전근무', `${sal.regGt}시간${sal.regGtW ? ` (주말 ${sal.regGtW})` : ''}`, sal.regG],
            ['대직 강습', `${sal.subLt}교시`, sal.subL],
            sal.adjust !== 0 && ['관리자 조정', sal.adjReason || '조정', sal.adjust]].filter(Boolean).map(([k, c, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14.5 }}>
              <span style={{ color: T.ink2 }}>{k} <span style={{ color: T.ink3, fontSize: 13 }}>· {c}</span></span>
              <span style={{ color: T.ink, fontWeight: 660, fontVariantNumeric: 'tabular-nums' }}>{won(v)}</span>
            </div>
          ))}
          <div style={{ height: 1, background: T.line2, margin: '6px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14.5 }}>
            <span style={{ color: T.ink2 }}>원천징수 3.3%</span>
            <span style={{ color: T.red, fontWeight: 660, fontVariantNumeric: 'tabular-nums' }}>−{won(sal.tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10 }}>
            <span style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>실수령액</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: T.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6 }}>{won(sal.net)}</span>
          </div>
        </div>
      </Card>

      {/* settings list */}
      <Card style={{ padding: '4px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, height: 58, borderBottom: `1px solid ${T.line2}` }}>
          <Icon name="BellRing" size={20} color={T.ink2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 650, color: T.ink }}>새 대직 알림</div>
            <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 1 }}>{notif ? '켜짐 · 등록 즉시 수신' : '꺼짐'}</div>
          </div>
          <Toggle on={notif} onChange={v => { setNotif(v); app.notify(v ? '새 대직 알림을 켰어요' : '알림을 껐어요'); }} />
        </div>
        {[['FileText', '내 근무 이력', ''], ['Download', '급여 명세 내려받기', 'CSV'], ['RotateCcw', '프로필 · 시간표 다시 설정', '']].map(([ic, k, v], n, a) => (
          <div key={k} className="tm-press" onClick={() => { if (k.includes('다시')) openOnboarding(); if (k.includes('급여')) openSalary(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 13, height: 56, borderBottom: n < a.length - 1 ? `1px solid ${T.line2}` : 'none', cursor: 'pointer' }}>
            <Icon name={ic} size={20} color={T.ink2} />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 620, color: T.ink }}>{k}</span>
            {v && <span style={{ fontSize: 13.5, color: T.ink3 }}>{v}</span>}
            <Icon name="ChevronRight" size={17} color={T.ink3} />
          </div>
        ))}
      </Card>

      {/* demo account switcher */}
      <div style={{ padding: '2px 4px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 720, color: T.ink3, marginBottom: 8 }}>내 적용 단가</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ ...ms.box, flex: 1, background: T.bg }}><div style={ms.boxL}>강습 1교시</div><div style={{ ...ms.boxV, fontSize: 15 }}>{won(tm2LessonRate(myUser))}</div></div>
            <div style={{ ...ms.box, flex: 1, background: T.bg }}><div style={ms.boxL}>안전 1시간</div><div style={{ ...ms.boxV, fontSize: 15 }}>{won(tm2GuardRate(TM2_TODAY))}</div></div>
          </div>
          <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 8 }}>경력 {myUser.exp} 기준 · 주말 안전근무 {won(tm2GuardRate('2026-10-10'))}</div>
        </div>
        <button onClick={() => setShowUsers(!showUsers)} style={{ border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 12.5,
          fontWeight: 650, color: T.ink3, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: 0 }}>
          <Icon name="Users" size={14} />데모 계정 전환 <Icon name={showUsers ? 'ChevronUp' : 'ChevronDown'} size={13} />
        </button>
        {showUsers && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 10 }}>
            {TM2_USERS.filter(u => !u.admin).map(u => (
              <button key={u.id} onClick={() => { app.setMe(u.id); app.notify(`${u.name} 강사 계정으로 전환했어요`); }} style={{ padding: '12px 6px', borderRadius: 14,
                border: `1px solid ${app.me === u.id ? T.ink : T.line}`, background: app.me === u.id ? T.ink : '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
                <div style={{ fontSize: 14.5, fontWeight: 750, color: app.me === u.id ? '#fff' : T.ink }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: app.me === u.id ? 'rgba(255,255,255,.65)' : T.ink3, marginTop: 2 }}>{u.pos}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ms = {
  box: { background: T.bg, borderRadius: 12, padding: '11px 13px' },
  boxL: { fontSize: 12.5, color: T.ink3, fontWeight: 650 },
  boxV: { fontSize: 17, fontWeight: 770, color: T.ink, marginTop: 2, letterSpacing: -0.3 },
};

Object.assign(window, { ISchedule, IMe });
