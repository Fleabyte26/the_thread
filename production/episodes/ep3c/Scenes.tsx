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

/** Generic twin-tail stealth fighter, top view. */
const Stealth: React.FC<{ x: number; y: number; s?: number; heat?: number; opacity?: number }> = ({ x, y, s = 1, heat = 0, opacity = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={60} rx={160 * heat} ry={220 * heat} fill={C.red} opacity={0.18 * heat} />
    <path d="M0,-210 L30,-110 L50,-20 L200,60 L200,95 L60,90 L60,140 L130,190 L120,210 L0,190 L-120,210 L-130,190 L-60,140 L-60,90 L-200,95 L-200,60 L-50,-20 L-30,-110 Z" fill={C.steel} />
  </g>
);

/** Generic tailless diamond trijet, top view. */
const Trijet: React.FC<{ x: number; y: number; s?: number; opacity?: number; dorsal?: number; label?: number }> = ({ x, y, s = 1, opacity = 1, dorsal = 0, label = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <path d="M0,-260 L90,-80 L300,140 L120,170 L0,150 L-120,170 L-300,140 L-90,-80 Z" fill={C.steel} />
    {[-70, 70].map((ex) => <rect key={ex} x={ex - 22} y={130} width={44} height={36} rx={6} fill={C.faint} />)}
    <rect x={-22} y={100} width={44} height={36} rx={6} fill={dorsal ? C.amber : C.faint} />
    <rect x={-14} y={-30} width={28} height={40} rx={4} fill={C.faint} />
    <g opacity={label} fontFamily={FONT} fontSize={26} textAnchor="middle">
      <text x={-150} y={215} fill={C.dim}>engine</text>
      <text x={150} y={215} fill={C.dim}>engine</text>
      <text x={0} y={-50} fill={C.amber}>dorsal intake</text>
    </g>
  </g>
);

/** Generic B-52-like bomber, top view, 4 pods per side shown as 4 pods total of 2. */
const Bomber8: React.FC<{ x: number; y: number; s?: number; opacity?: number; pods?: string }> = ({ x, y, s = 1, opacity = 1, pods = C.faint }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <rect x={-22} y={-280} width={44} height={540} rx={20} fill={C.steel} />
    <path d="M-20,-60 L-440,90 L-440,115 L-20,30 Z" fill={C.steel} />
    <path d="M20,-60 L440,90 L440,115 L20,30 Z" fill={C.steel} />
    <path d="M-15,210 L-140,260 L-140,275 L-15,250 Z M15,210 L140,260 L140,275 L15,250 Z" fill={C.steel} />
    {[-110, -250, 110, 250].map((px) => (
      <g key={px}>
        <rect x={px - 30} y={(Math.abs(px) - 20) * 0.36 - 60} width={24} height={70} rx={8} fill={pods} />
        <rect x={px + 6} y={(Math.abs(px) - 20) * 0.36 - 60} width={24} height={70} rx={8} fill={pods} />
      </g>
    ))}
  </g>
);

/** Turbofan streams diagram. streams: 2 or 3. */
const Streams: React.FC<{ x: number; y: number; third: number; opacity: number }> = ({ x, y, third, opacity }) => (
  <g transform={`translate(${x},${y})`} opacity={opacity} fontFamily={FONT}>
    <rect x={-500} y={-40} width={1000} height={80} rx={10} fill={C.red} opacity={0.8} />
    <text x={0} y={12} textAnchor="middle" fontSize={30} fill={C.ink} fontWeight={700}>core stream</text>
    <rect x={-500} y={-120} width={1000} height={60} rx={10} fill={C.steel} opacity={0.7} />
    <rect x={-500} y={60} width={1000} height={60} rx={10} fill={C.steel} opacity={0.7} />
    <text x={0} y={-80} textAnchor="middle" fontSize={26} fill={C.ink}>bypass stream</text>
    <g opacity={third}>
      <rect x={-500} y={-200} width={1000} height={56} rx={10} fill={C.teal} opacity={0.85} />
      <rect x={-500} y={144} width={1000} height={56} rx={10} fill={C.teal} opacity={0.85} />
      <text x={0} y={-162} textAnchor="middle" fontSize={26} fill={C.bg} fontWeight={700}>third stream: switchable, and a heat sink</text>
    </g>
  </g>
);

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const jet = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("cold", "Meanwhile, over Chengdu"), 1));
  const heat = ramp(now, at("cold", "Every sensor"), 6);
  const word1 = ramp(now, at("cold", "It's electricity"), 0.6) * (1 - ramp(now, at("cold", "Every sensor"), 0.8));
  const tri = ramp(now, at("cold", "Meanwhile, over Chengdu"), 1.5) * (1 - ramp(now, at("cold", "The jet engine used to be"), 1));
  const word2 = ramp(now, at("cold", "Electricity."), 0.6) * (1 - ramp(now, at("cold", "The jet engine used to be"), 0.8));
  const shift = ramp(now, at("cold", "The jet engine used to be"), 1);
  return (
    <>
      <Svg>
        <Stealth x={960} y={560} s={1.25} heat={heat} opacity={jet} />
        <Trijet x={960} y={560} s={1.1} opacity={tri} />
      </Svg>
      <div style={{ position: "absolute", left: 1320, top: 360, opacity: jet * heat, fontFamily: FONT }}>
        {["power demand", "heat"].map((t, i) => (
          <div key={t} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 26, color: C.dim }}>{t}</div>
            <div style={{ width: 380, height: 30, border: `1px solid ${C.faint}` }}>
              <div style={{ width: 380 * clamp(heat * (1.1 - i * 0.05)), height: "100%", background: i ? C.red : C.amber }} />
            </div>
          </div>
        ))}
        <div style={{ fontSize: 26, color: C.red, opacity: ramp(now, at("cold", "operated outside"), 1) }}>"operated outside its design specifications"</div>
      </div>
      <Label x={160} y={140} w={900} size={110} weight={700} color={C.amber} text="Electricity." show={Math.max(word1, word2)} />
      <div style={{ position: "absolute", left: 300, top: 360, opacity: shift, fontFamily: FONT }}>
        <div style={{ fontSize: 64, color: C.dim }}>The engine pushes the airplane.</div>
        <div style={{ fontSize: 72, fontWeight: 700, color: C.ink, marginTop: 40, opacity: ramp(now, at("cold", "Somewhere around the F-35"), 1) }}>The engine powers the airplane.</div>
      </div>
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
      <div style={{ fontFamily: FONT, fontSize: 120, fontWeight: 700, color: C.ink, letterSpacing: -3, marginTop: 10 }}>{EP.title}</div>
    </div>
  );
};

