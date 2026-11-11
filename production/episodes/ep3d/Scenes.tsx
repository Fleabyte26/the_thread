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

/** Generic narrowbody airliner, top view, nose up, ~1 unit = 1 px at s=1 (about 120 x 120). */
const Liner: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number; tail?: string }> = ({ x, y, s = 1, color = C.steel, opacity = 1, tail }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <rect x={-7} y={-60} width={14} height={120} rx={7} fill={color} />
    <path d="M-6,-10 L-60,18 L-60,26 L-6,12 Z M6,-10 L60,18 L60,26 L6,12 Z" fill={color} />
    <path d="M-5,44 L-24,56 L-24,60 L-5,56 Z M5,44 L24,56 L24,60 L5,56 Z" fill={color} />
    <rect x={-30} y={4} width={7} height={14} rx={3} fill={C.faint} />
    <rect x={23} y={4} width={7} height={14} rx={3} fill={C.faint} />
    {tail ? <rect x={-3} y={46} width={6} height={14} fill={tail} /> : null}
  </g>
);

/** Rows of parked airliners. */
const Rows: React.FC<{ n: number; x0: number; y0: number; cols: number; dx: number; dy: number; s: number; opacity: number; hi?: number; color?: string }> = ({ n, x0, y0, cols, dx, dy, s, opacity, hi = 0, color = C.steel }) => {
  const tails = [C.red, C.teal, C.amber, C.dim];
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => (
        <Liner key={i} x={x0 + (i % cols) * dx} y={y0 + Math.floor(i / cols) * dy} s={s} color={i < hi ? C.amber : color} tail={tails[i % 4]} />
      ))}
    </g>
  );
};

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const rows = ramp(now, s.start + 0.3, 2.5) * (1 - ramp(now, at("cold", "At the end of its life"), 1));
  const places = ["Victorville", "Mojave", "Roswell", "Marana"];
  const price = ramp(now, at("cold", "At the end of its life"), 1) * (1 - ramp(now, at("cold", "In Episode 2, this series"), 1));
  const ep2 = ramp(now, at("cold", "In Episode 2, this series"), 1) * (1 - ramp(now, at("cold", "And the reason it was wrong"), 1));
  const wrong = ramp(now, at("cold", "This episode says"), 0.8);
  const y1690 = ramp(now, at("cold", "And the reason it was wrong") + 1.1, 1.2);
  return (
    <>
      <Svg>
        <Rows n={60} x0={170} y0={300} cols={12} dx={145} dy={130} s={0.85} opacity={rows} />
      </Svg>
      <div style={{ position: "absolute", left: 170, top: 150, display: "flex", gap: 60, opacity: rows, fontFamily: FONT }}>
        {places.map((p) => (
          <div key={p} style={{ fontSize: 44, fontWeight: 700, color: C.ink, opacity: ramp(now, at("cold", p), 0.6) }}>{p}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: price }}>
        <Stat x={0} y={0} value="~$2M" label="a 20-year-old 737-800 at the end of its life" show={1} color={C.amber} size={130} />
        <Stat x={760} y={0} value="$100M+" label="list prices for a new 737" show={ramp(now, at("cold", "List prices run past"), 1)} size={130} color={C.dim} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 280, opacity: ep2, fontFamily: FONT }}>
        <div style={{ fontSize: 36, color: C.dim }}>Episode 2: The Arsenal We Already Have</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 20 }}>A reserve of 737 arsenal jets behind drones on the island chains</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 40, opacity: ramp(now, at("cold", "And it assumed"), 0.8) }}>
          Assumption: <span style={{ color: C.red, textDecoration: wrong > 0.5 ? "line-through" : "none" }}>new jets</span>
        </div>
      </div>
      <Label x={360} y={400} w={1200} size={160} weight={700} color={C.amber} text="1690" show={y1690} />
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

