// TurnMate v3 — state store (rates by experience, weekend guard, per-user attendance)
const TM2_TODAY = '2026-10-06';
const TM2_MONTH = '2026-10';

// 지급 단가 기본값 (설정에서 변경 가능)
const TM2_RATES_DEFAULT = { lesson1: 26000, lesson2: 27000, lesson3: 28000, guard: 17000, guardWeekend: 18000 };

// 설정을 모듈 전역에 반영해 두면 tm2Pay/tm2Salary 호출부에서 매번 넘기지 않아도 됩니다.
let TM2_RATES = { ...TM2_RATES_DEFAULT };

const TM2_USERS = [
  { id: 'u1', name: '이서정', pos: '위촉강사', exp: '3년차', phone: '010-3841-9284',
    quals: ['생활스포츠지도사 2급(수영)', '수상인명구조요원(대한적십자사)'], programs: ['어린이 소수정예', '성인 강습', '안전근무'],
    regular: '월·수 16:00~18:50', target: 14, avatar: '서정' },
  { id: 'u2', name: '이동진', pos: '위촉강사', exp: '2년차', phone: '010-8291-1029',
    quals: ['생활스포츠지도사 2급(수영)', '수상인명구조요원(대한수영연맹)'], programs: ['어린이 수영', '성인 강습', '안전근무'],
    regular: '화·목 09:00~12:00', target: 14, avatar: '동진' },
  { id: 'u3', name: '최지원', pos: '위촉강사', exp: '1년차', phone: '010-5521-7734',
    quals: ['생활스포츠지도사 2급(수영)'], programs: ['성인 건강수영', '아쿠아로빅'],
    regular: '화·목 10:00~12:50', target: 14, avatar: '지원' },
  { id: 'u4', name: '김민준', pos: '전임강사', exp: '5년차', phone: '010-2213-8890',
    quals: ['생활스포츠지도사 1급', '수상인명구조요원'], programs: ['토요 어린이', '안전근무'],
    regular: '화~토 06:00~09:50', target: 22, avatar: '민준' },
  { id: 'u5', name: '이상재', pos: '주임', exp: '8년차', phone: '010-7210-4491', admin: true,
    quals: ['생활스포츠지도사 1급', '체육시설관리사'], programs: ['대직 승인', '근무표 관리'],
    regular: '화·수·금 16:00~16:50', target: 8, avatar: '상재' },
];

