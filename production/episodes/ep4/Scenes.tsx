import React from "react";
import { C, FONT, W, H, at, ramp, sectionOf, clamp } from "./theme";
import { Label } from "./parts";
import { EP } from "./episode";

type P = { now: number };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

/* ---------- icons (generic, schematic) ---------- */
const Rifle: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
    <rect x={-380} y={-10} width={520} height={14} rx={4} fill={C.steel} />
    <path d="M100,-14 L260,-18 L330,10 L380,60 L340,70 L280,24 L120,22 Z" fill="#7a5a3a" />
    <rect x={-60} y={-24} width={150} height={20} rx={4} fill={C.dim} />
    <rect x={40} y={8} width={34} height={36} rx={6} fill={C.dim} />
  </g>
);
const PaperRoll: React.FC<{ x: number; y: number; now: number; o?: number }> = ({ x, y, now, o = 1 }) => {
  const off = (now * 40) % 60;
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <rect x={-300} y={-90} width={600} height={180} fill="#d8cfb8" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={-300 + ((i * 53 + off * 3) % 600)} y={-80 + ((i * 37) % 160)} width={10} height={6} fill={C.bg} />
      ))}
      <circle cx={-320} cy={0} r={95} fill="none" stroke={C.dim} strokeWidth={10} />
      <circle cx={320} cy={0} r={95} fill="none" stroke={C.dim} strokeWidth={10} />
    </g>
  );
};
const Tubes: React.FC<{ x: number; y: number; n: number; o?: number }> = ({ x, y, n, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(${(i % 20) * 34},${Math.floor(i / 20) * 70})`}>
        <rect x={-10} y={-26} width={20} height={44} rx={10} fill="none" stroke={C.steel} strokeWidth={3} />
        <circle cx={0} cy={-6} r={4} fill={C.amber} opacity={0.7} />
      </g>
    ))}
  </g>
);
const EMChart: React.FC<{ x: number; y: number; o?: number; d?: number }> = ({ x, y, o = 1, d = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <line x1={0} y1={0} x2={600} y2={0} stroke={C.faint} strokeWidth={3} />
    <line x1={0} y1={0} x2={0} y2={-360} stroke={C.faint} strokeWidth={3} />
    <path d="M20,-40 Q200,-340 420,-260 T600,-60" fill="none" stroke={C.amber} strokeWidth={6} strokeDasharray="1200" strokeDashoffset={1200 * (1 - d)} />
    <path d="M20,-30 Q220,-260 430,-200 T600,-40" fill="none" stroke={C.steel} strokeWidth={5} strokeDasharray="1200" strokeDashoffset={1200 * (1 - d)} />
  </g>
);
const Sub: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <path d="M-360,0 Q-360,-50 -260,-50 L280,-50 Q380,-40 400,0 Q380,40 280,50 L-260,50 Q-360,50 -360,0 Z" fill={C.steel} />
    <rect x={-60} y={-120} width={110} height={74} rx={14} fill={C.steel} />
    <path d="M400,0 L450,-36 L450,36 Z" fill={C.dim} />
  </g>
);
const Blackbird: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <path d="M0,-260 L22,-150 L40,40 L170,150 L170,190 L40,170 L30,230 L-30,230 L-40,170 L-170,190 L-170,150 L-40,40 L-22,-150 Z" fill="#20262c" stroke={C.steel} strokeWidth={3} />
  </g>
);
const RouterBox: React.FC<{ x: number; y: number; now: number; o?: number }> = ({ x, y, now, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-220} y={-80} width={440} height={160} rx={10} fill="#1d4e89" stroke={C.steel} strokeWidth={3} />
    {Array.from({ length: 6 }, (_, i) => (
      <circle key={i} cx={-160 + i * 40} cy={40} r={8} fill={Math.floor(now * 3 + i) % 3 === 0 ? C.amber : C.faint} />
    ))}
    {[-1, 1].map((sd) => [-50, 0, 50].map((dy) => (
      <line key={`${sd}${dy}`} x1={sd * 220} y1={dy} x2={sd * 380} y2={dy * 2} stroke={C.steel} strokeWidth={4} />
    )))}
  </g>
);
const Gears: React.FC<{ x: number; y: number; now: number; o?: number }> = ({ x, y, now, o = 1 }) => {
  const g = (cx: number, cy: number, r: number, t: number, dir: number) => (
    <g transform={`translate(${cx},${cy}) rotate(${now * 20 * dir})`}>
      <circle r={r} fill="none" stroke="#6b8f71" strokeWidth={8} />
      {Array.from({ length: t }, (_, i) => (
        <rect key={i} x={-6} y={-r - 14} width={12} height={16} fill="#6b8f71" transform={`rotate(${(360 / t) * i})`} />
      ))}
    </g>
  );
  return <g transform={`translate(${x},${y})`} opacity={o}>{g(0, 0, 110, 24, 1)}{g(176, -40, 60, 14, -1.8)}{g(150, 110, 44, 10, -2.4)}</g>;
};
const Trireme: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <path d="M-300,0 L300,0 L360,-30 L330,30 L-280,30 Z" fill="#7a5a3a" />
    {Array.from({ length: 14 }, (_, i) => (
      <line key={i} x1={-240 + i * 36} y1={20} x2={-260 + i * 36} y2={80} stroke={C.dim} strokeWidth={4} />
    ))}
    <rect x={-6} y={-160} width={12} height={160} fill={C.dim} />
    <path d="M-120,-150 L120,-150 L100,-40 L-100,-40 Z" fill="#d8cfb8" />
  </g>
);
const Aqueduct: React.FC<{ x: number; y: number; o?: number }> = ({ x, y, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-360} y={-200} width={720} height={40} fill="#b9a98a" />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M${-360 + i * 120},-160 L${-360 + i * 120},120 L${-340 + i * 120},120 Q${-300 + i * 120},-80 ${-260 + i * 120},120 L${-240 + i * 120},120 L${-240 + i * 120},-160 Z`} fill="#b9a98a" />
    ))}
  </g>
);

