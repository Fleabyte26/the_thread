import React from "react";
import { C, FONT, MONO, W, H, at, ramp, sectionOf, clamp } from "./theme";
import { Bar, Hull, Label, Quote, Stat } from "./parts";

type P = { now: number };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

/* ---------------- COLD OPEN ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const ship = ramp(now, s.start + 0.5, 3);
  const gunsOut = 1 - ramp(now, at("cold", "two big guns"), 2.5);
  const tubes = ramp(now, at("cold", "four very large missile"), 2);
  const planned = ramp(now, at("cold", "thirty-two"), 1);
  const built = ramp(now, at("cold", "It built three"), 1);
  const cost = ramp(now, at("cold", "2018 count"), 1);
  const q1 = ramp(now, at("cold", "What else could that money"), 1.2);
  const q2 = ramp(now, at("cold", "what else could those years"), 1.2);
  const drift = (now - s.start) * 3;
  return (
    <>
      <Svg>
        {/* dry dock walls */}
        <g opacity={ship * (1 - q1 * 0.7)}>
          <rect x={560} y={620} width={800} height={14} fill={C.faint} />
          <rect x={560} y={540} width={10} height={90} fill={C.faint} />
          <rect x={1350} y={540} width={10} height={90} fill={C.faint} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={640 + i * 150} y={600} width={40} height={20} fill={C.faint} />
          ))}
          <Hull kind="destroyer" x={660 - drift * 0.2} y={505} scale={1.0} guns={gunsOut} tubes={tubes} />
        </g>
      </Svg>
      <Stat x={160} y={150} value="32" label="Zumwalt-class destroyers planned" show={planned * (1 - q1)} color={C.dim} />
      <Stat x={520} y={150} value="3" label="built" show={built * (1 - q1)} color={C.amber} />
      <Stat x={1280} y={150} value="~$24.5B" label="program cost, R&D included (GAO, 2018)" show={cost * (1 - q1)} />
      <Label x={360} y={420} w={1200} size={84} weight={700} color={C.ink} text="What else could that money have been?" show={q1 * (1 - q2 * 0.6)} />
      <Label x={360} y={560} w={1200} size={84} weight={700} color={C.amber} text="What else could those years have been?" show={q2} />
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
      <div style={{ fontFamily: FONT, fontSize: 30, color: C.dim, letterSpacing: 4 }}>EPISODE 3</div>
      <div style={{ fontFamily: FONT, fontSize: 120, fontWeight: 700, color: C.ink, letterSpacing: -3, marginTop: 10 }}>The Wasted Years</div>
    </div>
  );
};

/* ---------------- PART 1: ZUMWALT ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const hull = ramp(now, at("p1", "The hull slopes inward"), 1.5) * (1 - ramp(now, at("p1", "The future had a price"), 1));
  const fleet = ramp(now, at("p1", "The future had a price"), 1);
  const fall = ramp(now, at("p1", "number of ships fell"), 3);
  const fleetOut = 1 - ramp(now, at("p1", "So the Navy has three"), 1);
  const range = ramp(now, at("p1", "1,725 miles"), 2) * (1 - ramp(now, at("p1", "But look at what the rebirth"), 1));
  const cps = ramp(now, at("p1", "program estimate grew"), 1) * (1 - ramp(now, at("p1", "Twenty-nine ships"), 1));
  const missile = ramp(now, at("p1", "$67 million"), 1) * (1 - ramp(now, at("p1", "Twenty-nine ships"), 1));
  const ghost = ramp(now, at("p1", "Twenty-nine ships"), 1.5);
  const intro = ramp(now, s.start + 0.3, 1.5) * (1 - hull) * (1 - fleet);
  const icons = Array.from({ length: 32 }, (_, i) => i);
  return (
    <>
      <Svg>
        <g opacity={intro}>
          <Hull kind="destroyer" x={660} y={460} scale={1} guns={1} />
        </g>
        {/* cross-section: tumblehome vs flared */}
        <g opacity={hull} transform="translate(560,300)">
          <path d="M0,300 L60,40 L240,40 L300,300 Z" fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="10 8" />
          <path d="M40,300 L0,60 L300,60 L260,300 Z" fill={C.steel} opacity={0.85} />
          <text x={150} y={360} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={C.dim}>hull slopes inward as it rises</text>
          <g transform="translate(520,0)">
            <path d="M40,300 L0,40 L300,40 L260,300 Z" fill="none" stroke={C.dim} strokeWidth={3} />
            <text x={150} y={360} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={C.dim}>conventional flare</text>
          </g>
        </g>
        {/* 32 -> 3 */}
        <g opacity={fleet * fleetOut}>
          {icons.map((i) => {
            const col = i % 8, row = Math.floor(i / 8);
            const keep = i < 3;
            const op = keep ? 1 : 1 - fall * 0.87;
            return (
              <g key={i} opacity={op}>
                <Hull kind="destroyer" x={190 + col * 200} y={220 + row * 150} scale={0.28} color={keep ? C.amber : C.steel} guns={1} />
              </g>
            );
          })}
        </g>
        {/* ghost row at end */}
        <g opacity={ghost}>
          {icons.slice(3).map((i) => {
            const col = (i - 3) % 10, row = Math.floor((i - 3) / 10);
            return <Hull key={i} kind="destroyer" x={120 + col * 172} y={300 + row * 150} scale={0.24} color={C.ghost} guns={1} />;
          })}
        </g>
      </Svg>
      <Label x={190} y={150} text="Zumwalt class: planned vs. built" show={fleet * fleetOut} size={34} />
      <Bar x={260} y={300} w={1300} frac={63 / 1725} label="Advanced Gun System reach" value="~63 miles" color={C.steel} show={range} />
      <Bar x={260} y={460} w={1300} frac={1} label="Conventional Prompt Strike reach" value="~1,725 miles" color={C.amber} show={ramp(now, at("p1", "1,725 miles") + 1.5, 2) * range} />
      <Stat x={200} y={300} value="$31B → $41B" label="CPS program estimate, 2020 → 2024" show={cps} />
      <Stat x={200} y={560} value="262 → 224" label="missiles planned" show={cps} color={C.dim} size={72} />
      <Stat x={1080} y={300} value="~$67M" label="average cost per missile (GAO, April 2026)" show={missile} color={C.amber} />
      <Stat x={1080} y={560} value="$10.6B" label="acquisition cost per ship (GAO, 2025)" show={ramp(now, at("p1", "GAO's 2025"), 1) * (1 - ghost)} size={72} />
      <Label x={120} y={150} w={1600} size={56} weight={700} color={C.ink} text="29 ships that were never built" show={ghost} />
    </>
  );
};

