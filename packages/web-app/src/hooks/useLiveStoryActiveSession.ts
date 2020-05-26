import React from "react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { listen } from "../utils/socket";
import selectors from "../store/selectors";

function useLiveStorySession(storyId: string) {
  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;
  const activeSession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId })
  );
  const activeSessionId = activeSession && activeSession.id;

  const [liveSession, setLiveSession] = React.useState<{
    text: string;
    version: number;
  } | null>(null);

  React.useEffect(() => {
    const key = uuid();

    return listen("LIVE_STORY_SESSION_CHANGED", key, (message) => {
      if (message.type !== "LIVE_STORY_SESSION_CHANGED") return;
      if (activeSessionId !== message.payload.id) return;
      if (currentUserId === message.payload.user.id) return;
      if (liveSession) {
        if (liveSession.version >= message.payload.version) {
          return;
        }

        if (liveSession.text === message.payload.finalEntry) {
          return;
        }
      }

      setLiveSession({
        text: message.payload.finalEntry,
        version: message.payload.version,
      });
    });
  }, [activeSessionId, currentUserId, liveSession]);

  return liveSession;
}

export default useLiveStorySession;
