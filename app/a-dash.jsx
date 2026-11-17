// Admin — 관제 대시보드 + 승인 관리 + 배정 시트
function ADash({ app, goApprovals, setApproval, setTab }) {
  const { state } = app;
  const open = state.requests.filter(r => r.status === 'recruiting');
  const urgent = open.filter(r => tm2Dday(r.date) <= 2 && tm2Dday(r.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const todayShifts = state.schedules.filter(s => s.date === TM2_TODAY && tm2Active(s));
  const working = state.schedules.filter(s => s.date === TM2_TODAY).filter(s => { const a = app.attendanceFor(s.uid, TM2_TODAY); return a && !a.out; }).length;
  const confirmed = state.requests.filter(r => r.status === 'confirmed');
  const pendingPay = confirmed.reduce((a, r) => a + tm2Pay(r, TM2_USERS.find(u => u.id === r.by)), 0);

  return (
    <div style={{ padding: '8px 16px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '6px 4px 2px' }}>
        <div style={{ fontSize: 13.5, color: T.ink3, fontWeight: 600 }}>흑석체육센터 · {tm2Label(TM2_TODAY)}</div>
        <h1 style={{ margin: '5px 0 0', fontSize: 25, fontWeight: 790, letterSpacing: -0.7, color: T.ink }}>이상재 주임님</h1>
      </div>

      {urgent.length > 0 ? (
        <Card style={{ padding: 0, overflow: 'hidden', border: `1px solid ${T.red}` }}>
          <div style={{ padding: '18px 20px 16px', background: T.redSoft }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 740, color: T.red }}>
              <span className="tm-dot" />지금 처리해야 해요 · {urgent.length}건
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.55, color: T.ink, marginTop: 9, lineHeight: 1.3 }}>
              {tm2Short(urgent[0].date)} {urgent[0].start}<br />{TM2_USERS.find(u => u.id === urgent[0].by).name} 강사 대직
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <Tag tone="red">D-{tm2Dday(urgent[0].date)}</Tag>
              <Tag>지원자 {urgent[0].applicants?.length || 0}명</Tag>
              <Tag>{urgent[0].type === 'lesson' ? '강습' : '안전근무'}</Tag>
            </div>
          </div>
          <div style={{ display: 'flex', borderTop: `1px solid ${T.line2}` }}>
            <button onClick={() => { app.broadcast(); }} className="tm-press" style={{ ...as.split, color: T.red }}>
              <Icon name="Megaphone" size={17} />전체 알림
            </button>
            <div style={{ width: 1, background: T.line2 }} />
            <button onClick={() => setApproval(urgent[0].id)} className="tm-press" style={{ ...as.split, color: T.ink }}>
              직권 배정<Icon name="ChevronRight" size={16} />
            </button>
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="Check" size={18} stroke={2.6} color={T.green} />
            </div>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 730, color: T.ink }}>급한 대직이 없어요</div>
              <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>이틀 안에 시작하는 미구인 대직이 없습니다</div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 9 }}>
        {[['오늘 근무', todayShifts.length + '건'], ['현장 근무', working + '명'], ['확정 대직', confirmed.length + '건']].map(([l, v]) => (
          <div key={l} style={as.stat}><div style={as.statL}>{l}</div><div style={as.statV}>{v}</div></div>
        ))}
      </div>

      <SectionHead title="미구인 대직" action="전체" onAction={goApprovals} sub={`${open.length}건 모집 중`} />
      <Card style={{ padding: '4px 18px', marginTop: -2 }}>
        {open.slice(0, 3).map((r, n) => {
          const by = TM2_USERS.find(u => u.id === r.by);
          const d = tm2Dday(r.date);
          return (
            <div key={r.id} onClick={() => setApproval(r.id)} className="tm-press" style={{ display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 0', borderTop: n ? `1px solid ${T.line2}` : 'none', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: d <= 2 ? T.redSoft : T.line2, color: d <= 2 ? T.red : T.ink2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>D-{d}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 670, color: T.ink }}>{tm2Short(r.date)} {r.start} · {by.name}</div>
                <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.program}</div>
              </div>
              <Icon name="ChevronRight" size={18} color={T.ink3} />
            </div>
          );
        })}
        {!open.length && <div style={{ padding: '18px 0', fontSize: 13.5, color: T.ink3 }}>모집 중인 대직이 없어요</div>}
      </Card>

      <SectionHead title="오늘 출퇴근" />
      <Card style={{ padding: '4px 18px', marginTop: -2 }}>
        {state.schedules.filter(s => s.date === TM2_TODAY).slice(0, 4).map((s, n) => {
          const u = TM2_USERS.find(x => x.id === s.uid);
          const att = app.attendanceFor(s.uid, TM2_TODAY);
          const checked = !!att;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: n ? `1px solid ${T.line2}` : 'none' }}>
              <Avatar name={u.avatar} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 680, color: T.ink }}>{u.name}</div>
                <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>{s.start} – {s.end} · {s.program}</div>
              </div>
              {checked && !att.out ? <Tag tone="green"><span className="tm-dot" />근무 중</Tag>
                : checked && att.out ? <Tag>{att.in}–{att.out}</Tag>
                : <Tag tone="amber">출근 전</Tag>}
            </div>
          );
        })}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
        <Card onClick={() => setTab('ad_salary')} style={{ padding: 18 }}>
          <Icon name="Wallet" size={22} color={T.ink} />
          <div style={{ fontSize: 14.5, fontWeight: 710, color: T.ink, marginTop: 12 }}>이번 달 정산</div>
          <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>{won(pendingPay)} 대직 지급</div>
        </Card>
        <Card onClick={() => setTab('ad_schedule')} style={{ padding: 18 }}>
          <Icon name="CalendarRange" size={22} color={T.ink} />
          <div style={{ fontSize: 14.5, fontWeight: 710, color: T.ink, marginTop: 12 }}>근무표</div>
          <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>이번 주 배정 현황</div>
        </Card>
      </div>
    </div>
  );
}

