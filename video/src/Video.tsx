import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Grade, Grain, Vignette } from "./components/Layers";
import { Hook } from "./scenes/Hook";
import { Claim } from "./scenes/Claim";
import { WorkCard, projects } from "./scenes/Work";
import { Stats } from "./scenes/Stats";
import { Cta } from "./scenes/Cta";

// All timing derives from fps. 100 BPM music bed -> 18 frames per beat @30fps.
export const buildTimeline = (fps: number) => {
  const beat = (fps * 60) / 100; // 18
  const b = (n: number) => Math.round(n * beat);
  const hook = b(6);   // 108
  const claim = b(7);  // 126
  const work = b(7);   // 126 per card x3
  const stats = b(9);  // 162
  const cta = b(8);    // 144
  const scenes = [
    { key: "hook", dur: hook },
    { key: "claim", dur: claim },
    { key: "w0", dur: work },
    { key: "w1", dur: work },
    { key: "w2", dur: work },
    { key: "stats", dur: stats },
    { key: "cta", dur: cta },
  ];
  let at = 0;
  return scenes.map((s) => { const from = at; at += s.dur; return { ...s, from }; });
};

export const totalFrames = (fps: number) =>
  buildTimeline(fps).reduce((a, s) => a + s.dur, 0);

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  // SFX lands 3 frames BEFORE the visual — early reads synced, late reads broken.
  <Sequence from={Math.max(0, at - 3)}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

export const CraftbyteReel: React.FC = () => {
  const { fps } = useVideoConfig();
  const t = buildTimeline(fps);
  const at = (k: string) => t.find((s) => s.key === k)!;

  return (
    <AbsoluteFill style={{ backgroundColor: "#141311" }}>
      {/* Layers 1-3: backgrounds, assets, graphics — inside each scene */}
      {t.map((s) => (
        <Sequence key={s.key} from={s.from} durationInFrames={s.dur}>
          {s.key === "hook" ? <Hook dur={s.dur} /> : null}
          {s.key === "claim" ? <Claim dur={s.dur} /> : null}
          {s.key.startsWith("w") && s.key !== "hook" && /^w\d$/.test(s.key) ? (
            <WorkCard dur={s.dur} p={projects[Number(s.key[1])]} index={Number(s.key[1])} />
          ) : null}
          {s.key === "stats" ? <Stats dur={s.dur} /> : null}
          {s.key === "cta" ? <Cta dur={s.dur} /> : null}
        </Sequence>
      ))}

      {/* Layer 4: grade above all content */}
      <Grade />
      {/* Layer 5: grain + vignette, topmost */}
      <Grain />
      <Vignette />

      {/* Sound: bed under everything, hits on the cuts */}
      <Audio src={staticFile("sfx/music.wav")} volume={0.22} />
      <Sfx at={0} src="bass" volume={0.55} />
      <Sfx at={22} src="shimmer" volume={0.3} />
      {t.slice(1).map((s) => (
        <React.Fragment key={s.key}>
          <Sfx at={s.from} src="whoosh" volume={0.5} />
          <Sfx at={s.from} src="bass" volume={0.45} />
        </React.Fragment>
      ))}
      {/* riser into the payoff cut */}
      <Sequence from={at("stats").from - 30}>
        <Audio src={staticFile("sfx/riser.wav")} volume={0.4} />
      </Sequence>
      {/* counter ticks */}
      {[0, 1, 2].map((i) => (
        <Sfx key={i} at={at("stats").from + 12 + i * 12} src="pop" volume={0.4} />
      ))}
      <Sfx at={at("cta").from + 30} src="pop" volume={0.55} />
      <Sfx at={at("cta").from + 30} src="shimmer" volume={0.35} />
    </AbsoluteFill>
  );
};
