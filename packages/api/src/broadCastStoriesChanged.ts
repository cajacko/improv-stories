import { ServerMessage } from "./sharedTypes";
import { getStory, getUser, getGetDate, getGetId } from "./store";
import logger from "./logger";

export function broadCastStoriesChanged(storyIds: string[]) {
  storyIds.forEach(broadCastStoryChanged);
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

    logger.log(message.type);

    storeUser.socket.send(message);
  });
}

export default broadCastStoriesChanged;
