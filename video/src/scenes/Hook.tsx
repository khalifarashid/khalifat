import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { display, body } from "../fonts";
import { Entrance, Scene, SparkMark } from "../components/Motion";
import { BgMesh, Grid } from "../components/Layers";

export const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Letter-by-letter wordmark, staggered 2.5f apart.
  const word = "CRAFTBYTE";
  const rule = spring({ frame: frame - 46, fps, config: theme.spring.smooth });
  return (
    <AbsoluteFill>
      <BgMesh />
      <Grid opacity={0.06} />
      <Scene dur={dur}>
        <AbsoluteFill
          style={{
            alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 54, paddingBottom: 40,
          }}
        >
          <SparkMark size={230} delay={0} />
          <div style={{ display: "flex", columnGap: 4, fontFamily: display, fontWeight: 700, fontSize: 118, letterSpacing: "-0.04em", color: theme.colors.text, lineHeight: 1 }}>
            {word.split("").map((c, i) => {
              const p = spring({ frame: frame - 22 - i * 2.5, fps, config: theme.spring.snappy });
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: interpolate(p, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    transform: `translateY(${interpolate(p, [0, 1], [54, 0])}px) scale(${interpolate(p, [0, 1], [0.7, 1])})`,
                  }}
                >
                  {c}
                </span>
              );
            })}
          </div>
          <div style={{ width: interpolate(rule, [0, 1], [0, 420]), height: 2, background: theme.colors.primary, boxShadow: `0 0 40px ${theme.colors.glow}` }} />
          <Entrance delay={56} from={26} preset="smooth">
            <div style={{ fontFamily: body, fontWeight: 400, fontSize: 33, letterSpacing: "0.32em", color: "#C9C2B6", textTransform: "uppercase" }}>
              Web Design &amp; Development
            </div>
          </Entrance>
        </AbsoluteFill>
      </Scene>
    </AbsoluteFill>
  );
};
