// Geofence — 센터 반경 진입 감지 (GPS watchPosition + 데모 시뮬레이션)
// 좌표는 데모용 예시값입니다. 설정에서 실제 센터 좌표로 바꿀 수 있어요.
const TM_CENTER = { lat: 37.50445, lng: 126.96290, label: '흑석체육센터' };

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function useGeofence({ center = TM_CENTER, radius = 200, enabled = false, onEnter }) {
  const [status, setStatus] = React.useState('off'); // off | requesting | watching | denied | unsupported | error | timeout
  const [coords, setCoords] = React.useState(null);
  const [simM, setSimM] = React.useState(null);
  const insideRef = React.useRef(false);
  const onEnterRef = React.useRef(onEnter);
  onEnterRef.current = onEnter;
  const simOn = simM !== null;

  // 실제 GPS 감시
  React.useEffect(() => {
    if (!enabled || simOn) return;
    if (!navigator.geolocation) { setStatus('unsupported'); return; }
    setStatus('requesting');

    // 권한 창이 뜨지 않고 멈춘 경우를 위해 8초 후 안내 상태로 전환
    const guard = setTimeout(() => setStatus((s) => (s === 'requesting' ? 'timeout' : s)), 8000);

    const id = navigator.geolocation.watchPosition(
      (p) => {
        clearTimeout(guard);
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy || 0) });
        setStatus('watching');
      },
      (e) => { clearTimeout(guard); setStatus(e.code === 1 ? 'denied' : 'error'); },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 },
    );
    return () => { clearTimeout(guard); navigator.geolocation.clearWatch(id); };
  }, [enabled, simOn]);

  // 데모: 900m에서 접근하는 경로를 흉내
  React.useEffect(() => {
    if (!simOn) return;
    const t = setInterval(() => setSimM((m) => (m === null ? null : Math.max(0, m - 75))), 460);
    return () => clearInterval(t);
  }, [simOn]);

  // 꺼지면 초기화
  React.useEffect(() => {
    if (!enabled) { setSimM(null); setCoords(null); setStatus('off'); insideRef.current = false; }
  }, [enabled]);

  const dist = simM !== null ? simM : coords ? Math.round(haversineMeters(center, coords)) : null;
  const inside = dist != null && dist <= radius;

  // 진입 1회만 알림 (나가면 재무장, 경계 흔들림은 히스테리시스로 방지)
  React.useEffect(() => {
    if (dist == null) return;
    if (inside && !insideRef.current) {
      insideRef.current = true;
      onEnterRef.current && onEnterRef.current(dist);
    } else if (!inside && dist > radius * 1.3) {
      insideRef.current = false;
    }
  }, [dist, inside, radius]);

  return {
    status: simOn ? 'sim' : status,
    dist, inside, radius, center,
    accuracy: simOn ? 8 : coords ? coords.accuracy : null,
    source: simOn ? 'sim' : 'gps',
    startSim: () => { setSimM(900); },
    stopSim: () => { setSimM(null); insideRef.current = false; },
  };
}

// ---------- 도착 알림 카드 ----------
function GeoCard({ geo, enabled, onToggle, onCheckin, checkedIn }) {
  const { status, dist, inside } = geo;
  const radio = geo.radius;

  const statusLine = (() => {
    if (!enabled) return '꺼짐 · 켜면 센터 근처에서 알려드려요';
    if (status === 'requesting') return '위치 권한을 기다리는 중…';
    if (status === 'timeout') return '위치를 확인하지 못했어요 · 데모로 확인해 보세요';
    if (status === 'denied') return '브라우저 위치 권한이 차단됐어요 · 데모로 확인';
    if (status === 'unsupported') return '이 환경은 위치를 지원하지 않아요 · 데모로 확인';
    if (status === 'error') return '위치를 가져오지 못했어요 · 데모로 확인';
    if (status === 'sim') return inside ? '데모 · 반경 안에 들어왔어요' : '데모 · 접근 중';
    if (inside) return `반경 ${radio}m 안에 있어요`;
    if (dist != null) return `센터까지 ${dist >= 1000 ? (dist / 1000).toFixed(1) + 'km' : dist + 'm'}`;
    return '위치 확인 중…';
  })();

  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: inside ? T.greenSoft : enabled ? T.blueSoft : T.line2 }}>
          <Icon name={inside ? 'MapPinCheck' : 'Navigation'} size={18} color={inside ? T.green : enabled ? T.blue : T.ink3} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 720, color: T.ink }}>센터 도착 알림</div>
          <div style={{ fontSize: 12.5, marginTop: 2, color: inside ? T.green : T.ink3, fontWeight: inside ? 680 : 550 }}>{statusLine}</div>
        </div>
        <Toggle on={enabled} onChange={onToggle} />
      </div>

      {enabled && (
        <div style={{ marginTop: 14 }}>
          {dist != null && (status === 'watching' || status === 'sim') && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.9, color: inside ? T.green : T.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {dist >= 1000 ? (dist / 1000).toFixed(1) + 'km' : dist + 'm'}
              </div>
              <div style={{ fontSize: 12, color: T.ink3, fontWeight: 620, paddingBottom: 3 }}>
                반경 {radio}m · {status === 'sim' ? '데모' : `정확도 ±${geo.accuracy || 0}m`}
              </div>
            </div>
          )}
          {(status === 'watching' || status === 'sim') && (
            <div style={{ marginBottom: 12 }}><Progress value={Math.min(dist, radio * 3)} max={radio * 3} tone={inside ? T.green : T.blue} /></div>
          )}

          {inside && !checkedIn && <Btn size="sm" icon="MapPin" onClick={onCheckin} style={{ marginBottom: 8 }}>도착 인증하고 출근하기</Btn>}
          {inside && checkedIn && (
            <div style={{ fontSize: 12.5, color: T.green, fontWeight: 680, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="Check" size={14} stroke={3} />오늘 출근이 이미 기록됐어요
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: T.ink3 }}>탭이 열려 있을 때만 감지돼요</span>
            {status === 'sim'
              ? <button onClick={geo.stopSim} style={geoS.link}>데모 중지</button>
              : <button onClick={geo.startSim} style={{ ...geoS.link, fontWeight: 750 }}>데모로 확인 →</button>}
          </div>
        </div>
      )}
    </Card>
  );
}

