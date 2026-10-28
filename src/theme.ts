import {continueRender, delayRender, staticFile} from "remotion";
import {loadFont as loadSerif} from "@remotion/google-fonts/PTSerif";

/**
 * Marca de jgarcialopez.com.mx (app.css del sitio, 28-oct-2026): azul #0F1E6A, dorado #B0842A, amarillo #F7BE00,
 * cremas #F8F6F3 / #F0EDE8 / #E0D9CA. Gotham para texto y PT Serif para titulares, como en el sitio.
 * La ilustración del sitio es dibujo a línea azul sobre crema: los personajes y objetos siguen esa línea.
 */
export const C = {
  cream: "#F8F6F3",
  cream2: "#F0EDE8",
  sand: "#E0D9CA",
  white: "#FFFFFF",
  navy: "#0F1E6A",
  navy2: "#132368",
  navySoft: "#30408A",
  /** Trazo de las ilustraciones (azul lavanda del banner del sitio). */
  line: "#5B6497",
  lineSoft: "#C9CCE0",
  tint: "#E6E8F2",
  gold: "#B0842A",
  goldSoft: "#EFE3C8",
  yellow: "#F7BE00",
  rust: "#C4500A",
  ink: "#1C1917",
  stone: "#57534E",
  muted: "#A8A29E",
  logoGray: "#A9A098",
  wa: "#1EBE5B",
} as const;

export const FPS = 30;
export const W = 1920;
export const H = 1080;

const serif = loadSerif("normal", {weights: ["400", "700"], subsets: ["latin", "latin-ext"]});
loadSerif("italic", {weights: ["400", "700"], subsets: ["latin", "latin-ext"]});
export const SERIF = serif.fontFamily;
export const SANS = "Gotham, 'Gotham Pro', 'Helvetica Neue', Arial, sans-serif";

// Gotham viene del propio sitio (public/fonts).
if (typeof document !== "undefined") {
  const faces: [string, string, string][] = [
    ["fonts/GothamPro.woff2", "400", "woff2"],
    ["fonts/Gotham-Medium.woff", "500", "woff"],
    ["fonts/Gotham-Bold.woff", "700", "woff"],
  ];
  const h = delayRender("Gotham");
  Promise.all(
    faces.map(([f, w, fmt]) => {
      const ff = new FontFace("Gotham", `url(${staticFile(f)}) format("${fmt}")`, {weight: w});
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      return ff.load();
    }),
  )
    .then(() => continueRender(h))
    .catch((e) => {
      console.error(e);
      continueRender(h);
    });
}
