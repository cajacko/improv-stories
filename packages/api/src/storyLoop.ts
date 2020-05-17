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
import finishStorySession from "./utils/finishStorySession";

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

  const changedStoryIds = finishStorySession(storyId, sessionId, finishedEarly);

  if (!changedStoryIds) return [];

  storyLoop(storyId, seconds);

  return changedStoryIds;
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

    broadCastStoriesChanged([storyId], "LIVE_STORY_STORY_CHANGED");

    logger.log("Story timeout start", { storyId });

    storyTimeouts[storyId] = setTimeout(() => {
      getSeconds(storyId).then((latestSeconds) =>
        broadCastStoriesChanged(
          finishStoryLoop(storyId, latestSeconds),
          "LIVE_STORY_STORY_CHANGED"
        )
      );
    }, seconds * 1000);
  } else if (activeUsers.length <= 0) {
    clearStoryTimeout(storyId);

    if (story.activeSession) {
      finishActiveStorySession(storyId);
      broadCastStoriesChanged([storyId], "LIVE_STORY_STORY_CHANGED");
    }
  }
}

export default storyLoop;
