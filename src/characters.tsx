import React from "react";
import {C} from "./theme";
import {Circ, DrawCtx, P, Rect} from "./draw";
import type {Mood} from "./script";

/** Expresión: cejas (-1 enojado → 1 triste/levantadas), boca (-1 → 1), ojos abiertos (0→1), inclinación en grados. */
export type Face = {brow: number; mouth: number; eye: number; tilt: number; lean: number};

export const SKIN = "#EDD3BE";
const SKIN_LINE = C.navy;

export const RAMIRO_FACE: Record<Mood, Face> = {
  seco: {brow: -0.35, mouth: -0.35, eye: 0.8, tilt: 0, lean: 0},
  cortante: {brow: -0.8, mouth: -0.6, eye: 0.7, tilt: -3, lean: -6},
  impaciente: {brow: -0.55, mouth: -0.45, eye: 0.75, tilt: 2, lean: -4},
  molesto: {brow: -1, mouth: -0.85, eye: 0.65, tilt: -4, lean: -8},
  defensivo: {brow: -0.75, mouth: -0.6, eye: 0.7, tilt: 3, lean: -8},
  dolido: {brow: 0.85, mouth: -0.45, eye: 0.42, tilt: 7, lean: 4},
  reservado: {brow: -0.15, mouth: -0.25, eye: 0.8, tilt: 1, lean: 0},
  regañadientes: {brow: -0.1, mouth: -0.15, eye: 0.85, tilt: -2, lean: 2},
  desconfia: {brow: -0.3, mouth: -0.05, eye: 0.8, tilt: 4, lean: 3},
  suaviza: {brow: 0.15, mouth: 0.2, eye: 0.9, tilt: 0, lean: 5},
  sincero: {brow: 0.25, mouth: 0.3, eye: 0.9, tilt: -2, lean: 6},
  interesado: {brow: 0.45, mouth: 0.5, eye: 1, tilt: -3, lean: 10},
  convencido: {brow: 0.3, mouth: 0.75, eye: 0.95, tilt: 0, lean: 10},
  apenado: {brow: 0.55, mouth: 0.5, eye: 0.7, tilt: 6, lean: 8},
};

export const mixFace = (a: Face, b: Face, t: number): Face => ({
  brow: a.brow + (b.brow - a.brow) * t,
  mouth: a.mouth + (b.mouth - a.mouth) * t,
  eye: a.eye + (b.eye - a.eye) * t,
  tilt: a.tilt + (b.tilt - a.tilt) * t,
  lean: a.lean + (b.lean - a.lean) * t,
});

/** Parpadeo: cerrado 4 cuadros cada ~3.3 s, con desfase por personaje. */
export const blink = (f: number, phase: number) => {
  const k = (f + phase) % 101;
  return k < 2 ? 1 - k / 2 : k < 4 ? (k - 2) / 2 : 1;
};

export const Eyes: React.FC<{x1: number; x2: number; y: number; open: number; i: number}> = ({x1, x2, y, open, i}) => (
  <>
    {[x1, x2].map((x, k) =>
      open > 0.12 ? (
        <ellipse key={k} cx={x} cy={y} rx={5.5} ry={Math.max(1.2, 7 * open)} fill={C.navy} opacity={i} />
      ) : (
        <path key={k} d={`M${x - 7},${y} Q${x},${y + 3} ${x + 7},${y}`} stroke={C.navy} strokeWidth={3} fill="none" opacity={i} strokeLinecap="round" />
      ),
    )}
  </>
);

export const Brows: React.FC<{x1: number; x2: number; y: number; brow: number; o: number; thick?: number}> = ({x1, x2, y, brow, o, thick = 3.6}) => {
  // Extremo interior: baja con el enojo y sube con la tristeza.
  const inner = -brow * 7;
  const outer = brow * 3;
  return (
    <g opacity={o} stroke={C.navy} strokeWidth={thick} strokeLinecap="round" fill="none">
      <path d={`M${x1 - 14},${y + outer} Q${x1},${y - 4 + (inner + outer) / 2} ${x1 + 12},${y + inner}`} />
      <path d={`M${x2 + 14},${y + outer} Q${x2},${y - 4 + (inner + outer) / 2} ${x2 - 12},${y + inner}`} />
    </g>
  );
};

