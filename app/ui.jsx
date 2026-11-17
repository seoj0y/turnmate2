// TurnMate v2 — UI primitives & tokens
const T = {
  ink: '#121a23', ink2: '#45505c', ink3: '#818b96',
  line: '#e5e8ec', line2: '#f1f3f5', bg: '#f4f6f8', card: '#fff',
  blue: 'oklch(0.53 0.15 248)', blueSoft: 'oklch(0.955 0.028 248)', blueInk: 'oklch(0.40 0.13 252)',
  amber: 'oklch(0.71 0.14 65)', amberSoft: 'oklch(0.965 0.045 78)', amberInk: 'oklch(0.46 0.11 58)',
  red: 'oklch(0.60 0.19 25)', redSoft: 'oklch(0.96 0.032 25)',
  green: 'oklch(0.56 0.12 158)', greenSoft: 'oklch(0.96 0.03 158)',
};

function Icon({ name, size = 20, stroke = 2, color = 'currentColor', style }) {
  const lib = window.lucide && window.lucide.icons;
  let node = lib && lib[name];
  if (!node) return <span style={{ width: size, height: size, display: 'inline-block', ...style }} />;
  if (node[0] === 'svg') node = node[2];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'block', ...style }}>
      {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

const toneMap = {
  neutral: { bg: T.line2, fg: T.ink2 },
  blue: { bg: T.blueSoft, fg: T.blueInk },
  amber: { bg: T.amberSoft, fg: T.amberInk },
  red: { bg: T.redSoft, fg: T.red },
  green: { bg: T.greenSoft, fg: T.green },
};
function Tag({ tone = 'neutral', children, style }) {
  const t = toneMap[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 6,
    background: t.bg, color: t.fg, fontSize: 12.5, fontWeight: 650, whiteSpace: 'nowrap', letterSpacing: -0.1, ...style }}>{children}</span>;
}

function Btn({ kind = 'primary', children, onClick, style, disabled, icon, size = 'md' }) {
  const kinds = {
    primary: { background: T.blue, color: '#fff' },
    dark: { background: T.ink, color: '#fff' },
    secondary: { background: T.line2, color: T.ink },
    outline: { background: '#fff', color: T.ink, border: `1px solid ${T.line}` },
    ghost: { background: 'transparent', color: T.blue },
    red: { background: T.red, color: '#fff' },
    green: { background: T.green, color: '#fff' },
  };
  const h = size === 'sm' ? 40 : size === 'lg' ? 54 : 52;
  return (
    <button onClick={disabled ? undefined : onClick} className={disabled ? '' : 'tm-press'} style={{
      height: h, borderRadius: 14, border: kinds[kind].border || 'none', fontFamily: 'inherit',
      fontSize: size === 'sm' ? 14 : 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 7, width: '100%', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.38 : 1,
      ...kinds[kind], ...style }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 19} stroke={2.2} />}{children}
    </button>
  );
}

function Card({ children, style, onClick, className = '' }) {
  return <div onClick={onClick} className={onClick ? 'tm-press ' + className : className}
    style={{ background: T.card, borderRadius: 20, padding: 20, cursor: onClick ? 'pointer' : 'default', ...style }}>{children}</div>;
}

function SectionHead({ title, action, onAction, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px', marginBottom: 10, marginTop: 6 }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 780, letterSpacing: -0.35, color: T.ink }}>{title}</h3>
        {sub && <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>{sub}</div>}
      </div>
      {action && <button onClick={onAction} style={{ border: 'none', background: 'none', color: T.ink3, fontSize: 13.5, fontWeight: 650, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1, padding: '6px 0' }}>{action}<Icon name="ChevronRight" size={15} /></button>}
    </div>
  );
}

function Avatar({ name, size = 40, tone = 'neutral' }) {
  const t = toneMap[tone];
  return <div style={{ width: size, height: size, borderRadius: size / 2, background: t.bg, color: t.fg, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 780, flexShrink: 0, letterSpacing: -0.4 }}>{name}</div>;
}

