import React from "react";
import { C, FONT, W, H, at, ramp, sectionOf, clamp } from "./theme";
import { Bar, Label, Quote, Stat } from "./parts";
import { EP } from "./episode";

type P = { now: number };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

const Tag: React.FC<{ x: number; y: number; text: string; show: number; color?: string }> = ({ x, y, text, show, color = C.amber }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: show, padding: "8px 16px", border: `2px solid ${color}`, color, fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: 2, background: "rgba(11,17,24,0.85)", whiteSpace: "nowrap" }}>
    {text}
  </div>
);

/** A block of stacked lines, each fading in at its own cue. */
const Lines: React.FC<{ x: number; y: number; w?: number; show: number; now: number; sec: string; size?: number; gap?: number; items: [string, string, string?][] }> = ({ x, y, w = 1400, show, now, sec, size = 46, gap = 18, items }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: show, fontFamily: FONT }}>
    {items.map(([t, k, col]) => (
      <div key={t} style={{ fontSize: size, fontWeight: 700, color: col || C.ink, marginBottom: gap, lineHeight: 1.25, opacity: ramp(now, at(sec, k), 0.6) }}>{t}</div>
    ))}
  </div>
);

/** Side view of a 737-class jet, nose left. ~1000 x 260 at s=1, origin at fuselage centre. */
const SideJet: React.FC<{ x: number; y: number; s?: number; opacity?: number; color?: string; pylons?: number; big?: number; small?: number; link?: number; stroke?: string }> = ({ x, y, s = 1, opacity = 1, color = C.steel, pylons = 0, big = 0, small = 0, link = 0, stroke }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <path d="M330,-40 L430,-200 L480,-200 L470,-40 Z" fill={color} />
    <path d="M-500,10 Q-500,-50 -430,-55 L440,-55 Q500,-50 500,-20 L500,10 Q480,55 400,55 L-420,55 Q-500,50 -500,10 Z" fill={color} stroke={stroke} strokeWidth={stroke ? 8 : 0} />
    <path d="M-470,-25 L-430,-38 L-400,-38 L-400,-22 Z" fill={C.bg} opacity={0.8} />
    <path d="M-120,40 L180,40 L220,70 L-90,70 Z" fill={C.faint} />
    <rect x={-150} y={70} width={150} height={56} rx={26} fill={C.dim} />
    {/* datalink antenna */}
    <g opacity={link}>
      <rect x={-60} y={-78} width={70} height={24} rx={10} fill={C.teal} />
      <path d="M-25,-90 q25,-40 50,0" fill="none" stroke={C.teal} strokeWidth={5} />
      <path d="M-45,-100 q45,-70 90,0" fill="none" stroke={C.teal} strokeWidth={5} opacity={0.6} />
    </g>
    {[40, 130, 220].map((px, i) => (
      <g key={i} opacity={pylons}>
        <rect x={px} y={70} width={12} height={70} fill={C.ink} />
        <g opacity={big}>
          <rect x={px - 60} y={140} width={130} height={22} rx={10} fill={C.amber} />
        </g>
        <g opacity={small}>
          {[0, 1].map((r) => (
            <rect key={r} x={px - 40} y={140 + r * 16} width={90} height={11} rx={5} fill={C.teal} />
          ))}
        </g>
      </g>
    ))}
  </g>
);

/** Top view of the jet, nose up. Wings can slide off (off 0..1) and come back as a new wing. */
const PlanJet: React.FC<{ x: number; y: number; s?: number; opacity?: number; off?: number; fresh?: number; stations?: number; tip?: number; box?: number }> = ({ x, y, s = 1, opacity = 1, off = 0, fresh = 0, stations = 0, tip = 0, box = 0 }) => {
  const wingCol = fresh > 0.5 ? C.teal : C.faint;
  const dx = off * 150;
  const wing = (side: number) => (
    <g transform={`translate(${side * dx},0) scale(${side},1)`} opacity={1 - off * 0.55}>
      <path d="M38,-40 L560,150 L560,190 L38,90 Z" fill={wingCol} stroke={C.steel} strokeWidth={2} />
      {/* engine */}
      <rect x={150} y={-10} width={46} height={110} rx={20} fill={C.dim} />
      {[250, 350, 450].map((px, i) => (
        <g key={i} opacity={stations}>
          <rect x={px - 9} y={px * 0.27 - 20} width={18} height={120} rx={8} fill={C.amber} />
        </g>
      ))}
      <g opacity={tip}>
        {[0, 1, 2, 3].map((r) => (
          <rect key={r} x={556 + r * 11} y={120} width={7} height={80} rx={3} fill={C.red} />
        ))}
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
      {wing(1)}
      {wing(-1)}
      <rect x={-38} y={-330} width={76} height={680} rx={38} fill={C.steel} />
      <path d="M-38,300 L-170,360 L-170,385 L-38,350 Z M38,300 L170,360 L170,385 L38,350 Z" fill={C.steel} />
      <rect x={-38} y={-45} width={76} height={140} fill="none" stroke={C.amber} strokeWidth={5} strokeDasharray="10 6" opacity={box} />
    </g>
  );
};

/* ---------------- schematic map ---------------- */
const MX0 = 70, MY0 = 104, K = 12.3, LON0 = 66, LAT0 = 46;
const px = (lon: number) => MX0 + (lon - LON0) * K;
const py = (lat: number) => MY0 + (LAT0 - lat) * K;
type Poly = [number, number][];
const LAND: Record<string, Poly[]> = {
  china: [[[75, 37], [80, 42], [87, 46], [131, 46], [131, 43], [124.5, 40], [121.5, 39], [122, 37.5], [119, 37.5], [120.5, 36], [119.5, 35], [121.8, 31.5], [122, 30], [120.5, 27.5], [119.5, 25.5], [117, 23.5], [114, 22.3], [110.5, 21.3], [108, 21.6], [106, 23], [102, 22], [98, 24], [97.5, 28], [92, 28], [88, 28], [81, 30.5], [78.5, 32.5], [76, 35]]],
  sea: [[[98, 24], [102, 22], [106, 23], [108, 21.6], [105.7, 19], [108, 16.5], [109.3, 12], [105, 9], [101, 12.5], [102.5, 6], [104.3, 2.5], [103.5, 1.5], [100.3, 6.5], [99, 10], [98.5, 16], [94.5, 16], [92.5, 21], [94, 24]], [[124.5, 40], [131, 43], [130, 42], [128.3, 38.6], [126.2, 37.9], [124.8, 38.2]], [[109.5, 1.5], [112, 1.2], [115.5, 2.5], [117.5, 4.2], [119, 5.2], [117, 7], [115, 5], [113, 3], [111, 1.7]]],
  india: [[[68.2, 23.5], [70, 21], [72.5, 21], [73, 16], [75, 12], [77.5, 8.2], [80, 10], [80.2, 15], [85, 19.5], [87, 21.5], [89, 22], [88.5, 26.5], [92, 26], [95, 28], [92, 28], [88, 27.5], [81, 30], [78.5, 32.5], [76, 34.5], [74, 34], [74.5, 31], [71, 28], [69.5, 24.5]]],
  korea: [[[126.2, 37.9], [126.3, 34.4], [128.8, 34.7], [129.5, 36], [129.2, 38.3], [128.3, 38.6]]],
  japan: [[[129.8, 33.5], [130.3, 31.2], [131.5, 31.3], [132, 33.5]], [[132.5, 34], [132.8, 32.9], [134.6, 33.7], [134.2, 34.3]], [[131, 34.3], [133, 35.5], [136, 36.5], [138.5, 38], [140, 40.5], [141.5, 41.3], [142, 39.5], [141, 37.5], [140.8, 35.7], [139.5, 35], [137, 34.6], [135.5, 33.5], [135, 34.6], [132.5, 34.2]], [[140, 42], [141.5, 45.3], [145, 43.5], [143.5, 42], [141, 41.5]], [[127.5, 26.6], [128.2, 26.6], [128, 26], [127.6, 26]]],
  taiwan: [[[121, 25.2], [121.9, 25], [121.5, 23], [120.8, 22], [120.2, 23], [120.6, 24.5]]],
  phil: [[[120.5, 18.5], [122.2, 18.4], [122, 16], [124, 13.8], [123.8, 12.8], [121.5, 13.7], [120.2, 14.5], [119.9, 16.3]], [[122, 11.5], [125.5, 12.2], [125.3, 10], [123, 9.5]], [[122, 7], [123.5, 8.5], [126.5, 9.5], [126.3, 6.3], [125.3, 5.6], [124, 6.8]], [[117.3, 8.5], [119.6, 11.3], [119.9, 11], [117.7, 8.3]]],
  indo: [[[95.3, 5.6], [98, 4], [103.5, -1], [106, -5.8], [104.5, -5.9], [101, -2.8], [97, 2.5]], [[105.2, -6.8], [108.5, -6.6], [111, -6.5], [114.5, -7.6], [114.3, -8.7], [108, -7.8], [105.3, -7.3]], [[109, 1.3], [112, 1], [115.5, 2.3], [117.5, 4], [118.9, 1], [117.5, -1], [116.5, -4], [114.5, -4], [111, -3], [110, -1.5], [109, 0]], [[119.5, -5.5], [119, -2.5], [120, 0.8], [125, 1.5], [123, 0.3], [121, -1], [123.3, -1], [122.5, -4.5], [120.5, -4]], [[131, -0.8], [134, -0.8], [137.5, -1.5], [141, -2.6], [141, -9], [138, -8.2], [135, -4.3], [132.5, -4], [131.5, -2]], [[115.2, -8.3], [119, -8.3], [123, -8.4], [124.5, -9.7], [119, -9.5], [115.2, -8.8]]],
  aus: [[[114, -22], [121, -19.5], [123.5, -17], [126, -14], [129.5, -15], [131, -12.3], [136.5, -12], [136, -15], [139.5, -17.5], [141.5, -13], [142.5, -10.8], [145.5, -15], [146.5, -19], [149, -22]]],
  sing: [[[103.5, 1.6], [104.1, 1.6], [104.1, 1.1], [103.5, 1.1]]],
};
const HOSTS = ["japan", "phil", "korea", "aus", "india", "sing", "indo", "taiwan"] as const;
const HOST_NAME: Record<string, [string, number, number]> = {
  japan: ["JAPAN", 143.5, 37], phil: ["PHILIPPINES", 127, 14.5], korea: ["SOUTH KOREA", 122.2, 33.2], aus: ["AUSTRALIA", 128, -19.5],
  india: ["INDIA", 75, 20.5], sing: ["SINGAPORE", 104.8, 3.2], indo: ["INDONESIA", 109, -10.6], taiwan: ["TAIWAN", 123, 22.6],
};
const COUNT: Record<string, number> = { japan: 70, phil: 44, korea: 20, aus: 40, india: 92, sing: 2, indo: 88, taiwan: 14 };
const inPoly = (p: Poly, x: number, y: number) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const area = (p: Poly) => Math.abs(p.reduce((a, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return a + x * y2 - x2 * y; }, 0)) / 2;
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
type Dot = { x: number; y: number; host: string; r: number; pick: boolean };
const DOTS: Dot[] = [];
for (const h of HOSTS) {
  const polys = LAND[h];
  const tot = polys.reduce((a, p) => a + area(p), 0);
  for (const p of polys) {
    const n = Math.max(1, Math.round((COUNT[h] * area(p)) / tot));
    const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    let made = 0, tries = 0;
    while (made < n && tries < 4000) {
      tries++;
      const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      if (inPoly(p, x, y)) { DOTS.push({ x: px(x), y: py(y), host: h, r: rnd(), pick: false }); made++; }
    }
  }
}
// about 20 of the dots are "loaded" in the shell-game picture
DOTS.forEach((d, i) => { d.pick = i % 19 === 5; });
const BASES: [number, number][] = [[127.8, 26.35], [141.4, 40.7], [139.35, 35.75], [132.2, 34.1], [127.03, 37.09], [126.6, 35.9], [144.9, 13.6]];
const path = (p: Poly) => "M" + p.map(([a, b]) => `${px(a).toFixed(0)},${py(b).toFixed(0)}`).join(" L") + " Z";