/* ---------- portrait card ---------- */
const Card: React.FC<{ show: number; name: string; years: string; role: string; facts: [string, number][]; x?: number; y?: number; w?: number }> = ({ show, name, years, role, facts, x = 160, y = 200, w = 900 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: show, fontFamily: FONT }}>
    <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>{years}</div>
    <div style={{ fontSize: 80, fontWeight: 700, color: C.ink, lineHeight: 1.05, marginTop: 6 }}>{name}</div>
    <div style={{ fontSize: 34, color: C.amber, marginTop: 10 }}>{role}</div>
    <div style={{ marginTop: 34 }}>
      {facts.map(([t, s]) => (
        <div key={t} style={{ fontSize: 34, color: C.ink, marginBottom: 14, opacity: s }}>— {t}</div>
      ))}
    </div>
  </div>
);

const Stamp: React.FC<{ show: number; kind: string; line: string }> = ({ show, kind, line }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: show, fontFamily: FONT }}>
    <div style={{ display: "inline-block", padding: "18px 40px", border: `4px solid ${C.amber}`, transform: `rotate(-3deg) scale(${0.9 + 0.1 * show})` }}>
      <div style={{ fontSize: 30, color: C.dim, letterSpacing: 8 }}>THE KIND OF NOTHING</div>
      <div style={{ fontSize: 96, fontWeight: 700, color: C.amber, letterSpacing: 4 }}>{kind}</div>
    </div>
    <div style={{ fontSize: 40, color: C.ink, marginTop: 40 }}>{line}</div>
  </div>
);

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const rifle = ramp(now, s.start + 0.3, 2) * (1 - ramp(now, at("cold", "This episode is about people"), 1));
  const kinds = ramp(now, at("cold", "This episode is about people"), 1) * (1 - ramp(now, at("cold", "The question the episode"), 1));
  const q = ramp(now, at("cold", "The question the episode"), 1);
  const list: [string, string][] = [["no money", "One got no money"], ["no credit", "One got no credit"], ["ordered to destroy his work", "One was ordered to destroy"], ["never the rank", "One never got the rank"], ["every honor, and still shown the door", "One got every honor"], ["and the ones with no names at all", "And behind all of them"]];
  return (
    <>
      <Svg>
        <Rifle x={960} y={330} s={1.3} o={rifle} />
      </Svg>
      <div style={{ position: "absolute", left: 260, top: 520, opacity: rifle, fontFamily: FONT }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.ink, opacity: ramp(now, at("cold", "General George Patton"), 0.6) }}>"The greatest battle implement ever devised."</div>
        <div style={{ fontSize: 38, color: C.dim, marginTop: 10, opacity: ramp(now, at("cold", "General George Patton"), 0.6) }}>— George S. Patton</div>
        <div style={{ fontSize: 44, color: C.ink, marginTop: 36, opacity: ramp(now, at("cold", "More than six million"), 0.6) }}>More than six million made.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 14, opacity: ramp(now, at("cold", "He never received a royalty"), 0.6) }}>Royalties to the designer: none. A $100,000 bill in Congress: failed.</div>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 14, opacity: ramp(now, at("cold", "You'll sometimes hear"), 0.6) }}>The "$100" story is a myth. He got his salary, two medals, and his name on the rifle.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 220, opacity: kinds, fontFamily: FONT }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, opacity: ramp(now, at("cold", "They got different kinds"), 0.6) }}>Different kinds of nothing:</div>
        {list.map(([t, k], i) => (
          <div key={t} style={{ fontSize: 46, color: i === 5 ? C.amber : C.ink, marginTop: 18, opacity: ramp(now, at("cold", k), 0.5) }}>{t}</div>
        ))}
      </div>
      <Label x={300} y={400} w={1300} size={64} weight={700} color={C.ink} text="Does a civilization that forgets its Garands deserve its golden age?" show={q} />
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

