import React from "react";
import { C, FONT, W, H, at, ramp, sectionOf, clamp } from "./theme";
import { Label, Stat, Quote, Bar } from "./parts";
import { EP } from "./episode";

type P = { now: number };

const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity: o }}>
    {children}
  </svg>
);

/** 1 between times a and b (seconds), with soft edges. */
const win = (now: number, a: number, b: number, d = 0.8) => ramp(now, a, d) * (1 - ramp(now, b - d, d));
/** 0→1 at the cue. */
const f = (now: number, sec: string, cue: string, d = 0.6): number => ramp(now, at(sec, cue), d);
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
const prog = (now: number, a: number, b: number) => clamp((now - a) / Math.max(0.001, b - a));

const ICE = "#16222e";
const SNOW = "#c9d3db";

/* ---------- the map of the east shore (schematic, not to scale) ---------- */
const ROAD: [number, number][] = [[1180, 200], [1150, 330], [1165, 440], [1170, 520], [1095, 640], [1100, 700], [1040, 800], [930, 960]];
const SEG = ROAD.slice(1).map((p, i) => Math.hypot(p[0] - ROAD[i][0], p[1] - ROAD[i][1]));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
const pt = (frac: number): [number, number] => {
  let d = clamp(frac) * TOTAL;
  for (let i = 0; i < SEG.length; i++) {
    if (d <= SEG[i]) {
      const t = d / SEG[i];
      return [lerp(ROAD[i][0], ROAD[i + 1][0], t), lerp(ROAD[i][1], ROAD[i + 1][1], t)];
    }
    d -= SEG[i];
  }
  return ROAD[ROAD.length - 1];
};
const NORTH = 0.1, INLET = 0.4, BRIDGE = 0.5, HILL = 0.66, HUDONG = 0.82, HAGARU = 1;
const LAKE = "M700,150 Q900,110 1050,230 L1040,430 L1130,455 L1130,495 L1030,520 L1000,700 Q960,880 860,930 Q760,900 720,760 Q640,560 620,360 Q610,220 700,150 Z";

const MapText: React.FC<{ x: number; y: number; t: string; o?: number; c?: string; size?: number; anchor?: "start" | "end" | "middle"; w?: number }> = ({ x, y, t, o = 1, c = C.dim, size = 24, anchor = "start", w = 500 }) => (
  <text x={x} y={y} fill={c} opacity={o} fontFamily={FONT} fontSize={size} fontWeight={w} textAnchor={anchor}>{t}</text>
);

const Dot: React.FC<{ frac: number; o?: number; c?: string; r?: number; label?: string; pulse?: number; side?: 1 | -1 }> = ({ frac, o = 1, c = C.amber, r = 12, label, pulse = 0, side = 1 }) => {
  const [x, y] = pt(frac);
  return (
    <g opacity={o}>
      {pulse ? <circle cx={x} cy={y} r={r + 10 + 8 * Math.sin(pulse * 3)} fill="none" stroke={c} strokeWidth={2} opacity={0.5} /> : null}
      <circle cx={x} cy={y} r={r} fill={c} />
      {label ? <MapText x={x + side * (r + 14)} y={y + 8} t={label} c={C.ink} anchor={side === 1 ? "start" : "end"} /> : null}
    </g>
  );
};

const Map: React.FC<{ show: number; dx?: number; children?: React.ReactNode; labels?: boolean }> = ({ show, dx = 440, children, labels = true }) => (
  <Svg o={show}>
    <g transform={`translate(${dx},0)`}>
      <path d={LAKE} fill={ICE} stroke={C.faint} strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${700 + i * 40},${260 + i * 110} q60,-18 120,6`} fill="none" stroke={C.faint} strokeWidth={2} opacity={0.6} />
      ))}
      <MapText x={830} y={420} t="CHOSIN" c={C.faint} size={44} anchor="middle" w={700} />
      <MapText x={830} y={466} t="RESERVOIR" c={C.faint} size={26} anchor="middle" w={700} />
      {/* hills east of the road */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={`h${i}`} d={`M${1230 + (i % 2) * 40},${190 + i * 120} q50,-50 100,0 q50,-40 100,0`} fill="none" stroke={C.faint} strokeWidth={3} opacity={0.7} />
      ))}
      <polyline points={ROAD.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.dim} strokeWidth={5} strokeDasharray="14 10" />
      {labels ? (
        <g>
          <circle cx={pt(HAGARU)[0]} cy={pt(HAGARU)[1]} r={14} fill="none" stroke={C.teal} strokeWidth={4} />
          <MapText x={pt(HAGARU)[0] + 28} y={pt(HAGARU)[1] + 8} t="Hagaru-ri · Marines" c={C.teal} />
        </g>
      ) : null}
      {children}
    </g>
  </Svg>
);

/* ---------- icons (generic, schematic; no real faces) ---------- */
const BOOKS = [["#7a5a3a", 250], ["#5a6b7a", 270], ["#8a3b2e", 240], ["#4d6b57", 280], ["#b9a98a", 255], ["#6a5a7a", 265]] as [string, number][];
const Books: React.FC<{ x: number; y: number; show: number; s?: number }> = ({ x, y, show, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={show}>
    {BOOKS.map(([col, h], i) => (
      <g key={i} transform={`translate(${i * 74},${-h})`} opacity={ramp(show, i * 0.1, 0.5)}>
        <rect width={66} height={h} rx={4} fill={col} />
        <rect y={34} width={66} height={6} fill={C.amber} opacity={0.7} />
        <rect y={h - 44} width={66} height={6} fill={C.amber} opacity={0.7} />
        <text x={33} y={h / 2 + 10} fill={C.bg} fontFamily={FONT} fontSize={28} fontWeight={700} textAnchor="middle">{i + 1}</text>
      </g>
    ))}
    <rect x={-40} y={0} width={BOOKS.length * 74 + 72} height={12} fill={C.dim} />
  </g>
);

const Heli: React.FC<{ x: number; y: number; now: number; s?: number; o?: number }> = ({ x, y, now, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={70} ry={42} fill="none" stroke={C.steel} strokeWidth={6} />
    <rect x={60} y={-8} width={170} height={12} fill={C.steel} />
    <rect x={222} y={-40} width={8} height={56} fill={C.steel} />
    <rect x={-4} y={-74} width={8} height={34} fill={C.steel} />
    <rect x={-150 * Math.abs(Math.cos(now * 14))} y={-78} width={300 * Math.abs(Math.cos(now * 14))} height={6} fill={C.dim} />
    <path d="M-60,62 L80,62 M-30,40 L-40,62 M40,40 L50,62" stroke={C.steel} strokeWidth={6} fill="none" />
  </g>
);

const starPath = (r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.42;
    return `${i ? "L" : "M"}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ") + " Z";
const Star: React.FC<{ x: number; y: number; r?: number; o?: number; rot?: number; c?: string }> = ({ x, y, r = 46, o = 1, rot = 0, c = C.amber }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
    <path d={starPath(r)} fill={c} />
    <path d={starPath(r * 0.3)} fill={SNOW} />
  </g>
);

const Truck: React.FC<{ x: number; y: number; s?: number; o?: number; fire?: number; now?: number }> = ({ x, y, s = 1, o = 1, fire = 0, now = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={0} y={-34} width={84} height={34} fill={fire ? `rgba(200,85,61,${0.5 + 0.4 * fire})` : C.steel} />
    <rect x={88} y={-26} width={32} height={26} fill={C.dim} />
    <circle cx={20} cy={4} r={10} fill={C.faint} />
    <circle cx={98} cy={4} r={10} fill={C.faint} />
    {fire ? <path d={`M10,-34 q${12 + 6 * Math.sin(now * 9 + x)},-${40 + 14 * Math.sin(now * 7 + x)} 30,0 q14,-${30 + 10 * Math.cos(now * 8 + x)} 30,0`} fill={C.amber} opacity={0.8 * fire} /> : null}
  </g>
);

const Plane: React.FC<{ x: number; y: number; s?: number; o?: number; c?: string }> = ({ x, y, s = 1, o = 1, c = C.steel }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-50} y={-6} width={100} height={12} rx={6} fill={c} />
    <rect x={-12} y={-56} width={22} height={112} rx={8} fill={c} />
    <rect x={-50} y={-20} width={10} height={40} rx={4} fill={c} />
  </g>
);

const Ship: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <path d="M-90,0 L-70,26 L70,26 L96,0 Z" fill={C.steel} />
    <rect x={-24} y={-26} width={52} height={26} fill={C.steel} />
    <rect x={-2} y={-50} width={6} height={24} fill={C.steel} />
  </g>
);

