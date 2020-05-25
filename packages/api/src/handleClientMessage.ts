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
import standardStoryRequestTakeTurn from "./handlers/standardStoryRequestTakeTurn";

interface PostHandleAction {
  type: "RUN_STORY_LOOP";
  payload: string[];
}

function transformToNoPostHandleAction() {
  return null;
}

function transformToRunStoryLoop(
  storyIds: string[] | null
): PostHandleAction | null {
  if (!storyIds) return null;

  return {
    type: "RUN_STORY_LOOP",
    payload: storyIds,
  };
}

function _switchOverAllTypedMessages(
  userId: string,
  action: ClientMessage
  // NOTE: We want to return something other than undefined so TypeScript will ensure we cover every
  // condition
): Promise<PostHandleAction | null> {
  switch (action.type) {
    case "LIVE_STORY_ADD_ACTIVE_USER_TO_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(
          addActiveUserToStory(userId, action.payload.storyId),
          "LIVE_STORY_STORY_CHANGED"
        )
      ).then(transformToRunStoryLoop);
    case "STANDARD_STORY_SET_SESSION_TEXT": {
      setSessionText(userId, action.payload.storyId, action.payload.text);

      return Promise.resolve(null);
    }
    case "LIVE_STORY_SET_SESSION_TEXT": {
      const session = setSessionText(
        userId,
        action.payload.storyId,
        action.payload.text
      );

      if (!session) return Promise.resolve(null);

      broadCastSessionChanged(action.payload.storyId, session);

      return Promise.resolve(null);
    }
    case "LIVE_STORY_ADD_USER_TO_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(
          addUserToStory(
            userId,
            action.payload.storyId,
            action.payload.isActive
          ),
          "LIVE_STORY_STORY_CHANGED"
        )
      ).then(transformToRunStoryLoop);
    case "LIVE_STORY_REMOVE_ACTIVE_USER_FROM_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(
          removeActiveUserFromStory(userId, action.payload.storyId),
          "LIVE_STORY_STORY_CHANGED"
        )
      ).then(transformToRunStoryLoop);
    case "LIVE_STORY_REMOVE_USER_FROM_STORY":
      return Promise.resolve(
        broadCastStoriesChanged(
          removeStoryUser(userId, action.payload.storyId),
          "LIVE_STORY_STORY_CHANGED"
        )
      ).then(transformToRunStoryLoop);
    case "SET_USER_DETAILS":
      return Promise.resolve(
        broadCastStoriesChanged(
          setUser(userId, action.payload.userDetails),
          "LIVE_STORY_STORY_CHANGED"
        )
      ).then(transformToNoPostHandleAction);
    case "LIVE_STORY_SET_SESSION_DONE": {
      const story = getStoreStory(action.payload.storyId);

      if (!story) return Promise.resolve(null);
      if (!story.activeSession) return Promise.resolve(null);
      if (story.activeSession.user !== userId) return Promise.resolve(null);

      return getSeconds(action.payload.storyId)
        .then((seconds) =>
          finishStoryLoop(story.id, seconds, action.payload.sessionId)
        )
        .then(transformToRunStoryLoop);
    }
    case "STANDARD_STORY_REQUEST_TAKE_TURN": {
      return standardStoryRequestTakeTurn(
        userId,
        action.payload.storyId,
        action.payload.buffer
      )
        .then(
          (storyIds) =>
            storyIds &&
            broadCastStoriesChanged(storyIds, "STANDARD_STORY_STORY_CHANGED")
        )
        .then(transformToNoPostHandleAction);
    }
    // NOTE: Do not add a default, then TypeScript will ensure we're handling every action
  }
}

// Done this way so we can represent the actual situation of the types. The client could send
// anything
function switchOverMessage(
  userId: string,
  action: ClientMessage
): Promise<PostHandleAction | null> | undefined {
  return _switchOverAllTypedMessages(userId, action);
}

function handleClientMessage(
  userId: string,
  action: ClientMessage
): Promise<unknown> {
  const promise = switchOverMessage(userId, action);

  if (!promise) return Promise.resolve();

  return promise.then((postHandleAction) => {
    if (!postHandleAction) return;

    if (postHandleAction.type === "RUN_STORY_LOOP") {
      return Promise.all(
        postHandleAction.payload.map((storyId) =>
          getSeconds(storyId).then((seconds) => storyLoop(storyId, seconds))
        )
      );
    }
  });
}

export default handleClientMessage;
