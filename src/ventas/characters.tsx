import React from "react";
import {C} from "../theme";
import {Circ, DrawCtx, P, Rect} from "../draw";
import {Brows, Eyes, Face, Mouth, SKIN} from "../characters";

/* ------------------------------------------------------------------ */
/* Andrés Medina · asesor (mismo encuadre que Mariana: escritorio y diadema) */
/* ------------------------------------------------------------------ */

const HAIR_A = "#2B2622";

export const Andres: React.FC<{draw?: number; face: Face; talk: number; blinkV: number; nod: number}> = ({draw = 1, face, talk, blinkV, nod}) => {
  const fo = Math.max(0, Math.min(1, (draw - 0.75) / 0.25));
  return (
    <DrawCtx.Provider value={draw}>
      <svg viewBox="0 0 560 640" width={560} height={640} style={{overflow: "visible"}}>
        {/* Escritorio, libreta y pluma */}
        <Rect x={10} y={520} w={540} h={120} r={6} fill={C.white} i={0} />
        <P d="M10,532 H550" i={0.05} w={2.4} stroke={C.line} />
        <Rect x={420} y={482} w={96} h={40} r={4} fill={C.cream2} i={0.08} />
        <P d="M432,494 H500 M432,504 H486" stroke={C.line} w={2} i={0.1} />
        {/* Saco, camisa y corbata */}
        <g transform={`rotate(${face.tilt * 0.25} 280 520)`}>
          <P d="M134,522 C134,426 182,382 250,362 L310,362 C378,382 426,426 426,522 Z" fill={C.navy} stroke={C.navy} i={0.15} />
          <P d="M250,362 L280,446 L310,362 Z" fill={C.white} stroke={C.navy} i={0.2} />
          <P d="M272,374 L288,374 L292,388 L284,446 L276,446 L268,388 Z" fill={C.gold} stroke={C.gold} w={2} i={0.24} />
          <P d="M250,362 L236,406 L272,424 M310,362 L324,406 L288,424" stroke={C.white} w={2.6} i={0.26} />
          {/* Gafete JGL */}
          <Rect x={334} y={420} w={46} h={30} r={4} fill={C.white} stroke={C.white} sw={1} i={0.28} />
          <P d="M342,432 H372 M342,440 H364" stroke={C.gold} w={2.4} i={0.3} />
          {/* Manos */}
          <P d="M176,516 Q174,496 196,494 L236,494 Q252,496 250,512 Q248,526 232,526 L190,526 Q176,526 176,516 Z" fill={SKIN} stroke={C.navy} i={0.32} />
          <P d="M316,512 Q318,494 336,494 L372,496 Q388,500 386,514 Q384,526 368,526 L328,526 Q314,526 316,512 Z" fill={SKIN} stroke={C.navy} i={0.34} />
          <P d="M378,502 L414,474" stroke={C.gold} w={4} i={0.36} />
        </g>
        {/* Cabeza */}
        <g transform={`rotate(${face.tilt + nod} 280 340) translate(0 ${face.lean * 0.3})`}>
          <P d="M258,318 L258,366 L302,366 L302,318" fill={SKIN} stroke={C.navy} i={0.38} />
          <P d="M210,256 Q192,252 194,276 Q198,296 214,292" fill={SKIN} stroke={C.navy} i={0.4} />
          <P d="M350,256 Q368,252 366,276 Q362,296 346,292" fill={SKIN} stroke={C.navy} i={0.41} />
          <P d="M212,250 C210,322 240,350 280,350 C320,350 350,322 348,250 C346,188 318,166 280,166 C242,166 214,188 212,250 Z" fill={SKIN} stroke={C.navy} i={0.42} />
          {/* Cabello corto, raya a un lado */}
          <P d="M210,252 C202,182 240,150 284,150 C330,150 360,182 350,252 C346,222 336,204 318,196 C292,206 250,204 226,214 C218,226 212,238 210,252 Z" fill={HAIR_A} stroke={C.navy} i={0.46} />
          <P d="M300,160 Q270,176 252,200" stroke={C.navySoft} w={2} i={0.5} />
          {/* Diadema y micrófono */}
          <P d="M206,252 C196,140 364,140 354,252" stroke={C.ink} w={6} i={0.52} />
          <Rect x={192} y={244} w={22} h={42} r={10} fill={C.ink} stroke={C.ink} i={0.55} />
          <P d="M202,284 C206,324 226,338 248,334" stroke={C.ink} w={4} i={0.58} />
          <Circ cx={251} cy={333} r={6} fill={C.ink} stroke={C.ink} i={0.6} />
          {/* Rostro */}
          <Eyes x1={256} x2={306} y={264} open={face.eye * blinkV} i={fo} />
          <Brows x1={256} x2={306} y={240} brow={face.brow} o={fo} thick={4.4} />
          <path d="M282,270 Q275,292 288,294" stroke={C.navy} strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={fo} />
          <Mouth x={282} y={316} w={34} curve={face.mouth} talk={talk} o={fo} />
        </g>
      </svg>
    </DrawCtx.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* Clientes: mismo sillón y celular al oído que Ramiro; cambian pelo, ropa y edad */
/* ------------------------------------------------------------------ */

type Look = {skin: string; top: string; hair: string; kind: "P" | "J" | "C"};

export const LOOKS: Record<"P" | "J" | "C", Look> = {
  /** Patricia Morales, 58: melena castaña con canas, blusa azul claro y collar. */
  P: {skin: "#E9C9AE", top: "#B9C4D9", hair: "#6B5546", kind: "P"},
  /** Joaquín Rivas, 45: pelo corto oscuro, playera tipo polo. */
  J: {skin: "#D7AE8C", top: "#7E8B6A", hair: "#2E2A28", kind: "J"},
  /** Carmen Salazar, 71: pelo blanco recogido, lentes y rebozo. */
  C: {skin: "#EFD8C6", top: "#C9B4C8", hair: "#E6E1DA", kind: "C"},
};

export const Client: React.FC<{who: "P" | "J" | "C"; draw?: number; face: Face; talk: number; blinkV: number}> = ({who, draw = 1, face, talk, blinkV}) => {
  const L = LOOKS[who];
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
          <P d="M150,640 C146,470 180,396 248,372 L312,372 C380,396 414,470 410,640 Z" fill={L.top} stroke={C.navy} i={0.14} />
          {L.kind === "P" && (
            <>
              <P d="M246,374 Q280,412 314,374" fill={L.skin} stroke={C.navy} i={0.18} />
              {[-24, -12, 0, 12, 24].map((dx, k) => (
                <Circ key={k} cx={280 + dx} cy={400 - Math.abs(dx) * 0.55} r={4} fill={C.gold} stroke={C.gold} i={0.2} />
              ))}
            </>
          )}
          {L.kind === "J" && (
            <>
              <P d="M244,372 L280,404 L316,372 L300,392 L280,396 L260,392 Z" fill={C.white} stroke={C.navy} i={0.18} />
              <P d="M280,404 V446" stroke={C.navy} w={2.4} i={0.2} />
              <Circ cx={280} cy={420} r={3} fill={C.navy} i={0.22} />
            </>
          )}
          {L.kind === "C" && (
            <>
              <P d="M248,372 L280,398 L312,372" fill={C.white} stroke={C.navy} i={0.16} />
              {/* Rebozo sobre los hombros */}
              <P d="M156,520 C150,440 188,392 246,376 Q280,430 314,376 C372,392 410,440 404,520 Q350,470 280,470 Q210,470 156,520 Z" fill={C.goldSoft} stroke={C.navy} i={0.2} />
              <P d="M184,476 L176,500 M206,462 L200,488 M354,462 L360,488 M376,476 L384,500" stroke={C.gold} w={2.4} i={0.24} />
            </>
          )}
          <P d="M200,470 Q206,560 196,640 M360,470 Q354,560 364,640" stroke={C.line} w={2} i={0.22} />
          <P d="M162,470 C130,520 120,570 150,600 Q170,612 196,600" stroke={C.navy} w={46} i={0.24} />
          <P d="M162,470 C130,520 120,570 150,600 Q170,612 196,600" stroke={L.top} w={40} i={0.24} />
          <P d="M188,586 Q214,580 226,598 Q228,614 206,616 Q188,616 184,604 Z" fill={L.skin} stroke={C.navy} i={0.26} />
        </g>
        {/* Cabeza */}
        <g transform={`translate(${lean * 0.6} ${lean * 1.1}) rotate(${face.tilt} 280 350)`}>
          {/* Pelo de atrás (melena o chongo) */}
          {L.kind === "P" && <P d="M200,248 C194,322 208,354 236,362 L324,362 C352,354 366,322 360,248 Z" fill={L.hair} stroke={C.navy} i={0.28} />}
          {L.kind === "C" && <Circ cx={280} cy={146} r={30} fill={L.hair} stroke={C.navy} i={0.28} />}
          <P d="M256,318 L256,376 L304,376 L304,318" fill={L.skin} stroke={C.navy} i={0.3} />
          {L.kind !== "P" && <P d="M208,250 Q190,248 192,272 Q196,292 212,290" fill={L.skin} stroke={C.navy} i={0.31} />}
          <P d="M206,252 C204,330 240,358 280,358 C320,358 356,330 354,252 C352,184 322,160 280,160 C238,160 208,184 206,252 Z" fill={L.skin} stroke={C.navy} i={0.32} />
          {/* Pelo de enfrente */}
          {L.kind === "P" && <P d="M204,262 C194,182 244,150 284,152 C328,154 366,188 356,262 C344,214 306,194 264,204 C236,212 216,232 204,262 Z" fill={L.hair} stroke={C.navy} i={0.36} />}
          {L.kind === "P" && <P d="M300,170 C318,180 334,196 342,214" stroke="#A8968A" w={2.4} i={0.4} />}
          {L.kind === "J" && <P d="M208,246 C202,184 240,158 280,158 C322,158 358,184 352,246 C348,214 332,196 304,192 C272,186 238,196 222,214 C214,224 210,234 208,246 Z" fill={L.hair} stroke={C.navy} i={0.36} />}
          {L.kind === "C" && <P d="M206,256 C198,190 238,164 280,164 C322,164 362,190 354,256 C342,214 316,196 280,196 C244,196 218,214 206,256 Z" fill={L.hair} stroke={C.navy} i={0.36} />}
          {/* Lentes (Carmen) */}
          {L.kind === "C" && (
            <>
              <Rect x={232} y={248} w={42} h={30} r={12} stroke={C.navy} sw={3} i={0.42} />
              <Rect x={286} y={248} w={42} h={30} r={12} stroke={C.navy} sw={3} i={0.44} />
              <P d="M274,260 Q280,256 286,260" w={3} i={0.45} />
            </>
          )}
          {/* Aretes */}
          {L.kind !== "J" && <Circ cx={L.kind === "P" ? 212 : 204} cy={300} r={5} fill={C.gold} stroke={C.gold} i={0.46} />}
          <Eyes x1={253} x2={307} y={263} open={face.eye * blinkV} i={fo} />
          <Brows x1={253} x2={307} y={238} brow={face.brow} o={fo} thick={L.kind === "J" ? 4.8 : 3.4} />
          <path d="M280,270 Q272,294 286,298" stroke={C.navy} strokeWidth={2.8} fill="none" strokeLinecap="round" opacity={fo} />
          {L.kind === "J" && <path d="M236,318 Q244,344 280,350 Q316,344 324,318" stroke={C.navy} strokeWidth={1.6} strokeDasharray="1 6" strokeLinecap="round" fill="none" opacity={fo * 0.6} />}
          {L.kind === "C" && <path d="M226,272 L218,276 M334,272 L342,276 M244,318 Q240,326 244,334 M316,318 Q320,326 316,334" stroke={C.navy} strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={fo * 0.6} />}
          <Mouth x={280} y={322} w={32} curve={face.mouth} talk={talk} o={fo} />
          {L.kind !== "J" && (
            <>
              <circle cx={238} cy={298} r={9} fill="#E7A7A0" opacity={0.3 * fo} />
              <circle cx={322} cy={298} r={9} fill="#E7A7A0" opacity={0.3 * fo} />
            </>
          )}
        </g>
        {/* Brazo con el celular al oído */}
        <g transform={`translate(${lean * 0.6} ${lean * 1.1})`}>
          <P d="M398,476 C452,446 444,360 388,302" stroke={C.navy} w={46} i={0.5} />
          <P d="M398,476 C452,446 444,360 388,302" stroke={L.top} w={40} i={0.5} />
          <Rect x={346} y={222} w={30} h={62} r={7} fill={C.ink} stroke={C.ink} i={0.54} />
          <P d="M366,262 Q394,262 396,288 Q394,310 372,306 Q356,302 360,284 Z" fill={L.skin} stroke={C.navy} i={0.56} />
        </g>
      </svg>
    </DrawCtx.Provider>
  );
};