const MapView: React.FC<{ opacity: number; lit?: (h: string) => number; dots?: number; dim?: number; bases?: number; picks?: number; names?: number }> = ({ opacity, lit = () => 1, dots = 0, dim = 0, bases = 0, picks = 0, names = 1 }) => (
  <Svg>
    <g opacity={opacity}>
      {LAND.china.map((p, i) => <path key={"c" + i} d={path(p)} fill="rgba(200,85,61,0.16)" stroke={C.red} strokeWidth={2} />)}
      {LAND.sea.map((p, i) => <path key={"s" + i} d={path(p)} fill="rgba(255,255,255,0.04)" stroke={C.faint} strokeWidth={1.5} />)}
      <text x={px(104)} y={py(33)} fontFamily={FONT} fontSize={30} letterSpacing={8} fill={C.red} opacity={0.75} textAnchor="middle">CHINA</text>
      {HOSTS.map((h) => LAND[h].map((p, i) => (
        <path key={h + i} d={path(p)} fill={`rgba(127,147,168,${0.12 + 0.3 * lit(h)})`} stroke={C.steel} strokeWidth={1.5 + lit(h)} opacity={0.35 + 0.65 * lit(h)} />
      )))}
      {HOSTS.map((h) => (
        <text key={h} x={px(HOST_NAME[h][1])} y={py(HOST_NAME[h][2])} fontFamily={FONT} fontSize={21} fontWeight={700} letterSpacing={3} fill={C.ink} opacity={names * lit(h)} textAnchor="middle">{HOST_NAME[h][0]}</text>
      ))}
      {BASES.map(([a, b], i) => (
        <g key={i} opacity={bases}>
          <circle cx={px(a)} cy={py(b)} r={15} fill="none" stroke={C.red} strokeWidth={4} />
          <circle cx={px(a)} cy={py(b)} r={5} fill={C.red} />
        </g>
      ))}
      {DOTS.map((d, i) => {
        const on = clamp(dots * 1.6 - d.r * 0.6);
        const grey = clamp(dim * 1.5 - d.r * 0.5);
        const hot = d.pick ? picks : 0;
        return <circle key={i} cx={d.x} cy={d.y} r={4 + hot * 3} fill={hot > 0.5 ? C.amber : C.ink} opacity={on * (1 - 0.8 * grey) * (picks > 0 && !d.pick ? 1 - 0.55 * picks : 1)} />;
      })}
    </g>
  </Svg>
);
const MapNote: React.FC<{ show: number }> = ({ show }) => (
  <div style={{ position: "absolute", left: 80, top: 1030, opacity: show * 0.8, fontFamily: FONT, fontSize: 22, color: C.dim, letterSpacing: 2 }}>SCHEMATIC MAP · DOTS ARE NOT REAL AIRPORT LOCATIONS</div>
);
const RX = 1290; // right-hand text column beside the map

/* ---------------- COLD ---------------- */
export const Cold: React.FC<P> = ({ now }) => {
  const s = sectionOf("cold");
  const stand = ramp(now, s.start + 0.3, 1.5) * (1 - ramp(now, at("cold", "Episode 3d said"), 1));
  const recap = ramp(now, at("cold", "Episode 3d said"), 1) * (1 - ramp(now, at("cold", "3f ended by asking"), 1));
  const turn = ramp(now, at("cold", "3f ended by asking"), 1) * (1 - ramp(now, at("cold", "What if the missiles were cheap"), 1));
  const qs = ramp(now, at("cold", "What if the missiles were cheap"), 1) * (1 - ramp(now, at("cold", "That last one ends on a map"), 1));
  const map = ramp(now, at("cold", "That last one ends on a map"), 1);
  const look = ramp(now, at("cold", "On any morning"), 2);
  return (
    <>
      <Svg>
        {[0, 1, 2, 3, 4].map((i) => (
          <SideJet key={i} x={330 + i * 320} y={640 - (i % 2) * 30} s={0.28} opacity={stand * (i === 3 ? 1 : 0.55)} stroke={i === 3 && look > 0.5 ? C.amber : undefined} />
        ))}
        <line x1={120} y1={700} x2={1800} y2={700} stroke={C.faint} strokeWidth={3} opacity={stand} />
      </Svg>
      <div style={{ position: "absolute", left: 220, top: 200, opacity: stand }}>
        <Stat x={0} y={0} value="10,000+" label="737s built" show={1} size={130} />
      </div>
      <Label x={220} y={800} w={1400} size={44} color={C.dim} text="One at a remote stand. Nobody looks at it twice." show={stand * look} />
      <div style={{ position: "absolute", left: 300, top: 250, opacity: recap, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>Episode 3d: an old 737-800 from the desert</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 16 }}>~$2M bird → ~$10M arsenal jet</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 40, opacity: ramp(now, at("cold", "Episode 3f went into the hangar"), 0.8) }}>Episode 3f: pylons, not a weapons bay</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.red, marginTop: 16, opacity: ramp(now, at("cold", "Six long-range anti-ship missiles"), 0.8) }}>Six missiles: ~$19M</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 16, opacity: ramp(now, at("cold", "The magazine costs twice"), 0.8) }}>The magazine costs twice what the airplane does.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 330, opacity: turn, fontFamily: FONT }}>
        <div style={{ fontSize: 46, color: C.dim }}>3f ended on: who owns the drawings?</div>
        <div style={{ fontSize: 110, fontWeight: 700, color: C.amber, marginTop: 30, opacity: ramp(now, at("cold", "It kept turning over"), 0.8) }}>$19,000,000</div>
        <div style={{ fontSize: 46, color: C.ink, marginTop: 20, opacity: ramp(now, at("cold", "And from that one number"), 0.8) }}>One number. Four ideas.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 290, opacity: qs, fontFamily: FONT, fontSize: 54, fontWeight: 700, lineHeight: 1.6 }}>
        <div style={{ color: C.ink, opacity: ramp(now, at("cold", "What if the missiles were cheap"), 0.6) }}>What if the missiles were cheap?</div>
        <div style={{ color: C.ink, opacity: ramp(now, at("cold", "What if the airplane stayed dumb"), 0.6) }}>What if the airplane stayed dumb on purpose?</div>
        <div style={{ color: C.ink, opacity: ramp(now, at("cold", "What if the answer to the old wing"), 0.6) }}>What if the old wing got a new wing?</div>
        <div style={{ color: C.amber, opacity: ramp(now, at("cold", "And if this whole thing is a deterrent"), 0.6) }}>Where do they go on the day it matters?</div>
      </div>
      <MapView opacity={map * 0.9} dots={map * ramp(now, at("cold", "The map is where"), 3)} names={0} />
      <Label x={RX} y={420} w={560} size={56} weight={700} color={C.ink} text="It ends on a map." show={map} />
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

/* ---------------- P1: THE CHEAP MAGAZINE ---------------- */
export const P1: React.FC<P> = ({ now }) => {
  const s = sectionOf("p1");
  const price = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p1", "In July 2026"), 1));
  const three = ramp(now, at("p1", "In July 2026"), 1) * (1 - ramp(now, at("p1", "One detail matters"), 1));
  const forms = ramp(now, at("p1", "One detail matters"), 1) * (1 - ramp(now, at("p1", "And one comparison belongs"), 1));
  const cmp = ramp(now, at("p1", "And one comparison belongs"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: price }}>
        <Label x={0} y={0} w={1500} size={60} weight={700} color={C.ink} text="FAMM · Family of Affordable Mass Missiles" show={ramp(now, at("p1", "The program is called FAMM"), 0.8)} />
        <Bar x={0} y={170} w={1200} frac={1} label="JASSM, the standard air-launched cruise missile" value="$1.3M+" color={C.steel} show={ramp(now, at("p1", "A JASSM, the standard"), 1)} />
        <Bar x={0} y={330} w={1200} frac={218 / 1300} label="FAMM price target, per round" value="~$218,000" color={C.amber} show={ramp(now, at("p1", "The Air Force's price target"), 1)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 190, opacity: three, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4, marginBottom: 26 }}>JULY 2026 · THREE FRAMEWORK AGREEMENTS</div>
        {[["Anduril", "Barracuda-500", "Anduril, with a missile"], ["CoAspire", "RAACM", "CoAspire, with one"], ["Zone 5 Technologies", "AGM-188 Rusty Dagger", "And Zone 5"]].map(([a, b, k]) => (
          <div key={a} style={{ display: "flex", gap: 40, alignItems: "baseline", marginBottom: 18, opacity: ramp(now, at("p1", k), 0.6) }}>
            <div style={{ width: 560, fontSize: 52, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>{a}</div>
            <div style={{ fontSize: 40, color: C.amber }}>{b}</div>
          </div>
        ))}
        <div style={{ fontSize: 36, color: C.dim, marginTop: 6, opacity: ramp(now, at("p1", "None of the three"), 0.6) }}>None is one of the old prime contractors.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 640, opacity: three }}>
        <Stat x={0} y={0} value="8,000 / yr" label="goal across the three, once production ramps" show={ramp(now, at("p1", "The stated goal"), 0.8)} size={90} color={C.amber} />
        <Stat x={600} y={0} value="2027" label="first deliveries" show={ramp(now, at("p1", "The stated goal") + 4, 0.8)} size={90} />
        <Stat x={1000} y={0} value="10,000+" label="ground-launched sister program, in three years" show={ramp(now, at("p1", "There's a sister program"), 0.8)} size={90} />
      </div>
      <Svg>
        <SideJet x={1180} y={600} s={0.9} opacity={forms * ramp(now, at("p1", "A 737 has no rear ramp"), 1)} pylons={ramp(now, at("p1", "So the arsenal jet would carry"), 1)} small={ramp(now, at("p1", "So the arsenal jet would carry"), 1)} />
      </Svg>
      <div style={{ position: "absolute", left: 180, top: 200, opacity: forms, fontFamily: FONT }}>
        <div style={{ fontSize: 38, color: C.dim, marginBottom: 20 }}>FAMM comes in two forms</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: ramp(now, at("p1", "A 737 has no rear ramp"), 0.6) > 0.5 ? C.faint : C.ink, opacity: ramp(now, at("p1", "Palletized, which means"), 0.6), textDecoration: ramp(now, at("p1", "A 737 has no rear ramp"), 0.6) > 0.5 ? "line-through" : "none" }}>Palletized: out the back of a cargo plane</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.amber, marginTop: 14, opacity: ramp(now, at("p1", "And lugged, which means"), 0.6) }}>Lugged: hung from a pylon</div>
      </div>
      <Label x={180} y={880} w={1500} size={38} color={C.dim} text="Rusty Dagger: already flown on an F-16." show={forms * ramp(now, at("p1", "The Rusty Dagger has already"), 0.8)} />
      <div style={{ position: "absolute", left: 220, top: 260, opacity: cmp }}>
        <Stat x={0} y={0} value="14 months" label="ERAM: first contract to production of a new missile" show={ramp(now, at("p1", "Two of these missiles came"), 0.8)} size={120} color={C.amber} />
        <Stat x={820} y={0} value="5 years" label="LRASM onto the P-8, and not finished (3f)" show={ramp(now, at("p1", "3f noted that"), 0.8)} size={120} />
        <Label x={0} y={360} w={1500} size={56} weight={700} color={C.ink} text="Something has changed in how this is done." show={ramp(now, at("p1", "Something has changed"), 0.8)} />
      </div>
    </>
  );
};

