import React from "react";
import {C} from "./theme";

/**
 * Primitivas de dibujo a línea (estilo de la ilustración de jgarcialopez.com.mx).
 * `DrawCtx` lleva el avance de entrada (0→1); cada trazo tiene un orden `i` para escalonarse.
 */
export const DrawCtx = React.createContext(1);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const useDraw = (i = 0, span = 0.35) => {
  const d = React.useContext(DrawCtx);
  if (d >= 1) return 1;
  return clamp01((d - i * (1 - span)) / span);
};

type PProps = {d: string; i?: number; fill?: string; stroke?: string; w?: number; cap?: "round" | "butt"; opacity?: number; dash?: string};

/** Trazo que se dibuja; el relleno aparece cuando la línea casi termina. */
export const P: React.FC<PProps> = ({d, i = 0, fill = "none", stroke = C.navy, w = 3.2, cap = "round", opacity = 1, dash}) => {
  const p = useDraw(i);
  const drawing = p < 1;
  return (
    <path
      d={d}
      fill={fill}
      fillOpacity={fill === "none" ? 0 : clamp01((p - 0.55) / 0.45)}
      stroke={stroke}
      strokeWidth={w}
      strokeLinecap={cap}
      strokeLinejoin="round"
      opacity={opacity}
      pathLength={drawing && !dash ? 1 : undefined}
      strokeDasharray={drawing && !dash ? 1 : dash}
      strokeDashoffset={drawing && !dash ? 1 - p : undefined}
    />
  );
};

export const Circ: React.FC<{cx: number; cy: number; r: number; i?: number; fill?: string; stroke?: string; w?: number}> = ({cx, cy, r, ...rest}) => (
  <P d={`M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0`} {...rest} />
);

export const Rect: React.FC<{x: number; y: number; w: number; h: number; r?: number; i?: number; fill?: string; stroke?: string; sw?: number}> = ({x, y, w, h, r = 0, sw, ...rest}) => (
  <P
    d={`M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`}
    w={sw}
    {...rest}
  />
);

/** Palomita que se traza. */
export const Check: React.FC<{x: number; y: number; s?: number; i?: number; color?: string}> = ({x, y, s = 1, i = 0, color = C.navy}) => (
  <P d={`M${x - 10 * s},${y} L${x - 3 * s},${y + 8 * s} L${x + 12 * s},${y - 9 * s}`} i={i} stroke={color} w={4 * s} />
);