export const Mouth: React.FC<{x: number; y: number; w: number; curve: number; talk: number; o: number}> = ({x, y, w, curve, talk, o}) => {
  const c = curve * 11;
  const open = talk * 13;
  const x1 = x - w / 2;
  const x2 = x + w / 2;
  const cy = y - c * 0.35;
  return (
    <path
      d={`M${x1},${cy} Q${x},${y + c} ${x2},${cy} Q${x},${y + c + open} ${x1},${cy} Z`}
      fill={open > 1 ? "#5B2A2A" : "none"}
      stroke={C.navy}
      strokeWidth={3.2}
      strokeLinejoin="round"
      strokeLinecap="round"
      opacity={o}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Mariana Ruiz · asesora                                               */
/* ------------------------------------------------------------------ */

export const Mariana: React.FC<{draw?: number; face: Face; talk: number; blinkV: number; nod: number}> = ({draw = 1, face, talk, blinkV, nod}) => {
  const fo = Math.max(0, Math.min(1, (draw - 0.75) / 0.25));
  return (
    <DrawCtx.Provider value={draw}>
      <svg viewBox="0 0 560 640" width={560} height={640} style={{overflow: "visible"}}>
        {/* Escritorio */}
        <Rect x={10} y={520} w={540} h={120} r={6} fill={C.white} i={0} />
        <P d="M10,532 H550" i={0.05} w={2.4} stroke={C.line} />
        {/* Taza */}
        <P d="M66,470 H112 V514 Q112,522 104,522 H74 Q66,522 66,514 Z" fill={C.cream2} i={0.1} />
        <P d="M112,482 Q130,484 128,498 Q126,510 112,508" i={0.12} />
        <P d="M80,456 Q76,446 82,438 M96,458 Q92,446 98,436" stroke={C.line} w={2.2} i={0.14} />
        {/* Hombros y saco */}
        <g transform={`rotate(${face.tilt * 0.25} 280 520)`}>
          <P d="M140,522 C140,430 186,384 252,364 L308,364 C374,384 420,430 420,522 Z" fill={C.navy} stroke={C.navy} i={0.15} />
          <P d="M252,364 L280,438 L308,364 Z" fill={C.white} stroke={C.navy} i={0.2} />
          <P d="M252,364 L238,404 L272,420 M308,364 L322,404 L288,420" stroke={C.white} w={2.6} i={0.25} />
          {/* Gafete JGL */}
          <Rect x={330} y={420} w={46} h={30} r={4} fill={C.white} stroke={C.white} sw={1} i={0.28} />
          <P d="M338,432 H368 M338,440 H360" stroke={C.gold} w={2.4} i={0.3} />
          {/* Manos sobre el escritorio */}
          <P d="M178,516 Q176,496 198,494 L236,494 Q252,496 250,512 Q248,526 232,526 L192,526 Q178,526 178,516 Z" fill={SKIN} stroke={SKIN_LINE} i={0.32} />
          <P d="M318,512 Q320,494 338,494 L372,496 Q388,500 386,514 Q384,526 368,526 L330,526 Q316,526 318,512 Z" fill={SKIN} stroke={SKIN_LINE} i={0.34} />
          {/* Pluma */}
          <P d="M372,500 L410,470" stroke={C.gold} w={4} i={0.36} />
        </g>
        {/* Cabeza */}
        <g transform={`rotate(${face.tilt + nod} 280 340) translate(0 ${face.lean * 0.3})`}>
          <P d="M260,320 L260,366 L300,366 L300,320" fill={SKIN} stroke={SKIN_LINE} i={0.38} />
          {/* Chongo y cabello de atrás */}
          <Circ cx={332} cy={168} r={30} fill={C.navy2} stroke={C.navy} i={0.4} />
          <P d="M204,250 C198,300 206,330 222,342 L338,342 C354,330 362,300 356,250 Z" fill={C.navy2} stroke={C.navy} i={0.41} />
          <P d="M212,254 C206,322 242,346 280,346 C318,346 354,322 348,254 C346,190 316,170 280,170 C244,170 214,190 212,254 Z" fill={SKIN} stroke={SKIN_LINE} i={0.42} />
          {/* Cabello */}
          <P d="M206,262 C196,176 246,150 284,150 C330,152 364,184 354,262 C346,214 318,196 280,198 C250,200 230,214 222,236 C218,246 212,256 206,262 Z" fill={C.navy2} stroke={C.navy} i={0.46} />
          <P d="M236,214 C258,206 290,204 318,214" stroke={C.navySoft} w={2} i={0.5} />
          {/* Diadema y micrófono */}
          <P d="M210,246 C200,140 360,140 350,246" stroke={C.ink} w={6} i={0.52} />
          <Rect x={196} y={238} w={22} h={42} r={10} fill={C.ink} stroke={C.ink} i={0.55} />
          <P d="M206,278 C210,320 228,334 248,330" stroke={C.ink} w={4} i={0.58} />
          <Circ cx={251} cy={329} r={6} fill={C.ink} stroke={C.ink} i={0.6} />
          {/* Rostro */}
          <Eyes x1={256} x2={306} y={262} open={face.eye * blinkV} i={fo} />
          <Brows x1={256} x2={306} y={240} brow={face.brow} o={fo} thick={3.2} />
          <path d="M282,268 Q276,290 288,292" stroke={C.navy} strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={fo} />
          <Mouth x={282} y={312} w={32} curve={face.mouth} talk={talk} o={fo} />
          <circle cx={240} cy={292} r={9} fill="#E7A7A0" opacity={0.35 * fo} />
          <circle cx={324} cy={292} r={9} fill="#E7A7A0" opacity={0.35 * fo} />
          {/* Arete */}
          <Circ cx={348} cy={286} r={4} fill={C.gold} stroke={C.gold} i={0.62} />
        </g>
      </svg>
    </DrawCtx.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Ramiro Torres · cliente                                              */
/* ------------------------------------------------------------------ */

const SWEATER = "#D9C9A4";

export const Ramiro: React.FC<{draw?: number; face: Face; talk: number; blinkV: number; tense: number}> = ({draw = 1, face, talk, blinkV, tense}) => {
  const fo = Math.max(0, Math.min(1, (draw - 0.75) / 0.25));
  const lean = face.lean;
  return (
    <DrawCtx.Provider value={draw}>
      <svg viewBox="0 0 560 640" width={560} height={640} style={{overflow: "visible"}}>
        {/* Sillón */}
        <P d="M96,640 V300 Q96,240 160,236 H400 Q464,240 464,300 V640" fill={C.sand} stroke={C.navy} i={0} />
        <P d="M140,300 Q140,276 166,274 H394 Q420,276 420,300" stroke={C.line} w={2.2} i={0.05} />
        <Rect x={50} y={440} w={110} h={200} r={30} fill={C.sand} i={0.08} />
        <Rect x={400} y={440} w={110} h={200} r={30} fill={C.sand} i={0.1} />
        <g transform={`translate(${lean * 0.4} ${lean * 0.8}) rotate(${face.tilt * 0.2} 280 600)`}>
          {/* Torso: suéter con cuello de camisa */}
          <P d="M150,640 C146,470 180,396 248,372 L312,372 C380,396 414,470 410,640 Z" fill={SWEATER} stroke={C.navy} i={0.14} />
          <P d="M248,372 L280,410 L312,372" fill={C.white} stroke={C.navy} i={0.18} />
          <P d="M256,374 L268,404 M304,374 L292,404" stroke={C.navy} w={2.4} i={0.2} />
          <P d="M200,470 Q206,560 196,640 M360,470 Q354,560 364,640" stroke={C.line} w={2} i={0.22} />
          {/* Brazo izquierdo (del espectador) apoyado */}
          <P d="M162,470 C130,520 120,570 150,600 Q170,612 196,600" stroke={C.navy} w={46} i={0.24} />
          <P d="M162,470 C130,520 120,570 150,600 Q170,612 196,600" stroke={SWEATER} w={40} i={0.24} />
          <P d="M188,586 Q214,580 226,598 Q228,614 206,616 Q188,616 184,604 Z" fill={SKIN} stroke={SKIN_LINE} i={0.26} />
        </g>
        {/* Cabeza */}
        <g transform={`translate(${lean * 0.6} ${lean * 1.1}) rotate(${face.tilt} 280 350)`}>
          <P d="M256,318 L256,376 L304,376 L304,318" fill={SKIN} stroke={SKIN_LINE} i={0.3} />
          <P d="M206,252 C204,330 240,358 280,358 C320,358 356,330 354,252 C352,184 322,160 280,160 C238,160 208,184 206,252 Z" fill={SKIN} stroke={SKIN_LINE} i={0.32} />
          {/* Orejas */}
          <P d="M208,250 Q190,248 192,272 Q196,292 212,290" fill={SKIN} stroke={SKIN_LINE} i={0.34} />
          {/* Cabello gris en los lados, entradas arriba */}
          <P d="M206,256 C200,206 214,180 236,170 C228,196 226,222 224,246 Z" fill={C.logoGray} stroke={C.navy} w={2.4} i={0.36} />
          <P d="M354,256 C360,206 346,180 324,170 C332,196 334,222 336,246 Z" fill={C.logoGray} stroke={C.navy} w={2.4} i={0.37} />
          <P d="M246,168 Q280,156 314,168" stroke={C.logoGray} w={5} i={0.38} />
          {/* Lentes */}
          <Rect x={232} y={246} w={42} h={30} r={9} stroke={C.navy} sw={3} i={0.42} />
          <Rect x={286} y={246} w={42} h={30} r={9} stroke={C.navy} sw={3} i={0.44} />
          <P d="M274,258 Q280,254 286,258" w={3} i={0.45} />
          {/* Rostro */}
          <Eyes x1={253} x2={307} y={262} open={face.eye * blinkV} i={fo} />
          <Brows x1={253} x2={307} y={236} brow={face.brow} o={fo} thick={4.6} />
          <path d="M280,270 Q272,294 286,298" stroke={C.navy} strokeWidth={2.8} fill="none" strokeLinecap="round" opacity={fo} />
          {/* Bigote */}
          <path d="M252,312 Q266,300 280,306 Q294,300 308,312 Q296,318 280,314 Q264,318 252,312 Z" fill="#7A7068" stroke={C.navy} strokeWidth={2} opacity={fo} />
          <Mouth x={280} y={326} w={34} curve={face.mouth} talk={talk} o={fo} />
          {/* Arrugas de tensión en la frente cuando está cerrado */}
          <path d="M262,214 Q280,208 298,214 M266,224 Q280,220 294,224" stroke={C.navy} strokeWidth={2} fill="none" opacity={fo * tense} strokeLinecap="round" />
        </g>
        {/* Brazo con el celular al oído */}
        <g transform={`translate(${lean * 0.6} ${lean * 1.1})`}>
          <P d="M398,476 C452,446 444,360 388,302" stroke={C.navy} w={46} i={0.5} />
          <P d="M398,476 C452,446 444,360 388,302" stroke={SWEATER} w={40} i={0.5} />
          <Rect x={346} y={222} w={30} h={62} r={7} fill={C.ink} stroke={C.ink} i={0.54} />
          <P d="M366,262 Q394,262 396,288 Q394,310 372,306 Q356,302 360,284 Z" fill={SKIN} stroke={SKIN_LINE} i={0.56} />
        </g>
      </svg>
    </DrawCtx.Provider>
  );
};