/* helper: card fades in at section start, out at the stamp; stamp from stampCue */
const usePart = (now: number, sec: string, stampCue: string) => {
  const s = sectionOf(sec);
  const card = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at(sec, stampCue), 1));
  const stamp = ramp(now, at(sec, stampCue), 1);
  return { card, stamp };
};
const f = (now: number, sec: string, cue: string): number => ramp(now, at(sec, cue), 0.6);

/* ---------------- P1 GARAND ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const { card, stamp } = usePart(now, "p1", "So the \"nothing\" here");
  return (
    <>
      <Svg><Rifle x={1420} y={760} s={0.9} o={card} /></Svg>
      <Card show={card} years="1888 – 1974" name="John C. Garand" role="machinist, Springfield Armory · the M1 rifle" facts={[
        ["born in Quebec; textile mills in Connecticut; no engineering degree", f(now, "p1", "John Cantius Garand")],
        ["joined Springfield Armory, 1919", f(now, "p1", "He was a machinist and a tinkerer")],
        ["M1 standardized and in production, 1936", f(now, "p1", "before the rifle was standardized")],
        ["the only major power with a semi-automatic standard rifle in WWII", f(now, "p1", "When the Second World War came")],
        ["rights transferred to the government, January 1936", f(now, "p1", "Garand transferred his rights")],
        ["medals 1941 and 1944 · $100,000 bill failed", f(now, "p1", "He received the Medal")],
      ]} />
      <Stamp show={stamp} kind="NO SHARE" line="One of the century's most consequential inventions belonged to the country. So, in a sense, did he." />
    </>
  );
};

/* ---------------- P2 LAMARR ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const { card, stamp } = usePart(now, "p2", "Her \"nothing\" is credit");
  const wifi = ramp(now, at("p2", "Here the thread has to be careful"), 1) * (1 - ramp(now, at("p2", "Recognition came late"), 1));
  return (
    <>
      <Svg><PaperRoll x={1430} y={780} now={now} o={card * (1 - wifi)} /></Svg>
      <Card show={card * (1 - wifi)} years="1914 – 2000" name="Hedy Lamarr" role="with composer George Antheil · frequency hopping" facts={[
        ["born Hedwig Kiesler, Vienna", f(now, "p2", "Born Hedwig Kiesler")],
        ["torpedo guidance that hops frequencies in a secret pattern", f(now, "p2", "Together they worked out")],
        ["synchronized paper rolls · 88 frequencies, like a piano", f(now, "p2", "They used 88 frequencies")],
        ["U.S. Patent 2,292,387 · granted August 1942", f(now, "p2", "U.S. Patent 2,292,387")],
        ["Navy didn't use it · she sold war bonds", f(now, "p2", "The Navy didn't use it")],
        ["patent expired 1959 · frequency hopping at sea in 1962", f(now, "p2", "The patent ran its seventeen")],
      ]} />
      <div style={{ position: "absolute", left: 300, top: 300, opacity: wifi, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink }}>"She invented WiFi."</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.red, marginTop: 10, opacity: f(now, "p2", "She didn't") }}>She didn't.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 30, opacity: f(now, "p2", "Frequency hopping is one branch") }}>Frequency hopping → spread spectrum → decades of other engineers' work</div>
        <div style={{ fontSize: 40, color: C.amber, marginTop: 14, opacity: f(now, "p2", "What's fair to say") }}>Fair to say: her idea is in the lineage of the radios we carry.</div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 990, opacity: card * ramp(now, at("p2", "Recognition came late"), 0.8), fontFamily: FONT, fontSize: 36, color: C.amber }}>
        EFF Pioneer Award, 1997 · National Inventors Hall of Fame, 2014
      </div>
      <Stamp show={stamp} kind="CREDIT, LATE" line="Fifty years after the work." />
    </>
  );
};

/* ---------------- P3 FLOWERS ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const { card, stamp } = usePart(now, "p3", "His \"nothing\" is silence");
  const gone = ramp(now, at("p3", "Then the war ended"), 2);
  const n = Math.round(160 * (1 - 0.8 * gone));
  return (
    <>
      <Svg><Tubes x={1100} y={540} n={n} o={card * ramp(now, at("p3", "Flowers proposed a machine"), 1)} /></Svg>
      <Card show={card} years="1905 – 1998" name="Tommy Flowers" role="Post Office engineer · Colossus" facts={[
        ["son of a bricklayer, East End of London", f(now, "p3", "Tommy Flowers was the son")],
        ["~2,500 vacuum tubes, when experts expected failure", f(now, "p3", "Flowers proposed a machine")],
        ["built at Dollis Hill, partly with his own money", f(now, "p3", "He did, at the Post Office")],
        ["ten machines by war's end", f(now, "p3", "By the end of the war")],
        ["most dismantled; two kept in secret", f(now, "p3", "Most were dismantled")],
        ["£1,000 award, shared with his team · bank loan refused", f(now, "p3", "The government gave Flowers")],
      ]} w={860} />
      <Label x={1080} y={900} w={760} size={34} color={C.dim} text="He couldn't tell the bank he had already built ten." show={card * f(now, "p3", "He couldn't tell them")} />
      <Stamp show={stamp} kind="SILENCE" line="The law forbade him even to say what he had done." />
    </>
  );
};

/* ---------------- P4 BOYD ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const { card, stamp } = usePart(now, "p4", "His \"nothing\" is rank");
  return (
    <>
      <Svg><EMChart x={1150} y={860} o={card * f(now, "p4", "In the early 1960s")} d={ramp(now, at("p4", "In the early 1960s"), 4)} /></Svg>
      <Label x={1150} y={880} w={600} size={28} color={C.dim} text="energy-maneuverability, schematic" show={card * f(now, "p4", "In the early 1960s")} />
      <Card show={card} years="1927 – 1997" name="John Boyd" role="fighter pilot · theorist · 'Forty-Second Boyd'" facts={[
        ["40 seconds or $40: the bet he never paid", f(now, "p4", "As an instructor")],
        ["energy-maneuverability theory, with Thomas Christie", f(now, "p4", "In the early 1960s")],
        ["the 'Fighter Mafia' and the lightweight fighter → F-16", f(now, "p4", "With a small group")],
        ["the OODA loop: observe, orient, decide, act", f(now, "p4", "Later he generalized")],
        ["Marine Corps maneuver warfare", f(now, "p4", "The Marine Corps built")],
        ["retired a colonel", f(now, "p4", "He retired as a colonel")],
      ]} w={900} />
      <Label x={160} y={900} w={1000} size={40} weight={700} color={C.amber} text='"To be somebody or to do something."' show={card * f(now, "p4", "He told young officers")} />
      <Stamp show={stamp} kind="RANK" line="The institution used his ideas and never promoted the man." />
    </>
  );
};

/* ---------------- P5 RICKOVER ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const { card, stamp } = usePart(now, "p5", "So Rickover didn't get nothing");
  return (
    <>
      <Svg><Sub x={1380} y={820} o={card * f(now, "p5", "The Nautilus went to sea")} /></Svg>
      <Card show={card} years="1900 – 1986" name="Hyman Rickover" role="father of the nuclear Navy" facts={[
        ["born in a Polish town in the Russian Empire", f(now, "p5", "He was born in 1900")],
        ["pushed a reluctant Navy to nuclear power · Nautilus, 1955", f(now, "p5", "He went to the Naval Academy")],
        ["passed over twice; Congress kept him", f(now, "p5", "He was passed over")],
        ["two Congressional Gold Medals · Medal of Freedom", f(now, "p5", "He received two Congressional")],
        ["forced out by Navy Secretary Lehman, 1982, at 82", f(now, "p5", "But in 1981")],
        ["63 years on active duty, the U.S. record", f(now, "p5", "Rickover retired on January 31")],
      ]} w={1000} />
      <Stamp show={stamp} kind="AN ENDING" line="Almost everything, except a graceful end." />
    </>
  );
};

/* ---------------- P6 KELLY JOHNSON ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const { card, stamp } = usePart(now, "p6", "That's the quieter pattern");
  const many = ramp(now, at("p6", "For every Kelly Johnson"), 1.5);
  return (
    <>
      <Svg>
        <Blackbird x={1450} y={540} o={card * f(now, "p6", "His teams built the U-2")} />
        <g opacity={card * many}>
          {Array.from({ length: 120 }, (_, i) => (
            <circle key={i} cx={1180 + (i % 15) * 38} cy={760 + Math.floor(i / 15) * 34} r={11} fill={C.faint} />
          ))}
        </g>
      </Svg>
      <Card show={card} years="1910 – 1990" name={'Clarence "Kelly" Johnson'} role="Lockheed Skunk Works · the counterexample" facts={[
        ["U-2, built in months · SR-71, still holding speed records", f(now, "p6", "His teams built the U-2")],
        ["handshakes, small teams, fourteen rules", f(now, "p6", "He worked on handshakes")],
        ["Medal of Freedom · Lockheed vice president · his name is known", f(now, "p6", "He received the Presidential")],
        ["but the work was secret for years", f(now, "p6", "But the U-2 and the SR-71")],
        ["hundreds of engineers, machinists, test pilots: unnamed", f(now, "p6", "For every Kelly Johnson")],
      ]} w={1000} />
      <Stamp show={stamp} kind="THE TEAM" line="The name that survives is usually one name. The work was usually many hands." />
    </>
  );
};

/* ---------------- P7 YEAGER ---------------- */
export const P7: React.FC<P> = ({ now }) => {
  const { card, stamp } = usePart(now, "p7", "His \"nothing\" is the most modern");
  return (
    <>
      <Svg><RouterBox x={1400} y={760} now={now} o={card * f(now, "p7", "He wrote the software")} /></Svg>
      <Label x={1190} y={880} w={600} size={30} color={C.amber} text="Welcome to SU-Net" show={card * f(now, "p7", "In the early days, one customer")} />
      <Card show={card} years="STANFORD, 1980s" name="William Yeager" role="research engineer · Stanford's multiprotocol router" facts={[
        ["linking Stanford's incompatible networks", f(now, "p7", "In the early 1980s, Stanford")],
        ["the 'blue box' router software", f(now, "p7", "He wrote the software")],
        ["'the first software I used that never crashed'", f(now, "p7", "A computer scientist at Rutgers")],
        ["Bosack & Lerner found Cisco, December 1984", f(now, "p7", "Two Stanford staff members")],
        ["Stanford licenses the software to Cisco, 1987", f(now, "p7", "In 1987 it licensed")],
        ["the founders did real work, too", f(now, "p7", "The founders did real work")],
      ]} w={980} />
      <Stamp show={stamp} kind="A FOOTNOTE" line="The code went into a company worth billions. His name went into a footnote." />
    </>
  );
};

