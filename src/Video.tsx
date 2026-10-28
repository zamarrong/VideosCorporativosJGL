import React from "react";
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {C, FPS, SANS, SERIF} from "./theme";
import {Mariana, RAMIRO_FACE, Ramiro, blink, mixFace} from "./characters";
import {INSERTS, INS_H, INS_W, Slot} from "./inserts";
import {Check, Circ, DrawCtx, P} from "./draw";
import {METHOD, MOOD, OBJECTIONS, Step} from "./script";
import {
  EASE_IO,
  INTRO,
  LineT,
  MOOD_KEYS,
  TL,
  TOTAL,
  Tok,
  byId,
  insertAt,
  lineAt,
  moodAt,
  objectionAt,
  openAt,
  sentencesOf,
  speakingAt,
  stepsAt,
  tokensOf,
  tw,
  voiceAt,
} from "./timeline";
import {wordAt} from "./inserts";

/* ------------------------------------------------------------------ */
/* Encabezado: logo, riel del método y disposición del cliente          */
/* ------------------------------------------------------------------ */

const STEP_ICON: Record<Step, React.ReactNode> = {
  Escuchar: <path d="M-4,-8 Q6,-12 8,-2 Q9,6 2,8 Q-2,9 -2,5 M-8,-4 Q-8,-14 2,-14" />,
  Validar: <path d="M-7,0 L-2,6 L8,-6" />,
  Reencuadrar: <path d="M-9,-9 H-3 M-9,-9 V-3 M9,9 H3 M9,9 V3 M9,-9 H3 M9,-9 V-3 M-9,9 H-3 M-9,9 V3" />,
  Preguntar: <path d="M-5,-6 Q-5,-11 0,-11 Q6,-11 6,-6 Q6,-2 0,0 V3 M0,8 V8.5" />,
};

const StepPill: React.FC<{s: Step; on: number; flash: number}> = ({s, on, flash}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 18px 9px 12px",
      borderRadius: 30,
      border: `2px solid ${on > 0.5 ? C.navy : C.sand}`,
      background: on > 0.5 ? C.navy : C.white,
      color: on > 0.5 ? C.white : C.stone,
      fontFamily: SANS,
      fontWeight: 500,
      fontSize: 21,
      transform: `scale(${1 + flash * 0.08})`,
    }}
  >
    <svg width={26} height={26} viewBox="-13 -13 26 26">
      <g stroke={on > 0.5 ? C.yellow : C.muted} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {STEP_ICON[s]}
      </g>
    </svg>
    {s}
  </div>
);

/** En la narración del método, cada paso se enciende cuando se nombra. */
const n02Steps = (f: number): Step[] | null => {
  const l = byId("n02");
  if (f < l.from || f > l.end + 10) return null;
  const names = ["escuchar", "validar", "reencuadrar", "preguntar"];
  return METHOD.filter((_, k) => f >= wordAt(l, names[k]));
};

