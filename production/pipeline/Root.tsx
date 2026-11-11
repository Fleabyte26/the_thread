import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { EP } from "./episode";
import { DURATION_FRAMES, FPS, H, W } from "./theme";

export const Root: React.FC = () => (
  <Composition id={EP.id} component={Main} durationInFrames={DURATION_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ withAudio: false }} />
);
