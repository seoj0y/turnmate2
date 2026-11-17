// Instructor — 대직 (지원 / 내 요청) + 상세 시트
const MK_F = [['all', '전체'], ['avail', '지원 가능'], ['lesson', '강습'], ['guard', '안전근무'], ['child', '어린이'], ['adult', '성인']];

function IMarket({ app, onOpen, tab, setTab }) {
  const [f, setF] = React.useState('all');
  const [advFilter, setAdvFilter] = React.useState(false);
  const [reqOpen, setReqOpen] = React.useState(false);
  const { state, me } = app;

  const others = state.requests.filter(r => r.by !== me && r.status !== 'canceled' && r.status !== 'completed');
  const mine = state.requests.filter(r => r.by === me && r.status !== 'canceled');

  const hasConflict = (r) => state.schedules.some(s => s.uid === me && s.date === r.date && tm2Active(s) &&
    tm2Minutes(s.start) < tm2Minutes(r.end) && tm2Minutes(r.start) < tm2Minutes(s.end));

  let list = others.filter(r => {
    if (f === 'avail') return r.status === 'recruiting' && !hasConflict(r);
    if (f === 'lesson' || f === 'guard') return r.type === f;
    if (f === 'child') return r.target === '어린이';
    if (f === 'adult') return r.target === '성인';
    return true;
  });
  if (advFilter) list = list.filter(r => r.status === 'recruiting' && !hasConflict(r));
  list = list.sort((a, b) => (a.status === 'confirmed') - (b.status === 'confirmed') || a.date.localeCompare(b.date));

  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ padding: '8px 20px 0' }}><h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: T.ink }}>대직</h1></div>
      <div style={{ display: 'flex', gap: 22, padding: '14px 20px 0', borderBottom: `1px solid ${T.line}` }}>
        {[['find', '지원하기'], ['mine', '내 요청']].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ border: 'none', background: 'none', padding: '6px 0 12px', fontFamily: 'inherit', fontSize: 17, fontWeight: 760,
            color: tab === id ? T.ink : T.ink3, borderBottom: `2.5px solid ${tab === id ? T.ink : 'transparent'}`, marginBottom: -1, cursor: 'pointer' }}>
            {l}<span style={{ marginLeft: 5, color: tab === id ? T.blue : T.ink3, fontWeight: 750 }}>{id === 'find' ? others.filter(r => r.status === 'recruiting').length : mine.filter(r => r.status === 'recruiting').length}</span>
          </button>
        ))}
      </div>

      {tab === 'find' ? (
        <>
          <div className="tm-noscroll" style={{ display: 'flex', gap: 8, padding: '14px 16px 6px', overflowX: 'auto' }}>
            {MK_F.map(([id, l]) => <Chip key={id} on={f === id} onClick={() => setF(id)}>{l}</Chip>)}
          </div>
          <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => setAdvFilter(!advFilter)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none',
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: 660, color: advFilter ? T.blue : T.ink3, cursor: 'pointer', padding: '4px 0' }}>
              <Icon name={advFilter ? 'CheckSquare' : 'Square'} size={16} />지원 가능한 것만
            </button>
            <span style={{ fontSize: 13, color: T.ink3, fontWeight: 600 }}>{list.length}건</span>
          </div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map(r => <MarketCard key={r.id} r={r} onOpen={onOpen} conflict={hasConflict(r)} me={me} />)}
            {!list.length && <Empty title="조건에 맞는 대직이 없어요" sub="필터를 바꾸거나 새 요청이 올라오면 알려드릴게요." icon="SearchX" />}
          </div>
        </>
      ) : (
        <MyRequests app={app} onOpen={onOpen} openCreate={() => setReqOpen(true)} />
      )}
      <RequestSheet open={reqOpen} onClose={() => setReqOpen(false)} app={app} />
    </div>
  );
}

function MarketCard({ r, onOpen, conflict, me }) {
  const by = TM2_USERS.find(u => u.id === r.by);
  const closed = r.status === 'confirmed';
  const d = tm2Dday(r.date);
  const urgent = !closed && d <= 2 && d >= 0;
  const pay = tm2Pay(r, TM2_USERS.find(u => u.id === me));

  return (
    <Card onClick={() => onOpen(r.id)} style={{ padding: 18, opacity: closed ? 0.56 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        {closed ? <Tag>마감 · {r.subName}</Tag> : urgent ? <Tag tone="red">D-{d} 긴급</Tag> : <Tag tone="blue">D-{d}</Tag>}
        <Tag>{r.type === 'lesson' ? '강습' : '안전근무'}</Tag>
        {conflict && !closed && <Tag tone="amber">일정 겹침</Tag>}
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: T.ink3, fontWeight: 600 }}>{by.name} 강사</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, color: T.ink2, fontWeight: 620 }}>{tm2Label(r.date)}</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: T.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{r.start} – {r.end}</div>
          <div style={{ fontSize: 14.5, color: T.ink, fontWeight: 620, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.program}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 790, color: T.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>{won(pay)}</div>
          <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>{r.count}{r.type === 'lesson' ? '교시' : '시간'}</div>
        </div>
      </div>
    </Card>
  );
}

