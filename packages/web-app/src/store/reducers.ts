import { combineReducers } from "redux";
import currentUser from "./currentUser/reducer";
import usersById from "./usersById/reducer";
import storiesById from "./storiesById/reducer";
import entriesById from "./entriesById/reducer";

export const rawReducersObj = {
  currentUser,
  usersById,
  storiesById,
  entriesById,
};

export default combineReducers(rawReducersObj);
