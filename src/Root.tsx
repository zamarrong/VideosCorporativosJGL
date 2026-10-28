import React from "react";
import {Composition} from "remotion";
import {ClienteDificil} from "./Video";
import {TOTAL} from "./timeline";
import {ScriptVentas} from "./ventas/Video";
import {TOTAL as TOTAL_VENTAS} from "./ventas/timeline";
import {FPS} from "./theme";

export const Root: React.FC = () => (
  <>
    {/* Capacitación de asesores: guion "Cliente difícil" (Guion-asesor-cliente-dificil.pdf). */}
    <Composition id="ClienteDificil" component={ClienteDificil} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    {/* Script de ventas telefónicas (Script ventas.pdf): cuatro llamadas de Andrés Medina. */}
    <Composition id="ScriptVentas" component={ScriptVentas} durationInFrames={TOTAL_VENTAS} fps={FPS} width={1920} height={1080} />
  </>
);