const as = {
  split: { flex: 1, height: 54, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' },
  stat: { flex: 1, background: '#fff', borderRadius: 16, padding: '14px 15px' },
  statL: { fontSize: 12.5, color: T.ink3, fontWeight: 650 },
  statV: { fontSize: 21, fontWeight: 800, letterSpacing: -0.6, color: T.ink, marginTop: 3, fontVariantNumeric: 'tabular-nums' },
};

// ---------------- 승인 관리 ----------------
function AApprovals({ app, filter, setFilter, setApproval }) {
  const { state } = app;
  const all = state.requests.filter(r => r.status !== 'canceled');
  const sets = {
    urgent: all.filter(r => r.status === 'recruiting' && tm2Dday(r.date) <= 2 && tm2Dday(r.date) >= 0),
    open: all.filter(r => r.status === 'recruiting' && !(tm2Dday(r.date) <= 2 && tm2Dday(r.date) >= 0)),
    confirmed: all.filter(r => r.status === 'confirmed' || r.status === 'completed'),
  };
  const list = sets[filter].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ padding: '8px 20px 0' }}><h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: T.ink }}>승인 관리</h1></div>
      <div style={{ display: 'flex', gap: 22, padding: '14px 20px 0', borderBottom: `1px solid ${T.line}` }}>
        {[['urgent', '긴급', sets.urgent.length], ['open', '모집 중', sets.open.length], ['confirmed', '확정', sets.confirmed.length]].map(([id, l, n]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ border: 'none', background: 'none', padding: '6px 0 12px', fontFamily: 'inherit', fontSize: 16.5, fontWeight: 750,
            color: filter === id ? T.ink : T.ink3, borderBottom: `2.5px solid ${filter === id ? T.ink : 'transparent'}`, marginBottom: -1, cursor: 'pointer' }}>
            {l}<span style={{ marginLeft: 5, color: n > 0 && id !== 'confirmed' ? T.red : T.ink3, fontWeight: 750 }}>{n}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(r => <ApprovalCard key={r.id} r={r} app={app} onOpen={() => setApproval(r.id)} />)}
        {!list.length && <Empty title="해당하는 대직이 없어요" sub={filter === 'urgent' ? '이틀 안에 시작하는 미구인 대직이 없습니다.' : ''} icon="CheckCheck" />}
      </div>
    </div>
  );
}

