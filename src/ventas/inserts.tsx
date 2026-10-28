import React from "react";
import {C, SANS, SERIF} from "../theme";
import {Check, Circ, DrawCtx, P, Rect} from "../draw";
import {Card, Draw, Fade, INS_H, INS_W, Label, Option, Row, Slot} from "../inserts";
import {LineT, byId, tw, wordAt} from "./timeline";
import type {Insert} from "./script";

export {INS_H, INS_W};

type Ctx = {f: number; owner: LineT; reply?: LineT};

/** Renglón tachado: lo que el asesor no hace. */
const NoRow: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at, children}) => {
  const a = tw(f, at, 12);
  const s = tw(f, at + 8, 12);
  return (
    <div style={{display: "flex", alignItems: "center", gap: 14, opacity: a, transform: `translateX(${(1 - a) * -16}px)`}}>
      <svg width={30} height={30} viewBox="-15 -15 30 30">
        <circle r={13} fill="none" stroke={C.rust} strokeWidth={2.4} />
        <path d="M-5,-5 L5,5 M5,-5 L-5,5" stroke={C.rust} strokeWidth={2.8} strokeLinecap="round" opacity={s} />
      </svg>
      <span style={{position: "relative", fontFamily: SANS, fontSize: 24, color: C.stone, whiteSpace: "nowrap"}}>
        {children}
        <span style={{position: "absolute", left: -4, right: -4, top: "52%", height: 3, background: C.rust, transformOrigin: "left", transform: `scaleX(${s})`}} />
      </span>
    </div>
  );
};

/** Pastilla azul con el acuerdo. */
const Pill: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
  const a = tw(f, at, 12);
  return (
    <div style={{display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 22px", borderRadius: 14, background: C.navy, color: C.white, fontFamily: SANS, fontSize: 28, fontWeight: 700, whiteSpace: "nowrap", opacity: a, transform: `scale(${0.92 + a * 0.08})`, ...style}}>
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */

/** Descubrir: las tres preguntas y lo que contesta la Sra. Morales. */
const Preguntas: React.FC<Ctx> = ({f}) => {
  const a04 = byId("a04");
  const a05 = byId("a05");
  const a06 = byId("a06");
  const rows: [string, number, string, number][] = [
    ["¿Primera vez?", wordAt(a04, "considerado"), "Sí, la primera vez", wordAt(byId("p03"), "primera")],
    ["¿A quién quiere proteger?", wordAt(a05, "protegerse"), "A su esposo, a ella y a su mamá (82)", wordAt(byId("p04"), "esposo")],
    ["¿Qué necesita resolver?", wordAt(a06, "necesidad"), "Que sus hijos no batallen", wordAt(byId("p05"), "hijos")],
  ];
  return (
    <Card f={f} at={a04.from} title="Antes de ofrecer, preguntar">
      {rows.map(([q, qAt, ans, aAt], k) => {
        const a = tw(f, qAt - 4, 12);
        const b = tw(f, aAt, 12);
        return (
          <div key={k} style={{display: "flex", gap: 16, alignItems: "flex-start", opacity: 0.25 + a * 0.75}}>
            <div style={{width: 34, height: 34, borderRadius: 20, flex: "none", background: b > 0.5 ? C.navy : C.white, border: `2.5px solid ${C.navy}`, color: b > 0.5 ? C.white : C.navy, fontFamily: SANS, fontWeight: 700, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center"}}>{k + 1}</div>
            <div>
              <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 25, color: C.navy}}>{q}</div>
              <div style={{fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: C.gold, marginTop: 2, opacity: b, height: 30}}>{ans}</div>
            </div>
          </div>
        );
      })}
    </Card>
  );
};

/** Presentar: primero repite lo que ella dijo. */
const Necesidad: React.FC<Ctx> = ({f, owner}) => {
  const at = wordAt(owner, "que", 1);
  const u = tw(f, at + 10, 30);
  return (
    <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, textAlign: "center"}}>
      <Fade f={f} at={owner.from} style={{position: "relative"}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold}}>Lo más importante para usted</div>
      </Fade>
      <div style={{opacity: tw(f, at - 4, 14), fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: C.navy, lineHeight: 1.18, width: 620, position: "relative"}}>
        «Que sus hijos no tengan que resolver todo a las carreras»
        <div style={{height: 5, background: C.yellow, width: `${u * 70}%`, margin: "14px auto 0"}} />
      </div>
      <Fade f={f} at={owner.end - 24} style={{position: "relative"}}>
        <Label size={24} color={C.stone}>
          Primero lo que ella dijo, después el plan
        </Label>
      </Fade>
    </div>
  );
};

