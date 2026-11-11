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
  <div style={{ position: "absolute", left: x, top: y, opacity: show, padding: "8px 16px", border: `2px solid ${color}`, color, fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: 2 }}>
    {text}
  </div>
);

/** Generic single-engine fighter, top view, nose up. */
const Fighter: React.FC<{ x: number; y: number; s?: number; color?: string; burner?: number; opacity?: number }> = ({ x, y, s = 1, color = C.steel, burner = 0, opacity = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <path d="M0,-200 L18,-120 L22,-20 L170,50 L170,80 L24,60 L24,130 L80,175 L80,195 L0,180 L-80,195 L-80,175 L-24,130 L-24,60 L-170,80 L-170,50 L-22,-20 L-18,-120 Z" fill={color} />
    <ellipse cx={0} cy={215 + burner * 20} rx={14} ry={30 + burner * 40} fill={C.amber} opacity={burner} />
  </g>
);

/** Generic AI VTOL fighter, top view (tailless, swept). */
const Drone: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = C.teal, opacity = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <path d="M0,-150 L40,-60 L240,60 L240,90 L60,70 L30,120 L-30,120 L-60,70 L-240,90 L-240,60 L-40,-60 Z" fill={color} />
    <circle cx={0} cy={110} r={14} fill={C.amber} />
  </g>
);

/** Side-view afterburning turbofan with a stall pressure wave. */
const StallEngine: React.FC<{ x: number; y: number; now: number; t0: number; show: number }> = ({ x, y, now, t0, show }) => {
  const k = now - t0;
  const puff = clamp(k / 3);
  const wave = clamp((k - 3) / 3);
  return (
    <g transform={`translate(${x},${y})`} opacity={show}>
      <rect x={-420} y={-90} width={560} height={180} rx={14} fill={C.steel} opacity={0.85} />
      <path d="M140,-80 L420,-70 L420,70 L140,80 Z" fill={C.faint} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={200 + i * 45} cy={(i % 2 ? -1 : 1) * 25} r={10 + 14 * puff} fill={C.amber} opacity={puff * (1 - wave * 0.5)} />
      ))}
      <path d={`M${400 - wave * 820},-110 Q${360 - wave * 820},0 ${400 - wave * 820},110`} fill="none" stroke={C.red} strokeWidth={10} opacity={wave * (1 - clamp((k - 6.5) / 1))} />
      <text x={0} y={150} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={C.dim}>afterburner fuel lights all at once → pressure wave runs forward → stall</text>
    </g>
  );
};

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const jet = ramp(now, s.start + 0.3, 2) * (1 - ramp(now, at("cold", "The Air Force's answer"), 1));
  const bang = ramp(now, at("cold", "The afterburner would fail"), 0.5) * (1 - ramp(now, at("cold", "On a twin-engine"), 1));
  const flick = bang > 0 ? (Math.sin(now * 23) > 0 ? 1 : 0.2) : 0.6;
  const twin = ramp(now, at("cold", "On a twin-engine"), 0.8) * (1 - ramp(now, at("cold", "The Air Force's answer"), 1));
  const two = ramp(now, at("cold", "It was a second company"), 1) * (1 - ramp(now, at("cold", "And on November 5"), 1));
  const xbat = ramp(now, at("cold", "And on November 5"), 1.5);
  return (
    <>
      <Svg>
        <Fighter x={960} y={520} s={1.3} burner={flick} opacity={jet} />
        <g opacity={two} fontFamily={FONT}>
          <rect x={460} y={420} width={380} height={160} rx={12} fill="none" stroke={C.steel} strokeWidth={5} />
          <text x={650} y={515} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.ink}>Pratt & Whitney</text>
          <rect x={1080} y={420} width={380} height={160} rx={12} fill="none" stroke={C.amber} strokeWidth={5} />
          <text x={1270} y={515} textAnchor="middle" fontSize={44} fontWeight={700} fill={C.amber}>GE</text>
          <text x={960} y={515} textAnchor="middle" fontSize={56} fill={C.dim}>vs.</text>
        </g>
        <Drone x={960} y={540} s={1.2} opacity={xbat} />
      </Svg>
      <Label x={160} y={140} w={900} size={44} weight={700} color={C.red} text="Stall." show={bang} />
      <Label x={160} y={900} w={1600} size={40} color={C.ink} text="Twin-engine Eagle: a bad day. Single-engine Viper: a much worse one." show={twin} />
      <Label x={460} y={300} w={1000} size={40} color={C.dim} text="Not a better engine. A second company." show={two} />
      <Label x={160} y={140} w={1200} size={40} color={C.ink} text="November 5, 2025: an AI fighter picks its engine" show={xbat} />
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