const geoS = {
  link: { border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: T.blue, cursor: 'pointer', padding: '2px 0' },
};

// 위치 권한 + 시스템 알림 권한 요청 (사용자 클릭 안에서만 호출)
async function tmRequestLocationNotif() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  } catch (e) { /* 무시 */ }
}

function tmPushNotification(title, body) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, tag: 'tm-geofence' });
    }
  } catch (e) { /* 일부 브라우저는 SW 없이 알림 불가 */ }
}

// ---------- 도착 시 뜨는 알림 시트 ----------
function ArriveSheet({ open, onClose, app, geo, onCheckin }) {
  const rec = app.attendance(app.me);
  // 알림이 발생한 시점의 거리를 고정 (시트가 열린 뒤 거리가 계속 바뀌지 않도록)
  const [firedAt, setFiredAt] = React.useState(null);
  React.useEffect(() => { if (open) setFiredAt(geo && geo.dist != null ? geo.dist : null); }, [open]);
  const distShown = firedAt != null ? firedAt : geo.dist;
  const shifts = app.state.schedules.filter(s => s.uid === app.me && s.date === TM2_TODAY).sort((a, b) => a.start.localeCompare(b.start));
  const first = shifts[0];
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '10px 24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ width: 26, height: 26, borderRadius: 13, background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="MapPinCheck" size={15} color={T.green} />
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 720, color: T.green }}>센터 도착</span>
        </div>
        <h2 style={{ margin: '10px 0 0', fontSize: 24, fontWeight: 800, letterSpacing: -0.6, color: T.ink, lineHeight: 1.3 }}>
          흑석체육센터에<br />도착했어요
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: T.ink2, lineHeight: 1.55 }}>
          {first ? `${first.start} ${first.program} 수업이 있어요.` : '오늘 배정된 근무가 있어요.'} 지금 출근을 기록할까요?
        </p>

        {/* 반경 시각화 */}
        <div style={{ margin: '22px 0', height: 150, borderRadius: 18, background: T.bg, position: 'relative', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {[130, 96, 62].map((s, i) => (
            <div key={s} style={{ position: 'absolute', width: s, height: s, borderRadius: s / 2,
              border: `1px ${i === 2 ? 'solid' : 'dashed'} ${i === 2 ? T.green : '#dfe4e9'}`,
              background: i === 2 ? 'oklch(0.96 0.03 158 / .6)' : 'transparent' }} />
          ))}
          <div style={{ position: 'absolute', width: 9, height: 9, borderRadius: 5, background: T.green, top: 58, left: '55%' }} />
          <div style={{ position: 'absolute', bottom: 14, fontSize: 11.5, color: T.ink3, fontWeight: 620 }}>
            반경 {geo.radius}m · 도착 시점 {distShown != null ? distShown + 'm' : '—'}
          </div>
        </div>

        {rec ? (
          <>
            <div style={{ fontSize: 13.5, color: T.green, fontWeight: 680, marginBottom: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
              <Icon name="Check" size={15} stroke={3} />이미 {rec.in}에 출근 처리됐어요
            </div>
            <Btn kind="secondary" onClick={onClose}>닫기</Btn>
          </>
        ) : (
          <>
            <Btn icon="LogIn" onClick={() => { app.clockIn(geo.source === 'sim' ? 'gps' : 'gps'); onClose(); }}>출근 기록하기</Btn>
            <button onClick={onClose} style={{ width: '100%', height: 44, marginTop: 6, border: 'none', background: 'none', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 620, color: T.ink3, cursor: 'pointer' }}>나중에 할게요</button>
          </>
        )}
      </div>
    </Sheet>
  );
}

Object.assign(window, { TM_CENTER, haversineMeters, useGeofence, GeoCard, geoS, tmRequestLocationNotif, tmPushNotification, ArriveSheet });