const Header: React.FC<{f: number; show: number}> = ({f, show}) => {
  const n02 = n02Steps(f);
  const {steps, since} = stepsAt(f);
  const on = n02 ?? steps;
  const open = openAt(f);
  const mood = moodAt(f);
  const hasMood = f >= MOOD_KEYS[0].f;
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 96, display: "flex", alignItems: "center", padding: "0 56px", gap: 28, opacity: show, transform: `translateY(${(1 - show) * -20}px)`, borderBottom: `1.5px solid ${C.sand}`, background: C.cream}}>
      <Img src={staticFile("brand/logo_negro.svg")} style={{height: 46}} />
      <div style={{width: 1.5, height: 40, background: C.sand}} />
      <div style={{fontFamily: SANS, fontSize: 20, color: C.stone, lineHeight: 1.2}}>
        Guion de práctica
        <br />
        <span style={{color: C.navy, fontWeight: 700}}>Cliente difícil</span>
      </div>
      <div style={{flex: 1, display: "flex", justifyContent: "center", gap: 12}}>
        {METHOD.map((s) => {
          const lit = on.includes(s) ? 1 : 0;
          const fl = lit ? interpolate(f - (n02 ? f : since), [0, 6, 14], [0, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : 0;
          return <StepPill key={s} s={s} on={lit} flash={n02 ? 0 : fl} />;
        })}
      </div>
      <div style={{width: 330, opacity: hasMood ? 1 : 0.35}}>
        <div style={{display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 16, color: C.stone, marginBottom: 7}}>
          <span>Cliente</span>
          <span style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: C.gold}}>{hasMood ? MOOD[mood].label : "—"}</span>
        </div>
        <div style={{position: "relative", height: 12, borderRadius: 8, background: C.cream2, border: `1.5px solid ${C.sand}`}}>
          <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${open * 100}%`, borderRadius: 8, background: C.navy}} />
          <div style={{position: "absolute", left: `calc(${open * 100}% - 9px)`, top: -5, width: 18, height: 18, borderRadius: 10, background: C.yellow, border: `2.5px solid ${C.navy}`}} />
        </div>
        <div style={{display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 14, color: C.muted, marginTop: 5}}>
          <span>Cerrado</span>
          <span>Abierto</span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Texto que se va diciendo                                             */
/* ------------------------------------------------------------------ */

const Word: React.FC<{k: Tok; f: number; size: number; serif?: boolean}> = ({k, f, size, serif}) => {
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
    <span
      style={{
        position: "relative",
        display: "inline-block",
        marginRight: "0.26em",
        color: k.key ? C.navy : C.ink,
        fontWeight: k.key ? 700 : serif ? 400 : 400,
        opacity: 0.22 + on * 0.78,
      }}
    >
      {k.t}
      {k.key && <span style={{position: "absolute", left: 0, bottom: size * 0.02, height: size * 0.09, width: `${u * 100}%`, background: C.yellow, opacity: 0.85, zIndex: -1}} />}
    </span>
  );
};

/** Muestra la frase que suena; la anterior sube y se desvanece. */
const Spoken: React.FC<{l: LineT; f: number; size: number; serif?: boolean; align?: "left" | "center" | "right"; width: number}> = ({l, f, size, serif, align = "left", width}) => {
  const sents = React.useMemo(() => sentencesOf(tokensOf(l)), [l]);
  let idx = 0;
  sents.forEach((s, k) => {
    if (f >= s[0].s - 6) idx = k;
  });
  return (
    <div style={{position: "relative", width, height: size * 1.25 * 4}}>
      {sents.map((s, k) => {
        if (k < idx - 1 || k > idx) return null;
        const start = s[0].s - 6;
        const a = k === idx ? tw(f, start, 10) : 1 - tw(f, sents[idx][0].s - 6, 10);
        const y = k === idx ? (1 - a) * 26 : -(1 - a) * 30;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              textAlign: align,
              fontFamily: serif ? SERIF : SANS,
              fontSize: size,
              lineHeight: 1.25,
              letterSpacing: serif ? 0 : "-0.01em",
              opacity: a,
              transform: `translateY(${y}px)`,
              textWrap: "pretty" as never,
            }}
          >
            {s.map((t, j) => (
              <Word key={j} k={t} f={f} size={size} serif={serif} />
            ))}
          </div>
        );
      })}
    </div>
  );
};

/** Tarjeta de diálogo: del lado de quien habla. */
const SpeechCard: React.FC<{l: LineT; f: number}> = ({l, f}) => {
  const isM = l.who === "M";
  const a = tw(f, l.from - 4, 10) * (1 - tw(f, l.end + 6, 8));
  const name = isM ? "Mariana · Asesora" : "Sr. Torres · Cliente";
  const color = isM ? C.navy : C.gold;
  const W = 1160;
  return (
    <div style={{position: "absolute", top: 172, left: isM ? 70 : 1920 - 70 - W, width: W, opacity: a, transform: `translateX(${(1 - a) * (isM ? -24 : 24)}px)`}}>
      <div style={{display: "flex", alignItems: "center", gap: 14, justifyContent: isM ? "flex-start" : "flex-end", marginBottom: 14}}>
        <span style={{width: 12, height: 12, borderRadius: 7, background: color}} />
        <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: "0.08em", textTransform: "uppercase", color}}>{name}</span>
        {l.tag && <span style={{fontFamily: SANS, fontSize: 20, color: C.stone}}>· {l.tag}</span>}
        {l.mood && <span style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: C.stone}}>({MOOD[l.mood].label})</span>}
      </div>
      <Spoken l={l} f={f} size={isM ? 44 : 46} align={isM ? "left" : "right"} width={W} />
      {l.note && (
        <div style={{position: "absolute", top: 300, left: isM ? 0 : undefined, right: isM ? undefined : 0, display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontSize: 19, color: C.gold, opacity: tw(f, l.from + 20, 12)}}>
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
/* Escenario: personajes, línea telefónica e ilustraciones              */
/* ------------------------------------------------------------------ */

const M_POS = {x: 40, y: 440};
const R_POS = {x: 1320, y: 440};
const LINE_A = {x: 300, y: 610};
const LINE_B = {x: 1690, y: 560};
const LINE_C = {x: 995, y: 300};
const bez = (t: number) => ({
  x: (1 - t) ** 2 * LINE_A.x + 2 * (1 - t) * t * LINE_C.x + t * t * LINE_B.x,
  y: (1 - t) ** 2 * LINE_A.y + 2 * (1 - t) * t * LINE_C.y + t * t * LINE_B.y,
});

/** Línea de la llamada: puntos que viajan desde quien habla. */
const CallLine: React.FC<{f: number; draw: number}> = ({f, draw}) => {
  const sp = speakingAt(f);
  const dir = sp?.who === "M" ? 1 : sp?.who === "R" ? -1 : 0;
  const act = sp && sp.who !== "N" ? voiceAt(f, sp.who) : 0;
  return (
    <svg width={1920} height={1080} style={{position: "absolute", left: 0, top: 0}}>
      <path
        d={`M${LINE_A.x},${LINE_A.y} Q${LINE_C.x},${LINE_C.y} ${LINE_B.x},${LINE_B.y}`}
        fill="none"
        stroke={C.lineSoft}
        strokeWidth={3}
        strokeDasharray="2 12"
        strokeLinecap="round"
        pathLength={1000}
        strokeDashoffset={0}
        style={{clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`}}
      />
      {dir !== 0 &&
        [0, 1, 2, 3].map((k) => {
          const t0 = ((f * 0.012 + k * 0.25) % 1 + 1) % 1;
          const t = dir === 1 ? t0 : 1 - t0;
          const p = bez(t);
          return <circle key={k} cx={p.x} cy={p.y} r={7} fill={sp!.who === "M" ? C.navy : C.gold} opacity={(0.25 + act * 0.75) * Math.sin(t0 * Math.PI)} />;
        })}
    </svg>
  );
};

