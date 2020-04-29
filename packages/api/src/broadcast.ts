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

export function broadCastStoryChanged(storyId: string) {
  const story = getStory(storyId);

  story.connectedUsers.forEach((user) => {
    const storeUser = getUser(user.id);

    if (!storeUser) return;

    const message: ServerMessage = {
      id: getGetId()(),
      type: "STORY_CHANGED",
      payload: story,
      createdAt: getGetDate()(),
    };

    storeUser.socket.send(message);
  });

  return storyId;
}

export function broadCastStoriesChanged(storyIds: string[]) {
  storyIds.forEach(broadCastStoryChanged);

  return storyIds;
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
      type: "SESSION_CHANGED",
      payload: session,
      createdAt: getGetDate()(),
    };

    storeUser.socket.send(message);
  });

  return storyId;
}