const Stone: React.FC<{ x: number; y: number; lines: [string, number, number?, string?][]; o?: number; sx?: number; w?: number; h?: number }> = ({ x, y, lines, o = 1, sx = 1, w = 420, h = 520 }) => (
  <g transform={`translate(${x},${y}) scale(${sx},1)`} opacity={o}>
    <path d={`M${-w / 2},0 L${-w / 2},${-h + 90} Q0,${-h - 60} ${w / 2},${-h + 90} L${w / 2},0 Z`} fill="#3d4750" stroke={C.dim} strokeWidth={4} />
    {lines.map(([t, show, size = 30, col = C.ink], i) => (
      <text key={i} x={0} y={-h + 150 + i * 56} fill={col} opacity={show} fontFamily={FONT} fontSize={size} fontWeight={600} textAnchor="middle">{t}</text>
    ))}
    <rect x={-w / 2 - 60} y={0} width={w + 120} height={10} fill={C.faint} />
  </g>
);

const Hill: React.FC<{ show: number; lights?: number; dim?: number; num?: boolean }> = ({ show, lights = 0, dim = 1, num = true }) => (
  <Svg o={show * dim}>
    <path d="M0,860 L420,820 Q760,240 1100,640 Q1250,790 1500,820 L1920,850 L1920,1080 L0,1080 Z" fill="#141d27" stroke={C.faint} strokeWidth={3} />
    <path d="M0,900 L520,880 Q820,860 900,800 Q960,740 1040,790 Q1160,880 1500,880 L1920,900" fill="none" stroke={C.dim} strokeWidth={8} strokeDasharray="18 12" />
    <rect x={1010} y={760} width={70} height={18} fill={C.red} transform="rotate(24 1045 769)" />
    {num ? <text x={780} y={470} fill={C.faint} fontFamily={FONT} fontSize={90} fontWeight={700} textAnchor="middle">1221</text> : null}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <circle key={i} cx={640 + i * 46} cy={400 - Math.sin((i / 6) * Math.PI) * 60} r={7} fill={C.red} opacity={0.8} />
    ))}
    <g opacity={lights}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle key={`l${i}`} cx={1660 + i * 26} cy={826 - (i % 3) * 8} r={4 + (i % 2)} fill={C.amber} />
      ))}
      <text x={1750} y={790} fill={C.amber} fontFamily={FONT} fontSize={26} textAnchor="middle">Hagaru-ri</text>
    </g>
  </Svg>
);

/* text helpers */
const Big: React.FC<{ y: number; text: string; show: number; size?: number; color?: string; x?: number; w?: number }> = ({ y, text, show, size = 72, color = C.ink, x = 160, w = 1600 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", opacity: show, transform: `translateY(${(1 - show) * 18}px)`, fontFamily: FONT, fontSize: size, fontWeight: 700, color, lineHeight: 1.15, letterSpacing: -1 }}>
    {text}
  </div>
);
const Head: React.FC<{ text: string; show: number; x?: number; y?: number }> = ({ text, show, x = 120, y = 150 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: show, fontFamily: FONT, fontSize: 30, letterSpacing: 6, color: C.amber, fontWeight: 700 }}>{text}</div>
);
const Rows: React.FC<{ x?: number; y: number; w?: number; show: number; rows: [string, number, string?][]; size?: number; gap?: number }> = ({ x = 120, y, w = 860, show, rows, size = 38, gap = 22 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: show, fontFamily: FONT }}>
    {rows.map(([t, s, col]) => (
      <div key={t} style={{ fontSize: size, color: col ?? C.ink, marginBottom: gap, opacity: s, transform: `translateX(${(1 - s) * -16}px)`, lineHeight: 1.25 }}>{t}</div>
    ))}
  </div>
);
const Columns: React.FC<{ show: number; left: [string, [string, number, string?][]]; right: [string, [string, number, string?][]]; y?: number }> = ({ show, left, right, y = 250 }) => (
  <div style={{ position: "absolute", left: 140, right: 140, top: y, display: "flex", gap: 80, opacity: show, fontFamily: FONT }}>
    {[left, right].map(([title, rows]) => (
      <div key={title} style={{ flex: 1, borderTop: `3px solid ${C.faint}`, paddingTop: 26 }}>
        <div style={{ fontSize: 30, letterSpacing: 6, color: C.amber, fontWeight: 700, marginBottom: 26 }}>{title}</div>
        {rows.map(([t, s, col]) => (
          <div key={t} style={{ fontSize: 40, color: col ?? C.ink, marginBottom: 20, opacity: s, lineHeight: 1.25 }}>{t}</div>
        ))}
      </div>
    ))}
  </div>
);

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const k = "cold";
  const books = ramp(now, s.start + 0.3, 2);
  const name = f(now, k, "The man was Lieutenant Colonel", 1);
  return (
    <>
      <Svg><Books x={220} y={720} show={books} s={1.25} /></Svg>
      <Label x={220} y={770} w={700} size={28} color={C.dim} text="My Book House · six volumes · Baton Rouge, Louisiana" show={books} />
      <div style={{ opacity: 1 - name }}>
        <Rows x={1000} y={300} w={800} size={46} gap={34} show={1} rows={[
          ["A man used to read from these books to his daughter.", f(now, k, "A man used to read")],
          ["She was four.", f(now, k, "She was four"), C.amber],
          ["He left for a place called Korea, and the reading stopped.", f(now, k, "Those are the memories")],
          ["Her mother picked up the books and kept going.", f(now, k, "Her mother picked up")],
        ]} />
      </div>
      <div style={{ position: "absolute", left: 1000, top: 330, width: 820, opacity: name, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>LIEUTENANT COLONEL · U.S. ARMY</div>
        <div style={{ fontSize: 84, fontWeight: 700, color: C.ink, lineHeight: 1.05, marginTop: 10 }}>Don Carlos Faith Jr.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 22, opacity: f(now, k, "He was thirty-two") }}>Thirty-two years old.</div>
      </div>
    </>
  );
};

export const Title: React.FC<P> = ({ now }) => {
  const s = sectionOf("title");
  const a = ramp(now, s.start, 1.2) * (1 - ramp(now, s.end - 1.0, 1.0));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ fontFamily: FONT, fontSize: 34, letterSpacing: 18, color: C.dim }}>THE THREAD</div>
      <div style={{ width: 120, height: 2, background: C.amber, margin: "34px 0" }} />
      <div style={{ fontFamily: FONT, fontSize: 30, color: C.dim, letterSpacing: 4 }}>EPISODE {EP.num.toUpperCase()}</div>
      <div style={{ fontFamily: FONT, fontSize: 150, fontWeight: 700, color: C.ink, letterSpacing: -3, marginTop: 10 }}>{EP.title}</div>
    </div>
  );
};