const TM2_SCHEDULES = [
  { id: 's1', uid: 'u1', date: '2026-10-05', start: '16:00', end: '18:50', program: '어린이 소수정예', type: 'lesson', target: '어린이', level: '중급', count: 3, status: 'done' },
  { id: 's2', uid: 'u1', date: '2026-10-06', start: '10:00', end: '11:50', program: '성인 아쿠아로빅 · 기초수영', type: 'lesson', target: '성인', level: '초급', count: 2, status: 'sub_assigned', subFor: '최지원' },
  { id: 's3', uid: 'u1', date: '2026-10-06', start: '19:00', end: '19:50', program: '저녁 자유수영', type: 'lifeguard', target: '전체', level: '-', count: 1, status: 'regular' },
  { id: 's4', uid: 'u1', date: '2026-10-07', start: '16:00', end: '18:50', program: '어린이 소수정예', type: 'lesson', target: '어린이', level: '중급', count: 3, status: 'sub_requested', reqId: 'r5' },
  { id: 's5', uid: 'u1', date: '2026-10-09', start: '13:00', end: '16:00', program: '자유수영 안전근무', type: 'lifeguard', target: '전체', level: '-', count: 3, status: 'regular' },
  { id: 's6', uid: 'u1', date: '2026-10-10', start: '09:00', end: '10:50', program: '토요 자유수영 안전근무', type: 'lifeguard', target: '전체', level: '-', count: 2, status: 'regular' },
  { id: 's7', uid: 'u1', date: '2026-10-12', start: '16:00', end: '18:50', program: '어린이 소수정예', type: 'lesson', target: '어린이', level: '중급', count: 3, status: 'regular' },
  { id: 's8', uid: 'u1', date: '2026-10-14', start: '16:00', end: '18:50', program: '어린이 소수정예', type: 'lesson', target: '어린이', level: '중급', count: 3, status: 'regular' },
  { id: 's9', uid: 'u1', date: '2026-10-19', start: '16:00', end: '18:50', program: '어린이 소수정예', type: 'lesson', target: '어린이', level: '중급', count: 3, status: 'regular' },
  { id: 's10', uid: 'u1', date: '2026-10-21', start: '16:00', end: '18:50', program: '어린이 소수정예', type: 'lesson', target: '어린이', level: '중급', count: 3, status: 'regular' },
  { id: 's11', uid: 'u2', date: '2026-10-06', start: '09:00', end: '12:00', program: '어린이 수영 기초', type: 'lesson', target: '어린이', level: '초급', count: 3, status: 'regular' },
  { id: 's12', uid: 'u2', date: '2026-10-08', start: '09:00', end: '12:00', program: '어린이 수영 기초', type: 'lesson', target: '어린이', level: '초급', count: 3, status: 'regular' },
  { id: 's13', uid: 'u2', date: '2026-10-13', start: '09:00', end: '12:00', program: '어린이 수영 기초', type: 'lesson', target: '어린이', level: '초급', count: 3, status: 'regular' },
  { id: 's14', uid: 'u3', date: '2026-10-06', start: '10:00', end: '11:50', program: '성인 아쿠아로빅 · 기초수영', type: 'lesson', target: '성인', level: '초급', count: 2, status: 'sub_requested', reqId: 'r1' },
  { id: 's15', uid: 'u3', date: '2026-10-08', start: '10:00', end: '11:50', program: '성인 건강수영', type: 'lesson', target: '성인', level: '중급', count: 2, status: 'regular' },
  { id: 's16', uid: 'u3', date: '2026-10-10', start: '09:00', end: '11:50', program: '토요 어린이 기초수영', type: 'lesson', target: '어린이', level: '초급', count: 3, status: 'sub_requested', reqId: 'r3' },
  { id: 's17', uid: 'u4', date: '2026-10-09', start: '14:00', end: '17:00', program: '주말 대비 자유수영', type: 'lifeguard', target: '전체', level: '-', count: 3, status: 'sub_requested', reqId: 'r2' },
  { id: 's18', uid: 'u4', date: '2026-10-06', start: '06:00', end: '09:50', program: '새벽 수영', type: 'lesson', target: '성인', level: '중급', count: 4, status: 'done' },
  { id: 's19', uid: 'u4', date: '2026-10-10', start: '09:00', end: '11:50', program: '토요 어린이 수영', type: 'lesson', target: '어린이', level: '초급', count: 3, status: 'regular' },
  { id: 's20', uid: 'u5', date: '2026-10-14', start: '16:00', end: '16:50', program: '성인 수영교실', type: 'lesson', target: '성인', level: '중급', count: 1, status: 'sub_requested', reqId: 'r4' },
];

const TM2_REQUESTS = [
  { id: 'r1', by: 'u3', date: '2026-10-06', start: '10:00', end: '11:50', program: '성인 아쿠아로빅 · 기초수영', type: 'lesson', target: '성인', level: '초급', count: 2,
    reason: '자녀 학교 행사', memo: '아쿠아로빅 음원은 강사실 3번 USB에 있어요.', status: 'confirmed', sub: 'u1', subName: '이서정', createdAt: '10/5 09:12' },
  { id: 'r2', by: 'u4', date: '2026-10-09', start: '14:00', end: '17:00', program: '주말 대비 자유수영 안전근무', type: 'lifeguard', target: '전체', level: '-', count: 3,
    reason: '가족 경조사', memo: '의무실 구급함·AED 점검일지 작성 부탁드립니다.', status: 'recruiting', createdAt: '10/5 11:40' },
  { id: 'r3', by: 'u3', date: '2026-10-10', start: '09:00', end: '11:50', program: '토요 어린이 기초수영 3개 반', type: 'lesson', target: '어린이', level: '초급', count: 3,
    reason: '구 수영대회 심판 차출', memo: '7~9세 입문반, 물 적응 위주로 지도해 주세요.', status: 'recruiting', createdAt: '10/5 15:20' },
  { id: 'r4', by: 'u5', date: '2026-10-14', start: '16:00', end: '16:50', program: '성인 수영교실', type: 'lesson', target: '성인', level: '중급', count: 1,
    reason: '개인 사정', memo: '', status: 'recruiting', createdAt: '10/5 17:05' },
  { id: 'r5', by: 'u1', date: '2026-10-07', start: '16:00', end: '18:50', program: '어린이 소수정예', type: 'lesson', target: '어린이', level: '중급', count: 3,
    reason: '병원 진료 · 자격 연수', memo: '유아풀 2레인, 진도표는 강사실 책상 위에 있어요.', status: 'recruiting', createdAt: '10/3 20:11' },
  { id: 'r6', by: 'u2', date: '2026-09-28', start: '09:00', end: '12:00', program: '어린이 수영 기초', type: 'lesson', target: '어린이', level: '초급', count: 3,
    reason: '개인 사정', memo: '', status: 'completed', sub: 'u1', subName: '이서정', createdAt: '9/25 13:00' },
];

