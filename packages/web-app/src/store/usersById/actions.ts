import { createAction } from "typesafe-actions";
import { User } from "../../sharedTypes";

export const setUsers = createAction("SET_USERS")<{
  users: User[];
}>();