/* ---------------- P2: WHAT CHEAP BUYS ---------------- */
export const P2: React.FC<P> = ({ now }) => {
  const s = sectionOf("p2");
  const inst = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p2", "Take the Barracuda-500"), 1));
  const spec = ramp(now, at("p2", "Take the Barracuda-500"), 1) * (1 - ramp(now, at("p2", "So the instinct is mostly right"), 1));
  const trick = ramp(now, at("p2", "So the instinct is mostly right"), 1) * (1 - ramp(now, at("p2", "So the fair version is this"), 1));
  const fair = ramp(now, at("p2", "So the fair version is this"), 1) * (1 - ramp(now, at("p2", "Now put that on the airplane"), 1));
  const load = ramp(now, at("p2", "Now put that on the airplane"), 1);
  const cut = ramp(now, at("p2", "The Barracuda carries a tenth"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: inst, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 40, color: C.dim }}>The author's instinct</div>
        <div style={{ fontSize: 62, fontWeight: 700, color: C.ink, marginTop: 20, opacity: ramp(now, at("p2", "The old missiles were boutique"), 0.8) }}>The old missiles were boutique items.</div>
        <div style={{ fontSize: 62, fontWeight: 700, color: C.amber, marginTop: 14, opacity: ramp(now, at("p2", "The new ones go farther"), 0.8) }}>The new ones go farther, weigh less, cost a fraction.</div>
        <div style={{ fontSize: 46, color: C.dim, marginTop: 40, opacity: ramp(now, at("p2", "How much of that holds up"), 0.8) }}>How much of that holds up?</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 210, opacity: spec }}>
        <Label x={0} y={0} w={1400} size={44} color={C.dim} text="Barracuda-500 (company figures)" show={1} />
        <Stat x={0} y={90} value="500+ nmi" label="range: JASSM-ER class" show={ramp(now, at("p2", "Anduril says it flies"), 0.8)} size={96} />
        <Stat x={620} y={90} value="100+ lb" label="payload" show={ramp(now, at("p2", "Anduril says it flies") + 2.5, 0.8)} size={96} />
        <Stat x={1120} y={90} value="500 kt" label="top speed" show={ramp(now, at("p2", "Anduril says it flies") + 5, 0.8)} size={96} />
        <Stat x={0} y={380} value="~500 lb ?" label="weight: not published. The name is said to be the weight class." show={ramp(now, at("p2", "Reference sources say"), 0.8)} size={96} color={C.amber} />
        <Stat x={820} y={380} value="2,000 lb" label="class: JASSM" show={ramp(now, at("p2", "A JASSM is a 2,000-pound"), 0.8)} size={96} />
        <Label x={0} y={660} w={1500} size={50} weight={700} color={C.ink} text="If that's right: the same reach, a quarter of the weight, a sixth of the price." show={ramp(now, at("p2", "If that's right"), 0.8)} />
      </div>
      <Svg>
        <g opacity={trick}>
          <rect x={300} y={330} width={1000} height={110} rx={50} fill={C.steel} />
          <rect x={420} y={345} width={420} height={80} rx={10} fill={C.red} opacity={ramp(now, at("p2", "A JASSM carries a warhead"), 0.8)} />
          <rect x={300} y={640} width={520} height={62} rx={30} fill={C.teal} opacity={cut} />
          <rect x={370} y={650} width={62} height={42} rx={6} fill={C.red} opacity={cut} />
        </g>
      </Svg>
      <Label x={300} y={250} w={900} size={36} color={C.dim} text="JASSM: ~1,000 lb warhead, stealthy airframe" show={trick * ramp(now, at("p2", "A JASSM carries a warhead"), 0.8)} />
      <Label x={300} y={560} w={900} size={36} color={C.dim} text="Barracuda-500: about a tenth of that" show={trick * cut} />
      <Label x={300} y={780} w={1400} size={50} weight={700} color={C.amber} text="A choice, not a breakthrough." show={trick * ramp(now, at("p2", "That's a choice"), 0.8)} />
      <Label x={300} y={860} w={1400} size={36} color={C.dim} text="LRASM can pick one ship out of a defended group. A 100 lb warhead won't sink it." show={trick * ramp(now, at("p2", "LRASM can pick one"), 0.8)} />
      <div style={{ position: "absolute", left: 300, top: 250, opacity: fair, fontFamily: FONT }}>
        <div style={{ fontSize: 58, fontWeight: 700, color: C.teal, opacity: ramp(now, at("p2", "The cheap missile wins"), 0.6) }}>Wins: reach · weight · price</div>
        <div style={{ fontSize: 58, fontWeight: 700, color: C.red, marginTop: 16, opacity: ramp(now, at("p2", "It loses on punch"), 0.6) }}>Loses: punch · arriving alone</div>
        <div style={{ fontSize: 58, fontWeight: 700, color: C.ink, marginTop: 16, opacity: ramp(now, at("p2", "It's built to arrive in a crowd"), 0.6) }}>Built to arrive in a crowd.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 50, opacity: ramp(now, at("p2", "Lockheed Martin is offering"), 0.6) }}>And the old companies have noticed: a Lockheed Martin glide weapon at $150,000.</div>
      </div>
      <Svg>
        <g opacity={load}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={240 + i * 130} y={330} width={100} height={26} rx={12} fill={C.amber} opacity={ramp(now, at("p2", "3f's plan was six"), 0.8)} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x={240 + Math.floor(i / 4) * 130} y={640 + (i % 4) * 22} width={100} height={14} rx={7} fill={C.teal} opacity={ramp(now, at("p2", "Six stations, four rounds each") + (i / 24) * 1.5, 0.5)} />
          ))}
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: load }}>
        <Label x={240} y={250} w={800} size={36} color={C.dim} text="3f: six LRASMs on six stations" show={ramp(now, at("p2", "3f's plan was six"), 0.8)} />
        <Stat x={1120} y={280} value="~$19M" label="" show={ramp(now, at("p2", "3f's plan was six"), 0.8)} size={100} color={C.amber} />
        <Label x={240} y={480} w={1500} size={36} color={C.dim} text="P-8 pylon: 3,000 lb. Four ~500 lb rounds fit by weight." show={ramp(now, at("p2", "A P-8 wing pylon"), 0.8)} />
        <Label x={240} y={560} w={800} size={36} color={C.dim} text="six stations × four rounds = 24" show={ramp(now, at("p2", "Six stations, four rounds each"), 0.8)} />
        <Stat x={1120} y={610} value="~$5.2M" label="" show={ramp(now, at("p2", "At the FAMM target price"), 0.8)} size={100} color={C.teal} />
        <Label x={240} y={790} w={1500} size={54} weight={700} color={C.ink} text="Four times the shots for about a quarter of the money." show={ramp(now, at("p2", "Four times the shots"), 0.8)} />
        <Label x={240} y={880} w={1500} size={38} color={C.amber} text="The load now costs less than the airplane carrying it." show={ramp(now, at("p2", "And for the first time"), 0.8)} />
      </div>
      <Tag x={240} y={960} text="NO FOUR-ROUND RACK FOUND. UNTIL ONE IS BUILT, 24 IS A HOPE." show={load * ramp(now, at("p2", "The thread hasn't found a rack"), 0.8)} color={C.red} />
    </>
  );
};

