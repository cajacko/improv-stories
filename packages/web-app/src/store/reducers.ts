import { combineReducers } from "redux";
import currentUser from "./currentUser/reducer";
import usersById from "./usersById/reducer";
import storiesById from "./storiesById/reducer";
import sessionsById from "./sessionsById/reducer";
import sessionIdsByStoryId from "./sessionIdsByStoryId/reducer";

export const rawReducersObj = {
  currentUser,
  usersById,
  storiesById,
  sessionsById,
  sessionIdsByStoryId,
};

export default combineReducers(rawReducersObj);
