import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

/** The workhorse entrance: opacity + translateY + scale, spring-driven. */
export const Entrance: React.FC<{
  delay?: number;
  from?: number;
  preset?: keyof typeof theme.spring;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, from = 46, preset = "smooth", style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: theme.spring[preset] });
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(p, [0, 1], [from, 0])}px) scale(${interpolate(p, [0, 1], [0.93, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Scene wrapper: animated exit, faster than any entrance (10f vs ~20f). */
export const Scene: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 11, dur - 1], [1, 0], {
    easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [dur - 11, dur - 1], [0, -46], {
    easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const s = interpolate(frame, [dur - 11, dur - 1], [1, 1.04], {
    easing: theme.ease.in, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return <div style={{ opacity: o, transform: `translateY(${y}px) scale(${s})`, width: "100%", height: "100%" }}>{children}</div>;
};

/** Word-by-word reveal. Pixel gaps, never em, around large type. */
export const WordReveal: React.FC<{
  text: string; delay?: number; per?: number; gap?: number;
  highlight?: string; style?: React.CSSProperties;
}> = ({ text, delay = 0, per = 3, gap = 20, highlight, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: gap, rowGap: gap * 0.5, ...style }}>
      {text.split(" ").map((word, i) => {
        const p = spring({ frame: frame - delay - i * per, fps, config: theme.spring.snappy });
        const isHero = highlight === word;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(p, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(p, [0, 1], [36, 0])}px) rotateX(${interpolate(p, [0, 1], [-42, 0])}deg)`,
              color: isHero ? theme.colors.primary : undefined,
              textShadow: isHero ? `0 0 60px ${theme.colors.glow}` : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Ken Burns — every still, no exceptions. Alternate direction between shots. */
export const KenBurns: React.FC<{ src: string; dur: number; dir?: 1 | -1; zoom?: number }> = ({
  src, dur, dir = 1, zoom = 1.06,
}) => {
  const frame = useCurrentFrame();
  const from = dir === 1 ? 1 : zoom;
  const to = dir === 1 ? zoom : 1;
  const scale = interpolate(frame, [0, dur], [from, to], {
    easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const pan = interpolate(frame, [0, dur], [0, -9 * dir], {
    easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <Img
      src={staticFile(src)}
      style={{
        width: "100%", height: "100%", objectFit: "cover",
        transform: `scale(${scale}) translate(${pan}px, ${pan * 2.6}px)`,
        filter: "saturate(0.97) contrast(1.05) brightness(1.04)",
      }}
    />
  );
};

/** Animated counter with tabular-nums so digits don't jitter the layout. */
export const Counter: React.FC<{ target: number; delay?: number; suffix?: string; decimals?: number }> = ({
  target, delay = 0, suffix = "", decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 55, mass: 1 } });
  const v = interpolate(p, [0, 1], [0, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{v.toFixed(decimals)}{suffix}</span>;
};

/** Radial spark mark, staggered rays — the logo sting. */
export const SparkMark: React.FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rays = 12;
  const pop = spring({ frame: frame - delay, fps, config: theme.spring.bouncy });
  const spin = spring({ frame: frame - delay, fps, config: theme.spring.smooth });
  const breathe = 1 + Math.sin(frame / 22) * 0.02;
  return (
    <div
      style={{
        width: size, height: size, position: "relative",
        transform: `scale(${interpolate(pop, [0, 1], [0.2, 1]) * breathe}) rotate(${interpolate(spin, [0, 1], [-120, 0])}deg)`,
        opacity: interpolate(pop, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        filter: `drop-shadow(0 0 ${size * 0.22}px ${theme.colors.glow})`,
      }}
    >
      {Array.from({ length: rays }).map((_, i) => {
        const p = spring({ frame: frame - delay - 4 - i * 1.2, fps, config: theme.spring.snappy });
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: "50%", top: "50%",
              width: size * 0.05, height: size * 0.44 * p,
              background: i % 3 === 0 ? theme.colors.primary : theme.colors.text,
              opacity: i % 3 === 0 ? 1 : 0.55,
              borderRadius: size,
              transformOrigin: "50% 0%",
              transform: `translateX(-50%) rotate(${(360 / rays) * i}deg) translateY(${size * 0.08}px)`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute", left: "50%", top: "50%",
          width: size * 0.15, height: size * 0.15, marginLeft: size * -0.075, marginTop: size * -0.075,
          borderRadius: "50%", background: theme.colors.primary,
          transform: `scale(${spring({ frame: frame - delay - 8, fps, config: theme.spring.bouncy })})`,
        }}
      />
    </div>
  );
};

/** Sweeping brand-colored bar used as a hand-rolled mask wipe. */
export const Wipe: React.FC<{ at: number; len?: number }> = ({ at, len = 14 }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const x = interpolate(frame, [at, at + len], [-width * 1.2, width * 1.2], {
    easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const skew = -12;
  return (
    <div
      style={{
        position: "absolute", inset: "-10% -60%",
        transform: `translateX(${x}px) skewX(${skew}deg)`,
        background: `linear-gradient(90deg, transparent, ${theme.colors.primary} 35%, ${theme.colors.primary} 65%, transparent)`,
        opacity: 0.92, pointerEvents: "none",
      }}
    />
  );
};