const Stage: React.FC<{f: number}> = ({f}) => {
  const n01 = byId("n01");
  const drawM = tw(f, n01.from + 10, 70, EASE_IO);
  const drawR = tw(f, wordAt(n01, "señor") - 10, 70, EASE_IO);
  const drawLine = tw(f, wordAt(n01, "señor") + 30, 40, EASE_IO);
  const sp = speakingAt(f);

  // Ramiro: mezcla entre la expresión anterior y la nueva.
  let prev = RAMIRO_FACE.seco;
  let face = RAMIRO_FACE.seco;
  for (const l of TL) {
    if (!l.mood || l.from > f) continue;
    const t = tw(f, l.from - 4, 14, EASE_IO);
    face = mixFace(prev, RAMIRO_FACE[l.mood], t);
    prev = RAMIRO_FACE[l.mood];
  }
  const open = openAt(f);
  const rTalk = voiceAt(f, "R") * (0.45 + 0.55 * Math.abs(Math.sin(f * 0.85)));
  const mTalk = voiceAt(f, "M") * (0.4 + 0.6 * Math.abs(Math.sin(f * 0.95 + 1)));

  // Mariana escucha: asiente despacio mientras él habla; se pone seria cuando él cuenta lo de su papá.
  const listening = sp?.who === "R" ? 1 : 0;
  const nod = listening * Math.sin(f / 9) * 1.6;
  const r06 = byId("r06");
  const sad = tw(f, r06.from, 20) * (1 - tw(f, byId("m08").from, 30));
  const mFace = {brow: 0.1 + sad * 0.5, mouth: 0.42 - listening * 0.18 - sad * 0.3, eye: 1, tilt: listening * 2 + sad * 3, lean: 0};

  // Cámara: se acerca un poco a quien habla.
  const target = sp?.who === "M" ? -1 : sp?.who === "R" ? 1 : 0;
  const ins = insertAt(f);
  const camX = interpolate(target, [-1, 1], [26, -26]) * (ins ? 0.3 : 1);
  const scale = 1 + (target !== 0 ? 0.025 : 0);

  return (
    <div style={{position: "absolute", inset: 0, transform: `translateX(${camX}px) scale(${scale})`, transformOrigin: "50% 100%"}}>
      <CallLine f={f} draw={drawLine} />
      <div style={{position: "absolute", left: M_POS.x, top: M_POS.y}}>
        <Mariana draw={drawM} face={mFace} talk={mTalk} blinkV={blink(f, 0)} nod={nod} />
      </div>
      <div style={{position: "absolute", left: R_POS.x, top: R_POS.y}}>
        <Ramiro draw={drawR} face={face} talk={rTalk} blinkV={blink(f, 47)} tense={Math.max(0, 1 - open * 2.4)} />
      </div>
    </div>
  );
};

