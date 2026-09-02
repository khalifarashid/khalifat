// Self-hosted variable fonts — no network at render time.
import { continueRender, delayRender, staticFile } from "remotion";

export const display = "Space Grotesk";
export const body = "Archivo";

const handle = delayRender("Loading fonts");

const faces = [
  new FontFace(display, `url(${staticFile("fonts/SpaceGrotesk.woff2")}) format("woff2")`, {
    weight: "300 700", style: "normal",
  }),
  new FontFace(body, `url(${staticFile("fonts/Archivo.woff2")}) format("woff2")`, {
    weight: "100 900", style: "normal",
  }),
];

Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l))))
  .then(() => continueRender(handle))
  .catch((e) => { console.error(e); continueRender(handle); });
