import { combineReducers } from "redux";
import currentUser from "./currentUser/reducer";
import usersById from "./usersById/reducer";
import storiesById from "./storiesById/reducer";
import sessionsById from "./sessionsById/reducer";
import sessionIdsByStoryId from "./sessionIdsByStoryId/reducer";
import storyFetchStateByStoryId from "./storyFetchStateByStoryId/reducer";

export const rawReducersObj = {
  currentUser,
  usersById,
  storiesById,
  sessionsById,
  sessionIdsByStoryId,
  storyFetchStateByStoryId,
};

export default combineReducers(rawReducersObj);