/** Ilustración vigente, con fundido de entrada y salida. */
const InsertLayer: React.FC<{f: number}> = ({f}) => {
  const cur = insertAt(f);
  // Al terminar, la anterior sale con fundido en 10 cuadros.
  const prev = cur ? undefined : insertAt(f - 10);
  const show = cur ?? prev;
  if (!show) return null;
  const Comp = INSERTS[show.insert];
  const a = tw(f, show.owner.from, 12) * (cur ? 1 : 1 - tw(f, lineAt(f)!.from, 10));
  return (
    <div style={{position: "absolute", left: (1920 - INS_W) / 2, top: 520, width: INS_W, height: INS_H, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
      <Comp f={f} owner={show.owner} reply={show.reply} />
    </div>
  );
};

/** Presentación de los personajes (primera línea de la narradora). */
const Intros: React.FC<{f: number}> = ({f}) => {
  const n01 = byId("n01");
  const aM = tw(f, wordAt(n01, "mariana"), 14);
  const aR = tw(f, wordAt(n01, "cincuenta"), 14);
  const out = 1 - tw(f, n01.end, 12);
  const tag = (title: string, sub: string, a: number, side: "l" | "r") => (
    <div style={{opacity: a * out, transform: `translateX(${(1 - a) * (side === "l" ? -20 : 20)}px)`, textAlign: side === "l" ? "left" : "right", display: "flex", flexDirection: "column", alignItems: side === "l" ? "flex-start" : "flex-end"}}>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: side === "l" ? C.navy : C.gold}}>{title}</div>
      <div style={{fontFamily: SANS, fontSize: 24, color: C.stone, marginTop: 4}}>{sub}</div>
      <div style={{width: 120, height: 3, background: side === "l" ? C.navy : C.gold, marginTop: 12}} />
    </div>
  );
  return (
    <div style={{position: "absolute", left: 640, width: 640, top: 520, display: "flex", flexDirection: "column", gap: 70}}>
      {tag("Mariana Ruiz", "Asesora de J. García López", aM, "l")}
      {tag("Ramiro Torres", "52 años · casado · dos hijos", aR, "r")}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Pausas de la narradora                                              */
/* ------------------------------------------------------------------ */

const ObjCard: React.FC<{f: number; at: number; n: 1 | 2 | 3; how: string; howAt: number}> = ({f, at, n, how, howAt}) => {
  const a = tw(f, at, 14);
  const b = tw(f, howAt, 12);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 26}}>
      <div style={{opacity: a, transform: `scale(${0.94 + a * 0.06})`, padding: "26px 46px", borderRadius: 22, border: `3px solid ${C.gold}`, background: C.white, textAlign: "center"}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold}}>Objeción {n}</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 72, color: C.navy, marginTop: 8}}>«{OBJECTIONS[n]}»</div>
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