const TM2_STATE = {
  schedules: TM2_SCHEDULES,
  requests: TM2_REQUESTS,
  // 강사별 · 날짜별 출퇴근 (uid_date 키)
  attendance: {
    'u1_2026-10-05': { uid: 'u1', date: '2026-10-05', in: '15:48', out: '18:55', method: 'gps' },
    'u2_2026-10-06': { uid: 'u2', date: '2026-10-06', in: '08:52', out: '', method: 'gps' },
  },
  adjust: {},
  settled: {},
  settings: { ...TM2_RATES_DEFAULT, threshold: 14, alerts: true, radius: 200, geo: false },
  onboarded: true,
};

// ---------- helpers ----------
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const tm2Date = (d) => new Date(d + 'T00:00:00');
const tm2Dow = (d) => DOW[tm2Date(d).getDay()];
const tm2IsWeekend = (d) => [0, 6].includes(tm2Date(d).getDay());
const tm2Label = (d) => `${tm2Date(d).getMonth() + 1}월 ${tm2Date(d).getDate()}일 (${tm2Dow(d)})`;
const tm2Short = (d) => `${tm2Date(d).getMonth() + 1}/${tm2Date(d).getDate()}`;
const tm2Dday = (d) => Math.round((tm2Date(d) - tm2Date(TM2_TODAY)) / 86400000);
const tm2Minutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

// 경력 → 단가 등급 (1년차 / 2년차 / 3년차 이상)
const tm2Tier = (exp) => {
  const n = parseInt(String(exp || '2'), 10);
  if (!Number.isFinite(n) || n <= 1) return 1;
  if (n === 2) return 2;
  return 3;
};
const tm2LessonRate = (user) => {
  const t = tm2Tier(user && user.exp);
  return t === 1 ? TM2_RATES.lesson1 : t === 2 ? TM2_RATES.lesson2 : TM2_RATES.lesson3;
};
const tm2GuardRate = (dateStr) => (tm2IsWeekend(dateStr) ? TM2_RATES.guardWeekend : TM2_RATES.guard);

// 수당 계산: 강습 = 경력단가 × 교시 / 안전근무 = 시간당(주말 별도) × 시간
function tm2Pay(sc, user) {
  return sc.type === 'lesson'
    ? tm2LessonRate(user) * sc.count
    : tm2GuardRate(sc.date) * sc.count;
}
const tm2UnitRate = (sc, user) => (sc.type === 'lesson' ? tm2LessonRate(user) : tm2GuardRate(sc.date));

function tm2Salary(state, uid, month = TM2_MONTH) {
  const user = TM2_USERS.find(u => u.id === uid);
  const items = state.schedules
    .filter(s => s.uid === uid && s.date.startsWith(month) && tm2Active(s))
    .sort((a, b) => a.date.localeCompare(b.date));
  const b = { regL: 0, regG: 0, subL: 0, subG: 0, regLt: 0, regGt: 0, subLt: 0, subGt: 0, regGtW: 0, subGtW: 0 };
  const detail = items.filter(s => s.status !== 'sub_out').map(s => {
    const amt = tm2Pay(s, user);
    const isSub = s.status === 'sub_assigned' || s.status === 'sub_done';
    const key = (isSub ? 'sub' : 'reg') + (s.type === 'lesson' ? 'L' : 'G');
    b[key] += amt;
    b[key + 't'] += s.count;
    if (s.type === 'lifeguard' && tm2IsWeekend(s.date)) b[(isSub ? 'sub' : 'reg') + 'GtW'] += s.count;
    return { ...s, amt, isSub, rate: tm2UnitRate(s, user) };
  });
  const adjust = state.adjust[uid + '_' + month]?.amount || 0;
  const adjReason = state.adjust[uid + '_' + month]?.reason || '';
  const gross = b.regL + b.regG + b.subL + b.subG + adjust;
  const tax = Math.round(gross * 0.033);
  return { ...b, adjust, adjReason, gross, tax, net: gross - tax, detail, settled: !!state.settled[month],
    weekend: items.filter(s => s.type === 'lifeguard' && tm2IsWeekend(s.date)).length };
}

