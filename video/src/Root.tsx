import React from "react";
import { Composition } from "remotion";
import { CraftbyteReel, totalFrames } from "./Video";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CraftbyteReel"
      component={CraftbyteReel}
      durationInFrames={totalFrames(FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