/* ---------------- P1: FLEET IN BEING ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const map = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("p1", "The phrase \"fleet in being\""), 1));
  const battle = ramp(now, at("p1", "He fought at Beachy Head"), 1);
  const exist = ramp(now, at("p1", "The English fleet, beaten"), 1);
  const doc = ramp(now, at("p1", "The phrase \"fleet in being\""), 1) * (1 - ramp(now, at("p1", "The cleanest modern example"), 1));
  const ww1 = ramp(now, at("p1", "The cleanest modern example"), 1) * (1 - ramp(now, at("p1", "A fleet in being deters"), 1));
  const key = ramp(now, at("p1", "A fleet in being deters"), 1);
  return (
    <>
      <Svg>
        <g opacity={map} fontFamily={FONT}>
          {/* stylised Channel: England top, France bottom */}
          <path d="M120,120 L1800,120 L1800,330 Q1400,380 1000,350 Q600,320 120,360 Z" fill="#16222d" />
          <path d="M120,800 Q600,740 1000,760 Q1400,780 1800,720 L1800,980 L120,980 Z" fill="#16222d" />
          <text x={200} y={200} fontSize={36} fill={C.dim}>ENGLAND</text>
          <text x={200} y={900} fontSize={36} fill={C.dim}>FRANCE</text>
          <text x={1500} y={420} fontSize={28} fill={C.dim}>Beachy Head</text>
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={"f" + i} cx={900 + (i % 6) * 70} cy={600 - Math.floor(i / 6) * 60 - battle * 60} r={18} fill={C.red} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={"e" + i} cx={1100 + i * 60 - battle * 80} cy={430 + (i % 2) * 30} r={16} fill={C.steel} opacity={i < 7 - Math.round(battle * 2) ? 1 : 0.25} />
          ))}
        </g>
      </Svg>
      <Label x={200} y={1000} w={1400} size={34} color={C.dim} text="1690 · English fleet (grey) · stronger French fleet (red)" show={map * (1 - exist)} />
      <Label x={200} y={1000} w={1600} size={36} color={C.amber} text="Lost the battle. Kept the fleet. No invasion." show={map * exist} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: doc, fontFamily: FONT }}>
        {[
          ["1690", "Torrington: \"fleet in being\"", C.amber, "The phrase"],
          ["1891", "Philip Colomb builds the doctrine", C.ink, "In 1891"],
          ["Mahan", "skeptical: a weaker fleet's deterrence is overrated", C.dim, "Alfred Thayer Mahan"],
          ["Corbett", "more sympathetic", C.teal, "Julian Corbett"],
        ].map(([a, b, col, k]) => (
          <div key={a} style={{ display: "flex", gap: 50, marginBottom: 46, opacity: ramp(now, at("p1", k), 0.8), alignItems: "baseline" }}>
            <div style={{ width: 240, fontSize: 56, fontWeight: 700, color: col }}>{a}</div>
            <div style={{ fontSize: 44, color: C.ink }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: ww1, fontFamily: FONT }}>
        <Stat x={0} y={0} value="1914–1918" label="Germany's High Seas Fleet: mostly in port. One great battle, Jutland, 1916." show={1} />
        <Label x={0} y={300} w={1400} size={44} color={C.ink} text="Because it existed, the British Grand Fleet stayed tied down in the North Sea for four years." show={ramp(now, at("p1", "But because it existed"), 1)} />
      </div>
      <Label x={300} y={420} w={1300} size={76} weight={700} color={C.ink} text="A fleet in being deters by existing and being counted." show={key} />
    </>
  );
};