const SlotRow: React.FC<{f: number; at: number; label: string; slot: string}> = ({f, at, label, slot}) => {
  const a = tw(f, at - 4, 12);
  return (
    <div style={{display: "flex", alignItems: "center", gap: 14, opacity: a, transform: `translateX(${(1 - a) * -14}px)`}}>
      <div style={{width: 200, fontFamily: SANS, fontSize: 23, color: C.stone}}>{label}</div>
      <Slot size={23}>{slot}</Slot>
    </div>
  );
};

/** La opción: todo lo que lleva dato real queda como hueco. */
const Cotizacion: React.FC<Ctx> = ({f}) => {
  const a09 = byId("a09");
  const a10 = byId("a10");
  const chips: [string, number][] = [
    ["Qué incluye", wordAt(a09, "incluye")],
    ["Cuánto cuesta", wordAt(a09, "cuesta")],
    ["Condiciones", wordAt(a09, "condiciones")],
  ];
  return (
    <div style={{position: "absolute", inset: 0}}>
      <div style={{position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12}}>
        {chips.map(([t, at]) => {
          const a = tw(f, at - 4, 10);
          return (
            <div key={t} style={{padding: "8px 18px", borderRadius: 20, border: `2px solid ${C.navy}`, background: a > 0.5 ? C.navy : C.white, color: a > 0.5 ? C.white : C.navy, fontFamily: SANS, fontWeight: 500, fontSize: 21, opacity: 0.3 + a * 0.7}}>
              {t}
            </div>
          );
        })}
      </div>
      <div style={{position: "absolute", top: 76, left: 40, right: 40, padding: "22px 30px", borderRadius: 20, border: `2.5px solid ${C.navy}`, background: C.white, display: "flex", flexDirection: "column", gap: 16, opacity: tw(f, wordAt(a09, "revisar") - 10, 14)}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 30, color: C.navy}}>La opción para la Sra. Morales</div>
        <SlotRow f={f} at={wordAt(a09, "revisar")} label="Plan" slot="[nombre del plan]" />
        <SlotRow f={f} at={wordAt(a09, "contempla")} label="Incluye" slot="[servicios confirmados]" />
        <SlotRow f={f} at={wordAt(a10, "forma")} label="Formas de pago" slot="[modalidades autorizadas]" />
        <SlotRow f={f} at={wordAt(a10, "costo")} label="Costo" slot="[importe confirmado]" />
        <SlotRow f={f} at={wordAt(a10, "costo") + 30} label="Pagos" slot="[anticipo y mensualidad]" />
      </div>
    </div>
  );
};

/** Preguntas de opción: ella elige, no el asesor. */
const Elegir: React.FC<Ctx> = ({f, owner, reply}) => {
  const first = owner.id === "a13";
  const title = first ? "¿Qué conocer primero?" : "¿Qué es lo más importante?";
  const opts: [string, number, number][] = first
    ? [
        ["El costo", wordAt(owner, "costo"), reply ? wordAt(reply, "costo") : -1],
        ["Los servicios incluidos", wordAt(owner, "servicios"), -1],
        ["Las condiciones del plan", wordAt(owner, "condiciones"), -1],
      ]
    : [
        ["Los servicios incluidos", wordAt(owner, "servicios"), -1],
        ["La forma de pago", wordAt(owner, "forma"), -1],
        ["Proteger a más integrantes", wordAt(owner, "proteger"), reply ? wordAt(reply, "mamá") : -1],
      ];
  return (
    <div style={{position: "absolute", inset: 0}}>
      <Fade f={f} at={first ? wordAt(owner, "revisarlo") : owner.from} style={{top: 10, left: 0, right: 0, textAlign: "center"}}>
        <Label size={32} serif weight={700}>
          {title}
        </Label>
      </Fade>
      <div style={{position: "absolute", top: 100, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18}}>
        {opts.map(([t, at, sel]) => (
          <Option key={t} f={f} at={at - 4} sel={sel} w={470}>
            {t}
          </Option>
        ))}
      </div>
      {reply && !first && (
        <Fade f={f} at={wordAt(reply, "mamá") + 8} style={{top: 384, left: 0, right: 0, textAlign: "center"}}>
          <Label size={24} italic serif color={C.gold}>
            Incluir a su mamá
          </Label>
        </Fade>
      )}
    </div>
  );
};