/* ---------------- P3: AN AIRLINER THAT SHOOTS AT AIRPLANES ---------------- */
export const P3: React.FC<P> = ({ now }) => {
  const s = sectionOf("p3");
  const idea = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p3", "The Air Force and Navy are bringing"), 1));
  const progs = ramp(now, at("p3", "The Air Force and Navy are bringing"), 1) * (1 - ramp(now, at("p3", "And then there's the one"), 1));
  const afl = ramp(now, at("p3", "And then there's the one"), 1) * (1 - ramp(now, at("p3", "The idea isn't new"), 1));
  const miss = ramp(now, at("p3", "The idea isn't new"), 1) * (1 - ramp(now, at("p3", "And the cheap end of air-to-air"), 1));
  const cheap = ramp(now, at("p3", "And the cheap end of air-to-air"), 1) * (1 - ramp(now, at("p3", "So the cruise-missile half"), 1));
  const sum = ramp(now, at("p3", "So the cruise-missile half"), 1);
  const geo = ramp(now, at("p3", "A thousand nautical miles is not"), 1);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 340, opacity: idea, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>One step further, and the strangest step</div>
        <div style={{ fontSize: 68, fontWeight: 700, color: C.ink, marginTop: 20, opacity: ramp(now, at("p3", "Put air-to-air missiles"), 0.8) }}>Air-to-air missiles on the truck.</div>
        <div style={{ fontSize: 68, fontWeight: 700, color: C.amber, marginTop: 10, opacity: ramp(now, at("p3", "Very long-range ones"), 0.8) }}>Very long-range ones.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 230, opacity: progs, fontFamily: FONT }}>
        {[["AIM-260", "due 2022 · framework deal Sept 2026 · numbers and price not disclosed", "The Air Force and Navy are bringing"], ["AIM-174B", "the Navy's air-launched version of a ship's missile · fielded", "The Navy has fielded"], ["AIM-424", "revealed August 2026 · in flight test", "The Navy has fielded"]].map(([a, b, k], i) => (
          <div key={a} style={{ marginBottom: 40, opacity: ramp(now, at("p3", k) + (i === 2 ? 5 : 0), 0.6) }}>
            <div style={{ fontSize: 80, fontWeight: 700, color: C.ink }}>{a}</div>
            <div style={{ fontSize: 34, color: C.dim }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 220, top: 190, opacity: afl, fontFamily: FONT }}>
        <div style={{ fontSize: 84, fontWeight: 700, color: C.ink }}>AFLRW</div>
        <div style={{ fontSize: 36, color: C.dim }}>Air Force Long Range Weapon</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, marginTop: 24, opacity: ramp(now, at("p3", "The reporting describes it"), 0.8) }}>Air-to-air first · 1,000+ nautical miles</div>
      </div>
      <Tag x={1180} y={210} text="CORRECTION TO EPISODE 2" show={afl * ramp(now, at("p3", "Since Episode 2"), 0.8)} color={C.red} />
      <Svg>
        <g opacity={afl * geo}>
          <line x1={260} y1={760} x2={1660} y2={760} stroke={C.faint} strokeWidth={3} strokeDasharray="14 10" />
          <SideJet x={330} y={740} s={0.22} pylons={1} small={1} />
          <circle cx={1220} cy={690} r={16} fill={C.teal} />
          <path d="M1220,690 L1640,760" stroke={C.teal} strokeWidth={3} strokeDasharray="8 8" />
          <path d="M1640,745 l22,15 l-22,15 l-22,-15 z" fill={C.red} />
          <rect x={460 + ramp(now, at("p3", "The launching airplane only"), 6) * 900} y={752} width={46} height={12} rx={6} fill={C.amber} />
        </g>
      </Svg>
      <Label x={250} y={830} w={400} size={30} color={C.dim} text="the truck: in the air, pointed the right way" show={afl * ramp(now, at("p3", "The launching airplane only"), 0.8)} />
      <Label x={1080} y={610} w={500} size={30} color={C.teal} text="something far forward finds the target and guides the shot" show={afl * ramp(now, at("p3", "Something far forward"), 0.8)} />
      <Label x={250} y={930} w={1400} size={50} weight={700} color={C.ink} text="That's a description of a truck." show={afl * ramp(now, at("p3", "That's a description of a truck"), 0.8)} />
      <div style={{ position: "absolute", left: 260, top: 230, opacity: miss, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 34, color: C.dim, letterSpacing: 4 }}>AROUND 1960 · U.S. NAVY</div>
        <div style={{ fontSize: 84, fontWeight: 700, color: C.ink, marginTop: 14 }}>F6D Missileer</div>
        <div style={{ fontSize: 42, color: C.dim, marginTop: 14, opacity: ramp(now, at("p3", "It was slow and straight-winged"), 0.6) }}>Slow, straight-winged. Orbit near the fleet with very long-range missiles.</div>
        <div style={{ fontSize: 54, fontWeight: 700, color: C.red, marginTop: 30, opacity: ramp(now, at("p3", "It was cancelled before"), 0.6) }}>Cancelled before it was built.</div>
        <div style={{ fontSize: 46, color: C.ink, marginTop: 20, opacity: ramp(now, at("p3", "Once its missiles were gone"), 0.6) }}>Once its missiles were gone, it couldn't fight and couldn't run.</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, marginTop: 20, opacity: ramp(now, at("p3", "It applies to a 737"), 0.6) }}>That applies to a 737 exactly.</div>
      </div>
      <Svg>
        <g opacity={cheap}>
          <rect x={320} y={470} width={620} height={46} rx={22} fill={C.steel} opacity={ramp(now, at("p3", "The Air Force has asked industry"), 0.8)} />
          <rect x={320} y={650} width={310} height={36} rx={18} fill={C.teal} opacity={ramp(now, at("p3", "The Air Force has asked industry") + 5, 0.8)} />
          <rect x={650} y={650} width={310} height={36} rx={18} fill={C.teal} opacity={ramp(now, at("p3", "The Air Force has asked industry") + 6, 0.8)} />
        </g>
      </Svg>
      <Label x={320} y={260} w={1300} size={44} color={C.dim} text="Air Force request to industry: a low-cost, high-speed air-to-air missile, in two sizes" show={cheap * ramp(now, at("p3", "The Air Force has asked industry"), 0.8)} />
      <Label x={980} y={470} w={700} size={36} color={C.ink} text="AMRAAM-sized, built for range" show={cheap * ramp(now, at("p3", "The Air Force has asked industry"), 0.8)} />
      <Label x={980} y={650} w={700} size={36} color={C.teal} text="half the size: carry twice as many" show={cheap * ramp(now, at("p3", "The Air Force has asked industry") + 5, 0.8)} />
      <Label x={320} y={800} w={1300} size={54} weight={700} color={C.amber} text="A request for information. Not a missile." show={cheap * ramp(now, at("p3", "It's a request for information"), 0.8)} />
      <div style={{ position: "absolute", left: 300, top: 340, opacity: sum, fontFamily: FONT }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.teal }}>Cruise missiles: real, and under contract.</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.amber, marginTop: 24, opacity: ramp(now, at("p3", "The air-to-air half is"), 0.8) }}>Air-to-air: for now, a good question.</div>
      </div>
    </>
  );
};

