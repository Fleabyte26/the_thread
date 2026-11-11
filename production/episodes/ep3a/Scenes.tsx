import React from "react";
import { C, FONT, MONO, W, H, at, ramp, sectionOf, clamp } from "./theme";
import { Bar, Label, Stat } from "./parts";
import { EP } from "./episode";

type P = { now: number };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

/** Turbofan cross-section, centred at (cx, cy). Parts: fan, lpc, core (hpc+comb+hpt), lpt, nozzle. */
const Engine: React.FC<{
  cx: number; cy: number; s?: number; core?: number; front?: number; back?: number; glow?: number; label?: number; split?: number; opacity?: number;
}> = ({ cx, cy, s = 1, core = 1, front = 1, back = 1, glow = 0, label = 0, split = 0, opacity = 1 }) => {
  const dx = split * 120;
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`} opacity={opacity}>
      {/* front: fan + low-pressure compressor (Snecma side) */}
      <g opacity={front} transform={`translate(${-dx},0)`}>
        <path d="M-380,-150 L-300,-170 L-300,170 L-380,150 Z" fill={C.teal} opacity={0.9} />
        <rect x={-300} y={-110} width={90} height={220} fill={C.teal} opacity={0.6} />
      </g>
      {/* core: HPC, combustor, HPT (GE side) */}
      <g opacity={core}>
        <rect x={-200} y={-80} width={400} height={160} rx={10} fill={C.amber} opacity={0.25 + 0.5 * glow} />
        <path d="M-200,-75 L-60,-50 L-60,50 L-200,75 Z" fill={C.amber} />
        <rect x={-55} y={-55} width={110} height={110} fill={C.red} opacity={0.85} />
        <path d="M60,-50 L200,-70 L200,70 L60,50 Z" fill={C.amber} />
      </g>
      {/* back: low-pressure turbine + nozzle (Snecma side) */}
      <g opacity={back} transform={`translate(${dx},0)`}>
        <rect x={210} y={-95} width={90} height={190} fill={C.teal} opacity={0.6} />
        <path d="M300,-110 L400,-70 L400,70 L300,110 Z" fill={C.teal} opacity={0.9} />
      </g>
      <line x1={-400} y1={0} x2={420} y2={0} stroke={C.bg} strokeWidth={6} opacity={0.6} />
      <g opacity={label} fontFamily={FONT} fontSize={26} fill={C.dim} textAnchor="middle">
        <text x={-300 - dx} y={220}>fan · low-pressure</text>
        <text x={0} y={140} fill={C.amber}>THE CORE</text>
        <text x={0} y={175}>compressor · combustor · turbine</text>
        <text x={300 + dx} y={220}>turbine · nozzle</text>
      </g>
    </g>
  );
};

/** A room with a door and a padlock, drawn around a centre point. */
const Room: React.FC<{ cx: number; cy: number; w?: number; h?: number; open?: number; opacity?: number }> = ({ cx, cy, w = 900, h = 520, open = 0, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="none" stroke={C.dim} strokeWidth={6} />
    {/* door on the right wall */}
    <rect x={cx + w / 2 - 3} y={cy - 90} width={6} height={180} fill={C.bg} />
    <line x1={cx + w / 2} y1={cy - 90} x2={cx + w / 2 + 160 * open} y2={cy - 90 - 60 * open} stroke={C.ink} strokeWidth={6} />
    <line x1={cx + w / 2} y1={cy + 90} x2={cx + w / 2 + 160 * open} y2={cy + 90 - 60 * open} stroke={C.ink} strokeWidth={6} />
    <line x1={cx + w / 2 + 160 * open} y1={cy - 90 - 60 * open} x2={cx + w / 2 + 160 * open} y2={cy + 90 - 60 * open} stroke={C.ink} strokeWidth={6} />
    {/* padlock */}
    <g opacity={1 - open} transform={`translate(${cx + w / 2 + 40},${cy})`}>
      <path d="M-16,-10 L-16,-30 Q0,-50 16,-30 L16,-10" fill="none" stroke={C.amber} strokeWidth={6} />
      <rect x={-26} y={-12} width={52} height={42} rx={6} fill={C.amber} />
    </g>
  </g>
);

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const room = ramp(now, s.start + 0.3, 2);
  const core = ramp(now, at("cold", "Inside it, American"), 1.5);
  const parts = ramp(now, at("cold", "bolted French parts"), 1.5);
  const out = ramp(now, at("cold", "Then they rolled it out"), 1.5);
  const hot = ramp(now, at("cold", "the hot core"), 1.5);
  const stat = ramp(now, at("cold", "thirty-two thousand"), 1) * (1 - ramp(now, at("cold", "The room was supposed"), 1));
  const list = ramp(now, at("cold", "You can build a fuselage"), 1);
  const scene = 1 - list;
  return (
    <>
      <Svg>
        <g opacity={scene}>
          <Room cx={960} cy={560} opacity={room} />
          <g transform={`translate(${out * 700},0)`}>
            <Engine cx={960} cy={560} s={0.9} core={core} front={parts} back={parts} glow={hot} split={1 - parts} />
          </g>
        </g>
      </Svg>
      <Stat x={160} y={130} value="32,000+" label="CFM56 engines delivered by 2018" show={stat * scene} color={C.amber} />
      <div style={{ position: "absolute", left: 300, top: 260, opacity: list, fontFamily: FONT, lineHeight: 1.5 }}>
        {[
          ["A fuselage: almost anywhere.", "You can build a fuselage", C.dim],
          ["Wings: a few places.", "Wings, a few places", C.dim],
          ["Avionics: more than you'd think.", "Avionics, more than", C.dim],
          ["A hot core that doesn't come apart: a very short list.", "But an engine that runs hot", C.amber],
        ].map(([t, k, col]) => (
          <div key={t} style={{ fontSize: 56, fontWeight: 700, color: col, opacity: ramp(now, at("cold", k), 0.8) }}>{t}</div>
        ))}
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

/* ---------------- P1: THE BOMBER'S HEART ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const bomber = ramp(now, at("p1", "In 1970, the Air Force picked"), 1) * (1 - ramp(now, at("p1", "The F101 was an afterburning"), 1));
  const eng = ramp(now, at("p1", "The F101 was an afterburning"), 1.2) * (1 - ramp(now, at("p1", "At the same time"), 1));
  const coreGlow = ramp(now, at("p1", "was the core"), 1.5);
  const two = ramp(now, at("p1", "At the same time"), 1) * (1 - ramp(now, at("p1", "The name came"), 1));
  const ge = ramp(now, at("p1", "GE would bring the core"), 1);
  const sn = ramp(now, at("p1", "Snecma would bring the fan"), 1);
  const name = ramp(now, at("p1", "The name came"), 1);
  const no = ramp(now, at("p1", "Washington said no"), 0.6);
  const intro = ramp(now, s.start + 0.3, 1) * (1 - bomber) * (1 - eng) * (1 - two) * (1 - name);
  return (
    <>
      <Svg>
        {/* generic swing-wing bomber planform */}
        <g opacity={bomber} transform="translate(960,520)">
          <path d="M0,-260 L30,-120 L320,40 L320,70 L40,10 L40,180 L120,250 L120,270 L0,240 L-120,270 L-120,250 L-40,180 L-40,10 L-320,70 L-320,40 L-30,-120 Z" fill={C.steel} />
        </g>
        <Engine cx={960} cy={540} s={1.1} opacity={eng} glow={coreGlow} label={eng} front={1 - coreGlow * 0.6} back={1 - coreGlow * 0.6} />
        <Engine cx={960} cy={560} s={1.0} opacity={two} core={1} front={sn} back={sn} glow={ge} split={1 - sn} />
      </Svg>
      <Label x={360} y={460} w={1200} size={60} weight={700} color={C.ink} text="Start with the F101." show={intro} />
      <Stat x={160} y={150} value="1970" label="F101 picked for the B-1 bomber" show={bomber} />
      <Label x={360} y={150} w={500} size={34} color={C.amber} weight={700} text="GE (USA): the core" show={two * ge} />
      <Label x={1160} y={150} w={500} size={34} color={C.teal} weight={700} text="Snecma (France): fan, low-pressure, the rest" show={two * sn} />
      <Label x={660} y={880} w={700} size={30} text="50 / 50" show={two * sn} color={C.dim} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: name, fontFamily: FONT }}>
        <div style={{ fontSize: 150, fontWeight: 700, color: C.ink, letterSpacing: -4 }}>
          <span style={{ color: C.amber }}>CF</span>
          <span style={{ color: C.dim, fontSize: 90, margin: "0 30px" }}>+</span>
          <span style={{ color: C.teal }}>M56</span>
        </div>
      </div>
      <Label x={360} y={760} w={1200} size={64} weight={700} color={C.red} text="Washington said no." show={no} />
    </>
  );
};

/* ---------------- P2: NIXON ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const tl = ramp(now, s.start + 0.5, 1) * (1 - ramp(now, at("p2", "GE argued the opposite"), 1));
  const ge = ramp(now, at("p2", "GE argued the opposite"), 1) * (1 - ramp(now, at("p2", "The French pushed"), 1));
  const summit = ramp(now, at("p2", "The French pushed"), 1) * (1 - ramp(now, at("p2", "And the price of the license"), 1));
  const price = ramp(now, at("p2", "And the price of the license"), 1) * (1 - ramp(now, at("p2", "And then there was the room"), 1));
  const room = ramp(now, at("p2", "And then there was the room"), 1);
  const coreIn = ramp(now, at("p2", "It would be shipped"), 1.5);
  const parts = ramp(now, at("p2", "Snecma's front and back sections"), 1.5);
  const outRoll = ramp(now, at("p2", "Then the engine came out"), 1.5);
  const first = ramp(now, at("p2", "The first complete CFM56"), 1);
  const items = [
    ["1971", "GE and Snecma agree to work together", s.start],
    ["1972", "Export license for the F101 core refused", at("p2", "In 1972, GE applied")],
    ["fear", "leak to the Soviet Union; handing over U.S.-funded technology", at("p2", "The fear had two layers")],
    ["", "\"the beginning of the end of American aerospace leadership\"", at("p2", "And some officials")],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: tl, fontFamily: FONT }}>
        {items.map(([y, t, when], i) => (
          <div key={i} style={{ display: "flex", gap: 40, marginBottom: 46, opacity: ramp(now, when as number, 0.8), alignItems: "baseline" }}>
            <div style={{ width: 160, fontSize: 52, fontWeight: 700, color: y === "1972" ? C.red : C.ink }}>{y}</div>
            <div style={{ fontSize: 42, color: i === 3 ? C.amber : C.dim, maxWidth: 1250, fontStyle: i === 3 ? "italic" : "normal" }}>{t}</div>
          </div>
        ))}
      </div>
      <Stat x={360} y={330} value="$180M" label="what GE said sharing the core would save the U.S. government" show={ge} color={C.teal} />
      <div style={{ position: "absolute", left: 220, top: 260, opacity: summit, fontFamily: FONT }}>
        <div style={{ fontSize: 46, color: C.dim, opacity: ramp(now, at("p2", "President Georges Pompidou"), 0.8) }}>Pompidou → Nixon</div>
        <div style={{ fontSize: 46, color: C.dim, marginTop: 24, opacity: ramp(now, at("p2", "Henry Kissinger"), 0.8) }}>Kissinger → Pompidou</div>
        <div style={{ fontSize: 96, fontWeight: 700, color: C.ink, marginTop: 50, opacity: ramp(now, at("p2", "They met in Reykjavik"), 1) }}>Reykjavik, 1973</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.teal, marginTop: 20, opacity: ramp(now, at("p2", "The license was granted"), 0.8) }}>License granted.</div>
        <div style={{ fontSize: 36, color: C.dim, marginTop: 40, maxWidth: 1300, opacity: ramp(now, at("p2", "A consultant to the White House"), 0.8) }}>
          A White House consultant, in GE's own history: Nixon "couldn't have cared less" about the engine.
        </div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: price, fontFamily: FONT }}>
        <Stat x={0} y={0} value="$80M" label="royalty to the U.S. government" show={1} color={C.amber} />
        <Stat x={600} y={0} value="$20,000" label="per engine expected to be built" show={ramp(now, at("p2", "calculated at $20,000"), 1)} />
        <Label x={0} y={320} w={1400} size={40} color={C.ink} text="Declassified 2007: France agreed not to seek tariffs on American aircraft imported into Europe." show={ramp(now, at("p2", "Documents declassified"), 1)} />
      </div>
      <Svg>
        <g opacity={room * (1 - first * 0.6)}>
          <Room cx={960} cy={560} w={820} h={480} opacity={1} />
          <text x={960} y={280} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={C.dim}>Snecma plant, France</text>
          <g transform={`translate(${(1 - coreIn) * -900 + outRoll * 760},0)`}>
            <Engine cx={960} cy={560} s={0.75} front={parts} back={parts} split={1 - parts} glow={1} />
          </g>
          <text x={960} y={860} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={C.amber} opacity={ramp(now, at("p2", "a locked room that even"), 1)}>even Snecma's president could not enter</text>
        </g>
      </Svg>
      <Stat x={160} y={130} value="June 20, 1974" label="first CFM56 runs, Evendale, Ohio" show={first} size={72} />
    </>
  );
};

/* ---------------- P3: NOBODY WANTED IT ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const wait = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p3", "In April 1979"), 1));
  const dc8 = ramp(now, at("p3", "In April 1979"), 1) * (1 - ramp(now, at("p3", "Then came the order"), 1));
  const kc = ramp(now, at("p3", "Then came the order"), 1) * (1 - ramp(now, at("p3", "Stop and look at the loop"), 1));
  const loop = ramp(now, at("p3", "Stop and look at the loop"), 1) * (1 - ramp(now, at("p3", "Then the 737 Classic"), 1));
  const fam = ramp(now, at("p3", "Then the 737 Classic"), 1);
  const count = Math.round(32645 * ramp(now, at("p3", "By June 2018"), 3));
  return (
    <>
      <Label x={360} y={420} w={1200} size={64} weight={700} color={C.ink} text="An engine without an airplane is a very expensive sculpture." show={wait} />
      <Label x={360} y={620} w={1200} size={40} color={C.amber} text="By one account: two weeks from freezing development." show={wait * ramp(now, at("p3", "By one account"), 1)} />
      <div style={{ position: "absolute", left: 220, top: 260, opacity: dc8, fontFamily: FONT }}>
        <Stat x={0} y={0} value="April 1979" label="United picks the CFM56-2 to re-engine 30 DC-8-61s" show={1} />
        <Label x={0} y={260} w={1300} size={40} color={C.dim} text="Then Delta and Flying Tiger Line: the DC-8 Super 70, in service 1982" show={ramp(now, at("p3", "Delta and Flying Tiger"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: kc }}>
        <Stat x={0} y={0} value="January 1980" label="Air Force picks the CFM56 for the KC-135: the KC-135R" show={1} size={80} />
        <Stat x={0} y={290} value="−3,500 ft" label="takeoff distance, up to" show={ramp(now, at("p3", "The new engine cut"), 1)} size={64} color={C.teal} />
        <Stat x={520} y={290} value="−25%" label="fuel use" show={ramp(now, at("p3", "The new engine cut") + 1, 1)} size={64} color={C.teal} />
        <Stat x={940} y={290} value="−24 dB" label="noise" show={ramp(now, at("p3", "The new engine cut") + 2, 1)} size={64} color={C.teal} />
      </div>
      <Svg>
        <g opacity={loop} fontFamily={FONT}>
          {[
            { x: 960, y: 260, t: "core from a bomber", c: C.red },
            { x: 1400, y: 560, t: "export refused", c: C.dim },
            { x: 960, y: 860, t: "airliner engine", c: C.teal },
            { x: 520, y: 560, t: "refuels the bombers", c: C.amber },
          ].map((n, i) => (
            <g key={i} opacity={ramp(now, at("p3", "Stop and look") + i * 1.6, 0.8)}>
              <circle cx={n.x} cy={n.y} r={14} fill={n.c} />
              <text x={n.x} y={n.y - 32} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.ink}>{n.t}</text>
            </g>
          ))}
          <circle cx={960} cy={560} r={300} fill="none" stroke={C.faint} strokeWidth={4} strokeDasharray="12 12" />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: fam, fontFamily: FONT }}>
        {[["737 Classic", "Then the 737 Classic"], ["A320", "Then the A320"], ["737 Next Generation", "Then the 737 Next Generation"]].map(([t, k]) => (
          <div key={t} style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginBottom: 20, opacity: ramp(now, at("p3", k), 0.6) }}>{t}</div>
        ))}
        <div style={{ marginTop: 50, fontSize: 130, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p3", "By June 2018"), 0.6), fontFamily: FONT }}>{count.toLocaleString("en-US")}</div>
        <div style={{ fontSize: 32, color: C.dim, opacity: ramp(now, at("p3", "By June 2018"), 0.6) }}>CFM56s delivered by June 2018 · partnership renewed to 2040</div>
      </div>
    </>
  );
};

/* ---------------- P4: THE ROOM BECOMES A WEAPON ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const vars = ramp(now, s.start + 0.5, 1) * (1 - ramp(now, at("p4", "In 2025, CFM delivered"), 1));
  const deliv = ramp(now, at("p4", "In 2025, CFM delivered"), 1) * (1 - ramp(now, at("p4", "That's the commercial locked room"), 1));
  const lever = ramp(now, at("p4", "Then, in May 2025"), 1) * (1 - ramp(now, at("p4", "So in 1972 Washington"), 1));
  const doors = ramp(now, at("p4", "So in 1972 Washington"), 1) * (1 - ramp(now, at("p4", "China read the lesson"), 1));
  const cj = ramp(now, at("p4", "China read the lesson"), 1);
  const commercial = ramp(now, at("p4", "That's the commercial locked room"), 1) * (1 - ramp(now, at("p4", "Then, in May 2025"), 1));
  const v = [
    ["LEAP-1A", "Airbus A320neo", "option · ~60% of orders"],
    ["LEAP-1B", "Boeing 737 MAX", "only engine"],
    ["LEAP-1C", "COMAC C919", "only engine"],
  ];
  return (
    <>
      <div style={{ position: "absolute", left: 200, top: 260, opacity: vars, fontFamily: FONT, display: "flex", gap: 60 }}>
        {v.map(([a, b, c], i) => (
          <div key={a} style={{ width: 460, padding: 36, border: `2px solid ${i === 2 ? C.red : C.faint}`, opacity: ramp(now, s.start + 2 + i * 1.5, 0.8) }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: C.amber }}>{a}</div>
            <div style={{ fontSize: 40, color: C.ink, marginTop: 20 }}>{b}</div>
            <div style={{ fontSize: 30, color: C.dim, marginTop: 12 }}>{c}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: deliv }}>
        <Label x={0} y={0} text="LEAP deliveries" show={1} size={32} />
        <Bar x={0} y={80} w={1200} frac={1802 / 2600} label="2025" value="1,802" color={C.steel} show={ramp(now, at("p4", "In 2025, CFM delivered"), 1.2)} />
        <Bar x={0} y={230} w={1200} frac={2126 / 2600} label="2026 (expected)" value="~2,126" color={C.amber} show={ramp(now, at("p4", "It expects about fifteen"), 1.2)} />
        <Bar x={0} y={380} w={1200} frac={1} label="2028 (target)" value="~2,600" color={C.faint} show={ramp(now, at("p4", "It expects about fifteen") + 2, 1.2)} dashed />
        <Label x={0} y={560} w={1400} size={38} color={C.red} weight={700} text="Even so, there isn't enough." show={ramp(now, at("p4", "Even so, there isn't enough"), 0.8)} />
        <Label x={0} y={630} w={1400} size={32} color={C.dim} text="Airbus deliveries slipped in early 2026; one delayed $175M forging press in France" show={ramp(now, at("p4", "Airbus's deliveries dropped"), 0.8)} />
      </div>
      <Label x={300} y={440} w={1300} size={52} weight={700} color={C.ink} text="Two airframers. Three engine variants. One supply chain, as fast as its slowest forging press." show={commercial} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: lever }}>
        <Stat x={0} y={0} value="May 2025" label="U.S. suspends export licenses to COMAC: LEAP-1C (C919) and CF34 (C909)" show={1} size={80} />
        <Bar x={0} y={300} w={1200} frac={75 / 75} label="C919s industry sources talked about for 2025" value="75" color={C.faint} show={ramp(now, at("p4", "Industry sources had talked"), 1)} />
        <Bar x={0} y={450} w={1200} frac={15 / 75} label="C919s delivered in 2025" value="15" color={C.red} show={ramp(now, at("p4", "It delivered fifteen"), 1)} />
        <Label x={0} y={620} w={1400} size={34} color={C.teal} text="Weeks later: licenses restored in a wider trade de-escalation" show={ramp(now, at("p4", "A few weeks later"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 260, top: 260, opacity: doors, fontFamily: FONT }}>
        {[["1972", "No.", C.red, "So in 1972"], ["1973", "Yes, with a lock on the door.", C.teal, "In 1973 it said yes"], ["2025", "Door closed, then opened again for something else.", C.amber, "And in 2025"]].map(([y, t, col, k]) => (
          <div key={y} style={{ display: "flex", gap: 50, marginBottom: 56, opacity: ramp(now, at("p4", k), 0.8), alignItems: "baseline" }}>
            <div style={{ width: 180, fontSize: 70, fontWeight: 700, color: C.ink }}>{y}</div>
            <div style={{ fontSize: 52, fontWeight: 600, color: col }}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 220, top: 260, opacity: cj }}>
        <Stat x={0} y={0} value="CJ-1000A" label="China's replacement for the LEAP-1C · flown on a Y-20 testbed · certification not expected before 2027 (2025 reporting)" show={1} />
        <Label x={0} y={330} w={1400} size={40} color={C.amber} text="The lock was also on how good a version China could have." show={ramp(now, at("p4", "So the lock wasn't only"), 1)} />
      </div>
    </>
  );
};

/* ---------------- P5: THE CORE THAT GOT OUT (REPORTED) ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const careful = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p5", "In the 1980s"), 1));
  const chain = ramp(now, at("p5", "In the 1980s"), 1) * (1 - ramp(now, at("p5", "Today the WS-10"), 1));
  const jets = ramp(now, at("p5", "Today the WS-10"), 1);
  const nodes = [
    { x: 300, t: "F101", sub: "B-1 bomber, 1970", k: s.start, solid: true },
    { x: 760, t: "CFM56", sub: "locked room, 1974", k: s.start, solid: true },
    { x: 1220, t: "WS-10", sub: "China, from 1986", k: at("p5", "Several Western"), solid: false },
    { x: 1640, t: "?", sub: "", k: at("p5", "Where those grandchildren"), solid: false },
  ];
  return (
    <>
      <Label x={360} y={440} w={1200} size={60} weight={700} color={C.ink} text="Now the part that has to be told carefully." show={careful} />
      <Svg>
        <g opacity={chain + jets * 0.35} fontFamily={FONT}>
          {nodes.map((n, i) => (
            <g key={n.t} opacity={ramp(now, n.k, 1)}>
              {i > 0 ? (
                <line x1={nodes[i - 1].x + 120} y1={460} x2={n.x - 120} y2={460} stroke={n.solid ? C.ink : C.amber} strokeWidth={5} strokeDasharray={n.solid ? undefined : "16 12"} />
              ) : null}
              <rect x={n.x - 120} y={400} width={240} height={120} fill="none" stroke={n.solid ? C.ink : C.amber} strokeWidth={4} strokeDasharray={n.solid ? undefined : "12 8"} />
              <text x={n.x} y={475} textAnchor="middle" fontSize={50} fontWeight={700} fill={n.solid ? C.ink : C.amber}>{n.t}</text>
              <text x={n.x} y={570} textAnchor="middle" fontSize={26} fill={C.dim}>{n.sub}</text>
            </g>
          ))}
        </g>
      </Svg>
      <Label x={300} y={220} w={1400} size={36} color={C.dim} text="Reportedly: two CFM56s bought in the 1980s, before the 1989 embargo" show={chain * ramp(now, at("p5", "In the 1980s"), 1)} />
      <Label x={300} y={680} w={1400} size={36} color={C.dim} text="WS-10 design review December 2005 · mass production around 2011" show={chain * ramp(now, at("p5", "It took eighteen years"), 1)} />
      <Label x={300} y={760} w={1400} size={48} weight={700} color={C.ink} text="The room kept the French out of the core. It may not have kept the core in." show={chain * ramp(now, at("p5", "The room kept the French"), 1)} />
      <div style={{ position: "absolute", left: 300, top: 640, opacity: jets, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim }}>WS-10 family powers (later versions):</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 14 }}>J-10C · J-11B · J-16 · J-20 (WS-10C, from 2019)</div>
        <div style={{ fontSize: 36, color: C.dim, marginTop: 20, opacity: ramp(now, at("p5", "A non-afterburning cousin"), 1) }}>WS-20, believed to share the core → Y-20 transport</div>
      </div>
    </>
  );
};

/* ---------------- CLOSE ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const open = ramp(now, s.start + 1, 4);
  const lines = ramp(now, at("close", "It protected a core"), 1) * (1 - ramp(now, at("close", "In 1972, an official"), 1));
  const q = ramp(now, at("close", "In 1972, an official"), 1) * (1 - ramp(now, at("close", "The episode doesn't know"), 1));
  const end = ramp(now, at("close", "The episode doesn't know"), 1.2);
  return (
    <>
      <Svg>
        <g opacity={1 - lines * 0.85 - q * 0.85 - end * 0.85}>
          <Room cx={960} cy={560} open={open} />
          <rect x={1385} y={470} width={240 * open} height={180} fill={C.amber} opacity={0.12 * open} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: lines, fontFamily: FONT, fontSize: 52, fontWeight: 600, color: C.ink, lineHeight: 1.45 }}>
        {[["It protected a core for a while.", "It protected a core"], ["It turned a refusal into a partnership.", "It turned a refusal"], ["The partnership became the most successful engine family in history.", "The partnership produced"], ["And the door can still be closed from five thousand miles away.", "And Washington proved"]].map(([t, k]) => (
          <div key={t} style={{ opacity: ramp(now, at("close", k), 0.8) }}>{t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 340, opacity: q, fontFamily: FONT }}>
        <div style={{ fontSize: 48, fontStyle: "italic", color: C.dim, maxWidth: 1300 }}>"the beginning of the end of American aerospace leadership"</div>
        <div style={{ fontSize: 30, color: C.dim, marginTop: 16 }}>Nixon administration officials, 1972</div>
        <div style={{ fontSize: 72, fontWeight: 700, color: C.amber, marginTop: 60, opacity: ramp(now, at("close", "Maybe it was just early"), 0.8) }}>Maybe it was just early.</div>
      </div>
      <Label x={360} y={460} w={1200} size={84} weight={700} color={C.ink} text="The episode doesn't know." show={end} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: the second door, and the Great Engine War." show={ramp(now, s.start, 1)} />;
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

export const _unused = { MONO, clamp };
