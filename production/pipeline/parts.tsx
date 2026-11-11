import React from "react";
import { C, FONT, MONO, ramp } from "./theme";

/** Big number / label card. */
export const Stat: React.FC<{
  x: number; y: number; value: string; label: string; show: number; color?: string; size?: number; align?: "left" | "center";
}> = ({ x, y, value, label, show, color = C.ink, size = 96, align = "left" }) => (
  <div
    style={{
      position: "absolute", left: x, top: y, opacity: show,
      transform: `translateY(${(1 - show) * 24}px)`,
      textAlign: align, width: align === "center" ? 700 : undefined,
      marginLeft: align === "center" ? -350 : 0,
    }}
  >
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, color, letterSpacing: -2, lineHeight: 1, whiteSpace: "nowrap" }}>{value}</div>
    <div style={{ fontFamily: FONT, fontSize: 28, color: C.dim, marginTop: 14, width: 560, lineHeight: 1.3 }}>{label}</div>
  </div>
);

export const Label: React.FC<{ x: number; y: number; text: string; show: number; size?: number; color?: string; w?: number; weight?: number }> = ({
  x, y, text, show, size = 30, color = C.dim, w = 900, weight = 500,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: show, fontFamily: FONT, fontSize: size, color, fontWeight: weight, lineHeight: 1.3 }}>
    {text}
  </div>
);

export const Quote: React.FC<{ x: number; y: number; text: string; who: string; show: number }> = ({ x, y, text, who, show }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 1100, opacity: show, transform: `translateY(${(1 - show) * 20}px)` }}>
    <div style={{ fontFamily: FONT, fontSize: 64, color: C.ink, fontWeight: 600, lineHeight: 1.15, borderLeft: `6px solid ${C.amber}`, paddingLeft: 36 }}>
      “{text}”
    </div>
    <div style={{ fontFamily: FONT, fontSize: 28, color: C.dim, marginTop: 22, paddingLeft: 42 }}>{who}</div>
  </div>
);

/** Horizontal bar with a label and value. */
export const Bar: React.FC<{
  x: number; y: number; w: number; frac: number; label: string; value: string; color: string; show: number; h?: number; dashed?: boolean;
}> = ({ x, y, w, frac, label, value, color, show, h = 46, dashed }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, show * 3) }}>
    <div style={{ fontFamily: FONT, fontSize: 26, color: C.dim, marginBottom: 10 }}>{label}</div>
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.faint}` }} />
      <div
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: w * frac * show,
          background: dashed ? "transparent" : color, border: dashed ? `2px dashed ${color}` : undefined,
        }}
      />
      <div style={{ position: "absolute", left: w * frac * show + 18, top: h / 2 - 20, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink, whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  </div>
);

/** Generic warship side profile. kind: destroyer | frigate | lcs | carrier | sub | battleship | galley */
export const Hull: React.FC<{
  kind: string; x: number; y: number; scale?: number; color?: string; opacity?: number; guns?: number; tubes?: number; sink?: number;
}> = ({ kind, x, y, scale = 1, color = C.steel, opacity = 1, guns = 0, tubes = 0, sink = 0 }) => {
  const s = scale;
  let body: React.ReactNode = null;
  if (kind === "destroyer") {
    // tumblehome hull + angular deckhouse
    body = (
      <g>
        <path d="M0,60 L40,90 L560,90 L600,60 L590,40 L20,40 Z" fill={color} />
        <path d="M200,40 L230,0 L340,0 L370,40 Z" fill={color} />
        <g opacity={guns}>
          <rect x={100} y={26} width={50} height={14} fill={color} />
          <rect x={140} y={30} width={40} height={5} fill={color} />
          <rect x={410} y={26} width={50} height={14} fill={color} />
          <rect x={400} y={30} width={14} height={5} fill={color} />
        </g>
        <g opacity={tubes}>
          {[96, 132, 404, 440].map((tx) => (
            <rect key={tx} x={tx} y={8} width={26} height={32} rx={4} fill="none" stroke={C.amber} strokeWidth={4} />
          ))}
        </g>
      </g>
    );
  } else if (kind === "frigate") {
    body = (
      <g>
        <path d="M0,40 L30,70 L420,70 L450,40 Z" fill={color} />
        <path d="M140,40 L160,8 L270,8 L290,40 Z" fill={color} />
        <rect x={60} y={30} width={40} height={10} fill={color} />
      </g>
    );
  } else if (kind === "lcs") {
    body = (
      <g>
        <path d="M0,40 L20,64 L330,64 L360,30 L300,30 L290,40 Z" fill={color} />
        <path d="M150,40 L170,10 L260,10 L280,40 Z" fill={color} />
      </g>
    );
  } else if (kind === "carrier") {
    body = (
      <g>
        <path d="M0,40 L60,100 L640,100 L700,40 Z" fill={color} />
        <rect x={0} y={30} width={720} height={12} fill={color} />
        <path d="M450,30 L465,-20 L515,-20 L520,30 Z" fill={color} />
        <rect x={485} y={-45} width={6} height={25} fill={color} />
      </g>
    );
  } else if (kind === "sub") {
    body = (
      <g>
        <path d="M0,40 Q0,10 60,10 L560,10 Q600,10 620,40 Q600,70 560,70 L60,70 Q0,70 0,40 Z" fill={color} />
        <path d="M160,10 L175,-30 L235,-30 L245,10 Z" fill={color} />
        <path d="M600,40 L650,20 L650,60 Z" fill={color} />
      </g>
    );
  } else if (kind === "battleship") {
    body = (
      <g>
        <path d="M0,50 L50,95 L700,95 L740,50 Z" fill={color} />
        <path d="M260,50 L280,0 L400,0 L420,50 Z" fill={color} />
        <rect x={330} y={-40} width={14} height={40} fill={color} />
        {[110, 190, 520].map((gx) => (
          <g key={gx}>
            <rect x={gx} y={32} width={56} height={18} fill={color} />
            <rect x={gx + (gx < 400 ? -30 : 56)} y={38} width={34} height={5} fill={color} />
          </g>
        ))}
      </g>
    );
  } else if (kind === "galley") {
    body = (
      <g>
        <path d="M0,40 Q20,80 120,80 L380,80 Q460,80 480,30 L440,40 Z" fill={color} />
        <rect x={235} y={-110} width={6} height={150} fill={color} />
        <path d="M150,-100 L330,-100 L310,20 L170,20 Z" fill={color} opacity={0.55} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y + sink * 160}) rotate(${sink * 14}) scale(${s})`} opacity={opacity}>
      {body}
    </g>
  );
};
