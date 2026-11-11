import React from "react";
import { C, FONT, W, H, at, ramp, sectionOf, clamp } from "./theme";
import { Bar, Label, Stat } from "./parts";
import { EP } from "./episode";

type P = { now: number };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

const Tag: React.FC<{ x: number; y: number; text: string; show: number; color?: string }> = ({ x, y, text, show, color = C.amber }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: show, padding: "8px 16px", border: `2px solid ${color}`, color, fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: 2, background: "rgba(11,17,24,0.85)" }}>
    {text}
  </div>
);

/** The box nobody films: a grey heat exchanger with pipes, and heat flowing through it. */
const Box: React.FC<{ x: number; y: number; s?: number; now: number; heat?: number; opacity?: number }> = ({ x, y, s = 1, now, heat = 0.5, opacity = 1 }) => {
  const flow = (now * 60) % 40;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
      <rect x={-160} y={-110} width={320} height={220} rx={10} fill="#2a3440" stroke={C.steel} strokeWidth={3} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={-130 + i * 32} y1={-85} x2={-130 + i * 32} y2={85} stroke={C.faint} strokeWidth={6} />
      ))}
      <path d="M-160,-50 L-300,-50 M-160,50 L-300,50 M160,-50 L300,-50 M160,50 L300,50" stroke={C.steel} strokeWidth={18} />
      <path d="M-300,-50 L-160,-50 M160,-50 L300,-50" stroke={C.red} strokeWidth={6} strokeDasharray="14 26" strokeDashoffset={-flow} opacity={heat} />
      <path d="M-300,50 L-160,50 M160,50 L300,50" stroke={C.teal} strokeWidth={6} strokeDasharray="14 26" strokeDashoffset={flow} opacity={heat} />
    </g>
  );
};

/** A simple engine silhouette, side view, pointing left. */
const Engine: React.FC<{ x: number; y: number; s?: number; opacity?: number; color?: string }> = ({ x, y, s = 1, opacity = 1, color = C.steel }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <path d="M-200,-70 L120,-55 L200,-30 L200,30 L120,55 L-200,70 Z" fill={color} />
    <ellipse cx={-200} cy={0} rx={22} ry={70} fill={C.faint} />
    <rect x={200} y={-22} width={40} height={44} fill={C.dim} />
  </g>
);

/* ---- schematic US map ---- */
const proj = (lat: number, lon: number) => [110 + ((lon + 125) / 59) * 1180, 230 + ((49.5 - lat) / 25) * 640];
const OUTLINE: [number, number][] = [[-124.7,48.4],[-123.9,46],[-124.2,42],[-120.6,34.5],[-117.1,32.5],[-111,31.3],[-108.2,31.3],[-106.5,31.8],[-104,29.5],[-101,29.8],[-99.5,27.5],[-97.2,25.9],[-97.4,28],[-94,29.6],[-89.6,29.2],[-89,30.2],[-85,29.6],[-83,29],[-81.5,25.2],[-80,26.8],[-81,31],[-77,34.6],[-75.5,35.5],[-76,38],[-74,40.5],[-70,41.6],[-70.6,43],[-67,44.8],[-69,47.4],[-71,45],[-75,45],[-79,43.3],[-82.5,41.6],[-83.5,46],[-88,48],[-95,49],[-123,49]];
const outlinePath = "M" + OUTLINE.map(([lon, lat]) => proj(lat, lon).join(",")).join(" L") + " Z";

const Pin: React.FC<{ lat: number; lon: number; label: string; sub?: string; show: number; color?: string; dx?: number; dy?: number }> = ({ lat, lon, label, sub, show, color = C.amber, dx = 18, dy = -10 }) => {
  const [x, y] = proj(lat, lon);
  return (
    <g opacity={show} fontFamily={FONT}>
      <circle cx={x} cy={y} r={10 + 6 * show} fill={color} />
      <circle cx={x} cy={y} r={26} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
      <text x={x + dx} y={y + dy} fontSize={30} fontWeight={700} fill={C.ink} textAnchor={dx < 0 ? "end" : "start"}>{label}</text>
      {sub ? <text x={x + dx} y={y + dy + 32} fontSize={22} fill={C.dim} textAnchor={dx < 0 ? "end" : "start"}>{sub}</text> : null}
    </g>
  );
};

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const box = ramp(now, s.start + 0.3, 2) * (1 - ramp(now, at("cold", "Meanwhile, somewhere else"), 1.2));
  const eng = ramp(now, at("cold", "The F-35 is short of cooling"), 1);
  const two = ramp(now, at("cold", "Two companies are now"), 1);
  const money = ramp(now, at("cold", "In the first half of 2026"), 1) * (1 - ramp(now, at("cold", "Drone makers"), 1));
  const things = ramp(now, at("cold", "Drone makers"), 1) * (1 - ramp(now, at("cold", "This episode follows"), 1));
  const words = [["Drone makers.", "Drone makers"], ["Missile makers.", "Missile makers"], ["Engine makers.", "Engine makers"], ["A shipyard in Texas.", "A shipyard in Texas"], ["A factory in the Ohio farmland.", "A factory in the Ohio"]];
  return (
    <>
      <Svg>
        <Engine x={560} y={540} s={1.2} opacity={box * eng} />
        <Box x={1180} y={540} now={now} heat={0.3 + 0.7 * ramp(now, at("cold", "Every radar"), 2)} opacity={box} />
      </Svg>
      <Label x={860} y={760} w={700} size={36} color={C.dim} text="power in · heat out" show={box * ramp(now, at("cold", "It makes electricity"), 1) * (1 - two)} />
      <div style={{ position: "absolute", left: 760, top: 760, opacity: box * two, fontFamily: FONT, display: "flex", gap: 60 }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.ink, opacity: ramp(now, at("cold", "One has built it"), 0.6) }}>Honeywell</div>
        <div style={{ fontSize: 40, color: C.dim }}>vs</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.ink, opacity: ramp(now, at("cold", "The other is a sister"), 0.6) }}>Collins (RTX)</div>
      </div>
      <div style={{ position: "absolute", left: 260, top: 300, opacity: money }}>
        <Stat x={0} y={0} value="$35.6B" label="H1 2026 · PitchBook via Tectonic" show={1} color={C.amber} size={130} />
        <Stat x={760} y={0} value="$40.8B" label="H1 2026 · Protego Ventures" show={ramp(now, at("cold", "By another count"), 0.8)} size={130} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 260, opacity: things, fontFamily: FONT, fontSize: 64, fontWeight: 700, color: C.ink, lineHeight: 1.45 }}>
        {words.map(([t, k]) => (
          <div key={t} style={{ opacity: ramp(now, at("cold", k), 0.4) }}>{t}</div>
        ))}
      </div>
      <Label x={300} y={440} w={1300} size={60} weight={700} color={C.amber} text="Bolted, welded, machined and flown." show={ramp(now, at("cold", "This episode follows"), 1)} />
    </>
  );
};

