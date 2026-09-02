import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { display, body } from "../fonts";
import { Entrance, Scene, WordReveal } from "../components/Motion";
import { BgMesh, Grid } from "../components/Layers";

export const Claim: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Pill scales in behind the hero word 5 frames after it lands.
  const pill = spring({ frame: frame - 33, fps, config: theme.spring.bouncy });
  const float = Math.sin(frame / 30) * 4;
  return (
    <AbsoluteFill>
      <BgMesh hue="accent" />
      <Grid opacity={0.045} />
      <Scene dur={dur}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 88px", transform: `translateY(${float}px)` }}>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <WordReveal
              text="We build sites that move."
              delay={4}
              per={3}
              gap={26}
              highlight="move."
              style={{
                position: "relative",
                fontFamily: display, fontWeight: 700, fontSize: 124,
                letterSpacing: "-0.045em", lineHeight: 1.06,
                color: theme.colors.text, textAlign: "center",
              }}
            />
            <div
              style={{
                width: interpolate(pill, [0, 1], [0, 330], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                height: 6, marginTop: 14, borderRadius: 6,
                background: theme.colors.primary,
                boxShadow: `0 0 60px ${theme.colors.glow}`,
              }}
            />
          </div>
          <Entrance delay={54} from={30} style={{ marginTop: 66 }}>
            <div style={{ fontFamily: body, fontSize: 36, lineHeight: 1.5, color: theme.colors.textDim, textAlign: "center", maxWidth: 760 }}>
              Studio-grade motion, 3D and interaction — shipped fast, from the UAE.
            </div>
          </Entrance>
        </AbsoluteFill>
      </Scene>
    </AbsoluteFill>
  );
};