/* ---------------- P1 · the first night ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const k = "p1";
  const tRing = at(k, "Nobody on that shore");
  const tAtk = at(k, "The attack came late");
  const tMorn = at(k, "By morning");
  const a = win(now, s.start + 2.6, tRing);
  const b = win(now, tRing, tAtk);
  const c = win(now, tAtk, tMorn);
  const d = ramp(now, tMorn, 0.8);
  const ring = ramp(now, tRing, 2.5);
  const [fx, fy] = pt(NORTH);
  return (
    <>
      <Map show={ramp(now, s.start + 2.6, 1.2)}>
        <Dot frac={NORTH} label="Faith · 1st Battalion, 32nd Infantry" pulse={now} side={-1} />
        <circle cx={fx} cy={fy} r={lerp(170, 80, ring)} fill="none" stroke={C.red} strokeWidth={5} strokeDasharray="16 12" opacity={ring * (0.6 + 0.4 * Math.sin(now * 2))} />
        <MapText x={fx - 70} y={fy - 110} t="Chinese 80th Division" c={C.red} o={ring} anchor="end" />
        {[0, 1, 2, 3, 4].map((i) => {
          const ang = (i / 5) * Math.PI * 2 + 0.5;
          const r = 150 - 70 * ((now * 0.6 + i * 0.2) % 1);
          return <circle key={i} cx={fx + Math.cos(ang) * r} cy={fy + Math.sin(ang) * r} r={7} fill={C.red} opacity={ramp(now, tAtk, 0.6) * (1 - d)} />;
        })}
      </Map>
      <Head text="27 NOVEMBER 1950 · EAST SHORE" show={ramp(now, s.start + 2.6, 1)} />
      <Rows y={250} show={a} rows={[
        ["About zero Fahrenheit, and falling.", f(now, k, "The temperature was")],
        ["First to arrive. Farthest north. Most exposed.", f(now, k, "His battalion had arrived first")],
        ["The plan: attack at dawn.", f(now, k, "The plan was to attack"), C.amber],
      ]} />
      <Rows y={250} show={b} rows={[
        ["A Chinese division had already moved in around them.", 1],
        ["The Chinese expected: United States Marines.", f(now, k, "They believed they were about")],
        ["The Marines had left the day before.", f(now, k, "The Marines had left")],
        ["In their place: one Army battalion, there about one day.", f(now, k, "What sat in their place"), C.amber],
      ]} />
      <Rows y={250} show={c} rows={[
        ["The attack came late that night.", 1, C.red],
        ["Telephone lines cut.", f(now, k, "Telephone lines were cut")],
        ["A company commander killed.", f(now, k, "One of Faith's company")],
        ["His replacement: Capt. Edward Stamford, a Marine sent to talk to airplanes.", f(now, k, "He was a Marine captain")],
      ]} />
      <Stat x={120} y={270} value="about 100" label="casualties in the battalion, in one night. Still holding." show={d} />
      <Stat x={120} y={560} value="4 days" label="left to live" show={f(now, k, "And Don Faith had four")} color={C.amber} />
    </>
  );
};

/* ---------------- P2 · the helicopter ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const k = "p2";
  const tTell = at(k, "Faith tried to tell");
  const tStars = at(k, "Then the general did something");
  const tLift = at(k, "The helicopter lifted off");
  const tTore = at(k, "Then he tore the Silver Star");
  const tStop = at(k, "Stop on that for a moment");
  const tFoot = at(k, "There is a footnote");
  const tLast = at(k, "Nobody knows where the first one is");
  const a = win(now, s.start + 2.6, tTell);
  const b = win(now, tTell, tStars);
  const c = win(now, tStars, tStop);
  const d = win(now, tStop, tFoot);
  const e = win(now, tFoot, tLast);
  const g = ramp(now, tLast, 0.8);
  const arrive = prog(now, s.start + 2.6, s.start + 9);
  const leave = prog(now, tLift, tLift + 7);
  const fall = prog(now, tTore + 1.2, tTore + 2.6);
  const snow = 880;
  return (
    <>
      {/* snow line used through the scene */}
      <Svg o={(a + c + e + g) > 0 ? 1 : 0}>
        <path d={`M0,${snow} Q480,${snow - 16} 960,${snow} T1920,${snow} L1920,1080 L0,1080 Z`} fill="#1a2632" opacity={Math.min(1, a + c + e + g)} />
      </Svg>
      <Svg o={a}><Heli x={lerp(2100, 1380, arrive)} y={lerp(260, 640, arrive)} now={now} s={1.5} /></Svg>
      <Head text="28 NOVEMBER 1950 · AFTERNOON" show={a} />
      <div style={{ position: "absolute", left: 120, top: 260, width: 900, opacity: a * f(now, k, "Out of it stepped"), fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>COMMANDING X CORPS</div>
        <div style={{ fontSize: 76, fontWeight: 700, color: C.ink, marginTop: 6 }}>Maj. Gen. Edward Almond</div>
        <div style={{ fontSize: 38, color: C.amber, marginTop: 40, opacity: f(now, k, "Out of it stepped", 4) }}>His aide: 1st Lt. Alexander Haig</div>
        <div style={{ fontSize: 30, color: C.dim, marginTop: 12, opacity: f(now, k, "Remember that name") }}>Remember that name.</div>
      </div>

      <Columns show={b}
        left={["FAITH REPORTS", [["Hit in the night by two Chinese divisions.", f(now, k, "He said his battalion")]]]}
        right={["THE GENERAL ANSWERS", [
          ["Only the remains of units running north.", f(now, k, "The enemy in those hills")],
          ["The attack goes on.", f(now, k, "The attack would go on")],
          ["All the way to the Yalu River.", f(now, k, "They were going all the way"), C.amber],
        ]]} />

      <Svg o={c}>
        {[0, 1, 2].map((i) => {
          const sx = 520 + i * 440;
          const isFaith = i === 0;
          const y = isFaith ? lerp(430, snow - 6, fall * fall) : 430;
          return <Star key={i} x={sx} y={y} r={80} o={f(now, k, "He reached into his pocket") * (isFaith ? 1 - 0.55 * fall : 1)} rot={isFaith ? fall * 200 : 0} />;
        })}
        <Heli x={lerp(1380, 2200, leave)} y={lerp(640, 120, leave)} now={now} s={lerp(1.5, 0.5, leave)} o={ramp(now, tLift, 0.6) * (1 - ramp(now, tLift + 6, 1))} />
      </Svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, opacity: c * (1 - ramp(now, tTore, 0.8)), fontFamily: FONT }}>
        {[["Faith", "One was for Faith"], ["a wounded lieutenant", "Faith picked a lieutenant"], ["a mess sergeant, walking past", "Faith picked a lieutenant"]].map(([t, cue], i) => (
          <div key={t} style={{ position: "absolute", left: 520 + i * 440 - 200, width: 400, textAlign: "center", fontSize: 32, color: C.ink, opacity: f(now, k, cue) }}>{t}</div>
        ))}
      </div>
      <Head text="THREE SILVER STARS, FROM THE GENERAL'S POCKET" show={c * (1 - ramp(now, tTore, 0.8))} />
      <Quote x={420} y={120} text="What a damned travesty." who="Lt. Col. Don Faith, as the helicopter left · 28 November 1950" show={c * f(now, k, "An officer near him")} />

      <Head text="WHO IS MAKING THE GESTURE" show={d} />
      <Rows y={250} w={1500} size={46} gap={30} show={d} rows={[
        ["A general's son, raised on Army posts.", f(now, k, "Don Faith was a general's son")],
        ["1937 · West Point: rejected. The reason was his teeth.", f(now, k, "What he wanted most")],
        ["Draft board: rejected. The same teeth.", f(now, k, "A few years later the draft board")],
        ["February 1942 · Officer Candidate School: commissioned.", f(now, k, "He got in anyway"), C.amber],
        ["He had to fight to be allowed to wear the uniform at all.", f(now, k, "So this is a man")],
        ["He threw the medal away because it was handed to him in place of the truth.", f(now, k, "And he ripped it off"), C.amber],
      ]} />

      <Svg o={e}><Star x={420} y={520} r={150} /></Svg>
      <div style={{ position: "absolute", left: 700, top: 360, width: 1000, opacity: e, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>A FOOTNOTE</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 10, lineHeight: 1.15 }}>Silver Star, awarded after his death</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 20, opacity: f(now, k, "It is in his record now") }}>for 28 November 1950. The same day.</div>
      </div>
      <Svg o={g}><Star x={960} y={snow - 6} r={60} o={0.45} rot={200} /></Svg>
      <Big y={420} size={56} color={C.dim} text="The first one is presumably still there." show={g * f(now, k, "It is presumably still there")} />
    </>
  );
};

