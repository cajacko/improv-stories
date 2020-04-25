import { combineReducers } from "redux";
import currentUser from "./currentUser/reducer";
import usersById from "./usersById/reducer";
import storiesById from "./storiesById/reducer";

export const rawReducersObj = {
  currentUser,
  usersById,
  storiesById,
};

export default combineReducers(rawReducersObj);