// 대직 확정 공통 처리 — 원 담당 근무는 '나감', 대체 강사에게는 새 근무 생성
function tm2AssignSubstitute(schedules, req, subUid, subName) {
  const requesterName = (TM2_USERS.find(u => u.id === req.by) || {}).name || '원 담당';
  const already = schedules.some(s => s.uid === subUid && s.reqId === req.id);
  const updated = schedules.map(sc => {
    if (sc.reqId === req.id && sc.uid === req.by) {
      return { ...sc, status: 'sub_out', subFor: subName, reqId: req.id };
    }
    if (sc.reqId === req.id && sc.uid === subUid) {
      return { ...sc, status: 'sub_assigned', subFor: requesterName };
    }
    return sc;
  });
  if (already || !schedules.some(sc => sc.reqId === req.id && sc.uid === req.by)) return updated;
  return [...updated, {
    id: 'sub_' + req.id, uid: subUid, date: req.date, start: req.start, end: req.end, program: req.program,
    type: req.type, target: req.target, level: req.level, count: req.count, status: 'sub_assigned',
    subFor: requesterName, reqId: req.id,
  }];
}

function tm2WeeklyHours(state, uid) {
  return state.schedules
    .filter(s => s.uid === uid && tm2Active(s) && tm2Dday(s.date) >= 0 && tm2Dday(s.date) <= 6)
    .reduce((a, s) => a + s.count, 0);
}

function tm2Csv(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 400);
  return filename;
}

const tm2AttKey = (uid, date) => `${uid}_${date}`;
const tm2AttOf = (state, uid, date = TM2_TODAY) => state.attendance[tm2AttKey(uid, date)] || null;
// 실제로 근무하는 일정인지 (취소 · 대직 나감 제외)
const tm2Active = (s) => s.status !== 'canceled' && s.status !== 'sub_out';

