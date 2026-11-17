// Instructor — 홈 + 출퇴근
function IHome({ app, go }) {
  const [checkin, setCheckin] = React.useState(false);
  const [reqOpen, setReqOpen] = React.useState(false);
  const [arrive, setArrive] = React.useState(false);
  const [memoOpen, setMemoOpen] = React.useState(false);
  const { state, myUser, me } = app;

  const att = app.attendance(me);
  const geoOn = !!state.settings.geo;

  const geo = useGeofence({
    radius: state.settings.radius,
    enabled: geoOn,
    onEnter: (d) => {
      if (app.attendance(me)) { app.notify('센터 도착을 확인했어요 · 이미 출근 처리됐어요'); return; }
      setArrive(true);
      tmPushNotification('흑석체육센터에 도착했어요', `반경 ${state.settings.radius}m 안입니다. 출근을 기록할까요?`);
    },
  });

  const toggleGeo = async (v) => {
    app.setSetting('geo', v);
    if (v) {
      await tmRequestLocationNotif();
      app.notify(`도착 알림을 켰어요 · 센터 ${state.settings.radius}m 안에서 알려드릴게요`);
    } else {
      geo.stopSim();
      app.notify('도착 알림을 껐어요');
    }
  };

  const mine = state.schedules.filter(s => s.uid === me && s.status !== 'canceled');
  const todayList = mine.filter(s => s.date === TM2_TODAY).sort((a, b) => a.start.localeCompare(b.start));
  const next = todayList[0];
  const hasToday = todayList.length > 0;
  const sal = tm2Salary(state, me);
  const week = mine.filter(s => tm2Dday(s.date) >= 0 && tm2Dday(s.date) <= 6).reduce((a, s) => a + s.count, 0);
  const openReqs = state.requests.filter(r => r.status === 'recruiting' && r.by !== me);
  const urgent = openReqs.filter(r => tm2Dday(r.date) <= 2 && tm2Dday(r.date) >= 0).sort((a, b) => a.date.localeCompare(b.date))[0];
  const myOpen = state.requests.filter(r => r.by === me && (r.status === 'recruiting' || r.status === 'confirmed'));
  // 근무가 없는 날 보여줄 '다음 근무일'
  const upcoming = mine.filter(s => tm2Dday(s.date) > 0).sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))[0];

  // 이번 달 급여 블록 (오늘 근무 유무에 따라 위치가 바뀝니다)
  const salaryBlock = (
    <div>
      <SectionHead title={`${Number(TM2_MONTH.split('-')[1])}월 급여`} action="명세" onAction={() => go('me')} sub={hasToday ? undefined : '이번 달 예상 실수령액'} />
      <Card style={{ marginTop: -2 }}>
        <div style={{ fontSize: 13, color: T.ink3, fontWeight: 650 }}>실수령액 예상 (3.3% 공제 후)</div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, color: T.ink, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{won(sal.net)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <div style={hs.stat}><div style={hs.statL}>정규</div><div style={hs.statV}>{won(sal.regL + sal.regG)}</div></div>
          <div style={hs.stat}><div style={hs.statL}>대직</div><div style={{ ...hs.statV, color: T.amberInk }}>+{won(sal.subL + sal.subG)}</div></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.ink2, fontWeight: 620, marginBottom: 6 }}>
            <span>이번 주 {week}시간</span><span>기준 {state.settings.threshold}시간</span>
          </div>
          <Progress value={week} max={state.settings.threshold} tone={week >= state.settings.threshold ? T.amber : T.blue} />
        </div>
        <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${T.line2}`, display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.ink3, fontWeight: 600 }}>
          <span>강습 {won(tm2LessonRate(myUser))} / 교시</span>
          <span>안전 {won(tm2GuardRate(TM2_TODAY))} / 시간</span>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '6px 16px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '6px 4px 2px' }}>
        <div style={{ fontSize: 13.5, color: T.ink3, fontWeight: 600 }}>{tm2Label(TM2_TODAY)}</div>
        <h1 style={{ margin: '5px 0 0', fontSize: 25, fontWeight: 790, letterSpacing: -0.7, color: T.ink, lineHeight: 1.3 }}>
          {myUser.name} 강사님,<br />{hasToday ? `오늘 근무 ${todayList.length}건이에요` : '오늘은 근무가 없어요'}
        </h1>
      </div>

      {/* 오늘 근무가 없는 날에는 이번 달 급여를 맨 위로 */}
      {!hasToday && salaryBlock}

      {!hasToday && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: T.line2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="Coffee" size={17} color={T.ink3} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>오늘은 배정된 근무가 없어요</div>
              <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>대직을 지원해 수당을 더 받을 수 있어요</div>
            </div>
            <button onClick={() => go('market')} className="tm-press" style={{ height: 36, padding: '0 12px', borderRadius: 9, border: `1px solid ${T.line}`,
              background: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.ink, cursor: 'pointer', flexShrink: 0 }}>보기</button>
          </div>
          {upcoming && (
            <button onClick={() => go('schedule')} className="tm-press" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', border: 'none', borderTop: `1px solid ${T.line2}`, background: '#fff', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
              <Icon name="CalendarDays" size={15} color={T.ink3} />
              <span style={{ fontSize: 13, color: T.ink3, fontWeight: 620 }}>다음 근무</span>
              <span style={{ flex: 1, fontSize: 13.5, color: T.ink, fontWeight: 680 }}>
                {tm2Label(upcoming.date)} {upcoming.start}
              </span>
              <span style={{ fontSize: 12, color: T.ink3, fontWeight: 640 }}>{tm2Dday(upcoming.date) === 1 ? '내일' : `D-${tm2Dday(upcoming.date)}`}</span>
              <Icon name="ChevronRight" size={15} color={T.ink3} />
            </button>
          )}
        </Card>
      )}

      {/* 다음 근무 + 출근 (오늘 근무가 있을 때만) */}
      {next && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 720, color: att ? T.green : geo.inside ? T.green : T.blue }}>
                {att ? (att.out ? '오늘 근무 완료' : '출근 완료 · 근무 중') : geo.inside ? '센터에 도착해 있어요' : `다음 근무 · ${next.start} 시작`}
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                {att && <Tag tone="green">{att.in}{att.out ? ' – ' + att.out : ''}</Tag>}
                {geo.inside && !att && <Tag tone="green"><span className="tm-dot" />도착</Tag>}
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.9, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: 8 }}>
              {next.start}<span style={{ color: T.ink3, fontWeight: 600 }}> – {next.end}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 660, color: T.ink, marginTop: 4 }}>{next.program}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {next.status === 'sub_assigned' && <Tag tone="amber">대직 · {next.subFor} 강사 대신</Tag>}
              <Tag>{next.count}{next.type === 'lesson' ? '교시' : '시간'}</Tag>
              <Tag>{next.type === 'lesson' ? '강습' : '안전근무'}</Tag>
            </div>
          </div>
          <div style={{ display: 'flex', borderTop: `1px solid ${T.line2}` }}>
            <button onClick={() => setCheckin(true)} className="tm-press" style={{ ...hs.split, color: att && att.out ? T.ink3 : T.blue }}>
              <Icon name={att ? (att.out ? 'LogOut' : 'Timer') : 'MapPin'} size={18} />
              {att ? (att.out ? '기록 보기' : '퇴근하기') : '출근하기'}
            </button>
            <div style={{ width: 1, background: T.line2 }} />
            <button onClick={() => setMemoOpen(true)} className="tm-press" style={{ ...hs.split, color: T.ink2 }}>인수인계 메모</button>
          </div>
        </Card>
      )}

      {/* 오늘 남은 근무 */}
      {todayList.filter(s => s.id !== (next && next.id)).map(s => (
        <Card key={s.id} style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 720, color: T.ink, fontVariantNumeric: 'tabular-nums', width: 46 }}>{s.start}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 640, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.program}</div>
            <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>{s.type === 'lesson' ? `강습 ${s.count}교시` : `안전근무 ${s.count}시간`}</div>
          </div>
          <Tag tone={s.status === 'sub_assigned' ? 'amber' : 'blue'}>{s.status === 'sub_assigned' ? '대직' : '정규'}</Tag>
        </Card>
      ))}

      {/* 센터 도착 알림 */}
      <GeoCard geo={geo} enabled={geoOn} onToggle={toggleGeo} checkedIn={!!att}
        onCheckin={() => { setCheckin(true); setArrive(false); }} />

      {/* 급한 대직 */}
      {urgent && (
        <Card onClick={() => go('market', urgent.id)} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: T.redSoft, color: T.red, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800, fontSize: 13.5 }}>D-{tm2Dday(urgent.date)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: T.red, fontWeight: 720 }}>{TM2_USERS.find(u => u.id === urgent.by).name} 강사가 급히 찾고 있어요</div>
            <div style={{ fontSize: 15, fontWeight: 660, color: T.ink, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tm2Short(urgent.date)} {urgent.start} · {won(tm2Pay(urgent, myUser))}
            </div>
          </div>
          <Icon name="ChevronRight" size={20} color={T.ink3} />
        </Card>
      )}

      {/* 내 대직 */}
      {myOpen.length > 0 && (
        <>
          <SectionHead title="내 대직" action="전체" onAction={() => go('market', null, 'mine')} />
          <Card style={{ padding: '4px 20px', marginTop: -2 }}>
            {myOpen.map((r, n) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: n ? `1px solid ${T.line2}` : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 690, color: T.ink }}>{tm2Short(r.date)} {r.start} – {r.end}</div>
                  <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>{r.program}</div>
                </div>
                {r.status === 'recruiting' ? <Tag tone="blue"><span className="tm-dot" />지원자 찾는 중</Tag> : <Tag tone="green">{r.subName} 확정</Tag>}
              </div>
            ))}
          </Card>
        </>
      )}

      {/* 급여 — 오늘 근무가 있는 날에만 여기(하단)에 표시 */}
      {hasToday && salaryBlock}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
        <Card onClick={() => setReqOpen(true)} style={{ padding: 18 }}>
          <Icon name="CalendarMinus" size={23} color={T.ink} />
          <div style={{ fontSize: 15.5, fontWeight: 710, color: T.ink, marginTop: 13 }}>대직 요청</div>
          <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>내 근무 비우기</div>
        </Card>
        <Card onClick={() => go('market')} style={{ padding: 18 }}>
          <Icon name="HandHelping" size={23} color={T.ink} />
          <div style={{ fontSize: 15.5, fontWeight: 710, color: T.ink, marginTop: 13 }}>대직 지원</div>
          <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>모집 중 {openReqs.length}건</div>
        </Card>
      </div>

      <AttendanceSheet open={checkin} onClose={() => setCheckin(false)} app={app} geo={geo} />
      <MemoSheet open={memoOpen} onClose={() => setMemoOpen(false)} shift={next} app={app} />
      <RequestSheet open={reqOpen} onClose={() => setReqOpen(false)} app={app} />
      <ArriveSheet open={arrive} onClose={() => setArrive(false)} app={app} geo={geo} />
    </div>
  );
}

const hs = {
  split: { flex: 1, height: 54, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' },
  stat: { background: T.bg, borderRadius: 12, padding: '11px 13px' },
  statL: { fontSize: 12.5, color: T.ink3, fontWeight: 650 },
  statV: { fontSize: 16.5, fontWeight: 760, color: T.ink, marginTop: 2, letterSpacing: -0.3 },
};

// 인수인계 메모 — 대체 강사에게 전달할 내용 확인 / 내가 남긴 메모
function MemoSheet({ open, onClose, shift, app }) {
  if (!shift) return null;
  const req = shift.reqId && app ? app.state.requests.find(r => r.id === shift.reqId) : null;
  const body = (req && req.memo)
    ? req.memo
    : shift.status === 'sub_assigned'
      ? '진도표는 강사실 책상 위에 있어요. 유아풀 2레인을 사용하고, 어린이 6명 호흡·발차기 위주로 진행해 주세요.'
      : '등록된 인수인계 메모가 없어요.';
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '14px 24px 34px' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: T.ink }}>인수인계 메모</h2>
        <p style={{ margin: '6px 0 0', fontSize: 14.5, color: T.ink2, lineHeight: 1.5 }}>
          {shift.start} – {shift.end} · {shift.program}
        </p>
        <div style={{ marginTop: 18, background: T.bg, borderRadius: 14, padding: '15px 16px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 720, color: T.ink3, marginBottom: 6 }}>전달 받은 내용</div>
          <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.65 }}>{body}</div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: T.ink3, lineHeight: 1.55 }}>
          <Icon name="Info" size={14} style={{ marginTop: 2 }} />
          <span>메모는 대직 요청을 등록했을 때 적은 내용이에요.</span>
        </div>
        <Btn kind="secondary" onClick={onClose} style={{ marginTop: 20 }}>닫기</Btn>
      </div>
    </Sheet>
  );
}

// 출퇴근 시트
function AttendanceSheet({ open, onClose, app, geo }) {
  const [phase, setPhase] = React.useState('idle');
  const rec = app.attendance(app.me);
  React.useEffect(() => { if (open) setPhase(rec ? 'done' : 'idle'); }, [open]);

  const locate = () => {
    if (geo && geo.dist != null) { setPhase(geo.inside ? 'arrived' : 'far'); return; }
    setPhase('locating');
    setTimeout(() => setPhase('arrived'), 1200);
  };
  const isDone = rec && rec.out;
  const isWorking = rec && !rec.out;
  const ok = phase === 'arrived';

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '14px 24px 34px' }}>
        <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: -0.6, color: T.ink }}>
          {isDone ? '오늘 근무를 마쳤어요' : isWorking ? '근무 중이에요' : '출근 체크'}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 15, color: T.ink2, lineHeight: 1.5 }}>
          {isDone ? `${rec.in} 출근 · ${rec.out} 퇴근으로 기록됐어요.`
            : isWorking ? `${rec.in}에 출근했어요. 수업이 끝나면 퇴근을 눌러주세요.`
            : `흑석체육센터 수영장 반경 ${geo ? geo.radius : 200}m 안에서 출근할 수 있어요.`}
        </p>

        <div style={{ margin: '22px 0', height: 176, borderRadius: 18, background: isDone || ok ? T.greenSoft : phase === 'far' ? T.amberSoft : T.bg,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 11, transition: 'background .3s' }}>
          <div className={phase === 'locating' ? 'tm-pulse' : ''} style={{ width: 66, height: 66, borderRadius: 33,
            background: isDone || ok ? T.green : phase === 'far' ? T.amber : phase === 'locating' ? T.blue : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(16,24,40,.08)' }}>
            <Icon name={isDone ? 'Check' : isWorking ? 'Timer' : ok ? 'Check' : phase === 'far' ? 'MapPinOff' : 'MapPin'} size={28} stroke={2.4}
              color={phase === 'idle' && !isDone && !isWorking ? T.ink : '#fff'} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', color: isDone || ok ? T.green : phase === 'far' ? T.amberInk : T.ink2 }}>
            {isDone ? `총 ${Math.max(1, tm2Minutes(rec.out) - tm2Minutes(rec.in))}분 근무` : isWorking ? '근무 중'
              : phase === 'idle' ? '위치 확인 전'
              : phase === 'locating' ? '위치 확인 중…'
              : phase === 'far' ? `아직 반경 밖이에요${geo && geo.dist != null ? ' · ' + geo.dist + 'm' : ''}`
              : `도착 확인${geo && geo.dist != null ? ' · ' + geo.dist + 'm' : ''}`}
          </div>
        </div>

        {!rec && phase === 'idle' && <Btn onClick={locate} icon="LocateFixed">내 위치 확인</Btn>}
        {!rec && phase === 'locating' && <Btn disabled>확인 중</Btn>}
        {!rec && phase === 'far' && <Btn kind="dark" onClick={locate} icon="RefreshCw">다시 확인</Btn>}
        {!rec && phase === 'arrived' && <Btn icon="LogIn" onClick={() => { app.clockIn('gps'); onClose(); }}>지금 출근하기</Btn>}
        {isWorking && <Btn kind="dark" icon="LogOut" onClick={() => { app.clockOut(); onClose(); }}>퇴근 완료하기</Btn>}
        {isDone && <Btn kind="secondary" onClick={onClose}>닫기</Btn>}
        {!rec && phase !== 'arrived' && (
          <button onClick={() => { app.clockIn('manual'); onClose(); }} style={{ width: '100%', marginTop: 6, height: 44, border: 'none',
            background: 'none', fontFamily: 'inherit', fontSize: 14, color: T.ink3, fontWeight: 620, cursor: 'pointer' }}>위치 확인이 안 되면 수동으로 출근</button>
        )}
        <div style={{ marginTop: 18, display: 'flex', gap: 8, fontSize: 12.5, color: T.ink3, lineHeight: 1.5 }}>
          <Icon name="Info" size={14} style={{ marginTop: 1 }} />
          <span>위치 정보는 센터 도착 여부 확인에만 쓰고, 이동 경로는 저장하지 않아요.</span>
        </div>
      </div>
    </Sheet>
  );
}

Object.assign(window, { IHome, hs });