/* ---------------- P4: THE DUMB TRUCK ---------------- */
export const P4: React.FC<P> = ({ now }) => {
  const s = sectionOf("p4");
  const rule = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p4", "It's tempting to break"), 1));
  const tempt = ramp(now, at("p4", "It's tempting to break"), 1) * (1 - ramp(now, at("p4", "So the truck gets pylons"), 1));
  const truck = ramp(now, at("p4", "So the truck gets pylons"), 1) * (1 - ramp(now, at("p4", "A dumb truck is worth"), 1));
  const net = ramp(now, at("p4", "A dumb truck is worth"), 1) * (1 - ramp(now, at("p4", "There's one more thing"), 1));
  const crew = ramp(now, at("p4", "There's one more thing"), 1);
  const brk = ramp(now, at("p4", "If the drones forward are destroyed"), 1.5);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: rule, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>The author's rule</div>
        <div style={{ fontSize: 100, fontWeight: 700, color: C.ink, marginTop: 10, opacity: ramp(now, at("p4", "The airplane is a truck"), 0.6) }}>A truck.</div>
        <div style={{ fontSize: 100, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p4", "Always."), 0.6) }}>Always.</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.red, marginTop: 10, opacity: ramp(now, at("p4", "Never a sensor platform"), 0.6) }}>Never a sensor platform.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 220, opacity: tempt }}>
        <Label x={0} y={0} w={1500} size={44} color={C.dim} text="Two of the best sensor airplanes in the world are 737s: the P-8 and the E-7." show={ramp(now, at("p4", "Two of the best sensor"), 0.8)} />
        <Stat x={0} y={170} value="3×" label="the wiring · ~100 antennas · a crew of specialists (P-8, from 3f)" show={ramp(now, at("p4", "The P-8 carries three times"), 0.8)} size={110} />
        <Stat x={820} y={170} value="$173M" label="per P-8" show={ramp(now, at("p4", "It costs $173"), 0.8)} size={110} color={C.amber} />
        <Label x={0} y={500} w={1500} size={46} color={C.ink} text="Every sensor makes it more useful, and more precious." show={ramp(now, at("p4", "Every sensor you add"), 0.8)} />
        <Label x={0} y={580} w={1500} size={54} weight={700} color={C.red} text="Then it isn't a truck anymore." show={ramp(now, at("p4", "Then it isn't a truck"), 0.8)} />
      </div>
      <Svg>
        <SideJet x={960} y={380} s={0.95} opacity={truck} pylons={1} small={1} link={ramp(now, at("p4", "So the truck gets pylons") + 6, 1)} />
      </Svg>
      <div style={{ position: "absolute", left: 220, top: 660, opacity: truck, fontFamily: FONT, fontSize: 44, fontWeight: 700 }}>
        <span style={{ color: C.ink }}>pylons · wiring · a release · </span>
        <span style={{ color: C.teal, opacity: ramp(now, at("p4", "So the truck gets pylons") + 6, 0.8) }}>one smart thing: a datalink</span>
      </div>
      <Label x={220} y={760} w={1500} size={40} color={C.dim} text="A target comes in from somewhere else. The truck passes it to the missile and lets go." show={truck * ramp(now, at("p4", "A target comes in"), 0.8)} />
      <Label x={220} y={860} w={1500} size={44} weight={700} color={C.amber} text="That keeps the ten-million-dollar airplane honest." show={truck * ramp(now, at("p4", "That keeps the ten-million"), 0.8)} />
      <Svg>
        <g opacity={net} fontFamily={FONT}>
          {[["sensor", 330], ["link", 760], ["truck", 1190], ["missile", 1590]].map(([t, x], i) => (
            <g key={t as string} opacity={i === 0 || i === 1 ? 1 - 0.75 * brk : 1}>
              <rect x={(x as number) - 130} y={470} width={260} height={110} rx={10} fill="none" stroke={i < 2 ? C.teal : C.steel} strokeWidth={4} />
              <text x={x as number} y={540} fontSize={42} fontWeight={700} fill={C.ink} textAnchor="middle">{t}</text>
              {i < 3 ? <line x1={(x as number) + 135} y1={525} x2={(x as number) + 295} y2={525} stroke={C.faint} strokeWidth={4} /> : null}
            </g>
          ))}
          <g opacity={brk} stroke={C.red} strokeWidth={10}>
            <line x1={480} y1={450} x2={620} y2={600} />
            <line x1={620} y1={450} x2={480} y2={600} />
          </g>
        </g>
      </Svg>
      <Label x={220} y={250} w={1500} size={50} weight={700} color={C.ink} text="A dumb truck is worth exactly as much as the network that tells it where to shoot." show={net} />
      <Label x={220} y={680} w={1500} size={44} color={C.red} text="An airliner full of missiles with nothing to aim at." show={net * ramp(now, at("p4", "then what's left is an airliner"), 0.8)} />
      <Label x={220} y={780} w={1500} size={40} color={C.dim} text="Episode 11: the kill chain is the center of gravity. This plan leans its whole weight on it." show={net * ramp(now, at("p4", "Episode 11 said"), 0.8)} />
      <div style={{ position: "absolute", left: 300, top: 320, opacity: crew, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.ink, opacity: ramp(now, at("p4", "People who can drive it"), 0.8) }}>People who can drive it.</div>
        <div style={{ fontSize: 42, color: C.dim, marginTop: 24, opacity: ramp(now, at("p4", "The 737 is one of the two"), 0.8) }}>One of the two most common airliners on earth. The pilots already exist.</div>
        <div style={{ fontSize: 42, color: C.amber, marginTop: 24, opacity: ramp(now, at("p4", "Whether an airline pilot"), 0.8) }}>Whether an airline pilot would fly this mission is a human question.</div>
      </div>
    </>
  );
};

/* ---------------- P5: THE NEW WING ---------------- */
export const P5: React.FC<P> = ({ now }) => {
  const s = sectionOf("p5");
  const obj = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p5", "The author's answer is the bluntest"), 1));
  const swap = ramp(now, at("p5", "The author's answer is the bluntest"), 1) * (1 - ramp(now, at("p5", "And replacing the wings"), 1));
  const a10 = ramp(now, at("p5", "And replacing the wings"), 1) * (1 - ramp(now, at("p5", "So the new wing may cost"), 1));
  const cost = ramp(now, at("p5", "So the new wing may cost"), 1) * (1 - ramp(now, at("p5", "What the money buys"), 1));
  const buys = ramp(now, at("p5", "What the money buys"), 1) * (1 - ramp(now, at("p5", "Then the wingtip"), 1));
  const tip = ramp(now, at("p5", "Then the wingtip"), 1) * (1 - ramp(now, at("p5", "One idea in this episode"), 1));
  const end = ramp(now, at("p5", "One idea in this episode"), 1);
  const tOff = at("p5", "Don't modify the wing");
  const tOn = at("p5", "Build a new wing that bolts");
  const off = ramp(now, tOff, 2.5) * (1 - ramp(now, tOn, 2.5));
  const fresh = ramp(now, tOn + 0.5, 1);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: obj, fontFamily: FONT, maxWidth: 1300 }}>
        <div style={{ fontSize: 40, color: C.dim }}>3f had two objections it couldn't answer</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.ink, marginTop: 24, opacity: ramp(now, at("p5", "An old airliner's wing"), 0.8) }}>An airliner's wing was never built for 3,000 lb loads.</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.ink, marginTop: 16, opacity: ramp(now, at("p5", "And an old wing has a fatigue"), 0.8) }}>An old wing has a fatigue history.</div>
      </div>
      <Svg>
        <PlanJet x={640} y={570} s={0.9} opacity={swap} off={off} fresh={fresh} box={ramp(now, tOn, 1)} stations={ramp(now, at("p5", "And designed from the first drawing"), 1.5)} tip={ramp(now, at("p5", "And designed from the first drawing") + 5, 1)} />
      </Svg>
      <div style={{ position: "absolute", left: RX, top: 200, width: 580, opacity: swap, fontFamily: FONT }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.ink, opacity: ramp(now, tOff, 0.6) }}>Don't modify the wing.</div>
        <div style={{ fontSize: 70, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p5", "Replace it."), 0.6) }}>Replace it.</div>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 30, lineHeight: 1.5 }}>
          <div style={{ opacity: ramp(now, tOn, 0.6) }}>bolts to the existing wing box</div>
          <div style={{ opacity: ramp(now, at("p5", "Same span"), 0.6) }}>same span</div>
          <div style={{ opacity: ramp(now, at("p5", "Fuel inside it"), 0.6) }}>fuel inside, as before</div>
          <div style={{ color: C.amber, opacity: ramp(now, at("p5", "And designed from the first drawing"), 0.6) }}>3 stations a side + 1 at the tip</div>
        </div>
        <div style={{ fontSize: 34, color: C.teal, marginTop: 30, opacity: ramp(now, at("p5", "Half of that wing already exists"), 0.6) }}>Half of it exists: the P-8 wing, two pylons a side, built at Renton.</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 220, opacity: a10 }}>
        <Label x={0} y={0} w={1500} size={44} color={C.dim} text="Re-winging an old fleet has been done: the A-10" show={1} />
        <Stat x={0} y={110} value="173" label="new wing sets, ~$1.1B, from 2011" show={ramp(now, at("p5", "Starting in 2011"), 0.8)} size={120} />
        <Stat x={620} y={110} value="up to 112" label="more sets, up to $999M" show={ramp(now, at("p5", "A second contract followed"), 0.8)} size={120} />
        <Stat x={0} y={430} value="$6–9M" label="per A-10 wing set (author's arithmetic)" show={ramp(now, at("p5", "Divide those contracts out"), 0.8)} size={120} color={C.amber} />
        <Label x={620} y={450} w={900} size={44} color={C.ink} text="A 737's wing is far larger. No public price exists." show={ramp(now, at("p5", "A 737's wing is far larger"), 0.8)} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 240, opacity: cost }}>
        <Bar x={0} y={0} w={1300} frac={10 / 80} label="3d's rebuilt arsenal jet (the promise)" value="~$10M" color={C.steel} show={1} />
        <Bar x={0} y={150} w={1300} frac={25 / 80} label="this episode's truck, with a new wing (guess)" value="$20–30M ?" color={C.amber} show={ramp(now, at("p5", "The truck in this episode"), 1)} dashed />
        <Bar x={0} y={300} w={1300} frac={1} label="a new airliner (3d's figure)" value="~$80M" color={C.faint} show={ramp(now, at("p5", "That's still a fraction"), 1)} />
        <Label x={0} y={470} w={1500} size={52} weight={700} color={C.red} text="3d's headline doesn't survive." show={ramp(now, at("p5", "But 3d's headline"), 0.8)} />
      </div>
      <Lines x={300} y={250} show={buys} now={now} sec="p5" size={50} items={[
        ["Hardpoints designed in. Wiring kept out of the fuel.", "The hardpoints are designed in"],
        ["The part that wears out is new.", "And the part of an old airliner"],
        ["Built on a line, in numbers, then fitted.", "Wings can be built on a line", C.teal],
        ["A new wing is a new drawing. Whoever pays could own it.", "A new wing is a new drawing", C.amber],
      ]} />
      <Svg>
        <PlanJet x={640} y={570} s={0.9} opacity={tip} fresh={1} stations={1} tip={1} />
        <circle cx={640 + 578 * 0.9} cy={570 + 160 * 0.9} r={62} fill="none" stroke={C.red} strokeWidth={4} opacity={tip * ramp(now, at("p5", "The author wants a four-pack"), 0.8)} />
      </Svg>
      <div style={{ position: "absolute", left: RX, top: 220, width: 580, opacity: tip, fontFamily: FONT, fontSize: 36, lineHeight: 1.4 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: C.ink }}>The wingtip four-pack</div>
        <div style={{ color: C.teal, marginTop: 20, opacity: ramp(now, at("p5", "Weight at a wingtip"), 0.6) }}>Tip weight relieves bending. Tip tanks. Fighters.</div>
        <div style={{ color: C.red, marginTop: 14, opacity: ramp(now, at("p5", "The danger is flutter"), 0.6) }}>The danger is flutter: most of a ton at the end of a long, flexible wing.</div>
        <div style={{ color: C.amber, marginTop: 14, opacity: ramp(now, at("p5", "But Part Three mentioned"), 0.6) }}>The half-size missile: four weigh about what two full-size ones do.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 360, opacity: end, fontFamily: FONT }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink }}>One idea keeps rescuing another.</div>
        <div style={{ fontSize: 46, color: C.dim, marginTop: 24, opacity: ramp(now, at("p5", "That's usually a sign"), 0.6) }}>Usually a sign of something.</div>
        <div style={{ fontSize: 46, color: C.amber, marginTop: 10, opacity: ramp(now, at("p5", "It isn't proof"), 0.6) }}>It isn't proof.</div>
      </div>
    </>
  );
};