function ApprovalCard({ r, app, onOpen }) {
  const by = TM2_USERS.find(u => u.id === r.by);
  const d = tm2Dday(r.date);
  const closed = r.status === 'confirmed' || r.status === 'completed';
  const [sent, setSent] = React.useState(false);

  return (
    <Card style={{ padding: 18 }}>
      <div onClick={onOpen} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {closed ? <Tag tone="green">확정 · {r.subName}</Tag>
            : d <= 2 && d >= 0 ? <Tag tone="red">D-{d} 긴급</Tag> : <Tag tone="blue">D-{d}</Tag>}
          <Tag>{r.count}{r.type === 'lesson' ? '교시' : '시간'}</Tag>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: T.ink3, fontWeight: 620 }}>{r.reason}</span>
        </div>
        <div style={{ fontSize: 13.5, color: T.ink2, fontWeight: 620 }}>{tm2Label(r.date)} · {by.name} {by.pos}</div>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, color: T.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{r.start} – {r.end}</div>
        <div style={{ fontSize: 14.5, fontWeight: 640, color: T.ink, marginTop: 3 }}>{r.program}</div>
      </div>
      {!closed && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Btn kind="secondary" size="sm" icon={sent ? 'Check' : 'Megaphone'} onClick={() => { setSent(true); app.broadcast(); }} style={{ flex: 1 }}>
            {sent ? '발송 완료' : '알림 보내기'}</Btn>
          <Btn kind={d <= 2 && d >= 0 ? 'red' : 'dark'} size="sm" onClick={onOpen} style={{ flex: 1 }}>직권 배정</Btn>
        </div>
      )}
      {closed && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <Tag tone="green">{r.subName} 강사</Tag>
          {r.adminAssigned && <Tag tone="amber">관리자 배정</Tag>}
          <Tag>{won(tm2Pay(r, TM2_USERS.find(u => u.id === by.id)))}</Tag>
        </div>
      )}
    </Card>
  );
}

