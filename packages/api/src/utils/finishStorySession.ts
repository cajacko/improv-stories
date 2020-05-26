import getDatabase from "../getDatabase";
import { DatabaseSession } from "../sharedTypes";
import logger from "../logger";
import { getStoreStory, finishActiveStorySession } from "../store";

function finishStorySession(
  storyId: string,
  sessionId?: string,
  finishedEarly?: boolean
): string[] | null {
  logger.log("Finish story session", { storyId });

  const storyPreFinish = getStoreStory(storyId);

  if (!storyPreFinish || !storyPreFinish.activeSession) return null;

  const storeSessionId = storyPreFinish.activeSession.id;

  if (sessionId && sessionId !== storeSessionId) return null;

  finishActiveStorySession(storyId);

  const storyPostFinish = getStoreStory(storyId);

  if (
    storyPostFinish &&
    storyPostFinish.lastSession &&
    storyPostFinish.lastSession.id === storeSessionId &&
    storyPostFinish.lastSession.entries.length
  ) {
    const ref = getDatabase().ref(`/storiesById/${storyId}/entries`);

    const session: DatabaseSession = {
      id: storyPostFinish.lastSession.id,
      dateWillFinish: storyPostFinish.lastSession.dateWillFinish,
      dateStarted: storyPostFinish.lastSession.dateStarted,
      dateModified: storyPostFinish.lastSession.dateModified,
      finalEntry: storyPostFinish.lastSession.finalEntry,
      entries: storyPostFinish.lastSession.entries,
      userId: storyPostFinish.lastSession.user,
      version: storyPostFinish.lastSession.version,
      finishedEarly: !!finishedEarly,
      dateFinished:
        storyPostFinish.lastSession.dateFinished || new Date().toISOString(),
    };

    logger.log("Setting session in database", session);

    ref
      .push(session)
      .then(() => {
        logger.log("Set session in database", session);
      })
      .catch((error) => {
        logger.log("Error setting session in database", {
          session,
          error,
        });
      });
  }

  return [storyId];
}

export default finishStorySession;
