/**
 * Guion "Script de ventas telefónicas" (Script ventas.pdf): salió del análisis de las llamadas de quien más vende.
 * Fuente única para la voz, el texto en pantalla y las escenas del video `ScriptVentas`.
 *
 * Son cuatro llamadas de un mismo asesor (Andrés Medina) con tres clientes:
 *   1. Primera llamada con la señora Patricia Morales: apertura, descubrir, presentar, «lo tengo que consultar con mi
 *      familia», «mándeme la información por WhatsApp» y cierre con una nueva llamada.
 *   2. El señor Joaquín Rivas: «no tengo dinero» y cierre cuando por ahora no puede contratar.
 *   3. La señora Carmen Salazar: «lo voy a pensar» y «¿puedo usar el servicio antes de terminar de pagar?».
 *   4. Seguimiento con la señora Morales: interesada pero aún no decide, y cierre con una visita.
 *
 * - `text`: lo que se ve; **palabras clave** entre dobles asteriscos.
 * - `say`: lo que se manda a ElevenLabs. Los corchetes del PDF ([importe confirmado], [nombre del plan]…) nunca se dicen:
 *   en pantalla quedan como hueco dorado y la voz dice la frase sin el dato.
 */
export type Who = "N" | "A" | "P" | "J" | "C";

/** Las cuatro fases del guion (riel superior). */
export const PHASES = ["Abrir", "Descubrir", "Presentar", "Acordar"] as const;
export type Phase = (typeof PHASES)[number];

export type Insert = "preguntas" | "necesidad" | "cotizacion" | "elegir" | "whatsapp" | "preocupa" | "condiciones" | "cita" | "puerta";

/** Lo que el asesor registra de cada cliente (regla de oro: registrar los compromisos). */
export type Ficha = {interes?: string; objecion?: string; info?: string; seguimiento?: string};

export type Line = {
  id: string;
  who: Who;
  text: string;
  say?: string;
  /** Rótulo del PDF (sección). */
  tag?: string;
  phase?: Phase;
  /** Objeción en curso (como la nombra el PDF). */
  objection?: string;
  insert?: Insert;
  /** Campos de la ficha que se llenan con esta línea. */
  ficha?: Ficha;
  /** Nota en pantalla (datos que hay que confirmar). */
  note?: string;
};

export const SCENES = [
  {n: 1, title: "Primera llamada", client: "P" as Who},
  {n: 2, title: "«No tengo dinero»", client: "J" as Who},
  {n: 3, title: "«Lo voy a pensar»", client: "C" as Who},
  {n: 4, title: "La llamada de seguimiento", client: "P" as Who},
];

export const PEOPLE: Record<Exclude<Who, "N">, {name: string; short: string; role: string}> = {
  A: {name: "Andrés Medina", short: "Andrés", role: "Asesor"},
  P: {name: "Patricia Morales", short: "Sra. Morales", role: "Cliente"},
  J: {name: "Joaquín Rivas", short: "Sr. Rivas", role: "Cliente"},
  C: {name: "Carmen Salazar", short: "Sra. Salazar", role: "Cliente"},
};

const CONFIRMAR = "Solo datos confirmados en la cotización vigente";

