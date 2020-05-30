import React from "react";
import useStorySetup from "../../hooks/useStorySetup";
import StoryContext from "../../context/StoryEditor";
import useStoryEditor from "../../hooks/useStoryEditor";
import PlayingStorySession from "../../context/PlayingStorySession";
import usePlayingSession from "../../hooks/usePlayingSession";
import useStoryStatus from "../../hooks/useStoryStatus";
import StoryStatus from "../../context/StoryStatus";
import Story from "./Story";

interface Props {
  storyId: string;
  type: "LIVE" | "STANDARD";
}

function StoryProvider({ storyId, type }: Props) {
  const playingSession = usePlayingSession();
  const storyEditor = useStoryEditor();
  const storyStatus = useStoryStatus();

  useStorySetup(storyId);

  return (
    <StoryStatus.Provider value={storyStatus}>
      <StoryContext.Provider value={storyEditor}>
        <PlayingStorySession.Provider value={playingSession}>
          <Story storyId={storyId} type={type} />
        </PlayingStorySession.Provider>
      </StoryContext.Provider>
    </StoryStatus.Provider>
  );
}

export default React.memo(StoryProvider);
