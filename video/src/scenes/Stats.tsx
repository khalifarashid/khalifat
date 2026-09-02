import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { display, body } from "../fonts";
import { Counter, Entrance, Scene } from "../components/Motion";
import { BgMesh, Grid } from "../components/Layers";

const rows = [
  { target: 100, suffix: "", decimals: 0, label: "Lighthouse performance", hero: true },
  { target: 1.2, suffix: "s", decimals: 1, label: "Median load time", hero: false },
  { target: 14, suffix: " days", decimals: 0, label: "Design to launch", hero: false },
];

export const Stats: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = spring({ frame: frame - 8, fps, config: theme.spring.smooth });
  return (
    <AbsoluteFill>
      <BgMesh />
      <Grid opacity={0.05} />
      <Scene dur={dur}>
        <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "center", padding: "0 88px" }}>
          <Entrance delay={0} from={30}>
            <div style={{ fontFamily: body, fontSize: 28, letterSpacing: "0.3em", color: theme.colors.textDim, textTransform: "uppercase", marginBottom: 26 }}>
              What ships
            </div>
          </Entrance>
          <div style={{ width: interpolate(line, [0, 1], [0, 904]), height: 1, background: theme.colors.line, marginBottom: 56 }} />
          {rows.map((r, i) => (
            <Entrance key={i} delay={12 + i * 12} from={52} preset="smooth" style={{ width: "100%" }}>
              <div style={{ marginBottom: 62 }}>
                <div
                  style={{
                    fontFamily: display, fontWeight: 700, fontSize: 168, lineHeight: 1,
                    letterSpacing: "-0.012em",
                    color: r.hero ? theme.colors.primary : theme.colors.text,
                    textShadow: r.hero ? `0 0 80px ${theme.colors.glow}` : undefined,
                  }}
                >
                  <Counter target={r.target} delay={12 + i * 12} suffix={r.suffix} decimals={r.decimals} />
                </div>
                <div style={{ fontFamily: body, fontSize: 34, color: theme.colors.textDim, marginTop: 12 }}>{r.label}</div>
              </div>
            </Entrance>
          ))}
        </AbsoluteFill>
      </Scene>
    </AbsoluteFill>
  );
};