function MarketDetail({ id, onClose, app }) {
  const r = app.state.requests.find(x => x.id === id);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => setBusy(false), [id]);
  if (!r) return <Sheet open={false} onClose={onClose}><div /></Sheet>;

  const by = TM2_USERS.find(u => u.id === r.by);
  const me = TM2_USERS.find(u => u.id === app.me);
  const mine = r.by === app.me;
  const closed = r.status === 'confirmed' || r.status === 'completed';
  const pay = tm2Pay(r, me);
  const conflict = app.state.schedules.some(s => s.uid === app.me && s.date === r.date && tm2Active(s) &&
    tm2Minutes(s.start) < tm2Minutes(r.end) && tm2Minutes(r.start) < tm2Minutes(s.end));
  const myApplied = r.sub === app.me;
  const d = tm2Dday(r.date);

  const apply = () => { setBusy(true); setTimeout(() => { app.apply(r.id); setBusy(false); setTimeout(onClose, 900); }, 700); };

  return (
    <Sheet open={!!id} onClose={onClose}>
      <div className="tm-noscroll" style={{ overflowY: 'auto', padding: '14px 24px 0', flex: 1 }}>
        {(myApplied || (closed && mine)) ? (
          <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
            <div className="tm-pop" style={{ width: 62, height: 62, borderRadius: 31, background: T.green, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="Check" size={30} stroke={3} color="#fff" />
            </div>
            <h2 style={{ margin: '14px 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: T.ink }}>
              {mine ? '대직이 확정됐어요' : '지원이 확정됐어요'}
            </h2>
            <p style={{ margin: 0, fontSize: 14.5, color: T.ink2, lineHeight: 1.5 }}>{mine ? `${r.subName} 강사가 맡기로 했어요.` : '일정과 급여에 바로 반영했어요.'}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6 }}>
              {closed ? <Tag>마감</Tag> : d <= 2 ? <Tag tone="red">D-{d} 긴급</Tag> : <Tag tone="blue">D-{d}</Tag>}
              <Tag>{r.type === 'lesson' ? '강습' : '안전근무'}</Tag>
            </div>
            <h2 style={{ margin: '12px 0 0', fontSize: 23, fontWeight: 800, letterSpacing: -0.55, color: T.ink, lineHeight: 1.32 }}>{r.program}</h2>
            <div style={{ fontSize: 14, color: T.ink3, marginTop: 6 }}>{by.name} {by.pos} · {by.exp ? '경력 ' + by.exp : ''}</div>
          </>
        )}

        <div style={{ marginTop: 18, borderTop: `1px solid ${T.line2}` }}>
          {[
            ['날짜', tm2Label(r.date)],
            ['시간', `${r.start} – ${r.end} · ${r.count}${r.type === 'lesson' ? '교시' : '시간'}`],
            ['대상', `${r.target}${r.level !== '-' ? ' · ' + r.level : ''}`],
            ['예상 수당', <span>{won(pay)} <span style={{ color: T.ink3, fontWeight: 520 }}>실수령 {won(pay * 0.967)}</span></span>],
            ['요청 사유', r.reason],
          ].map(([k, v], n, a) => (
            <div key={k} style={{ display: 'flex', padding: '13px 0', borderBottom: n < a.length - 1 ? `1px solid ${T.line2}` : 'none', fontSize: 15 }}>
              <div style={{ width: 82, color: T.ink3, fontWeight: 620, flexShrink: 0 }}>{k}</div>
              <div style={{ color: T.ink, fontWeight: 650 }}>{v}</div>
            </div>
          ))}
        </div>

        {r.memo && (
          <div style={{ marginTop: 16, background: T.bg, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 720, color: T.ink3, marginBottom: 5 }}>인수인계 메모</div>
            <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.6 }}>{r.memo}</div>
          </div>
        )}

        {r.multi && (
          <div style={{ marginTop: 12, fontSize: 13, color: T.ink3 }}>
            묶음 요청 · {r.multi.length}개 시간대 ({r.multi.map(m => `${tm2Short(m.date)} ${m.start}`).join(', ')})
          </div>
        )}

        {!closed && mine && (
          <div style={{ marginTop: 14, display: 'flex', gap: 10, background: T.blueSoft, borderRadius: 14, padding: '14px 16px', fontSize: 13.5, color: T.blueInk, lineHeight: 1.5 }}>
            <Icon name="Info" size={17} style={{ marginTop: 1 }} />
            <span>내가 올린 요청이라 직접 지원할 수 없어요. 취소하면 원래 근무로 돌아가요.</span>
          </div>
        )}
        {!closed && !mine && conflict && (
          <div style={{ marginTop: 14, display: 'flex', gap: 10, background: T.amberSoft, borderRadius: 14, padding: '14px 16px', fontSize: 13.5, color: T.amberInk, lineHeight: 1.5 }}>
            <Icon name="TriangleAlert" size={17} style={{ marginTop: 1 }} />
            <span>같은 시간에 이미 근무가 있어요. 지원하려면 먼저 그 근무를 대직 요청해 주세요.</span>
          </div>
        )}
        {!closed && !mine && !conflict && (
          <div style={{ marginTop: 12, fontSize: 13, color: T.ink3, lineHeight: 1.55, padding: '0 2px' }}>
            지원하면 바로 확정돼요. 확정 후 취소하면 담당 강사와 관리자에게 알림이 가요.
          </div>
        )}
      </div>

      <div style={{ padding: '16px 24px 34px', display: 'flex', gap: 8 }}>
        {closed || myApplied ? <Btn kind="secondary" onClick={onClose}>닫기</Btn>
          : mine ? <Btn kind="red" onClick={() => { app.cancelRequest(r.id); onClose(); }}>요청 취소하기</Btn>
          : (
            <>
              <Btn kind="secondary" onClick={onClose} style={{ width: 92, flexShrink: 0 }}>닫기</Btn>
              <Btn kind={d <= 2 ? 'red' : 'primary'} disabled={conflict || busy} onClick={apply}>{busy ? '확정 중…' : `${won(pay)} 대직 지원`}</Btn>
            </>
          )}
      </div>
    </Sheet>
  );
}