// ---------- store hook ----------
function useTurnMate() {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem('tm3_state');
      if (raw) {
        const p = JSON.parse(raw);
        return { ...TM2_STATE, ...p, settings: { ...TM2_STATE.settings, ...(p.settings || {}) } };
      }
    } catch (e) {}
    return TM2_STATE;
  });
  const [me, setMe] = React.useState(() => localStorage.getItem('tm3_me') || 'u1');
  const [toast, setToast] = React.useState(null);
  const timer = React.useRef(null);

  // 렌더 전에 최신 단가를 전역에 반영 (자식 컴포넌트의 tm2Pay 호출에 사용)
  TM2_RATES = { ...TM2_RATES_DEFAULT, ...state.settings };

  React.useEffect(() => { localStorage.setItem('tm3_state', JSON.stringify(state)); }, [state]);
  React.useEffect(() => { localStorage.setItem('tm3_me', me); }, [me]);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const notify = (msg) => { setToast({ msg, key: Date.now() }); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 2800); };
  const setSetting = (k, v) => setState(s => ({ ...s, settings: { ...s.settings, [k]: v } }));

  const nowTime = () => { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`; };

  const api = {
    state, me, setMe, users: TM2_USERS, today: TM2_TODAY,
    myUser: TM2_USERS.find(u => u.id === me),
    notify, toast,
    attendance: (uid = me, date = TM2_TODAY) => tm2AttOf(state, uid, date),
    attendanceFor: (uid, date) => tm2AttOf(state, uid, date),

    clockIn(method = 'gps', date = TM2_TODAY) {
      const t = nowTime();
      const key = tm2AttKey(me, date);
      setState(s => ({ ...s, attendance: { ...s.attendance, [key]: { uid: me, date, in: t, out: '', method } } }));
      notify(method === 'gps' ? `출근을 기록했어요 · ${t}` : `수동 출근 처리 · ${t}`);
      return t;
    },
    clockOut(date = TM2_TODAY) {
      const key = tm2AttKey(me, date);
      const rec = state.attendance[key];
      if (!rec) return;
      const t = nowTime();
      setState(s => ({ ...s, attendance: { ...s.attendance, [key]: { ...rec, out: t } } }));
      notify(`퇴근 완료 · ${t}`);
    },

    createRequest({ shifts, reason, memo }) {
      const id = 'r' + (Date.now() % 100000);
      const first = shifts[0];
      const req = {
        id, by: me, date: first.date, start: first.start, end: first.end, program: first.program,
        type: first.type, target: first.target, level: first.level, count: shifts.reduce((a, s) => a + s.count, 0),
        reason, memo, status: 'recruiting',
        createdAt: new Date().toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        multi: shifts.length > 1 ? shifts.map(s => ({ date: s.date, start: s.start, end: s.end })) : undefined,
      };
      setState(s => ({
        ...s,
        requests: [req, ...s.requests],
        schedules: s.schedules.map(sc => shifts.some(x => x.id === sc.id) ? { ...sc, status: 'sub_requested', reqId: id } : sc),
      }));
      return id;
    },
    cancelRequest(id) {
      const r0 = state.requests.find(r => r.id === id);
      setState(s => ({
        ...s,
        requests: s.requests.map(r => r.id === id ? { ...r, status: 'canceled' } : r),
        schedules: s.schedules.map(sc => sc.reqId === id
          ? { ...sc, status: sc.uid === r0.by ? 'regular' : 'canceled', reqId: undefined, subFor: undefined }
          : sc),
      }));
      notify('요청을 취소하고 원래 근무로 되돌렸어요');
    },

    apply(id) {
      const req = state.requests.find(r => r.id === id);
      if (!req) return;
      if (req.by === me) { notify('본인이 올린 대직에는 지원할 수 없어요'); return; }
      const user = TM2_USERS.find(u => u.id === me);
      const conflict = state.schedules.some(s => s.uid === me && s.date === req.date && tm2Active(s) &&
        tm2Minutes(s.start) < tm2Minutes(req.end) && tm2Minutes(req.start) < tm2Minutes(s.end));
      if (conflict) { notify('같은 시간에 이미 근무가 있어요'); return; }
      setState(s => ({
        ...s,
        requests: s.requests.map(r => r.id === id ? { ...r, status: 'confirmed', sub: me, subName: user.name } : r),
        schedules: tm2AssignSubstitute(s.schedules, req, me, user.name),
      }));
    },

    adminAssign(id, uid) {
      const user = TM2_USERS.find(u => u.id === uid);
      const req = state.requests.find(r => r.id === id);
      setState(s => ({
        ...s,
        requests: s.requests.map(r => r.id === id ? { ...r, status: 'confirmed', sub: uid, subName: user.name, adminAssigned: true } : r),
        schedules: tm2AssignSubstitute(s.schedules, req, uid, user.name),
      }));
      notify(`${user.name} 강사로 배정하고 두 강사에게 알림을 보냈어요`);
    },
    broadcast() { notify('전체 강사 5명에게 긴급 알림을 보냈어요'); },

    saveSettings(patch) { setState(s => ({ ...s, settings: { ...s.settings, ...patch } })); notify('설정을 저장했어요'); },
    setSetting,
    adjustSalary(uid, amount, reason) {
      setState(s => ({ ...s, adjust: { ...s.adjust, [uid + '_' + TM2_MONTH]: { amount: Number(amount) || 0, reason } } }));
      notify('조정 금액과 사유를 저장했어요');
    },
    settleMonth() { setState(s => ({ ...s, settled: { ...s.settled, [TM2_MONTH]: true } })); notify('10월 정산을 확정했어요'); },
    completeOnboarding(profile) { setState(s => ({ ...s, onboarded: true })); notify(`${profile.name} 강사님, 프로필 등록을 마쳤어요`); },
    resetOnboarding() { setState(s => ({ ...s, onboarded: false })); },
    resetAll() {
      localStorage.removeItem('tm3_state');
      setState({ ...TM2_STATE });
      notify('데모 데이터를 처음 상태로 되돌렸어요');
    },
  };
  return api;
}

Object.assign(window, {
  TM2_TODAY, TM2_MONTH, TM2_USERS, TM2_RATES_DEFAULT, tm2Date, tm2Dow, tm2IsWeekend, tm2Label, tm2Short, tm2Dday,
  tm2Minutes, tm2Pay, tm2UnitRate, tm2LessonRate, tm2GuardRate, tm2Tier, tm2Salary, tm2WeeklyHours, tm2Csv,
  tm2AttKey, tm2AttOf, tm2Active, tm2AssignSubstitute, useTurnMate,
});
