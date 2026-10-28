import React from "react";
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {C, SANS, SERIF} from "../theme";
import {Face, blink, mixFace} from "../characters";
import {Check, DrawCtx} from "../draw";
import {Slot} from "../inserts";
import {Andres, Client} from "./characters";
import {INSERTS, INS_H, INS_W} from "./inserts";
import {Ficha, PEOPLE, PHASES, Phase, SCENES, Who} from "./script";
import {
  EASE_IO,
  INTRO,
  LineT,
  SCENE_OPENERS,
  TL,
  TOTAL,
  Tok,
  byId,
  clientOf,
  fichaAt,
  insertAt,
  lineAt,
  objectionAt,
  phaseAt,
  sceneAt,
  sentencesOf,
  speakingAt,
  tokensOf,
  tw,
  voiceAt,
  wordAt,
} from "./timeline";

type CWho = "P" | "J" | "C";

/* ------------------------------------------------------------------ */
/* Encabezado: logo, las cuatro fases y la llamada en curso             */
/* ------------------------------------------------------------------ */

const PHASE_ICON: Record<Phase, React.ReactNode> = {
  Abrir: <path d="M-9,-8 H9 Q11,-8 11,-6 V3 Q11,5 9,5 H-1 L-6,10 V5 H-9 Q-11,5 -11,3 V-6 Q-11,-8 -9,-8 Z" />,
  Descubrir: <path d="M-9,-3 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0 M3,3 L10,10" />,
  Presentar: <path d="M-7,-10 H4 L8,-6 V10 H-7 Z M-3,-3 H4 M-3,2 H4 M-3,6 H1" />,
  Acordar: <path d="M-9,-7 H9 V9 H-9 Z M-9,-2 H9 M-5,-10 V-5 M5,-10 V-5 M-4,4 L-1,7 L5,1" />,
};

/** 0 = pendiente, 1 = ya pasó, 2 = en curso. */
const PhasePill: React.FC<{s: Phase; state: 0 | 1 | 2; flash: number}> = ({s, state, flash}) => {
  const cur = state === 2;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 18px 9px 12px",
        borderRadius: 30,
        border: `2px solid ${state ? C.navy : C.sand}`,
        background: cur ? C.navy : C.white,
        color: cur ? C.white : state ? C.navy : C.stone,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: 21,
        transform: `scale(${1 + flash * 0.08})`,
      }}
    >
      <svg width={26} height={26} viewBox="-13 -13 26 26">
        <g stroke={cur ? C.yellow : state ? C.navy : C.muted} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {PHASE_ICON[s]}
        </g>
      </svg>
      {s}
    </div>
  );
};

const PHASE_WORDS = ["abrir", "descubrir", "presentar", "acordar"];

/** En la narración del orden, cada fase se enciende cuando se nombra. */
const n02Phases = (f: number): Phase[] | null => {
  const l = byId("n02");
  if (f < l.from || f > l.end + 10) return null;
  return PHASES.filter((_, k) => f >= wordAt(l, PHASE_WORDS[k]));
};