/* ---------------- P6: EVERY RUNWAY ---------------- */
export const P6: React.FC<P> = ({ now }) => {
  const s = sectionOf("p6");
  const tGo = at("p6", "They go to every airfield");
  const tTw = at("p6", "And all across Taiwan");
  const tSt = at("p6", "In December 2024");
  const tInv = at("p6", "The Pentagon's 2024 report");
  const tFew = at("p6", "So today's arithmetic");
  const tChg = at("p6", "Now change one thing");
  const tMx = at("p6", "It has been tried before");
  const mapA = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, tSt, 1));
  const stim = ramp(now, tSt, 1) * (1 - ramp(now, tInv, 1));
  const inv = ramp(now, tInv, 1) * (1 - ramp(now, tFew, 1));
  const mapB = ramp(now, tFew, 1) * (1 - ramp(now, tMx, 1));
  const mx = ramp(now, tMx, 1);
  const order = ["japan", "phil", "korea", "aus", "india", "sing", "indo"];
  const lit = (h: string) => (h === "taiwan" ? ramp(now, tTw, 0.8) : ramp(now, tGo + 1.2 + order.indexOf(h) * 1.25, 0.8));
  const dots = ramp(now, at("p6", "Airports that can take one"), 6);
  return (
    <>
      <MapView opacity={mapA} lit={lit} />
      <div style={{ position: "absolute", left: RX, top: 200, width: 580, opacity: mapA, fontFamily: FONT }}>
        <div style={{ fontSize: 34, color: C.dim, opacity: ramp(now, at("p6", "A fleet in being"), 0.6) }}>A fleet in being. Its job is to exist.</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink, marginTop: 30, opacity: ramp(now, at("p6", "In peacetime the trucks"), 0.6) }}>Peacetime: somewhere dry and far away.</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, marginTop: 16, opacity: ramp(now, at("p6", "In a crisis they move"), 0.6) }}>Crisis: every airfield that can land a 737.</div>
        <div style={{ fontSize: 38, color: C.red, marginTop: 16, opacity: ramp(now, tTw, 0.6) }}>And all across Taiwan.</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, opacity: stim }}>
        <Label x={260} y={170} w={1400} size={34} color={C.dim} text="STIMSON CENTER · DECEMBER 2024 · CHINESE MISSILES AND U.S. AIR BASES" show={1} />
        <Quote x={260} y={260} text="Unfortunately, Chinese strategists are correct." who="on the view that forward runways are the weak point of American airpower" show={ramp(now, at("p6", "Then it said"), 0.8)} />
        <Stat x={260} y={660} value="~12 days" label="runways in Japan closed to fighters (model)" show={ramp(now, at("p6", "Its model found"), 0.8)} size={100} color={C.amber} />
        <Stat x={980} y={660} value="1 month+" label="closed to tankers" show={ramp(now, at("p6", "and to tankers"), 0.8)} size={100} color={C.red} />
      </div>
      <div style={{ position: "absolute", left: 220, top: 210, opacity: inv }}>
        <Label x={0} y={0} w={1500} size={36} color={C.dim} text="China's ballistic missiles (Pentagon, 2024 report)" show={1} />
        <Stat x={0} y={80} value="900" label="short-range" show={1} size={110} />
        <Stat x={420} y={80} value="1,300" label="medium-range" show={1} size={110} />
        <Stat x={940} y={80} value="500" label="intermediate-range" show={1} size={110} />
        <Stat x={0} y={420} value="134" label="Chinese air bases within 1,000 nmi of the Taiwan Strait (Hudson, 2025)" show={ramp(now, at("p6", "China has 134 air bases"), 0.8)} size={110} color={C.red} />
        <Stat x={760} y={420} value="3,000+" label="aircraft shelters" show={ramp(now, at("p6", "China has 134 air bases") + 3, 0.8)} size={110} color={C.red} />
        <Label x={0} y={700} w={1500} size={42} color={C.ink} text="American airpower: a handful of bases, mostly in the open." show={ramp(now, at("p6", "American airpower in the region"), 0.8)} />
      </div>
      <MapView opacity={mapB} bases={1 - ramp(now, at("p6", "So the planner's list goes"), 2) * 0.5} dots={dots} names={0.5 * (1 - dots)} />
      <MapNote show={mapB * dots} />
      <div style={{ position: "absolute", left: RX, top: 170, width: 590, opacity: mapB, fontFamily: FONT }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: C.red, opacity: 1 - ramp(now, tChg, 1) * 0.6 }}>Today: a few big bases, a known list.</div>
        <div style={{ fontSize: 34, color: C.dim, marginTop: 20, opacity: ramp(now, at("p6", "A 737 needs what every"), 0.6) }}>A 737 needs a mile and a half of pavement, and jet fuel.</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 26, opacity: ramp(now, at("p6", "Japan alone has designated"), 0.6) }}>24</div>
        <div style={{ fontSize: 28, color: C.dim, opacity: ramp(now, at("p6", "Japan alone has designated"), 0.6) }}>civilian airports Japan has designated for its own forces</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 14, opacity: ramp(now, at("p6", "The Philippines has nine sites"), 0.6) }}>9</div>
        <div style={{ fontSize: 28, color: C.dim, opacity: ramp(now, at("p6", "The Philippines has nine sites"), 0.6) }}>agreed U.S. sites in the Philippines</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: C.amber, marginTop: 20, opacity: ramp(now, at("p6", "The number of runways"), 0.6) }}>Several hundred runways.</div>
        <div style={{ fontSize: 28, color: C.dim, opacity: ramp(now, at("p6", "The thread hasn't counted them"), 0.6) }}>Not counted. Somebody should.</div>
        <div style={{ fontSize: 34, color: C.ink, marginTop: 20, opacity: ramp(now, at("p6", "From orbit"), 0.6) }}>From orbit, a loaded one and an empty one are the same shape.</div>
      </div>
      <Svg>
        <g opacity={mx}>
          {Array.from({ length: 8 }).map((_, r) => Array.from({ length: 23 }).map((__, c) => (
            <rect key={r + "-" + c} x={230 + c * 34} y={560 + r * 40} width={24} height={26} fill={(r * 7 + 5) % 23 === c ? C.amber : "none"} stroke={C.steel} strokeWidth={2} opacity={ramp(now, at("p6", "Two hundred missiles would be shuttled") + (r * 23 + c) / 80, 0.4)} />
          )))}
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 220, top: 190, opacity: mx }}>
        <Label x={0} y={0} w={1500} size={36} color={C.dim} text="SEPTEMBER 1979 · THE MX MISSILE · “THE SHELL GAME”" show={ramp(now, at("p6", "In September 1979"), 0.8)} />
        <Stat x={0} y={70} value="200" label="missiles" show={ramp(now, at("p6", "Two hundred missiles would be shuttled"), 0.8)} size={110} color={C.amber} />
        <Stat x={420} y={70} value="4,600" label="shelters, Nevada and Utah · 23 per missile" show={ramp(now, at("p6", "Two hundred missiles would be shuttled") + 2, 0.8)} size={110} />
        <Stat x={1060} y={70} value="1981" label="cancelled, October 2" show={ramp(now, at("p6", "On October 2, 1981"), 0.8)} size={110} color={C.red} />
      </div>
      <Label x={1080} y={600} w={760} size={40} color={C.dim} text="The people of Utah and Nevada didn't want to live among 4,600 targets." show={mx * ramp(now, at("p6", "The people of Utah and Nevada"), 0.8)} />
      <Label x={1080} y={790} w={760} size={48} weight={700} color={C.amber} text="The shells turned out to have opinions." show={mx * ramp(now, at("p6", "And the shells turned out"), 0.8)} />
    </>
  );
};

/* ---------------- P7: NOBODY ASKED THEM ---------------- */
export const P7: React.FC<P> = ({ now }) => {
  const s = sectionOf("p7");
  const cards: [string, string, string, string, string][] = [
    ["Japan", "treaty ally", "24 airports designated for Japan's own forces. Civilian first.", "Once the military uses a civilian airport, it becomes a target.", "Japan is a treaty ally"],
    ["The Philippines", "treaty ally", "Nine agreed sites. Careful about what they are for.", "150,000 to 250,000 of its citizens live in Taiwan.", "The Philippines is a treaty ally"],
    ["South Korea · Australia", "treaty allies", "Each decides in its own parliament, on its own timeline.", "", "South Korea and Australia"],
    ["India", "not an ally, and has never wanted to be", "2016 logistics agreement: case by case, by mutual consent.", "Not a basing agreement. Nothing automatic.", "India is not an ally"],
    ["Indonesia", "bebas aktif: free and active, aligned with no one", "April 2026: a national argument over U.S. overflight alone.", "This plan is about landing, loaded.", "Indonesia has built its foreign policy"],
    ["Singapore", "hosts U.S. forces on rotation", "Has always stopped short of an alliance.", "", "Singapore hosts American forces"],
    ["Taiwan", "no U.S. bases, no defense treaty", "Armed U.S. aircraft landing in a crisis could be the act that starts the war.", "Its runways are the closest to 900 short-range missiles.", "And Taiwan."],
  ];
  const tTwo = at("p7", "So the map in Part Six");
  const tHard = at("p7", "And there's a harder thought");
  const tFix = at("p7", "There's an obvious repair");
  const intro = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, at("p7", cards[0][4]), 1));
  const two = ramp(now, tTwo, 1) * (1 - ramp(now, tHard, 1));
  const hard = ramp(now, tHard, 1) * (1 - ramp(now, tFix, 1));
  const fix = ramp(now, tFix, 1);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 360, opacity: intro, fontFamily: FONT }}>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink }}>Seven countries and one island.</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.amber, marginTop: 16, opacity: ramp(now, at("p7", "It hasn't asked any of them"), 0.8) }}>The plan hasn't asked any of them.</div>
      </div>
      {cards.map(([name, status, a, b, k], i) => {
        const t0 = at("p7", k);
        const t1 = i < cards.length - 1 ? at("p7", cards[i + 1][4]) : tTwo;
        const show = ramp(now, t0, 0.8) * (1 - ramp(now, t1, 0.8));
        return (
          <div key={name} style={{ position: "absolute", left: 260, top: 240, width: 1400, opacity: show, fontFamily: FONT }}>
            <div style={{ fontSize: 28, color: C.dim, letterSpacing: 4 }}>{i + 1} OF {cards.length}</div>
            <div style={{ fontSize: 100, fontWeight: 700, color: C.ink, letterSpacing: -2 }}>{name}</div>
            <div style={{ fontSize: 40, color: i >= 3 && i < 6 ? C.amber : i === 6 ? C.red : C.teal, marginTop: 4 }}>{status}</div>
            <div style={{ fontSize: 44, color: C.ink, marginTop: 50, lineHeight: 1.3, opacity: ramp(now, t0 + 3, 0.8) }}>{a}</div>
            <div style={{ fontSize: 44, color: C.dim, marginTop: 20, lineHeight: 1.3, opacity: ramp(now, t0 + (t1 - t0) * 0.55, 0.8) }}>{b}</div>
          </div>
        );
      })}
      <MapView opacity={two} dots={1} dim={ramp(now, at("p7", "The other shows where"), 3)} names={0} />
      <MapNote show={two} />
      <div style={{ position: "absolute", left: RX, top: 240, width: 580, opacity: two, fontFamily: FONT }}>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink }}>Two maps.</div>
        <div style={{ fontSize: 36, color: C.dim, marginTop: 20, opacity: ramp(now, at("p7", "One shows where a 737"), 0.6) }}>One: where a 737 can land.</div>
        <div style={{ fontSize: 36, color: C.amber, marginTop: 14, opacity: ramp(now, at("p7", "The other shows where"), 0.6) }}>The other: where a government says yes, quickly, in the worst week of its decade.</div>
        <div style={{ fontSize: 36, color: C.ink, marginTop: 24, opacity: ramp(now, at("p7", "The second map is much smaller"), 0.6) }}>Nobody knows its shape until the week arrives.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 250, opacity: hard, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.ink }}>The deterrent has to move at the most dangerous moment there is.</div>
        <div style={{ fontSize: 42, color: C.dim, marginTop: 30, opacity: ramp(now, at("p7", "From Beijing, hundreds"), 0.8) }}>From Beijing: hundreds of airliners fanning out, an unknown number armed.</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.red, marginTop: 20, opacity: ramp(now, at("p7", "It could look like the hour"), 0.8) }}>It could look like the hour before an attack.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 30, opacity: ramp(now, at("p7", "In 1914"), 0.8) }}>1914: each mobilization was meant partly to warn the others off. Each made the others move faster.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: fix, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 40, color: C.dim }}>An obvious repair</div>
        <div style={{ fontSize: 90, fontWeight: 700, color: C.amber, marginTop: 10, opacity: ramp(now, at("p7", "Make it routine"), 0.8) }}>Make it routine.</div>
        <div style={{ fontSize: 42, color: C.ink, marginTop: 24, opacity: ramp(now, at("p7", "Fly the trucks through"), 0.8) }}>Peacetime, exercises, empty and announced. As ordinary as a port call.</div>
        <div style={{ fontSize: 42, color: C.dim, marginTop: 20, opacity: ramp(now, at("p7", "It would also require"), 0.8) }}>It needs every one of those governments to say yes in public, over and over.</div>
      </div>
    </>
  );
};