/* ---------------- P3 · the enemy in the hills ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const k = "p3";
  const tMid = at(k, "At midnight they came again");
  const tWho = at(k, "It is worth asking");
  const tName = at(k, "There is a small thing");
  const tMan = at(k, "And one man on that shore");
  const tMake = at(k, "What did he make of that");
  const a = win(now, s.start + 2.6, tMid);
  const b = win(now, tMid, tWho);
  const c = win(now, tWho, tName);
  const d = win(now, tName, tMan);
  const e = win(now, tMan, tMake);
  const g = ramp(now, tMake, 0.8);
  const bars = f(now, k, "By the end of this battle", 1.5);
  return (
    <>
      <Svg o={a}>
        <path d="M0,640 Q240,430 520,560 Q760,360 1040,520 Q1320,380 1560,540 Q1760,460 1920,560 L1920,1080 L0,1080 Z" fill="#141d27" stroke={C.faint} strokeWidth={3} />
        {Array.from({ length: 34 }, (_, i) => {
          const x = ((i * 61 + now * 26) % 2000) - 40;
          const y = 640 - 150 * Math.exp(-Math.pow((x - 520) / 300, 2)) * 0.55 - 120 * Math.exp(-Math.pow((x - 1040) / 300, 2)) - 100 * Math.exp(-Math.pow((x - 1560) / 280, 2)) - 30;
          return <rect key={i} x={x} y={y - 14} width={6} height={16} fill={C.red} opacity={0.85} />;
        })}
        <path d="M1380,250 L1700,250 M1660,222 L1700,250 L1660,278" stroke={C.red} strokeWidth={8} fill="none" />
        <text x={1540} y={220} fill={C.red} fontFamily={FONT} fontSize={34} fontWeight={700} textAnchor="middle">SOUTH</text>
      </Svg>
      <Head text="28 NOVEMBER · ALL DAY, IN PLAIN VIEW" show={a} />
      <Rows y={230} w={1200} size={44} show={a} rows={[
        ["Not running north, as the general had said.", f(now, k, "Not running north"), C.dim],
        ["Walking south, toward the only road out.", f(now, k, "Walking south"), C.ink],
      ]} />

      <Head text="MIDNIGHT · INSIDE THE PERIMETER" show={b} />
      <Stat x={160} y={300} size={150} value="80th · 81st" label="Chinese divisions named by the prisoners" show={b * f(now, k, "Prisoners were taken")} color={C.red} />
      <Big y={640} size={60} text="Two divisions. The number Faith gave the general." show={b * f(now, k, "Two divisions.")} color={C.amber} />

      <div style={{ position: "absolute", left: 120, top: 150, width: 900, opacity: c, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>WHO THEY WERE</div>
        <div style={{ fontSize: 70, fontWeight: 700, color: C.ink, marginTop: 6 }}>China's 9th Army Group</div>
      </div>
      <Rows y={330} w={860} size={38} show={c} rows={[
        ["One of the best formations China had.", f(now, k, "They belonged to one of the best")],
        ["Veterans of the civil war their side had just won.", f(now, k, "Its ranks were full")],
        ["Months earlier: on the coast, preparing to invade Taiwan.", f(now, k, "A few months earlier"), C.amber],
        ["Quilted cotton uniforms made for a milder climate.", f(now, k, "Then Korea happened")],
        ["Little for their hands. Some in canvas shoes.", f(now, k, "Many had little")],
      ]} />
      <div style={{ opacity: c * bars }}>
        <Label x={1060} y={340} w={760} size={28} text="China's own count for this battle" show={1} />
        <Bar x={1060} y={400} w={520} frac={28954 / 30000} label="Lost to frostbite" value="28,954" color={C.steel} show={bars} />
        <Bar x={1060} y={540} w={520} frac={19202 / 30000} label="Lost in combat" value="19,202" color={C.red} show={bars} />
        <Label x={1060} y={690} w={760} size={34} color={C.amber} text="And still they came down the hills every night." show={f(now, k, "And still they came")} />
      </div>

      <Head text="THE NAME OF THE PLACE" show={d} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: d, fontFamily: FONT }}>
        <span style={{ fontSize: 120, fontWeight: 700, color: C.ink, opacity: f(now, k, "The Koreans call this lake") }}>Changjin</span>
        <span style={{ fontSize: 80, color: C.dim, margin: "0 50px", opacity: f(now, k, "Chosin is the Japanese reading") }}>→</span>
        <span style={{ fontSize: 120, fontWeight: 700, color: C.amber, opacity: f(now, k, "Chosin is the Japanese reading") }}>Chosin</span>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 16, opacity: f(now, k, "Chosin is the Japanese reading") }}>the Korean name, as read on Japanese maps</div>
        <div style={{ fontSize: 50, color: C.ink, marginTop: 90, opacity: f(now, k, "So here were Americans") }}>Americans · fighting Chinese · in Korea · reading Japanese maps</div>
      </div>

      <Head text="ONE MAN ON THAT SHORE" show={e} />
      <Rows y={250} w={1500} size={46} gap={30} show={e} rows={[
        ["Boyhood: China. One of his father's Army postings.", f(now, k, "Don Faith had been a child")],
        ["1948: sent back, a lieutenant colonel with the American military mission.", f(now, k, "Then, in 1948")],
        ["The side America advised was losing. The mission was withdrawn.", f(now, k, "The side America was advising")],
        ["Japan: given a battalion.", f(now, k, "He went to Japan")],
        ["1950: the army that won that civil war, coming down a hill at him in the dark.", f(now, k, "Two years later"), C.amber],
      ]} />

      <Columns show={g * (1 - f(now, k, "At two in the morning"))}
        left={["THE GENERAL", [
          ["Philippines · Italy · Tokyo", f(now, k, "A general whose career")],
          ["Never, so far as his record shows, China", f(now, k, "so far as his record shows"), C.dim],
          ["Saw a rabble.", f(now, k, "so far as his record shows", 3), C.red],
        ]]}
        right={["THE BATTALION COMMANDER", [
          ["China as a boy · China in 1948", f(now, k, "A battalion commander who had lived")],
          ["Counted two divisions.", f(now, k, "A battalion commander who had lived", 3), C.amber],
        ]]} />
      <Big y={760} size={64} color={C.amber} text="One of them was right." show={g * f(now, k, "One of them was right") * (1 - f(now, k, "At two in the morning"))} />
      <Big y={420} size={76} text="02:00 · the order to pull back" show={f(now, k, "At two in the morning")} />
    </>
  );
};

/* ---------------- P4 · command ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const k = "p4";
  const tSad = at(k, "And then came one of the saddest");
  const tMorn = at(k, "So on the morning of November");
  const tLearn = at(k, "Where does a man learn");
  const tHold = at(k, "Now look at what that copy");
  const tCoda = at(k, "One more thread");
  const a = win(now, s.start + 2.6, tSad);
  const b = win(now, tSad, tMorn);
  const c = win(now, tMorn, tLearn);
  const d = win(now, tLearn, tHold);
  const e = win(now, tHold, tCoda);
  const g = ramp(now, tCoda, 0.8);
  const move = prog(now, at(k, "They moved before dawn"), at(k, "When the last of the wounded") + 3);
  const run = prog(now, at(k, "He ran out onto the ice"), at(k, "They were not his battalion"));
  const isRed = f(now, k, "They were not his battalion", 0.4);
  const [ix, iy] = pt(INLET);
  const tNight2 = at(k, "On the second night");
  const tShot = at(k, "American guns shoot down");
  const tPhoto = at(k, "There is a photograph");
  const sicilyA = win(now, tLearn, tPhoto);
  const sicilyB = win(now, tPhoto, tHold);
  const fly = prog(now, tNight2, tShot + 6);
  const tTanks = at(k, "A few miles south there was");
  const tWd = at(k, "That same afternoon");
  return (
    <>
      <Map show={Math.min(1, a + b + e)}>
        <Dot frac={NORTH} c={C.faint} r={10} o={a + b} />
        <rect x={ix - 44} y={iy - 44} width={88} height={88} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="10 8" />
        <MapText x={ix + 4} y={iy - 60} t="southern perimeter" c={C.ink} anchor="middle" />
        <Dot frac={lerp(NORTH, INLET - 0.02, move)} o={a} label={move < 0.95 ? "Faith's battalion" : ""} side={-1} />
        {/* MacLean */}
        <g opacity={b}>
          {[0, 1, 2, 3, 4].map((i) => {
            const [x, y] = pt(lerp(0.58, 0.47, prog(now, tSad, at(k, "They were not his battalion"))) + i * 0.012);
            return <circle key={i} cx={x} cy={y} r={8} fill={isRed > 0.5 ? C.red : C.dim} />;
          })}
          <circle cx={lerp(ix - 10, ix - 70, run)} cy={lerp(iy + 10, iy + 80, run)} r={9} fill={C.amber} opacity={1 - ramp(now, at(k, "Faith's men watched"), 2)} />
          <MapText x={ix - 90} y={iy + 120} t="Col. MacLean" c={C.amber} anchor="end" o={f(now, k, "He ran out onto the ice") * (1 - ramp(now, at(k, "Faith's men watched"), 2))} />
        </g>
        {/* the last two days */}
        <g opacity={e}>
          <Dot frac={INLET} pulse={now} r={14} />
          <Dot frac={HUDONG} c={C.steel} r={11} label="Hudong-ni · tank company" o={ramp(now, tTanks, 0.6)} />
          {[0, 1].map((i) => {
            const t0 = at(k, "Twice the tanks tried") + i * 2.2;
            const p = prog(now, t0, t0 + 1.8);
            const [x, y] = pt(lerp(HUDONG, HILL + 0.03, p));
            return <circle key={i} cx={x} cy={y} r={8} fill={C.steel} opacity={ramp(now, t0, 0.3) * (1 - ramp(now, t0 + 1.9, 0.4)) * (1 - ramp(now, tWd, 0.5))} />;
          })}
          <Dot frac={HILL} c={C.red} r={10} label="Hill 1221 · Chinese" o={ramp(now, tTanks + 2, 0.6)} side={-1} />
          <Dot frac={lerp(HUDONG, HAGARU - 0.02, prog(now, tWd, tWd + 5))} c={C.steel} r={8} o={ramp(now, tWd, 0.4) * (1 - ramp(now, tWd + 6, 1))} />
        </g>
      </Map>

      <Head text="29 NOVEMBER · BEFORE DAWN" show={a} />
      <Rows y={250} show={a} rows={[
        ["Col. Allan MacLean orders the two groups to join.", 1],
        ["Wounded loaded on the vehicles.", f(now, k, "They moved before dawn")],
        ["Across a frozen arm of the lake, under fire.", f(now, k, "To reach the southern position")],
        ["Faith stood in the open and directed them across.", f(now, k, "Faith stood in the open"), C.amber],
        ["When the last of the wounded were over, he crossed.", f(now, k, "When the last of the wounded")],
      ]} />
      <Head text="ONE OF THE SADDEST MINUTES OF THE BATTLE" show={b} />
      <Rows y={250} show={b} rows={[
        ["Soldiers coming up the road from the south.", f(now, k, "As the column neared")],
        ["He believed it was his own missing battalion.", f(now, k, "He believed this was that battalion")],
        ["He ran out onto the ice, alone, shouting at his men to stop firing.", f(now, k, "He ran out onto the ice")],
        ["They were Chinese.", f(now, k, "They were Chinese"), C.red],
        ["Hit several times. Dragged away. Dead four days later.", f(now, k, "He was hit several times")],
      ]} />

      <Head text="29 NOVEMBER 1950 · MORNING" show={c} x={160} />
      <div style={{ position: "absolute", left: 160, top: 230, width: 1600, opacity: c * (1 - f(now, k, "Years afterward")), fontFamily: FONT }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>Senior officer alive on the east shore:</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.amber, lineHeight: 1.15, marginTop: 10 }}>a lieutenant colonel, 32, once turned down by West Point.</div>
        <div style={{ fontSize: 42, color: C.ink, marginTop: 60, opacity: f(now, k, "He now commanded") }}>Two battalions of infantry · the artillery · several hundred wounded</div>
      </div>
      <Big y={300} size={130} text="TASK FORCE FAITH" show={c * f(now, k, "He called it Task Force Faith")} />
      <Big y={500} size={44} color={C.dim} text="A historian's name, given years afterward. Nobody used it in 1950." show={c * f(now, k, "Nobody used that name")} />
      <Big y={600} size={48} color={C.amber} text="He never knew that anything had been named for him." show={c * f(now, k, "Don Faith never knew")} />

      {/* Sicily */}
      <Head text="JULY 1943 · SICILY" show={d} />
      <Svg o={sicilyA * ramp(now, tNight2, 1)}>
        {[0, 1, 2, 3, 4, 5].map((i) => <Ship key={i} x={220 + i * 300} y={900 + (i % 2) * 40} s={1.1} />)}
        {Array.from({ length: 12 }, (_, i) => {
          const hit = i % 2 === 0 && now > tShot - 3 + i * 0.7;
          const x = lerp(-200 - i * 150, 2100 - i * 150, fly) + 300;
          const y = 560 + (i % 4) * 50 + (hit ? Math.pow(Math.max(0, now - (tShot - 3 + i * 0.7)), 2) * 22 : 0);
          return <Plane key={i} x={x} y={y} s={0.8} c={hit ? C.red : C.steel} o={y > 860 ? 0 : 1} />;
        })}
        {Array.from({ length: 10 }, (_, i) => {
          const sx = 220 + (i % 6) * 300;
          const ph = (now * 2.4 + i * 0.37) % 1;
          return <line key={`t${i}`} x1={sx} y1={880} x2={sx + (i % 2 ? 60 : -40) * ph * 4} y2={880 - 420 * ph} stroke={C.amber} strokeWidth={4} strokeDasharray="10 30" opacity={ramp(now, tNight2 + 4, 1) * (1 - ph)} />;
        })}
      </Svg>
      <Rows y={230} w={1500} size={42} show={sicilyA * (1 - ramp(now, tNight2 + 3, 1))} rows={[
        ["The first large parachute assault in U.S. Army history.", f(now, k, "The 82nd Airborne Division")],
        ["82nd Airborne Division · Maj. Gen. Matthew Ridgway", f(now, k, "and its commander is a general")],
        ["His aide, carrying his maps: Capt. Don Faith, 24.", f(now, k, "Beside Ridgway"), C.amber],
        ["First night: the wind scatters the paratroopers across the island.", f(now, k, "On the first night")],
      ]} />
      <Stat x={160} y={210} size={150} value="23" label="American transport planes shot down by American guns, in one night" show={sicilyA * ramp(now, tShot, 0.8)} color={C.red} />
      <Label x={700} y={250} w={1100} size={42} color={C.ink} text="Ridgway had warned, headquarters to headquarters, that exactly this could happen." show={sicilyA * f(now, k, "Ridgway had seen this coming")} />
      <Label x={700} y={370} w={1100} size={42} color={C.amber} text="He was right. It happened anyway." show={sicilyA * f(now, k, "He was right, and it happened")} />

      <Svg o={sicilyB}>
        <rect x={160} y={240} width={720} height={520} fill="#141d27" stroke={C.dim} strokeWidth={4} />
        <path d="M160,640 Q420,560 880,620 L880,760 L160,760 Z" fill="#1c2733" />
        {[[430, 1.15, C.steel], [560, 1, C.amber]].map(([x, sc, col]) => (
          <g key={x as number} transform={`translate(${x},620) scale(${sc})`}>
            <circle cx={0} cy={-190} r={26} fill={col as string} />
            <path d="M-34,-160 L34,-160 L28,0 L-28,0 Z" fill={col as string} />
            <path d="M-40,-218 Q0,-250 40,-218 L34,-204 L-34,-204 Z" fill={col as string} />
          </g>
        ))}
      </Svg>
      <Label x={160} y={780} w={720} size={26} text="Near Ribera, Sicily · 25 July 1943 (schematic; the photograph exists)" show={sicilyB} />
      <Rows x={960} y={260} w={840} size={40} show={sicilyB} rows={[
        ["Ridgway, looking out over the battlefield.", 1],
        ["At his side: Captain Faith.", f(now, k, "Ridgway stands looking"), C.amber],
        ["What does an aide learn from a week like that? It cannot be known.", f(now, k, "What does an aide learn"), C.dim],
        ["The Army's historians on Faith in battle: very nearly a copy of Ridgway.", f(now, k, "The Army's own historians")],
        ["Intense. Fearless. Aggressive. Hard on the careful.", f(now, k, "intense, fearless"), C.amber],
      ]} />

      <Head text="29 AND 30 NOVEMBER · WHAT HE WAS HOLDING" show={e} />
      <Rows y={230} w={880} size={36} gap={18} show={e} rows={[
        ["One radio to the outside world: Capt. Stamford's.", f(now, k, "He had one radio")],
        ["Aircraft by day. None by night.", f(now, k, "By night there were no aircraft")],
        ["Airdrops, some drifting to the enemy.", f(now, k, "Supplies were dropped")],
        ["The tanks try twice to reach him. Stopped twice.", f(now, k, "Twice the tanks tried")],
        ["30 Nov · Gen. Barr flies in: no help is coming.", f(now, k, "On November thirtieth"), C.amber],
        ["The tanks are ordered south. The historian's verdict: a death warrant.", f(now, k, "That same afternoon"), C.red],
        ["Almond: relieve him. Barr: no. He has my confidence.", f(now, k, "And at headquarters")],
        ["By morning: close to 600 wounded.", f(now, k, "By morning there were close"), C.amber],
      ]} />

      <Head text="ONE MORE THREAD" show={g} x={160} />
      <Rows x={160} y={260} w={1600} size={50} gap={36} show={g} rows={[
        ["Less than a month later: a new general takes over a beaten army.", f(now, k, "Less than a month later")],
        ["He rebuilds it. Most historians say he turned the war around.", f(now, k, "He rebuilt it")],
        ["Matthew Ridgway.", f(now, k, "His name was Matthew Ridgway"), C.amber],
        ["He arrived about three weeks after his old aide died.", f(now, k, "He arrived about three weeks"), C.dim],
      ]} />
    </>
  );
};