function Segmented({ items, value, onChange, style }) {
  return (
    <div style={{ display: 'flex', padding: 4, background: T.line2, borderRadius: 12, gap: 2, ...style }}>
      {items.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} style={{ flex: 1, height: 36, border: 'none', borderRadius: 9, fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', background: value === id ? '#fff' : 'transparent',
          color: value === id ? T.ink : T.ink3, boxShadow: value === id ? '0 1px 2px rgba(16,24,40,.08)' : 'none', transition: 'background .15s' }}>{label}</button>
      ))}
    </div>
  );
}

function Chip({ on, children, onClick, style }) {
  return (
    <button onClick={onClick} className="tm-press" style={{ flexShrink: 0, height: 38, padding: '0 15px', borderRadius: 19, fontFamily: 'inherit',
      fontSize: 14, fontWeight: 650, cursor: 'pointer', border: `1px solid ${on ? T.ink : T.line}`, background: on ? T.ink : '#fff',
      color: on ? '#fff' : T.ink2, ...style, boxShadow: on ? 'none' : '0 1px 2px rgba(16,24,40,.04)' }}>{children}</button>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 52, height: 32, borderRadius: 16, border: 'none', background: on ? T.green : '#d9dde2',
      cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 26, height: 26, borderRadius: 13, background: '#fff',
        transition: 'left .18s cubic-bezier(.3,.9,.3,1)', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
    </button>
  );
}

function Empty({ title, sub, icon = 'Inbox', action }) {
  return (
    <div style={{ padding: '44px 24px', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 24, background: T.line2, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color={T.ink3} />
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, color: T.ink3, marginTop: 5, lineHeight: 1.5 }}>{sub}</div>}
      {action}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{label}{hint && <span style={{ color: T.ink3, fontWeight: 550, marginLeft: 5 }}>{hint}</span>}</div>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', boxSizing: 'border-box', height: 52, borderRadius: 13, border: `1px solid ${T.line}`,
  background: '#fff', padding: '0 15px', fontFamily: 'inherit', fontSize: 16, color: T.ink, outline: 'none' };

function Sheet({ open, onClose, children, full, height = '88%' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(12,18,26,.44)', opacity: open ? 1 : 0, transition: 'opacity .24s' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: full ? 54 : 'auto', maxHeight: full ? 'none' : height, background: '#fff',
        borderRadius: '26px 26px 0 0', transform: open ? 'translateY(0)' : 'translateY(105%)',
        transition: 'transform .34s cubic-bezier(.22,.85,.25,1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!full && <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px', flexShrink: 0 }}>
          <div style={{ width: 38, height: 5, borderRadius: 3, background: T.line }} /></div>}
        {children}
      </div>
    </div>
  );
}

function SheetHead({ title, onClose, right }) {
  return (
    <div style={{ height: 54, display: 'flex', alignItems: 'center', padding: '0 10px', borderBottom: `1px solid ${T.line2}`, flexShrink: 0 }}>
      <button onClick={onClose} style={{ width: 42, height: 42, borderRadius: 21, border: 'none', background: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ChevronLeft" size={24} color={T.ink} /></button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 730, color: T.ink }}>{title}</div>
      <div style={{ width: 42, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

function Progress({ value, max, tone = T.blue }) {
  const p = Math.min(100, (value / max) * 100);
  return <div style={{ height: 6, borderRadius: 3, background: T.line2, overflow: 'hidden' }}>
    <div style={{ width: p + '%', height: '100%', borderRadius: 3, background: tone, transition: 'width .4s cubic-bezier(.3,.9,.3,1)' }} /></div>;
}

const won = (n) => '₩' + Math.round(n).toLocaleString('ko-KR');
function guardDesc(total, weekend, gr, gw) {
  if (!total) return '0시간';
  const weekday = total - (weekend || 0);
  if (weekend && weekday) return `${weekday}시간 × ${won(gr)} + ${weekend}시간 × ${won(gw)}`;
  if (weekend) return `${weekend}시간 × ${won(gw)} (주말)`;
  return `${weekday}시간 × ${won(gr)}`;
}

Object.assign(window, { T, Icon, Tag, Btn, Card, SectionHead, Avatar, Segmented, Chip, Toggle, Empty, Field, inputStyle, Sheet, SheetHead, Progress, won, guardDesc });
