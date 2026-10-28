import {Easing, interpolate} from "remotion";
import VO from "./vo.json";
import {FPS} from "./theme";
import {LINES, Line, MOOD, Mood, Step} from "./script";

export type VoClip = {dur: number; tok: [number, number][]};
export const vo = (id: string) => (VO as unknown as Record<string, VoClip>)[id];

/** Portada antes de la primera línea y cierre después de la última. */
export const INTRO = 105;
export const OUTRO = 150;

/** Silencio después de cada línea: corto entre réplicas, más largo alrededor de las pausas de la narradora. */
const gapAfter = (l: Line, next?: Line) => {
  if (!next) return 0;
  if (l.who === "N" || next.who === "N") return 16;
  if (next.id === "r06") return 40; // la pausa larga antes de que hable de su papá
  return 9;
};

export type LineT = Line & {idx: number; from: number; len: number; end: number};

export const TL: LineT[] = (() => {
  let t = INTRO;
  return LINES.map((l, idx) => {
    const len = Math.ceil(vo(l.id).dur * FPS);
    const lt = {...l, idx, from: t, len, end: t + len};
    t += len + gapAfter(l, LINES[idx + 1]);
    return lt;
  });
})();

export const TOTAL = TL[TL.length - 1].end + OUTRO;
export const byId = (id: string) => TL.find((l) => l.id === id)!;

/** Línea vigente: la que suena o, en un silencio, la última que sonó. */
export const lineAt = (f: number): LineT | undefined => {
  let cur: LineT | undefined;
  for (const l of TL) if (l.from <= f) cur = l;
  return cur;
};
export const speakingAt = (f: number) => TL.find((l) => f >= l.from && f < l.end);

/** ¿Hay voz en este cuadro? (dentro de una palabra). Sirve para la boca y el pulso de la línea. */
export const voiceAt = (f: number, who: "M" | "R" | "N") => {
  const l = speakingAt(f);
  if (!l || l.who !== who) return 0;
  const t = (f - l.from) / FPS;
  return vo(l.id).tok.some(([s, e]) => t >= s - 0.02 && t <= e + 0.02) ? 1 : 0;
};

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
export const tw = (f: number, a: number, dur = 12, ease = EASE) =>
  interpolate(f, [a, a + dur], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease});

/** Disposición del señor Torres (0 cerrado → 1 abierto), suavizada entre réplicas. */
export const MOOD_KEYS: {f: number; v: number; mood: Mood}[] = TL.filter((l) => l.mood).map((l) => ({f: l.from, v: MOOD[l.mood!].open, mood: l.mood!}));
export const openAt = (f: number) => {
  let v = 0.12;
  for (const k of MOOD_KEYS) {
    if (f < k.f) break;
    v = interpolate(f, [k.f, k.f + 24], [v, k.v], {extrapolateRight: "clamp", easing: EASE_IO});
  }
  return v;
};
export const moodAt = (f: number): Mood => {
  let m: Mood = "seco";
  for (const k of MOOD_KEYS) if (f >= k.f) m = k.mood;
  return m;
};

/** Pasos del método encendidos: los de la última intervención de Mariana que los marca. */
export const stepsAt = (f: number): {steps: Step[]; since: number} => {
  let out: {steps: Step[]; since: number} = {steps: [], since: -999};
  for (const l of TL) {
    if (l.from > f) break;
    if (l.who === "M" && l.steps) out = {steps: l.steps, since: l.from};
  }
  return out;
};

/** Objeción en curso: desde que el cliente la plantea hasta que termina la respuesta de Mariana. */
export const objectionAt = (f: number) => {
  const l = lineAt(f);
  return l?.objection;
};

/** Ilustración vigente: la de la línea, o la anterior si el cliente contesta sobre ella (p. ej. "Cremación"). */
export const insertAt = (f: number): {insert: NonNullable<Line["insert"]>; owner: LineT; reply?: LineT} | undefined => {
  const l = lineAt(f);
  if (!l || l.who === "N") return undefined;
  if (l.insert) return {insert: l.insert, owner: l};
  const prev = TL[l.idx - 1];
  if (l.who === "R" && prev?.insert && prev.who === "M") return {insert: prev.insert, owner: prev, reply: l};
  return undefined;
};

/** Tokens de pantalla con su tiempo absoluto (cuadros) y estilo. */
export type Tok = {t: string; s: number; e: number; key: boolean; slot: boolean};
export const tokensOf = (l: LineT): Tok[] => {
  const raw = l.text.split(/\s+/);
  const times = vo(l.id).tok;
  let inKey = false;
  return raw.map((w, i) => {
    const opens = w.startsWith("**");
    if (opens) inKey = true;
    const key = inKey;
    if (w.replace(/[.,;:?!»”)]+$/, "").endsWith("**")) inKey = false;
    const t = w.replace(/\*\*/g, "");
    const [s, e] = times[i] ?? times[times.length - 1];
    return {t, s: l.from + Math.round(s * FPS), e: l.from + Math.round(e * FPS), key, slot: /\[|\]/.test(t)};
  });
};

/** Parte una línea en frases (para mostrar una a la vez). */
export const sentencesOf = (toks: Tok[]): Tok[][] => {
  const out: Tok[][] = [];
  let cur: Tok[] = [];
  for (const k of toks) {
    cur.push(k);
    if (/[.?!»]$/.test(k.t) && !/^(J\.|Sr\.)$/.test(k.t)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  // Junta frases muy cortas con la siguiente para que no parpadee el texto.
  const merged: Tok[][] = [];
  for (const s of out) {
    const prev = merged[merged.length - 1];
    if (prev && prev.length < 4) merged[merged.length - 1] = [...prev, ...s];
    else merged.push(s);
  }
  return merged;
};