const Header: React.FC<{f: number; show: number}> = ({f, show}) => {
  const sc = sceneAt(f);
  const n02 = n02Phases(f);
  const {phase, since} = phaseAt(f);
  const ci = phase ? PHASES.indexOf(phase) : -1;
  const client = sc >= 1 && sc <= 4 ? PEOPLE[clientOf(sc) as CWho] : undefined;
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 96, display: "flex", alignItems: "center", padding: "0 56px", gap: 28, opacity: show, transform: `translateY(${(1 - show) * -20}px)`, borderBottom: `1.5px solid ${C.sand}`, background: C.cream}}>
      <Img src={staticFile("brand/logo_negro.svg")} style={{height: 46}} />
      <div style={{width: 1.5, height: 40, background: C.sand}} />
      <div style={{fontFamily: SANS, fontSize: 20, color: C.stone, lineHeight: 1.2}}>
        Guion de práctica
        <br />
        <span style={{color: C.navy, fontWeight: 700}}>Script de ventas</span>
      </div>
      <div style={{flex: 1, display: "flex", justifyContent: "center", gap: 12}}>
        {PHASES.map((s, k) => {
          const state: 0 | 1 | 2 = n02 ? (n02.includes(s) ? 2 : 0) : sc >= 1 && sc <= 4 && ci >= 0 ? (k === ci ? 2 : k < ci ? 1 : 0) : 0;
          const fl = !n02 && state === 2 ? interpolate(f - since, [0, 6, 14], [0, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 0;
          return <PhasePill key={s} s={s} state={state} flash={fl} />;
        })}
      </div>
      <div style={{width: 330, textAlign: "right", fontFamily: SANS, lineHeight: 1.25}}>
        {client ? (
          <>
            <div style={{fontSize: 17, color: C.stone}}>Llamada {sc} de 4</div>
            <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: C.gold}}>{client.name}</div>
          </>
        ) : (
          <div style={{fontSize: 18, color: C.stone}}>{sc === 5 ? "Reglas de oro" : "4 llamadas · 3 clientes"}</div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Texto que se va diciendo                                             */
/* ------------------------------------------------------------------ */

const Word: React.FC<{k: Tok; f: number; size: number}> = ({k, f, size}) => {
  const on = tw(f, k.s - 2, 5);
  if (k.slot) {
    return (
      <span style={{marginRight: "0.28em", opacity: 0.35 + on * 0.65}}>
        <Slot size={size * 0.72}>{k.t.replace(/[,.]$/, "")}</Slot>
        {/[,.]$/.test(k.t) ? k.t.slice(-1) : ""}
      </span>
    );
  }
  const u = tw(f, k.s, 10);
  return (
    <span style={{position: "relative", display: "inline-block", marginRight: "0.26em", color: k.key ? C.navy : C.ink, fontWeight: k.key ? 700 : 400, opacity: 0.22 + on * 0.78}}>
      {k.t}
      {k.key && <span style={{position: "absolute", left: 0, bottom: size * 0.02, height: size * 0.09, width: `${u * 100}%`, background: C.yellow, opacity: 0.85, zIndex: -1}} />}
    </span>
  );
};

/** Muestra la frase que suena; la anterior sube y se desvanece. */
const Spoken: React.FC<{l: LineT; f: number; size: number; serif?: boolean; align?: "left" | "center" | "right"; width: number; rows?: number}> = ({l, f, size, serif, align = "left", width, rows = 4}) => {
  const sents = React.useMemo(() => sentencesOf(tokensOf(l)), [l]);
  let idx = 0;
  sents.forEach((s, k) => {
    if (f >= s[0].s - 6) idx = k;
  });
  return (
    <div style={{position: "relative", width, height: size * 1.25 * rows}}>
      {sents.map((s, k) => {
        if (k < idx - 1 || k > idx) return null;
        // La frase que sale se va antes de que entre la nueva, para que no se encimen.
        const a = k === idx ? tw(f, s[0].s - 6, 10) : 1 - tw(f, sents[idx][0].s - 12, 6);
        const y = k === idx ? (1 - a) * 26 : -(1 - a) * 30;
        return (
          <div key={k} style={{position: "absolute", left: 0, right: 0, top: 0, textAlign: align, fontFamily: serif ? SERIF : SANS, fontSize: size, lineHeight: 1.25, letterSpacing: serif ? 0 : "-0.01em", opacity: a, transform: `translateY(${y}px)`, textWrap: "pretty" as never}}>
            {s.map((t, j) => (
              <Word key={j} k={t} f={f} size={size} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

/** Tarjeta de diálogo: del lado de quien habla. */
const SpeechCard: React.FC<{l: LineT; f: number}> = ({l, f}) => {
  const isA = l.who === "A";
  const a = tw(f, l.from - 4, 10) * (1 - tw(f, l.end + 6, 8));
  const p = PEOPLE[l.who as Exclude<Who, "N">];
  const name = isA ? `${p.short} · Asesor` : `${p.short} · Cliente`;
  const color = isA ? C.navy : C.gold;
  const W = 1160;
  return (
    <div style={{position: "absolute", top: 172, left: isA ? 70 : 1920 - 70 - W, width: W, opacity: a, transform: `translateX(${(1 - a) * (isA ? -24 : 24)}px)`}}>
      <div style={{display: "flex", alignItems: "center", gap: 14, justifyContent: isA ? "flex-start" : "flex-end", marginBottom: 14}}>
        <span style={{width: 12, height: 12, borderRadius: 7, background: color}} />
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: "0.08em", textTransform: "uppercase", color}}>{name}</span>
        {l.tag && <span style={{fontFamily: SANS, fontSize: 20, color: C.stone}}>· {l.tag}</span>}
      </div>
      <Spoken l={l} f={f} size={isA ? 44 : 46} align={isA ? "left" : "right"} width={W} />
      {l.note && (
        <div style={{position: "absolute", top: 300, left: isA ? 0 : undefined, right: isA ? undefined : 0, display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontSize: 19, color: C.gold, opacity: tw(f, l.from + 20, 12)}}>
          <svg width={22} height={22} viewBox="-11 -11 22 22">
            <circle r={9.5} fill="none" stroke={C.gold} strokeWidth={2} />
            <path d="M0,-4 V-4.5 M0,0 V5" stroke={C.gold} strokeWidth={2.4} strokeLinecap="round" />
          </svg>
          {l.note}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Escenario: Andrés, el cliente de cada llamada, la línea y las ilustraciones */
/* ------------------------------------------------------------------ */

const A_POS = {x: 40, y: 440};
const C_POS = {x: 1320, y: 440};
const LINE_A = {x: 300, y: 610};
const LINE_B = {x: 1690, y: 560};
const LINE_C = {x: 995, y: 300};
const bez = (t: number) => ({
  x: (1 - t) ** 2 * LINE_A.x + 2 * (1 - t) * t * LINE_C.x + t * t * LINE_B.x,
  y: (1 - t) ** 2 * LINE_A.y + 2 * (1 - t) * t * LINE_C.y + t * t * LINE_B.y,
});

const CallLine: React.FC<{f: number; draw: number}> = ({f, draw}) => {
  const sp = speakingAt(f);
  const dir = !sp || sp.who === "N" ? 0 : sp.who === "A" ? 1 : -1;
  const act = sp && sp.who !== "N" ? voiceAt(f, sp.who) : 0;
  return (
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0}}>
      <path d={`M${LINE_A.x},${LINE_A.y} Q${LINE_C.x},${LINE_C.y} ${LINE_B.x},${LINE_B.y}`} fill="none" stroke={C.lineSoft} strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" style={{clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`}} />
      {dir !== 0 &&
        draw > 0.9 &&
        [0, 1, 2, 3].map((k) => {
          const t0 = (((f * 0.012 + k * 0.25) % 1) + 1) % 1;
          const p = bez(dir === 1 ? t0 : 1 - t0);
          return <circle key={k} cx={p.x} cy={p.y} r={7} fill={dir === 1 ? C.navy : C.gold} opacity={(0.25 + act * 0.75) * Math.sin(t0 * Math.PI)} />;
        })}
    </svg>
  );
};

const NEUTRAL: Face = {brow: 0, mouth: 0.15, eye: 0.9, tilt: 0, lean: 0};

/** Expresión del cliente en cada réplica (sigue las acotaciones de la voz). */
const CFACE: Record<string, Face> = {
  p01: {brow: -0.2, mouth: -0.1, eye: 0.85, tilt: 2, lean: -2},
  p02: {brow: 0, mouth: 0.1, eye: 0.9, tilt: 0, lean: 0},
  p03: {brow: 0.2, mouth: 0, eye: 0.85, tilt: -3, lean: 2},
  p04: {brow: 0.3, mouth: 0.15, eye: 0.9, tilt: -2, lean: 3},
  p05: {brow: 0.85, mouth: -0.4, eye: 0.5, tilt: 6, lean: 4},
  p06: {brow: 0.35, mouth: -0.1, eye: 0.85, tilt: 3, lean: 2},
  p07: {brow: 0.1, mouth: 0.3, eye: 0.95, tilt: 0, lean: 4},
  p08: {brow: 0.2, mouth: 0.5, eye: 0.95, tilt: -2, lean: 5},
  p09: {brow: 0.3, mouth: 0.65, eye: 0.95, tilt: 0, lean: 6},
  p10: {brow: 0.25, mouth: 0.45, eye: 0.95, tilt: -2, lean: 4},
  p11: {brow: 0.1, mouth: 0.55, eye: 1, tilt: 0, lean: 8},
  p12: {brow: 0.3, mouth: 0.75, eye: 0.95, tilt: 0, lean: 8},
  j01: {brow: 0.5, mouth: -0.35, eye: 0.75, tilt: -3, lean: -4},
  j02: {brow: 0.7, mouth: -0.5, eye: 0.55, tilt: 5, lean: 2},
  j03: {brow: 0.3, mouth: 0.45, eye: 0.9, tilt: 0, lean: 3},
  c01: {brow: 0.3, mouth: 0, eye: 0.85, tilt: 3, lean: 0},
  c02: {brow: 0.9, mouth: -0.35, eye: 0.75, tilt: 5, lean: 4},
  c03: {brow: 0.35, mouth: 0.55, eye: 0.9, tilt: 0, lean: 6},
  c04: {brow: 0.3, mouth: 0.8, eye: 0.85, tilt: -3, lean: 6},
};
/** Réplicas en que Andrés se pone serio. */
const SERIOUS = new Set(["p05", "j01", "j02", "c02"]);

const clientFace = (f: number, sc: number, who: Who) => {
  let prev = NEUTRAL;
  let face = NEUTRAL;
  for (const l of TL) {
    if (l.scene !== sc || l.who !== who || l.from > f || !CFACE[l.id]) continue;
    face = mixFace(prev, CFACE[l.id], tw(f, l.from - 4, 14, EASE_IO));
    prev = CFACE[l.id];
  }
  return face;
};

const Stage: React.FC<{f: number}> = ({f}) => {
  const n01 = byId("n01");
  const drawA = tw(f, n01.from + 10, 70, EASE_IO);
  const sc = sceneAt(f);
  const cs = Math.min(Math.max(sc, 1), 4);
  const who = clientOf(cs) as CWho;
  const opener = TL.find((l) => l.scene === cs)!;
  const drawC = sc === 0 ? 0 : tw(f, opener.end - 30, 60, EASE_IO);
  const drawLine = sc === 0 ? 0 : tw(f, opener.end + 10, 40, EASE_IO);
  const sp = speakingAt(f);

  const cTalk = voiceAt(f, who) * (0.45 + 0.55 * Math.abs(Math.sin(f * 0.85)));
  const aTalk = voiceAt(f, "A") * (0.4 + 0.6 * Math.abs(Math.sin(f * 0.95 + 1)));
  const listening = sp && sp.who !== "A" && sp.who !== "N" ? 1 : 0;
  const nod = listening * Math.sin(f / 9) * 1.6;
  const cur = lineAt(f);
  const serious = cur && SERIOUS.has(cur.id) ? tw(f, cur.from, 20) * (1 - tw(f, cur.end + 10, 30)) : 0;
  const aFace: Face = {brow: 0.1 + serious * 0.5, mouth: 0.45 - listening * 0.18 - serious * 0.32, eye: 1, tilt: listening * 2 + serious * 3, lean: 0};

  const target = sp?.who === "A" ? -1 : sp && sp.who !== "N" ? 1 : 0;
  const camX = interpolate(target, [-1, 1], [26, -26]) * (insertAt(f) ? 0.3 : 1);
  const scale = 1 + (target !== 0 ? 0.025 : 0);

  return (
    <div style={{position: "absolute", inset: 0, transform: `translateX(${camX}px) scale(${scale})`, transformOrigin: "50% 100%"}}>
      <CallLine f={f} draw={drawLine} />
      <div style={{position: "absolute", left: A_POS.x, top: A_POS.y}}>
        <Andres draw={drawA} face={aFace} talk={aTalk} blinkV={blink(f, 0)} nod={nod} />
      </div>
      {drawC > 0 && (
        <div style={{position: "absolute", left: C_POS.x, top: C_POS.y}}>
          <Client key={cs} who={who} draw={drawC} face={clientFace(f, cs, who)} talk={cTalk} blinkV={blink(f, 47)} />
        </div>
      )}
    </div>
  );
};

/** Ilustración vigente. Si varias líneas seguidas usan la misma, entra una sola vez. */
const groupStart = (owner: LineT) => {
  let start = owner;
  for (let k = owner.idx - 1; k >= 0; k--) {
    const l = TL[k];
    if (l.who === "N") break;
    if (l.insert === owner.insert) start = l;
    else if (l.insert || l.who === "A") break;
  }
  return start.from;
};

const InsertLayer: React.FC<{f: number}> = ({f}) => {
  const cur = insertAt(f);
  const prev = insertAt(f - 12);
  const curStart = cur ? groupStart(cur.owner) : 0;
  const prevStart = prev ? groupStart(prev.owner) : 0;
  const layers: {show: NonNullable<typeof cur>; a: number}[] = [];
  if (prev && (!cur || prevStart !== curStart)) {
    const outAt = cur ? curStart : lineAt(f)!.from;
    layers.push({show: prev, a: tw(f, prevStart, 12) * (1 - tw(f, outAt, 10))});
  }
  if (cur) layers.push({show: cur, a: tw(f, curStart, 12)});
  return (
    <>
      {layers.map(({show, a}) => {
        const Comp = INSERTS[show.insert];
        return (
          <div key={show.owner.id} style={{position: "absolute", left: (1920 - INS_W) / 2, top: 520, width: INS_W, height: INS_H, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
            <Comp f={f} owner={show.owner} reply={show.reply} />
          </div>
        );
      })}
    </>
  );
};

/** Presentación (primera línea de la narradora): Andrés y los tres clientes. */
const Intros: React.FC<{f: number}> = ({f}) => {
  const n01 = byId("n01");
  const out = 1 - tw(f, n01.end, 12);
  if (out <= 0) return null;
  const aA = tw(f, wordAt(n01, "andrés"), 14);
  const atC = wordAt(n01, "tres");
  return (
    <>
      <div style={{position: "absolute", left: 640, top: 560, opacity: aA * out, transform: `translateX(${(1 - aA) * -20}px)`}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: C.navy}}>Andrés Medina</div>
        <div style={{fontFamily: SANS, fontSize: 24, color: C.stone, marginTop: 4}}>Asesor de J. García López</div>
        <div style={{width: 120, height: 3, background: C.navy, marginTop: 12}} />
      </div>
      <div style={{position: "absolute", right: 40, top: 560, display: "flex", gap: 0, opacity: out}}>
        {(["P", "J", "C"] as CWho[]).map((w, k) => (
          <div key={w} style={{width: 210, display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{width: 210, height: 240, overflow: "hidden"}}>
              <div style={{transform: "scale(0.42)", transformOrigin: "-30px 0"}}>
                <Client who={w} draw={tw(f, atC - 10 + k * 8, 40, EASE_IO)} face={NEUTRAL} talk={0} blinkV={blink(f, k * 31)} />
              </div>
            </div>
            <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 20, color: C.gold, opacity: tw(f, atC + 20 + k * 8, 12)}}>{PEOPLE[w].name}</div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Registro del cliente (banda inferior)                                */
/* ------------------------------------------------------------------ */

const FICHA_FIELDS: [keyof Ficha, string][] = [
  ["interes", "Motivo de interés"],
  ["objecion", "Objeción principal"],
  ["info", "Información enviada"],
  ["seguimiento", "Seguimiento"],
];

const FichaBand: React.FC<{f: number}> = ({f}) => {
  const sc = sceneAt(f);
  if (sc < 1 || sc > 4) return null;
  const opener = TL.find((l) => l.scene === sc)!;
  const a = tw(f, opener.end + 10, 16);
  const fi = fichaAt(f);
  const client = PEOPLE[clientOf(sc) as CWho];
  return (
    <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 92, background: C.white, borderTop: `1.5px solid ${C.sand}`, display: "flex", alignItems: "center", padding: "0 56px", gap: 30, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
      <div style={{width: 200, fontFamily: SANS, lineHeight: 1.2}}>
        <div style={{fontWeight: 700, fontSize: 16, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold}}>Registro</div>
        <div style={{fontSize: 20, color: C.navy, fontWeight: 500}}>{client.short}</div>
      </div>
      {FICHA_FIELDS.map(([k, label]) => {
        const v = fi[k];
        const on = v ? tw(f, v.at + 6, 12) : 0;
        return (
          <div key={k} style={{flex: 1, display: "flex", gap: 10, alignItems: "flex-start", borderLeft: `1.5px solid ${C.sand}`, paddingLeft: 18, height: 64}}>
            <svg width={24} height={24} viewBox="-12 -12 24 24" style={{flex: "none", marginTop: 2}}>
              <circle r={10.5} fill={on > 0.5 ? C.gold : "none"} stroke={on > 0.5 ? C.gold : C.sand} strokeWidth={2} />
              <DrawCtx.Provider value={on}>
                <Check x={0} y={0} s={0.55} color={C.white} />
              </DrawCtx.Provider>
            </svg>
            <div style={{fontFamily: SANS, lineHeight: 1.15}}>
              <div style={{fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted}}>{label}</div>
              <div style={{fontSize: 19, color: v ? C.navy : C.muted, fontWeight: 500, marginTop: 4, opacity: v ? 0.3 + on * 0.7 : 1}}>{v ? v.v : "—"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Pausas de la narradora                                              */
/* ------------------------------------------------------------------ */

type PV = React.FC<{f: number; l: LineT}>;

const PhasesBig: PV = ({f, l}) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 46}}>
    <div style={{display: "flex", alignItems: "center"}}>
      {PHASES.map((s, k) => {
        const a = tw(f, wordAt(l, PHASE_WORDS[k]) - 4, 12);
        return (
          <React.Fragment key={s}>
            {k > 0 && <div style={{width: 70, height: 3, background: C.navy, transformOrigin: "left", transform: `scaleX(${a})`}} />}
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
              <div style={{width: 128, height: 128, borderRadius: 70, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center"}}>
                <svg width={70} height={70} viewBox="-13 -13 26 26">
                  <g stroke={C.yellow} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {PHASE_ICON[s]}
                  </g>
                </svg>
              </div>
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: C.navy}}>{s}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
    <div style={{opacity: tw(f, wordAt(l, "pregunta") - 6, 12), fontFamily: SANS, fontSize: 30, color: C.ink, display: "flex", alignItems: "center", gap: 14}}>
      <span style={{display: "inline-flex", width: 46, height: 46, borderRadius: 30, border: `3px solid ${C.gold}`, color: C.gold, fontWeight: 700, alignItems: "center", justifyContent: "center", fontSize: 30}}>?</span>
      Primero <b style={{color: C.navy}}>pregunta</b>, después ofrece
    </div>
  </div>
);

const SC_INFO: Record<number, {sub: string}> = {
  1: {sub: "58 años · no conoce a Andrés"},
  2: {sub: "45 años · ya escuchó la opción y el costo"},
  3: {sub: "71 años · ya conoce el plan"},
  4: {sub: "Jueves, 6:00 p. m. · como quedaron"},
};

const SceneCard: PV = ({f, l}) => {
  const n = SCENE_OPENERS[l.id];
  const s = SCENES[n - 1];
  const who = s.client as CWho;
  const a = tw(f, l.from, 14);
  const b = tw(f, l.from + 12, 14);
  return (
    <div style={{display: "flex", alignItems: "center", gap: 60}}>
      <div style={{width: 280, height: 320, overflow: "hidden", borderRadius: 24, background: C.white, border: `2px solid ${C.sand}`}}>
        <div style={{transform: "scale(0.56)", transformOrigin: "-16px 8px"}}>
          <Client who={who} draw={tw(f, l.from + 4, 40, EASE_IO)} face={NEUTRAL} talk={0} blinkV={blink(f, 12)} />
        </div>
      </div>
      <div style={{opacity: a, transform: `translateX(${(1 - a) * 20}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold}}>Llamada {n} de 4</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 84, color: C.navy, marginTop: 6, letterSpacing: "-0.01em"}}>{s.title}</div>
        <div style={{opacity: b, marginTop: 18}}>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: C.ink}}>{PEOPLE[who].name}</div>
          <div style={{fontFamily: SANS, fontSize: 26, color: C.stone, marginTop: 6}}>{SC_INFO[n].sub}</div>
        </div>
        <div style={{display: "flex", gap: 10, marginTop: 30, opacity: b}}>
          {[1, 2, 3, 4].map((k) => (
            <div key={k} style={{width: k === n ? 44 : 14, height: 14, borderRadius: 8, background: k <= n ? C.navy : C.sand}} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Permiso: PV = ({f, l}) => {
  const a = tw(f, wordAt(l, "permiso") - 4, 14);
  const b = tw(f, wordAt(l, "razón") - 2, 14);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 34}}>
      <div style={{opacity: a, transform: `scale(${0.95 + a * 0.05})`, padding: "26px 46px", borderRadius: 22, border: `3px solid ${C.navy}`, background: C.white, fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: C.navy}}>«¿Me permite hacerle un par de preguntas?»</div>
      <svg width={40} height={50} viewBox="0 0 40 50" style={{opacity: b}}>
        <path d="M20,4 V40 M8,30 L20,44 L32,30" stroke={C.gold} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{opacity: b, transform: `translateY(${(1 - b) * 14}px)`, textAlign: "center"}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold}}>Y explica para qué</div>
        <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: C.ink, marginTop: 10}}>«No quiero llenarle de información que quizá no necesita»</div>
      </div>
    </div>
  );
};

const TresPreguntas: PV = ({f, l}) => {
  const qs: [string, number][] = [
    ["¿Ya lo había pensado?", wordAt(l, "pensado")],
    ["¿A quién quiere proteger?", wordAt(l, "quién")],
    ["¿Qué necesita resolver?", wordAt(l, "necesita")],
  ];
  const s = tw(f, wordAt(l, "sabe") - 4, 12);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 50}}>
      <div style={{display: "flex", gap: 30}}>
        {qs.map(([q, at], k) => {
          const a = tw(f, at - 6, 12);
          return (
            <div key={k} style={{width: 400, padding: "28px 30px", borderRadius: 22, border: `3px solid ${C.navy}`, background: C.white, opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
              <div style={{width: 52, height: 52, borderRadius: 30, background: C.navy, color: C.yellow, fontFamily: SERIF, fontWeight: 700, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center"}}>{k + 1}</div>
              <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: C.navy, marginTop: 18, lineHeight: 1.12}}>{q}</div>
            </div>
          );
        })}
      </div>
      <div style={{opacity: s, transform: `translateY(${(1 - s) * 14}px)`, padding: "14px 28px", borderRadius: 40, background: C.navy, color: C.white, fontFamily: SANS, fontSize: 30, fontWeight: 500}}>Ahora Andrés sabe qué ofrecerle</div>
    </div>
  );
};

/** Objeción en grande y cómo la trata Andrés. */
const ObjCard: React.FC<{f: number; at: number; obj: string; how: string; howAt: number; size?: number}> = ({f, at, obj, how, howAt, size = 64}) => {
  const a = tw(f, at, 14);
  const b = tw(f, howAt, 12);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 30}}>
      <div style={{opacity: a, transform: `scale(${0.94 + a * 0.06})`, padding: "26px 46px", borderRadius: 22, border: `3px solid ${C.gold}`, background: C.white, textAlign: "center"}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold}}>Objeción</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, color: C.navy, marginTop: 8}}>«{obj}»</div>
      </div>
      <div style={{opacity: b, transform: `translateY(${(1 - b) * 14}px)`, display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 40, background: C.navy, color: C.white, fontFamily: SANS, fontSize: 30, fontWeight: 500}}>
        <svg width={30} height={30} viewBox="-15 -15 30 30">
          <DrawCtx.Provider value={tw(f, howAt + 6, 10)}>
            <Check x={0} y={0} s={0.9} color={C.yellow} />
          </DrawCtx.Provider>
        </svg>
        {how}
      </div>
    </div>
  );
};

/** Sí / no, en renglones. */
const YesNo: React.FC<{f: number; rows: [boolean, string, number][]; width?: number}> = ({f, rows, width = 1000}) => (
  <div style={{width, display: "flex", flexDirection: "column", gap: 4}}>
    {rows.map(([ok, t, at], k) => {
      const v = tw(f, at - 4, 12);
      const s = tw(f, at + 6, 12);
      return (
        <div key={k} style={{display: "flex", alignItems: "center", gap: 24, padding: "16px 0", borderBottom: `1.5px solid ${C.sand}`, opacity: v, transform: `translateY(${(1 - v) * 12}px)`}}>
          <svg width={48} height={48} viewBox="-24 -24 48 48" style={{flex: "none"}}>
            <circle r={21} fill={ok ? C.navy : "none"} stroke={ok ? C.navy : C.rust} strokeWidth={3} />
            {ok ? (
              <DrawCtx.Provider value={s}>
                <Check x={0} y={0} s={1.05} color={C.yellow} />
              </DrawCtx.Provider>
            ) : (
              <path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke={C.rust} strokeWidth={4} strokeLinecap="round" opacity={s} />
            )}
          </svg>
          <span style={{position: "relative", fontFamily: ok ? SERIF : SANS, fontWeight: ok ? 700 : 400, fontSize: ok ? 42 : 36, color: ok ? C.navy : C.stone}}>
            {t}
            {!ok && <span style={{position: "absolute", left: -6, right: -6, top: "52%", height: 4, background: C.rust, transformOrigin: "left", transform: `scaleX(${s})`}} />}
          </span>
        </div>
      );
    })}
  </div>
);

const FichaBig: PV = ({f, l}) => {
  const fi = fichaAt(l.from);
  const at: Record<keyof Ficha, number> = {interes: wordAt(l, "motivo"), objecion: wordAt(l, "objeción"), info: wordAt(l, "información"), seguimiento: wordAt(l, "fecha")};
  const no = tw(f, wordAt(l, "pedir") - 4, 12);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 34}}>
      <div style={{width: 1100, padding: "26px 40px", borderRadius: 22, border: `2.5px solid ${C.navy}`, background: C.white}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10}}>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: C.navy}}>Registro · Sra. Morales</div>
          <div style={{fontFamily: SANS, fontSize: 20, color: C.stone}}>Al colgar</div>
        </div>
        {FICHA_FIELDS.map(([k, label]) => {
          const v = tw(f, at[k] - 4, 12);
          return (
            <div key={k} style={{display: "grid", gridTemplateColumns: "360px 1fr", alignItems: "center", padding: "13px 0", borderTop: `1.5px solid ${C.sand}`, opacity: 0.3 + v * 0.7}}>
              <span style={{fontFamily: SANS, fontSize: 22, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: v > 0.5 ? C.gold : C.muted}}>{label}</span>
              <span style={{fontFamily: SANS, fontSize: 30, color: C.navy, fontWeight: 500, opacity: v}}>{fi[k]?.v}</span>
            </div>
          );
        })}
      </div>
      <div style={{opacity: no, transform: `translateY(${(1 - no) * 14}px)`, display: "flex", alignItems: "center", gap: 14, padding: "12px 26px", borderRadius: 40, border: `2.5px solid ${C.rust}`, color: C.rust, fontFamily: SANS, fontSize: 28, fontWeight: 500, background: C.white}}>
        Pedir información no significa que ya decidió
      </div>
    </div>
  );
};

const Cumplio: PV = ({f, l}) => {
  const nodes: [string, string, number][] = [
    ["Llamada 1", "Acordaron: jueves, 6:00 p. m.", wordAt(l, "acordó")],
    ["Jueves, 6:00", "Andrés marcó como quedaron", wordAt(l, "marcó")],
    ["Sábado, 11:00", "Cita presencial", wordAt(l, "cita")],
  ];
  const W = 1200;
  return (
    <div style={{position: "relative", width: W, height: 300}}>
      <div style={{position: "absolute", left: 100, right: 100, top: 58, height: 4, background: C.sand}} />
      <div style={{position: "absolute", left: 100, top: 58, height: 4, width: (W - 200) * tw(f, nodes[0][2], nodes[2][2] - nodes[0][2], EASE_IO), background: C.navy}} />
      {nodes.map(([t, sub, at], k) => {
        const a = tw(f, at - 4, 12);
        return (
          <div key={k} style={{position: "absolute", left: 100 + k * ((W - 200) / 2) - 150, width: 300, top: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.25 + a * 0.75}}>
            <svg width={120} height={120} viewBox="-60 -60 120 120">
              <circle r={50} fill={a > 0.5 ? C.navy : C.white} stroke={C.navy} strokeWidth={4} />
              <DrawCtx.Provider value={tw(f, at + 4, 12)}>
                <Check x={0} y={0} s={2} color={C.yellow} />
              </DrawCtx.Provider>
            </svg>
            <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: C.navy, marginTop: 12}}>{t}</div>
            <div style={{fontFamily: SANS, fontSize: 24, color: C.stone, marginTop: 6, textAlign: "center"}}>{sub}</div>
          </div>
        );
      })}
    </div>
  );
};

const RULES: [string, string][] = [
  ["Pregunte antes de ofrecer", "pregunte"],
  ["Escuche más y hable con propósito", "escuche"],
  ["No discuta las objeciones: comprensión, no presión", "discuta"],
  ["No prometa lo que no está confirmado", "prometa"],
  ["No confunda interés con venta", "confunda"],
  ["Registre los compromisos", "registre"],
  ["Cierre con un siguiente paso claro", "cierre"],
];

const Reglas: PV = ({f, l}) => (
  <div style={{width: 1240, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 50, rowGap: 14}}>
    {RULES.map(([t, w], k) => {
      const at = wordAt(l, w);
      const a = tw(f, at - 6, 12);
      return (
        <div key={k} style={{display: "flex", alignItems: "center", gap: 18, padding: "14px 22px", borderRadius: 18, background: a > 0.5 ? C.white : "transparent", border: `2px solid ${a > 0.5 ? C.navy : C.sand}`, opacity: 0.3 + a * 0.7, gridColumn: k === 6 ? "1 / span 2" : undefined, justifySelf: k === 6 ? "center" : undefined, width: k === 6 ? 600 : undefined}}>
          <div style={{width: 46, height: 46, flex: "none", borderRadius: 26, background: a > 0.5 ? C.navy : C.white, border: `2.5px solid ${C.navy}`, color: a > 0.5 ? C.yellow : C.navy, fontFamily: SERIF, fontWeight: 700, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center"}}>{k + 1}</div>
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 31, color: C.navy, lineHeight: 1.15}}>{t}</div>
        </div>
      );
    })}
  </div>
);

const PAUSE_VISUAL: Record<string, PV> = {
  n02: PhasesBig,
  n03: SceneCard,
  n04: Permiso,
  n05: TresPreguntas,
  n06: ({f, l}) => <ObjCard f={f} at={l.from} obj="Lo tengo que consultar con mi familia" size={56} how="Ayudarle a llevar la información a su casa" howAt={wordAt(l, "ayuda")} />,
  n07: FichaBig,
  n08: SceneCard,
  n09: ({f, l}) => (
    <YesNo
      f={f}
      rows={[
        [false, "Discutir", wordAt(l, "discutió")],
        [false, "Presionar", wordAt(l, "presionó")],
        [true, "Dejar la puerta abierta", wordAt(l, "puerta")],
        [true, "«Márqueme en unos meses»", wordAt(l, "pidió")],
      ]}
    />
  ),
  n10: SceneCard,
  n11: ({f, l}) => (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 20}}>
      <div style={{opacity: tw(f, l.from, 14), fontFamily: SERIF, fontWeight: 700, fontSize: 50, color: C.navy}}>«¿Lo puedo usar antes de terminar de pagar?»</div>
      <YesNo
        f={f}
        width={900}
        rows={[
          [false, "Adivinar la respuesta", wordAt(l, "adivinó")],
          [false, "Prometer una cobertura", wordAt(l, "prometió")],
          [true, "Revisar juntos las condiciones", wordAt(l, "revisar")],
        ]}
      />
    </div>
  ),
  n12: SceneCard,
  n13: Cumplio,
  n14: Reglas,
};

const PAUSE_KICKER: Record<string, string> = {
  n02: "El orden",
  n04: "Fíjese",
  n05: "Descubrir",
  n06: "Objeción",
  n07: "Registrar",
  n09: "Sin venta",
  n11: "La pregunta difícil",
  n13: "Cumplir lo acordado",
  n14: "Reglas de oro",
  n15: "Para cerrar",
};

/** Capa de pausa: el escenario queda atrás y la narradora explica. */
const PauseLayer: React.FC<{f: number}> = ({f}) => {
  const last = [...TL].reverse().find((x) => x.who === "N" && x.id !== "n01" && x.from <= f);
  if (!last) return null;
  // n14 y n15 van seguidas: la capa no sale entre las dos.
  const holds = last.id === "n15" || last.id === "n14";
  const a = (last.id === "n15" ? 1 : tw(f, last.from - 10, 12)) * (holds ? 1 : 1 - tw(f, last.end + 4, 10));
  if (a <= 0) return null;
  const V = PAUSE_VISUAL[last.id];
  const sc = SCENE_OPENERS[last.id];
  const kicker = sc ? `Llamada ${sc}` : PAUSE_KICKER[last.id];
  const swap = last.id === "n15" ? 1 : 0;
  const inner = last.id === "n15" ? tw(f, last.from - 4, 12) : last.id === "n14" ? 1 - tw(f, last.end + 4, 10) : 1;
  return (
    <AbsoluteFill style={{opacity: a}}>
      <AbsoluteFill style={{top: 96, background: C.cream, opacity: 0.95}} />
      <div style={{position: "absolute", top: 140, left: 0, right: 0, display: "flex", justifyContent: "center"}}>
        <div style={{display: "flex", alignItems: "center", gap: 12, padding: "8px 20px 8px 14px", borderRadius: 30, border: `2px solid ${C.gold}`, color: C.gold, fontFamily: SANS, fontWeight: 700, fontSize: 19, letterSpacing: "0.12em", textTransform: "uppercase"}}>
          <svg width={20} height={20} viewBox="0 0 20 20">
            <rect x={4} y={3} width={4} height={14} rx={1.5} fill={C.gold} />
            <rect x={12} y={3} width={4} height={14} rx={1.5} fill={C.gold} />
          </svg>
          {sc ? kicker : `Pausa · ${kicker}`}
        </div>
      </div>
      {swap ? (
        <div style={{position: "absolute", top: 300, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: inner}}>
          <Spoken l={last} f={f} size={70} serif align="center" width={1400} rows={4} />
        </div>
      ) : (
        <>
          <div style={{position: "absolute", top: 230, bottom: 300, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: inner}}>{V && <V f={f} l={last} />}</div>
          <div style={{position: "absolute", left: 260, right: 260, bottom: 70, display: "flex", justifyContent: "center", opacity: inner}}>
            <Spoken l={last} f={f} size={40} serif align="center" width={1400} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/** La narración de apertura va arriba, en serif, sin pausar el escenario. */
const OpeningNarration: React.FC<{f: number}> = ({f}) => {
  const l = byId("n01");
  const a = tw(f, l.from - 4, 12) * (1 - tw(f, l.end + 4, 10));
  if (a <= 0) return null;
  return (
    <div style={{position: "absolute", top: 180, left: 260, right: 260, opacity: a, display: "flex", justifyContent: "center"}}>
      <Spoken l={l} f={f} size={46} serif align="center" width={1400} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Portada y cierre                                                     */
/* ------------------------------------------------------------------ */

const Title: React.FC<{f: number}> = ({f}) => {
  const out = tw(f, INTRO - 16, 18, EASE_IO);
  const a = tw(f, 4, 18);
  const b = tw(f, 14, 18);
  const c = tw(f, 26, 18);
  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
      <Img src={staticFile("brand/logo_negro.svg")} style={{height: 92, opacity: a, marginBottom: 54}} />
      <div style={{opacity: a, fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.16em", textTransform: "uppercase", color: C.gold}}>Guion de práctica para asesores</div>
      <div style={{opacity: b, transform: `translateY(${(1 - b) * 20}px)`, fontFamily: SERIF, fontWeight: 700, fontSize: 132, color: C.navy, marginTop: 16, letterSpacing: "-0.01em"}}>Script de ventas</div>
      <div style={{opacity: c, fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: C.stone, marginTop: 10}}>Lo que hace en cada llamada quien más vende</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  const start = TL[TL.length - 1].end + 10;
  const a = tw(f, start, 18);
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{background: C.cream, opacity: a, alignItems: "center", justifyContent: "center"}}>
      <Img src={staticFile("brand/logo_negro.svg")} style={{height: 120, transform: `scale(${0.96 + a * 0.04})`}} />
      <div style={{marginTop: 50, fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: C.navy, opacity: tw(f, start + 10, 16)}}>Abrir · Descubrir · Presentar · Acordar</div>
      <div style={{marginTop: 14, fontFamily: SANS, fontSize: 26, color: C.stone, opacity: tw(f, start + 18, 16)}}>Planes de previsión funeraria · Script de ventas telefónicas</div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Audio                                                                */
/* ------------------------------------------------------------------ */

const Soundtrack: React.FC = () => (
  <>
    {TL.map((l) => (
      <Sequence key={l.id} from={l.from} durationInFrames={l.len + 4} layout="none">
        <Audio src={staticFile(`audio/ventas/${l.id}.wav`)} />
      </Sequence>
    ))}
    {TL.filter((l) => l.who === "N" && l.id !== "n01" && l.id !== "n15").map((l) => (
      <Sequence key={"w" + l.id} from={l.from - 12} durationInFrames={40} layout="none">
        <Audio src={staticFile("audio/sfx-whoosh.mp3")} volume={0.18} />
      </Sequence>
    ))}
    <Sequence from={TL[TL.length - 1].end + 8} durationInFrames={90} layout="none">
      <Audio src={staticFile("audio/sfx-logo.mp3")} volume={0.35} />
    </Sequence>
    <Audio
      src={staticFile("audio/music.mp3")}
      loop
      volume={(fr) => {
        const base = speakingAt(fr) ? 0.05 : 0.11;
        return base * interpolate(fr, [0, 20, TOTAL - 60, TOTAL], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
      }}
    />
  </>
);

/* ------------------------------------------------------------------ */

export const ScriptVentas: React.FC = () => {
  const f = useCurrentFrame();
  const header = tw(f, byId("n01").from + 20, 20);
  const sp = lineAt(f);
  const obj = objectionAt(f);
  return (
    <AbsoluteFill style={{background: C.cream, fontFamily: SANS}}>
      {f < INTRO + 10 && <Title f={f} />}
      <Stage f={f} />
      <InsertLayer f={f} />
      <Intros f={f} />
      <OpeningNarration f={f} />
      {sp && sp.who !== "N" && <SpeechCard key={sp.id} l={sp} f={f} />}
      {obj && sp && sp.who !== "N" && (
        <div style={{position: "absolute", top: 118, left: 0, right: 0, display: "flex", justifyContent: "center"}}>
          <div style={{padding: "6px 18px", borderRadius: 20, background: C.goldSoft, color: C.gold, fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase"}}>Objeción · «{obj}»</div>
        </div>
      )}
      <FichaBand f={f} />
      <PauseLayer f={f} />
      <Header f={f} show={header} />
      <EndCard f={f} />
      <Soundtrack />
    </AbsoluteFill>
  );
};

export {TOTAL};
