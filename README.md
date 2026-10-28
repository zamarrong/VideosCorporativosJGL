# Videos corporativos JGL (Remotion)

Videos de capacitación para asesores de J. García López, hechos en código con [Remotion](https://www.remotion.dev).
Cada video trae un examen interactivo que, si el asesor falla una pregunta, lo regresa a la parte del video donde se
explica. Este repo tiene los dos primeros videos completos para usarlos de base:

| Composición | Carpeta | Guion | Duración |
|---|---|---|---|
| `ClienteDificil` | `src/` | Guion asesor: cliente difícil (Mariana y el señor Torres) | ~6:50 |
| `ScriptVentas` | `src/ventas/` | Script de ventas de quien más vende (Andrés y 4 llamadas) | ~9:56 |

## Arranque

Necesitas Node 22+, Python 3 y ffmpeg.

```bash
npm install
cp .env.example .env     # pon tu ELEVENLABS_API_KEY; el .env no se sube
npm run dev              # Remotion Studio en el navegador
```

**Fuentes:** Gotham es una fuente con licencia y no va en este repo público. Pide a Jorge los tres archivos
(`GothamPro.woff2`, `Gotham-Medium.woff`, `Gotham-Bold.woff`) y cópialos a `public/fonts/`. Sin ellos todo funciona,
pero el texto sale en Helvetica o Arial.

## Renderizar

```bash
npm run render           # ClienteDificil → out/cliente-dificil.mp4 (masterizado a -14 LUFS)
npm run render:ventas    # ScriptVentas  → out/script-ventas.mp4
bash scripts/web.sh out/script-ventas.mp4 examen-ventas/video/script-ventas-web.mp4 140k   # versión para el examen
node scripts/stills.mjs 1400 2900   # fotogramas de revisión en out/stills
```

## Cómo está hecho un video

Todo sale de un solo archivo de guion; lo demás lo lee de ahí.

- `script.ts`: **fuente única**. Una entrada por línea: quién habla, el texto en pantalla (las **negritas** del PDF
  van entre `**`), lo que se manda a la voz (`say`, con etiquetas de emoción como `[warmly]`), el rótulo del guion y la
  ilustración que la acompaña. Lo que va entre corchetes (`[monto]`, `[importe]`) **no se dice**: sale en pantalla como
  hueco dorado punteado con la nota de usar datos reales.
- `timeline.ts`: calcula en qué cuadro empieza cada línea a partir de la duración de su clip de voz.
- `characters.tsx`: los personajes en SVG; la boca se mueve solo cuando hay palabra (tiempos de scribe).
- `inserts.tsx`: las ilustraciones; cada elemento aparece cuando la voz dice su palabra.
- `Video.tsx`: la composición. Se registra en `src/Root.tsx`.

`src/theme.ts` tiene la marca (de jgarcialopez.com.mx): azul `#0F1E6A`, dorado `#B0842A`, amarillo `#F7BE00`, cremas
`#F8F6F3` / `#F0EDE8` / `#E0D9CA`, Gotham para texto y PT Serif para titulares. Colores planos, sin degradados.
El logo está en `public/brand`.

## Voces (ElevenLabs)

1. Exporta el texto de cada voz: `node --experimental-strip-types scripts/export-tts-ventas.ts` → `audio-src/ventas/tts-<voz>.txt`.
2. Genera cada toma con tu key: `npm run voz -- N audio-src/ventas VOICE_NARRADORA`
   (escribe `N-a.mp3` y `words-N.json` con los tiempos de cada palabra). Las voces de los videos existentes están en
   `.env.example`. Si una voz pasa de 5,000 caracteres, pártela en dos tomas, como `A1` y `A2` en ventas.
3. Corta las tomas en un clip por línea: `python3 scripts/cut-vo-ventas.py` → `public/audio/ventas/<id>.wav` y
   `src/ventas/vo.json`.

Los audios de los dos videos ya vienen en `audio-src/` y `public/audio/`, así que puedes renderizarlos sin generar nada.
La música (`public/audio/music.mp3`) es provisional.

## Examen

`examen/` y `examen-ventas/`: `src.html` es el examen (preguntas, secciones del video con su segundo de inicio y la
calificación mínima). `python3 build.py` mete fuentes y logo en `index.html`, que se publica como artifact de
claude.ai junto con `video/<nombre>-web.mp4` (máximo 15 MB). Los resultados se guardan en la base del artifact:
cada asesor escribe solo el suyo y solo el dueño ve la tabla del equipo. Los asesores necesitan acceso de Contributor.

## Hacer uno nuevo

1. Copia `src/ventas/` a `src/<tu-video>/` y reescribe `script.ts` con tu guion.
2. Ajusta personajes e ilustraciones en `characters.tsx` e `inserts.tsx`.
3. Registra la composición en `src/Root.tsx`.
4. Genera voces (arriba), renderiza y revisa con `scripts/stills.mjs`.
5. Copia `examen-ventas/` y cambia preguntas y secciones.
