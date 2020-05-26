import React from "react";
import { Context } from "../context/PlayingStorySession";

function usePlayingSession(): Context {
  const [playingStorySessionId, setPlayingStorySessionId] = React.useState<
    string | null
  >(null);

  const playStorySession = React.useCallback(
    (sessionId: string) => {
      if (playingStorySessionId) return;
      setPlayingStorySessionId(sessionId);
    },
    [playingStorySessionId]
  );

  const stopPlayingStorySession = React.useCallback(
    (sessionId: string) => {
      if (!playingStorySessionId) return;
      if (playingStorySessionId !== sessionId) return;

      setPlayingStorySessionId(null);
    },
    [playingStorySessionId]
  );

  return React.useMemo(
    (): Context => ({
      playingStorySessionId,
      playStorySession,
      stopPlayingStorySession,
    }),
    [playingStorySessionId, playStorySession, stopPlayingStorySession]
  );
}

export default usePlayingSession;
