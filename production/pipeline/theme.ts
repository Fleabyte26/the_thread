import captions from "./captions.json";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  bg: "#0b1118",
  bg2: "#111a24",
  grid: "rgba(160,190,220,0.06)",
  ink: "#e8ecef",
  dim: "#8a97a3",
  faint: "#3a4754",
  steel: "#7f93a8",
  amber: "#e2a33b",
  red: "#c8553d",
  teal: "#5fb3a8",
  ghost: "rgba(232,236,239,0.13)",
};

export const FONT = "Inter, 'Inter Display', 'DejaVu Sans', sans-serif";
export const MONO = "'DejaVu Sans Mono', monospace";

export type Cue = {
  i: number;
  section: string;
  text: string;
  flag: string;
  chapter: string;
  start: number;
  end: number;
  next: number;
};
export type Section = { id: string; start: number; end: number };

export const CAP = captions as unknown as { duration: number; cues: Cue[]; sections: Section[] };
export const DURATION_FRAMES = Math.ceil(CAP.duration * FPS);

export const sectionOf = (id: string) => CAP.sections.find((s) => s.id === id)!;

/** Time (seconds) of the first cue in `section` whose text contains `needle`. */
export const at = (section: string, needle: string, fallback = 0): number => {
  const c = CAP.cues.find((q) => q.section === section && q.text.includes(needle));
  if (!c) {
    // eslint-disable-next-line no-console
    console.warn(`cue not found: [${section}] ${needle}`);
    return sectionOf(section)?.start ?? fallback;
  }
  return c.start;
};

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
/** 0→1 ramp starting at time t (s), over d seconds, eased. */
export const ramp = (now: number, t: number, d = 0.8) => {
  const x = clamp((now - t) / d);
  return x * x * (3 - 2 * x);
};
