import broadCastStoriesChanged from "./broadCastStoriesChanged";
import { ClientMessage } from "./sharedTypes";
import {
  removeActiveUserFromStory,
  addActiveUserToStory,
  addStoryEntry,
  addUserToStory,
  removeStoryUser,
  setUser,
} from "./store";

function handleClientMessage(
  userId: string,
  action: ClientMessage
  // NOTE: We want to return something other than undefined so TypeScript will ensure we cover every
  // condition
): boolean {
  // TODO: On each message after the store functions have run, check if we need to start or stop a
  // story

  switch (action.type) {
    case "ADD_ACTIVE_USER_TO_STORY":
      broadCastStoriesChanged(
        addActiveUserToStory(userId, action.payload.storyId)
      );
      return true;
    case "ADD_STORY_ENTRY":
      broadCastStoriesChanged(
        addStoryEntry(userId, action.payload.storyId, action.payload.entry)
      );
      return true;
    case "ADD_USER_TO_STORY":
      broadCastStoriesChanged(
        addUserToStory(userId, action.payload.storyId, action.payload.isActive)
      );
      return true;
    case "REMOVE_ACTIVE_USER_FROM_STORY":
      broadCastStoriesChanged(
        removeActiveUserFromStory(userId, action.payload.storyId)
      );
      return true;
    case "REMOVE_USER_FROM_STORY":
      broadCastStoriesChanged(removeStoryUser(userId, action.payload.storyId));
      return true;
    case "SET_USER_DETAILS":
      broadCastStoriesChanged(setUser(userId, action.payload.userDetails));
      return true;
    // NOTE: Do not add a default, then TypeScript will ensure we're handling every action
  }
}

export default handleClientMessage;
