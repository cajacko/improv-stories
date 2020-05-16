import { broadCastStoriesChanged, broadCastSessionChanged } from "./broadcast";
import { ClientMessage } from "./sharedTypes";
import {
  removeActiveUserFromStory,
  addActiveUserToStory,
  setSessionText,
  addUserToStory,
  removeStoryUser,
  setUser,
  getStoreStory,
} from "./store";
import storyLoop, { finishStoryLoop } from "./storyLoop";
import getSeconds from "./getSeconds";

function switchOverMessage(
  userId: string,
  action: ClientMessage
  // NOTE: We want to return something other than undefined so TypeScript will ensure we cover every
  // condition
): Promise<string[]> | undefined {
  switch (action.type) {
    case "LIVE_STORY_ADD_ACTIVE_USER_TO_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(
          addActiveUserToStory(userId, action.payload.storyId)
        )
      );
    case "LIVE_STORY_SET_SESSION_TEXT": {
      const session = setSessionText(
        userId,
        action.payload.storyId,
        action.payload.text
      );

      if (!session) return Promise.resolve([]);

      broadCastSessionChanged(action.payload.storyId, session);

      return Promise.resolve([]);
    }
    case "LIVE_STORY_ADD_USER_TO_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(
          addUserToStory(
            userId,
            action.payload.storyId,
            action.payload.isActive
          )
        )
      );
    case "LIVE_STORY_REMOVE_ACTIVE_USER_FROM_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(
          removeActiveUserFromStory(userId, action.payload.storyId)
        )
      );
    case "LIVE_STORY_REMOVE_USER_FROM_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(removeStoryUser(userId, action.payload.storyId))
      );
    case "SET_USER_DETAILS":
      return Promise.resolve(
        broadCastStoriesChanged(setUser(userId, action.payload.userDetails))
      );
    case "LIVE_STORY_SET_SESSION_DONE": {
      const story = getStoreStory(action.payload.storyId);

      if (!story) return Promise.resolve([]);
      if (!story.activeSession) return Promise.resolve([]);
      if (story.activeSession.user !== userId) return Promise.resolve([]);

      return getSeconds(action.payload.storyId).then((seconds) =>
        finishStoryLoop(story.id, seconds, action.payload.sessionId)
      );
    }
    // NOTE: Do not add a default, then TypeScript will ensure we're handling every action
  }
}

function handleClientMessage(userId: string, action: ClientMessage) {
  const promise = switchOverMessage(userId, action);

  if (!promise) return Promise.resolve();

  return promise.then((changedStoryIds) =>
    changedStoryIds.map((storyId) =>
      getSeconds(storyId).then((seconds) => storyLoop(storyId, seconds))
    )
  );
}

export default handleClientMessage;