/* ---------------- PART 2: CONSTELLATION ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const ships = ramp(now, at("p2", "Build twenty"), 1.5);
  const cut = ramp(now, at("p2", "Eighteen of the planned twenty"), 2.5);
  const shipsOut = 1 - ramp(now, at("p2", "A Navy official explained"), 1);
  const weight = ramp(now, at("p2", "759 tons"), 1.5) * (1 - ships * 0 - ramp(now, at("p2", "And here's the part"), 1));
  const cost = ramp(now, at("p2", "$850 to $950"), 1.5) * (1 - ramp(now, at("p2", "And here's the part"), 1));
  const timeline = ramp(now, at("p2", "In April 2024"), 1) * (1 - ramp(now, at("p2", "759 tons"), 0.8));
  const intro = ramp(now, s.start + 0.3, 1.2) * (1 - ships);
  const quote = ramp(now, at("p2", "80 percent of the cost"), 1) * (1 - ramp(now, at("p2", "A month later"), 1));
  const ffx = ramp(now, at("p2", "A month later"), 1);
  const shown = ships * shipsOut * (1 - timeline) * (1 - weight) * (1 - cost);
  return (
    <>
      <Svg>
        <g opacity={intro}>
          <Hull kind="frigate" x={735} y={480} />
        </g>
        <g opacity={shown}>
          {Array.from({ length: 20 }, (_, i) => {
            const col = i % 5, row = Math.floor(i / 5);
            const keep = i < 2;
            return (
              <g key={i} opacity={keep ? 1 : 1 - cut * 0.88}>
                <Hull kind="frigate" x={260 + col * 290} y={240 + row * 160} scale={0.5} color={keep ? C.amber : C.steel} />
              </g>
            );
          })}
        </g>
        <g opacity={ffx}>
          <Hull kind="frigate" x={500} y={560} scale={1.1} color={C.teal} />
        </g>
      </Svg>
      <Label x={260} y={150} size={34} text={cut > 0.5 ? "Constellation class: 20 planned, 2 kept" : "Constellation class: 20 planned"} show={shown} />
      <div style={{ position: "absolute", left: 260, top: 330, opacity: timeline, fontFamily: FONT }}>
        {[
          ["2020", "FREMM-based design selected"],
          ["2026", "first ship due"],
          ["Apr 2024", "about three years late"],
          ["Apr 2025", "about 10% complete, design not final"],
        ].map(([y, t], i) => (
          <div key={i} style={{ display: "flex", gap: 40, marginBottom: 34, opacity: ramp(now, at("p2", "In April 2024") + i * 0.6, 0.6) }}>
            <div style={{ width: 220, fontSize: 44, fontWeight: 700, color: i === 1 ? C.amber : C.ink }}>{y}</div>
            <div style={{ fontSize: 40, color: C.dim }}>{t}</div>
          </div>
        ))}
      </div>
      <Stat x={260} y={330} value="+759 t" label="weight growth, by one count" show={weight} color={C.amber} />
      <Bar x={900} y={330} w={760} frac={0.9 / 1.2} label="estimate per hull" value="$0.85–0.95B" color={C.steel} show={cost} />
      <Bar x={900} y={480} w={760} frac={1.1 / 1.2} label="by 2025" value="> $1.1B" color={C.red} show={ramp(now, at("p2", "$850 to $950") + 1.2, 1.5) * cost} />
      <Quote x={300} y={330} text="You might as well build destroyers." who="Navy official on the cancellation: 80% of the cost of a Burke, 60% of the capability" show={quote} />
      <Label x={500} y={380} size={44} weight={700} color={C.ink} w={1100} text="FF(X): based on the National Security Cutter hull, already in production" show={ffx} />
    </>
  );
};

/* ---------------- PART 3: LCS ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const two = ramp(now, at("p3", "two completely different ships"), 1.2) * (1 - ramp(now, at("p3", "The mission modules lagged"), 1));
  const intro = ramp(now, s.start + 0.3, 1.2) * (1 - two) * (1 - ramp(now, at("p3", "Admiral Vern Clark"), 1));
  const clark = ramp(now, at("p3", "Admiral Vern Clark"), 1) * (1 - ramp(now, at("p3", "The Navy didn't pick"), 0.8));
  const life = ramp(now, at("p3", "Sioux City"), 1) * (1 - ramp(now, at("p3", "Defense News"), 1));
  const loss = ramp(now, at("p3", "Defense News"), 1) * (1 - ramp(now, at("p3", "There's a version"), 1));
  const plan = ramp(now, at("p3", "once planned 55"), 1) * (1 - ramp(now, at("p3", "There's a version"), 1));
  const end = ramp(now, at("p3", "designed for one world"), 1.2);
  return (
    <>
      <Svg>
        <g opacity={intro}><Hull kind="lcs" x={780} y={480} /></g>
        <g opacity={two}>
          <Hull kind="lcs" x={330} y={460} color={C.steel} />
          <Hull kind="lcs" x={1210} y={460} color={C.teal} />
        </g>
        <g opacity={end}>
          <Hull kind="lcs" x={400} y={520} color={C.ghost} />
          <Hull kind="lcs" x={1120} y={520} color={C.ghost} />
        </g>
      </Svg>
      <Stat x={300} y={300} value="$250M" label="hoped-for cost each: five for the price of one destroyer" show={clark} />
      <Label x={330} y={600} w={420} size={30} text="Freedom: steel monohull, Wisconsin" show={two} />
      <Label x={1210} y={600} w={420} size={30} text="Independence: aluminum trimaran, Alabama" show={two} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: life }}>
        <Label x={0} y={0} text="Service life against a 25-year design life" show={1} size={32} />
        <Bar x={0} y={80} w={1300} frac={4.75 / 25} label="USS Sioux City: ~$362M, 4 years 9 months" value="19%" color={C.red} show={ramp(now, at("p3", "Sioux City") + 0.5, 1.5)} />
        <Bar x={0} y={240} w={1300} frac={14 / 25} label="USS Fort Worth: decommissioned July 29, 2026" value="56%" color={C.amber} show={ramp(now, at("p3", "Fort Worth"), 1.5)} />
        <Bar x={0} y={400} w={1300} frac={1} label="design life" value="25 yrs" color={C.faint} show={ramp(now, at("p3", "Sioux City") + 1, 1.5)} dashed />
      </div>
      <Stat x={260} y={330} value="~$7B" label="loss from retiring LCS early (Defense News, from CBO data)" show={loss * (1 - plan)} color={C.amber} />
      <Stat x={1100} y={330} value="55" label="planned" show={plan} color={C.dim} />
      <Label x={360} y={260} w={1200} size={46} weight={700} color={C.ink} text="Built for yesterday's question while tomorrow's arrived" show={ramp(now, at("p3", "building for yesterday"), 1)} />
    </>
  );
};

/* ---------------- PART 4: FORD ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const ship = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("p4", "When Congress authorized"), 1));
  const tech = ramp(now, at("p4", "23 new or modified"), 1);
  const costs = ramp(now, at("p4", "When Congress authorized"), 1) * (1 - ramp(now, at("p4", "And it's not over"), 1));
  const sched = ramp(now, at("p4", "And it's not over"), 1);
  const names = ["EMALS catapult", "Advanced Arresting Gear", "Dual-band radar", "Advanced Weapons Elevators", "+19 more"];
  return (
    <>
      <Svg>
        <g opacity={ship}>
          <Hull kind="carrier" x={600} y={520} />
          {Array.from({ length: 23 }, (_, i) => (
            <circle key={i} cx={620 + i * 30} cy={490} r={9} fill={C.amber} opacity={tech * clamp((now - at("p4", "23 new or modified")) * 4 - i * 0.4)} />
          ))}
        </g>
      </Svg>
      <Label x={600} y={250} w={800} size={46} weight={700} color={C.ink} text="23 new technologies on one hull" show={tech * ship} />
      <div style={{ position: "absolute", left: 620, top: 700, opacity: ramp(now, at("p4", "Among them"), 1) * ship, fontFamily: FONT, fontSize: 30, color: C.dim, lineHeight: 1.6 }}>
        {names.map((n, i) => (
          <div key={n} style={{ opacity: ramp(now, at("p4", "Among them") + i * 1.2, 0.6) }}>{n}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: costs }}>
        <Bar x={0} y={0} w={1200} frac={10.5 / 14} label="CVN-78 Ford: estimate when authorized" value="$10.5B" color={C.steel} show={ramp(now, at("p4", "When Congress authorized"), 1.5)} />
        <Bar x={0} y={160} w={1200} frac={13.3 / 14} label="CVN-78 Ford: final procurement cost (CRS)" value="$13.3B" color={C.amber} show={ramp(now, at("p4", "final procurement cost"), 1.5)} />
        <Bar x={0} y={320} w={1200} frac={6.2 / 14} label="CVN-77 George H.W. Bush: last Nimitz" value="~$6.2B" color={C.teal} show={ramp(now, at("p4", "The last Nimitz-class"), 1.5)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 250, opacity: sched, fontFamily: FONT }}>
        {[
          ["CVN-79 Kennedy", "due July 2025", "→ March 2027 (GAO: maybe July 2027)", "Kennedy, was supposed"],
          ["CVN-80 Enterprise", "due 2029", "→ 2030", "The third ship"],
          ["CVN-81 Doris Miller", "", "~$15B", "The fourth"],
          ["Carriers in service", "11 required by law", "→ 10 for a stretch", "only ten carriers"],
        ].map(([a, b, c, k], i) => (
          <div key={i} style={{ display: "flex", gap: 30, marginBottom: 40, opacity: ramp(now, at("p4", k), 0.8), alignItems: "baseline" }}>
            <div style={{ width: 480, fontSize: 42, fontWeight: 700, color: C.ink }}>{a}</div>
            <div style={{ width: 380, fontSize: 34, color: C.dim }}>{b}</div>
            <div style={{ fontSize: 38, color: C.amber, fontWeight: 600 }}>{c}</div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ---------------- PART 4b: NIMITZ 11-14 ---------------- */