function MyRequests({ app, onOpen, openCreate }) {
  const mine = app.state.requests.filter(r => r.by === app.me && r.status !== 'canceled');
  const [filter, setFilter] = React.useState('all');
  const list = mine.filter(r => filter === 'all' ? true : filter === 'open' ? r.status === 'recruiting' : r.status !== 'recruiting');

  return (
    <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Chip on={filter === 'all'} onClick={() => setFilter('all')}>전체 {mine.length}</Chip>
        <Chip on={filter === 'open'} onClick={() => setFilter('open')}>지원자 찾는 중</Chip>
        <Chip on={filter === 'done'} onClick={() => setFilter('done')}>확정</Chip>
      </div>
      {list.map(r => (
        <Card key={r.id} style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {r.status === 'recruiting' ? <Tag tone="blue"><span className="tm-dot" />지원자 찾는 중</Tag>
              : <Tag tone="green">{r.subName} 확정</Tag>}
            <span style={{ fontSize: 13, color: T.ink3 }}>{r.reason}</span>
          </div>
          <div onClick={() => onOpen(r.id)} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 14, color: T.ink2, fontWeight: 620, marginTop: 12 }}>{tm2Label(r.date)}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: -0.5, marginTop: 2 }}>{r.start} – {r.end}</div>
            <div style={{ fontSize: 14.5, color: T.ink, fontWeight: 620, marginTop: 3 }}>{r.program}</div>
          </div>
          {r.status === 'recruiting' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Btn kind="secondary" size="sm" onClick={() => app.cancelRequest(r.id)}>요청 취소</Btn>
              <Btn kind="outline" size="sm" onClick={() => onOpen(r.id)}>상세 보기</Btn>
            </div>
          )}
        </Card>
      ))}
      {!list.length && <Empty title="진행 중인 대직이 없어요" sub="근무를 비워야 할 때 3단계로 요청할 수 있어요." icon="CalendarMinus" />}
      <Btn kind="dark" icon="Plus" onClick={openCreate} style={{ marginTop: 4 }}>새 대직 요청</Btn>
    </div>
  );
}

Object.assign(window, { IMarket, MarketCard, MarketDetail, MyRequests });
