/**
 * Guion "Cliente difícil" (Guion-asesor-cliente-dificil.pdf). Fuente única para la voz, el texto en pantalla y las escenas.
 *
 * - `text`: lo que se ve. Las **palabras clave** van entre dobles asteriscos (las negritas del PDF).
 * - `say`: lo que se manda a ElevenLabs (con etiquetas de emoción). Si falta, se usa `text` sin asteriscos.
 * - Los corchetes del PDF ([monto], [plazo]) no se pueden decir en voz: se dicen sin la cifra y en pantalla
 *   aparece la nota "use los datos reales del plan".
 */
export type Who = "N" | "M" | "R";

/** Estado del señor Torres: va de cerrado (0) a abierto (1). */
export type Mood =
  | "seco"
  | "cortante"
  | "impaciente"
  | "molesto"
  | "defensivo"
  | "dolido"
  | "reservado"
  | "regañadientes"
  | "desconfia"
  | "suaviza"
  | "sincero"
  | "interesado"
  | "convencido"
  | "apenado";

export const MOOD: Record<Mood, {label: string; open: number}> = {
  seco: {label: "seco, desconfiado", open: 0.12},
  cortante: {label: "cortante, quiere colgar", open: 0.04},
  impaciente: {label: "impaciente", open: 0.14},
  molesto: {label: "molesto, sube el tono", open: 0.02},
  defensivo: {label: "a la defensiva", open: 0.08},
  dolido: {label: "baja la guardia", open: 0.42},
  reservado: {label: "todavía reservado", open: 0.46},
  regañadientes: {label: "a regañadientes", open: 0.55},
  desconfia: {label: "desconfía, pero ya pregunta", open: 0.6},
  suaviza: {label: "suaviza el tono", open: 0.72},
  sincero: {label: "sincero", open: 0.8},
  interesado: {label: "interesado, toma la iniciativa", open: 0.9},
  convencido: {label: "ya convencido", open: 0.97},
  apenado: {label: "apenado, amable", open: 1},
};

/** Los cuatro pasos del método (riel superior). */
export const METHOD = ["Escuchar", "Validar", "Reencuadrar", "Preguntar"] as const;
export type Step = (typeof METHOD)[number];

/** Ilustraciones que acompañan una línea (ver src/inserts.tsx). */
export type Insert =
  | "tres-de-diez"
  | "seguro-auto"
  | "recuerdo"
  | "pagos"
  | "incluye"
  | "contrato-24h"
  | "aislar"
  | "resumen"
  | "whatsapp-agenda"
  | "recap";

export type Line = {
  id: string;
  who: Who;
  text: string;
  say?: string;
  /** Rótulo del PDF (columna izquierda). */
  tag?: string;
  /** Pasos del método que se encienden en el riel. */
  steps?: Step[];
  /** Objeción en curso (1, 2 o 3, como en el PDF). */
  objection?: 1 | 2 | 3;
  mood?: Mood;
  insert?: Insert;
  /** Nota en pantalla (placeholders del PDF). */
  note?: string;
};

export const OBJECTIONS: Record<1 | 2 | 3, string> = {
  1: "No me interesa",
  2: "Necesito pensarlo",
  3: "No quiero hablar de ese tema",
};

