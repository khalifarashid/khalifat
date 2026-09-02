import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { display, body } from "../fonts";
import { Entrance, Scene, SparkMark } from "../components/Motion";
import { BgMesh, Grid } from "../components/Layers";

export const Cta: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: frame - 30, fps, config: theme.spring.bouncy });
  const pulse = 1 + Math.sin(frame / 18) * 0.014;
  const glowP = interpolate(Math.sin(frame / 18), [-1, 1], [0.3, 0.65]);
  return (
    <AbsoluteFill>
      <BgMesh />
      <Grid opacity={0.05} />
      <Scene dur={dur}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 46 }}>
          <Entrance delay={0} from={20}>
            <SparkMark size={130} delay={0} />
          </Entrance>
          <Entrance delay={10} from={40}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 104, letterSpacing: "-0.04em", color: theme.colors.text, textAlign: "center", lineHeight: 1.05 }}>
              Craftbyte
            </div>
          </Entrance>
          <Entrance delay={18} from={30}>
            <div style={{ fontFamily: body, fontSize: 34, color: theme.colors.textDim, textAlign: "center", letterSpacing: "0.06em" }}>
              United Arab Emirates
            </div>
          </Entrance>
          <div
            style={{
              marginTop: 26,
              transform: `scale(${interpolate(btn, [0, 1], [0.72, 1]) * pulse})`,
              opacity: interpolate(btn, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              background: theme.colors.primary,
              color: theme.colors.text,
              fontFamily: display, fontWeight: 600, fontSize: 46,
              padding: "34px 76px", borderRadius: 999,
              boxShadow: `0 0 90px rgba(224,83,31,${glowP}), 0 24px 60px -18px rgba(0,0,0,0.7)`,
              letterSpacing: "-0.01em",
            }}
          >
            Start a project →
          </div>
        </AbsoluteFill>
      </Scene>
    </AbsoluteFill>
  );
};