/* ---------------- P8 THE UNNAMED ---------------- */
export const P8: React.FC<P> = ({ now }) => {
  const ak = ramp(now, at("p8", "In 1901, sponge divers"), 1) * (1 - ramp(now, at("p8", "In 483 BC"), 1));
  const sal = ramp(now, at("p8", "In 483 BC"), 1) * (1 - ramp(now, at("p8", "In Rome, an aqueduct"), 1));
  const aq = ramp(now, at("p8", "In Rome, an aqueduct"), 1) * (1 - ramp(now, at("p8", "And then there's Archimedes"), 1));
  const ar = ramp(now, at("p8", "And then there's Archimedes"), 1);
  const intro = ramp(now, sectionOf("p8").start + 0.3, 1) * (1 - ak) * (1 - sal) * (1 - aq) * (1 - ar);
  const block = (show: number, a: string, b: string, c: string) => (
    <div style={{ position: "absolute", left: 200, top: 220, width: 760, opacity: show, fontFamily: FONT }}>
      <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>{a}</div>
      <div style={{ fontSize: 66, fontWeight: 700, color: C.ink, marginTop: 8 }}>{b}</div>
      <div style={{ fontSize: 38, color: C.amber, marginTop: 30 }}>{c}</div>
    </div>
  );
  return (
    <>
      <Label x={300} y={440} w={1300} size={60} weight={700} color={C.ink} text="Where even the footnote is gone." show={intro} />
      <Svg>
        <Gears x={1350} y={540} now={now} o={ak} />
        <Trireme x={1400} y={600} o={sal} />
        <Aqueduct x={1400} y={600} o={aq} />
      </Svg>
      {block(ak, "FOUND 1901 · MADE ~2ND–1ST CENTURY BC", "The Antikythera mechanism", "Sun, moon, eclipses. Nothing as complex for a thousand years. Builder: unknown.")}
      {block(sal, "483 BC · LAURION SILVER → 480 BC · SALAMIS", "The trireme fleet", "History remembers Themistocles. Not the shipwrights who built ~200 ships in three years.")}
      {block(aq, "19 BC · STILL FLOWING", "The Aqua Virgo", "It feeds the Trevi Fountain. The men who surveyed and dug it: unnamed.")}
      <div style={{ position: "absolute", left: 300, top: 260, opacity: ar, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 30, color: C.dim, letterSpacing: 4 }}>SYRACUSE · 212 BC</div>
        <div style={{ fontSize: 80, fontWeight: 700, color: C.ink, marginTop: 8 }}>Archimedes</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 24, opacity: f(now, "p8", "For two years his engineering") }}>His engineering helped hold off Rome for two years.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 14, opacity: f(now, "p8", "The famous line") }}>"Do not disturb my circles": legend. The accounts differ.</div>
        <div style={{ fontSize: 40, color: C.ink, marginTop: 14, opacity: f(now, "p8", "What they agree on") }}>Marcellus wanted him alive.</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber, marginTop: 30, opacity: f(now, "p8", "The soldier didn't know") }}>The soldier didn't know who he was.</div>
      </div>
    </>
  );
};

