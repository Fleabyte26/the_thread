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

/** Side view of a 737-class jet, nose left. ~1000 x 260 at s=1, origin at fuselage centre. */
const SideJet: React.FC<{ x: number; y: number; s?: number; opacity?: number; color?: string; bay?: number; pylons?: number; missiles?: number; door?: number; floor?: number }> = ({ x, y, s = 1, opacity = 1, color = C.steel, bay = 0, pylons = 0, missiles = 0, door = 0, floor = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    {/* tail */}
    <path d="M330,-40 L430,-200 L480,-200 L470,-40 Z" fill={color} />
    {/* fuselage */}
    <path d="M-500,10 Q-500,-50 -430,-55 L440,-55 Q500,-50 500,-20 L500,10 Q480,55 400,55 L-420,55 Q-500,50 -500,10 Z" fill={color} />
    {/* cockpit windows */}
    <path d="M-470,-25 L-430,-38 L-400,-38 L-400,-22 Z" fill={C.bg} opacity={0.8} />
    {/* wing (seen edge-on, below fuselage) */}
    <path d="M-120,40 L180,40 L220,70 L-90,70 Z" fill={C.faint} />
    {/* engine */}
    <rect x={-150} y={70} width={150} height={56} rx={26} fill={C.dim} />
    {/* weapons bay behind the wing */}
    <g opacity={bay}>
      <rect x={240} y={30} width={150} height={25} fill={C.bg} stroke={C.red} strokeWidth={4} strokeDasharray="10 6" />
    </g>
    {/* new pressure floor line */}
    <line x1={230} y1={22} x2={400} y2={22} stroke={C.amber} strokeWidth={4} opacity={floor} />
    {/* freighter side door */}
    <rect x={-380} y={-48} width={150} height={86} fill="none" stroke={C.teal} strokeWidth={5} opacity={door} />
    {/* pylons and missiles under the wing */}
    {[40, 220].map((px, i) => (
      <g key={i} opacity={pylons}>
        <rect x={px} y={70} width={14} height={75} fill={C.ink} />
        <g opacity={missiles}>
          <rect x={px - 70} y={145} width={150} height={22} rx={10} fill={C.amber} />
          <path d={`M${px + 80},145 L${px + 100},135 L${px + 100},177 L${px + 80},167 Z`} fill={C.amber} />
        </g>
      </g>
    ))}
  </g>
);

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const two = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("cold", "Episode 3d argued"), 1));
  const diff = ramp(now, at("cold", "They are not the same airplane"), 0.8);
  const recap = ramp(now, at("cold", "Episode 3d argued"), 1) * (1 - ramp(now, at("cold", "So this episode goes"), 1));
  const qs = ramp(now, at("cold", "So this episode goes"), 1) * (1 - ramp(now, at("cold", "The answer starts"), 1));
  const born = ramp(now, at("cold", "The answer starts"), 1);
  return (
    <>
      <Svg>
        <SideJet x={960} y={330} s={0.85} opacity={two} color={C.steel} />
        <SideJet x={960} y={720} s={0.85} opacity={two} color="#5f6f7c" bay={diff} pylons={diff} />
      </Svg>
      <Label x={200} y={180} w={600} size={36} color={C.dim} text="airline 737-800" show={two} />
      <Label x={200} y={570} w={600} size={36} color={C.dim} text="Navy P-8 Poseidon" show={two} />
      <Label x={1240} y={960} w={600} size={44} weight={700} color={C.red} text="Not the same airplane." show={two * diff} />
      <div style={{ position: "absolute", left: 300, top: 300, opacity: recap, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>Episode 3d: rebuild old 737-800s from the desert</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 20 }}>~$2M bird → ~$10M arsenal jet</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.red, marginTop: 20, opacity: ramp(now, at("cold", "It said the hard part"), 0.8) }}>Conversion cost: unknown</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: qs, fontFamily: FONT, fontSize: 58, fontWeight: 700, lineHeight: 1.5 }}>
        <div style={{ color: C.ink, opacity: ramp(now, at("cold", "What would it actually"), 0.6) }}>A weapons bay like the P-8's?</div>
        <div style={{ color: C.ink, opacity: ramp(now, at("cold", "To hang six missiles"), 0.6) }}>Six missiles under it?</div>
        <div style={{ color: C.amber, opacity: ramp(now, at("cold", "And who in the world"), 0.6) }}>Who already does this kind of work?</div>
      </div>
      <Label x={300} y={440} w={1300} size={72} weight={700} color={C.ink} text="The P-8 was born different." show={born} />
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

