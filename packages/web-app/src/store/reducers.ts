import { combineReducers } from "redux";
import currentUser from "./currentUser/reducer";
import usersById from "./usersById/reducer";

export const rawReducersObj = {
  currentUser,
  usersById,
};

export default combineReducers(rawReducersObj);