/** WhatsApp: qué enviar y la llamada para revisarlo. */
const WhatsApp: React.FC<Ctx> = ({f}) => {
  const a14 = byId("a14");
  const p08 = byId("p08");
  const a15 = byId("a15");
  const p09 = byId("p09");
  const sent = tw(f, wordAt(a15, "envío") + 4, 12);
  const swap = tw(f, a15.from + 4, 12);
  return (
    <div style={{position: "absolute", inset: 0}}>
      <svg width={240} height={420} viewBox="0 0 240 420" style={{position: "absolute", left: 20, top: 0}}>
        <Draw f={f} at={a14.from} dur={20}>
          <Rect x={20} y={10} w={200} h={400} r={30} fill={C.white} i={0} />
          <Rect x={34} y={50} w={172} h={320} r={8} fill={C.cream2} stroke={C.line} sw={2} i={0.3} />
          <P d="M100,28 H140" w={4} i={0.5} />
        </Draw>
      </svg>
      <div style={{position: "absolute", left: 60, top: 80, width: 166, opacity: sent, transform: `translateY(${(1 - sent) * 30}px)`}}>
        <div style={{background: "#DDF5E3", border: `2px solid ${C.wa}`, borderRadius: "14px 14px 4px 14px", padding: "10px 12px", fontFamily: SANS, fontSize: 17, color: C.ink, lineHeight: 1.25}}>
          La opción que revisamos
          <br />+ otra con su mamá
          <div style={{fontSize: 13, color: C.stone, textAlign: "right", marginTop: 4}}>Enviado ✓✓</div>
        </div>
      </div>
      <div style={{position: "absolute", left: 290, top: 10, width: 370, opacity: 1 - swap}}>
        <Fade f={f} at={wordAt(a14, "enviarle")} style={{position: "relative"}}>
          <Label size={30} serif weight={700}>
            ¿Qué le envío?
          </Label>
        </Fade>
        <div style={{display: "flex", flexDirection: "column", gap: 18, marginTop: 26}}>
          <Option f={f} at={wordAt(a14, "acorde") - 4} sel={wordAt(p08, "dijo")} w={360}>
            La opción más acorde
          </Option>
          <Option f={f} at={wordAt(a14, "comparar") - 4} sel={wordAt(p08, "otra")} w={360}>
            Otra para comparar
          </Option>
        </div>
      </div>
      <div style={{position: "absolute", left: 290, top: 10, width: 370, opacity: swap}}>
        <Label size={30} serif weight={700}>
          Una llamada breve
        </Label>
        <div style={{marginTop: 26}}>
          <Option f={f} at={wordAt(a15, "jueves") - 4} sel={wordAt(p09, "jueves")} w={300}>
            Jueves · 6:00 p. m.
          </Option>
        </div>
        <Fade f={f} at={wordAt(p09, "esposo")} style={{position: "relative", marginTop: 26}}>
          <Label size={24} italic serif color={C.gold}>
            Con su esposo en casa
          </Label>
        </Fade>
      </div>
    </div>
  );
};