/* ---------------- P1: WHAT THE P-8 IS ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const jet = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p1", "It also carries about three times"), 1));
  const nums = ramp(now, at("p1", "It also carries about three times"), 1) * (1 - ramp(now, at("p1", "And one more fact"), 1));
  const end = ramp(now, at("p1", "And one more fact"), 1);
  const notes: [string, string, number, number][] = [
    ["thicker skin, strengthened structure", "It uses thicker aluminum", 160, 210],
    ["737-900-derived wing, strengthened", "It's derived from the longer", 820, 210],
    ["4 wing pylons · 3,000 lb each", "Under it are four weapons", 820, 840],
    ["+2 centerline hardpoints", "Under the fuselage there are", 160, 840],
    ["weapons bay: 5 stations, built in on the line", "And behind the wing, in the belly", 1040, 300],
  ];
  return (
    <>
      <Svg>
        <SideJet x={960} y={560} s={1.1} opacity={jet} bay={ramp(now, at("p1", "And behind the wing, in the belly"), 1)} pylons={ramp(now, at("p1", "Under it are four weapons"), 1)} />
      </Svg>
      {notes.map(([t, k, x, y]) => (
        <Label key={t} x={x} y={y} w={760} size={34} weight={700} color={C.ink} text={t} show={jet * ramp(now, at("p1", k), 0.8)} />
      ))}
      <div style={{ position: "absolute", left: 220, top: 260, opacity: nums }}>
        <Stat x={0} y={0} value="3×" label="the wiring of a standard 737 · ~100 antennas · refueling receptacle" show={1} size={110} />
        <Stat x={760} y={0} value="189,200 lb" label="P-8 max takeoff weight (737-800: 174,200)" show={ramp(now, at("p1", "Its maximum takeoff weight"), 0.8)} size={110} />
        <Stat x={0} y={300} value="~60%" label="parts shared with the airliner (Boeing)" show={ramp(now, at("p1", "Boeing has said the two share"), 0.8)} size={110} />
        <Stat x={760} y={300} value="$173M" label="flyaway cost each (FY2022 budget)" show={ramp(now, at("p1", "The Navy's 2022 budget"), 0.8)} size={110} color={C.amber} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: end, fontFamily: FONT }}>
        <div style={{ fontSize: 44, color: C.dim }}>FY2027 budget: 12 more P-8s, the last planned production year</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 30, opacity: ramp(now, at("p1", "The final delivery"), 0.6) }}>Last delivery: early FY2032</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.amber, marginTop: 20, opacity: ramp(now, at("p1", "After that, the line"), 0.6) }}>Then the line that builds the bay goes quiet.</div>
      </div>
    </>
  );
};

/* ---------------- P2: WHY A BAY IS HARD ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const jet = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p2", "Here's what the thread can find"), 1));
  const find = ramp(now, at("p2", "Here's what the thread can find"), 1) * (1 - ramp(now, at("p2", "So if the plan in 3d"), 1));
  const q = ramp(now, at("p2", "So if the plan in 3d"), 1);
  const steps: [string, string][] = [["cut an opening in an old pressure vessel", "To put a bay there"], ["carry the loads around it", "To put a bay there"], ["seal the cabin above it: a new pressure floor", "close the cabin off"], ["doors, hinges, actuators, heating, racks", "close the cabin off"]];
  return (
    <>
      <Svg>
        <SideJet x={960} y={400} s={1.0} opacity={jet} bay={ramp(now, at("p2", "The P-8's bay sits where"), 1)} floor={ramp(now, at("p2", "close the cabin off"), 1)} />
      </Svg>
      <Label x={220} y={170} w={1400} size={36} color={C.dim} text="tens of thousands of pressurization cycles" show={jet * ramp(now, at("p2", "A twenty-year-old airliner"), 1)} />
      <div style={{ position: "absolute", left: 300, top: 640, opacity: jet, fontFamily: FONT }}>
        {steps.map(([t, k], i) => (
          <div key={t} style={{ fontSize: 40, color: i === 2 ? C.amber : C.ink, marginBottom: 12, opacity: ramp(now, at("p2", k) + i * 1.2, 0.6) }}>— {t}</div>
        ))}
        <div style={{ fontSize: 50, fontWeight: 700, color: C.red, marginTop: 20, opacity: ramp(now, at("p2", "That's surgery"), 0.6) }}>Not a bolt-on. Surgery.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: find, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink }}>No public record found of a P-8-style bay retrofitted into a used 737.</div>
        <div style={{ fontSize: 44, color: C.dim, marginTop: 30, opacity: ramp(now, at("p2", "That doesn't make it impossible"), 0.6) }}>Not impossible. A development program first:</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 14, opacity: ramp(now, at("p2", "It means the first one"), 0.6) }}>engineering · test article · fatigue analysis · flight test</div>
      </div>
      <Label x={300} y={440} w={1300} size={72} weight={700} color={C.ink} text="Does the arsenal jet need a bay at all?" show={q * ramp(now, at("p2", "Does the arsenal jet"), 0.6)} />
      <Label x={300} y={440} w={1300} size={56} weight={700} color={C.red} text="The unknown in 3d's cost table is a large unknown." show={q * (1 - ramp(now, at("p2", "And it raises a better"), 0.6))} />
    </>
  );
};

/* ---------------- P3: THE FREIGHTER PRECEDENT ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const jet = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p3", "Three programs are certified"), 1));
  const progs = ramp(now, at("p3", "Three programs are certified"), 1) * (1 - ramp(now, at("p3", "So the world already knows"), 1));
  const end = ramp(now, at("p3", "So the world already knows"), 1);
  return (
    <>
      <Svg>
        <SideJet x={960} y={380} s={1.0} opacity={jet} door={ramp(now, at("p3", "The conversion cuts a large"), 1)} />
      </Svg>
      <Label x={180} y={200} w={600} size={34} weight={700} color={C.teal} text="main-deck cargo door, cut in" show={jet * ramp(now, at("p3", "The conversion cuts a large"), 1)} />
      <div style={{ position: "absolute", left: 220, top: 640, opacity: jet }}>
        <Stat x={0} y={0} value="~800" label="tasks for a narrowbody conversion" show={ramp(now, at("p3", "Converters describe"), 0.8)} size={90} />
        <Stat x={520} y={0} value="90–130 days" label="induction to redelivery" show={ramp(now, at("p3", "It takes about 90"), 0.8)} size={90} />
        <Stat x={1100} y={0} value="$4–6M" label="per 737-800 (analysts and shops)" show={ramp(now, at("p3", "Analysts and conversion shops"), 0.8)} size={90} color={C.amber} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: progs, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim, marginBottom: 30 }}>Certified 737-800 freighter conversions</div>
        {[["737-800BCF", "Boeing", "Boeing's own"], ["737-800SF", "Aeronautical Engineers (AEI), Miami", "One by Aeronautical"], ["737-800BDSF", "Israel Aerospace Industries (Bedek) · FAA 2020", "And one by Israel"]].map(([a, b, k]) => (
          <div key={a} style={{ display: "flex", gap: 40, alignItems: "baseline", marginBottom: 24, opacity: ramp(now, at("p3", k), 0.6) }}>
            <div style={{ width: 460, fontSize: 52, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>{a}</div>
            <div style={{ fontSize: 38, color: C.dim }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: end, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.ink }}>Cut the pressure hull. Strengthen. Certify. Fly another 15–20 years.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 30, opacity: ramp(now, at("p3", "That's not a weapons bay"), 0.6) }}>A side door isn't a hole in the keel. Same kind of work, same kind of hangar.</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber, marginTop: 30, opacity: ramp(now, at("p3", "That's the most encouraging"), 0.6) }}>The most encouraging fact in this episode.</div>
      </div>
    </>
  );
};

/* ---------------- P4: SIX MISSILES ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const lr = ramp(now, at("p4", "The missile the arsenal jet"), 1) * (1 - ramp(now, at("p4", "Where would six go"), 1));
  const six = ramp(now, at("p4", "Where would six go"), 1) * (1 - ramp(now, at("p4", "And that image is the sobering"), 1));
  const tl = ramp(now, at("p4", "And that image is the sobering"), 1) * (1 - ramp(now, at("p4", "A desert 737-800 has no"), 1));
  const wing = ramp(now, at("p4", "A desert 737-800 has no"), 1);
  const intro = ramp(now, s.start + 0.3, 1) * (1 - lr) * (1 - six) * (1 - tl) * (1 - wing);
  const st = [[-360, "wing"], [-200, "wing"], [200, "wing"], [360, "wing"], [-50, "center"], [50, "center"]] as const;
  return (
    <>
      <Label x={360} y={440} w={1200} size={72} weight={700} color={C.ink} text="Now the wings." show={intro} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: lr }}>
        <Stat x={0} y={0} value="AGM-158C LRASM" label="long-range anti-ship missile (cousin of JASSM)" show={1} size={90} />
        <Stat x={0} y={260} value="~2,100–2,760 lb" label="published weights, by source" show={ramp(now, at("p4", "Published weights"), 0.8)} size={90} />
        <Stat x={760} y={260} value="~$3M" label="each" show={ramp(now, at("p4", "The Navy has paid"), 0.8)} size={90} />
        <Stat x={0} y={520} value="13–17k lb" label="six of them" show={ramp(now, at("p4", "Six of them is"), 0.8)} size={90} />
        <Stat x={760} y={520} value="~$19M" label="of missiles on a ~$10M bird" show={ramp(now, at("p4", "And about nineteen million"), 0.8)} size={90} color={C.amber} />
      </div>
      <Svg>
        <g opacity={six} transform="translate(960,560)">
          <rect x={-30} y={-300} width={60} height={600} rx={30} fill={C.steel} />
          <path d="M-30,-40 L-520,120 L-520,150 L-30,60 Z M30,-40 L520,120 L520,150 L30,60 Z" fill={C.steel} />
          {st.map(([px, kind], i) => {
            const y = kind === "wing" ? 40 + Math.abs(px) * 0.18 : 120;
            const show = kind === "wing" ? 1 : ramp(now, at("p4", "It has exactly six external"), 1);
            return (
              <g key={i} opacity={show}>
                <rect x={px - 14} y={y - 10} width={28} height={150} rx={12} fill={kind === "wing" ? C.amber : C.dim} />
              </g>
            );
          })}
        </g>
      </Svg>
      <Label x={180} y={180} w={760} size={40} weight={700} color={C.ink} text="P-8: six external stations" show={six * ramp(now, at("p4", "It has exactly six external"), 0.8)} />
      <Label x={180} y={250} w={700} size={32} color={C.amber} text="4 wing pylons: cleared for LRASM" show={six * ramp(now, at("p4", "The wing pylons are"), 0.8)} />
      <Label x={180} y={300} w={700} size={32} color={C.dim} text="2 centerline: not public for a missile this size" show={six * ramp(now, at("p4", "What the public record"), 0.8)} />
      <div style={{ position: "absolute", left: 220, top: 260, opacity: tl }}>
        <Label x={0} y={0} w={1400} size={36} color={C.dim} text="LRASM on the P-8, an airplane built to carry missiles" show={1} />
        <svg width={1480} height={300} style={{ position: "absolute", left: 0, top: 80 }}>
          <line x1={40} y1={120} x2={1440} y2={120} stroke={C.faint} strokeWidth={4} />
          {[[40, "Feb 2020", "Navy asks industry"], [300, "Jul 2020", "fit checks"], [1400, "2025", "first official flight image"]].map(([x, a, b]) => (
            <g key={a as string} fontFamily={FONT}>
              <circle cx={x as number} cy={120} r={16} fill={C.amber} />
              <text x={x as number} y={80} fontSize={34} fontWeight={700} fill={C.ink} textAnchor={(x as number) > 1000 ? "end" : "start"}>{a}</text>
              <text x={x as number} y={180} fontSize={28} fill={C.dim} textAnchor={(x as number) > 1000 ? "end" : "start"}>{b}</text>
            </g>
          ))}
        </svg>
        <Label x={0} y={460} w={1400} size={60} weight={700} color={C.amber} text="Five years, one missile." show={ramp(now, at("p4", "That's five years"), 0.8)} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: wing, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink }}>A desert 737-800: no hardpoints at all.</div>
        {[["new structure in the wing box", "Adding pylons means"], ["wiring to every station", "Adding pylons means"], ["a stores management system", "Adding pylons means"], ["separation and flutter testing", "and then testing that each"]].map(([t, k], i) => (
          <div key={t} style={{ fontSize: 40, color: C.ink, marginTop: 16, opacity: ramp(now, at("p4", k) + i * 1.2, 0.6) }}>— {t}</div>
        ))}
        <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, marginTop: 30, opacity: ramp(now, at("p4", "All of it is engineering"), 0.6) }}>Done once, then copied.</div>
      </div>
    </>
  );
};

/* ---------------- P5: MAYBE SKIP THE BAY ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const skip = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p5", "That turns the conversion"), 1));
  const jobs = ramp(now, at("p5", "That turns the conversion"), 1) * (1 - ramp(now, at("p5", "How many missiles"), 1));
  const how = ramp(now, at("p5", "How many missiles"), 1) * (1 - ramp(now, at("p5", "It also changes the price"), 1));
  const price = ramp(now, at("p5", "It also changes the price"), 1);
  return (
    <>
      <Svg>
        <SideJet x={960} y={420} s={1.0} opacity={skip} bay={1 - ramp(now, at("p5", "So the arsenal jet may not"), 1)} pylons={ramp(now, at("p5", "Those go on pylons"), 1)} missiles={ramp(now, at("p5", "Those go on pylons"), 1)} />
      </Svg>
      <Label x={220} y={720} w={1500} size={36} color={C.dim} text="The bay is for torpedoes, mines and depth charges: hunting submarines." show={skip * ramp(now, at("p5", "The P-8's bay is for"), 0.8)} />
      <Label x={220} y={790} w={1500} size={56} weight={700} color={C.amber} text="Leave the pressure hull alone. Put the money into the wing." show={skip * ramp(now, at("p5", "Leave the pressure hull"), 0.8)} />
      <div style={{ position: "absolute", left: 300, top: 260, opacity: jobs, fontFamily: FONT }}>
        {[["1", "Heavy maintenance + structural inspection", "what freighter shops already do", "One: heavy maintenance"], ["2", "Wing hardpoints + wiring", "designed once, installed on every bird", "Two: wing hardpoints"], ["3", "Cockpit + mission system to receive a target and launch", "targeting comes from someone else", "Three: a cockpit"]].map(([n, a, b, k]) => (
          <div key={n} style={{ display: "flex", gap: 40, marginBottom: 40, opacity: ramp(now, at("p5", k), 0.6) }}>
            <div style={{ fontSize: 90, fontWeight: 700, color: C.amber, width: 80 }}>{n}</div>
            <div>
              <div style={{ fontSize: 50, fontWeight: 700, color: C.ink }}>{a}</div>
              <div style={{ fontSize: 34, color: C.dim }}>{b}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: how, fontFamily: FONT }}>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.ink, opacity: ramp(now, at("p5", "Four on the wings"), 0.6) }}>Start with 4.</div>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p5", "Six needs the two"), 0.6) }}>Grow to 6.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 20, opacity: ramp(now, at("p5", "Six needs the two"), 0.6) }}>centerline stations, or a third pylon per wing (new engineering)</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: price }}>
        <Bar x={0} y={0} w={1300} frac={6 / 10} label="737-800 freighter conversion (known)" value="$4–6M" color={C.teal} show={ramp(now, at("p5", "The freighter world says"), 1)} />
        <Bar x={0} y={150} w={1300} frac={8 / 10} label="pylon-only conversion per bird, after first-article engineering (guess)" value="single-digit $M?" color={C.amber} show={ramp(now, at("p5", "If the first-article engineering"), 1)} dashed />
        <Bar x={0} y={300} w={1300} frac={1} label="3d target, all-in including the ~$2M bird" value="~$10M" color={C.steel} show={ramp(now, at("p5", "The 3d target"), 1)} />
        <Label x={0} y={460} w={1400} size={50} weight={700} color={C.ink} text="Ambitious. Not absurd." show={ramp(now, at("p5", "It wouldn't be absurd"), 0.8)} />
        <Label x={0} y={540} w={1400} size={34} color={C.dim} text="The author's arithmetic, not a quote. Nobody has priced this airplane." show={ramp(now, at("p5", "That's the author's arithmetic"), 0.8)} />
      </div>
    </>
  );
};

/* ---------------- P6: THE HANGAR IN ISRAEL ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const s = sectionOf("p6");
  const iai = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p6", "Around 2010"), 1));
  const mmtt = ramp(now, at("p6", "Around 2010"), 1) * (1 - ramp(now, at("p6", "And then there's the story"), 1));
  const f15 = ramp(now, at("p6", "And then there's the story"), 1) * (1 - ramp(now, at("p6", "For scale"), 1));
  const scale = ramp(now, at("p6", "For scale"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: iai, fontFamily: FONT }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.ink }}>Israel Aerospace Industries · Bedek</div>
        <div style={{ fontSize: 38, color: C.dim, marginTop: 10 }}>airplanes other people are finished with</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 480, opacity: iai }}>
        <Stat x={0} y={0} value="260+" label="airliners converted to freighters, 40 years (IAI)" show={ramp(now, at("p6", "It says it has converted"), 0.8)} size={110} />
        <Stat x={700} y={0} value="2,500+" label="military aircraft and helicopters upgraded · F-15, F-16, F-4, Mirage (IAI)" show={ramp(now, at("p6", "and upgraded more than"), 0.8)} size={110} color={C.amber} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: mmtt, fontFamily: FONT }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink }}>Used 767 passenger jet → aerial tanker</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 16 }}>Multi Mission Tanker Transport · Colombian Air Force · ~2 years</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 16, opacity: ramp(now, at("p6", "Bedek had done the same"), 0.6) }}>earlier: Boeing 707 tankers for Israel</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, marginTop: 40, opacity: ramp(now, at("p6", "Find a cheap used airframe"), 0.6) }}>cheap used airframe → cargo conversion → refueling gear</div>
      </div>
      <div style={{ position: "absolute", left: 260, top: 230, opacity: f15, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4 }}>2016 · NINE EX-OREGON AIR GUARD F-15Ds</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 20, opacity: ramp(now, at("p6", "They were supposed to be used"), 0.6) }}>Meant for spare parts.</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 10, opacity: ramp(now, at("p6", "The Israeli Air Force's own"), 0.6) }}>Rebuilt by the IAF depot at Tel Nof into the "Baz" standard.</div>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.amber, marginTop: 30, opacity: ramp(now, at("p6", "Each jet took about 170"), 0.6) }}>~170 days per jet</div>
        <div style={{ fontSize: 38, color: C.dim, marginTop: 20, opacity: ramp(now, at("p6", "So it wasn't IAI"), 0.6) }}>Not IAI, and not quite a year: an air force depot, about half a year each.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 300, opacity: scale }}>
        <Stat x={0} y={0} value="$8.58B" label="for 25 new F-15IA (Dec 2025)" show={1} size={120} />
        <Stat x={760} y={0} value="~$343M" label="per airplane, including more than the airplane" show={ramp(now, at("p6", "That's about $343"), 0.8)} size={120} color={C.amber} />
        <Label x={0} y={320} w={1400} size={50} weight={700} color={C.ink} text="Buying new. And keeping the old ones flying." show={ramp(now, at("p6", "Israel is buying new"), 0.8)} />
      </div>
    </>
  );
};

/* ---------------- P7: WHAT IT WOULD TAKE ---------------- */
export const P7: React.FC<P> = ({ now }) => {
  const s = sectionOf("p7");
  const list = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p7", "And it would take a decision"), 1));
  const dec = ramp(now, at("p7", "And it would take a decision"), 1);
  const items: [string, string, string][] = [
    ["A design authority", "who owns the drawings?", "A design authority"],
    ["A first article", "years, paid once", "A first article"],
    ["A certification path", "military airworthiness, not FAA", "A certification path"],
    ["Conversion lines", "~3 birds per line per year · 130 birds = many lines", "Conversion lines"],
    ["A target", "someone else has to find it", "A target."],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 200, opacity: list, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim, marginBottom: 30 }}>The American hangar year would need:</div>
        {items.map(([a, b, k]) => (
          <div key={a} style={{ marginBottom: 26, opacity: ramp(now, at("p7", k), 0.6) }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: C.ink }}>{a}</div>
            <div style={{ fontSize: 32, color: C.dim }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 340, opacity: dec, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.ink }}>The first airplane is the hard part. Every one after it is a copy.</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 40, opacity: ramp(now, at("p7", "That's how freighter"), 0.6) }}>How freighter shops think. How the Tel Nof depot thought.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 14, opacity: ramp(now, at("p7", "It's not how big programs"), 0.6) }}>Not how big programs usually think.</div>
      </div>
    </>
  );
};