export const LINES: Line[] = [
  {
    id: "n01",
    who: "N",
    text: "Una llamada en frío. Mariana Ruiz, asesora de J. García López, le marca al señor Ramiro Torres: cincuenta y dos años, casado, dos hijos. Él no espera la llamada y no tiene ganas de hablar.",
  },
  {
    id: "n02",
    who: "N",
    text: "Fíjese en los cuatro pasos que usa Mariana: escuchar, validar, reencuadrar y preguntar. Y en que cada respuesta suya termina con una pregunta abierta.",
  },
  {id: "m01", who: "M", tag: "Apertura", text: "Buenas tardes. ¿Hablo con el señor Ramiro Torres?", say: "[warmly] Buenas tardes. ¿Hablo con el señor Ramiro Torres?"},
  {id: "r01", who: "R", mood: "seco", text: "Sí. ¿Quién habla?", say: "[dry] [suspicious] Sí. ¿Quién habla?"},
  {
    id: "m02",
    who: "M",
    tag: "Apertura",
    steps: ["Preguntar"],
    text: "Mucho gusto, señor Torres. Le saluda Mariana Ruiz, **asesora** de **J. García López**. Le llamo porque ayudamos a las familias a **dejar resuelto con calma** un tema que casi nadie **planea**. Antes de contarle nada, quiero **entender su situación**: ¿cómo tiene **previsto** hoy que su familia resuelva un imprevisto?",
  },
  {
    id: "n03",
    who: "N",
    text: "Mariana no pidió permiso. No dijo «¿me permite dos minutos?». Hizo una pregunta para entender. A una pregunta de sí o no, el cliente difícil siempre contesta que no.",
  },
  {
    id: "r02",
    who: "R",
    mood: "cortante",
    objection: 1,
    text: "Mire, señorita, **no me interesa**. Ya me han llamado de mil lados y estoy ocupado.",
    say: "[annoyed] [curt] Mire, señorita, no me interesa. Ya me han llamado de mil lados y estoy ocupado.",
  },
  {id: "n04", who: "N", objection: 1, text: "Primera objeción: «no me interesa». Mariana no discute. Primero valida."},
  {
    id: "m03",
    who: "M",
    tag: "Objeción 1 · Validar",
    objection: 1,
    steps: ["Validar", "Preguntar"],
    insert: "tres-de-diez",
    text: "Le **entiendo**, señor Torres, y le **agradezco** que me conteste. Si fuera de su interés, usted ya habría acudido a contratar, ¿no es así? Solo **3 de cada 10 mexicanos** cuentan con esta **protección**, y casi todos, cuando ocurre algo así, **hubieran preferido tener un plan**. No pretendo **convencerle** de nada. Solo le pregunto: si mañana su familia tuviera que **hacerse cargo de todo**, ¿quién **tomaría las decisiones** y cómo se **cubriría el gasto**?",
  },
  {id: "r03", who: "R", mood: "impaciente", text: "Pues... no sé, nunca lo he pensado. ¿Qué vende? ¿Seguros?", say: "[impatient] Pues... no sé, nunca lo he pensado. ¿Qué vende? ¿Seguros?"},
  {
    id: "m04",
    who: "M",
    tag: "Reencuadrar",
    steps: ["Reencuadrar"],
    text: "Es un **plan funerario a futuro**: una forma de dejar **todo resuelto hoy**, con calma, para que su familia no tenga que hacerlo con prisa.",
  },
  {
    id: "r04",
    who: "R",
    mood: "molesto",
    objection: 3,
    text: "¿Funerario? No, no, no. **No quiero hablar de ese tema.** Estoy sano y, además, eso se llama solo.",
    say: "[angry] [raising voice] ¿Funerario? No, no, no. No quiero hablar de ese tema. Estoy sano y, además, eso se llama solo.",
  },
  {id: "n05", who: "N", objection: 3, text: "Tercera objeción: «no quiero hablar de ese tema». Mariana le da la razón y lleva la plática a lo que a él sí le importa: proteger a su familia."},
  {
    id: "m05",
    who: "M",
    tag: "Objeción 3 · Escuchar y validar",
    objection: 3,
    steps: ["Escuchar", "Validar"],
    insert: "seguro-auto",
    text: "Le entiendo **perfectamente**; a nadie le gusta hablar de esto y **no quiero incomodarle**. Y tiene **toda la razón**: no se trata de pensar en la muerte, sino de **proteger a su familia**. Es como el **seguro del auto**: uno lo contrata **esperando no usarlo**.",
    say: "[softly] Le entiendo perfectamente; a nadie le gusta hablar de esto y no quiero incomodarle. [warmly] Y tiene toda la razón: no se trata de pensar en la muerte, sino de proteger a su familia. Es como el seguro del auto: uno lo contrata esperando no usarlo.",
  },
  {id: "r05", who: "R", mood: "defensivo", objection: 3, text: "Ustedes nada más quieren vender.", say: "[defensive] Ustedes nada más quieren vender."},
  {
    id: "m06",
    who: "M",
    tag: "Objeción 3 · Preguntar",
    objection: 3,
    steps: ["Preguntar"],
    text: "Mi trabajo es **informarle**, y usted decide. Dígame algo, señor Torres: ¿le ha tocado **acompañar** a algún familiar en una situación así? ¿Cómo fue para la familia **resolver todo en ese momento**?",
    say: "[calmly] Mi trabajo es informarle, y usted decide. Dígame algo, señor Torres: ¿le ha tocado acompañar a algún familiar en una situación así? [softly] ¿Cómo fue para la familia resolver todo en ese momento?",
  },
  {
    id: "r06",
    who: "R",
    mood: "dolido",
    insert: "recuerdo",
    text: "...Sí. Cuando falleció mi papá. La verdad, fue un desastre. Mis hermanos y yo discutiendo quién pagaba, buscando funeraria a las dos de la mañana.",
    say: "[long pause] [sad] [softly] ...Sí. Cuando falleció mi papá. [sighs] La verdad, fue un desastre. Mis hermanos y yo discutiendo quién pagaba, buscando funeraria a las dos de la mañana.",
  },
  {id: "n06", who: "N", text: "Aquí cambió la llamada. Con una sola pregunta, el señor Torres dejó de defenderse y empezó a contar lo que vivió."},
  {
    id: "m07",
    who: "M",
    tag: "Escuchar · Validar",
    steps: ["Escuchar", "Validar"],
    text: "Lamento mucho lo de su papá, señor Torres. Lo que me cuenta les pasa a muchas familias: **decisiones difíciles en el peor momento**, con prisa y sin saber cuánto va a costar. **Precisamente para eso existe el plan**: para que, **llegado el momento**, su familia no tenga que resolver nada, **solo acompañarse**.",
    say: "[softly] [sympathetic] Lamento mucho lo de su papá, señor Torres. Lo que me cuenta les pasa a muchas familias: decisiones difíciles en el peor momento, con prisa y sin saber cuánto va a costar. [warmly] Precisamente para eso existe el plan: para que, llegado el momento, su familia no tenga que resolver nada, solo acompañarse.",
  },
  {id: "m08", who: "M", tag: "Diagnóstico", steps: ["Preguntar"], text: "Para orientarle bien, ¿el plan sería para usted? ¿Quiénes forman su **familia**?"},
  {
    id: "r07",
    who: "R",
    mood: "reservado",
    text: "Mi esposa y dos hijos. Pero ya le digo que no ando para gastos. Eso ha de ser **carísimo**.",
    say: "[reserved] Mi esposa y dos hijos. Pero ya le digo que no ando para gastos. Eso ha de ser carísimo.",
  },
  {
    id: "m09",
    who: "M",
    tag: "Reencuadrar",
    steps: ["Reencuadrar", "Preguntar"],
    insert: "pagos",
    note: "Diga el [monto] y el [plazo] reales del plan. Nunca invente precios ni condiciones.",
    text: "Le entiendo, y **justamente por eso** se contrata hoy: usted lo **paga en pagos** de [monto] durante [plazo], **a precio de hoy**, en lugar de que su familia tenga que reunir todo de un día para otro. ¿Ha pensado si usted preferiría **inhumación o cremación**?",
    say: "Le entiendo, y justamente por eso se contrata hoy: usted lo paga en pagos, a precio de hoy, en lugar de que su familia tenga que reunir todo de un día para otro. ¿Ha pensado si usted preferiría inhumación o cremación?",
  },
  {id: "r08", who: "R", mood: "regañadientes", text: "Cremación, supongo. Pero, ¿qué incluye exactamente?", say: "[reluctant] Cremación, supongo. [curious] Pero, ¿qué incluye exactamente?"},
  {
    id: "m10",
    who: "M",
    tag: "Producto",
    insert: "incluye",
    note: "Ampliación de sala: diga si en este plan está incluida o qué costo adicional tiene.",
    text: "El plan **incluye** el **traslado**, la **sala de velación**, el **ataúd o la urna** y los **trámites**. Si la familia necesita más espacio para recibir a la gente, existe la **ampliación de sala**, y le digo con claridad si su plan la incluye. Y lo tiene todo por **contrato**, con la **vigencia**, **cobertura** y condiciones de **cancelación** por escrito.",
    say: "El plan incluye el traslado, la sala de velación, el ataúd o la urna y los trámites. Si la familia necesita más espacio para recibir a la gente, existe la ampliación de sala, y le digo con claridad si su plan la incluye. Y lo tiene todo por contrato, con la vigencia, cobertura y condiciones de cancelación por escrito.",
  },
  {
    id: "r09",
    who: "R",
    mood: "desconfia",
    text: "¿Y quién me garantiza que dentro de veinte años ustedes van a seguir ahí?",
    say: "[skeptical] ¿Y quién me garantiza que dentro de veinte años ustedes van a seguir ahí?",
  },
  {
    id: "m11",
    who: "M",
    tag: "Validar · Diferenciadores",
    steps: ["Validar", "Preguntar"],
    insert: "contrato-24h",
    text: "Es una **pregunta muy válida**. Usted firma un **contrato**, cuenta con el **respaldo** de J. García López y con **atención las 24 horas**: su familia solo hace **una llamada** y nosotros nos encargamos. ¿Hasta aquí, **le queda claro** cómo funciona?",
    say: "[confident] [warmly] Es una pregunta muy válida. Usted firma un contrato, cuenta con el respaldo de J. García López y con atención las 24 horas: su familia solo hace una llamada y nosotros nos encargamos. ¿Hasta aquí, le queda claro cómo funciona?",
  },
  {id: "r10", who: "R", mood: "suaviza", objection: 2, text: "Sí... se oye bien. Pero **necesito pensarlo**.", say: "[thoughtful] Sí... se oye bien. Pero necesito pensarlo."},
  {id: "n07", who: "N", objection: 2, text: "Segunda objeción: «necesito pensarlo». Mariana no presiona. Le ayuda a ubicar qué es exactamente lo que quiere pensar."},
  {
    id: "m12",
    who: "M",
    tag: "Objeción 2 · Aislar la duda",
    objection: 2,
    steps: ["Validar", "Preguntar"],
    insert: "aislar",
    text: "Me parece **muy bien**, es una **decisión importante**. Para **ayudarle a pensarlo**: ¿qué es lo que le gustaría analizar, el plan, la **forma de pago** o **consultarlo** con su esposa?",
  },
  {id: "r11", who: "R", mood: "sincero", objection: 2, text: "Con mi esposa. Ella lleva las cuentas de la casa.", say: "[sincere] Con mi esposa. [chuckles softly] Ella lleva las cuentas de la casa."},
  {
    id: "m13",
    who: "M",
    tag: "Objeción 2 · Resumir y confirmar",
    objection: 2,
    steps: ["Preguntar"],
    insert: "resumen",
    note: "Diga el [monto] real del plan.",
    text: "Claro que sí. Permítame **resumirle**: un plan de **cremación** para usted, con traslado, sala, urna y trámites incluidos, en **pagos** de [monto], y su familia **sin gastos ni decisiones** de última hora. De todo esto, ¿hay algo que **no le haya quedado claro**?",
    say: "Claro que sí. Permítame resumirle: un plan de cremación para usted, con traslado, sala, urna y trámites incluidos, en pagos, y su familia sin gastos ni decisiones de última hora. De todo esto, ¿hay algo que no le haya quedado claro?",
  },
  {
    id: "r12",
    who: "R",
    mood: "interesado",
    text: "No, quedó claro. Oiga, ¿me puede **mandar la información por escrito**? Quiero que mi esposa la vea. Y también quiero saber **cuánto saldría si incluyo a mi mamá**.",
    say: "[interested] No, quedó claro. Oiga, ¿me puede mandar la información por escrito? Quiero que mi esposa la vea. Y también quiero saber cuánto saldría si incluyo a mi mamá.",
  },
  {
    id: "m14",
    who: "M",
    tag: "Cierre · Siguiente paso",
    steps: ["Preguntar"],
    insert: "whatsapp-agenda",
    text: "**Con mucho gusto.** Le envío hoy mismo la información por **WhatsApp**, con la opción para su mamá. ¿Le parece si **agendamos una llamada** con su esposa para resolver las dudas **juntos**? ¿Le queda mejor el **jueves** o el **sábado**?",
    say: "[happy] Con mucho gusto. Le envío hoy mismo la información por WhatsApp, con la opción para su mamá. ¿Le parece si agendamos una llamada con su esposa para resolver las dudas juntos? ¿Le queda mejor el jueves o el sábado?",
  },
  {id: "r13", who: "R", mood: "convencido", text: "El sábado en la mañana. A las diez.", say: "[friendly] El sábado en la mañana. A las diez."},
  {
    id: "m15",
    who: "M",
    tag: "Cierre · Recapitular",
    insert: "recap",
    text: "Perfecto. **Quedamos así**: hoy le envío por WhatsApp el plan de cremación y la cotización para su mamá, y el **sábado a las diez** hablamos con usted y su esposa. Mi nombre es Mariana Ruiz y este es mi número directo para lo que necesite.",
  },
  {id: "r14", who: "R", mood: "apenado", text: "Gracias, señorita. Y perdone si al principio fui grosero.", say: "[embarrassed] [warmly] Gracias, señorita. Y perdone si al principio fui grosero."},
  {id: "m16", who: "M", tag: "Despedida", text: "No se preocupe, señor Torres. Al contrario, **gracias por su confianza**. Que tenga muy buena tarde.", say: "[warmly] No se preocupe, señor Torres. Al contrario, gracias por su confianza. Que tenga muy buena tarde."},
  {
    id: "n08",
    who: "N",
    text: "Al principio, el señor Torres quería colgar. Al final, él mismo pidió la información y puso la hora de la cita. Mariana nunca discutió: escuchó, validó, reencuadró y preguntó.",
  },
  {
    id: "n09",
    who: "N",
    text: "Cuide las palabras. En lugar de «pero», diga «y justamente por eso». En lugar de «cuando usted se muera», diga «llegado el momento». Hable siempre de usted, responda breve y cierre con una pregunta.",
  },
  {id: "n10", who: "N", text: "Practíquelo en parejas: un compañero lee el guion del cliente y usted responde sin leer."},
];

export const plain = (s: string) => s.replace(/\*\*/g, "");
export const spoken = (l: Line) => l.say ?? plain(l.text);