/* ---------------- P5 · the trucks ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const k = "p5";
  const tWay = at(k, "There was another way out");
  const tMove = at(k, "The column moved at about one");
  const tLeave = at(k, "Leave the road for a moment");
  const tHill = at(k, "By late afternoon");
  const a = win(now, s.start + 2.6, tWay);
  const b = win(now, tWay, tMove);
  const c = win(now, tMove, tLeave);
  const d = win(now, tLeave, tHill);
  const e = ramp(now, tHill, 0.8);
  const tNap = at(k, "Within minutes one of those");
  const tBr = at(k, "Then the bridge");
  const col = lerp(INLET, BRIDGE - 0.01, prog(now, tMove, tBr));
  const [nx, ny] = pt(INLET + 0.04);
  const [bx, by] = pt(BRIDGE);
  const [hx, hy] = pt(HAGARU);
  const [ix, iy] = pt(INLET);
  return (
    <>
      <Head text="1 DECEMBER 1950" show={a} />
      <Svg o={a}>
        {Array.from({ length: 30 }, (_, i) => (
          <Truck key={i} x={150 + (i % 10) * 165} y={520 + Math.floor(i / 10) * 130} o={ramp(now, at(k, "There were about thirty trucks") + i * 0.12, 0.4)} />
        ))}
      </Svg>
      <Label x={120} y={230} w={1600} size={44} color={C.ink} text="South down the road, all of them, to the Marines at Hagaru-ri." show={a * f(now, k, "They would go that day")} />
      <Stat x={150} y={850} size={70} value="about 30 trucks" label="" show={a * f(now, k, "There were about thirty trucks")} />
      <Stat x={900} y={850} size={70} value="close to 600 wounded" label="" show={a * f(now, k, "Into them went the wounded")} color={C.amber} />

      <Map show={Math.min(1, b + c)}>
        <g opacity={b}>
          <path d={`M${ix - 40},${iy + 20} Q${ix - 220},${iy + 260} ${hx + 10},${hy - 20}`} fill="none" stroke={C.teal} strokeWidth={6} strokeDasharray="6 12" />
          <MapText x={ix - 250} y={iy + 200} t="on foot: across the ice" c={C.teal} anchor="end" />
          <polyline points={ROAD.slice(3).map((p) => p.join(",")).join(" ")} fill="none" stroke={C.amber} strokeWidth={7} opacity={f(now, k, "Faith took the road")} />
          <MapText x={pt(0.75)[0] + 40} y={pt(0.75)[1]} t="with the trucks: the road" c={C.amber} o={f(now, k, "Faith took the road")} />
        </g>
        <g opacity={c}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const [x, y] = pt(col - i * 0.014);
            return <rect key={i} x={x - 9} y={y - 6} width={18} height={12} fill={C.amber} />;
          })}
          <circle cx={nx} cy={ny} r={lerp(10, 90, prog(now, tNap, tNap + 1.2))} fill={C.red} opacity={win(now, tNap, tNap + 5, 0.4) * 0.7} />
          <MapText x={nx + 100} y={ny + 8} t="napalm, dropped short" c={C.red} o={win(now, tNap, tBr)} />
          <path d={`M${bx - 26},${by - 16} L${bx + 26},${by + 16} M${bx + 26},${by - 16} L${bx - 26},${by + 16}`} stroke={C.red} strokeWidth={7} opacity={ramp(now, tBr, 0.6)} />
          <MapText x={bx + 44} y={by + 8} t="blown bridge" c={C.red} o={ramp(now, tBr, 0.6)} />
          <Dot frac={HILL} c={C.red} r={9} label="Hill 1221" side={-1} />
        </g>
      </Map>
      <Head text="THERE WAS ANOTHER WAY OUT" show={b} />
      <Rows y={250} show={b} rows={[
        ["The lake was frozen. Men on foot could walk straight to the Marines.", f(now, k, "The lake was frozen")],
        ["The ice would not hold a loaded truck.", f(now, k, "But the ice would not hold")],
        ["To go by the ice was to leave the wounded.", f(now, k, "To go by the ice"), C.dim],
        ["Faith took the road.", f(now, k, "Faith took the road"), C.amber],
      ]} />
      <Head text="ABOUT 1 P.M. · THE COLUMN MOVES" show={c} />
      <Rows y={250} show={c} rows={[
        ["Marine aircraft overhead.", 1],
        ["One drops its napalm short, on the front of the column.", f(now, k, "Within minutes one of those"), C.red],
        ["The same thing had happened in Sicily, seven years before.", f(now, k, "The same thing had happened in Sicily"), C.dim],
        ["He got them moving again.", f(now, k, "He got them moving again")],
        ["The bridge is blown. One truck at a time, by winch, under fire.", f(now, k, "The Chinese had blown it")],
        ["About two hours. Drivers shot at the wheel. Others took their places.", f(now, k, "It took about two hours"), C.amber],
      ]} />

      <Head text="LEAVE THE ROAD FOR A MOMENT" show={d} x={160} />
      <Rows x={160} y={250} w={1600} size={46} gap={28} show={d} rows={[
        ["November 1942: he marries Barbara.", f(now, k, "In November of 1942")],
        ["Then the war. Every combat jump his division made.", f(now, k, "Then he went to war")],
        ["After the war, a daughter: Barbara too, always called Bobbie.", f(now, k, "After the war there was a daughter")],
        ["China. Japan. This.", f(now, k, "Then China"), C.dim],
        ["He knew what a wounded man in a truck was.", f(now, k, "He knew what a wounded man")],
        ["It was somebody's Don Faith.", f(now, k, "It was somebody's Don Faith"), C.amber],
      ]} />

      <Hill show={e} lights={f(now, k, "The lights of Hagaru-ri", 1.5)} />
      <Head text="LATE AFTERNOON · HILL 1221" show={e} />
      <Label x={120} y={210} w={1100} size={38} color={C.ink} text="The road bends around its foot. The Chinese hold the top. A roadblock at the bend." show={e * f(now, k, "The road bent sharply")} />
      <Label x={1240} y={640} w={640} size={36} color={C.amber} text="The Marines were that close." show={e * f(now, k, "The Marines were that close")} />
      <Label x={120} y={960} w={1500} size={36} color={C.ink} text="Everyone who could carry a weapon, wounded included, goes up the hill." show={e * f(now, k, "Faith gathered everyone")} />
    </>
  );
};

/* ---------------- P6 · the hill ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const s = sectionOf("p6");
  const k = "p6";
  const tShot = at(k, "Faith drew his pistol");
  const tWeigh = at(k, "There is no gentle way");
  const tPut = at(k, "Now put that next");
  const tClean = at(k, "Leadership is not clean");
  const a = win(now, s.start + 2.6, tShot);
  const b = win(now, tShot, tWeigh);
  const b2 = win(now, tWeigh, tPut);
  const c = win(now, tPut, tClean);
  const d = ramp(now, tClean, 0.8);
  return (
    <>
      <Hill show={Math.min(1, a + b)} dim={0.3} num={false} />
      <Rows x={160} y={220} w={1600} size={50} gap={30} show={a} rows={[
        ["Two soldiers refused to go.", f(now, k, "Two soldiers refused to go"), C.amber],
        ["South Koreans, attached to the American unit. Many conscripted only weeks before.", f(now, k, "They were South Koreans"), C.dim],
        ["A refusal, on that road, was not a private act.", f(now, k, "In that minute")],
        ["Six hundred wounded in the trucks behind them.", f(now, k, "Six hundred wounded men")],
        ["The light going, and the aircraft with it.", f(now, k, "The light was going")],
        ["One refusal that stands becomes ten. Then there is no attack.", f(now, k, "And a refusal that is allowed")],
      ]} />
      <Big y={300} size={84} text="Faith drew his pistol and shot them both." show={b} />
      <Big y={540} size={84} color={C.amber} text="Then he led the attack himself." show={b * f(now, k, "Then he led the attack himself")} />

      <Rows x={160} y={200} w={1600} size={46} gap={28} show={b2} rows={[
        ["He did not weigh how it would read in a report.", f(now, k, "He did not stop to weigh")],
        ["He had no reason to think he would have a career.", f(now, k, "He had no reason to think")],
        ["Two men against six hundred. He was responsible for the six hundred.", f(now, k, "He weighed two men"), C.amber],
        ["A hard decision, in seconds, by the one man whose job it was.", f(now, k, "It was a hard decision")],
        ["He did not send anyone up that hill ahead of him.", f(now, k, "He made it, and he did not")],
      ]} />

      <Svg o={c}><Heli x={520} y={300} now={now} s={1.1} o={f(now, k, "Almond made his and flew away")} /></Svg>
      <Columns show={c} y={420}
        left={["ALMOND", [
          ["Made hard decisions that week too.", f(now, k, "Almond made hard decisions")],
          ["Made his, and flew away from them.", f(now, k, "Almond made his and flew away"), C.dim],
        ]]}
        right={["FAITH", [
          ["On foot, at the bottom of the hill.", f(now, k, "Faith made his on foot")],
          ["Dead within hours.", f(now, k, "Faith made his on foot", 3), C.red],
          ["Asked nothing he was not doing himself.", f(now, k, "He asked nothing of anyone"), C.amber],
        ]]} />
      <Big y={150} size={50} color={C.dim} text="The difference is where each man was standing." show={c * f(now, k, "The difference is where")} />

      <Big y={300} size={96} text="Leadership is not clean." show={d} />
      <Big y={470} size={60} color={C.dim} text="It is not supposed to be." show={d * f(now, k, "It is not supposed to be")} />
      <Big y={620} size={96} color={C.amber} text="It is supposed to be responsible." show={d * f(now, k, "It is supposed to be responsible")} />
    </>
  );
};

/* ---------------- P7 · the roadblock ---------------- */
export const P7: React.FC<P> = ({ now }) => {
  const s = sectionOf("p7");
  const k = "p7";
  const tNext = at(k, "What happened next");
  const tFar = at(k, "The column went a little farther");
  const tRec = at(k, "The records give two dates");
  const a = win(now, s.start + 2.6, tNext);
  const b = win(now, tNext, tFar);
  const c = win(now, tFar, tRec);
  const d = ramp(now, tRec, 0.8);
  const tGo = at(k, "Faith put himself at the front");
  const tGr = at(k, "Then a Chinese grenade");
  const adv = prog(now, tGo, tGr);
  const mx = lerp(300, 1180, adv);
  const fire = f(now, k, "The trucks burned", 1.5);
  const ice = f(now, k, "The men who could still move", 1);
  return (
    <>
      <Svg o={a}>
        <line x1={100} y1={700} x2={1820} y2={700} stroke={C.dim} strokeWidth={8} strokeDasharray="18 12" />
        <rect x={1380} y={640} width={50} height={120} fill={C.red} />
        <text x={1405} y={610} fill={C.red} fontFamily={FONT} fontSize={30} textAnchor="middle">roadblock</text>
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={mx - 40 - i * 34} cy={700 + (i % 2 ? 22 : -22)} r={9} fill={C.steel} />)}
        <circle cx={mx} cy={700} r={14} fill={C.amber} />
        <g opacity={f(now, k, "He got to within about thirty")}>
          <path d="M1180,780 L1180,810 L1380,810 L1380,780" fill="none" stroke={C.ink} strokeWidth={4} />
          <text x={1280} y={860} fill={C.ink} fontFamily={FONT} fontSize={44} fontWeight={700} textAnchor="middle">about 30 yards</text>
        </g>
        <circle cx={1200} cy={690} r={lerp(6, 120, prog(now, tGr, tGr + 0.8))} fill={C.red} opacity={win(now, tGr, tGr + 3, 0.3) * 0.75} />
      </Svg>
      <Head text="1 DECEMBER · DUSK" show={a} />
      <Rows y={230} w={1500} size={44} show={a} rows={[
        ["The hill was partly taken. The roadblock was still there.", 1],
        ["Faith at the front, pistol and grenades, straight at it.", f(now, k, "Faith put himself at the front")],
        ["A Chinese grenade. Fragments in his chest.", f(now, k, "Then a Chinese grenade"), C.red],
        ["Still giving orders when the roadblock was overrun.", f(now, k, "He was still giving orders"), C.amber],
      ]} />

      <Head text="WHAT HAPPENED NEXT IS TOLD MORE THAN ONE WAY" show={b} x={160} />
      <Rows x={160} y={260} w={1600} size={46} gap={30} show={b} rows={[
        ["1 · Lifted into the cab of a truck, where it was warm. He bled to death there.", f(now, k, "In one account")],
        ["2 · The truck was hit by gunfire, and he was struck again.", f(now, k, "In another, the truck")],
        ["3 · Propped on the hood of his jeep. He died in the cold.", f(now, k, "In a third")],
        ["One version names the driver: Pfc. Barney. His was the only truck through the last roadblock.", f(now, k, "One version names the driver"), C.amber],
        ["In the end he had to leave it, with Faith's body still inside.", f(now, k, "and that in the end"), C.dim],
      ]} />

      <Svg o={c}>
        <line x1={0} y1={760} x2={1920} y2={760} stroke={C.faint} strokeWidth={6} />
        {Array.from({ length: 10 }, (_, i) => <Truck key={i} x={120 + i * 170} y={750} fire={fire * (0.6 + 0.4 * Math.sin(now * 3 + i))} now={now} />)}
        {Array.from({ length: 16 }, (_, i) => {
          const p = prog(now, at(k, "The men who could still move") + i * 0.3, at(k, "The men who could still move") + 9 + i * 0.3);
          return <circle key={`m${i}`} cx={200 + i * 100 - p * 260} cy={800 + p * 220 + (i % 3) * 14} r={7} fill={SNOW} opacity={ice * (1 - p * 0.7)} />;
        })}
      </Svg>
      <Head text="FULLY DARK · THE AIRCRAFT GONE" show={c} />
      <Rows y={230} w={1600} size={42} show={c} rows={[
        ["Another blown bridge.", f(now, k, "There was another blown bridge")],
        ["The Chinese came down to the road and fired into the truck beds, where the wounded lay.", f(now, k, "They fired into the truck beds"), C.red],
        ["The trucks burned.", f(now, k, "The trucks burned"), C.amber],
        ["Ugly that night in both directions.", f(now, k, "War is ugly"), C.dim],
      ]} />
      <Label x={120} y={980} w={1200} size={34} color={SNOW} text="The men who could still move went out onto the ice." show={c * ice} />

      <div style={{ position: "absolute", left: 160, top: 220, width: 1600, opacity: d, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>1918 – 1 OR 2 DECEMBER 1950</div>
        <div style={{ fontSize: 96, fontWeight: 700, color: C.ink, lineHeight: 1.05, marginTop: 6 }}>Don Carlos Faith Jr.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 16, opacity: f(now, k, "He was thirty-two") }}>Thirty-two.</div>
        <div style={{ fontSize: 46, color: C.ink, marginTop: 50, opacity: f(now, k, "He was the only battalion commander"), lineHeight: 1.25 }}>The only battalion commander in the Korean War to receive the Medal of Honor.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 40, opacity: f(now, k, "By the time the sun came up") }}>By sunrise, the force that would one day carry his name no longer existed.</div>
      </div>
    </>
  );
};