/* ---------------- P8: WHAT THE PLANNER HAS TO ASSUME ---------------- */
export const P8: React.FC<P> = ({ now }) => {
  const s = sectionOf("p8");
  const tHist = at("p8", "In 1940, Britain");
  const tSep = at("p8", "What separates the two lists");
  const tCarry = at("p8", "But the planner has read");
  const tNum = at("p8", "Now the author's number");
  const tCover = at("p8", "And think about what covering");
  const tCaut = at("p8", "Three cautions");
  const intro = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, tHist, 1));
  const hist = ramp(now, tHist, 1) * (1 - ramp(now, tSep, 1));
  const sep = ramp(now, tSep, 1) * (1 - ramp(now, tCarry, 1));
  const carry = ramp(now, tCarry, 1) * (1 - ramp(now, tNum, 1));
  const num = ramp(now, tNum, 1) * (1 - ramp(now, tCover, 1));
  const cover = ramp(now, tCover, 1) * (1 - ramp(now, tCaut, 1));
  const caut = ramp(now, tCaut, 1);
  const yes: [string, string, string][] = [["1940", "Iceland: Britain landed troops", "In 1940, Britain"], ["1941", "Iran: Britain and the USSR", "In 1941, Britain and the Soviet"], ["1943", "Portugal: the Azores, under pressure", "In 1943, Portugal"], ["1990", "Saudi Arabia: U.S. troops within days", "In 1990, Saudi Arabia"], ["2001", "Pakistan: airspace, after an ultimatum", "In 2001, Pakistan"]];
  const no: [string, string, string][] = [["1973", "European allies refuse the airlift", "In 1973, almost every"], ["1986", "France and Spain refuse overflight", "In 1986, France and Spain"], ["2003", "Turkey's parliament votes no", "In 2003, Turkey"], ["1939–45", "Ireland keeps its ports closed", "Ireland kept its ports"]];
  const col = (title: string, rows: [string, string, string][], color: string, x: number) => (
    <div style={{ position: "absolute", left: x, top: 200, width: 800, fontFamily: FONT }}>
      <div style={{ fontSize: 36, fontWeight: 700, color, letterSpacing: 3, marginBottom: 24, opacity: ramp(now, at("p8", rows[0][2]), 0.6) }}>{title}</div>
      {rows.map(([y, t, k]) => (
        <div key={y} style={{ display: "flex", gap: 24, alignItems: "baseline", marginBottom: 22, opacity: ramp(now, at("p8", k), 0.6) }}>
          <div style={{ width: 230, fontSize: 44, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>{y}</div>
          <div style={{ fontSize: 32, color: C.dim, lineHeight: 1.25 }}>{t}</div>
        </div>
      ))}
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 300, opacity: intro, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 40, color: C.dim }}>The author's answer to Part Seven</div>
        <div style={{ fontSize: 58, fontWeight: 700, color: C.ink, marginTop: 20, opacity: ramp(now, at("p8", "What those governments would say"), 0.8) }}>What they would say matters less than what the planner has to assume.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 30, opacity: ramp(now, at("p8", "If a 737 can land there"), 0.8) }}>If a 737 can land there and the government hasn't ruled it out, the runway is on his list.</div>
      </div>
      <div style={{ opacity: hist }}>
        {col("THE ROOM TO SAY NO SHRANK", yes, C.amber, 160)}
        {col("THEY SAID NO", no, C.teal, 1020)}
      </div>
      <div style={{ position: "absolute", left: 300, top: 260, opacity: sep, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p8", "Countries said yes when"), 0.8) }}>Yes: when the same enemy threatened them, or a great power forced the matter.</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.teal, marginTop: 24, opacity: ramp(now, at("p8", "They said no when"), 0.8) }}>No: when it was someone else's war, and yes would make them a target.</div>
        <div style={{ fontSize: 42, color: C.ink, marginTop: 40, opacity: ramp(now, at("p8", "Nobody is going to force"), 0.8) }}>Nobody is going to force India or Indonesia.</div>
        <div style={{ fontSize: 42, color: C.dim, marginTop: 10, opacity: ramp(now, at("p8", "And a deterrent that had to coerce"), 0.8) }}>A deterrent that coerced its hosts would have no hosts.</div>
      </div>
      <MapView opacity={carry + num * 0.9} dots={1} picks={num * ramp(now, at("p8", "At six to eight to a field"), 2)} names={0} />
      <MapNote show={carry + num} />
      <div style={{ position: "absolute", left: RX, top: 260, width: 580, opacity: carry, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>The planner has read all of this too.</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.ink, marginTop: 24, opacity: ramp(now, at("p8", "So he has to carry"), 0.8) }}>He has to carry the whole map.</div>
      </div>
      <div style={{ position: "absolute", left: RX, top: 150, width: 590, opacity: num, fontFamily: FONT }}>
        <div style={{ fontSize: 30, color: C.dim }}>Six to eight trucks at one airfield</div>
        <div style={{ fontSize: 74, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p8", "At twenty-four missiles each"), 0.6) }}>144–192</div>
        <div style={{ fontSize: 28, color: C.dim, opacity: ramp(now, at("p8", "At twenty-four missiles each"), 0.6) }}>cruise missiles from one ordinary airport</div>
        <div style={{ fontSize: 74, fontWeight: 700, color: C.ink, marginTop: 20, opacity: ramp(now, at("p8", "3f imagined a fleet"), 0.6) }}>130</div>
        <div style={{ fontSize: 28, color: C.dim, opacity: ramp(now, at("p8", "3f imagined a fleet"), 0.6) }}>trucks in 3f's fleet</div>
        <div style={{ fontSize: 74, fontWeight: 700, color: C.amber, marginTop: 20, opacity: ramp(now, at("p8", "At six to eight to a field"), 0.6) }}>16–22</div>
        <div style={{ fontSize: 28, color: C.dim, opacity: ramp(now, at("p8", "At six to eight to a field"), 0.6) }}>airfields filled, out of several hundred</div>
        <div style={{ fontSize: 34, color: C.ink, marginTop: 24, opacity: ramp(now, at("p8", "The MX plan put"), 0.6) }}>MX: one missile among 23 shelters. About the same ratio.</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.teal, marginTop: 12, opacity: ramp(now, at("p8", "They're already there"), 0.6) }}>Nobody has to pour the shelters. They're called airports.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 240, opacity: cover, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 40, color: C.dim }}>To be safe, he would have to strike</div>
        <div style={{ fontSize: 60, fontWeight: 700, color: C.red, marginTop: 14, opacity: ramp(now, at("p8", "To be safe, he would have"), 0.8) }}>hundreds of civilian airports · seven countries · the first hour</div>
        <div style={{ fontSize: 44, color: C.ink, marginTop: 30, opacity: ramp(now, at("p8", "A war he wanted to keep small"), 0.8) }}>A war he wanted to keep small would have to begin by being made enormous.</div>
        <div style={{ fontSize: 44, color: C.dim, marginTop: 40, opacity: ramp(now, at("p8", "It doesn't have to win a fight"), 0.8) }}>It doesn't have to win a fight.</div>
        <div style={{ fontSize: 66, fontWeight: 700, color: C.amber, marginTop: 6, opacity: ramp(now, at("p8", "It raises the price of starting"), 0.8) }}>It raises the price of starting one.</div>
      </div>
      <div style={{ position: "absolute", left: 240, top: 190, opacity: caut, fontFamily: FONT, maxWidth: 1450 }}>
        <div style={{ fontSize: 38, color: C.dim, marginBottom: 20 }}>Three cautions</div>
        {[["It only works if it's believable.", "A few close allies would have to host these airplanes in the open first.", "It only works if it's believable"], ["He has other moves.", "Work on the capitals for years. Blind the kill chain. Or shoot down slow, small missiles.", "He has other moves"], ["The cost lands on people who weren't asked.", "Indonesian and Indian airports end up on a target list whether or not they ever agree.", "And the cost lands on people"]].map(([a, b, k], i) => (
          <div key={a} style={{ marginBottom: 30, opacity: ramp(now, at("p8", k), 0.8) }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: i === 2 ? C.amber : C.ink }}>{a}</div>
            <div style={{ fontSize: 34, color: C.dim, marginTop: 6 }}>{b}</div>
          </div>
        ))}
        <div style={{ fontSize: 40, color: C.ink, opacity: ramp(now, at("p8", "The author's plan gets its strength"), 0.8) }}>The plan gets its strength from other people's silence. It should say so.</div>
      </div>
    </>
  );
};