/* ---------------- P1: F135 / XA100 / ECU ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const intro = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p1", "GE had built a working answer"), 1));
  const xa = ramp(now, at("p1", "GE had built a working answer"), 1) * (1 - ramp(now, at("p1", "In March 2023"), 1));
  const third = ramp(now, at("p1", "three air streams"), 1.5);
  const pick = ramp(now, at("p1", "In March 2023"), 1) * (1 - ramp(now, at("p1", "So the Engine Core Upgrade"), 1));
  const ecu = ramp(now, at("p1", "So the Engine Core Upgrade"), 1);
  const steps = [
    ["Jul 2024", "preliminary design review", "Pratt passed preliminary"],
    ["Sep 2025", "contract worth up to $1.3B", "It got a contract"],
    ["Sep 15, 2026", "Risk Reduction Design Review", "On September 15, 2026"],
    ["late 2027", "ground testing", "Ground testing is planned"],
    ["~2030", "flight testing", "Ground testing is planned"],
    ["~2031", "production", "Ground testing is planned"],
    ["past 2031 (~2033)", "Block 4 items that need the new core", "Several Block 4"],
  ];
  return (
    <>
      <Label x={300} y={440} w={1300} size={52} weight={700} color={C.ink} text="An engine asked for more power and cooling than it was designed to give." show={intro} />
      <Svg>
        <Streams x={960} y={560} third={third} opacity={xa} />
      </Svg>
      <Label x={460} y={220} w={1000} size={40} weight={700} color={C.ink} text="GE XA100 · adaptive cycle · testing from December 2020" show={xa} />
      <Label x={460} y={830} w={1100} size={34} color={C.amber} text="GE's claim: +10% thrust, +25% fuel efficiency" show={xa * ramp(now, at("p1", "GE claimed 10 percent"), 1)} />
      <div style={{ position: "absolute", left: 220, top: 260, opacity: pick, fontFamily: FONT, display: "flex", gap: 80 }}>
        <div style={{ width: 640, padding: 40, border: `3px solid ${C.faint}` }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: C.dim, textDecoration: "line-through" }}>New adaptive engine</div>
          <div style={{ fontSize: 30, color: C.dim, marginTop: 14 }}>XA100</div>
        </div>
        <div style={{ width: 640, padding: 40, border: `3px solid ${C.amber}` }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: C.amber }}>F135 core upgrade</div>
          <div style={{ fontSize: 30, color: C.dim, marginTop: 14 }}>chosen March 2023: cost, integration risk, schedule</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 200, opacity: ecu, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, marginBottom: 30 }}>F135 Engine Core Upgrade: drop-in for all three F-35 variants</div>
        {steps.map(([d, t, k], i) => (
          <div key={i} style={{ display: "flex", gap: 40, marginBottom: 22, opacity: ramp(now, at("p1", k) + (i >= 4 && i <= 5 ? (i - 3) * 1.2 : 0), 0.7), alignItems: "baseline" }}>
            <div style={{ width: 380, fontSize: 40, fontWeight: 700, color: i === 6 ? C.red : C.ink }}>{d}</div>
            <div style={{ fontSize: 34, color: C.dim }}>{t}</div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ---------------- P2: NGAP / F-47 ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const f47 = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p2", "The F-47 is supposed to fly"), 1));
  const tl = ramp(now, at("p2", "The F-47 is supposed to fly"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 220, opacity: f47, fontFamily: FONT }}>
        <div style={{ fontSize: 36, color: C.dim, opacity: ramp(now, at("p2", "Boeing won the F-47"), 1) }}>Boeing F-47 · contract March 21, 2025 · Next Generation Adaptive Propulsion</div>
        <div style={{ display: "flex", gap: 80, marginTop: 60, opacity: ramp(now, at("p2", "Two contenders"), 1) }}>
          <div style={{ width: 640, padding: 40, border: `3px solid ${C.amber}` }}>
            <div style={{ fontSize: 80, fontWeight: 700, color: C.amber }}>XA102</div>
            <div style={{ fontSize: 32, color: C.dim, marginTop: 10 }}>GE · from the XA100</div>
            <div style={{ fontSize: 30, color: C.ink, marginTop: 30, opacity: ramp(now, at("p2", "Pratt finished on May 8"), 1) }}>assembly readiness: May 11, 2026</div>
          </div>
          <div style={{ width: 640, padding: 40, border: `3px solid ${C.steel}` }}>
            <div style={{ fontSize: 80, fontWeight: 700, color: C.steel }}>XA103</div>
            <div style={{ fontSize: 32, color: C.dim, marginTop: 10 }}>Pratt & Whitney · F135 tooling and supply chain</div>
            <div style={{ fontSize: 30, color: C.ink, marginTop: 30, opacity: ramp(now, at("p2", "Pratt finished on May 8"), 1) }}>assembly readiness: May 8, 2026</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: tl, fontFamily: FONT }}>
        {[["2028", "F-47 first flight, probably on an interim engine", "The F-47 is supposed to fly"], ["~2030", "production NGAP engine", "The production NGAP engine"]].map(([d, t, k]) => (
          <div key={d} style={{ display: "flex", gap: 50, marginBottom: 40, opacity: ramp(now, at("p2", k), 0.8), alignItems: "baseline" }}>
            <div style={{ width: 220, fontSize: 64, fontWeight: 700, color: C.ink }}>{d}</div>
            <div style={{ fontSize: 44, color: C.dim }}>{t}</div>
          </div>
        ))}
        <div style={{ fontSize: 40, color: C.amber, marginTop: 60, opacity: ramp(now, at("p2", "The F-14 flew on TF30s"), 1) }}>Precedent: F-14A on TF30s for years → F110 (Episode 3b)</div>
      </div>
    </>
  );
};

/* ---------------- P3: B-52 / F130 ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const b = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("p3", "The program cleared"), 1));
  const pods = ramp(now, at("p3", "In September 2021"), 1.5);
  const facts = ramp(now, at("p3", "The program cleared"), 1) * (1 - ramp(now, at("p3", "The bomber that the B-1"), 1));
  const irony = ramp(now, at("p3", "The bomber that the B-1"), 1);
  return (
    <>
      <Svg>
        <Bomber8 x={1200} y={600} s={0.85} opacity={b} pods={pods > 0.5 ? C.teal : C.faint} />
      </Svg>
      <div style={{ position: "absolute", left: 140, top: 180, opacity: b * pods, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.teal }}>Rolls-Royce F130</div>
        <div style={{ fontSize: 30, color: C.dim, marginTop: 10 }}>picked September 2021 · all 76 B-52Hs</div>
        <div style={{ fontSize: 30, color: C.dim, marginTop: 8, opacity: ramp(now, at("p3", "608 engines"), 1) }}>608 engines · assembled in Indianapolis · from the Gulfstream BR725</div>
        <div style={{ fontSize: 30, color: C.dim, marginTop: 8, opacity: ramp(now, at("p3", "The BR700 family"), 1) }}>BR700 family: Rolls-Royce and BMW, 1990s</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: facts }}>
        <Stat x={0} y={0} value="May 4, 2026" label="full Critical Design Review cleared · test engines expected 2027" show={1} size={76} />
        <Stat x={0} y={250} value="~$15B" label="re-engining estimate" show={ramp(now, at("p3", "The re-engining is estimated"), 1)} color={C.amber} />
        <Stat x={560} y={250} value="$48.6B" label="wider B-52 modernization (Pentagon IG)" show={ramp(now, at("p3", "The re-engining is estimated") + 2, 1)} />
        <Stat x={0} y={500} value="B-52J" label="into the 2050s: about 100 years after the first B-52 flew" show={ramp(now, at("p3", "The re-engined jets will be called"), 1)} color={C.teal} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: irony, fontFamily: FONT }}>
        <div style={{ fontSize: 58, fontWeight: 700, color: C.ink, maxWidth: 1300 }}>The bomber the B-1 was meant to replace will outlive the B-1.</div>
        <div style={{ fontSize: 42, color: C.dim, marginTop: 40, maxWidth: 1300, opacity: ramp(now, at("p3", "And it'll do it on an engine"), 1) }}>On a business-jet engine, British-German in design, built in Indiana.</div>
        <div style={{ fontSize: 46, color: C.amber, marginTop: 50, opacity: ramp(now, at("p3", "The locked room has a lot of doors"), 1) }}>The locked room has a lot of doors now.</div>
      </div>
    </>
  );
};

/* ---------------- P4: J-36 ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const jet = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("p4", "Why three engines?"), 1));
  const lbl = ramp(now, at("p4", "It had three engines"), 1);
  const size = ramp(now, at("p4", "Estimates of its size vary"), 1);
  const why = ramp(now, at("p4", "Why three engines?"), 1) * (1 - ramp(now, at("p4", "The author wants to push"), 1));
  const hyp = ramp(now, at("p4", "The author wants to push"), 1) * (1 - ramp(now, at("p4", "What isn't speculation"), 1));
  const comp = ramp(now, at("p4", "The American answer is one engine"), 1);
  const fact = ramp(now, at("p4", "What isn't speculation"), 1);
  const cards = [
    ["One", "Engines not strong enough yet", "WS-10C as interim? WS-15? WS-19? None confirmed.", "One: China's engines"],
    ["Two", "Endurance and supercruise", "more thrust without afterburner", "Two: endurance"],
    ["Three", "Electricity", "radar, EW, computing for drones, maybe lasers or microwaves", "Three: electricity"],
  ];
  return (
    <>
      <Svg>
        <Trijet x={1260} y={560} s={1.0} opacity={jet} label={lbl} />
        <g opacity={hyp * (1 - comp)}>
          <Trijet x={1300} y={560} s={1.0} dorsal={1} label={1} />
          <text x={1300} y={850} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={C.amber}>a generator, not a third thruster?</text>
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 140, top: 200, opacity: jet, fontFamily: FONT }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.ink }}>"J-36" (serial 36011)</div>
        <div style={{ fontSize: 32, color: C.dim, marginTop: 14 }}>first filmed over Chengdu: Dec 26, 2024</div>
        <div style={{ fontSize: 32, color: C.dim, marginTop: 8, opacity: ramp(now, at("p4", "On June 28, 2026"), 1) }}>in an official PLA video: June 28, 2026</div>
        <div style={{ fontSize: 32, color: C.dim, marginTop: 8, opacity: ramp(now, at("p4", "At least three or four"), 1) }}>3–4 prototypes seen</div>
        <div style={{ marginTop: 60, opacity: size }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: C.amber }}>50–60 t</div><div style={{ fontSize: 26, color: C.dim }}>estimated max takeoff weight</div>
          <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, marginTop: 20 }}>~75 ft · bay ~25 ft</div><div style={{ fontSize: 26, color: C.dim }}>one analysis</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 220, opacity: why, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginBottom: 40 }}>Why three engines?</div>
        {cards.map(([n, t, sub, k], i) => (
          <div key={n} style={{ display: "flex", gap: 30, marginBottom: 34, opacity: ramp(now, at("p4", k), 0.8) }}>
            <div style={{ width: 150, fontSize: 40, fontWeight: 700, color: i === 2 ? C.amber : C.dim }}>{n}</div>
            <div>
              <div style={{ fontSize: 46, fontWeight: 700, color: i === 2 ? C.amber : C.ink }}>{t}</div>
              <div style={{ fontSize: 30, color: C.dim, marginTop: 6 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
      <Tag x={140} y={200} text="INFERENCE · AUTHOR'S HYPOTHESIS" show={hyp} />
      <div style={{ position: "absolute", left: 140, top: 290, opacity: hyp * (1 - comp), fontFamily: FONT, maxWidth: 820 }}>
        <div style={{ fontSize: 44, color: C.ink, fontWeight: 600 }}>Suppose the dorsal engine is different: another bypass ratio, built to drive a generator and supply cooling air.</div>
        <div style={{ fontSize: 44, color: C.amber, fontWeight: 700, marginTop: 40, opacity: ramp(now, at("p4", "It's a two-engine fighter carrying"), 1) }}>A two-engine fighter carrying its own power plant.</div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 300, opacity: comp * (1 - fact), fontFamily: FONT, display: "flex", gap: 80 }}>
        <div style={{ width: 760, padding: 40, border: `3px solid ${C.steel}` }}>
          <div style={{ fontSize: 30, color: C.dim }}>United States</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 10 }}>One engine, three streams</div>
        </div>
        <div style={{ width: 760, padding: 40, border: `3px solid ${C.amber}`, opacity: ramp(now, at("p4", "The Chinese answer might be"), 1) }}>
          <div style={{ fontSize: 30, color: C.dim }}>China (maybe)</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: C.amber, marginTop: 10 }}>Three engines, different jobs</div>
        </div>
      </div>
      <Label x={160} y={680} w={1600} size={36} color={C.red} text="No public source has confirmed a different engine in the dorsal position." show={comp * (1 - fact) * ramp(now, at("p4", "No public source"), 1)} />
      <div style={{ position: "absolute", left: 300, top: 360, opacity: fact, fontFamily: FONT }}>
        <div style={{ fontSize: 44, color: C.dim, maxWidth: 1300 }}>Sensors, jamming, autonomy, lasers: all limited by electricity and cooling.</div>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.ink, marginTop: 50, opacity: ramp(now, at("p4", "Now it's a power station"), 1) }}>A power station that also flies.</div>
      </div>
    </>
  );
};

/* ---------------- P5: TBCC ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const tb = ramp(now, at("p5", "A turbine-based combined cycle"), 1) * (1 - ramp(now, at("p5", "GE has spent about two decades"), 1));
  const intro = ramp(now, s.start + 0.3, 1) * (1 - tb) * (1 - ramp(now, at("p5", "GE has spent about two decades"), 1));
  const ge = ramp(now, at("p5", "GE has spent about two decades"), 1) * (1 - ramp(now, at("p5", "Then there's Hermeus"), 1));
  const he = ramp(now, at("p5", "Then there's Hermeus"), 1) * (1 - ramp(now, at("p5", "There's the repurposed F100"), 1));
  const f100 = ramp(now, at("p5", "There's the repurposed F100"), 1);
  const mach = clamp((now - at("p5", "The hard part has always been")) / 6);
  const rde = now - at("p5", "Another is a rotating detonation");
  return (
    <>
      <Label x={300} y={440} w={1300} size={56} weight={700} color={C.ink} text="At the far end of the thread, the engine stops being just a turbine." show={intro} />
      <Svg>
        <g opacity={tb} fontFamily={FONT}>
          <rect x={260} y={480} width={1400} height={30} fill={C.faint} />
          <rect x={260} y={480} width={1400 * (2.5 / 6)} height={30} fill={C.steel} />
          <rect x={260 + 1400 * (2.5 / 6)} y={480} width={1400 * (3.5 / 6)} height={30} fill={C.amber} />
          {[0, 1, 2, 3, 4, 5, 6].map((m) => (
            <text key={m} x={260 + (1400 * m) / 6} y={560} textAnchor="middle" fontSize={26} fill={C.dim}>Mach {m}</text>
          ))}
          <text x={260 + 1400 * (1.25 / 6)} y={460} textAnchor="middle" fontSize={34} fill={C.ink} fontWeight={700}>turbine</text>
          <text x={260 + 1400 * (4.25 / 6)} y={460} textAnchor="middle" fontSize={34} fill={C.amber} fontWeight={700}>ramjet / scramjet</text>
          <circle cx={260 + 1400 * (mach * 5.5) / 6} cy={495} r={22} fill={C.ink} />
          <text x={260 + 1400 * (2.5 / 6)} y={640} textAnchor="middle" fontSize={32} fill={C.red} opacity={ramp(now, at("p5", "The hard part"), 1)}>the handover</text>
        </g>
        <g opacity={ge} transform="translate(1400,560)">
          <circle cx={0} cy={0} r={170} fill="none" stroke={C.faint} strokeWidth={50} />
          {[0, 1, 2].map((i) => {
            const a = rde * 3 + (i * Math.PI * 2) / 3;
            return <circle key={i} cx={170 * Math.cos(a)} cy={170 * Math.sin(a)} r={24} fill={C.amber} opacity={ramp(now, at("p5", "Another is a rotating detonation"), 1)} />;
          })}
          <text x={0} y={250} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={C.dim}>rotating detonation: waves circling the chamber</text>
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 160, top: 230, opacity: ge, fontFamily: FONT, maxWidth: 900 }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.ink }}>GE: two decades of pieces</div>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 20 }}>high-Mach turbine · rotating detonation combustor · dual-mode ramjet</div>
        <div style={{ fontSize: 34, color: C.ink, marginTop: 30, opacity: ramp(now, at("p5", "At the Paris Air Show"), 1) }}>DARPA-backed TBCC demonstrator, testing the handover at high supersonic speed</div>
        <div style={{ fontSize: 34, color: C.amber, marginTop: 30, opacity: ramp(now, at("p5", "In January 2026, GE and Lockheed"), 1) }}>Jan 2026: GE + Lockheed rotating-detonation ramjet tests, Niskayuna, NY</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: he }}>
        <Stat x={0} y={0} value="Hermeus" label="Atlanta, founded 2018 · Chimera: turbojet to ramjet in one engine" show={1} />
        <Stat x={0} y={250} value="J85" label="Quarterhorse" show={ramp(now, at("p5", "The first Quarterhorse"), 1)} size={70} color={C.dim} />
        <Stat x={420} y={250} value="F100" label="Chimera II's turbine section" show={ramp(now, at("p5", "The bigger Chimera II"), 1)} size={70} color={C.amber} />
        <Stat x={0} y={480} value="$1B" label="post-money valuation, Series C, April 2026" show={ramp(now, at("p5", "In April 2026, Hermeus"), 1)} size={70} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: f100, fontFamily: FONT }}>
        <div style={{ fontSize: 44, color: C.dim }}>The F100: stalled in the 1970s · fixed by the Great Engine War · 50 years of F-15s</div>
        <div style={{ fontSize: 56, color: C.ink, fontWeight: 700, marginTop: 40, opacity: ramp(now, at("p5", "and pushed F-15s"), 1) }}>Now the first stage of a hypersonic engine.</div>
        <div style={{ fontSize: 84, color: C.amber, fontWeight: 700, marginTop: 60, opacity: ramp(now, at("p5", "Old cores don't die"), 1) }}>Old cores don't die.</div>
      </div>
    </>
  );
};

/* ---------------- CLOSE ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const list = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("close", "Every one of those stories"), 1));
  const same = ramp(now, at("close", "Every one of those stories"), 1) * (1 - ramp(now, at("close", "The American bet"), 1));
  const bets = ramp(now, at("close", "The American bet"), 1) * (1 - ramp(now, at("close", "Which bet is right"), 1));
  const end = ramp(now, at("close", "Which bet is right"), 1);
  const items = [
    ["F-35", "waiting for a core that can feed its sensors", "The F-35 is waiting"],
    ["F-47", "first flight on an interim engine; two adaptive engines compete", "The F-47 will probably"],
    ["B-52", "business-jet engines, a hundred years of service", "The B-52 is getting"],
    ["J-36", "three engines: weak engines, a power plant, or both", "China put three engines"],
    ["TBCC", "engines that hand off to ramjets", "And past all of that"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 220, opacity: list, fontFamily: FONT }}>
        {items.map(([a, b, k]) => (
          <div key={a} style={{ display: "flex", gap: 40, marginBottom: 34, opacity: ramp(now, at("close", k), 0.8), alignItems: "baseline" }}>
            <div style={{ width: 200, fontSize: 52, fontWeight: 700, color: C.amber }}>{a}</div>
            <div style={{ fontSize: 40, color: C.ink }}>{b}</div>
          </div>
        ))}
      </div>
      <Label x={300} y={380} w={1300} size={60} weight={700} color={C.ink} text="The same story: the engine stopped being a source of thrust and became a source of power." show={same} />
      <div style={{ position: "absolute", left: 160, top: 340, opacity: bets, fontFamily: FONT, display: "flex", gap: 80 }}>
        <div style={{ width: 760, padding: 40, border: `3px solid ${C.steel}` }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: C.ink }}>One engine, three streams</div>
        </div>
        <div style={{ width: 760, padding: 40, border: `3px solid ${C.amber}`, opacity: ramp(now, at("close", "The Chinese bet"), 1) }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: C.amber }}>Three engines, different jobs</div>
        </div>
      </div>
      <Label x={360} y={460} w={1200} size={80} weight={700} color={C.ink} text="Which bet is right, the episode doesn't know." show={end} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: generators, cooling loops, and the companies nobody films." show={ramp(now, s.start, 1)} />;
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

export const _unused = { Bar, H };