const MethodBig: React.FC<{f: number; l: LineT}> = ({f, l}) => {
  const names = ["escuchar", "validar", "reencuadrar", "preguntar"];
  const atQ = wordAt(l, "abierta");
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 46}}>
      <div style={{display: "flex", alignItems: "center", gap: 0}}>
        {METHOD.map((s, k) => {
          const a = tw(f, wordAt(l, names[k]) - 4, 12);
          return (
            <React.Fragment key={s}>
              {k > 0 && <div style={{width: 70, height: 3, background: C.navy, transformOrigin: "left", transform: `scaleX(${a})`}} />}
              <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
                <div style={{width: 128, height: 128, borderRadius: 70, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <svg width={70} height={70} viewBox="-13 -13 26 26">
                    <g stroke={C.yellow} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
                      {STEP_ICON[s]}
                    </g>
                  </svg>
                </div>
                <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: C.navy}}>{s}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{opacity: tw(f, atQ - 10, 12), fontFamily: SANS, fontSize: 30, color: C.ink, display: "flex", alignItems: "center", gap: 14}}>
        <span style={{display: "inline-flex", width: 46, height: 46, borderRadius: 30, border: `3px solid ${C.gold}`, color: C.gold, fontWeight: 700, alignItems: "center", justifyContent: "center", fontSize: 30}}>?</span>
        Cada respuesta termina con una <b style={{color: C.navy}}>pregunta abierta</b>
      </div>
    </div>
  );
};

const NoPermiso: React.FC<{f: number; l: LineT}> = ({f, l}) => {
  const at = wordAt(l, "dijo");
  const strike = tw(f, at + 34, 14);
  const b = tw(f, wordAt(l, "hizo"), 12);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 30}}>
      <div style={{position: "relative", opacity: tw(f, at, 12), fontFamily: SERIF, fontSize: 70, color: C.stone}}>
        «¿Me permite dos minutos?»
        <div style={{position: "absolute", left: -10, right: -10, top: "52%", height: 6, background: C.rust, transformOrigin: "left", transform: `scaleX(${strike})`}} />
      </div>
      <div style={{opacity: b, transform: `translateY(${(1 - b) * 14}px)`, fontFamily: SERIF, fontWeight: 700, fontSize: 62, color: C.navy}}>«¿Cómo tiene previsto…?»</div>
    </div>
  );
};

const Turn: React.FC<{f: number; l: LineT}> = ({f, l}) => {
  // El medidor en grande: de "cerrado" a "baja la guardia".
  const before = MOOD.defensivo.open;
  const after = MOOD.dolido.open;
  const k = tw(f, wordAt(l, "pregunta") - 4, 30, EASE_IO);
  const v = before + (after - before) * k;
  return (
    <div style={{width: 900}}>
      <div style={{display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 24, color: C.stone, marginBottom: 14}}>
        <span>Cerrado</span>
        <span style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: C.gold}}>{k > 0.5 ? "baja la guardia" : "a la defensiva"}</span>
        <span>Abierto</span>
      </div>
      <div style={{position: "relative", height: 26, borderRadius: 16, background: C.cream2, border: `2px solid ${C.sand}`}}>
        <div style={{position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 16, background: C.navy}} />
        <div style={{position: "absolute", left: `calc(${v * 100}% - 20px)`, top: -9, width: 40, height: 40, borderRadius: 22, background: C.yellow, border: `3.5px solid ${C.navy}`}} />
      </div>
    </div>
  );
};

