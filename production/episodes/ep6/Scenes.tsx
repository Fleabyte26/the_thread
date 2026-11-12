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


/* ---------- Episode 6 icons ---------- */
const SEA = "#101c28";
const Corvette: React.FC<{ x: number; y: number; s?: number; o?: number; now: number; motto?: number }> = ({ x, y, s = 1, o = 1, now, motto = 0 }) => (
  <g transform={`translate(${x},${y + Math.sin(now * 0.9) * 5}) scale(${s})`} opacity={o}>
    <path d="M-330,0 L-290,58 L270,58 L350,0 Z" fill={C.steel} />
    <rect x={-180} y={-46} width={250} height={46} fill="#7f93aa" />
    <rect x={-110} y={-84} width={120} height={38} fill="#8ea1b6" />
    <rect x={-58} y={-150} width={8} height={66} fill={C.steel} />
    <path d="M-86,-128 L-26,-128 M-74,-110 L-38,-110" stroke={C.steel} strokeWidth={5} />
    <rect x={30} y={-70} width={34} height={24} fill="#7f93aa" />
    <rect x={150} y={-22} width={46} height={22} rx={6} fill="#7f93aa" />
    <rect x={190} y={-16} width={70} height={6} fill="#7f93aa" />
    <rect x={-270} y={-20} width={40} height={20} rx={5} fill="#7f93aa" />
    <text x={-250} y={38} fill={C.bg} fontFamily={FONT} fontSize={30} fontWeight={700}>CONRADO YAP</text>
    <text x={10} y={38} fill={C.amber} fontFamily={FONT} fontSize={26} fontWeight={700} opacity={motto}>STEADY ON</text>
  </g>
);
const Waves: React.FC<{ y: number; now: number; o?: number }> = ({ y, now, o = 1 }) => (
  <g opacity={o}>
    <rect x={0} y={y} width={W} height={H - y} fill={SEA} />
    {[0, 1, 2].map((r) => (
      <path key={r} d={Array.from({ length: 13 }, (_, i) => `${i ? "Q" : "M"}${i ? `${i * 160 - 80 - ((now * (18 + r * 8)) % 160)},${y + 22 + r * 40 - 12} ` : ""}${i * 160 - ((now * (18 + r * 8)) % 160)},${y + 22 + r * 40}`).join(" ")} fill="none" stroke={C.faint} strokeWidth={3} opacity={0.8 - r * 0.2} />
    ))}
  </g>
);
const Tank: React.FC<{ x: number; y: number; ghost: number }> = ({ x, y, ghost }) => (
  <g transform={`translate(${x},${y})`}>
    <g opacity={1 - ghost}>
      <rect x={0} y={-30} width={120} height={30} rx={12} fill={C.steel} />
      <rect x={28} y={-56} width={56} height={26} rx={6} fill={C.steel} />
      <rect x={80} y={-48} width={70} height={8} fill={C.steel} />
    </g>
    <g opacity={ghost}>
      <rect x={0} y={-30} width={120} height={30} rx={12} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="8 8" />
      <rect x={28} y={-56} width={56} height={26} rx={6} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="8 8" />
    </g>
  </g>
);
const Card: React.FC<{ x: number; y: number; w: number; h?: number; who: string; text: string; show: number; foot?: string; footShow?: number; color?: string }> = ({ x, y, w, h = 380, who, text, show, foot, footShow = 1, color = C.amber }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", border: `2px solid ${C.faint}`, borderTop: `5px solid ${color}`, padding: "26px 30px", opacity: show, transform: `translateY(${(1 - show) * 20}px)`, fontFamily: FONT, background: "rgba(20,29,39,0.7)" }}>
    <div style={{ fontSize: 24, letterSpacing: 4, color, fontWeight: 700 }}>{who}</div>
    <div style={{ fontSize: 38, color: C.ink, marginTop: 20, lineHeight: 1.25 }}>{text}</div>
    {foot ? <div style={{ position: "absolute", left: 30, right: 30, bottom: 24, fontSize: 32, color: C.amber, fontWeight: 700, opacity: footShow }}>{foot}</div> : null}
  </div>
);