/* ---------------- P1: THE OTHER DOOR / F100 STALL ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const doors = ramp(now, s.start + 0.3, 1.2) * (1 - ramp(now, at("p1", "Go back to the F-15"), 1));
  const right = ramp(now, at("p1", "But the same core also stayed home"), 1);
  const f100 = ramp(now, at("p1", "Go back to the F-15"), 1) * (1 - ramp(now, at("p1", "The stall mechanism"), 1));
  const stall = ramp(now, at("p1", "The stall mechanism"), 1) * (1 - ramp(now, at("p1", "The F-16 entered service"), 1));
  const f16 = ramp(now, at("p1", "The F-16 entered service"), 1);
  return (
    <>
      <Svg>
        <g opacity={doors} fontFamily={FONT}>
          <rect x={860} y={460} width={200} height={140} rx={10} fill={C.amber} opacity={0.85} />
          <text x={960} y={545} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.bg}>F101 core</text>
          <line x1={860} y1={530} x2={560} y2={530} stroke={C.teal} strokeWidth={5} />
          <rect x={300} y={440} width={260} height={180} fill="none" stroke={C.teal} strokeWidth={4} />
          <text x={430} y={520} textAnchor="middle" fontSize={36} fontWeight={700} fill={C.teal}>CFM56</text>
          <text x={430} y={565} textAnchor="middle" fontSize={24} fill={C.dim}>France · Episode 3a</text>
          <g opacity={right}>
            <line x1={1060} y1={530} x2={1360} y2={530} stroke={C.red} strokeWidth={5} />
            <rect x={1360} y={440} width={260} height={180} fill="none" stroke={C.red} strokeWidth={4} />
            <text x={1490} y={520} textAnchor="middle" fontSize={36} fontWeight={700} fill={C.red}>fighter engine</text>
            <text x={1490} y={565} textAnchor="middle" fontSize={24} fill={C.dim}>stayed home</text>
          </g>
        </g>
        <StallEngine x={1000} y={520} now={now} t0={at("p1", "and the big jets of fuel")} show={stall} />
        <g opacity={f16}>
          <Fighter x={960} y={540} s={1.1} burner={0.6} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: f100 }}>
        <Stat x={0} y={0} value="P&W F100" label="F-15 Eagle, then F-16" show={1} size={84} />
        <Stat x={0} y={250} value="~24,000 lbf" label="afterburner thrust, first version" show={ramp(now, at("p1", "The first version produced"), 1)} size={64} color={C.teal} />
        <Stat x={620} y={250} value="8 : 1" label="target thrust-to-weight, reached" show={ramp(now, at("p1", "The first version produced") + 1.5, 1)} size={64} color={C.teal} />
        <Label x={0} y={520} w={1400} size={40} color={C.red} weight={700} text="-100 / -200: stall stagnations, short life, high maintenance cost" show={ramp(now, at("p1", "In service it had problems"), 1)} />
      </div>
      <Label x={300} y={180} w={1400} size={34} color={C.dim} text="High Mach, high altitude: if uncorrected, turbine damage" show={stall * ramp(now, at("p1", "These stalls tended"), 1)} />
      <Label x={300} y={850} w={1400} size={44} weight={700} color={C.ink} text="A single-engine fighter with an engine that sometimes stalls." show={ramp(now, at("p1", "A single-engine fighter"), 1)} />
    </>
  );
};

/* ---------------- P2: THE GREAT ENGINE WAR ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const rival = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p2", "In 1983 and 1984"), 1));
  const war = ramp(now, at("p2", "In 1983 and 1984"), 1) * (1 - ramp(now, at("p2", "The F101 DFE became the F110"), 1));
  const results = ramp(now, at("p2", "The F101 DFE became the F110"), 1) * (1 - ramp(now, at("p2", "The Air Force's own historian"), 1));
  const verdict = ramp(now, at("p2", "The Air Force's own historian"), 1);
  const years = [1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: rival, fontFamily: FONT }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink }}>The Air Force built its own competitor.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 50, opacity: ramp(now, at("p2", "It started funding a GE engine"), 1) }}>GE F101 Derivative Fighter Engine: the bomber core again</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 30, opacity: ramp(now, at("p2", "The F101 DFE flew in an F-16"), 1) }}>1980: flies in an F-16 · "considerable improvement in performance and operability"</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: war, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim }}>Alternate Fighter Engine competition</div>
        <div style={{ fontSize: 100, fontWeight: 700, color: C.ink, marginTop: 10, opacity: ramp(now, at("p2", "Everyone else called it"), 1) }}>The Great Engine War</div>
        <div style={{ display: "flex", gap: 14, marginTop: 60, opacity: ramp(now, at("p2", "From 1984 the Air Force bought both"), 1) }}>
          {years.map((y, i) => (
            <div key={y} style={{ width: 150, textAlign: "center" }}>
              <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, border: `1px solid ${C.faint}` }}>
                <div style={{ width: 26, height: 26, borderRadius: 13, background: C.steel }} />
                <div style={{ width: 26, height: 26, borderRadius: 13, background: C.amber }} />
              </div>
              <div style={{ fontSize: 26, color: C.dim, marginTop: 10 }}>{y}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 30, color: C.dim, marginTop: 24, opacity: ramp(now, at("p2", "From 1984 the Air Force bought both"), 1) }}>
          <span style={{ color: C.steel }}>■ Pratt & Whitney</span>   <span style={{ color: C.amber }}>■ GE</span>   · contracts competed every year, split varied
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: results, fontFamily: FONT }}>
        {[
          ["F110", "the F101 DFE, now a fighter engine", C.amber, "The F101 DFE became the F110"],
          ["F100-PW-220", "stalls almost eliminated · double the time between depot overhauls", C.steel, "Pratt's answer"],
          ["F110 → F-14", "Navy picks it in 1984: the power Tomcat pilots wanted", C.amber, "The Navy looked"],
          ["F100-PW-229 · F110-GE-129", "Improved Performance Engines, ~29,000 lbf class", C.ink, "Out came the F100-PW-229"],
        ].map(([a, b, col, k]) => (
          <div key={a} style={{ marginBottom: 40, opacity: ramp(now, at("p2", k), 0.8) }}>
            <div style={{ fontSize: 50, fontWeight: 700, color: col }}>{a}</div>
            <div style={{ fontSize: 32, color: C.dim }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: verdict, fontFamily: FONT }}>
        <div style={{ fontSize: 36, color: C.dim }}>Col. Robert Drewes, The Air Force and the Great Engine War (1987)</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 30, maxWidth: 1300 }}>Not criticism, but praise.</div>
        <div style={{ fontSize: 72, fontWeight: 700, color: C.amber, marginTop: 60, opacity: ramp(now, at("p2", "Competition worked"), 0.8) }}>Competition worked.</div>
        <div style={{ fontSize: 44, color: C.red, marginTop: 40, opacity: ramp(now, at("p2", "Remember that"), 0.8) }}>Remember that. The Pentagon would forget it.</div>
      </div>
    </>
  );
};

/* ---------------- P3: F110 → X-BAT ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const f110 = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p3", "And on November 5, 2025"), 1));
  const xb = ramp(now, at("p3", "And on November 5, 2025"), 1) * (1 - ramp(now, at("p3", "The author's working notes"), 1));
  const corr = ramp(now, at("p3", "The author's working notes"), 1);
  const specs = [
    ["~26 ft", "length"], ["~39 ft", "wingspan"], ["~50,000 ft", "ceiling"], ["> 2,000 nm", "range"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: f110, fontFamily: FONT }}>
        <Stat x={0} y={0} value="F110-GE-129" label="still in production" show={1} size={90} color={C.amber} />
        <Label x={0} y={220} w={1400} size={40} color={C.ink} text="F-16 Block 50 onward · F-15E · F-15EX" show={ramp(now, at("p3", "It powers F-16s"), 1)} />
        <Label x={0} y={300} w={1400} size={36} color={C.dim} text="Built under license in Japan, Turkey and South Korea" show={ramp(now, at("p3", "built under license"), 1)} />
        <Stat x={0} y={400} value="11M+ hours · 40 years" label="GE's figures" show={ramp(now, at("p3", "GE says it has passed"), 1)} size={64} />
      </div>
      <Svg>
        <Drone x={1350} y={520} s={1.0} opacity={xb} />
      </Svg>
      <div style={{ position: "absolute", left: 200, top: 220, opacity: xb, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim }}>Shield AI · X-BAT · unveiled October 2025</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.ink, marginTop: 10, maxWidth: 800 }}>AI-piloted, vertical takeoff, jet fighter</div>
        <div style={{ display: "grid", gridTemplateColumns: "300px 300px", gap: 30, marginTop: 40, opacity: ramp(now, at("p3", "Roughly 26 feet"), 1) }}>
          {specs.map(([v, l]) => (
            <div key={l}><div style={{ fontSize: 50, fontWeight: 700, color: C.teal }}>{v}</div><div style={{ fontSize: 26, color: C.dim }}>{l}</div></div>
          ))}
        </div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 40, opacity: ramp(now, at("p3", "CNBC put the price"), 1) }}>~$27M each (CNBC)</div>
        <div style={{ fontSize: 34, color: C.ink, marginTop: 20, opacity: ramp(now, at("p3", "To take off vertically"), 1) }}>F110-GE-129 + AVEN 3D thrust-vectoring nozzle</div>
      </div>
      <Tag x={220} y={200} text="CORRECTION FROM THE AUTHOR'S NOTES" show={corr} />
      <div style={{ position: "absolute", left: 220, top: 300, opacity: corr, fontFamily: FONT }}>
        <div style={{ fontSize: 46, color: C.dim, textDecoration: "line-through" }}>X-BAT on repurposed old F100s</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 30, opacity: ramp(now, at("p3", "X-BAT uses the GE F110"), 0.8) }}>X-BAT: GE F110, the bomber-core engine</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.amber, marginTop: 70, opacity: ramp(now, at("p3", "The engine family that came out"), 0.8) }}>F101 (1970) → F110 → X-BAT</div>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 50, opacity: ramp(now, at("p3", "The F100 does turn up"), 0.8) }}>The repurposed F100 exists: inside a hypersonic engine. A later episode.</div>
      </div>
    </>
  );
};

/* ---------------- P4: TF34 ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const intro = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p4", "GE's TF34 first ran"), 1));
  const eng = ramp(now, at("p4", "GE's TF34 first ran"), 1) * (1 - ramp(now, at("p4", "In 1980 the Comptroller"), 1));
  const gao = ramp(now, at("p4", "In 1980 the Comptroller"), 1) * (1 - ramp(now, at("p4", "And yet, the same engine"), 1));
  const rec = ramp(now, at("p4", "And yet, the same engine"), 1) * (1 - ramp(now, at("p4", "The TF34 also had a civilian child"), 1));
  const child = ramp(now, at("p4", "The TF34 also had a civilian child"), 1);
  const ratio = ramp(now, at("p4", "Saving time in a"), 1);
  return (
    <>
      <Label x={360} y={440} w={1200} size={56} weight={700} color={C.ink} text="A small, instructive failure." show={intro} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: eng, fontFamily: FONT }}>
        <Stat x={0} y={0} value="GE TF34" label="first ran 1971" show={1} size={90} />
        <Label x={0} y={220} w={1400} size={42} color={C.ink} text="Navy S-3 Viking: carrier-based submarine hunter" show={ramp(now, at("p4", "GE's TF34 first ran"), 1)} />
        <Label x={0} y={300} w={1400} size={42} color={C.ink} text="Air Force A-10: first flew May 1972, production October 1974" show={ramp(now, at("p4", "Fairchild picked it"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 220, opacity: gao }}>
        <div style={{ width: 620, height: 150, background: "#e9e4d8", padding: "16px 24px", fontFamily: FONT, fontSize: 24, color: "#2a2a2a", boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
          Comptroller General, 1980 · PSAD-80-72 · Are Management Problems in the Acquisition of Aircraft Gas Turbine Engines Being Corrected?
        </div>
        <Bar x={0} y={200} w={1400} frac={14.5 / 210} label="Adapting the Navy engine for the A-10: 2 years 3 months, shortcuts in testing" value="$14.5M" color={C.steel} show={ramp(now, at("p4", "Adapting the Navy engine"), 1)} />
        <Bar x={0} y={360} w={1400} frac={1} label="Component improvement programs for both services, by 1983 (GAO estimate)" value="~$210M" color={C.red} show={ramp(now, at("p4", "GAO estimated that by 1983"), 1.5)} />
        <Stat x={0} y={540} value="≈ 14×" label="the author's division of the two GAO figures" show={ratio} color={C.amber} size={80} />
      </div>
      <Tag x={540} y={790} text="INFERENCE · AUTHOR'S ARITHMETIC" show={gao * ratio} />
      <div style={{ position: "absolute", left: 220, top: 260, opacity: rec }}>
        <Stat x={0} y={0} value="10 years" label="one TF34 on one A-10, 1999–2009: a wing record" show={ramp(now, at("p4", "In 2009, an Air Force Reserve"), 1)} color={C.teal} />
        <Stat x={700} y={0} value="3,400+ hrs" label="since its last overhaul. Removed by paperwork, not failure." show={ramp(now, at("p4", "It came off because"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: child, fontFamily: FONT }}>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.ink }}>TF34 → CF34</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 20 }}>regional and business jets, including COMAC's C909</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 70, opacity: ramp(now, at("p4", "In 2025, when Washington"), 1) }}>2025: on the export suspension list, beside the LEAP-1C</div>
        <div style={{ fontSize: 44, color: C.ink, marginTop: 30, opacity: ramp(now, at("p4", "The TF34's grandchild"), 1) }}>A lever too.</div>
      </div>
    </>
  );
};

/* ---------------- P5: F136 ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const two = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p5", "The Pentagon didn't want it"), 1));
  const tl = ramp(now, at("p5", "The Pentagon didn't want it"), 1) * (1 - ramp(now, at("p5", "So the second engine war"), 1));
  const one = ramp(now, at("p5", "So the second engine war"), 1);
  const inf = ramp(now, at("p5", "Whether the F136 would have saved"), 1);
  const events = [
    ["FY2007–FY2010", "administration tries to kill it; Congress refuses", "From FY2007"],
    ["FY2011", "Congress agrees not to fund it", "In FY2011"],
    ["April 25, 2011", "contract terminated; tooling and engines handed back", "On April 25, 2011"],
    ["2011", "GE and Rolls offer to self-fund (GAO: could save $700M)", "GE and Rolls-Royce offered"],
    ["December 2, 2011", "they stop anyway", "On December 2, 2011"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: two, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>FY1996: Congress requires an alternate engine for the F-35</div>
        <div style={{ display: "flex", gap: 80, marginTop: 60 }}>
          <div style={{ width: 600, padding: 36, border: `3px solid ${C.steel}`, opacity: ramp(now, at("p5", "The F-35 flew on"), 1) }}>
            <div style={{ fontSize: 70, fontWeight: 700, color: C.steel }}>F135</div>
            <div style={{ fontSize: 32, color: C.dim, marginTop: 12 }}>Pratt & Whitney · from the F-22's F119</div>
          </div>
          <div style={{ width: 600, padding: 36, border: `3px solid ${C.amber}`, opacity: ramp(now, at("p5", "The alternate became the F136"), 1) }}>
            <div style={{ fontSize: 70, fontWeight: 700, color: C.amber }}>F136</div>
            <div style={{ fontSize: 32, color: C.dim, marginTop: 12 }}>GE 60% · Rolls-Royce 40% · from the YF120</div>
          </div>
        </div>
        <div style={{ fontSize: 44, color: C.ink, marginTop: 60, opacity: ramp(now, at("p5", "It was the 1980s logic again"), 1) }}>The 1980s logic again: two engines, competition every year.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 220, opacity: tl, fontFamily: FONT }}>
        {events.map(([d, t, k]) => (
          <div key={d} style={{ display: "flex", gap: 40, marginBottom: 34, opacity: ramp(now, at("p5", k), 0.8), alignItems: "baseline" }}>
            <div style={{ width: 380, fontSize: 40, fontWeight: 700, color: C.ink }}>{d}</div>
            <div style={{ fontSize: 36, color: C.dim }}>{t}</div>
          </div>
        ))}
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber, marginTop: 30, opacity: ramp(now, at("p5", "According to the Congressional Research"), 1) }}>$2.4B received, FY1995–FY2009 (CRS)</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: one, fontFamily: FONT }}>
        <div style={{ fontSize: 110, fontWeight: 700, color: C.ink }}>1 supplier</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 10, opacity: ramp(now, at("p5", "Pratt & Whitney says"), 1) }}>1,500+ F135 production engines · 20 allied nations (P&W)</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 80, maxWidth: 1400, opacity: inf }}>Would the F136 have saved money over the program's life? Still argued, by people with a stake.</div>
        <div style={{ fontSize: 40, color: C.teal, marginTop: 30, maxWidth: 1400, opacity: ramp(now, at("p5", "What's not in dispute"), 1) }}>Not in dispute: the 1980s competition worked, and wasn't repeated.</div>
      </div>
      <Tag x={220} y={160} text="INFERENCE · THE COUNTERFACTUAL ONLY" show={one * inf} />
    </>
  );
};

/* ---------------- CLOSE: TWO KEYS ---------------- */
const Key: React.FC<{ x: number; y: number; color: string; opacity: number }> = ({ x, y, color, opacity }) => (
  <g transform={`translate(${x},${y})`} opacity={opacity}>
    <circle cx={0} cy={0} r={60} fill="none" stroke={color} strokeWidth={16} />
    <rect x={55} y={-10} width={240} height={20} fill={color} />
    <rect x={240} y={10} width={20} height={50} fill={color} />
    <rect x={200} y={10} width={20} height={36} fill={color} />
  </g>
);
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const keys = ramp(now, s.start + 0.3, 1.5);
  const lose = ramp(now, at("close", "In 2011 the Pentagon decided"), 1.5);
  const f47 = ramp(now, at("close", "The F-47's engine is now a contest"), 1.2);
  const end = ramp(now, at("close", "Whether that's lesson learned"), 1);
  return (
    <>
      <Svg>
        <g opacity={1 - end * 0.8}>
          <Key x={620} y={300} color={C.steel} opacity={keys} />
          <Key x={1120} y={300} color={C.amber} opacity={keys * (1 - lose * 0.85) + f47 * 0.85} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 300, top: 470, opacity: keys * (1 - f47), fontFamily: FONT, fontSize: 46, color: C.ink, lineHeight: 1.5 }}>
        <div style={{ opacity: ramp(now, at("close", "two suppliers fighting"), 0.8) }}>1980s: two suppliers, better engines, faster.</div>
        <div style={{ opacity: ramp(now, at("close", "In the 1970s, the TF34"), 0.8), color: C.dim }}>1970s: hurry the development, pay many times over.</div>
        <div style={{ opacity: lose, color: C.red }}>2011: the second key, given away.</div>
        <div style={{ opacity: ramp(now, at("close", "And the most interesting new airplane"), 0.8), color: C.amber }}>X-BAT flies on the engine the competition made good.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 520, opacity: f47 * (1 - end), fontFamily: FONT }}>
        <div style={{ fontSize: 46, color: C.dim }}>F-47 engine contest</div>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.ink, marginTop: 10 }}>GE XA102 vs. P&W XA103</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 20, opacity: ramp(now, at("close", "Same logic as the Great Engine War"), 0.8) }}>Same logic, new name.</div>
      </div>
      <Label x={360} y={470} w={1200} size={64} weight={700} color={C.ink} text="Lesson learned, or lesson rediscovered? The episode doesn't know." show={end} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: electricity, heat, and a jet with three engines." show={ramp(now, s.start, 1)} />;
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
