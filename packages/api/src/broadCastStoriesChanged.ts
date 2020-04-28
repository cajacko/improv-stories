import { ServerMessage } from "./sharedTypes";
import { getStory, getUser, getGetDate, getGetId } from "./store";

export function broadCastStoriesChanged(storyIds: string[]) {
  storyIds.forEach(broadCastStoryChanged);

  return storyIds;
}

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

export default broadCastStoriesChanged;