/* ---------------- TITLE ---------------- */
export const Title: React.FC<P> = ({ now }) => {
  const s = sectionOf("title");
  const a = ramp(now, s.start, 1.2) * (1 - ramp(now, s.end - 1.0, 1.0));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ fontFamily: FONT, fontSize: 34, letterSpacing: 18, color: C.dim }}>THE THREAD</div>
      <div style={{ width: 120, height: 2, background: C.amber, margin: "34px 0" }} />
      <div style={{ fontFamily: FONT, fontSize: 30, color: C.dim, letterSpacing: 4 }}>EPISODE {EP.num.toUpperCase()}</div>
      <div style={{ fontFamily: FONT, fontSize: 110, fontWeight: 700, color: C.ink, letterSpacing: -3, marginTop: 10 }}>{EP.title}</div>
    </div>
  );
};

/* ---------------- P1: THE BOX BEHIND THE ENGINE ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const diag = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p1", "Honeywell has built it"), 1));
  const kw = ramp(now, at("p1", "Honeywell has built it"), 1) * (1 - ramp(now, at("p1", "Two answers are on the table"), 1));
  const two = ramp(now, at("p1", "Two answers are on the table"), 1) * (1 - ramp(now, at("p1", "Here's the thing the thread"), 1));
  const end = ramp(now, at("p1", "Here's the thing the thread"), 1);
  const maxKw = 90;
  return (
    <>
      <Svg>
        <g opacity={diag}>
          <Engine x={480} y={560} s={1.1} />
          <Box x={1260} y={560} s={0.9} now={now} heat={0.8} />
          <path d="M720,520 Q900,440 1060,520" stroke={C.amber} strokeWidth={4} fill="none" strokeDasharray="10 8" opacity={ramp(now, at("p1", "The F135 engine feeds"), 1)} />
          <path d="M1060,610 Q900,690 720,610" stroke={C.teal} strokeWidth={4} fill="none" strokeDasharray="10 8" opacity={ramp(now, at("p1", "It gives back"), 1)} />
        </g>
      </Svg>
      <Label x={360} y={220} w={500} size={40} weight={700} color={C.ink} text="F135 engine" show={diag} />
      <Label x={1080} y={220} w={700} size={40} weight={700} color={C.ink} text="Power and Thermal Management System" show={diag * ramp(now, at("p1", "On the F-35 it's called"), 1)} />
      <Label x={820} y={400} w={400} size={28} color={C.amber} text="air + power" show={diag * ramp(now, at("p1", "The F135 engine feeds"), 1)} />
      <Label x={760} y={720} w={600} size={28} color={C.teal} text="electricity + cooling + emergency power" show={diag * ramp(now, at("p1", "It gives back"), 1)} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: kw }}>
        <Bar x={0} y={0} w={1300} frac={80 / maxKw} label="JPO objective for the future jet" value="80 kW" color={C.amber} show={ramp(now, at("p1", "The Joint Program Office"), 1)} dashed />
        <Bar x={0} y={160} w={1300} frac={32 / maxKw} label="today's system: well under half" value="< 40 kW" color={C.steel} show={ramp(now, at("p1", "The current system delivers"), 1)} />
        <Label x={0} y={340} w={1400} size={44} weight={700} color={C.red} text="Short of cooling → leans on the engine → engine wears early" show={ramp(now, at("p1", "When the box can't keep up"), 1)} />
        <Label x={0} y={440} w={1400} size={30} color={C.dim} text="Government auditors (GAO) link it to faster wear and shorter engine life." show={ramp(now, at("p1", "Government auditors"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: two, fontFamily: FONT, display: "flex", gap: 90 }}>
        <div style={{ width: 680, opacity: ramp(now, at("p1", "Honeywell offers"), 0.8) }}>
          <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4 }}>THE INCUMBENT</div>
          <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 10 }}>Honeywell</div>
          <div style={{ fontSize: 36, color: C.ink, marginTop: 24 }}>upgrade the box in the jet, in phases</div>
          <div style={{ fontSize: 36, color: C.ink, marginTop: 12 }}>phase one mostly software: ~40 kW in 2–3 years</div>
          <div style={{ fontSize: 36, color: C.ink, marginTop: 12 }}>no airframe change</div>
        </div>
        <div style={{ width: 680, opacity: ramp(now, at("p1", "Collins Aerospace offers"), 0.8) }}>
          <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4 }}>THE CHALLENGER</div>
          <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 10 }}>Collins · EPACS</div>
          <div style={{ fontSize: 36, color: C.ink, marginTop: 24 }}>a new box</div>
          <div style={{ fontSize: 36, color: C.ink, marginTop: 12, opacity: ramp(now, at("p1", "Collins says it showed"), 0.6) }}>~80 kW in lab testing, 2024</div>
          <div style={{ fontSize: 36, color: C.ink, marginTop: 12, opacity: ramp(now, at("p1", "On August 24th"), 0.6) }}>altitude testing done: Aug 24, 2026</div>
          <div style={{ fontSize: 36, color: C.amber, marginTop: 12, opacity: ramp(now, at("p1", "Collins is part of RTX"), 0.6) }}>same parent as the F135 maker (RTX)</div>
        </div>
      </div>
      <Label x={220} y={860} w={1400} size={36} color={C.dim} text="The choice: Lockheed Martin. Up to two years, it said in 2025." show={two * ramp(now, at("p1", "The choice belongs"), 1)} />
      <div style={{ position: "absolute", left: 300, top: 330, opacity: end, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, maxWidth: 1300 }}>The decision that sets how much future the F-35 has: two very old companies and a box with pipes in it.</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber, marginTop: 50, opacity: ramp(now, at("p1", "No startup is in it"), 0.8) }}>No startup. No venture capital.</div>
      </div>
    </>
  );
};

/* ---------------- P2: THE MONEY ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const counts = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p2", "The difference is definitions"), 1));
  const defs = ramp(now, at("p2", "The difference is definitions"), 1) * (1 - ramp(now, at("p2", "Here's the arithmetic"), 1));
  const arith = ramp(now, at("p2", "Here's the arithmetic"), 1) * (1 - ramp(now, at("p2", "Either way"), 1));
  const growth = ramp(now, at("p2", "Either way"), 1) * (1 - ramp(now, at("p2", "And then the honest comparison"), 1));
  const ai = ramp(now, at("p2", "And then the honest comparison"), 1);
  const mx = 41;
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 200, opacity: counts }}>
        <Label x={0} y={0} w={1400} size={36} color={C.dim} text="Defense-tech venture funding, 2026 — same year, four counts" show={1} />
        <Bar x={0} y={80} w={1300} frac={35.6 / mx} label="PitchBook via Tectonic · H1 2026" value="$35.6B" color={C.steel} show={ramp(now, at("p2", "PitchBook, through"), 1)} />
        <Bar x={0} y={220} w={1300} frac={40.8 / mx} label="Protego Ventures · H1 2026" value="$40.8B" color={C.steel} show={ramp(now, at("p2", "Protego Ventures"), 1)} />
        <Bar x={0} y={360} w={1300} frac={14.6 / mx} label="Crunchbase (narrow) · through May" value="$14.6B" color={C.teal} show={ramp(now, at("p2", "By that count"), 1)} />
        <Bar x={0} y={500} w={1300} frac={12.3 / mx} label="PitchBook via Financial Times · by late spring" value="$12.3B" color={C.teal} show={ramp(now, at("p2", "PitchBook numbers reported"), 1)} />
        <Label x={0} y={660} w={1400} size={34} color={C.amber} text="Q1 2026 alone: $19.8B across 262 deals, the biggest quarter ever (PitchBook)" show={ramp(now, at("p2", "The first quarter alone"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 260, opacity: defs, fontFamily: FONT }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginBottom: 40 }}>What counts as defense?</div>
        {[["a satellite company?", "Does a satellite"], ["a cybersecurity company?", "A cybersecurity"], ["an AI lab that sells to the Army?", "An AI lab"], ["drones for farmers and soldiers?", "A company that builds drones"]].map(([t, k]) => (
          <div key={t} style={{ fontSize: 48, color: C.dim, marginBottom: 20, opacity: ramp(now, at("p2", k), 0.6) }}>{t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 280, opacity: arith, fontFamily: FONT }}>
        <div style={{ fontSize: 44, color: C.dim }}>Broad counts, first half of 2026:</div>
        <div style={{ fontSize: 110, fontWeight: 700, color: C.ink }}>$35–41B</div>
        <div style={{ fontSize: 44, color: C.dim, marginTop: 30, opacity: ramp(now, at("p2", "If the second half"), 0.8) }}>Second half anywhere close:</div>
        <div style={{ fontSize: 110, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p2", "If the second half"), 0.8) }}>&gt; $50B for the year</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 300, opacity: growth }}>
        <Stat x={0} y={0} value="$1.6B" label="defense tech, all of 2020 (Crunchbase)" show={ramp(now, at("p2", "In 2020, by Crunchbase"), 0.8)} size={130} color={C.dim} />
        <Stat x={760} y={0} value="≈ 2 weeks" label="how long 2026 took to raise the same" show={ramp(now, at("p2", "In 2026 it raised that much"), 0.8)} size={130} color={C.amber} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: ai }}>
        <Label x={0} y={0} w={1400} size={36} color={C.dim} text="All US venture capital, H1 2026 (PitchBook-NVCA)" show={1} />
        <Bar x={0} y={80} w={1400} frac={1} label="total" value="$412.7B" color={C.faint} show={ramp(now, at("p2", "In the first half of 2026, by PitchBook"), 1)} />
        <Bar x={0} y={220} w={1400} frac={355.9 / 412.7} label="AI companies (~86%)" value="$355.9B" color={C.steel} show={ramp(now, at("p2", "AI companies took"), 1)} />
        <Bar x={0} y={360} w={1400} frac={38 / 412.7} label="defense tech, broad counts (global)" value="~$35–41B" color={C.amber} show={ramp(now, at("p2", "Defense got the second wave"), 1)} />
        <Label x={0} y={530} w={1400} size={52} weight={700} color={C.ink} text="A slice that used to be a crumb." show={ramp(now, at("p2", "But it's a slice"), 0.8)} />
      </div>
    </>
  );
};

/* ---------------- P3: WHO GOT IT ---------------- */
const CO: [string, string, string, string][] = [
  ["Anduril", "$5B at $61B · May 2026", "drones, interceptors, missiles, motors", "Anduril."],
  ["Shield AI", "$2B at $12.7B · Mar 2026", "Hivemind AI pilot · X-BAT", "Shield AI."],
  ["Saronic", "$1.75B", "autonomous boats, its own shipyard", "Saronic."],
  ["Castelion", "$1B at $13B · Aug 2026", "Blackbeard, a cheap hypersonic", "Castelion."],
  ["Neros", "$250M at $2.5B · Aug 2026", "Archer FPV attack drone", "Neros."],
  ["Hadrian", "$1.37B at ~$7.9B · Aug 2026", "precision parts, automated shops", "Hadrian."],
];
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const grid = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p3", "And then the elder"), 1));
  const pal = ramp(now, at("p3", "And then the elder"), 1) * (1 - ramp(now, at("p3", "Notice what the list"), 1));
  const notice = ramp(now, at("p3", "Notice what the list"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 160, top: 190, width: 1600, opacity: grid, display: "flex", flexWrap: "wrap", gap: 30, fontFamily: FONT }}>
        {CO.map(([n, m, w, k]) => (
          <div key={n} style={{ width: 760, height: 190, border: `1px solid ${C.faint}`, padding: "22px 30px", boxSizing: "border-box", opacity: ramp(now, at("p3", k), 0.6), background: "rgba(20,30,40,0.6)" }}>
            <div style={{ fontSize: 50, fontWeight: 700, color: C.ink }}>{n}</div>
            <div style={{ fontSize: 32, color: C.amber, marginTop: 8 }}>{m}</div>
            <div style={{ fontSize: 28, color: C.dim, marginTop: 8 }}>{w}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 260, top: 260, opacity: pal, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4 }}>THE ELDER</div>
        <div style={{ fontSize: 90, fontWeight: 700, color: C.ink }}>Palantir</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 20, opacity: ramp(now, at("p3", "It was founded in 2003"), 0.6) }}>founded 2003 · public 2020</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 14, opacity: ramp(now, at("p3", "In the third quarter of 2026"), 0.6) }}>Q3 2026 revenue: $2.31B, its first $2B quarter</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 14, opacity: ramp(now, at("p3", "and for the first time its American"), 0.6) }}>US commercial ($984M) passed US government ($953M)</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: notice, fontFamily: FONT, fontSize: 70, fontWeight: 700, lineHeight: 1.4 }}>
        <div style={{ color: C.dim, textDecoration: "line-through", opacity: ramp(now, at("p3", "Not apps"), 0.5) }}>Apps.</div>
        <div style={{ color: C.dim, textDecoration: "line-through", opacity: ramp(now, at("p3", "Not ad networks"), 0.5) }}>Ad networks.</div>
        <div style={{ color: C.ink, opacity: ramp(now, at("p3", "Missiles, boats"), 0.5) }}>Missiles, boats, drones, parts, factories.</div>
        <div style={{ color: C.amber, opacity: ramp(now, at("p3", "Things that have to be built"), 0.5) }}>Things that have to be built.</div>
      </div>
    </>
  );
};