export const LINES: Line[] = [
  {
    id: "n01",
    who: "N",
    text: "Este guion salió de las llamadas reales de quien más vende en J. García López. Lo va a ver en cuatro llamadas de un mismo asesor, Andrés Medina, con tres clientes distintos.",
  },
  {
    id: "n02",
    who: "N",
    text: "Fíjese en el orden: abrir con confianza, descubrir la necesidad, presentar la opción adecuada y acordar un siguiente paso. Andrés pregunta antes de ofrecer.",
  },
  {id: "n03", who: "N", text: "Primera llamada. Andrés le marca a la señora Patricia Morales, de cincuenta y ocho años. Ella no lo conoce."},

  // ---------------- 1. Primera llamada: Patricia ----------------
  {id: "a01", who: "A", tag: "Apertura", phase: "Abrir", text: "Buenos días, ¿tengo el gusto de hablar con la señora **Patricia Morales**?", say: "[warmly] Buenos días, ¿tengo el gusto de hablar con la señora Patricia Morales?"},
  {id: "p01", who: "P", text: "Sí, ella habla. ¿Quién la busca?", say: "[cautious] Sí, ella habla. ¿Quién la busca?"},
  {
    id: "a02",
    who: "A",
    tag: "Apertura",
    phase: "Abrir",
    text: "Mucho gusto, mi nombre es **Andrés Medina** y me comunico de **J. García López**. El motivo de mi llamada es compartirle información sobre nuestros **planes de previsión funeraria**, para que usted conozca las alternativas y pueda **valorar si alguna se adapta** a sus necesidades y posibilidades.",
    say: "[friendly] Mucho gusto, mi nombre es Andrés Medina y me comunico de J. García López. [calm] El motivo de mi llamada es compartirle información sobre nuestros planes de previsión funeraria, para que usted conozca las alternativas y pueda valorar si alguna se adapta a sus necesidades y posibilidades.",
  },
  {
    id: "a03",
    who: "A",
    tag: "Apertura",
    phase: "Abrir",
    text: "¿Me permite hacerle **un par de preguntas** para orientarle mejor? **No quiero llenarle de información** que quizá no sea la que usted necesita.",
    say: "[warmly] ¿Me permite hacerle un par de preguntas para orientarle mejor? No quiero llenarle de información que quizá no sea la que usted necesita.",
  },
  {id: "p02", who: "P", text: "Ándele, dígame.", say: "[guarded] [softening] Ándele, dígame."},
  {
    id: "n04",
    who: "N",
    text: "Andrés sí pidió permiso, para hacerle un par de preguntas, y le explicó la razón: no quiere llenarla de información que no necesita.",
  },
  {
    id: "a04",
    who: "A",
    tag: "Descubrir la necesidad",
    phase: "Descubrir",
    insert: "preguntas",
    text: "Antes de explicarle nuestros planes, me gustaría conocer un poquito más de su situación. ¿Usted ha considerado anteriormente un plan de previsión, o sería **la primera vez** que revisa este tipo de opciones?",
  },
  {id: "p03", who: "P", text: "La primera vez. Nunca nos hemos sentado a verlo.", say: "[thoughtful] La primera vez. Nunca nos hemos sentado a verlo."},
  {
    id: "a05",
    who: "A",
    tag: "Descubrir la necesidad",
    phase: "Descubrir",
    insert: "preguntas",
    text: "Y en su caso, ¿estaría buscando **protegerse usted**, a su **pareja**, a sus **papás** o a **varios integrantes** de su familia?",
  },
  {id: "p04", who: "P", text: "A mi esposo y a mí. Y a lo mejor a mi mamá, que ya tiene ochenta y dos años.", say: "[thoughtful] A mi esposo y a mí. Y a lo mejor a mi mamá, que ya tiene ochenta y dos años."},
  {
    id: "a06",
    who: "A",
    tag: "Descubrir la necesidad",
    phase: "Descubrir",
    insert: "preguntas",
    text: "¿Hay alguna **necesidad en particular** que le gustaría resolver? Por ejemplo, contar con un servicio **previamente organizado**, evitar que su familia tenga que resolver todo **en un momento complicado**, o conocer **alternativas de pago**.",
  },
  {
    id: "p05",
    who: "P",
    ficha: {interes: "Que sus hijos no resuelvan todo a las carreras"},
    text: "Lo que no quiero es que mis hijos batallen como batallamos nosotros cuando murió mi papá. Fue todo **a las carreras**.",
    say: "[sincere] [a bit sad] Lo que no quiero es que mis hijos batallen como batallamos nosotros cuando murió mi papá. Fue todo a las carreras.",
  },
  {
    id: "a07",
    who: "A",
    tag: "Descubrir la necesidad",
    phase: "Descubrir",
    text: "**Comprendo** lo que me comenta. Entonces, si le parece, voy a explicarle las opciones que podrían **ajustarse a sus necesidades**.",
    say: "[gently] Comprendo lo que me comenta. [warmly] Entonces, si le parece, voy a explicarle las opciones que podrían ajustarse a sus necesidades.",
  },
  {
    id: "n05",
    who: "N",
    text: "Tres preguntas antes de hablar del plan: si ya lo había pensado, a quién quiere proteger y qué necesita resolver. Ahora Andrés sabe qué ofrecerle.",
  },
  {
    id: "a08",
    who: "A",
    tag: "Presentar la solución",
    phase: "Presentar",
    insert: "necesidad",
    text: "Por lo que me comenta, considero que lo más importante para usted es **que sus hijos no tengan que resolver todo a las carreras**.",
  },
  {
    id: "a09",
    who: "A",
    tag: "Presentar la solución",
    phase: "Presentar",
    insert: "cotizacion",
    note: CONFIRMAR,
    text: "Me gustaría explicarle **qué incluye** la opción que podría interesarle, **cuánto cuesta** y **cuáles son sus condiciones**, para que pueda decidir **con toda claridad**. La opción que podemos revisar es [nombre del plan]. Este plan contempla [servicios confirmados].",
    say: "Me gustaría explicarle qué incluye la opción que podría interesarle, cuánto cuesta y cuáles son sus condiciones, para que pueda decidir con toda claridad. La opción que podemos revisar es esta. Este plan contempla los servicios confirmados.",
  },
  {
    id: "a10",
    who: "A",
    tag: "Presentar la solución",
    phase: "Presentar",
    insert: "cotizacion",
    note: CONFIRMAR,
    text: "En cuanto a la forma de pago, podemos revisar [modalidades autorizadas]. Para esta opción, el costo es de [importe confirmado], con [anticipo y mensualidad].",
    say: "En cuanto a la forma de pago, podemos revisar las modalidades autorizadas. Para esta opción, le doy el costo, con el anticipo y la mensualidad.",
  },
  {
    id: "a11",
    who: "A",
    tag: "Presentar la solución",
    phase: "Presentar",
    text: "Quiero que tenga muy claro **qué incluye**, **qué condiciones aplican** y **qué necesita cumplir** para utilizar el servicio. Si tiene alguna duda, con mucho gusto la revisamos antes de continuar.",
  },
  {
    id: "a12",
    who: "A",
    tag: "Pregunta de confirmación",
    phase: "Presentar",
    insert: "elegir",
    text: "De lo que le acabo de explicar, ¿qué aspecto le resulta **más importante**: los **servicios incluidos**, la **forma de pago** o la posibilidad de **proteger a más integrantes** de su familia?",
  },
  {
    id: "p06",
    who: "P",
    objection: "Lo tengo que consultar con mi familia",
    ficha: {objecion: "Consultarlo con su familia"},
    text: "Lo de mi mamá, la verdad. Pero esto lo tengo que **consultar con mi familia**.",
    say: "[thoughtful] Lo de mi mamá, la verdad. [hesitant] Pero esto lo tengo que consultar con mi familia.",
  },
  {id: "n06", who: "N", objection: "Lo tengo que consultar con mi familia", text: "«Lo tengo que consultar con mi familia». Andrés no lo toma como un no. Le ayuda a llevar la información a su casa."},
  {
    id: "a13",
    who: "A",
    tag: "Objeción",
    phase: "Acordar",
    objection: "Lo tengo que consultar con mi familia",
    insert: "elegir",
    text: "**Por supuesto**, me parece **una buena decisión** que lo converse con su familia, porque es un tema que puede involucrar a varias personas. Para que puedan revisarlo con mayor facilidad, ¿qué cree que les interesaría **conocer primero**: el costo, los servicios incluidos o las condiciones del plan?",
    say: "[warmly] Por supuesto, me parece una buena decisión que lo converse con su familia, porque es un tema que puede involucrar a varias personas. Para que puedan revisarlo con mayor facilidad, ¿qué cree que les interesaría conocer primero: el costo, los servicios incluidos o las condiciones del plan?",
  },
  {
    id: "p07",
    who: "P",
    objection: "Mándeme la información por WhatsApp",
    text: "El costo, y si se puede incluir a mi mamá. **Mándeme la información por WhatsApp.**",
    say: "[practical] El costo, y si se puede incluir a mi mamá. Mándeme la información por WhatsApp.",
  },
  {
    id: "a14",
    who: "A",
    tag: "Objeción",
    phase: "Acordar",
    objection: "Mándeme la información por WhatsApp",
    insert: "whatsapp",
    text: "**Con mucho gusto.** Le enviaré la información del plan que revisamos, con los servicios, los costos y las condiciones aplicables. Para enviarle algo que realmente le sea útil, ¿prefiere **la opción más acorde** con lo que me comentó, o desea **comparar varias** alternativas?",
  },
  {id: "p08", who: "P", ficha: {info: "Plan por WhatsApp, con y sin su mamá"}, text: "La que me dijo, y otra con mi mamá incluida.", say: "[friendly] La que me dijo, y otra con mi mamá incluida."},
  {
    id: "a15",
    who: "A",
    tag: "Siguiente paso",
    phase: "Acordar",
    insert: "whatsapp",
    text: "Perfecto. Se la envío **a este número**. Y para no dejarle únicamente la información y que después se quede con alguna duda, ¿le parece si **acordamos una llamada breve** para revisarla juntos? ¿Le funciona el **jueves a las seis** de la tarde?",
  },
  {id: "p09", who: "P", ficha: {seguimiento: "Jueves · 6:00 p. m. · llamada"}, text: "Sí, el jueves a las seis está bien. Ya va a estar mi esposo.", say: "[warmly] Sí, el jueves a las seis está bien. Ya va a estar mi esposo."},
  {
    id: "a16",
    who: "A",
    tag: "Cierre: nueva llamada",
    phase: "Acordar",
    text: "Perfecto. Entonces, **quedamos** en que me comunicaré con usted **el jueves a las seis**. Le enviaré la información acordada y, cuando volvamos a hablar, podremos **resolver cualquier duda** que le haya surgido. Le agradezco mucho su tiempo. Que tenga excelente día.",
    say: "[warmly] Perfecto. Entonces, quedamos en que me comunicaré con usted el jueves a las seis. Le enviaré la información acordada y, cuando volvamos a hablar, podremos resolver cualquier duda que le haya surgido. Le agradezco mucho su tiempo. Que tenga excelente día.",
  },
  {
    id: "n07",
    who: "N",
    text: "Al colgar, Andrés registra cuatro cosas: el motivo de interés, la objeción principal, la información enviada y la fecha del seguimiento. Y no lo cuenta como venta: pedir información no significa que ella ya decidió.",
  },

  // ---------------- 2. «No tengo dinero»: Joaquín ----------------
  {id: "n08", who: "N", objection: "No tengo dinero", text: "Segunda llamada. El señor Joaquín Rivas, de cuarenta y cinco años, ya escuchó la opción y el costo."},
  {
    id: "j01",
    who: "J",
    objection: "No tengo dinero",
    ficha: {interes: "Proteger a su familia", objecion: "No tengo dinero"},
    text: "Mire, joven, se oye bien, pero **no tengo dinero**. Ahorita no me alcanza.",
    say: "[uncomfortable] Mire, joven, se oye bien, pero no tengo dinero. Ahorita no me alcanza.",
  },
  {
    id: "a17",
    who: "A",
    tag: "Objeción",
    phase: "Acordar",
    objection: "No tengo dinero",
    text: "**Lo entiendo**, y **gracias por decírmelo con confianza**. Sé que cada familia tiene compromisos económicos diferentes y **no quisiera recomendarle algo que represente una carga** para usted.",
    say: "[gently] Lo entiendo, y gracias por decírmelo con confianza. Sé que cada familia tiene compromisos económicos diferentes y no quisiera recomendarle algo que represente una carga para usted.",
  },
  {
    id: "a18",
    who: "A",
    tag: "Objeción",
    phase: "Acordar",
    objection: "No tengo dinero",
    insert: "preocupa",
    text: "Para orientarle mejor, ¿lo que le preocupa es **el pago inicial**, **el monto de la mensualidad**, o que en este momento tiene **otros gastos prioritarios**?",
  },
  {
    id: "j02",
    who: "J",
    objection: "No tengo dinero",
    text: "Es que acabamos de inscribir a los niños y traigo el carro en el taller. Este mes está pesado.",
    say: "[sighs] Es que acabamos de inscribir a los niños y traigo el carro en el taller. Este mes está pesado.",
  },
  {
    id: "a19",
    who: "A",
    tag: "Objeción",
    phase: "Acordar",
    objection: "No tengo dinero",
    text: "**Comprendo.** Si usted lo considera conveniente, podemos revisar si existe alguna **alternativa autorizada** que se ajuste mejor a sus posibilidades. Y si en este momento no es viable, también podemos **dejarlo para más adelante**. Lo importante es que tome una **decisión informada** y que **no comprometa gastos esenciales** de su familia.",
    say: "[calm] Comprendo. Si usted lo considera conveniente, podemos revisar si existe alguna alternativa autorizada que se ajuste mejor a sus posibilidades. Y si en este momento no es viable, también podemos dejarlo para más adelante. Lo importante es que tome una decisión informada y que no comprometa gastos esenciales de su familia.",
  },
  {
    id: "j03",
    who: "J",
    objection: "No tengo dinero",
    ficha: {info: "Ninguna por ahora", seguimiento: "Volver a llamar en unos meses"},
    text: "Se lo agradezco. Mejor márqueme en unos meses, cuando se acomode todo.",
    say: "[relieved] Se lo agradezco. Mejor márqueme en unos meses, cuando se acomode todo.",
  },
  {
    id: "a20",
    who: "A",
    tag: "Cierre: por ahora no puede contratar",
    phase: "Acordar",
    insert: "puerta",
    text: "Lo **comprendo**, y agradezco que me lo haya comentado **con sinceridad**. No quisiera que adquiriera un compromiso que en este momento no le resulte conveniente. Dejamos **abierta la posibilidad** de conversar más adelante, en el momento que le resulte oportuno. Muchas gracias por atender mi llamada.",
    say: "[warmly] Lo comprendo, y agradezco que me lo haya comentado con sinceridad. No quisiera que adquiriera un compromiso que en este momento no le resulte conveniente. Dejamos abierta la posibilidad de conversar más adelante, en el momento que le resulte oportuno. Muchas gracias por atender mi llamada.",
  },
  {
    id: "n09",
    who: "N",
    text: "Aquí no hubo venta, y Andrés no discutió ni presionó. Dejó la puerta abierta, y el señor Rivas le pidió que le vuelva a marcar.",
  },

  // ---------------- 3. «Lo voy a pensar» y «¿lo puedo usar antes de terminar de pagar?»: Carmen ----------------
  {id: "n10", who: "N", objection: "Lo voy a pensar", text: "Tercera llamada. La señora Carmen Salazar, de setenta y un años, ya conoce el plan y dice que lo va a pensar."},
  {
    id: "c01",
    who: "C",
    objection: "Lo voy a pensar",
    ficha: {interes: "Dejar todo listo", objecion: "Lo voy a pensar"},
    text: "Está bien, joven. Déjeme **pensarlo**.",
    say: "[polite] [hesitant] Está bien, joven. Déjeme pensarlo.",
  },
  {
    id: "a21",
    who: "A",
    tag: "Objeción",
    phase: "Acordar",
    objection: "Lo voy a pensar",
    text: "**Claro**, entiendo que es una decisión que merece **tiempo y atención**. Para ayudarle a valorar la información, quisiera preguntarle algo: ¿hay **algún punto** que todavía **no le convenza** o que le gustaría aclarar antes de tomar una decisión?",
    say: "[calm] Claro, entiendo que es una decisión que merece tiempo y atención. Para ayudarle a valorar la información, quisiera preguntarle algo: ¿hay algún punto que todavía no le convenza o que le gustaría aclarar antes de tomar una decisión?",
  },
  {
    id: "c02",
    who: "C",
    objection: "¿Puedo usarlo antes de terminar de pagar?",
    ficha: {objecion: "¿Lo puede usar antes de terminar de pagar?"},
    text: "Pues sí. Si me pasa algo antes de terminar de pagar, **¿lo puedo usar?** Porque a mi edad, uno nunca sabe.",
    say: "[worried] Pues sí. Si me pasa algo antes de terminar de pagar, ¿lo puedo usar? [softly] Porque a mi edad, uno nunca sabe.",
  },
  {
    id: "a22",
    who: "A",
    tag: "Pregunta difícil",
    phase: "Presentar",
    objection: "¿Puedo usarlo antes de terminar de pagar?",
    insert: "condiciones",
    text: "**Gracias por compartirlo** conmigo. Es una pregunta **muy importante** y prefiero explicársela **con toda claridad**. Las condiciones para utilizar el servicio dependen de lo establecido en **el plan que usted contrate**. Por eso, antes de que tome una decisión, voy a revisar con usted **los requisitos**, **los pagos** y cualquier **saldo pendiente** que pudiera corresponder.",
    say: "[sincere] Gracias por compartirlo conmigo. Es una pregunta muy importante y prefiero explicársela con toda claridad. [calm] Las condiciones para utilizar el servicio dependen de lo establecido en el plan que usted contrate. Por eso, antes de que tome una decisión, voy a revisar con usted los requisitos, los pagos y cualquier saldo pendiente que pudiera corresponder.",
  },
  {
    id: "a23",
    who: "A",
    tag: "Pregunta difícil",
    phase: "Presentar",
    objection: "¿Puedo usarlo antes de terminar de pagar?",
    insert: "condiciones",
    text: "**No quiero darle una respuesta imprecisa** ni prometerle una cobertura que no esté confirmada. Mi responsabilidad es que usted sepa **exactamente qué está contratando** y en qué condiciones puede utilizarlo. ¿Le parece si **revisamos juntos** las condiciones de la opción que le interesa?",
  },
  {id: "c03", who: "C", text: "Sí, eso sí me gustaría. Así me quedo tranquila.", say: "[relieved] Sí, eso sí me gustaría. Así me quedo tranquila."},
  {
    id: "a24",
    who: "A",
    tag: "Siguiente paso",
    phase: "Acordar",
    insert: "cita",
    text: "Y si después de revisarlo necesita más tiempo, **no hay problema**. ¿Le parece si **acordamos un día** para volver a conversar y saber si le surgió alguna duda?",
  },
  {
    id: "c04",
    who: "C",
    ficha: {info: "Condiciones del plan, revisadas juntos", seguimiento: "Lunes por la mañana"},
    text: "El lunes en la mañana, cuando no estén mis nietos.",
    say: "[friendly] [light laugh] El lunes en la mañana, cuando no estén mis nietos.",
  },
  {
    id: "n11",
    who: "N",
    text: "La señora Salazar hizo la pregunta difícil. Andrés no adivinó ni prometió una cobertura: la llevó a revisar con él las condiciones del plan.",
  },

  // ---------------- 4. Seguimiento: Patricia ----------------
  {id: "n12", who: "N", text: "Cuarta llamada. Es jueves a las seis, como quedaron. La señora Morales y su esposo ya vieron la información."},
  {id: "a25", who: "A", tag: "Seguimiento", phase: "Abrir", text: "Buenas tardes, señora Morales. Le llamo **como quedamos**, para revisar la información que le envié.", say: "[warmly] Buenas tardes, señora Morales. Le llamo como quedamos, para revisar la información que le envié."},
  {
    id: "p10",
    who: "P",
    ficha: {interes: "Que sus hijos no resuelvan todo a las carreras", objecion: "Dudas sobre incluir a su mamá", info: "Plan por WhatsApp, con y sin su mamá"},
    text: "Sí, ya la vimos con mi esposo. Nos gustó, pero todavía tenemos dudas, sobre todo de lo de mi mamá.",
    say: "[friendly] Sí, ya la vimos con mi esposo. Nos gustó, [thoughtful] pero todavía tenemos dudas, sobre todo de lo de mi mamá.",
  },
  {
    id: "a26",
    who: "A",
    tag: "Interesado, pero aún no decide",
    phase: "Acordar",
    text: "Por lo que me ha comentado, veo que **sí le interesa** una alternativa para su familia, aunque todavía necesita **revisar algunos puntos**. Podemos avanzar **de acuerdo con lo que usted necesite**: si requiere conversar con su pareja, revisar sus gastos o recibir una explicación más detallada, podemos organizarlo.",
  },
  {
    id: "a27",
    who: "A",
    tag: "Interesado, pero aún no decide",
    phase: "Acordar",
    text: "Si existe la posibilidad de una **asesoría presencial**, podemos revisar la disponibilidad y coordinar una cita. ¿Qué le ayudaría más **en este momento** para continuar?",
  },
  {id: "p11", who: "P", text: "Que nos explique en persona, a mi esposo y a mí. Así vemos lo de mi mamá con calma.", say: "[decided] Que nos explique en persona, a mi esposo y a mí. Así vemos lo de mi mamá con calma."},
  {
    id: "a28",
    who: "A",
    tag: "Cierre: visita",
    phase: "Acordar",
    insert: "cita",
    note: "Confirme el lugar antes de citar al cliente",
    text: "**Con mucho gusto.** Vamos a revisar la disponibilidad para coordinar su visita el **sábado a las once**, en [lugar confirmado]. Antes de terminar, le confirmaré **los detalles de la cita** y **la información que conviene tener a la mano**. Muchas gracias por su tiempo. **Será un gusto atenderle.**",
    say: "[warmly] Con mucho gusto. Vamos a revisar la disponibilidad para coordinar su visita el sábado a las once. Antes de terminar, le confirmaré los detalles de la cita y la información que conviene tener a la mano. Muchas gracias por su tiempo. Será un gusto atenderle.",
  },
  {id: "p12", who: "P", ficha: {seguimiento: "Sábado · 11:00 · visita presencial"}, text: "Gracias, Andrés. Ahí nos vemos el sábado.", say: "[warmly] Gracias, Andrés. Ahí nos vemos el sábado."},
  {
    id: "n13",
    who: "N",
    text: "Andrés cumplió lo que acordó: marcó el jueves a las seis. Por eso la señora Morales le contestó, y ahora hay una cita.",
  },

  // ---------------- Reglas de oro ----------------
  {
    id: "n14",
    who: "N",
    text: "Las reglas de oro. Pregunte antes de ofrecer. Escuche más y hable con propósito. No discuta las objeciones: responda con comprensión, no con presión. No prometa lo que no está confirmado. No confunda interés con venta. Registre los compromisos. Y cierre cada conversación con un siguiente paso claro.",
  },
  {id: "n15", who: "N", text: "Una buena llamada no es la que más habla, sino la que mejor entiende al cliente y le ayuda a avanzar."},
];

export const plain = (s: string) => s.replace(/\*\*/g, "");
export const spoken = (l: Line) => l.say ?? plain(l.text);
