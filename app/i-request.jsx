// Instructor — 대직 요청 (3단계, 다중 시간대 묶음 지원)
const RQ_REASONS = ['병원 진료', '자격 연수', '개인 사정', '경조사', '대회·행사 차출'];
const RQ_MEMO = ['진도표는 강사실 책상 위에 있어요', '유아풀 2레인 사용해 주세요', '음원은 강사실 3번 USB에 있어요'];

function RequestSheet({ open, onClose, app }) {
  const [step, setStep] = React.useState(0);
  const [picked, setPicked] = React.useState([]);
  const [reason, setReason] = React.useState(null);
  const [memo, setMemo] = React.useState('');
  const [manual, setManual] = React.useState(false);
  const [md, setMd] = React.useState({ date: '2026-10-20', start: '16:00', end: '18:50', program: '' });
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { if (open) { setStep(0); setPicked([]); setReason(null); setMemo(''); setManual(false); setDone(false);
    setMd({ date: '2026-10-20', start: '16:00', end: '18:50', program: '' }); } }, [open]);

  const myShifts = app.state.schedules
    .filter(s => s.uid === app.me && s.status === 'regular' && tm2Dday(s.date) >= 1)
    .sort((a, b) => a.date.localeCompare(b.date));
  const pickedShifts = myShifts.filter(s => picked.includes(s.id));
  // 직접 입력 — 선택한 근무가 없을 때만 사용되는 수동 항목
  const manualShift = manual && pickedShifts.length === 0 && md.date && md.start && md.end && tm2Minutes(md.end) > tm2Minutes(md.start)
    ? [{
        id: 'manual_' + md.date + md.start, uid: app.me, date: md.date, start: md.start, end: md.end,
        program: md.program || '직접 입력 근무', type: 'lesson', target: '성인', level: '중급',
        count: Math.max(1, Math.round((tm2Minutes(md.end) - tm2Minutes(md.start)) / 60)), status: 'regular', manual: true,
      }]
    : [];
  const chosenShifts = pickedShifts.length ? pickedShifts : manualShift;
  const canNext1 = chosenShifts.length > 0;
  const totalTimes = chosenShifts.reduce((a, s) => a + s.count, 0);
  const titles = ['어떤 근무를 비울까요?', '사유와 전달사항', '이대로 요청할까요?'];

  const toggle = (id) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const submit = () => {
    app.createRequest({ shifts: chosenShifts, reason, memo });
    setDone(true);
    setStep(3);
  };

  return (
    <Sheet open={open} onClose={onClose} full>
      {step < 3 && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '2px 10px 0', height: 50, flexShrink: 0 }}>
          <button onClick={() => step === 0 ? onClose() : setStep(step - 1)} style={{ width: 44, height: 44, border: 'none', background: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 22 }}>
            <Icon name={step === 0 ? 'X' : 'ChevronLeft'} size={24} color={T.ink} />
          </button>
          <div style={{ flex: 1, display: 'flex', gap: 5, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: i === step ? 22 : 6, height: 6, borderRadius: 3, background: i <= step ? T.ink : T.line, transition: 'all .25s' }} />)}
          </div>
          <div style={{ width: 44 }} />
        </div>
      )}

      <div className="tm-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 24px 16px' }}>
        {step < 3 && <h2 style={{ margin: '6px 0 18px', fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: T.ink }}>{titles[step]}</h2>}

        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {myShifts.slice(0, 8).map(s => {
              const on = picked.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggle(s.id)} className="tm-press" style={{ ...rqS.option, borderColor: on ? T.ink : T.line,
                  boxShadow: on ? `inset 0 0 0 1px ${T.ink}` : 'none', background: on ? '#fafbfc' : '#fff' }}>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13.5, color: T.ink2, fontWeight: 620 }}>{tm2Label(s.date)}</div>
                    <div style={{ fontSize: 17.5, fontWeight: 760, color: T.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{s.start} – {s.end}</div>
                    <div style={{ fontSize: 13.5, color: T.ink3, marginTop: 2 }}>{s.program} · {s.count}{s.type === 'lesson' ? '교시' : '시간'}</div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${on ? T.ink : '#dde1e6'}`, background: on ? T.ink : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <Icon name="Check" size={14} stroke={3.2} color="#fff" />}
                  </div>
                </button>
              );
            })}
            {!myShifts.length && <Empty title="비울 수 있는 근무가 없어요" sub="앞으로 예정된 정규 근무가 있을 때 요청할 수 있어요." icon="CalendarX" />}
            <button onClick={() => setManual(!manual)} style={{ ...rqS.option, justifyContent: 'center', color: T.ink2, fontSize: 14.5, fontWeight: 650, borderStyle: 'dashed', background: 'transparent' }}>
              <Icon name="Plus" size={18} />목록에 없는 시간 직접 입력
            </button>
            {manual && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 8px' }}>
                <input type="date" value={md.date} onChange={e => setMd({ ...md, date: e.target.value })} style={inputStyle} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="time" value={md.start} onChange={e => setMd({ ...md, start: e.target.value })} style={inputStyle} />
                  <input type="time" value={md.end} onChange={e => setMd({ ...md, end: e.target.value })} style={inputStyle} />
                </div>
                <input value={md.program} onChange={e => setMd({ ...md, program: e.target.value })} placeholder="프로그램명 (예: 성인 수영교실)" style={inputStyle} />
                {pickedShifts.length > 0 && (
                  <div style={{ fontSize: 12.5, color: T.amberInk, background: T.amberSoft, borderRadius: 10, padding: '10px 12px', lineHeight: 1.5 }}>
                    위에서 근무를 선택했으므로 직접 입력은 사용되지 않아요.
                  </div>
                )}
              </div>
            )}
            {chosenShifts.length > 0 && (
              <div style={{ marginTop: 4, fontSize: 13, color: T.ink3, textAlign: 'center' }}>
                {chosenShifts.length}개 시간대 · {totalTimes}{chosenShifts[0].type === 'lesson' ? '교시' : '시간'} 선택됨
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <>
            <div style={rqS.label}>사유</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {RQ_REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)} className="tm-press" style={{ height: 44, padding: '0 17px', borderRadius: 22, fontFamily: 'inherit',
                  fontSize: 15, fontWeight: 650, cursor: 'pointer', border: `1px solid ${reason === r ? T.ink : T.line}`,
                  background: reason === r ? T.ink : '#fff', color: reason === r ? '#fff' : T.ink2 }}>{r}</button>
              ))}
            </div>
            <div style={{ ...rqS.label, marginTop: 28 }}>대체 강사에게 전할 말 <span style={{ color: T.ink3, fontWeight: 520 }}>(선택)</span></div>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="진도표 위치, 레인 배정, 주의할 회원 등"
              style={{ width: '100%', boxSizing: 'border-box', minHeight: 116, borderRadius: 14, border: `1px solid ${T.line}`, padding: 14,
                fontFamily: 'inherit', fontSize: 16, lineHeight: 1.55, color: T.ink, resize: 'none', outline: 'none', background: T.bg }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {RQ_MEMO.map(t => (
                <button key={t} onClick={() => setMemo(m => (m ? m + ' ' : '') + t + '.')} style={{ height: 34, padding: '0 12px', borderRadius: 9, border: 'none',
                  background: T.line2, color: T.ink2, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>+ {t}</button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Card style={{ background: T.bg, padding: 18 }}>
              {chosenShifts.map((s, i) => (
                <div key={s.id} style={{ paddingBottom: i < chosenShifts.length - 1 ? 14 : 0, marginBottom: i < chosenShifts.length - 1 ? 14 : 0,
                  borderBottom: i < chosenShifts.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                  <div style={{ fontSize: 13.5, color: T.ink2, fontWeight: 620 }}>{tm2Label(s.date)}</div>
                  <div style={{ fontSize: 21, fontWeight: 800, color: T.ink, letterSpacing: -0.5, marginTop: 1 }}>{s.start} – {s.end}</div>
                  <div style={{ fontSize: 14.5, color: T.ink, fontWeight: 620, marginTop: 2 }}>{s.program} · {s.count}{s.type === 'lesson' ? '교시' : '시간'}</div>
                </div>
              ))}
              <div style={{ height: 1, background: T.line, margin: '16px 0' }} />
              <div style={{ display: 'flex', fontSize: 14.5, marginBottom: 8 }}><span style={{ width: 62, color: T.ink3, fontWeight: 620 }}>사유</span><span style={{ color: T.ink, fontWeight: 650 }}>{reason}</span></div>
              <div style={{ display: 'flex', fontSize: 14.5 }}><span style={{ width: 62, color: T.ink3, fontWeight: 620, flexShrink: 0 }}>메모</span><span style={{ color: memo ? T.ink : T.ink3, lineHeight: 1.5 }}>{memo || '없음'}</span></div>
            </Card>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {[['Send', '같은 센터 강사 전원에게 알림이 가요'], ['Zap', '가장 먼저 지원한 강사로 바로 확정돼요'],
                ['Siren', '이틀 전까지 지원자가 없으면 관리자가 배정해요']].map(([ic, t]) => (
                <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'center', fontSize: 14.5, color: T.ink2 }}>
                  <Icon name={ic} size={18} color={T.ink3} />{t}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', paddingTop: 110 }}>
            <div className="tm-pop" style={{ width: 72, height: 72, borderRadius: 36, background: T.ink, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="Send" size={29} color="#fff" />
            </div>
            <h2 style={{ margin: '20px 0 6px', fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: T.ink }}>대직 요청을 보냈어요</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: T.ink2, lineHeight: 1.6 }}>지원자가 나타나면 바로 알려드릴게요.<br />‘대직 › 내 요청’에서 확인할 수 있어요.</p>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 24px 34px', flexShrink: 0 }}>
        {step === 0 && <Btn kind="dark" disabled={!canNext1} onClick={() => setStep(1)}>다음</Btn>}
        {step === 1 && <Btn kind="dark" disabled={!reason} onClick={() => setStep(2)}>다음</Btn>}
        {step === 2 && <Btn onClick={submit}>대직 요청 보내기</Btn>}
        {step === 3 && <Btn kind="secondary" onClick={onClose}>확인</Btn>}
      </div>
    </Sheet>
  );
}

const rqS = {
  option: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderRadius: 16, border: `1px solid ${T.line}`,
    background: '#fff', fontFamily: 'inherit', cursor: 'pointer', width: '100%', minHeight: 60 },
  label: { fontSize: 14.5, fontWeight: 720, color: T.ink, marginBottom: 10 },
};

Object.assign(window, { RequestSheet, rqS });