/** «No tengo dinero»: ubicar qué le preocupa. */
const Preocupa: React.FC<Ctx> = ({f, owner, reply}) => (
  <div style={{position: "absolute", inset: 0}}>
    <Fade f={f} at={owner.from} style={{top: 10, left: 0, right: 0, textAlign: "center"}}>
      <Label size={32} serif weight={700}>
        ¿Qué le preocupa?
      </Label>
    </Fade>
    <div style={{position: "absolute", top: 100, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18}}>
      <Option f={f} at={wordAt(owner, "pago") - 4} w={470}>
        El pago inicial
      </Option>
      <Option f={f} at={wordAt(owner, "mensualidad") - 4} w={470}>
        La mensualidad
      </Option>
      <Option f={f} at={wordAt(owner, "otros") - 4} sel={reply ? wordAt(reply, "inscribir") : -1} w={470}>
        Otros gastos prioritarios
      </Option>
    </div>
    {reply && (
      <Fade f={f} at={wordAt(reply, "carro")} style={{top: 384, left: 0, right: 0, textAlign: "center"}}>
        <Label size={24} italic serif color={C.gold}>
          Inscripciones y el carro en el taller
        </Label>
      </Fade>
    )}
  </div>
);

/** La pregunta difícil: revisar las condiciones, no adivinar. */
const Condiciones: React.FC<Ctx> = ({f}) => {
  const a22 = byId("a22");
  const a23 = byId("a23");
  return (
    <Card f={f} at={wordAt(a22, "condiciones") - 6} title="Antes de decidir, revisamos">
      <Row f={f} at={wordAt(a22, "requisitos")}>Los requisitos del plan</Row>
      <Row f={f} at={wordAt(a22, "pagos")}>Los pagos</Row>
      <Row f={f} at={wordAt(a22, "saldo")}>Cualquier saldo pendiente</Row>
      <NoRow f={f} at={wordAt(a23, "prometerle")}>
        Prometer cobertura sin confirmar
      </NoRow>
      <div>
        <Pill f={f} at={wordAt(a23, "revisamos")}>Revisarlas juntos</Pill>
      </div>
    </Card>
  );
};

/** Calendario con el día acordado. */
const Calendar: React.FC<{f: number; at: number; mark: number; day: string}> = ({f, at, mark, day}) => {
  const m = tw(f, mark, 14);
  return (
    <svg width={250} height={260} viewBox="0 0 250 260" style={{position: "absolute", left: 20, top: 40}}>
      <Draw f={f} at={at} dur={22}>
        <Rect x={10} y={20} w={230} h={230} r={18} fill={C.white} i={0} />
        <P d="M10,80 H240" w={2.4} i={0.2} />
        <P d="M66,6 V40 M184,6 V40" w={5} i={0.3} />
        {Array.from({length: 12}, (_, k) => (
          <Rect key={k} x={30 + (k % 4) * 52} y={98 + Math.floor(k / 4) * 48} w={34} h={30} r={6} fill={C.cream2} stroke={C.lineSoft} sw={1.6} i={0.4 + k * 0.02} />
        ))}
      </Draw>
      <rect x={10} y={20} width={230} height={60} rx={18} fill={C.navy} opacity={tw(f, at + 14, 10)} />
      <text x={125} y={60} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={C.white} opacity={tw(f, at + 14, 10)}>
        {day}
      </text>
      <g opacity={m}>
        <circle cx={151} cy={161} r={30} fill="none" stroke={C.gold} strokeWidth={4} />
        <DrawCtx.Provider value={m}>
          <Check x={151} y={161} s={1.1} color={C.gold} />
        </DrawCtx.Provider>
      </g>
    </svg>
  );
};