/* ---------------- P2: WHAT EPISODE 2 GOT WRONG ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const pieces = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p2", "But in the episode's notes"), 1));
  const assume = ramp(now, at("p2", "But in the episode's notes"), 1) * (1 - ramp(now, at("p2", "Think about what that"), 1));
  const det = ramp(now, at("p2", "Think about what that"), 1) * (1 - ramp(now, at("p2", "Why would anyone build"), 1));
  const q = ramp(now, at("p2", "Why would anyone build"), 1);
  const items = [
    ["Rapid Dragon", "cargo aircraft launch cruise missiles on pallets", "The Air Force's Rapid Dragon"],
    ["P-8 Poseidon", "a 737 turned into a warplane", "The P-8 Poseidon had shown"],
    ["X-68A · AFLRW", "long-range weapons launched from far back", "The X-68A LongShot"],
    ["= arsenal jets", "a 737 reserve, about a dozen missiles each", "Put those together"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: pieces, fontFamily: FONT }}>
        {items.map(([a, b, k], i) => (
          <div key={a} style={{ display: "flex", gap: 50, marginBottom: 40, opacity: ramp(now, at("p2", k), 0.8), alignItems: "baseline" }}>
            <div style={{ width: 460, fontSize: 52, fontWeight: 700, color: i === 3 ? C.amber : C.ink }}>{a}</div>
            <div style={{ fontSize: 38, color: C.dim }}>{b}</div>
          </div>
        ))}
        <div style={{ fontSize: 34, color: C.dim, marginTop: 30, opacity: ramp(now, at("p2", "To be clear again"), 0.8) }}>Nobody in the Pentagon has proposed this. The author's synthesis.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 300, opacity: assume, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>Episode 2's notes:</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.ink, marginTop: 20 }}>airframes from new production at Renton</div>
        <div style={{ fontSize: 40, color: C.red, marginTop: 40, opacity: ramp(now, at("p2", "And it admitted"), 0.8) }}>…without checking how many old jets there were.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 280, opacity: det, fontFamily: FONT }}>
        {[["A deterrent.", "The plan is a deterrent"], ["Its job: exist and be counted.", "Its job is to exist"], ["Active life in a war: a year, maybe less.", "If a war ever came"], ["The rest: parked in a desert, waiting.", "Most of its life"]].map(([t, k]) => (
          <div key={t} style={{ fontSize: 58, fontWeight: 700, color: C.ink, marginBottom: 26, opacity: ramp(now, at("p2", k), 0.8) }}>{t}</div>
        ))}
      </div>
      <Svg>
        <Rows n={8} x0={1200} y0={760} cols={4} dx={140} dy={140} s={0.9} opacity={q} color={C.ink} />
      </Svg>
      <Label x={200} y={300} w={1500} size={72} weight={700} color={C.ink} text="Why build white tails at $80 million a copy to store in the desert..." show={q} />
      <Label x={200} y={560} w={900} size={56} weight={700} color={C.amber} text="...when the desert is already full of birds?" show={q * ramp(now, at("p2", "Why would anyone build") + 3, 1)} />
    </>
  );
};

/* ---------------- P3: THE BIRDS ALREADY THERE ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const count = ramp(now, at("p3", "Boeing built 4,991"), 1) * (1 - ramp(now, at("p3", "And here's the detail"), 1));
  const p8 = ramp(now, at("p3", "And here's the detail"), 1);
  const overlay = ramp(now, at("p3", "The P-8 Poseidon, the Navy's"), 2);
  const intro = ramp(now, s.start + 0.3, 1) * (1 - count) * (1 - p8);
  return (
    <>
      <Label x={360} y={440} w={1200} size={64} weight={700} color={C.ink} text="Start with how many there are." show={intro} />
      <div style={{ position: "absolute", left: 220, top: 230, opacity: count }}>
        <Stat x={0} y={0} value="4,991" label="commercial 737-800s built" show={1} size={140} color={C.amber} />
        <Bar x={0} y={300} w={1400} frac={1} label="all 737-800s" value="4,991" color={C.steel} show={ramp(now, at("p3", "Some get a second life"), 1)} />
        <Bar x={0} y={450} w={1400} frac={200 / 4991} label="converted by Boeing to freighters (~4%)" value="~200" color={C.teal} show={ramp(now, at("p3", "Some get a second life") + 1, 1)} />
        <Label x={0} y={620} w={1400} size={40} color={C.dim} text="...and a growing share go to the desert to be taken apart." show={ramp(now, at("p3", "And a growing share"), 1)} />
      </div>
      <Svg>
        <g opacity={p8}>
          <Liner x={960} y={560} s={4} color={C.steel} />
          <g opacity={overlay}>
            <Liner x={960} y={560} s={4} color="rgba(226,163,59,0.35)" />
            <rect x={940} y={520} width={40} height={90} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="10 6" />
            <circle cx={790} cy={640} r={12} fill={C.amber} />
            <circle cx={1130} cy={640} r={12} fill={C.amber} />
          </g>
        </g>
      </Svg>
      <Label x={160} y={180} w={700} size={56} weight={700} color={C.ink} text="P-8 Poseidon = 737-800" show={p8 * overlay} />
      <Label x={160} y={260} w={700} size={32} color={C.dim} text="weapons bay · wing hardpoints · military certification · maintenance · training. Already done." show={p8 * ramp(now, at("p3", "a weapons bay, wing hardpoints"), 1)} />
      <Label x={160} y={880} w={900} size={44} weight={700} color={C.amber} text="It's the airframe sitting in the desert." show={ramp(now, at("p3", "It's the airframe sitting"), 1)} />
    </>
  );
};

/* ---------------- P4: WHAT A BIRD COSTS ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const ladder = ramp(now, s.start + 0.5, 1) * (1 - ramp(now, at("p4", "So the price depends almost entirely"), 1));
  const eng = ramp(now, at("p4", "So the price depends almost entirely"), 1) * (1 - ramp(now, at("p4", "So a tired 737-800"), 1));
  const tired = ramp(now, at("p4", "So a tired 737-800"), 1);
  const max = 110;
  return (
    <>
      <Tag x={220} y={170} text="MARKET RANGES · TRADE SOURCES" color={C.dim} show={Math.max(ladder, eng)} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: ladder }}>
        <Bar x={0} y={0} w={1300} frac={1} label="new 737: list price" value="$100M+" color={C.faint} show={ramp(now, at("p4", "A new 737 has a list price"), 1)} dashed />
        <Bar x={0} y={150} w={1300} frac={70 / max} label="new 737 MAX: what actually changes hands" value="high tens of millions" color={C.steel} show={ramp(now, at("p4", "New 737 MAX jets"), 1)} />
        <Bar x={0} y={300} w={1300} frac={30 / max} label="used 737-800, airline condition" value="~$15–30M" color={C.teal} show={ramp(now, at("p4", "A used 737-800"), 1)} />
        <Label x={0} y={460} w={1400} size={40} color={C.ink} text="At the end of its life: nearly all the value is in the two engines. The airframe is close to scrap." show={ramp(now, at("p4", "On a jet like that"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: eng, fontFamily: FONT }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.ink, marginBottom: 40 }}>One CFM56-7B</div>
        <Bar x={0} y={60} w={1300} frac={3 / 7.1} label="healthy, green time" value="~$3M" color={C.teal} show={ramp(now, at("p4", "A healthy CFM56-7B"), 1)} />
        <Bar x={0} y={210} w={1300} frac={1} label="IBA half-life range" value="$3.8–7.1M" color={C.steel} show={ramp(now, at("p4", "IBA's half-life"), 1)} />
        <Bar x={0} y={360} w={1300} frac={0.75 / 7.1} label="near end of life, sold as a teardown core" value="~$0.5–1M" color={C.amber} show={ramp(now, at("p4", "Sold as a teardown core"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: tired, fontFamily: FONT }}>
        <div style={{ fontSize: 46, color: C.dim }}>A tired 737-800 headed for part-out, engines near the end of their life:</div>
        <div style={{ fontSize: 180, fontWeight: 700, color: C.amber, marginTop: 30 }}>~$2M</div>
      </div>
    </>
  );
};

/* ---------------- P5: THE ONE-YEAR ENGINE ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const life = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p5", "So the plan inverts"), 1));
  const inv = ramp(now, at("p5", "So the plan inverts"), 1) * (1 - ramp(now, at("p5", "Now the rough arithmetic"), 1));
  const tab = ramp(now, at("p5", "Now the rough arithmetic"), 1) * (1 - ramp(now, at("p5", "And then the comparison"), 1));
  const ten = ramp(now, at("p5", "And then the comparison"), 1) * (1 - ramp(now, at("p5", "Or put it the way a buyer"), 1));
  const flea = ramp(now, at("p5", "Or put it the way a buyer"), 1);
  const birds = ramp(now, at("p5", "A hundred and thirty birds"), 2);
  const rows = [
    ["End-of-life 737-800 airframe", "~$2M", C.ink],
    ["Two low-life CFM56-7Bs (if bought separately)", "~$1–2M", C.ink],
    ["Weapons conversion", "unknown", C.red],
    ["Target all-in", "~$10M", C.amber],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: life }}>
        <Bar x={0} y={0} w={1400} frac={1} label="engine life an airline pays for: years of daily flying" value="years" color={C.steel} show={ramp(now, s.start + 1, 1)} />
        <Bar x={0} y={160} w={1400} frac={0.12} label="engine life a one-year deterrent needs: a few hundred missions" value="one year" color={C.amber} show={ramp(now, at("p5", "If the arsenal jet's active mission"), 1)} />
        <Label x={0} y={360} w={1400} size={44} color={C.ink} text="Those are the engines the market sells for teardown." show={ramp(now, at("p5", "Those are the engines"), 1)} />
      </div>
      <Label x={300} y={420} w={1300} size={72} weight={700} color={C.amber} text="The plan buys what everyone else is throwing away." show={inv * ramp(now, at("p5", "The plan buys what"), 0.8)} />
      <Label x={300} y={420} w={1300} size={64} weight={700} color={C.ink} text="So the plan inverts the market." show={inv * (1 - ramp(now, at("p5", "The plan buys what"), 0.8))} />
      <div style={{ position: "absolute", left: 220, top: 240, width: 1480, opacity: tab, fontFamily: FONT }}>
        {rows.map(([a, b, col], i) => (
          <div key={a} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.faint}`, padding: "26px 0", opacity: ramp(now, at("p5", "Now the rough arithmetic") + i * 0.8, 0.6) }}>
            <div style={{ fontSize: 42, color: C.ink, fontWeight: i === 3 ? 700 : 400 }}>{a}</div>
            <div style={{ fontSize: 50, fontWeight: 700, color: col as string }}>{b}</div>
          </div>
        ))}
        <div style={{ fontSize: 34, color: C.dim, marginTop: 30, opacity: ramp(now, at("p5", "Ten million dollars all-in"), 0.8) }}>Ten million all-in is a target, not a sourced number. Even 2–3× that is a fraction of a new jet.</div>
      </div>
      <Svg>
        <g opacity={ten}>
          <text x={480} y={260} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={C.dim}>$800M in new jets</text>
          <Rows n={10} x0={300} y0={360} cols={5} dx={90} dy={120} s={0.6} opacity={1} color={C.dim} />
          <text x={1300} y={260} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={C.amber}>$800M in rebuilt old birds</text>
          <g opacity={ramp(now, at("p5", "The money for ten new white tails") + 3, 1.5)}>
            <Rows n={80} x0={920} y0={340} cols={10} dx={85} dy={80} s={0.55} opacity={1} color={C.amber} />
          </g>
        </g>
      </Svg>
      <Label x={300} y={985} w={1300} size={48} weight={700} color={C.ink} text="Ten jets in the desert, or eighty." show={ten * ramp(now, at("p5", "Ten jets in the desert"), 0.8)} />
      <Svg>
        <g opacity={flea * birds}>
          <Rows n={130} x0={160} y0={430} cols={26} dx={62} dy={95} s={0.42} opacity={1} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 160, top: 160, opacity: flea, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>The desert is a flea market.</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 14, opacity: ramp(now, at("p5", "I'll give you two million"), 0.8) }}>"Two million a copy for all hundred and thirty."</div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 960, opacity: flea * ramp(now, at("p5", "A hundred and thirty birds"), 1), fontFamily: FONT, fontSize: 44, color: C.amber, fontWeight: 700 }}>
        130 × $2M = $260M ≈ three new white tails
      </div>
    </>
  );
};

/* ---------------- P6: THE ENGINE THAT ISN'T SCARCE ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const s = sectionOf("p6");
  const leap = ramp(now, at("p6", "Every new 737 MAX"), 1) * (1 - ramp(now, at("p6", "The old 737-800 flies on the CFM56"), 1));
  const cfm = ramp(now, at("p6", "The old 737-800 flies on the CFM56"), 1) * (1 - ramp(now, at("p6", "The new-build plan competes"), 1));
  const end = ramp(now, at("p6", "The new-build plan competes"), 1);
  const intro = ramp(now, s.start + 0.3, 1) * (1 - leap) * (1 - cfm) * (1 - end);
  return (
    <>
      <Label x={360} y={440} w={1200} size={60} weight={700} color={C.ink} text="It's about engines again." show={intro} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: leap }}>
        <Stat x={0} y={0} value="LEAP" label="the only engine on a new 737 MAX · the narrowbody world's bottleneck" show={1} color={C.red} size={110} />
        <Stat x={0} y={280} value="1,802" label="LEAPs delivered in 2025 · ~15% more planned for 2026, all already committed" show={ramp(now, at("p6", "CFM delivered 1,802"), 1)} />
        <Label x={0} y={560} w={1400} size={40} color={C.ink} text="New jets for the desert would take LEAPs from airlines and slots from Renton." show={ramp(now, at("p6", "So a plan that buys new"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: cfm }}>
        <Stat x={0} y={0} value="CFM56" label="the engine from the locked room (Episode 3a) · best-selling jet engine in history" show={1} color={C.teal} size={110} />
        <Stat x={0} y={280} value="~14,200" label="CFM56s still active" show={ramp(now, at("p6", "About 14,200"), 1)} />
        <Stat x={680} y={280} value="2,500+" label="already in storage or teardown" show={ramp(now, at("p6", "About 14,200") + 2, 1)} color={C.amber} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 360, opacity: end, fontFamily: FONT }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.red }}>New build: competes for the bottleneck.</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.teal, marginTop: 40, opacity: ramp(now, at("p6", "The old-bird plan lives"), 0.8) }}>Old birds: live on the surplus.</div>
      </div>
    </>
  );
};

/* ---------------- P7: PRECEDENT ---------------- */
export const P7: React.FC<P> = ({ now }) => {
  const s = sectionOf("p7");
  const kc = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p7", "So the pieces all exist"), 1));
  const pieces = ramp(now, at("p7", "So the pieces all exist"), 1) * (1 - ramp(now, at("p7", "And storage is cheap"), 1));
  const fee = ramp(now, at("p7", "And storage is cheap"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: kc, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink }}>KC-135E tankers retired</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 20, opacity: ramp(now, at("p7", "When the Air Force retired"), 1) }}>Congress required some kept in protected storage instead of scrapped</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 14, opacity: ramp(now, at("p7", "The Air Force later asked"), 1) }}>The Air Force later asked to let them go</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber, marginTop: 50, opacity: ramp(now, at("p7", "And in April 2026"), 1) }}>April 2026: KC-135s pulled out of the boneyard and flown back into service</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 260, opacity: pieces, fontFamily: FONT }}>
        {[["A storage site.", "A storage site"], ["A preservation process.", "A preservation process"], ["A legal mechanism for keeping jets.", "A legal mechanism"], ["A recent example of bringing them back.", "A recent example"]].map(([t, k]) => (
          <div key={t} style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginBottom: 26, opacity: ramp(now, at("p7", k), 0.6) }}>✓ {t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: fee }}>
        <Stat x={0} y={0} value="$450 / month" label="Victorville base storage fee for a 737 (2019), before maintenance and preservation" show={1} color={C.amber} size={130} />
      </div>
    </>
  );
};