/** Disposición a lo largo de la llamada (para el cierre). */
const Journey: React.FC<{f: number; l: LineT}> = ({f, l}) => {
  const pts = MOOD_KEYS;
  const t0 = pts[0].f;
  const t1 = pts[pts.length - 1].f;
  const W = 1180;
  const H = 300;
  const X = (fr: number) => ((fr - t0) / (t1 - t0)) * W;
  const Y = (v: number) => H - v * H;
  const d = pts.map((p, k) => `${k ? "L" : "M"}${X(p.f).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");
  const k = tw(f, l.from + 6, 90, EASE_IO);
  // [línea, etiqueta, desplazamiento x, desplazamiento y, ancla]
  const marks: [string, string, number, number, "start" | "middle" | "end"][] = [
    ["r02", "«No me interesa»", 0, 44, "middle"],
    ["r06", "Su papá", -18, -14, "end"],
    ["r10", "«Necesito pensarlo»", 10, 46, "start"],
    ["r13", "Sábado 10:00", 0, -26, "middle"],
  ];
  return (
    <svg width={W + 210} height={H + 110} viewBox={`-130 -60 ${W + 210} ${H + 110}`}>
      <line x1={0} y1={H} x2={W} y2={H} stroke={C.sand} strokeWidth={2} />
      <text x={-14} y={H} textAnchor="end" fontFamily={SANS} fontSize={18} fill={C.muted}>
        Cerrado
      </text>
      <text x={-14} y={8} textAnchor="end" fontFamily={SANS} fontSize={18} fill={C.muted}>
        Abierto
      </text>
      <path d={d} fill="none" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      {marks.map(([id, label, dx, dy, anchor]) => {
        const p = pts.find((x) => x.f === byId(id).from)!;
        const px = X(p.f);
        const vis = tw(f, l.from + 6 + (px / W) * 90, 10);
        return (
          <g key={id} opacity={vis}>
            <circle cx={px} cy={Y(p.v)} r={9} fill={C.yellow} stroke={C.navy} strokeWidth={3} />
            <text x={px + dx} y={Y(p.v) + dy} textAnchor={anchor} fontFamily={SERIF} fontStyle="italic" fontSize={26} fill={C.gold}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Lenguaje: React.FC<{f: number; l: LineT}> = ({f, l}) => {
  const rows: [string, string, number][] = [
    ["«Pero…»", "«Y justamente por eso…»", wordAt(l, "pero")],
    ["«Cuando usted se muera»", "«Llegado el momento»", wordAt(l, "cuando")],
    ["«Tú», «oye»", "«Usted», siempre", wordAt(l, "hable")],
    ["Explicar sin parar", "Responder breve y cerrar con una pregunta", wordAt(l, "responda")],
  ];
  return (
    <div style={{width: 1300}}>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1.3fr", fontFamily: SANS, fontSize: 20, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, paddingBottom: 12, borderBottom: `2px solid ${C.sand}`}}>
        <span>En lugar de…</span>
        <span>Mejor diga…</span>
      </div>
      {rows.map(([a, b, at], k) => {
        const v = tw(f, at - 4, 12);
        const s = tw(f, at + 8, 12);
        return (
          <div key={k} style={{display: "grid", gridTemplateColumns: "1fr 1.3fr", alignItems: "center", padding: "18px 0", borderBottom: `1.5px solid ${C.sand}`, opacity: v, transform: `translateY(${(1 - v) * 12}px)`}}>
            <span style={{position: "relative", justifySelf: "start", fontFamily: SANS, fontSize: 32, color: C.stone}}>
              {a}
              <span style={{position: "absolute", left: -4, right: -4, top: "52%", height: 3, background: C.rust, transformOrigin: "left", transform: `scaleX(${s})`}} />
            </span>
            <span style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: C.navy, opacity: s}}>{b}</span>
          </div>
        );
      })}
    </div>
  );
};

const Parejas: React.FC<{f: number; l: LineT}> = ({f, l}) => {
  const a = tw(f, wordAt(l, "compañero") - 4, 12);
  const b = tw(f, wordAt(l, "usted") - 4, 12);
  const card = (who: string, what: string, v: number, color: string) => (
    <div style={{width: 470, padding: "30px 34px", borderRadius: 20, border: `3px solid ${color}`, background: C.white, opacity: v, transform: `translateY(${(1 - v) * 16}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", color}}>{who}</div>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: C.navy, marginTop: 8, lineHeight: 1.1}}>{what}</div>
    </div>
  );
  return (
    <div style={{display: "flex", alignItems: "center", gap: 40}}>
      {card("Su compañero", "Lee el guion del cliente", a, C.gold)}
      <svg width={90} height={40} viewBox="0 0 90 40" style={{opacity: b}}>
        <path d="M6,20 H82 M68,8 L82,20 L68,32 M22,8 L6,20 L22,32" stroke={C.navy} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {card("Usted", "Responde sin leer", b, C.navy)}
    </div>
  );
};

const PAUSE_VISUAL: Record<string, React.FC<{f: number; l: LineT}>> = {
  n02: MethodBig,
  n03: NoPermiso,
  n04: ({f, l}) => <ObjCard f={f} at={l.from} n={1} how="Primero, validar" howAt={wordAt(l, "primero")} />,
  n05: ({f, l}) => <ObjCard f={f} at={l.from} n={3} how="Darle la razón y hablar de proteger a su familia" howAt={wordAt(l, "razón")} />,
  n06: Turn,
  n07: ({f, l}) => <ObjCard f={f} at={l.from} n={2} how="Aislar la duda" howAt={wordAt(l, "ubicar")} />,
  n08: Journey,
  n09: Lenguaje,
  n10: Parejas,
};

const PAUSE_KICKER: Record<string, string> = {
  n02: "El método",
  n03: "Fíjese",
  n04: "Objeción",
  n05: "Objeción",
  n06: "El giro",
  n07: "Objeción",
  n08: "Lo que pasó",
  n09: "Lenguaje",
  n10: "Para practicar",
};

/** Capa de pausa: el escenario queda atrás y la narradora explica. */
const PauseLayer: React.FC<{f: number}> = ({f}) => {
  const l = lineAt(f);
  const cur = l && l.who === "N" && l.id !== "n01" ? l : undefined;
  // Fundido de salida: busca la última pausa que terminó hace poco.
  const last = [...TL].reverse().find((x) => x.who === "N" && x.id !== "n01" && x.from <= f);
  if (!last) return null;
  const isLast = last.id === "n10";
  const a = tw(f, last.from - 10, 12) * (isLast ? 1 : 1 - tw(f, last.end + 4, 10));
  if (a <= 0) return null;
  const V = PAUSE_VISUAL[last.id];
  void cur;
  return (
    <AbsoluteFill style={{opacity: a}}>
      <AbsoluteFill style={{top: 96, background: C.cream, opacity: 0.94}} />
      <div style={{position: "absolute", top: 140, left: 0, right: 0, display: "flex", justifyContent: "center"}}>
        <div style={{display: "flex", alignItems: "center", gap: 12, padding: "8px 20px 8px 14px", borderRadius: 30, border: `2px solid ${C.gold}`, color: C.gold, fontFamily: SANS, fontWeight: 700, fontSize: 19, letterSpacing: "0.12em", textTransform: "uppercase"}}>
          <svg width={20} height={20} viewBox="0 0 20 20">
            <rect x={4} y={3} width={4} height={14} rx={1.5} fill={C.gold} />
            <rect x={12} y={3} width={4} height={14} rx={1.5} fill={C.gold} />
          </svg>
          Pausa · {PAUSE_KICKER[last.id]}
        </div>
      </div>
      <div style={{position: "absolute", top: 230, bottom: 300, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center"}}>{V && <V f={f} l={last} />}</div>
      <div style={{position: "absolute", left: 260, right: 260, bottom: 70, display: "flex", justifyContent: "center"}}>
        <Spoken l={last} f={f} size={40} serif align="center" width={1400} />
      </div>
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
      <div style={{opacity: b, transform: `translateY(${(1 - b) * 20}px)`, fontFamily: SERIF, fontWeight: 700, fontSize: 132, color: C.navy, marginTop: 16, letterSpacing: "-0.01em"}}>Cliente difícil</div>
      <div style={{opacity: c, fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: C.stone, marginTop: 10}}>De «no me interesa» a una cita con su esposa</div>
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
      <div style={{marginTop: 50, fontFamily: SERIF, fontWeight: 700, fontSize: 56, color: C.navy, opacity: tw(f, start + 10, 16)}}>Escuchar · Validar · Reencuadrar · Preguntar</div>
      <div style={{marginTop: 14, fontFamily: SANS, fontSize: 26, color: C.stone, opacity: tw(f, start + 18, 16)}}>Planes funerarios a futuro · Guion de práctica</div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Audio                                                                */
/* ------------------------------------------------------------------ */

const VOICE_VOL: Record<string, number> = {N: 1, M: 1, R: 1};

const Soundtrack: React.FC = () => (
  <>
    {TL.map((l) => (
      <Sequence key={l.id} from={l.from} durationInFrames={l.len + 4} layout="none">
        <Audio src={staticFile(`audio/${l.id}.wav`)} volume={VOICE_VOL[l.who]} />
      </Sequence>
    ))}
    {/* Pausas de la narradora: whoosh suave al entrar. */}
    {TL.filter((l) => l.who === "N" && l.id !== "n01").map((l) => (
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
        const talking = speakingAt(fr) ? 1 : 0;
        const base = talking ? 0.05 : 0.11;
        return base * interpolate(fr, [0, 20, TOTAL - 60, TOTAL], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
      }}
    />
  </>
);

/* ------------------------------------------------------------------ */

export const ClienteDificil: React.FC = () => {
  const f = useCurrentFrame();
  const n01 = byId("n01");
  const header = tw(f, n01.from + 20, 20);
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
      {obj && sp?.who !== "N" && (
        <div style={{position: "absolute", top: 118, left: 0, right: 0, display: "flex", justifyContent: "center"}}>
          <div style={{padding: "6px 18px", borderRadius: 20, background: C.goldSoft, color: C.gold, fontFamily: SANS, fontWeight: 700, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase"}}>
            Objeción {obj} · «{OBJECTIONS[obj]}»
          </div>
        </div>
      )}
      <PauseLayer f={f} />
      <Header f={f} show={header} />
      <EndCard f={f} />
      <Soundtrack />
    </AbsoluteFill>
  );
};

export {FPS, TOTAL};
void Circ;
void P;
