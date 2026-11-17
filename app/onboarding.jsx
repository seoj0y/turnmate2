// Onboarding — 4단계 프로필 등록
const ONB_QUALS = ['생활스포츠지도사 2급(수영)', '생활스포츠지도사 1급', '수상인명구조요원(라이프가드)', '대한적십자사 수상구조사', '유아체육지도자 1급', '응급처치원 및 CPR'];
const ONB_PROGRAMS = ['어린이 소수정예', '성인 강습', '유아 수영', '아쿠아로빅', '안전근무'];
const ONB_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

function Onboarding({ app, onDone }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [pos, setPos] = React.useState('위촉강사');
  const [exp, setExp] = React.useState('2년차');
  const [quals, setQuals] = React.useState([]);
  const [programs, setPrograms] = React.useState([]);
  const [templates, setTemplates] = React.useState([]);
  const [tDraft, setTDraft] = React.useState({ day: '월', start: '16:00', end: '18:50', type: 'lesson', program: '어린이 소수정예' });
  const stepTitles = ['기본 정보', '자격증과 프로그램', '정규 시간표', '확인'];

  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const addTemplate = () => {
    const count = Math.max(1, Math.round((tm2Minutes(tDraft.end) - tm2Minutes(tDraft.start)) / 60));
    setTemplates([...templates, { ...tDraft, count }]);
  };
  const canNext = step === 0 ? name.trim().length > 1 && phone.length >= 9 : true;

  const finish = () => {
    app.completeOnboarding({ name });
    onDone();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 90, display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 54, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px 0', height: 46 }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} style={{ width: 44, height: 44, border: 'none', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="ChevronLeft" size={24} color={T.ink} /></button>
          ) : <div style={{ width: 44 }} />}
          <div style={{ flex: 1, display: 'flex', gap: 5, justifyContent: 'center' }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ width: i === step ? 22 : 6, height: 6, borderRadius: 3, background: i <= step ? T.ink : T.line, transition: 'all .25s' }} />)}
          </div>
          <div style={{ width: 44 }} />
        </div>
      </div>

      <div className="tm-noscroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 24px 24px' }}>
        {step === 0 && (
          <>
            <h1 style={{ margin: '8px 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: -0.7, color: T.ink, lineHeight: 1.28 }}>턴메이트에 오신 걸<br />환영해요</h1>
            <p style={{ margin: '0 0 24px', fontSize: 14.5, color: T.ink3, lineHeight: 1.55 }}>수영강사를 위한 대직·근무·급여 관리. 4단계면 끝나요.</p>
            <Field label="이름"><input value={name} onChange={e => setName(e.target.value)} placeholder="예: 이서정" style={inputStyle} /></Field>
            <Field label="연락처"><input value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d-]/g, ''))} placeholder="010-0000-0000" inputMode="tel" style={inputStyle} /></Field>
            <Field label="소속 센터"><input defaultValue="흑석체육센터 (동작구)" style={{ ...inputStyle, background: T.bg }} /></Field>
            <Field label="직급">
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {['위촉강사', '전임강사', '주임', '팀장'].map(p => <Chip key={p} on={pos === p} onClick={() => setPos(p)}>{p}</Chip>)}
              </div>
            </Field>
            <Field label="수영 강습 경력" hint="단가 산정 기준">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['1년차', '신입·초급', tm2LessonRate({ exp: '1년차' })], ['2년차', '중급', tm2LessonRate({ exp: '2년차' })], ['3년차', '경력 이상', tm2LessonRate({ exp: '3년차' })]].map(([l, s, r]) => (
                  <button key={l} onClick={() => setExp(l)} className="tm-press" style={{ ...rqS.option, borderColor: exp === l ? T.ink : T.line,
                    boxShadow: exp === l ? `inset 0 0 0 1px ${T.ink}` : 'none' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{l} <span style={{ fontSize: 12.5, color: T.ink3, fontWeight: 550 }}>{s}</span></div>
                      <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 2 }}>강습 1교시</div>
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 680, color: exp === l ? T.blueInk : T.ink3 }}>{won(r)}</span>
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <h1 style={{ margin: '8px 0 20px', fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: T.ink }}>보유 자격증과<br />가능한 프로그램</h1>
            <Field label="자격증" hint="여러 개 선택">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {ONB_QUALS.map(q => <Chip key={q} on={quals.includes(q)} onClick={() => toggle(quals, setQuals, q)}>{q}</Chip>)}
              </div>
            </Field>
            <Field label="지도 가능 / 선호 프로그램">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {ONB_PROGRAMS.map(p => <Chip key={p} on={programs.includes(p)} onClick={() => toggle(programs, setPrograms, p)}>{p}</Chip>)}
              </div>
            </Field>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: T.ink3, lineHeight: 1.55 }}>
              <Icon name="Info" size={14} style={{ marginTop: 2 }} />
              <span>자격증은 대직 공고의 자격 요건 확인에 쓰여요.</span>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ margin: '8px 0 6px', fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: T.ink }}>정규 시간표</h1>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: T.ink3, lineHeight: 1.5 }}>매주 반복되는 근무를 등록하면 근무표가 자동으로 만들어져요.</p>
            {templates.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px', borderRadius: 13, background: T.bg, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{t.day} {t.start} – {t.end}</div>
                  <div style={{ fontSize: 12.5, color: T.ink3, marginTop: 2 }}>{t.program} · {t.count}{t.type === 'lesson' ? '교시' : '시간'}</div>
                </div>
                <button onClick={() => setTemplates(templates.filter((_, n) => n !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                  <Icon name="X" size={17} color={T.ink3} /></button>
              </div>
            ))}
            <Card style={{ background: T.bg, padding: 16, marginTop: 6 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {ONB_DAYS.map(d => <Chip key={d} on={tDraft.day === d} onClick={() => setTDraft({ ...tDraft, day: d })} style={{ height: 34, padding: '0 13px', fontSize: 13 }}>{d}</Chip>)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input type="time" value={tDraft.start} onChange={e => setTDraft({ ...tDraft, start: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                <input type="time" value={tDraft.end} onChange={e => setTDraft({ ...tDraft, end: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ONB_PROGRAMS.map(p => <Chip key={p} on={tDraft.program === p} onClick={() => setTDraft({ ...tDraft, program: p, type: p === '안전근무' ? 'lifeguard' : 'lesson' })} style={{ height: 34, padding: '0 13px', fontSize: 13 }}>{p}</Chip>)}
              </div>
              <Btn kind="dark" size="sm" icon="Plus" onClick={addTemplate} style={{ marginTop: 12, background: '#fff', color: T.ink, border: `1px solid ${T.line}` }}>시간표에 추가</Btn>
            </Card>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ margin: '8px 0 18px', fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: T.ink }}>이대로 등록할까요?</h1>
            <Card style={{ background: T.bg }}>
              {[['이름', name || '–'], ['연락처', phone || '–'], ['직급', pos], ['경력', exp],
                ['자격증', quals.length ? quals.length + '개' : '없음'], ['프로그램', programs.join(', ') || '–'],
                ['정규 시간표', templates.length ? templates.map(t => `${t.day} ${t.start}`).join(', ') : '미등록']].map(([k, v], n, a) => (
                <div key={k} style={{ display: 'flex', padding: '11px 0', borderTop: n ? `1px solid ${T.line}` : 'none', fontSize: 14 }}>
                  <span style={{ width: 82, color: T.ink3, fontWeight: 620, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: T.ink, fontWeight: 650, flex: 1 }}>{v}</span>
                </div>
              ))}
            </Card>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: T.ink3, lineHeight: 1.55 }}>
              <Icon name="Info" size={14} style={{ marginTop: 2 }} />
              <span>등록하면 10월 근무표와 급여가 자동으로 산출돼요.</span>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '10px 24px 34px', flexShrink: 0 }}>
        {step < 3
          ? <Btn kind="dark" disabled={!canNext} onClick={() => setStep(step + 1)}>다음</Btn>
          : <Btn onClick={finish}>등록 완료하고 시작하기</Btn>}
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding });
