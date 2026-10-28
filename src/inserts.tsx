import React from "react";
import {C, SANS, SERIF} from "./theme";
import {Check, Circ, DrawCtx, P, Rect} from "./draw";
import {LineT, tokensOf, tw} from "./timeline";
import type {Insert} from "./script";

/** Área de las ilustraciones (entre los dos personajes). */
export const INS_W = 680;
export const INS_H = 430;

const norm = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

/** Cuadro absoluto en que se dice una palabra de la línea (n = ocurrencia). */
export const wordAt = (l: LineT, needle: string, n = 0) => {
  const k = norm(needle);
  const hits = tokensOf(l).filter((t) => norm(t.t).startsWith(k));
  return (hits[n] ?? hits[hits.length - 1] ?? {s: l.from}).s;
};

type Ctx = {f: number; owner: LineT; reply?: LineT};

/** Aparece (se dibuja) desde el cuadro `at`. */
export const Draw: React.FC<{f: number; at: number; dur?: number; children: React.ReactNode}> = ({f, at, dur = 22, children}) => (
  <DrawCtx.Provider value={tw(f, at, dur)}>{children}</DrawCtx.Provider>
);

export const Fade: React.FC<{f: number; at: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, at, style, children}) => {
  const a = tw(f, at, 14);
  return <div style={{position: "absolute", opacity: a, transform: `translateY(${(1 - a) * 14}px)`, ...style}}>{children}</div>;
};

export const Label: React.FC<{children: React.ReactNode; size?: number; color?: string; serif?: boolean; italic?: boolean; weight?: number}> = ({children, size = 26, color = C.navy, serif, italic, weight = 500}) => (
  <div style={{fontFamily: serif ? SERIF : SANS, fontSize: size, color, fontStyle: italic ? "italic" : "normal", fontWeight: weight, lineHeight: 1.15}}>{children}</div>
);

/** Tarjeta de opción (se selecciona con relleno azul y palomita). */
export const Option: React.FC<{f: number; at: number; sel?: number; children: React.ReactNode; w?: number}> = ({f, at, sel = -1, children, w = 200}) => {
  const a = tw(f, at, 14);
  const s = sel >= 0 ? tw(f, sel, 10) : 0;
  return (
    <div
      style={{
        width: w,
        padding: "18px 18px",
        borderRadius: 14,
        border: `2.5px solid ${C.navy}`,
        background: s > 0.5 ? C.navy : C.white,
        color: s > 0.5 ? C.white : C.navy,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: 25,
        textAlign: "center",
        opacity: a,
        transform: `translateY(${(1 - a) * 16}px) scale(${1 + s * 0.06 - (s > 0 && s < 1 ? 0 : 0)})`,
        position: "relative",
      }}
    >
      {children}
      {s > 0 && (
        <div style={{position: "absolute", top: -14, right: -14, width: 34, height: 34, borderRadius: 20, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`}}>
          <svg width={22} height={22} viewBox="-12 -12 24 24">
            <path d="M-7,0 L-2,6 L8,-6" stroke={C.white} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

/** Hueco para un dato real del plan ([monto], [plazo]). */
export const Slot: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 24}) => (
  <span style={{display: "inline-block", padding: "2px 12px", borderRadius: 8, border: `2px dashed ${C.gold}`, color: C.gold, fontFamily: SANS, fontWeight: 500, fontSize: size, background: C.goldSoft}}>{children}</span>
);

/* ------------------------------------------------------------------ */

const Person: React.FC<{x: number; y: number; filled: boolean; i?: number}> = ({x, y, filled, i = 0}) => (
  <>
    <Circ cx={x} cy={y} r={17} fill={filled ? C.navy : C.white} stroke={filled ? C.navy : C.line} i={i} />
    <P d={`M${x - 30},${y + 64} C${x - 30},${y + 34} ${x - 18},${y + 24} ${x},${y + 24} C${x + 18},${y + 24} ${x + 30},${y + 34} ${x + 30},${y + 64} Z`} fill={filled ? C.navy : C.white} stroke={filled ? C.navy : C.line} i={i + 0.05} />
  </>
);

const TresDeDiez: React.FC<Ctx> = ({f, owner}) => {
  const at3 = wordAt(owner, "3");
  const atQ1 = wordAt(owner, "tomaría");
  const atQ2 = wordAt(owner, "cubriría");
  return (
    <div style={{position: "absolute", inset: 0}}>
      <svg width={INS_W} height={260} viewBox={`0 0 ${INS_W} 260`} style={{position: "absolute", top: 0}}>
        {Array.from({length: 10}, (_, k) => {
          const col = k % 5;
          const row = Math.floor(k / 5);
          return (
            <Draw key={k} f={f} at={at3 - 20 + k * 2}>
              <Person x={130 + col * 105} y={40 + row * 115} filled={k < 3 && f > at3 + 4} />
            </Draw>
          );
        })}
      </svg>
      <Fade f={f} at={at3} style={{top: 262, left: 0, right: 0, textAlign: "center"}}>
        <Label size={34} serif weight={700}>
          3 de cada 10 mexicanos
        </Label>
        <Label size={22} color={C.stone}>
          cuentan con esta protección
        </Label>
      </Fade>
      <div style={{position: "absolute", top: 356, left: 0, right: 0, display: "flex", gap: 18, justifyContent: "center"}}>
        <Fade f={f} at={atQ1} style={{position: "relative"}}>
          <Option f={f} at={atQ1} w={250}>¿Quién decide?</Option>
        </Fade>
        <Fade f={f} at={atQ2} style={{position: "relative"}}>
          <Option f={f} at={atQ2} w={250}>¿Cómo se paga?</Option>
        </Fade>
      </div>
    </div>
  );
};

const SeguroAuto: React.FC<Ctx> = ({f, owner}) => {
  const at = wordAt(owner, "seguro");
  const atNo = wordAt(owner, "esperando");
  const atFam = wordAt(owner, "proteger");
  return (
    <div style={{position: "absolute", inset: 0}}>
      <Fade f={f} at={atFam} style={{top: 0, left: 0, right: 0, textAlign: "center"}}>
        <Label size={32} serif weight={700}>
          Proteger a su familia
        </Label>
      </Fade>
      <svg width={INS_W} height={300} viewBox={`0 0 ${INS_W} 300`} style={{position: "absolute", top: 60}}>
        <Draw f={f} at={at - 8} dur={30}>
          {/* Auto */}
          <P d="M120,210 L130,160 Q140,130 176,124 L250,118 Q300,90 360,100 L420,130 Q480,136 500,160 L508,210 Z" fill={C.white} i={0} />
          <P d="M262,124 Q300,104 352,110 L392,134 L262,138 Z" fill={C.tint} i={0.15} />
          <P d="M196,140 L250,128 L250,140 Z" fill={C.tint} i={0.2} />
          <Circ cx={200} cy={214} r={30} fill={C.white} i={0.3} />
          <Circ cx={200} cy={214} r={12} fill={C.navy} i={0.35} />
          <Circ cx={430} cy={214} r={30} fill={C.white} i={0.32} />
          <Circ cx={430} cy={214} r={12} fill={C.navy} i={0.37} />
          <P d="M90,246 H560" stroke={C.line} w={2.4} i={0.4} />
        </Draw>
        <Draw f={f} at={at + 10} dur={24}>
          {/* Escudo */}
          <P d="M560,40 L612,58 V112 Q612,160 560,182 Q508,160 508,112 V58 Z" fill={C.goldSoft} stroke={C.gold} w={4} i={0} />
          <Check x={560} y={110} s={1.6} i={0.5} color={C.gold} />
        </Draw>
      </svg>
      <Fade f={f} at={atNo} style={{top: 370, left: 0, right: 0, textAlign: "center"}}>
        <Label size={26} italic serif color={C.stone}>
          Uno lo contrata esperando no usarlo.
        </Label>
      </Fade>
    </div>
  );
};

const Recuerdo: React.FC<Ctx> = ({f, owner}) => {
  const atPapa = wordAt(owner, "papá");
  const atDisc = wordAt(owner, "discutiendo");
  const atDos = wordAt(owner, "dos", 0);
  const atPagaba = wordAt(owner, "pagaba");
  // Manecillas del reloj: llegan a las 2:00.
  const k = tw(f, atDos - 10, 30);
  const hourA = -90 + (60 * k);
  const minA = -90 + 360 * k * 2;
  const rad = (a: number) => (a * Math.PI) / 180;
  return (
    <div style={{position: "absolute", inset: 0}}>
      <svg width={INS_W} height={INS_H} viewBox={`0 0 ${INS_W} ${INS_H}`} style={{position: "absolute"}}>
        <Draw f={f} at={owner.from} dur={30}>
          <Rect x={40} y={20} w={600} h={380} r={40} stroke={C.line} sw={2.6} i={0} />
        </Draw>
        <Draw f={f} at={atPapa - 6} dur={26}>
          {/* Marco con foto (silueta) */}
          <Rect x={90} y={70} w={160} h={200} r={10} fill={C.cream2} i={0} />
          <Rect x={106} y={86} w={128} h={168} r={6} fill={C.white} stroke={C.line} i={0.15} />
          <Circ cx={170} cy={150} r={28} fill={C.tint} stroke={C.line} i={0.3} />
          <P d="M124,254 C124,206 146,190 170,190 C194,190 216,206 216,254" fill={C.tint} stroke={C.line} i={0.4} />
          <P d="M150,276 L140,300 M190,276 L200,300" stroke={C.navy} i={0.5} />
        </Draw>
        <Draw f={f} at={atDos - 16} dur={22}>
          <Circ cx={470} cy={150} r={86} fill={C.white} i={0} />
          {Array.from({length: 12}, (_, h) => {
            const a = rad(h * 30 - 90);
            return <P key={h} d={`M${470 + Math.cos(a) * 70},${150 + Math.sin(a) * 70} L${470 + Math.cos(a) * 78},${150 + Math.sin(a) * 78}`} w={3} i={0.3} />;
          })}
        </Draw>
        <g opacity={tw(f, atDos - 10, 8)}>
          <line x1={470} y1={150} x2={470 + Math.cos(rad(hourA)) * 42} y2={150 + Math.sin(rad(hourA)) * 42} stroke={C.navy} strokeWidth={6} strokeLinecap="round" />
          <line x1={470} y1={150} x2={470 + Math.cos(rad(minA)) * 62} y2={150 + Math.sin(rad(minA)) * 62} stroke={C.navy} strokeWidth={4} strokeLinecap="round" />
          <circle cx={470} cy={150} r={6} fill={C.gold} />
        </g>
      </svg>
      <Fade f={f} at={atDos} style={{top: 252, left: 384, width: 172, textAlign: "center"}}>
        <Label size={34} serif weight={700}>
          2:00 a.m.
        </Label>
      </Fade>
      <div style={{position: "absolute", top: 320, left: 70, right: 70, display: "flex", gap: 16, justifyContent: "center"}}>
        <Fade f={f} at={atDisc} style={{position: "relative"}}>
          <Option f={f} at={atDisc} w={240}>¿Quién paga?</Option>
        </Fade>
        <Fade f={f} at={atPagaba + 6} style={{position: "relative"}}>
          <Option f={f} at={atPagaba + 6} w={250}>¿Qué funeraria?</Option>
        </Fade>
      </div>
    </div>
  );
};

const Pagos: React.FC<Ctx> = ({f, owner, reply}) => {
  const atPagos = wordAt(owner, "pagos");
  const atHoy = wordAt(owner, "precio");
  const atOpt = wordAt(owner, "inhumación");
  const sel = reply ? wordAt(reply, "cremación") : -1;
  const months = 8;
  return (
    <div style={{position: "absolute", inset: 0}}>
      <svg width={INS_W} height={170} viewBox={`0 0 ${INS_W} 170`} style={{position: "absolute", top: 0}}>
        {Array.from({length: months}, (_, k) => (
          <Draw key={k} f={f} at={atPagos - 8 + k * 3} dur={16}>
            <Rect x={40 + k * 76} y={22} w={64} h={72} r={10} fill={C.white} i={0} />
            <P d={`M${40 + k * 76},${44} H${104 + k * 76}`} w={2.4} i={0.3} />
            <Circ cx={72 + k * 76} cy={70} r={12} fill={k < 3 ? C.goldSoft : "none"} stroke={C.gold} w={2.6} i={0.5} />
          </Draw>
        ))}
      </svg>
      <Fade f={f} at={atPagos + 6} style={{top: 112, left: 0, right: 0, display: "flex", gap: 14, alignItems: "center", justifyContent: "center"}}>
        <Label size={26}>Pagos de</Label>
        <Slot>[monto]</Slot>
        <Label size={26}>durante</Label>
        <Slot>[plazo]</Slot>
      </Fade>
      <Fade f={f} at={atHoy} style={{top: 172, left: 0, right: 0, textAlign: "center"}}>
        <Label size={30} serif weight={700}>
          A precio de hoy
        </Label>
      </Fade>
      <div style={{position: "absolute", top: 262, left: 0, right: 0, display: "flex", gap: 24, justifyContent: "center"}}>
        <Option f={f} at={atOpt} w={250}>Inhumación</Option>
        <Option f={f} at={atOpt + 8} sel={sel} w={250}>
          Cremación
        </Option>
      </div>
    </div>
  );
};

/* Íconos de lo que incluye el plan */
const IcoVan: React.FC = () => (
  <>
    <P d="M10,70 V36 Q10,26 20,26 H78 L100,46 H118 Q126,46 126,54 V70 Z" fill={C.white} i={0} />
    <P d="M80,30 L96,46 H80 Z" fill={C.tint} i={0.2} />
    <Circ cx={36} cy={72} r={11} fill={C.navy} i={0.4} />
    <Circ cx={102} cy={72} r={11} fill={C.navy} i={0.45} />
  </>
);
const IcoSala: React.FC = () => (
  <>
    <P d="M14,80 V38 L68,14 L122,38 V80 Z" fill={C.white} i={0} />
    <P d="M56,80 V54 H80 V80" i={0.3} />
    <P d="M30,48 V64 M106,48 V64" stroke={C.gold} w={4} i={0.5} />
    <P d="M30,42 Q27,36 30,32 Q33,36 30,42 M106,42 Q103,36 106,32 Q109,36 106,42" fill={C.yellow} stroke={C.gold} w={2} i={0.55} />
  </>
);
const IcoUrna: React.FC = () => (
  <>
    <P d="M50,16 H86 L82,28 Q104,42 100,64 Q96,84 68,86 Q40,84 36,64 Q32,42 54,28 Z" fill={C.white} i={0} />
    <P d="M44,52 H92" stroke={C.gold} w={3} i={0.4} />
    <P d="M54,8 H82" w={5} i={0.5} />
  </>
);
const IcoDoc: React.FC = () => (
  <>
    <P d="M36,8 H84 L102,26 V88 H36 Z" fill={C.white} i={0} />
    <P d="M84,8 V26 H102" i={0.2} />
    <P d="M48,40 H90 M48,52 H90 M48,64 H76" w={2.6} i={0.35} />
    <P d="M50,78 Q58,70 64,78 T80,76" stroke={C.gold} w={2.6} i={0.6} />
  </>
);

const Item: React.FC<{f: number; at: number; label: string; children: React.ReactNode}> = ({f, at, label, children}) => (
  <div style={{width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 6}}>
    <svg width={136} height={96} viewBox="0 0 136 96">
      <Draw f={f} at={at - 6} dur={18}>
        {children}
      </Draw>
    </svg>
    <div style={{opacity: tw(f, at, 10)}}>
      <Label size={21} weight={500}>
        <span style={{display: "block", textAlign: "center"}}>{label}</span>
      </Label>
    </div>
  </div>
);

const Incluye: React.FC<Ctx> = ({f, owner}) => {
  const atAmp = wordAt(owner, "ampliación");
  const atCon = wordAt(owner, "contrato");
  const tags = [
    ["Vigencia", wordAt(owner, "vigencia")],
    ["Cobertura", wordAt(owner, "cobertura")],
    ["Cancelación", wordAt(owner, "cancelación")],
  ] as const;
  return (
    <div style={{position: "absolute", inset: 0}}>
      <div style={{position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14}}>
        <Item f={f} at={wordAt(owner, "traslado")} label="Traslado">
          <IcoVan />
        </Item>
        <Item f={f} at={wordAt(owner, "sala")} label="Sala de velación">
          <IcoSala />
        </Item>
        <Item f={f} at={wordAt(owner, "ataúd")} label="Ataúd o urna">
          <IcoUrna />
        </Item>
        <Item f={f} at={wordAt(owner, "trámites")} label="Trámites">
          <IcoDoc />
        </Item>
      </div>
      <Fade f={f} at={atAmp} style={{top: 168, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 12}}>
        <Label size={24}>Ampliación de sala:</Label>
        <Slot size={22}>¿incluida o con costo?</Slot>
      </Fade>
      <Fade f={f} at={atCon} style={{top: 240, left: 90, right: 90}}>
        <div style={{border: `2.5px solid ${C.navy}`, borderRadius: 16, background: C.white, padding: "16px 22px"}}>
          <Label size={28} serif weight={700}>
            Todo por contrato
          </Label>
          <div style={{display: "flex", gap: 10, marginTop: 12}}>
            {tags.map(([t, at]) => (
              <div key={t} style={{opacity: tw(f, at, 8), padding: "6px 14px", borderRadius: 20, background: C.tint, color: C.navy, fontFamily: SANS, fontSize: 20, fontWeight: 500}}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </Fade>
    </div>
  );
};

const Contrato24h: React.FC<Ctx> = ({f, owner}) => {
  const atFirma = wordAt(owner, "firma");
  const atResp = wordAt(owner, "respaldo");
  const at24 = wordAt(owner, "24");
  const atLlam = wordAt(owner, "llamada");
  return (
    <div style={{position: "absolute", inset: 0, display: "flex", justifyContent: "center", gap: 26, paddingTop: 10}}>
      {[
        {at: atFirma, label: "Contrato firmado", ico: (
          <>
            <P d="M40,10 H112 L136,34 V150 H40 Z" fill={C.white} i={0} />
            <P d="M56,46 H118 M56,62 H118 M56,78 H104" w={2.6} i={0.25} />
            <P d="M54,122 Q66,104 76,122 T100,118 T124,112" stroke={C.gold} w={3.2} i={0.55} />
            <P d="M54,132 H126" w={2} i={0.5} />
          </>
        )},
        {at: atResp, label: "Respaldo de J. García López", ico: (
          <>
            <P d="M88,12 L146,34 V84 Q146,132 88,156 Q30,132 30,84 V34 Z" fill={C.white} i={0} />
            <P d="M88,30 L130,46 V84 Q130,120 88,140 Q46,120 46,84 V46 Z" fill={C.tint} stroke={C.navy} w={2} i={0.3} />
            <Check x={88} y={84} s={1.8} i={0.6} />
          </>
        )},
        {at: at24, label: "Atención las 24 horas", ico: (
          <>
            <Circ cx={88} cy={84} r={66} fill={C.white} i={0} />
            <P d="M88,84 V44 M88,84 L116,100" w={4.4} i={0.4} />
            <P d="M88,18 V28 M88,140 V150 M22,84 H32 M144,84 H154" w={3} i={0.5} />
          </>
        )},
        {at: atLlam, label: "Una llamada", ico: (
          <>
            <Rect x={56} y={14} w={66} h={136} r={14} fill={C.white} i={0} />
            <Rect x={66} y={30} w={46} h={92} r={4} fill={C.tint} stroke={C.navy} sw={2} i={0.3} />
            <P d="M132,40 Q150,58 132,78 M142,30 Q170,58 142,88" stroke={C.gold} w={3} i={0.6} />
          </>
        )},
      ].map((c, k) => (
        <div key={k} style={{width: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 10}}>
          <svg width={176} height={164} viewBox="0 0 176 164" style={{transform: "scale(0.86)"}}>
            <Draw f={f} at={c.at - 6} dur={20}>
              {c.ico}
            </Draw>
          </svg>
          <div style={{opacity: tw(f, c.at + 4, 10), textAlign: "center"}}>
            <Label size={22}>{c.label}</Label>
          </div>
        </div>
      ))}
    </div>
  );
};

const Aislar: React.FC<Ctx> = ({f, owner, reply}) => {
  const sel = reply ? wordAt(reply, "esposa") : -1;
  return (
    <div style={{position: "absolute", inset: 0}}>
      <Fade f={f} at={wordAt(owner, "ayudarle")} style={{top: 10, left: 0, right: 0, textAlign: "center"}}>
        <Label size={32} serif weight={700}>
          ¿Qué le gustaría analizar?
        </Label>
      </Fade>
      <div style={{position: "absolute", top: 110, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18}}>
        <Option f={f} at={wordAt(owner, "plan")} w={430}>
          El plan
        </Option>
        <Option f={f} at={wordAt(owner, "forma")} w={430}>
          La forma de pago
        </Option>
        <Option f={f} at={wordAt(owner, "consultarlo")} sel={sel} w={430}>
          Consultarlo con su esposa
        </Option>
      </div>
    </div>
  );
};

export const Row: React.FC<{f: number; at: number; children: React.ReactNode}> = ({f, at, children}) => {
  const a = tw(f, at, 12);
  return (
    <div style={{display: "flex", alignItems: "center", gap: 14, opacity: a, transform: `translateX(${(1 - a) * -16}px)`}}>
      <svg width={30} height={30} viewBox="-15 -15 30 30">
        <circle r={13} fill={C.navy} />
        <DrawCtx.Provider value={tw(f, at + 4, 10)}>
          <Check x={0} y={0} s={0.7} color={C.white} />
        </DrawCtx.Provider>
      </svg>
      <div style={{fontFamily: SANS, fontSize: 26, color: C.ink, lineHeight: 1.3, flex: 1}}>{children}</div>
    </div>
  );
};

export const Card: React.FC<{f: number; at: number; title: string; children: React.ReactNode}> = ({f, at, title, children}) => {
  const a = tw(f, at, 16);
  return (
    <div style={{position: "absolute", top: 10, left: 60, right: 60, padding: "24px 30px", borderRadius: 20, border: `2.5px solid ${C.navy}`, background: C.white, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: C.navy, marginBottom: 18}}>{title}</div>
      <div style={{display: "flex", flexDirection: "column", gap: 16}}>{children}</div>
    </div>
  );
};

const Resumen: React.FC<Ctx> = ({f, owner}) => (
  <Card f={f} at={wordAt(owner, "resumirle") - 6} title="Resumen">
    <Row f={f} at={wordAt(owner, "cremación")}>Plan de cremación para usted</Row>
    <Row f={f} at={wordAt(owner, "traslado")}>Traslado, sala, urna y trámites</Row>
    <Row f={f} at={wordAt(owner, "pagos")}>
      Pagos de <Slot>[monto]</Slot>
    </Row>
    <Row f={f} at={wordAt(owner, "sin")}>Su familia sin gastos ni decisiones de última hora</Row>
  </Card>
);

const WhatsAgenda: React.FC<Ctx> = ({f, owner, reply}) => {
  const atWa = wordAt(owner, "whatsapp");
  const atAg = wordAt(owner, "agendamos");
  const atJ = wordAt(owner, "jueves");
  const atS = wordAt(owner, "sábado");
  const sel = reply ? wordAt(reply, "sábado") : -1;
  const sent = tw(f, atWa + 10, 12);
  return (
    <div style={{position: "absolute", inset: 0}}>
      <svg width={240} height={420} viewBox="0 0 240 420" style={{position: "absolute", left: 20, top: 0}}>
        <Draw f={f} at={atWa - 16} dur={20}>
          <Rect x={20} y={10} w={200} h={400} r={30} fill={C.white} i={0} />
          <Rect x={34} y={50} w={172} h={320} r={8} fill={C.cream2} stroke={C.line} sw={2} i={0.3} />
          <P d="M100,28 H140" w={4} i={0.5} />
        </Draw>
      </svg>
      <div style={{position: "absolute", left: 60, top: 80, width: 166, opacity: sent, transform: `translateY(${(1 - sent) * 30}px)`}}>
        <div style={{background: "#DDF5E3", border: `2px solid ${C.wa}`, borderRadius: "14px 14px 4px 14px", padding: "10px 12px", fontFamily: SANS, fontSize: 17, color: C.ink, lineHeight: 1.25}}>
          Plan de cremación
          <br />+ opción para su mamá
          <div style={{fontSize: 13, color: C.stone, textAlign: "right", marginTop: 4}}>Enviado ✓✓</div>
        </div>
      </div>
      <Fade f={f} at={atAg} style={{left: 300, top: 20, width: 340}}>
        <Label size={28} serif weight={700}>
          Llamada con su esposa
        </Label>
      </Fade>
      <div style={{position: "absolute", left: 300, top: 100, display: "flex", gap: 18}}>
        <Option f={f} at={atJ} w={160}>
          Jueves
        </Option>
        <Option f={f} at={atS} sel={sel} w={160}>
          Sábado
        </Option>
      </div>
      {reply && (
        <Fade f={f} at={wordAt(reply, "diez")} style={{left: 300, top: 220, width: 340}}>
          <div style={{display: "inline-block", padding: "12px 20px", borderRadius: 14, background: C.navy, color: C.white, fontFamily: SANS, fontSize: 28, fontWeight: 700}}>Sábado · 10:00</div>
        </Fade>
      )}
    </div>
  );
};

const Recap: React.FC<Ctx> = ({f, owner}) => (
  <Card f={f} at={wordAt(owner, "quedamos") - 6} title="Quedamos así">
    <Row f={f} at={wordAt(owner, "hoy")}>
      <b style={{color: C.navy}}>Hoy:</b> WhatsApp con el plan y la cotización para su mamá
    </Row>
    <Row f={f} at={wordAt(owner, "sábado")}>
      <b style={{color: C.navy}}>Sábado 10:00:</b> llamada con usted y su esposa
    </Row>
    <Row f={f} at={wordAt(owner, "nombre")}>
      <b style={{color: C.navy}}>Mariana Ruiz:</b> su número directo
    </Row>
  </Card>
);

export const INSERTS: Record<Insert, React.FC<Ctx>> = {
  "tres-de-diez": TresDeDiez,
  "seguro-auto": SeguroAuto,
  recuerdo: Recuerdo,
  pagos: Pagos,
  incluye: Incluye,
  "contrato-24h": Contrato24h,
  aislar: Aislar,
  resumen: Resumen,
  "whatsapp-agenda": WhatsAgenda,
  recap: Recap,
};