const FORDS = [
  { n: "Ford", y: "FY2008", f: 13.3, m: 7.5, k: "Gerald R. Ford, bought in 2008" },
  { n: "Kennedy", y: "FY2013", f: 13.2, m: 8.2, k: "John F. Kennedy, bought in 2013" },
  { n: "Enterprise", y: "FY2018", f: 14.2, m: 8.8, k: "Enterprise, bought in 2018" },
  { n: "Doris Miller", y: "FY2019", f: 15.2, m: 9.0, k: "Doris Miller, bought in 2019" },
];
export const P4b: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4b");
  const rows = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("p4b", "First, the Fords"), 1));
  const table = ramp(now, at("p4b", "First, the Fords"), 1) * (1 - ramp(now, at("p4b", "Now the caveats"), 1));
  const nim = ramp(now, at("p4b", "Raise the Bush price"), 1);
  const diff = ramp(now, at("p4b", "Against about $56 billion"), 1);
  const raw = ramp(now, at("p4b", "Four more of those at the same price"), 1) * (1 - ramp(now, at("p4b", "But that's not fair"), 1));
  const caveats = ramp(now, at("p4b", "Now the caveats"), 1) * (1 - ramp(now, at("p4b", "So call it twenty"), 1));
  const verdict = ramp(now, at("p4b", "So call it twenty"), 1);
  const scale = 60;
  return (
    <>
      <Svg>
        <g opacity={rows}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <Hull kind="carrier" x={140 + i * 430} y={330} scale={0.5} color={C.ghost} />
              <text x={320 + i * 430} y={300} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={C.dim}>Nimitz {11 + i}</text>
              <Hull kind="carrier" x={140 + i * 430} y={640} scale={0.5} color={C.steel} />
              <text x={320 + i * 430} y={610} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={C.ink}>{FORDS[i].n}</text>
            </g>
          ))}
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 160, top: 170, opacity: table, fontFamily: FONT }}>
        <div style={{ display: "flex", fontSize: 26, color: C.dim, marginBottom: 20 }}>
          <div style={{ width: 300 }}>Hull</div>
          <div style={{ width: 960 }}>Ford cost (then-year)   vs.   Nimitz at Bush price, inflated to that year</div>
          <div>Difference</div>
        </div>
        {FORDS.map((r, i) => {
          const fr = ramp(now, at("p4b", r.k), 1.2);
          return (
            <div key={r.n} style={{ display: "flex", alignItems: "center", height: 150, opacity: Math.max(fr, 0.15) }}>
              <div style={{ width: 300 }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: C.ink }}>{r.n}</div>
                <div style={{ fontSize: 24, color: C.dim }}>{r.y} · "Nimitz {11 + i}"</div>
              </div>
              <div style={{ width: 960, position: "relative", height: 110 }}>
                <div style={{ position: "absolute", top: 8, height: 40, width: r.f * scale * fr, background: C.amber }} />
                <div style={{ position: "absolute", top: 8, left: r.f * scale * fr + 14, fontSize: 30, fontWeight: 700, color: C.ink }}>${r.f}B</div>
                <div style={{ position: "absolute", top: 60, height: 40, width: r.m * scale * nim, background: C.teal }} />
                <div style={{ position: "absolute", top: 60, left: r.m * scale * nim + 14, fontSize: 30, color: C.ink, opacity: nim }}>~${r.m}B</div>
              </div>
              <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, opacity: diff }}>~${(r.f - r.m).toFixed(1)}B</div>
            </div>
          );
        })}
        <div style={{ display: "flex", marginTop: 10, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 300, color: C.dim }}>Four ships</div>
          <div style={{ width: 960, color: C.ink, opacity: ramp(now, at("p4b", "That's about $56 billion"), 1) }}>
            ~$56.0B <span style={{ color: C.teal, opacity: nim }}>  vs.  ~$33.4B</span>
          </div>
          <div style={{ color: C.amber, fontSize: 56, opacity: diff }}>~$22.5B</div>
        </div>
      </div>
      <Label x={160} y={930} w={1600} size={34} color={C.dim} text="Four Nimitz at the 2001 price: $24.8B, a gap of ~$31B. Not fair: a 2001 dollar isn't a 2019 dollar." show={raw} />
      <div style={{ position: "absolute", left: 220, top: 230, width: 1480, opacity: caveats, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, marginBottom: 30 }}>Caveats</div>
        {[
          ["Consumer inflation isn't shipbuilding inflation", "Consumer inflation isn't"],
          ["The Nimitz design dates to the 1960s", "The Nimitz design dates"],
          ["The Ford's 50-year case: sorties, power, smaller crews", "The Navy's case for the Ford"],
          ["What can't be paid back is the schedule", "What can't be paid back"],
        ].map(([t, k]) => (
          <div key={t} style={{ fontSize: 46, color: C.ink, fontWeight: 600, marginBottom: 34, opacity: ramp(now, at("p4b", k), 0.8) }}>— {t}</div>
        ))}
      </div>
      <Stat x={360} y={280} value="≈ $20B" label="the decision to put everything new on one class at once" show={verdict} color={C.amber} size={140} />
      <Label x={360} y={620} w={1300} size={40} color={C.ink} text="≈ 7 Flight III destroyers, or 4 Virginia-class submarines" show={ramp(now, at("p4b", "That's about seven Flight III"), 1)} />
    </>
  );
};