/* ---------------- P8: WHAT DETERS ---------------- */
export const P8: React.FC<P> = ({ now }) => {
  const s = sectionOf("p8");
  const torr = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p8", "A deterrent isn't judged"), 1));
  const cred = ramp(now, at("p8", "A deterrent isn't judged"), 1) * (1 - ramp(now, at("p8", "And that leads to the strangest"), 1));
  const plan = ramp(now, at("p8", "And that leads to the strangest"), 1) * (1 - ramp(now, at("p8", "That isn't a free lunch"), 1));
  const lunch = ramp(now, at("p8", "That isn't a free lunch"), 1);
  return (
    <>
      <Label x={300} y={420} w={1300} size={56} weight={700} color={C.ink} text="Torrington's fleet wasn't the newest or the strongest. It existed, and France had to account for it." show={torr} />
      <div style={{ position: "absolute", left: 220, top: 230, opacity: cred, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim, marginBottom: 40 }}>A deterrent is judged on whether the other side believes it can be done.</div>
        {[
          ["It can be done", "the P-8 already turned this airframe into a warplane", "It can be done, because"],
          ["It can be done fast", "donor jets already parked by the thousands; no factory slot", "It can be done fast"],
          ["It can be done at scale", "engines are the surplus; each bird cheap enough to buy dozens", "It can be done at scale"],
        ].map(([a, b, k]) => (
          <div key={a} style={{ marginBottom: 40, opacity: ramp(now, at("p8", k), 0.8) }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: C.teal }}>✓ {a}</div>
            <div style={{ fontSize: 34, color: C.dim, marginLeft: 56 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: plan, fontFamily: FONT }}>
        <div style={{ fontSize: 90, fontWeight: 700, color: C.amber }}>The plan itself may be the deterrent.</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 50, maxWidth: 1300, opacity: ramp(now, at("p8", "If the other side knows"), 1) }}>Known donor pool + engineered conversion + missiles in production = a reserve that could stand up in months.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 340, opacity: lunch, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink }}>Not a free lunch: some jets must exist, fly and fire where they can be seen.</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.amber, marginTop: 50, opacity: ramp(now, at("p8", "But a cheap plan can afford"), 1) }}>A cheap plan can afford to be visible.</div>
      </div>
    </>
  );
};

