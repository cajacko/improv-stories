import { createAction } from "typesafe-actions";

export const setCurrentUser = createAction("SET_CURRENT_USER")<{
  name: string;
  userId: string;
}>();