// ---------------- 직권 배정 시트 ----------------
function AssignSheet({ id, onClose, app }) {
  const r = app.state.requests.find(x => x.id === id);
  const [pick, setPick] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => setPick(null), [id]);
  if (!r) return <Sheet open={false} onClose={onClose}><div /></Sheet>;

  const by = TM2_USERS.find(u => u.id === r.by);
  const d = tm2Dday(r.date);
  const closed = r.status === 'confirmed';

  const cands = TM2_USERS.filter(u => u.id !== r.by && !u.admin).map(u => {
    const conflict = app.state.schedules.some(s => s.uid === u.id && s.date === r.date && tm2Active(s) &&
      tm2Minutes(s.start) < tm2Minutes(r.end) && tm2Minutes(r.start) < tm2Minutes(s.end));
    const week = tm2WeeklyHours(app.state, u.id);
    return { ...u, conflict, week, over: week >= u.target };
  }).sort((a, b) => a.conflict - b.conflict || a.week - b.week);

  const assign = () => { setBusy(true); setTimeout(() => { app.adminAssign(r.id, pick); setBusy(false); onClose(); }, 600); };

  return (
    <Sheet open={!!id} onClose={onClose} full>
      <SheetHead title="대직 배정" onClose={onClose} />
      <div className="tm-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 20px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {closed ? <Tag tone="green">확정</Tag> : d <= 2 ? <Tag tone="red">D-{d} 긴급</Tag> : <Tag tone="blue">D-{d}</Tag>}
          <Tag>{r.count}{r.type === 'lesson' ? '교시' : '시간'} · {won(tm2Pay(r, by))}</Tag>
        </div>
        <h2 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: T.ink, lineHeight: 1.3 }}>{r.program}</h2>
        <div style={{ marginTop: 14, borderTop: `1px solid ${T.line2}` }}>
          {[['일시', `${tm2Label(r.date)} ${r.start}–${r.end}`], ['원 담당', `${by.name} ${by.pos}`], ['사유', r.reason]].map(([k, v], n, a) => (
            <div key={k} style={{ display: 'flex', padding: '12px 0', borderBottom: n < a.length - 1 ? `1px solid ${T.line2}` : 'none', fontSize: 14.5 }}>
              <div style={{ width: 68, color: T.ink3, fontWeight: 620, flexShrink: 0 }}>{k}</div>
              <div style={{ color: T.ink, fontWeight: 650 }}>{v}</div>
            </div>
          ))}
        </div>

        {!closed && (
          <>
            <div style={{ fontSize: 14, fontWeight: 720, color: T.ink, margin: '22px 0 4px' }}>대체 강사 지정</div>
            <div style={{ fontSize: 13, color: T.ink3, marginBottom: 12, lineHeight: 1.5 }}>같은 시간 근무가 겹치는 강사는 위로 정렬했어요.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cands.map(u => {
                const on = pick === u.id;
                return (
                  <button key={u.id} disabled={u.conflict} onClick={() => setPick(u.id)} className="tm-press" style={{ display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 15px', borderRadius: 14, cursor: u.conflict ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    border: `1px solid ${on ? T.ink : u.conflict ? T.line2 : T.line}`, background: u.conflict ? '#fafbfc' : '#fff',
                    boxShadow: on ? `inset 0 0 0 1px ${T.ink}` : 'none', opacity: u.conflict ? 0.5 : 1 }}>
                    <Avatar name={u.avatar} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{u.name} <span style={{ color: T.ink3, fontWeight: 550, fontSize: 12.5 }}>{u.pos}</span></div>
                      <div style={{ fontSize: 12.5, color: u.conflict ? T.ink3 : T.ink2, marginTop: 2 }}>
                        {u.conflict ? '같은 시간 근무 있음' : `이번 주 ${u.week}시간 · ${u.programs[0]}`}
                      </div>
                    </div>
                    {!u.conflict && (
                      <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${on ? T.ink : '#dde1e6'}`, background: on ? T.ink : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {on && <Icon name="Check" size={13} stroke={3.4} color="#fff" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {pick && TM2_USERS.find(u => u.id === pick).target <= tm2WeeklyHours(app.state, pick) && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 14, background: T.amberSoft, borderRadius: 14, padding: '13px 15px',
                fontSize: 13, color: T.amberInk, lineHeight: 1.55 }}>
                <Icon name="TriangleAlert" size={16} style={{ marginTop: 1 }} />
                <span>이번 주 기준 시간을 넘어요. 배정은 가능하지만 초과 근무로 기록돼요.</span>
              </div>
            )}
          </>
        )}
        {closed && (
          <div style={{ marginTop: 20, background: T.greenSoft, borderRadius: 14, padding: '15px 16px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 720, color: T.green }}>확정된 대직</div>
            <div style={{ fontSize: 14.5, color: T.ink, marginTop: 4 }}>{r.subName} 강사 · 근무표와 급여에 반영됐어요</div>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 22px 34px', borderTop: `1px solid ${T.line2}`, display: 'flex', gap: 8 }}>
        {closed ? <Btn kind="secondary" onClick={onClose}>닫기</Btn> : (
          <>
            <Btn kind="secondary" onClick={() => app.broadcast()} style={{ width: 62, flexShrink: 0 }} icon="Megaphone">{''}</Btn>
            <Btn kind={d <= 2 ? 'red' : 'dark'} disabled={!pick || busy} onClick={assign}>{busy ? '배정 중…' : '직권 배정'}</Btn>
          </>
        )}
      </div>
    </Sheet>
  );
}

Object.assign(window, { ADash, AApprovals, AssignSheet, as });
