import {Easing, interpolate} from "remotion";
import VO from "./vo.json";
import {FPS} from "../theme";
import {Ficha, LINES, Line, Phase, SCENES, Who} from "./script";

export type VoClip = {dur: number; tok: [number, number][]};
export const vo = (id: string) => (VO as unknown as Record<string, VoClip>)[id];

/** Portada antes de la primera línea y cierre después de la última. */
export const INTRO = 105;
export const OUTRO = 150;

/** La narradora que abre cada llamada ("Primera llamada…"). */
export const SCENE_OPENERS: Record<string, number> = {n03: 1, n08: 2, n10: 3, n12: 4};

/** Silencio después de cada línea: corto entre réplicas, más largo alrededor de la narradora y al colgar. */
const gapAfter = (l: Line, next?: Line) => {
  if (!next) return 0;
  if (next.id in SCENE_OPENERS) return 30; // cambio de llamada
  if (l.who === "N" || next.who === "N") return 16;
  return 9;
};

export type LineT = Line & {idx: number; from: number; len: number; end: number; scene: number};

export const TL: LineT[] = (() => {
  let t = INTRO;
  let scene = 0;
  return LINES.map((l, idx) => {
    if (l.id in SCENE_OPENERS) scene = SCENE_OPENERS[l.id];
    if (l.id === "n14") scene = 5; // reglas de oro
    const len = Math.ceil(vo(l.id).dur * FPS);
    const lt = {...l, idx, from: t, len, end: t + len, scene};
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

/** Escena (llamada) en curso; 0 antes de la primera, 5 en las reglas de oro. */
export const sceneAt = (f: number) => lineAt(f)?.scene ?? 0;
export const sceneStart = (n: number) => TL.find((l) => l.scene === n)!.from;
export const clientOf = (n: number): Who | undefined => SCENES.find((s) => s.n === n)?.client;

/** ¿Hay voz en este cuadro? (dentro de una palabra). Sirve para la boca y el pulso de la línea. */
export const voiceAt = (f: number, who: Who) => {
  const l = speakingAt(f);
  if (!l || l.who !== who) return 0;
  const t = (f - l.from) / FPS;
  return vo(l.id).tok.some(([s, e]) => t >= s - 0.02 && t <= e + 0.02) ? 1 : 0;
};

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
export const tw = (f: number, a: number, dur = 12, ease = EASE) =>
  interpolate(f, [a, a + dur], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease});

/** Fase del guion vigente: la de la última intervención del asesor en esta llamada. */
export const phaseAt = (f: number): {phase?: Phase; since: number} => {
  const sc = sceneAt(f);
  let out: {phase?: Phase; since: number} = {since: -999};
  for (const l of TL) {
    if (l.from > f) break;
    if (l.scene === sc && l.who === "A" && l.phase) out = {phase: l.phase, since: l.from};
  }
  return out;
};

/** Objeción en curso. */
export const objectionAt = (f: number) => lineAt(f)?.objection;

/** Ficha del cliente en la llamada vigente: cada campo con el cuadro en que se llenó. */
export type FichaT = {[K in keyof Ficha]?: {v: string; at: number}};
export const fichaAt = (f: number): FichaT => {
  const sc = sceneAt(f);
  const out: FichaT = {};
  for (const l of TL) {
    if (l.from > f) break;
    if (l.scene !== sc || !l.ficha) continue;
    for (const [k, v] of Object.entries(l.ficha) as [keyof Ficha, string][]) {
      if (out[k]?.v !== v) out[k] = {v, at: l.from};
    }
  }
  return out;
};

/** Ilustración vigente: la de la línea, o la anterior si el cliente contesta sobre ella. */
export const insertAt = (f: number): {insert: NonNullable<Line["insert"]>; owner: LineT; reply?: LineT} | undefined => {
  const l = lineAt(f);
  if (!l || l.who === "N") return undefined;
  if (l.insert) return {insert: l.insert, owner: l};
  const prev = TL[l.idx - 1];
  if (l.who !== "A" && prev?.insert && prev.who === "A") return {insert: prev.insert, owner: prev, reply: l};
  return undefined;
};

/** Tokens de pantalla con su tiempo absoluto (cuadros) y estilo. Los huecos [así de largos] quedan en un solo token. */
export type Tok = {t: string; s: number; e: number; key: boolean; slot: boolean};
export const tokensOf = (l: LineT): Tok[] => {
  const raw = l.text.split(/\s+/);
  const times = vo(l.id).tok;
  let inKey = false;
  let inSlot = false;
  const out: Tok[] = [];
  raw.forEach((w, i) => {
    const opens = w.startsWith("**");
    if (opens) inKey = true;
    const key = inKey;
    if (w.replace(/[.,;:?!»”)]+$/, "").endsWith("**")) inKey = false;
    const t = w.replace(/\*\*/g, "");
    const [s, e] = times[i] ?? times[times.length - 1];
    const tok = {t, s: l.from + Math.round(s * FPS), e: l.from + Math.round(e * FPS), key, slot: inSlot || t.startsWith("[")};
    if (inSlot) {
      const prev = out[out.length - 1];
      prev.t += " " + t;
      prev.e = tok.e;
    } else out.push(tok);
    if (t.startsWith("[")) inSlot = true;
    if (/\][.,;:?!]*$/.test(t)) inSlot = false;
  });
  return out;
};

const normW = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Cuadro absoluto en que se dice una palabra de la línea (n = ocurrencia). */
export const wordAt = (l: LineT, needle: string, n = 0) => {
  const k = normW(needle);
  const hits = tokensOf(l).filter((t) => normW(t.t).startsWith(k));
  return (hits[n] ?? hits[hits.length - 1] ?? {s: l.from}).s;
};

/** Parte una línea en frases (para mostrar una a la vez). */
export const sentencesOf = (toks: Tok[]): Tok[][] => {
  const out: Tok[][] = [];
  let cur: Tok[] = [];
  for (const k of toks) {
    cur.push(k);
    if (/[.?!»]$/.test(k.t) && !/^(J\.|Sr\.|Sra\.|p\.)$/.test(k.t)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  const merged: Tok[][] = [];
  for (const s of out) {
    const prev = merged[merged.length - 1];
    if (prev && prev.length < 4) merged[merged.length - 1] = [...prev, ...s];
    else merged.push(s);
  }
  return merged;
};
