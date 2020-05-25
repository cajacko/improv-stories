import React from "react";
import { useSelector } from "react-redux";
import selectors from "../store/selectors";
import PlayingStorySession from "../context/PlayingStorySession";

function useCanCurrentUserEditStory(
  storyId: string,
  storyType: "LIVE" | "STANDARD"
) {
  const { playingStorySessionId } = React.useContext(PlayingStorySession);

  const activeSession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId })
  );

  const canCurrentUserEdit = useSelector((state) =>
    selectors.misc.selectCanCurrentUserEdit(state, {
      storyId,
      storyType,
      sessionId: activeSession ? activeSession.id : null,
      isPlayingASession: !!playingStorySessionId,
    })
  );

  return canCurrentUserEdit;
}

export default useCanCurrentUserEditStory;
