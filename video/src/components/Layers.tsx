import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/** Layer 1 — animated mesh. Never a flat background. */
export const BgMesh: React.FC<{ hue?: "primary" | "accent" }> = ({ hue = "primary" }) => {
  const frame = useCurrentFrame();
  const d1 = Math.sin(frame / 55) * 50;
  const d2 = Math.cos(frame / 70) * 40;
  const d3 = Math.sin(frame / 90) * 30;
  const lead = hue === "primary" ? theme.colors.primary : theme.colors.accent;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", width: 1500, height: 1500, borderRadius: "50%",
          top: -560 + d3, left: -420 + d1, filter: "blur(60px)",
          background: `radial-gradient(circle, ${lead}30, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute", width: 1200, height: 1200, borderRadius: "50%",
          bottom: -520, right: -320 - d2, filter: "blur(80px)",
          background: `radial-gradient(circle, ${theme.colors.accent}1E, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute", width: 900, height: 900, borderRadius: "50%",
          top: 900 + d2, left: 200 - d1, filter: "blur(90px)",
          background: `radial-gradient(circle, ${theme.colors.surface}, transparent 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Subtle drifting grid — depth without noise. */
export const Grid: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const y = (frame * 0.35) % 90;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none", opacity,
        backgroundImage: `linear-gradient(${theme.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.text} 1px, transparent 1px)`,
        backgroundSize: "90px 90px",
        backgroundPosition: `0px ${y}px`,
        maskImage: "radial-gradient(ellipse at 50% 45%, black 10%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 10%, transparent 72%)",
      }}
    />
  );
};

/** Layer 4 — color grade. Above content, below grain. */
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.primary, mixBlendMode: "soft-light", opacity: 0.2 }} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.16), transparent 26%, transparent 72%, rgba(0,0,0,0.26))",
      }}
    />
  </AbsoluteFill>
);

/** Layer 5a — procedural grain, no asset file. */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none", backgroundImage: noise, backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.07, mixBlendMode: "overlay",
      }}
    />
  );
};

/** Layer 5b — vignette, topmost. */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 54%, rgba(0,0,0,0.30) 100%)",
    }}
  />
);