/* ---------------- P9: THE CASE AGAINST ---------------- */
export const P9: React.FC<P> = ({ now }) => {
  const s = sectionOf("p9");
  const items = [
    ["The conversion is the unknown", "weapons-capable ≠ freighter; the P-8 was a full program", "The conversion is the unknown"],
    ["Rapid Dragon needs a ramp", "a 737 has none: weapons bay or wing pylons instead", "Rapid Dragon needs a ramp"],
    ["Old jets aren't free to keep", "corrosion, inspections, records, crews, training", "Old jets aren't free"],
    ["The market would notice", "say \"all of them\" and every broker raises his price", "The market would notice"],
    ["The missiles cost more than the trucks", "the magazine is where the money goes", "And the missiles cost more"],
    ["China can do the same", "the symmetry trap (Episode 11)", "And finally: China"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 170, opacity: ramp(now, s.start + 0.3, 1), fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim, marginBottom: 30 }}>The case against</div>
        {items.map(([a, b, k]) => (
          <div key={a} style={{ marginBottom: 26, opacity: ramp(now, at("p9", k), 0.8) }}>
            <div style={{ fontSize: 46, fontWeight: 700, color: C.ink }}>— {a}</div>
            <div style={{ fontSize: 30, color: C.dim, marginLeft: 44 }}>{b}</div>
          </div>
        ))}
      </div>
      <Tag x={1060} y={170} text="BUY QUIETLY: ~10 BIRDS A QUARTER FOR THREE YEARS" show={ramp(now, at("p9", "A plan like this would work best"), 1) * (1 - ramp(now, at("p9", "And the missiles cost more"), 1))} />
    </>
  );
};