/* ---------------- P8 · the ice ---------------- */
export const P8: React.FC<P> = ({ now }) => {
  const s = sectionOf("p8");
  const k = "p8";
  const tNum = at(k, "About three thousand");
  const tFail = at(k, "And for a long time");
  const tLast = at(k, "The last episode of this series");
  const a = win(now, s.start + 2.6, tNum);
  const b = win(now, tNum, tFail);
  const c = win(now, tFail, tLast);
  const d = ramp(now, tLast, 0.8);
  const [hx, hy] = pt(HAGARU);
  const caught = f(now, k, "Then the record caught up", 1);
  return (
    <>
      <Map show={a}>
        {Array.from({ length: 40 }, (_, i) => {
          const [sx, sy] = pt(0.55 + (i % 9) * 0.03);
          const p = ((now - s.start) * 0.035 + i * 0.137) % 1;
          return <circle key={i} cx={lerp(sx - 60, hx, p) - Math.sin(p * Math.PI) * (60 + (i % 5) * 26)} cy={lerp(sy, hy - 10, p)} r={5} fill={SNOW} opacity={0.9 * Math.sin(p * Math.PI)} />;
        })}
        <g opacity={f(now, k, "He drove out onto the frozen lake")}>
          {(() => {
            const p = ((now - at(k, "He drove out onto the frozen lake")) * 0.12) % 1;
            const q = p < 0.5 ? p * 2 : 2 - p * 2;
            return <rect x={lerp(hx - 20, 900, q)} y={lerp(hy - 30, 700, q)} width={26} height={14} fill={C.teal} />;
          })()}
        </g>
      </Map>
      <Head text="THE NIGHT OF 1 DECEMBER · ACROSS THE ICE" show={a} />
      <Stat x={120} y={240} value="600+" label="men across the ice to the Marine lines by dawn" show={a * f(now, k, "By dawn there were")} />
      <div style={{ position: "absolute", left: 120, top: 520, width: 880, opacity: a * f(now, k, "A Marine officer named"), fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>U.S. MARINE CORPS · AGE 52 · MOTOR TRANSPORT</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.teal, marginTop: 6 }}>Lt. Col. Olin Beall</div>
        <div style={{ fontSize: 34, color: C.ink, marginTop: 16, opacity: f(now, k, "He drove out onto the frozen lake") }}>A medic, one private, a jeep pulling a sled. He kept going back.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 18, opacity: f(now, k, "He brought in over three hundred") }}>Over 300 men brought in.</div>
      </div>

      <Head text="THE COUNT" show={b} x={200} />
      <div style={{ opacity: b }}>
        <Bar x={200} y={240} w={1100} frac={1} label="Went up the east side of the reservoir" value="about 3,000" color={C.steel} show={ramp(now, tNum, 1.2)} />
        <Bar x={200} y={400} w={1100} frac={0.35} label="Reached the Marines" value="over 1,000" color={C.teal} show={f(now, k, "Something over a thousand", 1.2)} />
        <Bar x={200} y={560} w={1100} frac={0.128} label="Could still fight, and fought their way to the sea" value="385" color={C.amber} show={f(now, k, "Of those, three hundred", 1.2)} />
        <Bar x={200} y={720} w={1100} frac={0.36} label="Dead, or would die as prisoners" value="more than 1,000" color={C.red} show={f(now, k, "More than a thousand of the others", 1.2)} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", opacity: c * f(now, k, "Reports at the time") * (1 - 0.75 * caught), fontFamily: FONT }}>
        <div style={{ display: "inline-block", padding: "14px 44px", border: `5px solid ${C.red}`, transform: "rotate(-4deg)", position: "relative" }}>
          <div style={{ fontSize: 110, fontWeight: 700, color: C.red, letterSpacing: 10 }}>ROUTED</div>
          <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 8, background: C.ink, opacity: caught }} />
        </div>
        <div style={{ fontSize: 32, color: C.dim, marginTop: 26 }}>how it was reported at the time. The survivors carried that for decades.</div>
      </div>
      <Rows x={200} y={520} w={1520} size={44} gap={26} show={c} rows={[
        ["The Chinese 80th and 81st Divisions: not seen in battle again until April 1951.", f(now, k, "The two Chinese divisions")],
        ["For five days, kept off the road the Marines needed to get out.", f(now, k, "For five days they had been")],
        ["2000 · Presidential Unit Citation. Fifty years late.", f(now, k, "In the year 2000"), C.amber],
      ]} />

      <Big y={260} size={44} color={C.dim} text="The last episode: people who built great things and got nothing." show={d} />
      <Big y={440} size={84} text="What is owed to the ones who were left on the ice?" show={d * f(now, k, "What is owed to the ones")} />
    </>
  );
};