/* ---------------- PART 5: SEAWOLF / VIRGINIA ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const sub = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("p5", "In July 1990"), 1));
  const count = ramp(now, at("p5", "In July 1990"), 1) * (1 - ramp(now, at("p5", "So was the Seawolf waste"), 1));
  const gap = ramp(now, at("p5", "A 2026 analysis"), 1) * (1 - ramp(now, at("p5", "But follow the money"), 1));
  const rate = ramp(now, at("p5", "But follow the money"), 1) * (1 - ramp(now, at("p5", "So maybe the Seawolf"), 1));
  const years = ramp(now, at("p5", "It's years"), 1.5);
  let n = 29;
  if (now > at("p5", "The plan dropped to twelve")) n = 12;
  if (now > at("p5", "On January 29, 1992")) n = 1;
  if (now > at("p5", "restored a second boat")) n = 2;
  if (now > at("p5", "Later a third")) n = 3;
  const chartX = 300, chartY = 300, cw = 1300, ch = 420;
  const yy = (v: number) => chartY + ch - (v / 2.5) * ch;
  return (
    <>
      <Svg>
        <g opacity={sub}><Hull kind="sub" x={620} y={480} /></g>
        <g opacity={count}>
          {Array.from({ length: 29 }, (_, i) => (
            <Hull key={i} kind="sub" x={170 + (i % 6) * 270} y={270 + Math.floor(i / 6) * 120} scale={0.32} color={i < n ? (n <= 3 ? C.amber : C.steel) : C.ghost} />
          ))}
        </g>
        <g opacity={rate}>
          <line x1={chartX} y1={chartY + ch} x2={chartX + cw} y2={chartY + ch} stroke={C.faint} strokeWidth={2} />
          <line x1={chartX} y1={yy(2)} x2={chartX + cw} y2={yy(2)} stroke={C.amber} strokeWidth={4} strokeDasharray="14 10" />
          <text x={chartX + cw - 10} y={yy(2) - 16} textAnchor="end" fontFamily={FONT} fontSize={30} fill={C.amber}>ordered: 2 a year (FY2011–2024)</text>
          <rect x={chartX} y={yy(1.3)} width={cw * ramp(now, at("p5", "Since 2022"), 2)} height={yy(1.1) - yy(1.3)} fill={C.steel} />
          <text x={chartX + 20} y={yy(1.3) - 16} fontFamily={FONT} fontSize={30} fill={C.ink} opacity={ramp(now, at("p5", "Since 2022"), 1)}>delivered since 2022: ~1.1–1.3 a year</text>
          {[0, 1, 2].map((v) => (
            <text key={v} x={chartX - 20} y={yy(v) + 10} textAnchor="end" fontFamily={MONO} fontSize={26} fill={C.dim}>{v}</text>
          ))}
        </g>
      </Svg>
      <Stat x={170} y={140} value={`${n}`} label={n === 29 ? "Seawolf boats planned, ~$44B (GAO, 1990)" : n === 12 ? "plan, January 1991" : "Seawolf boats built"} show={count} color={n <= 3 ? C.amber : C.ink} size={80} />
      <div style={{ position: "absolute", left: 260, top: 330, opacity: gap, fontFamily: FONT }}>
        {[["Jan 1992", "Seawolf construction beyond the first boat stops"], ["Aug 1994", "Virginia-class design Phase I approved"]].map(([a, b]) => (
          <div key={a} style={{ display: "flex", gap: 40, marginBottom: 50 }}>
            <div style={{ width: 280, fontSize: 52, fontWeight: 700, color: C.amber }}>{a}</div>
            <div style={{ fontSize: 44, color: C.ink }}>{b}</div>
          </div>
        ))}
      </div>
      <Stat x={300} y={790} value="$2.7B → ~$5B" label="per Virginia, 2017 → now" show={ramp(now, at("p5", "now costs about $5 billion"), 1) * rate} size={56} />
      <Stat x={1100} y={790} value="2 a year by ~2032" label="CNO estimate, May 2026" show={ramp(now, at("p5", "In May 2026"), 1) * rate} size={56} color={C.teal} />
      <Label x={360} y={400} w={1200} size={110} weight={700} color={C.ink} text="It's years." show={years} />
    </>
  );
};

/* ---------------- PART 6: IOWA ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const s = sectionOf("p6");
  const bb = ramp(now, at("p6", "In 1981"), 1.5);
  const fire = now > at("p6", "In Desert Storm") && now < at("p6", "Then the Cold War ended");
  const cost = ramp(now, at("p6", "One recent account"), 1) * (1 - ramp(now, at("p6", "And there's the lineage"), 1));
  const lineage = ramp(now, at("p6", "And there's the lineage"), 1) * (1 - ramp(now, at("p6", "In Desert Storm"), 1));
  const lesson = ramp(now, at("p6", "use what you already own"), 1);
  const intro = ramp(now, s.start + 0.3, 1) * (1 - bb);
  const flash = fire ? 0.5 + 0.5 * Math.sin(now * 9) : 0;
  return (
    <>
      <Svg>
        <g opacity={bb * (1 - lesson * 0.75)}>
          <Hull kind="battleship" x={590} y={560} color={C.steel} />
          {[110, 190, 520].map((gx) => (
            <circle key={gx} cx={590 + gx + (gx < 400 ? -40 : 100)} cy={600} r={28} fill={C.amber} opacity={flash * 0.8} />
          ))}
        </g>
      </Svg>
      <Label x={400} y={420} w={1200} size={52} weight={700} color={C.ink} text="The one they got right" show={intro} />
      <Stat x={220} y={180} value="~$1.7B" label="all four battleships back to sea in the 1980s (critics: >$2B)" show={cost} color={C.teal} />
      <Stat x={1080} y={180} value="≈ 1 frigate" label="the Navy's comparison: each reactivation cost about as much as a Perry-class frigate" show={ramp(now, at("p6", "Either way"), 1) * cost} />
      <div style={{ position: "absolute", left: 220, top: 180, opacity: lineage, fontFamily: FONT, display: "flex", gap: 120 }}>
        <Stat x={0} y={0} value="$21.5M" label="New Jersey back for Vietnam, 1968" show={1} />
        <Stat x={560} y={0} value="5,688" label="16-inch shells in about 120 days" show={ramp(now, at("p6", "5,688"), 1)} />
        <Stat x={1100} y={0} value="~$100M" label="cost to build each, 1940s" show={ramp(now, at("p6", "to build in the 1940s"), 1)} />
      </div>
      <Label x={220} y={170} w={900} size={40} color={C.amber} text="1991: Missouri and Wisconsin fire Tomahawks and 16-inch guns" show={fire ? 1 : 0} />
      <div style={{ position: "absolute", left: 300, top: 300, opacity: lesson, fontFamily: FONT, fontSize: 58, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>
        {["Use what you already own.", "Modify it modestly.", "Get it to sea fast and cheap.", "Retire it when the job is done."].map((t, i) => (
          <div key={t} style={{ opacity: ramp(now, at("p6", "use what you already own") + i * 1.2, 0.8) }}>{t}</div>
        ))}
      </div>
    </>
  );
};

/* ---------------- PART 7: LEDGER ---------------- */
const LEDGER = [
  ["Zumwalt class, 3 ships, R&D included (GAO 2018)", "~$24.5B", "The Zumwalt class"],
  ["Zumwalt hypersonic refit, 3 ships (GAO 2026)", "≥ $2B", "The hypersonic refit"],
  ["Ford premium: Fords 1–4 vs. \"Nimitz 11–14\"", "~$22.5B", "The Ford premium"],
  ["LCS early decommissioning (Defense News / CBO)", "~$7B", "And the Littoral"],
];
export const P7: React.FC<P> = ({ now }) => {
  const s = sectionOf("p7");
  const table = ramp(now, at("p7", "Four lines"), 1) * (1 - ramp(now, at("p7", "At the FY2026"), 1));
  const old = ramp(now, at("p7", "earlier notes added up"), 1) * (1 - ramp(now, at("p7", "Four lines"), 0.8));
  const ghosts = ramp(now, at("p7", "At the FY2026"), 1) * (1 - ramp(now, at("p7", "Now the honest caveats"), 1.5));
  const dissolve = ramp(now, at("p7", "it's around eleven submarines") + 2.5, 2.5);
  const cav = ramp(now, at("p7", "Now the honest caveats"), 1);
  const yard = ramp(now, at("p7", "The shipyards are the bottleneck"), 1);
  return (
    <>
      <Svg>
        <g opacity={ghosts * (1 - dissolve)}>
          {Array.from({ length: 20 }, (_, i) => (
            <Hull key={i} kind="destroyer" x={110 + (i % 5) * 340} y={180 + Math.floor(i / 5) * 95} scale={0.42} color={C.ghost} guns={1} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i} opacity={ramp(now, at("p7", "it's around eleven"), 1)}>
              <Hull kind="sub" x={110 + (i % 6) * 290} y={610 + Math.floor(i / 6) * 90} scale={0.36} color={C.ghost} />
            </g>
          ))}
        </g>
      </Svg>
      <Stat x={360} y={330} value="~$76B" label="the author's earlier figure, revised" show={old} color={C.dim} />
      <div style={{ position: "absolute", left: 200, top: 210, width: 1520, opacity: table, fontFamily: FONT }}>
        {LEDGER.map(([a, b, k]) => (
          <div key={a} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.faint}`, padding: "26px 0", opacity: ramp(now, at("p7", "Four lines") + 1, 0.1) * 0 + (now > at("p7", "Four lines") ? 1 : 0) }}>
            <div style={{ fontSize: 40, color: C.ink }}>{a}</div>
            <div style={{ fontSize: 46, fontWeight: 700, color: C.amber }}>{b}</div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "30px 0" }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: C.dim }}>Total</div>
          <div style={{ fontSize: 72, fontWeight: 700, color: C.ink }}>~$56B</div>
        </div>
      </div>
      <Label x={110} y={100} size={40} weight={700} color={C.ink} w={1700} text={now > at("p7", "it's around eleven") ? "≈ 20 Flight III destroyers  ·  or ≈ 11 Virginia-class submarines" : "≈ 20 Flight III destroyers at ~$2.7B each"} show={ghosts * (1 - dissolve)} />
      <div style={{ position: "absolute", left: 220, top: 250, width: 1480, opacity: cav * (1 - yard), fontFamily: FONT }}>
        {[["Consumer inflation, not shipbuilding inflation: harsh", "The Ford premium uses"], ["Leaves out Constellation, Seawolf, and the years: generous", "The ledger leaves out"], ["Money alone doesn't build ships", "And the deepest caveat"]].map(([t, k]) => (
          <div key={t} style={{ fontSize: 46, color: C.ink, fontWeight: 600, marginBottom: 40, opacity: ramp(now, at("p7", k), 0.8) }}>— {t}</div>
        ))}
      </div>
      <Label x={360} y={420} w={1200} size={96} weight={700} color={C.amber} text="The shipyards are the bottleneck." show={yard} />
    </>
  );
};

/* ---------------- PART 8: SHIPYARDS ---------------- */
export const P8: React.FC<P> = ({ now }) => {
  const s = sectionOf("p8");
  const cap = ramp(now, s.start + 0.5, 1) * (1 - ramp(now, at("p8", "The same slide showed"), 1));
  const lines = ramp(now, at("p8", "The same slide showed"), 1) * (1 - ramp(now, at("p8", "The Navy's own counter"), 1));
  const burke = ramp(now, at("p8", "Every Arleigh Burke"), 1) * (1 - ramp(now, at("p8", "There's an older piece"), 1));
  const supper = ramp(now, at("p8", "There's an older piece"), 1);
  const q = ramp(now, at("p8", "The Navy's own counter"), 1) * (1 - burke);
  const x0 = 260, y0 = 260, cw = 1400, ch = 520;
  const X = (yr: number) => x0 + ((yr - 2020) / 15) * cw;
  const Y = (v: number) => y0 + ch - ((v - 250) / 250) * ch;
  const grow = ramp(now, at("p8", "By 2035 it projected"), 2.5);
  return (
    <>
      <Svg>
        <g opacity={lines}>
          <line x1={x0} y1={y0 + ch} x2={x0 + cw} y2={y0 + ch} stroke={C.faint} strokeWidth={2} />
          {[2020, 2025, 2030, 2035].map((y) => (
            <text key={y} x={X(y)} y={y0 + ch + 44} textAnchor="middle" fontFamily={MONO} fontSize={26} fill={C.dim}>{y}</text>
          ))}
          <line x1={X(2020)} y1={Y(355)} x2={X(2020 + 15 * grow)} y2={Y(355 + 120 * grow)} stroke={C.red} strokeWidth={6} />
          <line x1={X(2020)} y1={Y(296)} x2={X(2020 + 15 * grow)} y2={Y(296 + 15 * grow)} stroke={C.steel} strokeWidth={6} />
          <text x={X(2020) - 14} y={Y(355) + 10} textAnchor="end" fontFamily={FONT} fontSize={30} fill={C.red}>PLAN 355</text>
          <text x={X(2020) - 14} y={Y(296) + 10} textAnchor="end" fontFamily={FONT} fontSize={30} fill={C.steel}>USN 296</text>
          <text x={X(2035) + 14} y={Y(475) + 10} fontFamily={FONT} fontSize={30} fill={C.red} opacity={grow}>475</text>
          <text x={X(2035) + 14} y={Y(311) + 10} fontFamily={FONT} fontSize={30} fill={C.steel} opacity={grow}>305–317</text>
          <text x={x0} y={y0 - 40} fontFamily={FONT} fontSize={30} fill={C.dim}>Battle force ships, ONI slide (2023)</text>
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 260, top: 260, opacity: cap }}>
        <Bar x={0} y={0} w={1400} frac={1} label="China shipbuilding capacity" value="~23.2M tons" color={C.red} show={ramp(now, at("p8", "23.2 million tons"), 2)} h={70} />
        <Bar x={0} y={200} w={1400} frac={0.0043} label="United States" value="< 0.1M tons" color={C.steel} show={ramp(now, at("p8", "23.2 million tons") + 1, 1)} h={70} />
        <Stat x={0} y={400} value="> 200×" label="ONI slide, 2023 (includes China's commercial yards)" show={ramp(now, at("p8", "two hundred times"), 1)} color={C.amber} />
      </div>
      <Stat x={300} y={330} value="Quality" label="Virginia, carrier aviation, logistics, allies" show={q} />
      <div style={{ position: "absolute", left: 300, top: 300, opacity: burke }}>
        <Stat x={0} y={0} value="1991" label="first Arleigh Burke joins the fleet. Still in production." show={1} />
        <Stat x={700} y={0} value="1" label="Flight III in the FY2027 request (~$3.3B), after two a year" show={ramp(now, at("p8", "FY2027"), 1)} color={C.amber} />
      </div>
      <Stat x={300} y={330} value="1993" label={`The "Last Supper": defense contractors told to consolidate. Dozens became a handful.`} show={supper} />
    </>
  );
};

/* ---------------- PART 9: WHO PAYS ---------------- */
export const P9: React.FC<P> = ({ now }) => {
  const s = sectionOf("p9");
  const stack = ramp(now, at("p9", "Go looking"), 1) * (1 - ramp(now, at("p9", "There's a real argument"), 1));
  const rot = ramp(now, at("p9", "There's a real argument"), 1) * (1 - ramp(now, at("p9", "In World War II"), 1));
  const ww2 = ramp(now, at("p9", "In World War II"), 1);
  const q = ramp(now, s.start + 0.3, 1) * (1 - stack) * (1 - rot) * (1 - ww2);
  const reports = ["GAO-08-804 · Zumwalt cost likely to exceed budget", "GAO · Ford technologies immature", "GAO · Weapon Systems Annual Assessment", "GAO · Navy shipbuilding review", "GAO · Conventional Prompt Strike"];
  return (
    <>
      <Label x={360} y={440} w={1200} size={64} weight={700} color={C.ink} text="Who is responsible?" show={q} />
      <div style={{ position: "absolute", left: 560, top: 220, opacity: stack }}>
        {reports.map((r, i) => (
          <div key={r} style={{ position: "absolute", left: i * 26, top: i * 90, width: 760, height: 120, background: "#e9e4d8", border: "1px solid #b8b2a3", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", padding: "18px 26px", fontFamily: FONT, fontSize: 26, color: "#2a2a2a", opacity: ramp(now, at("p9", "Go looking") + i * 1.2, 0.8) }}>
            {r}
          </div>
        ))}
      </div>
      <Svg>
        <g opacity={rot}>
          {Array.from({ length: 12 }, (_, i) => {
            const x = 300 + i * 115;
            return (
              <g key={i}>
                <circle cx={x} cy={520} r={30} fill={i % 2 ? C.steel : C.teal} opacity={clamp(1 - Math.abs(((now - at("p9", "There's a real argument")) * 0.8) % 12 - i) / 3)} />
                <line x1={x} y1={560} x2={x} y2={600} stroke={C.faint} strokeWidth={3} />
              </g>
            );
          })}
          <line x1={300} y1={600} x2={1565} y2={600} stroke={C.faint} strokeWidth={3} />
          <text x={300} y={660} fontFamily={FONT} fontSize={28} fill={C.dim}>program start</text>
          <text x={1565} y={660} textAnchor="end" fontFamily={FONT} fontSize={28} fill={C.dim}>consequences</text>
          <text x={932} y={420} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={C.ink}>a new decision-maker every two or three years</text>
        </g>
      </Svg>
      <Label x={360} y={400} w={1200} size={64} weight={700} color={C.ink} text="Liberty ships. Fletcher-class destroyers." show={ww2} />
      <Label x={360} y={520} w={1200} size={48} color={C.dim} text="Somewhere between then and now, it forgot." show={ramp(now, at("p9", "Somewhere between then"), 1)} />
    </>
  );
};

/* ---------------- PART 10: ROME ---------------- */
export const P10: React.FC<P> = ({ now }) => {
  const s = sectionOf("p10");
  const ship = ramp(now, at("p10", "In 212 BC"), 1.5) * (1 - ramp(now, at("p10", "It's a vivid story"), 1));
  const sink = ramp(now, at("p10", "sank them at sea"), 5);
  const caption = ramp(now, at("p10", "In 212 BC"), 1) * (1 - ramp(now, at("p10", "It's a vivid story"), 1));
  const shape = ramp(now, at("p10", "But the shape of the Postumius"), 1) * (1 - ramp(now, at("p10", "The difference"), 1));
  const diff = ramp(now, at("p10", "The difference"), 1);
  const mid = ramp(now, at("p10", "It's a vivid story"), 1) * (1 - shape) * (1 - diff);
  return (
    <>
      <Svg>
        <rect x={0} y={700} width={W} height={380} fill="#0d1a24" opacity={ship} />
        <g opacity={ship}>
          <Hull kind="galley" x={720} y={620} color="#9a8a6e" sink={sink} />
        </g>
      </Svg>
      <Label x={160} y={150} w={1400} size={40} color={C.dim} text="212 BC · Second Punic War · Livy, History of Rome, Book 25" show={caption} />
      <Label x={160} y={210} w={1400} size={52} weight={700} color={C.ink} text="Marcus Postumius of Pyrgi" show={ramp(now, at("p10", "One of them, Marcus"), 1) * caption} />
      <div style={{ position: "absolute", left: 300, top: 300, opacity: shape, fontFamily: FONT, fontSize: 60, fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>
        {[["A state in a hurry.", "A state in a hurry"], ["Contractors who knew the rules better than the state.", "Contractors who understood"], ["Losses paid, ships or no ships.", "Losses paid for"]].map(([t, k]) => (
          <div key={t} style={{ opacity: ramp(now, at("p10", k), 0.8) }}>{t}</div>
        ))}
      </div>
      <Label x={300} y={340} w={1300} size={64} weight={700} color={C.ink} text="Rome didn't fall because of insurance fraud. It won that war." show={mid} />
      <div style={{ position: "absolute", left: 300, top: 560, opacity: mid * ramp(now, at("p10", "Historians argue"), 1), fontFamily: FONT, fontSize: 40, color: C.dim, lineHeight: 1.5 }}>
        <div>Gibbon: a loss of civic virtue.</div>
        <div style={{ opacity: ramp(now, at("p10", "Others point to plague"), 1) }}>Others: plague, money, the frontier, politics.</div>
      </div>
      <Label x={300} y={380} w={1300} size={64} weight={700} color={C.ink} text="Postumius was a crook. The Zumwalt wasn't fraud." show={diff} />
      <Label x={300} y={540} w={1300} size={44} color={C.dim} text="Ambition, optimism, and nobody holding the whole thread." show={ramp(now, at("p10", "They were ambition"), 1)} />
    </>
  );
};

/* ---------------- PART 11: COUNTER-THREAD ---------------- */
export const P11: React.FC<P> = ({ now }) => {
  const s = sectionOf("p11");
  const list = ramp(now, at("p11", "Look at the last couple"), 1) * (1 - ramp(now, at("p11", "The golden era and the wasted"), 1));
  const both = ramp(now, at("p11", "The golden era and the wasted"), 1) * (1 - ramp(now, at("p11", "Dollars can be re-appropriated"), 1));
  const years = ramp(now, at("p11", "Dollars can be re-appropriated"), 1) * (1 - ramp(now, at("p11", "The author's notes had"), 1));
  const end = ramp(now, at("p11", "The episode doesn't know"), 1.5);
  const items = [
    ["Constellation cancelled fast", "The Constellation was cancelled fast"],
    ["FF(X) starts from a hull in production", "Its replacement starts"],
    ["Billions into the submarine industrial base", "Congress has put billions"],
    ["Virginia class ramping, slowly", "The Virginia class is ramping"],
    ["Zumwalts about to carry CPS", "The Zumwalts, for all"],
    ["B-21 flying on a fixed-price deal (Episode 1)", "And in Episode 1"],
  ];
  return (
    <>
      <Svg>
        <g opacity={ramp(now, s.start + 0.3, 1) * (1 - list) * (1 - both) * (1 - years) * (1 - end)}>
          <Hull kind="destroyer" x={300} y={500} scale={0.6} guns={1} />
          <Hull kind="sub" x={760} y={510} scale={0.6} />
          <path d="M1300,560 L1450,480 L1600,560 L1560,560 L1450,520 L1340,560 Z" fill={C.steel} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 260, top: 220, opacity: list, fontFamily: FONT }}>
        {items.map(([t, k]) => (
          <div key={t} style={{ fontSize: 46, color: C.ink, fontWeight: 600, marginBottom: 30, opacity: ramp(now, at("p11", k), 0.8) }}>
            <span style={{ color: C.teal }}>+ </span>{t}
          </div>
        ))}
      </div>
      <Label x={300} y={400} w={1400} size={68} weight={700} color={C.ink} text="The golden era and the wasted years have been happening at the same time." show={both} />
      <div style={{ position: "absolute", left: 300, top: 300, opacity: years, fontFamily: FONT, fontSize: 58, fontWeight: 700, color: C.ink, lineHeight: 1.45 }}>
        {[["Dollars can be re-appropriated.", "Dollars can be"], ["A shipyard workforce takes a generation.", "A shipyard workforce"], ["China's yards are busy every day.", "China's yards"]].map(([t, k], i) => (
          <div key={t} style={{ color: i === 0 ? C.dim : C.ink, opacity: ramp(now, at("p11", k), 0.8) }}>{t}</div>
        ))}
      </div>
      <Label x={360} y={440} w={1200} size={84} weight={700} color={C.ink} text="The episode doesn't know which." show={end} />
    </>
  );
};

/* ---------------- OPEN THREAD / END ---------------- */
export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  const a = ramp(now, s.start, 1);
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: the shipyards, and the people in them." show={a} />;
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
