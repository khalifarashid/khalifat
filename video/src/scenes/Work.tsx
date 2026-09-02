import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { display, body } from "../fonts";
import { Entrance, KenBurns, Scene, Wipe } from "../components/Motion";
import { BgMesh, Grid } from "../components/Layers";

export type Project = {
  shot: string;
  name: string;
  kind: string;
  tag: string;
  dir: 1 | -1;
};

export const projects: Project[] = [
  { shot: "shots/studio-vantage.png", name: "STUDIO VANTAGE", kind: "Architecture", tag: "Editorial / Calm", dir: 1 },
  { shot: "shots/pulse-collective.png", name: "PULSE COLLECTIVE", kind: "Festival", tag: "Bold / Playful", dir: -1 },
  { shot: "shots/tham-oral.png", name: "THAM ORALCARE", kind: "Healthcare", tag: "Warm / Precise", dir: 1 },
];

export const WorkCard: React.FC<{ dur: number; p: Project; index: number }> = ({ dur, p, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: frame - 6, fps, config: theme.spring.smooth });
  const breathe = 1 + Math.sin(frame / 26) * 0.008;
  const drift = interpolate(frame, [0, dur], [0, -18], {
    easing: theme.ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <BgMesh hue={index === 1 ? "accent" : "primary"} />
      <Grid opacity={0.04} />
      <Scene dur={dur}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 76px" }}>
          {/* index label — parallax back layer */}
          <div
            style={{
              position: "absolute", top: 300 + drift * 0.35, left: 76,
              fontFamily: display, fontWeight: 700, fontSize: 240,
              color: theme.colors.text, opacity: 0.05, lineHeight: 1,
            }}
          >
            0{index + 1}
          </div>

          <Entrance delay={0} from={0} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 34, transform: `translateY(${drift * 0.5}px)`,
              }}
            >
              <span style={{ fontFamily: body, fontSize: 28, letterSpacing: "0.3em", color: theme.colors.textDim, textTransform: "uppercase" }}>
                Selected Work
              </span>
              <span style={{ fontFamily: body, fontSize: 28, letterSpacing: "0.3em", color: theme.colors.textDim }}>
                0{index + 1} / 03
              </span>
            </div>
          </Entrance>

          {/* the shot — masked into a rounded card with Ken Burns inside */}
          <div
            style={{
              width: "100%", height: 1020, borderRadius: 36, overflow: "hidden",
              border: `1px solid ${theme.colors.line}`,
              boxShadow: "0 50px 100px -24px rgba(0,0,0,0.72)",
              transform: `translateY(${interpolate(rise, [0, 1], [70, 0])}px) scale(${interpolate(rise, [0, 1], [0.9, 1]) * breathe})`,
              opacity: interpolate(rise, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              position: "relative",
            }}
          >
            <KenBurns src={p.shot} dur={dur} dir={p.dir} zoom={1.05} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(10,9,8,0.28) 0%, transparent 30%, transparent 58%, rgba(10,9,8,0.92))` }} />
            <Wipe at={2} len={16} />
          </div>

          <div style={{ width: "100%", marginTop: 44, transform: `translateY(${drift}px)` }}>
            <Entrance delay={20} from={38} preset="snappy">
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 82, letterSpacing: "-0.035em", color: theme.colors.text, lineHeight: 1.04 }}>
                {p.name}
              </div>
            </Entrance>
            <Entrance delay={26} from={30} preset="snappy">
              <div style={{ display: "flex", alignItems: "center", columnGap: 22, marginTop: 22 }}>
                <span style={{ fontFamily: body, fontSize: 34, color: theme.colors.textDim }}>{p.kind}</span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: theme.colors.textDim, opacity: 0.6 }} />
                <span
                  style={{
                    fontFamily: body, fontSize: 30, color: theme.colors.primary,
                    border: `1px solid ${theme.colors.primary}`, borderRadius: 999,
                    padding: "8px 24px", letterSpacing: "0.04em",
                  }}
                >
                  {p.tag}
                </span>
              </div>
            </Entrance>
          </div>
        </AbsoluteFill>
      </Scene>
    </AbsoluteFill>
  );
};
