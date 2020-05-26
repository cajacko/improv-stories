import { ServerMessage } from "./sharedTypes";
import {
  getStory,
  getUser,
  getGetDate,
  getGetId,
  getStoreStory,
  StoreSession,
  getSession,
} from "./store";

const lastBroadCastedStoryVersionBySocketId: {
  [K: string]: undefined | { [K: string]: number | undefined };
} = {};

export function broadCastStoryChanged(
  storyId: string,
  type: "LIVE_STORY_STORY_CHANGED" | "STANDARD_STORY_STORY_CHANGED"
) {
  const story = getStory(storyId);

  story.connectedUsers.forEach((user) => {
    const storeUser = getUser(user.id);

    if (!storeUser) return;

    const socketId = storeUser.socket.id;

    const lastBroadCastedStoryVersions =
      lastBroadCastedStoryVersionBySocketId[socketId];

    const lastBroadCastedVersion =
      lastBroadCastedStoryVersions && lastBroadCastedStoryVersions[storyId];

    const doesNewStoryHaveHigherVersion =
      !lastBroadCastedVersion || story.version > lastBroadCastedVersion;

    if (!doesNewStoryHaveHigherVersion) return;

    const message: ServerMessage = {
      id: getGetId()(),
      type,
      payload: story,
      createdAt: getGetDate()(),
    };

    storeUser.socket.send(message);
  });

  return storyId;
}

export function broadCastStoriesChanged(
  storyIds: string[],
  type: "LIVE_STORY_STORY_CHANGED" | "STANDARD_STORY_STORY_CHANGED"
) {
  storyIds.forEach((storyId) => broadCastStoryChanged(storyId, type));

  return storyIds;
}

export function broadCastUserStories(
  userId: string,
  type: "LIVE_STORY_STORY_CHANGED" | "STANDARD_STORY_STORY_CHANGED"
) {
  const user = getUser(userId);

  if (!user) return;

  return broadCastStoriesChanged(Object.keys(user.connectedStories), type);
}

export function broadCastSessionChanged(
  storyId: string,
  storeSession: StoreSession
) {
  const story = getStoreStory(storyId);
  const session = getSession(storeSession);

  if (!story || !session) return null;

  Object.keys(story.connectedUsers).forEach((userId) => {
    const storeUser = getUser(userId);

    if (!storeUser) return;

    const message: ServerMessage = {
      id: getGetId()(),
      type: "LIVE_STORY_SESSION_CHANGED",
      payload: session,
      createdAt: getGetDate()(),
    };

    storeUser.socket.send(message);
  });

  return storyId;
}