/* ---------------- CLOSE ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const roll = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("close", "One reading"), 1));
  const read = ramp(now, at("close", "One reading"), 1) * (1 - ramp(now, at("close", "Does a civilization"), 1));
  const end = ramp(now, at("close", "Does a civilization"), 1);
  const rows: [string, string, string][] = [
    ["Garand", "no share", "Garand got no share"], ["Lamarr", "credit, late", "Lamarr got her credit"], ["Flowers", "silence", "Flowers was forbidden"],
    ["Boyd", "rank", "Boyd never got"], ["Rickover", "an ending", "Rickover got every honor"], ["Johnson's team", "their names", "Kelly Johnson's name"],
    ["Yeager", "a footnote", "Yeager's code went"], ["the builders of antiquity", "everything", "And the people who built"],
  ];
  const names = ["Garand", "Lamarr", "Antheil", "Flowers", "Boyd", "Christie", "Rickover", "Johnson", "Yeager", "Archimedes"];
  return (
    <>
      <div style={{ position: "absolute", left: 360, top: 170, opacity: roll, fontFamily: FONT }}>
        {rows.map(([a, b, k]) => (
          <div key={a} style={{ display: "flex", gap: 40, alignItems: "baseline", marginBottom: 14, opacity: ramp(now, at("close", k), 0.5) }}>
            <div style={{ width: 600, fontSize: 52, fontWeight: 700, color: C.ink, textAlign: "right" }}>{a}</div>
            <div style={{ fontSize: 46, color: C.amber }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: read, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 50, color: C.ink }}>Institutions remember those who <span style={{ color: C.amber, fontWeight: 700 }}>command, found and announce</span>.</div>
        <div style={{ fontSize: 50, color: C.ink, marginTop: 30, opacity: f(now, "close", "They're much worse") }}>They forget those who <span style={{ color: C.amber, fontWeight: 700 }}>make</span>.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 40, opacity: f(now, "close", "A country that wants another") }}>A country that wants to build again needs people willing to do the making.</div>
      </div>
      <Label x={300} y={220} w={1300} size={56} weight={700} color={C.ink} text="Does a civilization that forgets its Garands deserve its golden age?" show={end * (1 - ramp(now, at("close", "But it knows their names"), 1))} />
      <Label x={300} y={420} w={1300} size={56} weight={700} color={C.dim} text="The episode doesn't know." show={end * f(now, "close", "The episode doesn't know") * (1 - ramp(now, at("close", "But it knows their names"), 1))} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: ramp(now, at("close", "But it knows their names"), 1.2), fontFamily: FONT }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber }}>But it knows their names now. Some of them.</div>
        <div style={{ marginTop: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "18px 48px", maxWidth: 1400, marginLeft: "auto", marginRight: "auto" }}>
          {names.map((n, i) => (
            <div key={n} style={{ fontSize: 40, color: C.ink, opacity: ramp(now, at("close", "But it knows their names") + 0.6 + i * 0.25, 0.5) }}>{n}</div>
          ))}
        </div>
      </div>
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: Don Carlos Faith, the Chosin Reservoir, 1950." show={ramp(now, s.start, 1)} />;
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