const Ridge: React.FC<{ o: number; men?: number }> = ({ o, men = 0 }) => (
  <Svg o={o}>
    <path d="M0,900 Q300,860 450,700 Q600,430 760,430 Q900,430 1000,640 Q1100,820 1920,860 L1920,1080 L0,1080 Z" fill="#141d27" stroke={C.faint} strokeWidth={3} />
    {[-70, -35, 0, 35, 70].map((dx) => <circle key={dx} cx={760 + dx} cy={415 - (35 - Math.abs(dx) / 2) * 0.3} r={9} fill={C.amber} opacity={men} />)}
  </Svg>
);
/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const k = "cold";
  const tB = at(k, "She was a small girl too");
  const tC = at(k, "And she has said something");
  const tD = at(k, "To understand why");
  const a = win(now, s.start + 0.3, tB);
  const b = win(now, tB, tC);
  const c = win(now, tC, tD);
  const d = ramp(now, tD, 0.8);
  return (
    <>
      <Svg o={a}><Books x={220} y={720} show={a} s={1.1} /></Svg>
      <Rows x={900} y={300} w={900} size={48} gap={34} show={a} rows={[
        ["The last episode ended with a daughter.", 1],
        ["She was four. She waited sixty-two years.", f(now, k, "She was four when her father"), C.dim],
        ["This one begins with another daughter, in another country.", f(now, k, "This one begins with another"), C.amber],
      ]} />
      <div style={{ position: "absolute", left: 160, top: 240, width: 1600, opacity: b, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>THE SECOND OF THREE DAUGHTERS</div>
        <div style={{ fontSize: 120, fontWeight: 700, color: C.ink, marginTop: 6, opacity: f(now, k, "Her name is Isabelita") }}>Isabelita</div>
        <div style={{ fontSize: 42, color: C.ink, marginTop: 30, opacity: f(now, k, "Her father was a captain") }}>Her father: a captain in the Philippine Army. Korea, 1950. He did not come home.</div>
        <div style={{ fontSize: 42, color: C.amber, marginTop: 24, opacity: f(now, k, "In 2018 she flew to Seoul") }}>2018 · Seoul · his medal is put in her hands.</div>
        <div style={{ fontSize: 42, color: C.dim, marginTop: 24, opacity: f(now, k, "He had been dead for sixty-seven") }}>He had been dead for sixty-seven years.</div>
      </div>
      <Svg o={c}>
        <Waves y={760} now={now} />
        <Corvette x={lerp(700, 1050, prog(now, tC, tD))} y={700} s={1.5} now={now} o={f(now, k, "There is a warship", 1.5)} />
      </Svg>
      <Big y={130} size={64} color={C.amber} text="“My father is still on patrol.”" show={c * f(now, k, "She has said that her father")} />
      <Rows x={160} y={270} w={1600} size={40} gap={16} show={c} rows={[
        ["Built in South Korea.", f(now, k, "It was built in South Korea")],
        ["Thirty years in the South Korean navy.", f(now, k, "It served in the South Korean navy")],
        ["Then given to the Philippines, as a gift.", f(now, k, "Then South Korea gave it"), C.amber],
      ]} />
      <Big y={250} size={130} text="Yultong" show={d} />
      <Big y={470} size={50} color={C.dim} text="Nobody agrees on exactly what happened there." show={d * f(now, k, "Nobody agrees on exactly")} />
      <Big y={580} size={56} text="Three governments wrote it down. They wrote it three ways." show={d * f(now, k, "Three governments wrote it down")} />
      <Big y={720} size={56} color={C.amber} text="This episode will tell you all of them." show={d * f(now, k, "This episode will tell you")} />
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

/* ---------------- P1 · the man ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const k = "p1";
  const tB = at(k, "What came next is told");
  const tC = at(k, "In 1944, in the middle");
  const a = win(now, s.start + 2.6, tB);
  const b = win(now, tB, tC);
  const c = ramp(now, tC, 0.8);
  return (
    <>
      <div style={{ position: "absolute", left: 160, top: 150, width: 1600, opacity: a, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>BORN 1921 · CANDELARIA, ZAMBALES</div>
        <div style={{ fontSize: 110, fontWeight: 700, color: C.ink, marginTop: 4 }}>Conrado Yap</div>
      </div>
      <Rows x={160} y={400} w={1600} size={44} gap={26} show={a} rows={[
        ["First in his class, by a Filipino account of his life.", f(now, k, "A Filipino account of his life")],
        ["Manila: electrical engineering.", f(now, k, "He finished high school")],
        ["Then he gave it up. 1939: the Philippine Military Academy.", f(now, k, "In 1939 he entered"), C.amber],
        ["End of 1941: his class is sent out early, to fight.", f(now, k, "When the Pacific war began")],
      ]} />

      <Head text="TWO SHORT PHRASES IN THE RECORD" show={b} x={160} />
      <Rows x={160} y={230} w={1600} size={50} gap={22} show={b} rows={[
        ["He survived the Bataan Death March.", f(now, k, "He survived the Bataan Death March"), C.amber],
        ["Afterward: operations chief in the guerrilla army.", f(now, k, "And afterward he served"), C.amber],
      ]} />
      <Rows x={160} y={470} w={1600} size={40} gap={20} show={b} rows={[
        ["April 1942. Tens of thousands of prisoners. Some sixty-five miles, in the heat.", f(now, k, "Tens of thousands of prisoners")],
        ["Men who fell out of the column were killed where they fell.", f(now, k, "Men who fell out of the column"), C.dim],
        ["Thousands died on that road. Most of them were Filipinos.", f(now, k, "Thousands died on that road")],
        ["He was twenty-one.", f(now, k, "He was twenty-one"), C.amber],
        ["He had already seen what happens to soldiers who are left behind.", f(now, k, "So before he was twenty-five")],
      ]} />

      <Rows x={160} y={200} w={1600} size={48} gap={30} show={c * (1 - f(now, k, "Hold on to that"))} rows={[
        ["1944 · he marries Aurora de la Llana.", 1],
        ["Three daughters. Isabelita is the second.", f(now, k, "They had three daughters")],
        ["After the war, he stays in the Army.", f(now, k, "After the war he stayed")],
        ["1949 · Fort Knox, in the United States. The armor school.", f(now, k, "In 1949 he was sent")],
        ["He comes home a captain, commanding a tank company.", f(now, k, "He came home a captain"), C.amber],
      ]} />
      <Big y={400} size={130} text="A tank company." show={f(now, k, "A tank company.")} />
    </>
  );
};

/* ---------------- P2 · a tank company with no tanks ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const k = "p2";
  const tB = at(k, "The unit was called");
  const tC = at(k, "By April of 1951");
  const tD = at(k, "How many came at the Filipinos");
  const a = win(now, s.start + 2.6, tB);
  const b = win(now, tB, tC);
  const c = win(now, tC, tD);
  const d = ramp(now, tD, 0.8);
  const ghost = f(now, k, "The tanks never came", 1.5);
  const tAtk = at(k, "On the night of April 22nd");
  const tSmall = at(k, "Take the smallest number");
  return (
    <>
      <Head text="JUNE 1950 · THE UNITED NATIONS ASKS FOR SOLDIERS" show={a} x={160} />
      <Rows x={160} y={250} w={1600} size={48} gap={30} show={a} rows={[
        ["The Philippines was in no condition to send any.", f(now, k, "The Philippines was in no condition")],
        ["Wrecked by the war, five years before. A rebellion to fight at home.", f(now, k, "The country had been wrecked")],
        ["It sent them anyway.", f(now, k, "It sent them anyway"), C.amber],
        ["The first country in Asia to send combat troops. The third in the United Nations.", f(now, k, "It was the first country in Asia")],
      ]} />

      <div style={{ position: "absolute", left: 160, top: 140, width: 1600, opacity: b, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>ABOUT 1,400 MEN · MANILA 15 SEPT 1950 → PUSAN 19 SEPT</div>
        <div style={{ fontSize: 84, fontWeight: 700, color: C.ink, marginTop: 4 }}>10th Battalion Combat Team</div>
      </div>
      <Svg o={b * f(now, k, "They had been organized")}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Tank key={i} x={170 + i * 200} y={470} ghost={ghost} />)}
      </Svg>
      <Label x={160} y={490} w={1600} size={40} color={C.red} text="The tanks the Americans promised never came." show={b * ghost} />
      <Rows x={160} y={570} w={1600} size={40} gap={20} show={b} rows={[
        ["Captain Yap's tank company becomes a heavy weapons company: machine guns in place of armor.", f(now, k, "So Captain Yap's tank company")],
        ["Most of these men had never seen snow. The winter clothing did not come either.", f(now, k, "Most of these men had never seen snow"), C.dim],
        ["11 November 1950 · Miudong · the first battle the Philippines ever won on foreign soil.", f(now, k, "On November 11th, 1950"), C.amber],
      ]} />

      <Head text="APRIL 1951 · NORTH OF YEONCHEON" show={c} x={160} />
      <Svg o={c}>
        {[["TURKEY", "a brigade", C.steel, "On one side of it was"], ["PHILIPPINES", "10th BCT · about 900 men", C.amber, "By April of 1951"], ["PUERTO RICO", "U.S. 65th Infantry", C.steel, "On the other was"]].map(([t, sub, col, cue], i) => (
          <g key={t} opacity={f(now, k, cue)}>
            <rect x={180 + i * 530} y={560} width={500} height={150} rx={8} fill="#141d27" stroke={col} strokeWidth={5} />
            <text x={430 + i * 530} y={625} fill={col} fontFamily={FONT} fontSize={46} fontWeight={700} textAnchor="middle">{t}</text>
            <text x={430 + i * 530} y={675} fill={C.dim} fontFamily={FONT} fontSize={28} textAnchor="middle">{sub}</text>
          </g>
        ))}
        {Array.from({ length: 9 }, (_, i) => {
          const p = ((now * 0.5 + i * 0.11) % 1);
          return <path key={`a${i}`} d={`M${260 + i * 175},${230 + p * 240} l0,50 m-14,-18 l14,18 l14,-18`} stroke={C.red} strokeWidth={6} fill="none" opacity={ramp(now, tAtk, 0.8) * (1 - p * 0.5)} />;
        })}
      </Svg>
      <Label x={160} y={760} w={1600} size={40} color={C.ink} text="Filipinos, Turks and Puerto Ricans, shoulder to shoulder on a Korean hillside." show={c * f(now, k, "Filipinos, Turks and Puerto Ricans")} />
      <Label x={160} y={840} w={1600} size={40} color={C.red} text="22 April 1951 · the Chinese spring offensive comes straight at that line." show={c * ramp(now, tAtk, 0.8)} />

      <Head text="HOW MANY CAME AT THE FILIPINOS? THE ACCOUNTS DIVIDE." show={d} x={200} />
      <div style={{ opacity: d * (1 - ramp(now, tSmall, 0.8)) }}>
        <Bar x={200} y={260} w={1300} frac={1} label="Philippine accounts" value="40,000" color={C.amber} show={f(now, k, "Philippine accounts say forty thousand", 1.2)} />
        <Bar x={200} y={440} w={1300} frac={0.025} label="The Chinese account: two battalions" value="600 to 1,000" color={C.red} show={f(now, k, "The Chinese account says two battalions", 1.2)} />
        <Label x={200} y={620} w={1500} size={48} color={C.ink} text="Forty to one apart." show={f(now, k, "Those two numbers are forty to one")} />
        <Label x={200} y={710} w={1500} size={36} text="The two sides do not even agree on which Chinese division it was." show={f(now, k, "The two sides do not even agree")} />
      </div>
      <Big y={260} size={56} color={C.dim} text="Take the smallest number." show={ramp(now, tSmall, 0.8)} />
      <Big y={400} size={60} text="Nine hundred men, at night, cut into pieces, against a force their own size." show={f(now, k, "Nine hundred men, at night")} />
      <Big y={640} size={84} color={C.amber} text="That is still a fight." show={f(now, k, "That is still a fight")} />
    </>
  );
};

/* ---------------- P3 · the night ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const k = "p3";
  const tB = at(k, "On a hill above the village");
  const tC = at(k, "What Artiaga did is not in dispute");
  const tD = at(k, "There is a photograph");
  const a = win(now, s.start + 2.6, tB);
  const b = win(now, tB, tC);
  const c = win(now, tC, tD);
  const d = ramp(now, tD, 0.8);
  const ROLES: [string, string][] = [["The drivers.", "The drivers."], ["The typists.", "The typists."], ["The clerks.", "The clerks."], ["The medics.", "The medics."], ["The cooks.", "The cooks."], ["And the chaplain.", "And the chaplain."]];
  return (
    <>
      <Head text="22 APRIL 1951 · NIGHT" show={a} x={160} />
      <Rows x={160} y={230} w={1600} size={42} gap={18} show={a} rows={[
        ["About 20:00 · the Turkish brigade is hit first.", 1],
        ["About 23:00 · the Filipinos.", f(now, k, "The Filipinos were hit from about eleven"), C.red],
        ["Within hours: each company alone, in the dark, out of contact.", f(now, k, "Each company was fighting alone")],
        ["The men who were not supposed to fight had to.", f(now, k, "It was bad enough"), C.dim],
      ]} />
      <div style={{ position: "absolute", left: 160, top: 560, width: 1600, opacity: a, fontFamily: FONT, display: "flex", flexWrap: "wrap", gap: "20px 60px" }}>
        {ROLES.map(([t, cue], i) => (
          <div key={t} style={{ fontSize: 76, fontWeight: 700, color: i === 5 ? C.amber : C.ink, opacity: f(now, k, cue, 0.4) }}>{t}</div>
        ))}
      </div>

      <Ridge o={b + c * 0.35} men={b / (b + c * 0.35 + 0.001)} />
      <div style={{ position: "absolute", left: 160, top: 140, width: 1200, opacity: b, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>FARTHER FORWARD THAN ANYONE · ABOVE YULTONG</div>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.ink, marginTop: 4 }}>1st Lt. Jose Artiaga Jr.</div>
        <div style={{ fontSize: 36, color: C.dim, marginTop: 10, opacity: f(now, k, "He had come out of the same academy") }}>The same academy as Yap, one class behind him.</div>
      </div>
      <div style={{ opacity: b }}>
        <Card x={1000} y={380} w={400} h={300} who="BATTLE HISTORIES" text="He commanded a rifle company." show={f(now, k, "The histories of the battle say")} color={C.steel} />
        <Card x={1440} y={380} w={400} h={300} who="BOTH CITATIONS" text="He led a platoon in Yap's own company." show={f(now, k, "The two medal citations")} />
      </div>
      <Label x={1000} y={710} w={840} size={36} color={C.amber} text="If the citations are right, the men on that hill were Yap's own men." show={b * f(now, k, "If the citations are right")} />

      <Head text="WHAT ARTIAGA DID IS NOT IN DISPUTE" show={c} x={160} />
      <Rows x={160} y={230} w={1600} size={44} gap={22} show={c} rows={[
        ["His platoon was cut off from everyone.", f(now, k, "His platoon was cut off")],
        ["Attacked again and again, under machine guns, mortars and artillery.", f(now, k, "It was attacked again and again")],
        ["He moved among his men, placing them and steadying them.", f(now, k, "He moved among his men")],
        ["While directing their fire, he was hit, and he died there.", f(now, k, "And while he was directing"), C.red],
        ["03:00 · part of the forward position pushed off its ground.", f(now, k, "By three in the morning"), C.dim],
        ["The American citation: his men held their position until relief came.", f(now, k, "His men held their position"), C.amber],
      ]} />

      <Svg o={d}>
        <rect x={200} y={230} width={760} height={540} fill="#141d27" stroke={C.dim} strokeWidth={4} />
        <path d="M200,650 Q520,590 960,640 L960,770 L200,770 Z" fill="#1c2733" />
        {[[470, C.amber], [690, C.steel]].map(([x, col]) => (
          <g key={x as number} transform={`translate(${x},650)`}>
            <circle cx={0} cy={-200} r={28} fill={col as string} />
            <path d="M-38,-168 L38,-168 L30,0 L-30,0 Z" fill={col as string} />
          </g>
        ))}
      </Svg>
      <Label x={200} y={790} w={760} size={26} text="Schematic. The photograph exists; it is described here, not shown." show={d} />
      <Rows x={1040} y={280} w={780} size={42} gap={26} show={d} rows={[
        ["A photograph, taken in Korea before that night.", 1],
        ["Described as the last known picture of the two of them together.", f(now, k, "It is described as the last known")],
        ["Captain Yap on the left.", f(now, k, "Captain Yap on the left"), C.amber],
        ["Lieutenant Artiaga on the right.", f(now, k, "Lieutenant Artiaga on the right"), C.steel],
      ]} />
    </>
  );
};

/* ---------------- P4 · the order ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const k = "p4";
  const tB = at(k, "Why did Yap's company not withdraw");
  const tC = at(k, "Three versions.");
  const tD = at(k, "Look at what they share") + 1.2;
  const a = win(now, s.start + 2.6, tB);
  const b = win(now, tB, tC);
  const c = win(now, tC, tD);
  const d = ramp(now, tD, 0.8);
  return (
    <>
      <Head text="AFTER MIDNIGHT · THE ORDER TO PULL BACK" show={a} x={160} />
      <Rows x={160} y={240} w={1600} size={46} gap={26} show={a} rows={[
        ["The forward hill overrun. The Chinese deep inside the position.", 1],
        ["Battalion commander: Lt. Col. Dionisio Ojeda. A Death March survivor too.", f(now, k, "His name was Dionisio Ojeda")],
        ["The order was the correct one.", f(now, k, "He was not a man who frightened"), C.dim],
        ["Every company obeyed it.", f(now, k, "Every company obeyed it")],
        ["Every company except one.", f(now, k, "Every company except one"), C.amber],
      ]} />

      <Head text="WHY DID HIS COMPANY NOT WITHDRAW? THREE GOVERNMENTS, THREE ANSWERS." show={b + c} x={120} y={130} />
      <div style={{ opacity: b + c * 0.35 }}>
        <Card x={120} y={230} w={540} h={470} who="UNITED STATES ARMY · CITATION" text="He led a charge to reach his platoon even though his battalion commander had ordered a withdrawal." show={f(now, k, "The first is from the United States Army")} foot="Told to leave. Refused." footShow={f(now, k, "In that version, he was told to leave")} color={C.steel} />
        <Card x={690} y={230} w={540} h={470} who="PHILIPPINE ARMY · CITATION" text="He acted despite an authority to withdraw, which he had already received. A permission, not an order." show={f(now, k, "The second is from the Philippine Army")} foot="Told he could leave. Chose not to." footShow={f(now, k, "In that version, he was told he could leave")} />
        <Card x={1260} y={230} w={540} h={470} who="SOUTH KOREA · 2026 ACCOUNT" text="His company never received the withdrawal order. Communications had broken down." show={f(now, k, "The third is from South Korea")} foot="Never told." footShow={f(now, k, "In that version, there was no refusal")} color={C.teal} />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 760, display: "flex", justifyContent: "space-between", opacity: c, fontFamily: FONT, fontSize: 54, fontWeight: 700 }}>
        <div style={{ width: 540, textAlign: "center", color: C.ink, opacity: f(now, k, "Ordered and refused") }}>Ordered and refused.</div>
        <div style={{ width: 540, textAlign: "center", color: C.ink, opacity: f(now, k, "Permitted and declined") }}>Permitted and declined.</div>
        <div style={{ width: 540, textAlign: "center", color: C.ink, opacity: f(now, k, "Or never told") }}>Or never told.</div>
      </div>

      <Big y={180} size={44} color={C.dim} text="Look at what they share." show={d} />
      <Big y={320} size={66} text="In all three, he knows his men are up there." show={d * f(now, k, "In all three, he knows")} />
      <Big y={480} size={66} text="In all three, nobody is making him go." show={d * f(now, k, "In all three, nobody is making")} />
      <Big y={660} size={96} color={C.amber} text="And in all three, he goes." show={d * f(now, k, "And in all three, he goes")} />
    </>
  );
};

/* ---------------- P5 · the hill ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const k = "p5";
  const tB = at(k, "And then he was killed");
  const tC = at(k, "There is one more thing");
  const tD = at(k, "This is commentary, not record");
  const a = win(now, s.start + 2.6, tB);
  const b = win(now, tB, tC);
  const c = win(now, tC, tD);
  const d = ramp(now, tD, 0.8);
  const up = prog(now, at(k, "Then he counterattacked"), at(k, "Then he counterattacked") + 6);
  const V: [string, string, string, string][] = [
    ["PHILIPPINE CITATION", "Attacking an enemy position about three hundred yards farther up.", "The Philippine citation says that after", C.amber],
    ["UNITED STATES CITATION", "Going toward a wounded soldier lying on the slope.", "The American citation says he saw a wounded", C.steel],
    ["A THIRD ACCOUNT", "Counting his men, and directing them back.", "A third account says", C.dim],
    ["THE KOREAN ACCOUNT", "Rescuing survivors and recovering his comrades.", "The Korean account says he was mortally", C.teal],
  ];
  return (
    <>
      <Ridge o={a * 0.7} men={1} />
      <Svg o={a}>
        <path d={`M300,880 Q${lerp(300, 520, up)},${lerp(880, 700, up)} ${lerp(300, 720, up)},${lerp(880, 470, up)}`} fill="none" stroke={C.amber} strokeWidth={8} strokeDasharray="4 14" strokeLinecap="round" opacity={ramp(now, at(k, "Then he counterattacked"), 0.5)} />
        <circle cx={lerp(300, 720, up)} cy={lerp(880, 470, up)} r={14} fill={C.amber} opacity={ramp(now, at(k, "Then he counterattacked"), 0.5)} />
      </Svg>
      <Rows x={1000} y={170} w={820} size={34} gap={16} show={a} rows={[
        ["U.S. citation: he crawled from foxhole to foxhole, under fire, steadying his men.", f(now, k, "The American citation says he crawled"), C.dim],
        ["Philippine citation: he tried to reinforce the trapped platoon and fought for an hour without success.", f(now, k, "The Philippine one says he first tried"), C.dim],
        ["Then he counterattacked.", f(now, k, "Then he counterattacked"), C.amber],
        ["U.S. citation: retook the hill, brought out the wounded, rescued the cut-off platoon.", f(now, k, "The American citation says his company retook")],
        ["Korean history: brought back a squad of survivors.", f(now, k, "The Korean history says")],
        ["Philippine citation: recovered the body of Lt. Artiaga, and three other soldiers.", f(now, k, "The Philippine citation says he recovered")],
      ]} />
      <Big x={1000} w={820} y={840} size={56} color={C.amber} text="The living, and the dead." show={a * f(now, k, "The living, and the dead")} />

      <Head text="AND THEN HE WAS KILLED. THERE ARE FOUR ACCOUNTS OF THAT." show={b} x={120} y={110} />
      <div style={{ opacity: b }}>
        {V.map(([who, text, cue, col], i) => (
          <Card key={who} x={120 + (i % 2) * 860} y={190 + Math.floor(i / 2) * 290} w={820} h={260} who={who} text={text} show={f(now, k, cue)} foot="→ toward his men" footShow={f(now, k, "In not one of them", 1.2)} color={col} />
        ))}
      </div>
      <Big y={800} size={72} text="In not one of them is he moving away." show={b * f(now, k, "In not one of them")} />

      <Big y={200} size={40} color={C.dim} text="Reported by Juan Villasanta, a Filipino war correspondent with the battalion. The motto of his company." show={c} />
      <Big y={420} size={220} color={C.amber} text="Steady on." show={c * f(now, k, "Steady on.", 1.2)} />

      <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", opacity: d, fontFamily: FONT }}>
        <span style={{ fontSize: 26, letterSpacing: 5, color: C.amber, border: `2px solid ${C.amber}`, padding: "10px 22px", fontWeight: 700 }}>COMMENTARY, NOT RECORD</span>
      </div>
      <Rows x={220} y={300} w={1480} size={50} gap={34} show={d} rows={[
        ["The oldest war story in the Western world turns on the same act.", f(now, k, "The oldest war story")],
        ["The Iliad: men fight and die for most of a day over the body of one dead friend.", f(now, k, "In the Iliad"), C.dim],
        ["Three thousand years later, on a hill in Korea, a captain from Zambales did the same thing.", f(now, k, "Three thousand years later"), C.amber],
      ]} />
    </>
  );
};

/* ---------------- P6 · what three countries did ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const s = sectionOf("p6");
  const k = "p6";
  const tB = at(k, "Then the three countries did");
  const tC = at(k, "And South Korea waited");
  const tD = at(k, "At home there is more");
  const a = win(now, s.start + 2.6, tB);
  const b = win(now, tB, tC);
  const c = win(now, tC, tD);
  const d = ramp(now, tD, 0.8);
  return (
    <>
      <Head text="23 APRIL 1951 · FIRST LIGHT" show={a} x={160} />
      <Rows x={160} y={240} w={1000} size={42} gap={24} show={a} rows={[
        ["The battalion counterattacks with its last two light tanks.", 1],
        ["Later that morning the whole army is ordered back to a new line.", f(now, k, "Later that morning")],
        ["The Filipinos had held long enough to cover the regiment beside them.", f(now, k, "The Filipinos had held long enough"), C.amber],
      ]} />
      <Stat x={1240} y={240} size={200} value="12" label="dead, in the battalion's own report. Other accounts say fifteen." show={a * f(now, k, "The battalion's own report")} />
      <Label x={1240} y={640} w={560} size={36} color={C.amber} text="The Philippines remembers every one of them." show={a * f(now, k, "The Philippines remembers every one")} />

      <Head text="THEN THE THREE COUNTRIES DID WHAT COUNTRIES DO" show={b} x={160} />
      <Svg o={b}>
        <Star x={230} y={300} r={56} o={f(now, k, "The Philippines gave him its highest")} />
        <Star x={230} y={640} r={56} c={C.steel} o={f(now, k, "The United States gave him")} />
      </Svg>
      <div style={{ position: "absolute", left: 340, top: 240, width: 1460, opacity: b, fontFamily: FONT }}>
        <div style={{ opacity: f(now, k, "The Philippines gave him its highest") }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: C.amber, fontWeight: 700 }}>THE PHILIPPINES · DECEMBER 1951</div>
          <div style={{ fontSize: 58, fontWeight: 700, color: C.ink }}>The Medal for Valor</div>
        </div>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 14, lineHeight: 1.3, opacity: f(now, k, "His name was Elpidio Quirino") }}>President Elpidio Quirino sent the battalion to Korea, and made the award.</div>
        <div style={{ fontSize: 34, color: C.ink, marginTop: 8, lineHeight: 1.3, opacity: f(now, k, "Six years earlier") }}>Manila, 1945: he lost his wife and three of his children in a single day.</div>
        <div style={{ marginTop: 70, opacity: f(now, k, "The United States gave him") }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: C.steel, fontWeight: 700 }}>THE UNITED STATES · DECEMBER 1951</div>
          <div style={{ fontSize: 58, fontWeight: 700, color: C.ink }}>The Distinguished Service Cross</div>
        </div>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 14, lineHeight: 1.3, opacity: f(now, k, "A few months later") }}>Lt. Artiaga: the same cross, a few months later. From his own country, the Distinguished Conduct Star.</div>
      </div>

      <Svg o={c}><Star x={230} y={330} r={70} c={C.teal} o={f(now, k, "Then, on July 27th, 2018")} /></Svg>
      <Big x={340} w={1400} y={150} size={56} color={C.dim} text="And South Korea waited. Sixty-seven years." show={c} />
      <div style={{ position: "absolute", left: 340, top: 270, width: 1460, opacity: c, fontFamily: FONT }}>
        <div style={{ opacity: f(now, k, "Then, on July 27th, 2018") }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: C.teal, fontWeight: 700 }}>SOUTH KOREA · 27 JULY 2018</div>
          <div style={{ fontSize: 58, fontWeight: 700, color: C.ink }}>The Taegeuk, Order of Military Merit</div>
        </div>
        <div style={{ fontSize: 38, color: C.amber, marginTop: 16, opacity: f(now, k, "The prime minister handed it") }}>The prime minister handed it to Isabelita.</div>
        <div style={{ fontSize: 44, color: C.ink, marginTop: 70, opacity: f(now, k, "In 2019 came the ship") }}>2019 · the ship.</div>
        <div style={{ fontSize: 44, color: C.ink, marginTop: 20, opacity: f(now, k, "And in the summer of this year") }}>2026 · South Korea names him its Korean War hero of the month.</div>
      </div>

      <Head text="AT HOME" show={d} x={160} />
      <Svg o={d}>
        <rect x={160} y={240} width={300} height={320} rx={14} fill="#141d27" stroke={C.dim} strokeWidth={4} />
        <rect x={160} y={240} width={300} height={80} rx={14} fill={C.red} />
        <text x={310} y={296} fill={C.ink} fontFamily={FONT} fontSize={40} fontWeight={700} textAnchor="middle">APRIL</text>
        <text x={310} y={500} fill={C.ink} fontFamily={FONT} fontSize={170} fontWeight={700} textAnchor="middle">23</text>
      </Svg>
      <Rows x={540} y={250} w={1260} size={44} gap={26} show={d} rows={[
        ["In Candelaria, the twenty-third of April is a holiday.", 1],
        ["A library and a museum carry his name.", f(now, k, "There is a library and a museum")],
        ["The cadets at the academy he left early eat in a hall called Yap.", f(now, k, "The cadets at the academy")],
      ]} />
      <Rows x={160} y={660} w={1640} size={44} gap={20} show={d} rows={[
        ["2023 · Isabelita stands up for him one more time. An American medal, for the first war.", f(now, k, "And in 2023, Isabelita stood up"), C.ink],
        ["The march and the guerrillas. Eighty years late.", f(now, k, "Eighty years late"), C.amber],
      ]} />
    </>
  );
};

export const P7: React.FC<P> = () => null;
export const P8: React.FC<P> = () => null;

/* ---------------- CLOSE · still on patrol ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const k = "close";
  const tB = at(k, "Don Faith's daughter kept");
  const tC = at(k, "It was built in Korea in 1986") + 0.8;
  const a = win(now, s.start + 2.6, tB);
  const b = win(now, tB, tC);
  const c = ramp(now, tC, 1);
  const sail = prog(now, tC, s.end);
  return (
    <>
      <Stat x={160} y={170} size={120} value="about 7,500" label="Filipinos served in the Korean War" show={a} />
      <Stat x={1060} y={170} size={120} value="112" label="did not come home" show={a * f(now, k, "One hundred and twelve")} color={C.red} />
      <Rows x={160} y={500} w={1640} size={42} gap={20} show={a} rows={[
        ["One of them left three small daughters in Zambales.", f(now, k, "One of them left three small daughters")],
        ["Of their mother, Aurora, the public record says almost nothing. The record keeps the men.", f(now, k, "Of their mother, Aurora"), C.dim],
        ["One daughter has stood up to receive him twice in five years: Seoul, and home. Two governments. Two wars.", f(now, k, "One of those daughters has now stood")],
        ["Nobody gave her an order to do that either.", f(now, k, "Nobody gave her an order"), C.amber],
      ]} />

      <Svg o={b}>
        <Books x={200} y={640} show={b} s={0.9} />
        <Waves y={700} now={now} o={f(now, k, "Conrado Yap's daughter has a ship")} />
        <Corvette x={1380} y={650} s={1.0} now={now} o={f(now, k, "Conrado Yap's daughter has a ship", 1.2)} />
      </Svg>
      <Label x={200} y={250} w={700} size={46} color={C.ink} text="Don Faith's daughter kept six children's books." show={b} />
      <Label x={1040} y={250} w={760} size={46} color={C.amber} text="Conrado Yap's daughter has a ship." show={b * f(now, k, "Conrado Yap's daughter has a ship")} />

      <Svg o={c}>
        <Waves y={780} now={now} />
        <Corvette x={lerp(500, 1100, sail)} y={720} s={1.5} now={now} motto={f(now, k, "The motto of the ship is the last thing", 1.5)} />
      </Svg>
      <Rows x={160} y={150} w={1600} size={40} gap={14} show={c * (1 - f(now, k, "Steady on.", 1))} rows={[
        ["Built in Korea, 1986.", 1],
        ["Thirty years guarding the coast of the country he died for.", f(now, k, "For thirty years it guarded")],
        ["Now under the flag of the country he came from.", f(now, k, "Now it sails under the flag"), C.amber],
        ["The motto of the ship is the last thing he said.", f(now, k, "The motto of the ship is the last thing")],
      ]} />
      <Big y={180} size={200} color={C.amber} text="Steady on." show={c * f(now, k, "Steady on.", 1.2)} />
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
        ["The morning after Yultong: toward a river called the Imjin.", f(now, k, "The morning after Yultong")],
        ["A British battalion, surrounded on a hill.", f(now, k, "A British battalion was surrounded"), C.ink],
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

export const _unused = { H, Quote, Heli, Truck, Plane, Ship, Stone, Columns, ICE };