/* ---------------- P8: THE OTHER SIDE ---------------- */
export const P8: React.FC<P> = ({ now }) => {
  const s = sectionOf("p8");
  const items = [
    ["Boeing owns the data", "and would rather sell P-8s", "Boeing owns the data"],
    ["The skills leave with the line", "wait too long, learn it all again", "The skills leave"],
    ["Old wings are old", "fatigue history, checked bird by bird", "Old wings are old"],
    ["An airliner is not survivable", "launch from far back, behind the drones", "An airliner is not"],
    ["Israel is not America", "small fleet, own memory vs big contractor-run depots", "Israel is not America"],
    ["The missiles are still the cost", "~$19M of missiles on a ~$10M bird", "And the missiles are still"],
  ];
  return (
    <div style={{ position: "absolute", left: 220, top: 170, opacity: ramp(now, s.start + 0.3, 1), fontFamily: FONT }}>
      <div style={{ fontSize: 40, color: C.dim, marginBottom: 26 }}>The case against</div>
      {items.map(([a, b, k]) => (
        <div key={a} style={{ marginBottom: 22, opacity: ramp(now, at("p8", k), 0.8) }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: C.ink }}>— {a}</div>
          <div style={{ fontSize: 30, color: C.dim, marginLeft: 44 }}>{b}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------------- CLOSE ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const two = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("close", "The gap between them"), 1));
  const gap = ramp(now, at("close", "The gap between them"), 1) * (1 - ramp(now, at("close", "And somewhere there's a hangar"), 1));
  const hangar = ramp(now, at("close", "And somewhere there's a hangar"), 1) * (1 - ramp(now, at("close", "Whether the American"), 1));
  const end = ramp(now, at("close", "Whether the American"), 1);
  return (
    <>
      <Svg>
        <SideJet x={960} y={330} s={0.8} opacity={two} color="#5f6f7c" bay={1} pylons={1} />
        <SideJet x={960} y={720} s={0.8} opacity={two * ramp(now, at("close", "The other sits"), 1)} color={C.steel} />
        <SideJet x={960} y={760} s={0.75} opacity={end * ramp(now, at("close", "But it knows the hard part"), 1.2)} color={C.steel} pylons={1} missiles={1} />
      </Svg>
      <Label x={200} y={170} w={900} size={34} color={C.dim} text="built with its weapons, on a line that will close" show={two * ramp(now, at("close", "One was built"), 0.8)} />
      <Label x={200} y={560} w={900} size={34} color={C.dim} text="waiting in the desert to be parted out" show={two * ramp(now, at("close", "The other sits"), 0.8)} />
      <div style={{ position: "absolute", left: 300, top: 300, opacity: gap, fontFamily: FONT, fontSize: 52, fontWeight: 700, lineHeight: 1.55 }}>
        <div style={{ color: C.red, opacity: ramp(now, at("close", "A bay is surgery"), 0.6) }}>A bay: surgery on the pressure hull.</div>
        <div style={{ color: C.ink, opacity: ramp(now, at("close", "Wing pylons are hard"), 0.6) }}>Wing pylons: hard engineering, done once.</div>
        <div style={{ color: C.teal, opacity: ramp(now, at("close", "The rest, the heavy check"), 0.6) }}>The rest: work freighter shops do every day.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 320, opacity: hangar, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 58, fontWeight: 700, color: C.ink }}>Written off → into the hangar → flying again.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 30, opacity: ramp(now, at("close", "In Israel it's"), 0.6) }}>Israel: an air force depot, and a company that makes tankers out of airliners.</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 14, opacity: ramp(now, at("close", "In America it exists"), 0.6) }}>America: the freighter shops, building airplanes to carry packages.</div>
      </div>
      <Label x={300} y={220} w={1300} size={60} weight={700} color={C.ink} text="The episode doesn't know." show={end} />
      <Label x={300} y={320} w={1300} size={60} weight={700} color={C.amber} text="But the hard part is the first one." show={end * ramp(now, at("close", "But it knows the hard part"), 0.8)} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: who owns the drawings." show={ramp(now, s.start, 1)} />;
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

export const _unused = { H, clamp, Tag };
