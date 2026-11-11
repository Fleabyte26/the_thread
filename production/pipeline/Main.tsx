import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { C, CAP, FONT, FPS, ramp } from "./theme";
import * as S from "./Scenes";
import { EP } from "./episode";

const SCENES: Record<string, React.FC<{ now: number }>> = {
  cold: S.Cold, title: S.Title, p1: S.P1, p2: S.P2, p3: S.P3, p4: S.P4, p5: S.P5,
  p6: S.P6, p7: S.P7, p8: S.P8, close: S.Close, thread: S.Thread, end: S.End,
};

const FADE = 0.9;

const Background: React.FC<{ now: number }> = ({ now }) => {
  const off = (now * 6) % 80;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg} 70%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `${off}px ${off / 2}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const Banner: React.FC<{ flag: string; show: number }> = ({ flag, show }) => {
  if (!flag) return null;
  const text = flag === "plan" ? "INFERENCE · THE AUTHOR'S PLAN" : flag === "inference" ? "INFERENCE · AUTHOR'S ARITHMETIC" : flag === "reported" ? "REPORTED / UNCONFIRMED" : "INTERPRETATION · ONE READING";
  return (
    <div
      style={{
        position: "absolute", right: 60, top: 50, opacity: show, padding: "12px 22px",
        border: `2px solid ${C.amber}`, color: C.amber, fontFamily: FONT, fontWeight: 700,
        fontSize: 24, letterSpacing: 3, background: "rgba(11,17,24,0.8)",
      }}
    >
      {text}
    </div>
  );
};

const Chapter: React.FC<{ now: number }> = ({ now }) => {
  const c = CAP.cues.find((q) => q.chapter && now >= q.start - 0.2 && now < q.next + 0.6);
  if (!c) return null;
  const a = ramp(now, c.start - 0.2, 0.6) * (1 - ramp(now, c.next - 0.4, 0.8));
  const [num, ...rest] = c.chapter.split(" — ");
  return (
    <AbsoluteFill style={{ background: `rgba(11,17,24,${0.92 * a})`, alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ fontFamily: FONT, fontSize: 30, letterSpacing: 10, color: C.amber }}>{rest.length ? num.toUpperCase() : ""}</div>
      <div style={{ fontFamily: FONT, fontSize: 92, fontWeight: 700, color: C.ink, marginTop: 18, letterSpacing: -2, textAlign: "center", maxWidth: 1500 }}>
        {rest.length ? rest.join(" — ") : num}
      </div>
    </AbsoluteFill>
  );
};

const ChapterTag: React.FC<{ now: number }> = ({ now }) => {
  const sec = CAP.sections.find((s) => now >= s.start && now < s.end);
  if (!sec || ["cold", "title", "end", "thread"].includes(sec.id)) return null;
  const c = CAP.cues.find((q) => q.section === sec.id && q.chapter);
  const label = c ? c.chapter.split(" — ")[0] : "";
  return (
    <div style={{ position: "absolute", left: 60, top: 54, fontFamily: FONT, fontSize: 22, letterSpacing: 4, color: C.dim, opacity: 0.8 }}>
      THE THREAD · EP {EP.num}{label ? ` · ${label.toUpperCase()}` : ""}
    </div>
  );
};

export const Main: React.FC<{ withAudio?: boolean }> = ({ withAudio = false }) => {
  const frame = useCurrentFrame();
  const now = frame / FPS;
  const idx = CAP.sections.findIndex((s) => now >= s.start && now < s.end);
  const cur = CAP.sections[Math.max(0, idx)];
  const prev = idx > 0 ? CAP.sections[idx - 1] : null;
  const inFade = prev && now < cur.start + FADE;
  const Cur = SCENES[cur.id];
  const Prev = prev ? SCENES[prev.id] : null;
  const curFlag = CAP.cues.find((q) => q.section === cur.id)?.flag ?? "";
  const a = inFade ? ramp(now, cur.start, FADE) : 1;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Background now={now} />
      {inFade && Prev ? <AbsoluteFill style={{ opacity: 1 - a }}><Prev now={now} /></AbsoluteFill> : null}
      <AbsoluteFill style={{ opacity: a }}>{Cur ? <Cur now={now} /> : null}</AbsoluteFill>
      <ChapterTag now={now} />
      <Banner flag={curFlag} show={ramp(now, cur.start + 1.5, 0.8) * (1 - ramp(now, cur.end - 0.8, 0.8))} />
      <Chapter now={now} />
      {withAudio ? (
        <>
          <Audio src={staticFile("narration.wav")} />
          <Audio src={staticFile("music.wav")} volume={0.16} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