/* ---------------- CLOSE: SOUK AND CARD TABLE ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const needs = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("close", "Torrington lost a battle"), 1));
  const sand = ramp(now, at("close", "Torrington lost a battle"), 1) * (1 - ramp(now, at("close", "Maybe the lesson isn't"), 1));
  const souk = ramp(now, at("close", "The first is the souk"), 1) * (1 - ramp(now, at("close", "The second is the card table"), 1));
  const intro = ramp(now, at("close", "Maybe the lesson isn't"), 1) * (1 - souk) * (1 - ramp(now, at("close", "The second is the card table"), 1));
  const cards = ramp(now, at("close", "The second is the card table"), 1) * (1 - ramp(now, at("close", "Buy like the merchant"), 1));
  const triad = ramp(now, at("close", "Buy like the merchant"), 1) * (1 - ramp(now, at("close", "Is it a good idea"), 1));
  const end = ramp(now, at("close", "Is it a good idea"), 1);
  const birds = ramp(now, at("close", "But it knows the birds"), 1.5);
  const interp = Math.max(souk, cards);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 260, opacity: needs, fontFamily: FONT, fontSize: 56, fontWeight: 700, color: C.ink, lineHeight: 1.5 }}>
        {[["Not new jets. Old ones.", "It needs old ones"], ["The engines nobody else wants.", "It needs the engines"], ["A desert and a storage fee that rounds to nothing.", "It needs a desert"], ["And the other side knowing all of it.", "And it needs the other side"]].map(([t, k]) => (
          <div key={t} style={{ opacity: ramp(now, at("close", k), 0.8) }}>{t}</div>
        ))}
      </div>
      <Svg>
        <Rows n={48} x0={200} y0={360} cols={12} dx={140} dy={130} s={0.8} opacity={sand * ramp(now, at("close", "Torrington lost a battle") + 1, 1)} />
      </Svg>
      <Label x={200} y={180} w={1500} size={44} weight={700} color={C.amber} text="Rows in the sand outside Victorville, at something like two million dollars a copy." show={sand * ramp(now, at("close", "with bagged engines"), 1)} />
      <Label x={300} y={440} w={1300} size={60} weight={700} color={C.ink} text="Maybe it's about two old ways of doing business." show={intro} />
      <Tag x={220} y={160} text="INTERPRETATION · ONE READING" show={interp} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: souk, fontFamily: FONT, display: "flex", gap: 80 }}>
        <div style={{ width: 720 }}>
          <div style={{ fontSize: 34, color: C.amber, letterSpacing: 4 }}>THE SOUK</div>
          {[["never shows how much he wants it", "The merchant who does well"], ["patient; comes back next week", "He's patient"], ["keeps more than one seller in play", "He keeps more than one"], ["can always walk away", "And he can always walk away"]].map(([t, k]) => (
            <div key={t} style={{ fontSize: 40, color: C.ink, marginTop: 24, opacity: ramp(now, at("close", k), 0.6) }}>{t}</div>
          ))}
        </div>
        <div style={{ width: 720, opacity: ramp(now, at("close", "American defense procurement"), 1) }}>
          <div style={{ fontSize: 34, color: C.red, letterSpacing: 4 }}>THE PENTAGON</div>
          {[["publishes what it wants, years ahead", "It publishes exactly"], ["single suppliers: nowhere to walk", "It buys from single suppliers"], ["contracts with little reason to haggle", "It signs contracts"], ["treats walking away as failure", "And it treats walking away"]].map(([t, k]) => (
            <div key={t} style={{ fontSize: 40, color: C.ink, marginTop: 24, opacity: ramp(now, at("close", k), 0.6) }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: cards, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.amber, letterSpacing: 4 }}>THE CARD TABLE</div>
        <div style={{ fontSize: 50, color: C.dim, marginTop: 30, opacity: ramp(now, at("close", "The bluff is the part"), 0.8) }}>Pure bluff: gets called eventually.</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 24, opacity: ramp(now, at("close", "What wins is the semi-bluff"), 0.8) }}>Semi-bluff: a hand that could become strong.</div>
        <div style={{ fontSize: 46, color: C.amber, marginTop: 50, maxWidth: 1450, opacity: ramp(now, at("close", "A hundred and thirty jets bought"), 0.8) }}>130 birds at $2M a copy, a known conversion, missiles in production: not yet a force, but could become one in months.</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 40, maxWidth: 1450, opacity: ramp(now, at("close", "And the honest limit"), 0.8) }}>And show real cards sometimes: a few birds converted, flying and firing where they can be seen.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: triad, fontFamily: FONT, fontSize: 76, fontWeight: 700, lineHeight: 1.45 }}>
        <div style={{ color: C.ink }}>Buy like the merchant in the souk.</div>
        <div style={{ color: C.ink, opacity: ramp(now, at("close", "Fight like the player"), 0.6) }}>Fight like the player at the table.</div>
        <div style={{ color: C.amber, opacity: ramp(now, at("close", "And show your cards"), 0.6) }}>Show your cards just often enough.</div>
      </div>
      <Svg>
        <Rows n={36} x0={240} y0={560} cols={12} dx={130} dy={120} s={0.75} opacity={end * birds} />
      </Svg>
      <Label x={300} y={260} w={1300} size={60} weight={700} color={C.ink} text="The episode doesn't know." show={end * ramp(now, at("close", "The episode doesn't know"), 0.8)} />
      <Label x={300} y={360} w={1300} size={60} weight={700} color={C.amber} text="But it knows the birds are there." show={end * birds} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: what it actually takes to put weapons on a 737." show={ramp(now, s.start, 1)} />;
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