const Cita: React.FC<Ctx> = ({f, owner, reply}) => {
  if (owner.id === "a24") {
    const mark = reply ? wordAt(reply, "lunes") : 1e9;
    return (
      <div style={{position: "absolute", inset: 0}}>
        <Calendar f={f} at={wordAt(owner, "acordamos") - 10} mark={mark} day="Lunes" />
        <div style={{position: "absolute", left: 320, top: 50, width: 340}}>
          <Fade f={f} at={wordAt(owner, "acordamos")} style={{position: "relative"}}>
            <Label size={30} serif weight={700}>
              Volver a conversar
            </Label>
          </Fade>
          <Fade f={f} at={wordAt(owner, "problema") - 4} style={{position: "relative", marginTop: 14}}>
            <Label size={23} color={C.stone}>
              Y si necesita más tiempo, no hay problema
            </Label>
          </Fade>
          {reply && <Pill f={f} at={mark} style={{marginTop: 30}}>Lunes · por la mañana</Pill>}
        </div>
      </div>
    );
  }
  const atS = wordAt(owner, "sábado");
  return (
    <div style={{position: "absolute", inset: 0}}>
      <Calendar f={f} at={wordAt(owner, "visita") - 14} mark={atS} day="Sábado" />
      <div style={{position: "absolute", left: 320, top: 30, width: 350, display: "flex", flexDirection: "column", gap: 16}}>
        <Fade f={f} at={wordAt(owner, "visita") - 4} style={{position: "relative"}}>
          <Label size={30} serif weight={700}>
            Asesoría presencial
          </Label>
        </Fade>
        <div>
          <Pill f={f} at={atS}>Sábado · 11:00</Pill>
        </div>
        <Fade f={f} at={atS + 24} style={{position: "relative"}}>
          <Slot size={22}>[lugar confirmado]</Slot>
        </Fade>
        <Row f={f} at={wordAt(owner, "detalles")}>
          <span style={{fontSize: 23}}>Detalles de la cita</span>
        </Row>
        <Row f={f} at={wordAt(owner, "conviene")}>
          <span style={{fontSize: 23}}>Qué tener a la mano</span>
        </Row>
        {reply && (
          <Fade f={f} at={wordAt(reply, "sábado")} style={{position: "relative"}}>
            <Label size={24} italic serif color={C.gold}>
              Confirmado por la Sra. Morales
            </Label>
          </Fade>
        )}
      </div>
    </div>
  );
};

/** Cierre sin venta: la puerta queda abierta. */
const Puerta: React.FC<Ctx> = ({f, owner}) => {
  const atO = wordAt(owner, "abierta");
  const k = tw(f, atO - 6, 26);
  const w = 150 - k * 96;
  const sk = k * 26;
  return (
    <div style={{position: "absolute", inset: 0}}>
      <svg width={300} height={400} viewBox="0 0 300 400" style={{position: "absolute", left: 40, top: 10}}>
        <rect x={70} y={30} width={150} height={340} fill={C.goldSoft} opacity={k} />
        <Draw f={f} at={owner.from} dur={24}>
          <Rect x={62} y={22} w={166} h={356} r={4} stroke={C.navy} sw={5} i={0} />
          <P d="M20,378 H280" stroke={C.line} w={2.4} i={0.4} />
        </Draw>
        <g opacity={tw(f, owner.from + 10, 12)}>
          <path d={`M70,30 L${70 + w},${30 + sk} L${70 + w},${370 - sk} L70,370 Z`} fill={C.white} stroke={C.navy} strokeWidth={3.4} strokeLinejoin="round" />
          <circle cx={70 + w - 18 * (w / 150)} cy={200} r={6} fill={C.gold} />
        </g>
      </svg>
      <div style={{position: "absolute", left: 340, top: 90, width: 320, display: "flex", flexDirection: "column", gap: 18}}>
        <Fade f={f} at={atO} style={{position: "relative"}}>
          <Label size={36} serif weight={700}>
            La puerta abierta
          </Label>
        </Fade>
        <Fade f={f} at={wordAt(owner, "compromiso") - 4} style={{position: "relative"}}>
          <Label size={23} color={C.stone}>
            Sin un compromiso que hoy no le conviene
          </Label>
        </Fade>
        <Fade f={f} at={wordAt(owner, "oportuno") - 4} style={{position: "relative"}}>
          <Label size={24} italic serif color={C.gold}>
            Cuando le resulte oportuno
          </Label>
        </Fade>
      </div>
    </div>
  );
};

export const INSERTS: Record<Insert, React.FC<Ctx>> = {
  preguntas: Preguntas,
  necesidad: Necesidad,
  cotizacion: Cotizacion,
  elegir: Elegir,
  whatsapp: WhatsApp,
  preocupa: Preocupa,
  condiciones: Condiciones,
  cita: Cita,
  puerta: Puerta,
};

void Circ;
void INS_H;