/* ---------------- P9: TEN AIRPLANES AND A NAME ---------------- */
export const P9: React.FC<P> = ({ now }) => {
  const s = sectionOf("p9");
  const tTen = at("p9", "Ten is enough to do");
  const tThree = at("p9", "And three a year is a number");
  const tCards = at("p9", "A bluff only works");
  const tK = at("p9", "And the author would write a number");
  const tChg = at("p9", "And at a thousand, something changes");
  const tDif = at("p9", "There's a difficulty here");
  const tRisk = at("p9", "The risks are the ordinary ones");
  const prog = ramp(now, s.start + 0.3, 1) * (1 - ramp(now, tTen, 1));
  const ten = ramp(now, tTen, 1) * (1 - ramp(now, tThree, 1));
  const three = ramp(now, tThree, 1) * (1 - ramp(now, tCards, 1));
  const cards = ramp(now, tCards, 1) * (1 - ramp(now, tK, 1));
  const k = ramp(now, tK, 1) * (1 - ramp(now, tChg, 1));
  const chg = ramp(now, tChg, 1) * (1 - ramp(now, tDif, 1));
  const dif = ramp(now, tDif, 1) * (1 - ramp(now, tRisk, 1));
  const risk = ramp(now, tRisk, 1);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: 250, opacity: prog, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim }}>A program, and a small one</div>
        <div style={{ fontSize: 84, fontWeight: 700, color: C.ink, marginTop: 14, opacity: ramp(now, at("p9", "Give it a name"), 0.6) }}>A name.</div>
        <div style={{ fontSize: 84, fontWeight: 700, color: C.ink, opacity: ramp(now, at("p9", "Build ten first articles"), 0.6) }}>Ten first articles.</div>
        <div style={{ fontSize: 84, fontWeight: 700, color: C.amber, opacity: ramp(now, at("p9", "Then keep building three"), 0.6) }}>Three a year.</div>
        <div style={{ fontSize: 38, color: C.dim, marginTop: 30, opacity: ramp(now, at("p9", "But a name means"), 0.6) }}>A name means a budget line, an office, a contractor and a test report.</div>
      </div>
      <Svg>
        {Array.from({ length: 10 }).map((_, i) => (
          <SideJet key={i} x={330 + (i % 5) * 315} y={300 + Math.floor(i / 5) * 150} s={0.26} opacity={ten * ramp(now, tTen + i * 0.25, 0.6)} pylons={1} small={1} />
        ))}
      </Svg>
      <Lines x={300} y={560} show={ten} now={now} sec="p9" size={46} gap={12} items={[
        ["Prove the wing.", "Prove the wing"],
        ["Prove the rack.", "Prove the rack"],
        ["Prove that 24 missiles come off cleanly.", "Prove that twenty-four"],
        ["Then fly through allied airports until it's ordinary.", "And then fly through allied airports", C.amber],
      ]} />
      <div style={{ position: "absolute", left: 220, top: 240, opacity: three }}>
        <Stat x={0} y={0} value="3 a year" label="one conversion line, at freighter-shop pace (3f)" show={ramp(now, at("p9", "3f worked out"), 0.8)} size={120} color={C.amber} />
        <Label x={0} y={280} w={1500} size={56} weight={700} color={C.ink} text="One line, kept warm." show={ramp(now, at("p9", "So three a year is one line"), 0.8)} />
        <Label x={0} y={390} w={1500} size={42} color={C.dim} text="The planner counts what could be built: airframes in the desert, thousands of missiles a year, wing sets built ahead." show={ramp(now, at("p9", "The planner counts what could"), 0.8)} />
      </div>
      <Svg>
        <g opacity={cards}>
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={240 + i * 92} y={420} width={80} height={120} rx={8} fill={C.bg2} stroke={C.amber} strokeWidth={3} opacity={ramp(now, at("p9", "Ten airplanes are the cards") + i * 0.12, 0.4)} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={"d" + i} x={1300 + i * 5} y={410 - i * 4} width={110} height={150} rx={8} fill={C.faint} stroke={C.steel} strokeWidth={2} opacity={ramp(now, at("p9", "The warm line is the rest"), 0.8)} />
          ))}
        </g>
      </Svg>
      <Label x={240} y={250} w={1500} size={48} weight={700} color={C.ink} text="A bluff only works if the player is sometimes holding the cards." show={cards} />
      <Label x={240} y={580} w={900} size={36} color={C.amber} text="ten airplanes: the cards" show={cards * ramp(now, at("p9", "Ten airplanes are the cards"), 0.8)} />
      <Label x={1240} y={600} w={600} size={36} color={C.dim} text="the warm line: the rest of the deck, face down" show={cards * ramp(now, at("p9", "The warm line is the rest"), 0.8)} />
      <div style={{ position: "absolute", left: 220, top: 170, opacity: k }}>
        <Stat x={0} y={0} value="1,000" label="a program of record. Authorized, announced, and in the author's view never built." show={ramp(now, at("p9", "A thousand."), 0.8)} size={170} color={C.amber} />
        <Stat x={0} y={380} value="125–167" label="airfields, at six to eight to a field" show={ramp(now, at("p9", "A thousand trucks at six"), 0.8)} size={90} />
        <Stat x={620} y={380} value="24,000" label="missiles: about three years of the program's hoped-for output" show={ramp(now, at("p9", "At twenty-four missiles each, that's 24,000"), 0.8)} size={90} />
        <Stat x={0} y={640} value="$20–30B" label="airplanes, at Part Five's guess" show={ramp(now, at("p9", "At Part Five's guess"), 0.8)} size={90} />
        <Stat x={620} y={640} value="+ ~$5B" label="missiles" show={ramp(now, at("p9", "At Part Five's guess") + 4, 0.8)} size={90} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 290, opacity: chg, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 48, color: C.dim, opacity: ramp(now, at("p9", "With a hundred and thirty trucks"), 0.8) }}>130 trucks: most runways empty. A shell game.</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 24, opacity: ramp(now, at("p9", "With a thousand, the shells"), 0.8) }}>1,000 trucks: the shells are mostly full.</div>
        <div style={{ fontSize: 44, color: C.amber, marginTop: 24, opacity: ramp(now, at("p9", "It stops being a bluff"), 0.8) }}>No longer a bluff about where they are. A statement about how many there could be.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 200, opacity: dif, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink }}>A number only deters if the other side believes it would be built.</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 30, lineHeight: 1.5 }}>
          <div style={{ opacity: ramp(now, at("p9", "The authority has to be real"), 0.6) }}>The authority has to be real.</div>
          <div style={{ opacity: ramp(now, at("p9", "The options on retiring"), 0.6) }}>The options on retiring airliners have to be signed.</div>
          <div style={{ opacity: ramp(now, at("p9", "The wing line has to be able"), 0.6) }}>The wing line has to be able to speed up.</div>
        </div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber, marginTop: 24, opacity: ramp(now, at("p9", "The program has to be one decision"), 0.8) }}>One decision away from happening.</div>
        <div style={{ fontSize: 42, color: C.ink, marginTop: 40, opacity: ramp(now, at("p9", "If it works, almost none"), 0.8) }}>If it works, almost none of it ever exists, and there is nothing to point to as proof.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 250, opacity: risk, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 38, color: C.dim, marginBottom: 20 }}>The ordinary risks</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink, opacity: ramp(now, at("p9", "Small, odd programs"), 0.6) }}>Small, odd programs are the first to be cut.</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink, marginTop: 14, opacity: ramp(now, at("p9", "Three a year can look"), 0.6) }}>Three a year can look like a token.</div>
        <div style={{ fontSize: 46, fontWeight: 700, color: C.ink, marginTop: 14, opacity: ramp(now, at("p9", "And the first ten carry"), 0.6) }}>The first ten carry all the engineering.</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.amber, marginTop: 40, opacity: ramp(now, at("p9", "And real, even in small numbers"), 0.6) }}>Real, even in small numbers, is what separates it from a slide.</div>
      </div>
    </>
  );
};

/* ---------------- P10: THE OTHER SIDE OF THE LEDGER ---------------- */
export const P10: React.FC<P> = ({ now }) => {
  const s = sectionOf("p10");
  const items = [
    ["The truck is soft", "an open ramp, a public road beside the fence, small drones", "The truck is soft"],
    ["Civilian airports are full of civilians", "the terminal is next to the weapon", "Civilian airports are full"],
    ["The idea is easy to copy", "China flies hundreds of 737s and A320s, and builds its own airliner", "The idea is easy to copy"],
    ["The missiles may not be enough", "100 lb warheads won't stop a fleet", "The missiles may not be enough"],
    ["The wing broke the budget", "no longer a $10M airplane", "The wing broke the budget"],
    ["Three ideas rest on hardware nobody has built", "the rack · the half-size missile · and the Missileer was cancelled", "The rack doesn't exist"],
    ["3f's objections still stand", "who owns the engineering · years for the first article · no survival in the air", "And 3f's objections"],
  ];
  return (
    <div style={{ position: "absolute", left: 220, top: 150, opacity: ramp(now, s.start + 0.3, 1), fontFamily: FONT }}>
      <div style={{ fontSize: 38, color: C.dim, marginBottom: 22 }}>The rest of the case against</div>
      {items.map(([a, b, k]) => (
        <div key={a} style={{ marginBottom: 18, opacity: ramp(now, at("p10", k), 0.8) }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: C.ink }}>— {a}</div>
          <div style={{ fontSize: 28, color: C.dim, marginLeft: 44 }}>{b}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------------- CLOSE ---------------- */
export const Close: React.FC<P> = ({ now }) => {
  const s = sectionOf("close");
  const tPat = at("close", "One reading is that this is the pattern");
  const tRun = at("close", "Episode 3 began with");
  const tQ = at("close", "Would a Chinese planner");
  const tEnd = at("close", "That's the honest ending");
  const recap = ramp(now, s.start + 0.3, 1.2) * (1 - ramp(now, tPat, 1));
  const pat = ramp(now, tPat, 1) * (1 - ramp(now, tRun, 1));
  const run = ramp(now, tRun, 1) * (1 - ramp(now, tQ, 1));
  const q = ramp(now, tQ, 1) * (1 - ramp(now, tEnd, 1));
  const end = ramp(now, tEnd, 1);
  const chain: [string, string][] = [["airframe", "From the airframe to the hangar"], ["hangar", "From the airframe to the hangar"], ["drawings", "From the hangar to the drawings"], ["missiles", "From the drawings to the missiles"], ["permission", "And now from the missiles"]];
  const eps = [["3", "The Wasted Years"], ["3a", "The Locked Room"], ["3b", "The Engine War"], ["3c", "The Power Station"], ["3d", "Two Million Dollars a Copy"], ["3e", "The Companies Nobody Films"], ["3f", "The Hangar Year"], ["3g", "Every Runway"]];
  return (
    <>
      <Svg>
        <SideJet x={1380} y={300} s={0.42} opacity={recap + end * 0.9} />
        <line x1={1100} y1={370} x2={1700} y2={370} stroke={C.faint} strokeWidth={3} opacity={recap + end * 0.9} />
      </Svg>
      <Lines x={220} y={430} w={1500} show={recap} now={now} sec="close" size={48} items={[
        ["A quarter of the cost. Four times the shots.", "A quarter of the cost", C.teal],
        ["A new wing, and a more expensive airplane than it promised.", "Then it tried to fix the wing"],
        ["A map whose strongest part belongs to other people.", "Then it drew a map", C.amber],
        ["A runway can be measured. Permission can't be stockpiled in a desert.", "Permission is not"],
      ]} />
      <div style={{ position: "absolute", left: 160, top: 300, opacity: pat, fontFamily: FONT }}>
        <div style={{ fontSize: 40, color: C.dim, marginBottom: 50 }}>Every time the thread solves the hardware, the problem moves somewhere softer.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {chain.map(([t, k], i) => (
            <React.Fragment key={t}>
              {i ? <div style={{ fontSize: 50, color: C.faint, opacity: ramp(now, at("close", k), 0.6) }}>→</div> : null}
              <div style={{ fontSize: i === 4 ? 62 : 52, fontWeight: 700, color: i === 4 ? C.amber : C.ink, opacity: i === 0 ? 1 : ramp(now, at("close", k), 0.6) }}>{t}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 180, opacity: run, fontFamily: FONT }}>
        {eps.map(([n, t], i) => (
          <div key={n} style={{ display: "flex", gap: 30, alignItems: "baseline", marginBottom: 10, opacity: ramp(now, tRun + i * 0.7, 0.6) }}>
            <div style={{ width: 90, fontSize: 40, fontWeight: 700, color: C.amber }}>{n}</div>
            <div style={{ fontSize: 44, fontWeight: i === 7 ? 700 : 500, color: i === 7 ? C.ink : C.dim }}>{t}</div>
          </div>
        ))}
        <div style={{ fontSize: 42, color: C.ink, marginTop: 30, opacity: ramp(now, at("close", "This may be where"), 0.8) }}>This may be where that thread rests.</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 280, opacity: q, fontFamily: FONT, maxWidth: 1350 }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.ink }}>Would a Chinese planner have to deal with it?</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 16, opacity: ramp(now, at("close", "If even a few of those"), 0.8) }}>If even a few governments said yes, he would.</div>
        <div style={{ fontSize: 50, fontWeight: 700, color: C.ink, marginTop: 50, opacity: ramp(now, at("close", "Would they say yes"), 0.8) }}>Would they say yes?</div>
        <div style={{ fontSize: 40, color: C.dim, marginTop: 16, opacity: ramp(now, at("close", "The episode doesn't know"), 0.8) }}>The episode doesn't know. Neither does Washington. Neither do they, yet.</div>
        <div style={{ fontSize: 42, color: C.amber, marginTop: 30, opacity: ramp(now, at("close", "The author's point is"), 0.8) }}>The planner doesn't know either, and he's the one who can't afford to guess wrong.</div>
      </div>
      <Label x={220} y={520} w={1500} size={60} weight={700} color={C.ink} text="The cheapest part of this deterrent is the airplane." show={end * ramp(now, at("close", "The cheapest part"), 0.8)} />
      <Label x={220} y={620} w={1500} size={60} weight={700} color={C.amber} text="The most expensive part isn't for sale." show={end * ramp(now, at("close", "The most expensive part"), 0.8)} />
    </>
  );
};

export const Thread: React.FC<P> = ({ now }) => {
  const s = sectionOf("thread");
  return <Label x={360} y={460} w={1200} size={48} color={C.dim} text="Next pull: what makes a country say yes." show={ramp(now, s.start, 1)} />;
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

export const _unused = { H, Tag };
