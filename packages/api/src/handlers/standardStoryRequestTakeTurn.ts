import { v4 as uuid } from "uuid";
import { startNewStorySession } from "../store";
import getSeconds from "../getSeconds";
import finishStorySession from "../utils/finishStorySession";
import { broadCastStoriesChanged } from "../broadcast";

function standardStoryRequestTakeTurn(
  userId: string,
  storyId: string
): Promise<null | string[]> {
  return getSeconds(storyId).then((seconds) => {
    const isStoryBeingEdited = false;

    if (isStoryBeingEdited) return Promise.resolve(null);

    const didUserWriteLastSession = false;

    if (didUserWriteLastSession) return Promise.resolve(null);

    const dateStarted = new Date().toISOString();
    const dateWillFinish = new Date(dateStarted);
    dateWillFinish.setSeconds(dateWillFinish.getSeconds() + seconds);

    const sessionId = uuid();

    setTimeout(() => {
      const changedStoryIds = finishStorySession(storyId, sessionId);

      if (!changedStoryIds) return;

      broadCastStoriesChanged(changedStoryIds, "STANDARD_STORY_STORY_CHANGED");
    }, seconds * 1000);

    return startNewStorySession(
      {
        id: sessionId,
        dateStarted,
        dateWillFinish: dateWillFinish.toISOString(),
        dateFinished: null,
        user: userId,
        dateModified: dateStarted,
        entries: [],
        finalEntry: "",
        version: 0,
      },
      storyId
    );
  });
}

export default standardStoryRequestTakeTurn;
