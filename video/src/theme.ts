// theme.ts — single source of truth. Never inline a color, easing or spring.
import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#141311",
    bgAlt: "#1F1D1A",
    surface: "#242118",
    primary: "#E0531F", // THE hero color — max one element per frame
    accent: "#3D6BFF",
    text: "#FAF9F6",
    textDim: "#8B857C",
    line: "rgba(250,249,246,0.10)",
    glow: "rgba(224,83,31,0.45)",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
} as const;

// 9:16 safe zone — keep critical content inside this band.
export const SAFE = { top: 260, bottom: 300 };
