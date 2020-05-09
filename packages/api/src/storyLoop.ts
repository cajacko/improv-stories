import getDatabase from "./getDatabase";
import { broadCastStoriesChanged } from "./broadcast";
import { DatabaseSession } from "./sharedTypes";
import logger from "./logger";
import {
  getStoreStory,
  finishActiveStorySession,
  startNewStorySession,
  getGetDate,
  getGetId,
} from "./store";
import getRand from "./getRand";
import getSeconds from "./getSeconds";

const storyTimeouts: { [K: string]: number | undefined } = {};

const clearStoryTimeout = (storyId: string) => {
  if (storyTimeouts[storyId]) clearTimeout(storyTimeouts[storyId]);
  delete storyTimeouts[storyId];
};

export function finishStoryLoop(
  storyId: string,
  seconds: number,
  sessionId?: string,
  finishedEarly?: boolean
): string[] {
  logger.log("Finish story loop", { storyId });

  clearStoryTimeout(storyId);

  const storyPreFinish = getStoreStory(storyId);

  if (!storyPreFinish || !storyPreFinish.activeSession) return [];

  const storeSessionId = storyPreFinish.activeSession.id;

  if (sessionId && sessionId !== storeSessionId) return [];

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

  storyLoop(storyId, seconds);

  return [storyId];
}

function storyLoop(storyId: string, seconds: number) {
  const story = getStoreStory(storyId);

  if (!story) {
    clearStoryTimeout(storyId);
    return;
  }

  const activeUsers = Object.keys(story.activeUsers);
  const isActive = activeUsers.length >= 2 || !!story.activeSession;

  if (isActive && !story.activeSession) {
    const id = getGetId()();
    const startDate = getGetDate()();
    const endDate = new Date(startDate);
    endDate.setSeconds(endDate.getSeconds() + seconds);

    const lastUserId = story.lastSession && story.lastSession.user;

    const nextUserIds = activeUsers.filter((userId) => userId !== lastUserId);

    const nextUserId = nextUserIds[Math.floor(getRand() * nextUserIds.length)];

    startNewStorySession(
      {
        id,
        dateModified: startDate,
        dateStarted: startDate,
        dateWillFinish: endDate.toISOString(),
        entries: [],
        finalEntry: "",
        version: 0,
        user: nextUserId,
        dateFinished: null,
      },
      storyId
    );

    broadCastStoriesChanged([storyId]);

    logger.log("Story timeout start", { storyId });

    storyTimeouts[storyId] = setTimeout(() => {
      getSeconds(storyId).then((latestSeconds) =>
        broadCastStoriesChanged(finishStoryLoop(storyId, latestSeconds))
      );
    }, seconds * 1000);
  } else if (activeUsers.length <= 0) {
    clearStoryTimeout(storyId);

    if (story.activeSession) {
      finishActiveStorySession(storyId);
      broadCastStoriesChanged([storyId]);
    }
  }
}

export default storyLoop;
