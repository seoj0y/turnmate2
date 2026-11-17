// Admin — 근무표 (주간 그리드 · 월간 / 강사 상세) + 대직표 확인서
const AD_DAYS = (() => {
  const base = new Date('2026-10-05T00:00:00');
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
})();
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DW = ['일', '월', '화', '수', '목', '금', '토'];

function ASchedule({ app, openInstructor, openConfirm }) {
  const [view, setView] = React.useState('week');
  const { state } = app;
  const staff = TM2_USERS.filter(u => !u.admin || state.schedules.some(s => s.uid === u.id));

  const cellShifts = (uid, ds) => state.schedules.filter(s => s.uid === uid && s.date === ds && tm2Active(s));

  const exportCsv = () => {
    const rows = [['날짜', '요일', '강사', '시간', '유형', '프로그램', '상태']];
    state.schedules.filter(s => tm2Active(s)).sort((a, b) => a.date.localeCompare(b.date)).forEach(s => {
      const u = TM2_USERS.find(x => x.id === s.uid);
      rows.push([s.date, tm2Dow(s.date), u.name, `${s.start}~${s.end}`, s.type === 'lesson' ? '강습' : '안전근무', s.program,
        s.status === 'sub_assigned' ? '대직' : s.status === 'sub_requested' ? '대직요청' : '정규']);
    });
    tm2Csv('턴메이트_근무표_흑석체육센터_2026-10.csv', rows);
    app.notify('근무표를 CSV로 내려받았어요');
  };

  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: T.ink }}>근무표</h1>
          <div style={{ fontSize: 13.5, color: T.ink2, marginTop: 3 }}>10월 5일 – 11일</div>
        </div>
        <button onClick={exportCsv} className="tm-press" style={{ height: 38, padding: '0 13px', borderRadius: 10, border: `1px solid ${T.line}`,
          background: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: T.ink, display: 'flex', alignItems: 'center', gap: 5,
          cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="Download" size={15} />내보내기
        </button>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <Segmented items={[['week', '주간'], ['month', '월간']]} value={view} onChange={setView} />
      </div>

      {view === 'week' ? (
        <div style={{ padding: '16px 12px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
            <div />
            {AD_DAYS.map(d => {
              const ds = isoOf(d);
              const isToday = ds === TM2_TODAY;
              return <div key={ds} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 720, color: isToday ? T.blue : d.getDay() === 0 ? T.red : T.ink3 }}>{DW[d.getDay()]}</div>;
            })}
          </div>
          {staff.map(u => (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '52px repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
              <button onClick={() => openInstructor(u.id)} style={{ border: 'none', background: 'none', padding: '4px 0 0', textAlign: 'left', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 720, color: T.ink, cursor: 'pointer', lineHeight: 1.25 }}>{u.name}</button>
              {AD_DAYS.map(d => {
                const ds = isoOf(d);
                const items = cellShifts(u.id, ds);
                const isToday = ds === TM2_TODAY;
                return (
                  <div key={ds} style={{ minHeight: 46, display: 'flex', flexDirection: 'column', gap: 2,
                    background: items.length ? 'transparent' : isToday ? 'oklch(0.965 0.02 248)' : T.line2, borderRadius: 5 }}>
                    {items.map(s => {
                      const tone = s.status === 'sub_assigned' ? 'sub' : s.status === 'sub_requested' ? 'req' : 'reg';
                      const bg = tone === 'sub' ? 'oklch(0.94 0.055 72)' : tone === 'req' ? '#fff' : T.blueSoft;
                      const fg = tone === 'sub' ? T.amberInk : tone === 'req' ? T.ink3 : T.blueInk;
                      return (
                        <div key={s.id} title={`${s.start}–${s.end} ${s.program}`} style={{ background: bg, border: tone === 'req' ? `1px dashed #cfd6dd` : 'none',
                          borderLeft: tone === 'req' ? `2.5px dashed #cfd6dd` : `2.5px solid ${tone === 'sub' ? T.amber : T.blue}`,
                          borderRadius: 4, padding: '4px 3px', height: items.length > 1 ? 21 : 46, overflow: 'hidden' }}>
                          <div style={{ fontSize: 9, fontWeight: 750, color: fg, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}>{s.start}</div>
                          {items.length === 1 && <div style={{ fontSize: 9, color: fg, opacity: .65, marginTop: 1 }}>{s.end}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', fontSize: 12, color: T.ink3, fontWeight: 620 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 7, height: 7, borderRadius: 2, background: T.blue }} />정규</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 7, height: 7, borderRadius: 2, background: T.amber }} />대직 확정</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><i style={{ width: 7, height: 7, borderRadius: 2, border: '1px dashed #cfd6dd' }} />대직 요청중</span>
          </div>

          <SectionHead title="이번 주 요약" />
          <Card style={{ padding: '4px 20px' }}>
            {(() => {
              const weekShifts = state.schedules.filter(s => tm2Active(s) && AD_DAYS.some(d => isoOf(d) === s.date));
              const lessons = weekShifts.filter(s => s.type === 'lesson').reduce((a, s) => a + s.count, 0);
              const guards = weekShifts.filter(s => s.type === 'lifeguard').reduce((a, s) => a + s.count, 0);
              const subs = weekShifts.filter(s => s.status === 'sub_assigned').length;
              const reqs = weekShifts.filter(s => s.status === 'sub_requested').length;
              return [['정규 강습', `${lessons}교시`], ['안전근무', `${guards}시간`], ['확정 대직', `${subs}건`], ['미구인', `${reqs}건`]].map(([k, v], n, a) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0',
                  borderTop: n ? `1px solid ${T.line2}` : 'none', fontSize: 14.5 }}>
                  <span style={{ color: T.ink2 }}>{k}</span>
                  <span style={{ color: k === '미구인' ? T.red : T.ink, fontWeight: 740 }}>{v}</span>
                </div>
              ));
            })()}
          </Card>

          <button onClick={openConfirm} className="tm-press" style={{ width: '100%', marginTop: 10, padding: '16px 18px', borderRadius: 16, border: `1px solid ${T.line}`,
            background: '#fff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <Icon name="FileSpreadsheet" size={20} color={T.ink2} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>대직 확인서</div>
              <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>교시별 프로그램이 자동 기입된 공식 서식</div>
            </div>
            <Icon name="ChevronRight" size={18} color={T.ink3} />
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {staff.map(u => {
            const count = (d) => cellShifts(u.id, isoOf(d)).reduce((a, s) => a + s.count, 0);
            const total = AD_DAYS.reduce((a, d) => a + count(d), 0);
            return (
              <Card key={u.id} onClick={() => openInstructor(u.id)} style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={u.avatar} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 730, color: T.ink }}>{u.name} <span style={{ fontSize: 12, color: T.ink3, fontWeight: 570 }}>{u.pos}</span></div>
                  </div>
                  <span style={{ fontSize: 13, color: T.ink3, fontWeight: 680 }}>주 {total}시간</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                  {AD_DAYS.map(d => {
                    const n = count(d);
                    return <div key={isoOf(d)} style={{ flex: 1, height: 32, borderRadius: 6, background: n ? T.blueSoft : T.line2,
                      color: n ? T.blueInk : T.ink3, fontSize: 11.5, fontWeight: 760, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n || '·'}</div>;
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 강사 상세 시트 (프로필·경력별 단가표·자격증)
const TIERS = [
  { label: '1년차', sub: '신입·초급', rate: 26000 },
  { label: '2년차', sub: '중급', rate: 27000 },
  { label: '3년차', sub: '경력 이상', rate: 28000 },
];

function InstructorSheet({ id, onClose, app }) {
  const u = TM2_USERS.find(x => x.id === id);
  if (!u) return <Sheet open={false} onClose={onClose}><div /></Sheet>;
  const shifts = app.state.schedules.filter(s => s.uid === u.id && tm2Active(s));
  const week = tm2WeeklyHours(app.state, u.id);
  const monthHours = shifts.reduce((a, s) => a + s.count, 0);
  const sal = tm2Salary(app.state, u.id);

  return (
    <Sheet open={!!id} onClose={onClose} full>
      <SheetHead title="강사 정보" onClose={onClose} />
      <div className="tm-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={u.avatar} size={56} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 21, fontWeight: 800, color: T.ink, letterSpacing: -0.4 }}>{u.name}</span>
              <Tag tone="blue">{u.pos}</Tag>
            </div>
            <div style={{ fontSize: 13, color: T.ink3, marginTop: 3 }}>흑석체육센터 · 경력 {u.exp} · {u.phone}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 18 }}>
          {[['주간 배정', week + 'h'], ['10월 누적', monthHours + 'h'], ['10월 급여', won(sal.net)]].map(([l, v]) => (
            <div key={l} style={{ background: T.bg, borderRadius: 12, padding: '11px 12px' }}>
              <div style={{ fontSize: 11.5, color: T.ink3, fontWeight: 650 }}>{l}</div>
              <div style={{ fontSize: 14.5, fontWeight: 770, color: T.ink, marginTop: 2, letterSpacing: -0.3 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 720, color: T.ink, marginBottom: 8 }}>경력별 적용 단가</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {TIERS.map(t => {
              const on = tm2LessonRate(u) === t.rate;
              return (
                <div key={t.label} style={{ border: `1px solid ${on ? T.ink : T.line}`, background: on ? '#fff' : 'transparent', borderRadius: 11, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 750, color: on ? T.ink : T.ink2 }}>{t.label}</div>
                  <div style={{ fontSize: 10.5, color: T.ink3, marginTop: 1 }}>{t.sub}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 730, color: on ? T.blueInk : T.ink3, marginTop: 4 }}>{t.rate.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 8 }}>
            현재 적용: 강습 {won(tm2LessonRate(u))} · 안전근무 {won(tm2GuardRate(TM2_TODAY))}/h (주말 {won(tm2GuardRate('2026-10-10'))})
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 720, color: T.ink, marginBottom: 8 }}>정규 근무</div>
          <Card style={{ background: T.bg, padding: 15 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{u.regular}</div>
            <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 3 }}>주간 목표 {u.target}시간 · 현재 {week}시간</div>
            <div style={{ marginTop: 10 }}><Progress value={week} max={u.target} tone={week > u.target ? T.amber : T.blue} /></div>
          </Card>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 720, color: T.ink, marginBottom: 8 }}>보유 자격증</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {u.quals.map(q => <Tag key={q} style={{ height: 28, fontSize: 12.5 }}><Icon name="Award" size={13} color={T.ink3} />{q}</Tag>)}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 720, color: T.ink, marginBottom: 8 }}>지도 가능 프로그램</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {u.programs.map(p => <Tag key={p} tone="green" style={{ height: 28, fontSize: 12.5 }}>{p}</Tag>)}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13.5, fontWeight: 720, color: T.ink, marginBottom: 8 }}>이번 주 배정</div>
          {AD_DAYS.map(d => {
            const items = shifts.filter(s => s.date === isoOf(d));
            if (!items.length) return null;
            return (
              <div key={isoOf(d)} style={{ display: 'flex', padding: '10px 0', borderTop: `1px solid ${T.line2}`, fontSize: 13.5 }}>
                <span style={{ width: 58, color: T.ink3, fontWeight: 650 }}>{tm2Short(isoOf(d))} ({tm2Dow(isoOf(d))})</span>
                <div style={{ flex: 1 }}>
                  {items.map(s => <div key={s.id} style={{ color: T.ink, fontWeight: 640, marginBottom: 2 }}>{s.start}–{s.end} {s.program}</div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}

// 대직 확인서 — 교시별 프로그램 자동 기입, 프로그램명 수기 정정
function ConfirmSheet({ open, onClose, app }) {
  const done = app.state.requests.filter(r => r.status === 'confirmed' || r.status === 'completed')
    .sort((a, b) => a.date.localeCompare(b.date));
  const [overrides, setOverrides] = React.useState({});
  const [editing, setEditing] = React.useState(null);
  const [draft, setDraft] = React.useState('');

  const slots = (r) => {
    const start = tm2Minutes(r.start);
    return Array.from({ length: r.count }, (_, i) => {
      const s = start + i * 60, e = Math.min(s + 50, tm2Minutes(r.end));
      const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const key = r.id + '_' + i;
      return { idx: i + 1, range: `${fmt(s)}~${fmt(e)}`, program: overrides[key] || (r.type === 'lifeguard' ? '(안전근무)' : r.program), key };
    });
  };

  const exportCsv = () => {
    const rows = [['일자', '요일', '시간', '프로그램', '기존담당', '대체강사', '사유', '인정시간']];
    done.forEach(r => {
      const by = TM2_USERS.find(u => u.id === r.by);
      slots(r).forEach(s => rows.push([r.date, tm2Dow(r.date), s.range, s.program, by.name, r.subName, r.reason, s.idx + '교시']));
    });
    tm2Csv('턴메이트_대직근무확인서_흑석체육센터.csv', rows);
    app.notify('대직 확인서를 CSV로 내려받았어요');
  };

  return (
    <Sheet open={open} onClose={onClose} full>
      <SheetHead title="대직 근무 확인서" onClose={onClose}
        right={<button onClick={exportCsv} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6 }}><Icon name="Download" size={20} color={T.ink} /></button>} />
      <div style={{ padding: '14px 22px 10px', borderBottom: `1px solid ${T.line2}` }}>
        <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.55 }}>확정된 대직의 교시별 프로그램이 요일별 편성표 기준으로 자동 기입돼요. 현장 변동은 수기로 정정할 수 있습니다.</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <Tag tone="green">확정 {done.length}건</Tag>
          <Tag>{Object.keys(overrides).length}건 정정</Tag>
        </div>
      </div>
      <div className="tm-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 34px' }}>
        {done.map(r => {
          const by = TM2_USERS.find(u => u.id === r.by);
          return (
            <div key={r.id} style={{ paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14.5, fontWeight: 740, color: T.ink }}>{tm2Label(r.date)} · {by.name} → {r.subName}</div>
                <span style={{ fontSize: 12, color: T.ink3, fontWeight: 600 }}>{r.count}교시</span>
              </div>
              <div style={{ marginTop: 8, border: `1px solid ${T.line}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '38px 88px 1fr 30px', background: T.line2, padding: '8px 10px', fontSize: 11, fontWeight: 750, color: T.ink3 }}>
                  <span>교시</span><span>시간</span><span>프로그램</span><span />
                </div>
                {slots(r).map(s => (
                  <div key={s.key} style={{ display: 'grid', gridTemplateColumns: '38px 88px 1fr 30px', padding: '10px', fontSize: 12.5, borderTop: `1px solid ${T.line2}`, alignItems: 'center' }}>
                    <span style={{ color: T.ink3, fontWeight: 650 }}>{s.idx}</span>
                    <span style={{ color: T.ink2, fontVariantNumeric: 'tabular-nums' }}>{s.range}</span>
                    <span style={{ color: T.ink, fontWeight: 640, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.program}</span>
                    <button onClick={() => { setEditing(s); setDraft(s.program); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', justifyContent: 'flex-end' }}>
                      <Icon name="Pencil" size={13} color={T.ink3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {!done.length && <Empty title="확정된 대직이 없어요" sub="배정이 확정되면 확인서가 자동으로 만들어져요." icon="FileText" />}
      </div>

      {editing && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(12,18,26,.44)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderRadius: '22px 22px 0 0', padding: '20px 22px 30px' }}>
            <div style={{ fontSize: 16, fontWeight: 760, color: T.ink }}>프로그램명 정정</div>
            <div style={{ fontSize: 13, color: T.ink3, marginTop: 3 }}>{editing.range} · 교시 {editing.idx}</div>
            <input value={draft} onChange={e => setDraft(e.target.value)} style={{ ...inputStyle, marginTop: 14 }} autoFocus />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {['새벽수영', '여성수영', '소수정예', '아쿠아로빅', '안전근무'].map(p => (
                <button key={p} onClick={() => setDraft(p)} style={{ height: 32, padding: '0 11px', borderRadius: 8, border: `1px solid ${T.line}`, background: '#fff',
                  fontFamily: 'inherit', fontSize: 12.5, fontWeight: 620, color: T.ink2, cursor: 'pointer' }}>{p}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <Btn kind="secondary" onClick={() => setEditing(null)}>취소</Btn>
              <Btn kind="dark" onClick={() => { setOverrides(o => ({ ...o, [editing.key]: draft })); setEditing(null); app.notify('프로그램명을 정정했어요'); }}>저장</Btn>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

Object.assign(window, { ASchedule, InstructorSheet, ConfirmSheet });