/* ---------------- P4: THE FACTORIES ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const map = ramp(now, s.start + 0.3, 1.5);
  const card = (k: string, until?: string) => ramp(now, at("p4", k), 0.8) * (until ? 1 - ramp(now, at("p4", until), 0.8) : 1);
  const states = ramp(now, at("p4", "Put those on a map"), 1);
  const cardStyle: React.CSSProperties = { position: "absolute", left: 1330, top: 330, width: 540, fontFamily: FONT, padding: "20px 26px", background: "rgba(11,17,24,0.88)", border: `1px solid ${C.faint}` };
  return (
    <>
      <Svg>
        <g opacity={map}>
          <path d={outlinePath} fill="#121c26" stroke={C.faint} strokeWidth={2} />
          <Pin lat={39.6} lon={-82.9} label="Arsenal-1" sub="Pickaway Co., Ohio" show={ramp(now, at("p4", "Arsenal-1, in Pickaway"), 1)} />
          <Pin lat={25.9} lon={-97.5} label="Port Alpha" sub="Brownsville, Texas" show={ramp(now, at("p4", "Port Alpha, in Brownsville"), 1)} dx={-24} />
          <Pin lat={29.8} lon={-91.5} label="Franklin yard" sub="Louisiana" show={ramp(now, at("p4", "Saronic already runs"), 1)} dy={40} />
          <Pin lat={35.5} lon={-106.8} label="Project Ranger" sub="Sandoval Co., NM" show={ramp(now, at("p4", "Project Ranger"), 1)} dy={-95} dx={-24} />
          <Pin lat={33.8} lon={-118.3} label="Neros plant" sub="Torrance, CA" show={ramp(now, at("p4", "Project Millennium"), 1)} dy={-50} />
          <Pin lat={33.4} lon={-111.8} label="Hadrian F3" sub="Mesa, AZ" show={ramp(now, at("p4", "Hadrian's Factory 3"), 1)} dy={50} />
          <Pin lat={34.7} lon={-87.7} label="Muscle Shoals" sub="Alabama" show={ramp(now, at("p4", "Hadrian's Factory 3") + 2, 1)} dy={-40} />
        </g>
      </Svg>
      <div style={{ ...cardStyle, opacity: card("Anduril put about", "Port Alpha, in Brownsville") }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink }}>Arsenal-1 · Anduril</div>
        <div style={{ fontSize: 26, color: C.dim, marginTop: 8 }}>~$1B of its own money · 5M sq ft site</div>
        <div style={{ fontSize: 26, color: C.dim }}>YFQ-44A Fury in production March 2026</div>
        <div style={{ fontSize: 26, color: C.amber, opacity: ramp(now, at("p4", "Anduril says 250"), 0.6) }}>250 people by end of 2026 · 4,000 in a decade</div>
      </div>
      <div style={{ ...cardStyle, opacity: card("Saronic picked the site", "Project Ranger") }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink }}>Port Alpha · Saronic</div>
        <div style={{ fontSize: 26, color: C.dim, marginTop: 8 }}>$3B · 835 acres, room for ~4,400 · opens 2028</div>
        <div style={{ fontSize: 26, color: C.dim }}>vessels up to 850 ft</div>
        <div style={{ fontSize: 26, color: C.amber, opacity: ramp(now, at("p4", "The governor of Texas"), 0.6) }}>~10,000 jobs fully built out (governor)</div>
      </div>
      <div style={{ ...cardStyle, opacity: card("Project Ranger", "Project Millennium") }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink }}>Project Ranger · Castelion</div>
        <div style={{ fontSize: 26, color: C.dim, marginTop: 8 }}>1,000 acres · hypersonic missile campus</div>
      </div>
      <div style={{ ...cardStyle, opacity: card("Project Millennium", "Hadrian's Factory 3") }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink }}>Project Millennium · Neros</div>
        <div style={{ fontSize: 26, color: C.dim, marginTop: 8 }}>250,000 sq ft · ~1,200 drones a week today</div>
        <div style={{ fontSize: 26, color: C.amber }}>target: a million a year by 2028</div>
      </div>
      <div style={{ ...cardStyle, opacity: card("Hadrian's Factory 3", "Put those on a map") }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink }}>Hadrian</div>
        <div style={{ fontSize: 26, color: C.dim, marginTop: 8 }}>Mesa, AZ · Muscle Shoals, AL (ships, submarine parts)</div>
      </div>
      <div style={{ ...cardStyle, top: 330, opacity: states, border: "none", background: "rgba(11,17,24,0.92)" }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>Ohio · Texas · New Mexico · Arizona · Alabama · Louisiana</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.amber, marginTop: 14, opacity: ramp(now, at("p4", "The places where the factories"), 0.8) }}>Where the factories used to be.</div>
      </div>
    </>
  );
};

/* ---------------- P5: THE ENGINES NOBODY FILMS ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const intro = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p5", "Beehive Industries"), 1));
  const bee = ramp(now, at("p5", "Beehive Industries"), 1) * (1 - ramp(now, at("p5", "Ursa Major"), 1));
  const ursa = ramp(now, at("p5", "Ursa Major"), 1) * (1 - ramp(now, at("p5", "And Castelion's whole idea"), 1));
  const cast = ramp(now, at("p5", "And Castelion's whole idea"), 1) * (1 - ramp(now, at("p5", "None of this is the glamorous"), 1));
  const end = ramp(now, at("p5", "None of this is the glamorous"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: intro, fontFamily: FONT }}>
        <div style={{ fontSize: 50, color: C.dim }}>Episode 3b: expensive engines, built to last.</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.amber, marginTop: 30, opacity: ramp(now, at("p5", "The new money is going after"), 0.8) }}>The new money: cheap engines, built to be used once.</div>
      </div>
      <Svg>
        <Engine x={1450} y={560} s={0.7} opacity={bee} color={C.amber} />
      </Svg>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: bee, fontFamily: FONT }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.ink }}>Beehive Industries</div>
        <div style={{ fontSize: 36, color: C.dim, marginTop: 10 }}>Colorado · 3D-printed small jet engines</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 40, opacity: ramp(now, at("p5", "In 2026 the Air Force gave"), 0.6) }}>$29.7M Air Force contract: a disposable engine</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 14, opacity: ramp(now, at("p5", "Its Frenzy engine"), 0.6) }}>Frenzy: ~200 lb, a few hundred lb of thrust</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 14, opacity: ramp(now, at("p5", "It's part of an Air Force effort"), 0.6) }}>Family of Affordable Mass Missiles: ~$620M</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: ursa, fontFamily: FONT }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.ink }}>Ursa Major</div>
        <div style={{ fontSize: 36, color: C.dim, marginTop: 10 }}>Colorado · rocket engines and solid rocket motors</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 40, opacity: ramp(now, at("p5", "It raised $100 million"), 0.6) }}>$100M (late 2025): from a handful of motors to volume</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 14, opacity: ramp(now, at("p5", "For years there were"), 0.6) }}>For years: essentially two suppliers of solid rocket motors</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: cast }}>
        <Label x={0} y={0} w={1400} size={36} color={C.dim} text="Cost per hypersonic round, as reported" show={1} />
        <Bar x={0} y={80} w={1400} frac={1} label="Dark Eagle (Army, LRHW)" value="~$41M" color={C.steel} show={ramp(now, at("p5", "A hypersonic missile from the old"), 1)} />
        <Bar x={0} y={220} w={1400} frac={0.35 / 41} label="Castelion Blackbeard (design target)" value="hundreds of thousands" color={C.amber} show={ramp(now, at("p5", "Castelion says Blackbeard"), 1)} />
        <Label x={0} y={380} w={1400} size={40} color={C.ink} text="Navy's first order: 50 missiles, 2026" show={ramp(now, at("p5", "The Navy ordered"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 340, opacity: end, fontFamily: FONT }}>
        <div style={{ fontSize: 50, color: C.dim }}>Nobody films a 200-pound turbine on a test stand.</div>
        <div style={{ fontSize: 66, fontWeight: 700, color: C.ink, marginTop: 40, opacity: ramp(now, at("p5", "If you can't make cheap engines"), 0.8) }}>No cheap engines in volume, no cheap missiles in volume.</div>
      </div>
    </>
  );
};

/* ---------------- P6: THE DINOSAURS ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const s = sectionOf("p6");
  const names = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p6", "According to Govini"), 1));
  const share = ramp(now, at("p6", "According to Govini"), 1) * (1 - ramp(now, at("p6", "And the dinosaurs are investing"), 1));
  const inv = ramp(now, at("p6", "And the dinosaurs are investing"), 1) * (1 - ramp(now, at("p6", "And the government has its own"), 1));
  const ora = ramp(now, at("p6", "And the government has its own"), 1) * (1 - ramp(now, at("p6", "In 1999 the CIA made"), 1));
  const iqt = ramp(now, at("p6", "In 1999 the CIA made"), 1) * (1 - ramp(now, at("p6", "Its record is hard"), 1));
  const rec = ramp(now, at("p6", "Its record is hard"), 1) * (1 - ramp(now, at("p6", "Oracle, Palantir, Anduril"), 1));
  const three = ramp(now, at("p6", "Oracle, Palantir, Anduril"), 1) * (1 - ramp(now, at("p6", "And go back to the box"), 1));
  const box = ramp(now, at("p6", "And go back to the box"), 1) * (1 - ramp(now, at("p6", "There's a joke in here"), 1));
  const birds = ramp(now, at("p6", "There's a joke in here"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: names, fontFamily: FONT }}>
        <div style={{ fontSize: 44, color: C.dim }}>"dinosaur primes"</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.ink, marginTop: 30, opacity: ramp(now, at("p6", "Lockheed Martin, RTX"), 0.8), maxWidth: 1300 }}>Lockheed Martin · RTX · Northrop Grumman · General Dynamics · Boeing</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: share }}>
        <Label x={0} y={0} w={1400} size={36} color={C.dim} text="Share of Pentagon contracts (Govini, via Reuters, Dec 2025)" show={1} />
        <Bar x={0} y={80} w={1400} frac={0.92} label="big primes" value="~92%" color={C.steel} show={ramp(now, at("p6", "According to Govini"), 1)} />
        <Bar x={0} y={220} w={1400} frac={0.01} label="venture-backed defense tech (doubled in a year)" value="< 1%" color={C.amber} show={ramp(now, at("p6", "Venture-backed defense companies"), 1)} />
        <Stat x={0} y={400} value="$4.3B" label="Pentagon spending with startups, FY2025" show={ramp(now, at("p6", "Pentagon spending with startups"), 1)} size={100} />
        <Stat x={700} y={400} value="$19.8B" label="what startups raised from investors in Q1 2026 alone" show={ramp(now, at("p6", "In other words"), 1)} size={100} color={C.amber} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 280, opacity: inv }}>
        <Stat x={0} y={0} value="$4.1B" label="venture rounds with defense primes taking part, 2026 (a record)" show={ramp(now, at("p6", "Defense contractors including"), 0.8)} size={120} color={C.amber} />
        <Stat x={0} y={300} value="$400M → $1B" label="Lockheed Martin's venture fund" show={ramp(now, at("p6", "Lockheed grew"), 0.8)} size={100} />
        <Label x={760} y={330} w={800} size={50} weight={700} color={C.ink} text="They're buying pieces of them." show={ramp(now, at("p6", "They're buying pieces"), 0.8)} />
      </div>
      <div style={{ position: "absolute", left: 260, top: 280, opacity: ora, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4 }}>1977 · BY ACCIDENT</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 16, opacity: ramp(now, at("p6", "In 1977, three programmers"), 0.6) }}>A CIA database contract, code name: Oracle</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 24, opacity: ramp(now, at("p6", "The CIA was their first customer"), 0.6) }}>first customer: the CIA · the company kept the name</div>
      </div>
      <div style={{ position: "absolute", left: 260, top: 280, opacity: iqt, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4 }}>1999 · ON PURPOSE</div>
        <div style={{ fontSize: 90, fontWeight: 700, color: C.ink, marginTop: 10 }}>In-Q-Tel</div>
        <div style={{ fontSize: 38, color: C.ink, marginTop: 20 }}>nonprofit, CIA-funded, legally independent · named after Q</div>
        <div style={{ fontSize: 38, color: C.ink, marginTop: 12, opacity: ramp(now, at("p6", "Its checks are small"), 0.6) }}>small checks, usually under $3M</div>
        <div style={{ fontSize: 38, color: C.amber, marginTop: 12, opacity: ramp(now, at("p6", "What it brings"), 0.6) }}>a hard technical review + a line to government users</div>
      </div>
      <div style={{ position: "absolute", left: 260, top: 260, opacity: rec, fontFamily: FONT }}>
        {[["Keyhole", "→ Google Earth", "It backed Keyhole"], ["Palantir", "early, when few would", "It backed Palantir"], ["Anduril", "2017, its first year", "It backed Anduril"]].map(([a, b, k]) => (
          <div key={a} style={{ display: "flex", gap: 40, alignItems: "baseline", marginBottom: 22, opacity: ramp(now, at("p6", k), 0.6) }}>
            <div style={{ width: 330, fontSize: 58, fontWeight: 700, color: C.ink }}>{a}</div>
            <div style={{ fontSize: 38, color: C.dim }}>{b}</div>
          </div>
        ))}
        <div style={{ fontSize: 36, color: C.ink, marginTop: 30, opacity: ramp(now, at("p6", "By its own count"), 0.6) }}>800+ investments · 500+ into government use (IQT)</div>
        <div style={{ fontSize: 36, color: C.amber, marginTop: 12, opacity: ramp(now, at("p6", "In 2025 it was an investor"), 0.6) }}>investor in 32 of the 100 fastest-growing defense startups (2025)</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: three, fontFamily: FONT }}>
        <div style={{ fontSize: 90, fontWeight: 700, color: C.ink }}>Oracle · Palantir · Anduril</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 40, opacity: ramp(now, at("p6", "If the flood of 2026"), 0.6), maxWidth: 1300 }}>A small government fund took the first risk, so private money would take the next one.</div>
      </div>
      <Svg>
        <Box x={960} y={480} s={0.9} now={now} heat={0.8} opacity={box * ramp(now, at("p6", "And go back to the box") + 1, 1)} />
      </Svg>
      <Label x={300} y={760} w={1400} size={48} weight={700} color={C.ink} text="The F-35's power station: built by the dinosaurs." show={box * ramp(now, at("p6", "The power station that"), 0.8)} />
      <div style={{ position: "absolute", left: 300, top: 320, opacity: birds, fontFamily: FONT }}>
        <div style={{ fontSize: 96, fontWeight: 700, color: C.ink, opacity: ramp(now, at("p6", "Birds are dinosaurs"), 0.6) }}>Birds are dinosaurs.</div>
        <div style={{ fontSize: 50, color: C.amber, marginTop: 40, opacity: ramp(now, at("p6", "The ones that survived"), 0.6) }}>The survivors got small, fast and light.</div>
      </div>
    </>
  );
};

/* ---------------- P7: WHO BUILDS IT ---------------- */
export const P7: React.FC<P> = ({ now }) => {
  const s = sectionOf("p7");
  const gap = ramp(now, at("p7", "Deloitte and the Manufacturing"), 1) * (1 - ramp(now, at("p7", "Automation doesn't remove"), 1));
  const auto = ramp(now, at("p7", "Automation doesn't remove"), 1) * (1 - ramp(now, at("p7", "Now a detail the thread"), 1));
  const fpv = ramp(now, at("p7", "Now a detail the thread"), 1) * (1 - ramp(now, at("p7", "It's easy to say"), 1));
  const read = ramp(now, at("p7", "It's easy to say"), 1);
  const intro = ramp(now, s.start + 0.3, 1) * (1 - gap) * (1 - auto) * (1 - fpv) * (1 - read);
  return (
    <>
      <Label x={360} y={420} w={1200} size={64} weight={700} color={C.ink} text="A factory is a building. What makes it work is people." show={intro} />
      <div style={{ position: "absolute", left: 220, top: 230, opacity: gap }}>
        <Label x={0} y={0} w={1400} size={36} color={C.dim} text="US manufacturing, 2024–2033 (Deloitte & The Manufacturing Institute)" show={1} />
        <Bar x={0} y={80} w={1400} frac={1} label="new workers needed" value="up to 3.8M" color={C.steel} show={ramp(now, at("p7", "Deloitte and the Manufacturing"), 1)} />
        <Bar x={0} y={220} w={1400} frac={0.5} label="could go unfilled" value="1.9M" color={C.red} show={ramp(now, at("p7", "and that about half"), 1)} />
        <Label x={0} y={400} w={1400} size={40} color={C.ink} text="machinists · welders · electricians · maintenance technicians · five-axis operators" show={ramp(now, at("p7", "The hardest to fill"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: auto, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink }}>Robots still need people.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 30, opacity: ramp(now, at("p7", "Hadrian's pitch"), 0.6) }}>Hadrian: automated machining, still needs technicians</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 14, opacity: ramp(now, at("p7", "Saronic is putting"), 0.6) }}>Saronic: AI welding robots, still needs welders</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 14, opacity: ramp(now, at("p7", "Anduril says it's working"), 0.6) }}>Anduril: engineering courses with Pickaway County high schools</div>
      </div>
      <Svg>
        <g opacity={fpv} transform="translate(1400,520)">
          {[[-70, -70], [70, -70], [-70, 70], [70, 70]].map(([x, y], i) => (
            <g key={i}>
              <line x1={0} y1={0} x2={x} y2={y} stroke={C.steel} strokeWidth={12} />
              <circle cx={x} cy={y} r={52} fill="none" stroke={C.dim} strokeWidth={3} />
            </g>
          ))}
          <rect x={-34} y={-24} width={68} height={48} rx={8} fill={C.amber} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 220, top: 280, opacity: fpv, fontFamily: FONT, maxWidth: 950 }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.ink }}>Neros: founded by two teenage FPV drone racers</div>
        <div style={{ fontSize: 38, color: C.dim, marginTop: 24, opacity: ramp(now, at("p7", "A hobby that looks"), 0.6) }}>A hobby that looks a lot like a video game.</div>
        <div style={{ fontSize: 38, color: C.ink, marginTop: 24, opacity: ramp(now, at("p7", "Anduril's founder made"), 0.6) }}>Anduril's founder: a VR headset for gamers.</div>
        <div style={{ fontSize: 38, color: C.amber, marginTop: 24, opacity: ramp(now, at("p7", "The skills the new defense"), 0.6) }}>Flying by video link. Soldering a quad. Code that drives a machine.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 330, opacity: read, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 50, color: C.dim, textDecoration: ramp(now, at("p7", "It may be closer"), 0.5) > 0.5 ? "line-through" : "none" }}>A generation lost to screens?</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 40, opacity: ramp(now, at("p7", "It may be closer"), 0.8) }}>Some of them were training without knowing what for.</div>
      </div>
    </>
  );
};

