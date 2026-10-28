# Instrucciones para el agente

Este repo hace videos de capacitación para asesores de J. García López con Remotion, más un examen interactivo por
video. Lee primero `README.md`. Aquí está el procedimiento paso a paso para hacer **un video nuevo a partir de un guion
(PDF)** y lo que ya aprendimos con los dos primeros. Toma `src/ventas/` como plantilla: es el más reciente.

## Antes de empezar, pregunta al usuario
- Formato: ¿narradora más escenas de llamada, o una sola llamada de principio a fin?
- ¿Se respeta el guion palabra por palabra o se puede ajustar?
- Voces: ¿las mismas de `.env.example` o nuevas? Para elegir una nueva, lista las voces de ElevenLabs y propón una.
- ¿Lleva examen? ¿Cuántas preguntas y con cuántas se aprueba? (los dos actuales: 12 preguntas, se aprueba con 10).

## Reglas que no se rompen
- **Marca:** usa los colores de `src/theme.ts` (azul `#0F1E6A`, dorado `#B0842A`, amarillo `#F7BE00`, cremas). Solo
  colores planos: nada de degradados, brillos ni sombras difusas. La ilustración es dibujo a línea azul sobre crema, en SVG.
- **Datos:** lo que el guion pone entre corchetes (`[monto]`, `[importe confirmado]`, `[lugar]`) **nunca se dice** en la
  voz y nunca se inventa. En pantalla va como hueco dorado punteado (componente `Slot`) con la nota de usar datos reales.
  No inventes cifras, precios, planes ni estadísticas que no estén en el guion.
- **Personajes:** nombres ficticios, que no sean de clientes reales.
- **No subas secretos.** La key de ElevenLabs va solo en `.env`, que no se sube. No agregues a git Gotham
  (`public/fonts/Gotham*`), `out/`, `examen*/video/` ni `examen*/index.html`; ya están en `.gitignore`.

## Paso a paso

Usa `<v>` como nombre corto del video nuevo (p. ej. `cobranza`) y `<Comp>` como nombre de la composición (p. ej. `Cobranza`).

1. **Guion → `src/<v>/script.ts`.** Copia `src/ventas/` a `src/<v>/` y reescribe `script.ts`. Cada línea lleva `id`
   (prefijo por quien habla: `n01`, `a01`…), `who`, `text` (lo que se ve, con `**clave**`) y `say` (lo que se manda a la
   voz, con etiquetas de emoción como `[warmly]` o `[hesitant]`). Si `say` no está, se usa `text` sin asteriscos.
   Los números se escriben con letra en `say` ("ochenta y dos", no "82").
2. **Texto para la voz.** Copia `scripts/export-tts-ventas.ts` a `scripts/export-tts-<v>.ts`; cambia el import, la
   carpeta (`audio-src/<v>`) y la lista de voces. Ejecuta `node --experimental-strip-types scripts/export-tts-<v>.ts`.
   Si un `tts-<voz>.txt` pasa de 5,000 caracteres, pártelo en dos archivos (`A1`, `A2`) por línea completa.
3. **Generar voces.** `npm run voz -- <VOZ> audio-src/<v> VOICE_<NOMBRE>` por cada archivo `tts-*.txt`. Cada una cuesta
   créditos: **no repitas una generación** si falló, primero revisa el error. Escucha o revisa la duración antes de seguir.
4. **Cortar en clips.** Copia `scripts/cut-vo-ventas.py` a `scripts/cut-vo-<v>.py`; cambia `D`, la lista `TAKES` (con
   el corte de A1/A2 si lo hubo) y las dos rutas de salida (`public/audio/<v>/`, `src/<v>/vo.json`). Crea
   `public/audio/<v>/` y ejecútalo. scribe no devuelve los `[pause]`: el script alinea todo el texto contra las palabras
   transcritas, y si una línea sale con duración rara es que la alineación falló ahí.
5. **Composición.** En `src/<v>/Video.tsx` cambia `audio/ventas/` por `audio/<v>/`, el nombre del componente y
   los títulos. Ajusta `timeline.ts` (`SCENE_OPENERS`, escenas), personajes (`characters.tsx`) e ilustraciones
   (`inserts.tsx`). Registra `<Comp>` en `src/Root.tsx` y agrega `"render:<v>"` en `package.json` como los otros.
   Verifica con `npm run typecheck`.
6. **Revisar antes de renderizar todo.** `node scripts/tiempos.mjs src/<v>/timeline.ts` te da el cuadro de cada línea;
   saca stills de varios momentos con `node scripts/stills.mjs <Comp> <cuadro> <cuadro>…` y **míralos**: texto que se
   corta o se encima, elementos fuera de cuadro, frases que se empalman al cambiar. Corrige y repite.
7. **Render.** `npm run render:<v>` (render y masterizado a -14 LUFS en `out/<v>.mp4`). Tarda varios minutos.
8. **Examen.** Copia `examen-ventas/` a `examen-<v>/`. En `src.html` cambia `SECTIONS` (los segundos `s`/`e` salen de
   `scripts/tiempos.mjs`), `QUESTIONS` (cada pregunta apunta a la sección que la explica) y `PASS`. Saca el video ligero
   con `bash scripts/web.sh out/<v>.mp4 examen-<v>/video/<v>-web.mp4 140k` (debe quedar **abajo de 15 MB**; si no, baja
   el bitrate) y genera `index.html` con `python3 examen-<v>/build.py`.
9. **Publicar el examen** (solo desde Claude con la herramienta Artifact). Publica `examen-<v>/index.html` con
   `files: {"video/<v>-web.mp4": "examen-<v>/video/<v>-web.mp4"}` y estas capacidades, para que cada asesor guarde solo
   su resultado y solo el dueño vea la tabla:
   ```json
   {"db": {"rules": [{"path": "resultados", "read": "admin", "write": "owner"},
                     {"path": "resultados/{self}", "read": "interact", "write": "interact"}]},
    "user": {}}
   ```
   Avisa al usuario que el artifact es privado hasta que lo comparta, y que los asesores necesitan acceso de Contributor.

## Al terminar
- Entrega la ruta del video, su duración y la liga del examen.
- Avisa qué datos quedaron como hueco por estar entre corchetes en el guion.
- Si tu cambio agrega algo útil para los demás (un insert, un script), haz commit en una rama y abre PR; no hagas push
  directo a `main`.