/* ---------------- CLOSE · sixty-two years ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const k = "close";
  const tFather = at(k, "His father was still alive");
  const tGrew = at(k, "And the four-year-old grew up");
  const tArl = at(k, "On April seventeenth");
  const tFour = at(k, "She was four when the reading stopped");
  const a = win(now, s.start + 2.6, tFather);
  const b = win(now, tFather, tGrew);
  const c = win(now, tGrew, tArl);
  const d = win(now, tArl, tFour);
  const e = ramp(now, tFour, 1);
  const tBack = at(k, "On the back of his own gravestone");
  const flip = prog(now, tBack, tBack + 2);
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const back = flip > 0.5 ? 1 : 0;
  const lit = f(now, k, "Of the one hundred and one fragments", 2);
  const dots = f(now, k, "One hundred and one fragments", 2);
  const LIT = [3, 9, 14, 22, 27, 31, 38, 44, 47, 53, 58, 63, 69, 72, 80, 85, 91, 96, 99];
  return (
    <>
      <Head text="21 JUNE 1951 · WASHINGTON" show={a} x={160} />
      <Big y={260} size={60} text="General Omar Bradley hands the Medal of Honor to Barbara Faith." show={a} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", opacity: a * f(now, k, "Her husband's status"), fontFamily: FONT }}>
        <div style={{ display: "inline-block", padding: "16px 40px", border: `4px solid ${C.dim}`, fontSize: 54, letterSpacing: 6, color: C.dim, fontWeight: 700 }}>KILLED IN ACTION · BODY NOT RECOVERED</div>
      </div>

      <Svg o={b}>
        <Stone x={520} y={900} sx={Math.max(0.02, sx)} lines={back ? [
          ["IN MEMORY OF", 1, 26, C.dim], ["DON CARLOS FAITH JR.", 1, 30], ["LIEUTENANT COLONEL", 1, 26], ["MEDAL OF HONOR", 1, 30, C.amber],
          ["1918", f(now, k, "1918."), 44], ["1950", f(now, k, "1950."), 44],
        ] : [
          ["DON CARLOS FAITH", 1, 32], ["BRIGADIER GENERAL", 1, 26, C.dim], ["U.S. ARMY", 1, 26, C.dim], ["1896 – 1963", 1, 34],
        ]} />
      </Svg>
      <Label x={330} y={930} w={400} size={26} text={back ? "the back of the stone" : "Arlington National Cemetery"} show={b} />
      <Rows x={900} y={260} w={900} size={44} gap={30} show={b} rows={[
        ["His father was still alive.", 1],
        ["Brig. Gen. Don Carlos Faith Sr. died in 1963 and was buried at Arlington.", f(now, k, "Brigadier General Don Carlos Faith Senior")],
        ["Before he died, he made an arrangement.", f(now, k, "Before he died he made")],
        ["A second inscription, on the back of his own gravestone.", f(now, k, "On the back of his own gravestone"), C.amber],
        ["There was no body to bury. So he gave his son the back of his own stone.", f(now, k, "There was no body to bury")],
      ]} />

      <Head text="THE FOUR-YEAR-OLD GREW UP" show={c} />
      <Rows y={240} w={900} size={38} gap={20} show={c} rows={[
        ["Year after year, in touch with the offices that look for the missing.", f(now, k, "She kept in touch")],
        ["1990s · an Army headquarters building is named for her father.", f(now, k, "In the 1990s")],
        ["September 2004 · Americans are allowed to dig near the reservoir.", f(now, k, "In September of 2004")],
        ["A grave holding many men, mixed together.", f(now, k, "They opened a grave")],
        ["It took eight years.", f(now, k, "It took eight years"), C.dim],
        ["August 2012 · the laboratory was sure.", f(now, k, "In August of 2012"), C.amber],
        ["DNA from his brother, and from his daughter.", f(now, k, "The match was made")],
        ["October 2012 · a house in Baton Rouge.", f(now, k, "That October")],
      ]} />
      <Svg o={c * dots}>
        {Array.from({ length: 101 }, (_, i) => {
          const on = LIT.includes(i);
          return <circle key={i} cx={1120 + (i % 12) * 58} cy={300 + Math.floor(i / 12) * 58} r={on ? 16 : 11} fill={on && lit > 0 ? C.amber : C.steel} opacity={ramp(dots, i / 140, 0.3) * (on ? 1 : 1 - 0.55 * lit)} />;
        })}
      </Svg>
      <Label x={1120} y={850} w={700} size={40} color={C.ink} text="101 fragments" show={c * dots * (1 - lit)} />
      <Label x={1120} y={850} w={700} size={44} color={C.amber} weight={700} text="19 of 101 were Don Faith" show={c * lit} />

      <Head text="17 APRIL 2013 · ARLINGTON NATIONAL CEMETERY" show={d} x={160} />
      <Svg o={d}>
        <Stone x={520} y={900} w={340} h={430} lines={[["DON CARLOS", 1, 26], ["FAITH", 1, 26], ["1896 – 1963", 1, 24, C.dim]]} />
        <Stone x={960} y={900} w={340} h={430} o={f(now, k, "He was buried beside his parents", 1.5)} lines={[["DON CARLOS", 1, 26], ["FAITH JR.", 1, 26], ["MEDAL OF HONOR", 1, 22, C.amber], ["1918 – 1950", 1, 24, C.dim]]} />
        <g opacity={f(now, k, "A general folded the flag", 1)} transform="translate(1480,700)">
          <path d="M-150,90 L150,90 L0,-110 Z" fill="#24364f" stroke={C.steel} strokeWidth={4} />
          {[[-40, 40], [40, 40], [0, -10], [-80, 70], [80, 70], [0, 60]].map(([x, y], i) => <path key={i} d={starPath(12)} transform={`translate(${x},${y})`} fill={SNOW} />)}
        </g>
      </Svg>
      <Label x={160} y={230} w={1600} size={42} color={C.ink} text="Buried beside his parents, next to the stone that carried his name on its back for half a century." show={d * f(now, k, "He was buried beside his parents")} />
      <Label x={1300} y={830} w={500} size={40} color={C.amber} text="She was sixty-six." show={d * f(now, k, "She was sixty-six years old")} />

      <Svg o={e}><Books x={220} y={720} show={e} s={1.25} /></Svg>
      <Big x={900} w={900} y={340} size={60} text="She was four when the reading stopped." show={e} />
      <Big x={900} w={900} y={560} size={76} color={C.amber} text="She still has the books." show={e * f(now, k, "She still has the books", 1.2)} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  const k = "thread";
  return (
    <>
      <Head text="OPEN THREAD" show={ramp(now, s.start, 1)} x={360} y={300} />
      <Rows x={360} y={380} w={1200} size={46} gap={26} show={1} rows={[
        ["April 1951. Another hill in Korea.", f(now, k, "In that same month")],
        ["Capt. Conrado Yap, of the Philippine battalion at Yultong.", f(now, k, "One of its captains"), C.ink],
        ["That may be the next pull.", f(now, k, "That may be the next pull"), C.amber],
      ]} />
    </>
  );
};

export const End: React.FC<P> = ({ now }) => {
  const s = sectionOf("end");
  const a = ramp(now, s.start, 1.5);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ fontFamily: FONT, fontSize: 34, letterSpacing: 18, color: C.dim }}>THE THREAD</div>
      <div style={{ width: 120, height: 2, background: C.amber, margin: "34px 0" }} />
      <div style={{ fontFamily: FONT, fontSize: 34, color: C.dim }}>Sources and research notes: github.com/Fleabyte26/the_thread</div>
    </div>
  );
};

export const _unused = { H, Stat, Quote };