/* ---------------- P8: THE OTHER SIDE ---------------- */
export const P8: React.FC<P> = ({ now }) => {
  const s = sectionOf("p8");
  const items = [
    ["Valuations are not weapons", "Anduril ~28× 2025 revenue · Shield AI > 40×", "Valuations are not weapons"],
    ["Money is not production", "no cheap hypersonic at scale yet · Port Alpha opens 2028", "Money is not production"],
    ["The Pentagon hasn't changed its buying", "under 1% of contract dollars", "The Pentagon hasn't changed"],
    ["Supply chains are still overseas", "motors, magnets, battery cells, chips", "The supply chains are still overseas"],
    ["Most of the money still went to AI", "86% of US venture dollars, H1 2026", "And most of the money still went"],
  ];
  const list = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p8", "There's also a quieter risk"), 1));
  const risk = ramp(now, at("p8", "There's also a quieter risk"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 180, opacity: list, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim, marginBottom: 30 }}>The case against</div>
        {items.map(([a, b, k]) => (
          <div key={a} style={{ marginBottom: 30, opacity: ramp(now, at("p8", k), 0.8) }}>
            <div style={{ fontSize: 50, fontWeight: 700, color: C.ink }}>— {a}</div>
            <div style={{ fontSize: 32, color: C.dim, marginLeft: 48 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 340, opacity: risk, fontFamily: FONT }}>
        <div style={{ fontSize: 50, color: C.dim, maxWidth: 1300 }}>When defense is fashionable, money chases the best story.</div>
        <div style={{ fontSize: 66, fontWeight: 700, color: C.ink, marginTop: 40, opacity: ramp(now, at("p8", "A heat exchanger doesn't pitch"), 0.6) }}>A heat exchanger doesn't pitch well.</div>
        <div style={{ fontSize: 66, fontWeight: 700, color: C.amber, marginTop: 10, opacity: ramp(now, at("p8", "A swarm of autonomous jets"), 0.6) }}>A swarm of autonomous jets does.</div>
      </div>
    </>
  );
};

/* ---------------- CLOSE ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const box = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("close", "And a flood of new money"), 1));
  const flood = ramp(now, at("close", "And a flood of new money"), 1) * (1 - ramp(now, at("close", "These two things look"), 1));
  const pair = ramp(now, at("close", "These two things look"), 1) * (1 - ramp(now, at("close", "One reading"), 1));
  const reading = ramp(now, at("close", "One reading"), 1) * (1 - ramp(now, at("close", "The episode doesn't know"), 1));
  const end = ramp(now, at("close", "The episode doesn't know"), 1);
  return (
    <>
      <Svg>
        <Box x={960} y={520} s={1.1} now={now} heat={0.7} opacity={box} />
        <Box x={960} y={700} s={0.7} now={now} heat={0.7} opacity={end * ramp(now, at("close", "But it knows somebody"), 1.2)} />
      </Svg>
      <Label x={560} y={820} w={800} size={44} weight={700} color={C.dim} text="Nobody films it." show={box * ramp(now, at("close", "Nobody films it"), 0.6)} />
      <div style={{ position: "absolute", left: 300, top: 320, opacity: flood, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, maxWidth: 1300 }}>Drones, missiles, boats, engines, parts, factories.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 30 }}>Ohio · Texas · New Mexico · Arizona · Alabama</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: pair, fontFamily: FONT, fontSize: 60, fontWeight: 700, lineHeight: 1.5 }}>
        <div style={{ color: C.dim }}>The old firms and the new firms.</div>
        <div style={{ color: C.dim, opacity: ramp(now, at("close", "The dinosaurs and the unicorns"), 0.6) }}>The dinosaurs and the unicorns.</div>
        <div style={{ color: C.ink, opacity: ramp(now, at("close", "But they need each other"), 0.6) }}>They need each other.</div>
      </div>
      <Tag x={220} y={160} text="INTERPRETATION · ONE READING" show={reading} />
      <div style={{ position: "absolute", left: 300, top: 280, opacity: reading, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 58, fontWeight: 700, color: C.ink }}>2026: the year America decided to build things again?</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 40, opacity: ramp(now, at("close", "If that reading is right"), 0.6) }}>If so, the people who fill those factories are teenagers now:</div>
        {[["racing drones in garages", "Some of them are racing"], ["playing video games in basements", "Some are playing"], ["in a class in Pickaway County, learning a five-axis machine", "Some are in a high school"]].map(([t, k]) => (
          <div key={t} style={{ fontSize: 42, color: C.amber, marginTop: 14, opacity: ramp(now, at("close", k), 0.6) }}>{t}</div>
        ))}
        <div style={{ fontSize: 38, color: C.dim, marginTop: 40, opacity: ramp(now, at("close", "And if that reading is wrong"), 0.6) }}>If not: lost money, and quiet buildings in the farmland.</div>
      </div>
      <Label x={300} y={220} w={1300} size={60} weight={700} color={C.ink} text="The episode doesn't know which." show={end} />
      <Label x={300} y={320} w={1300} size={60} weight={700} color={C.amber} text="But somebody still has to build the box." show={end * ramp(now, at("close", "But it knows somebody"), 0.8)} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: the solid rocket motor under every cheap missile." show={ramp(now, s.start, 1)} />;
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

export const _unused = { H, clamp };
