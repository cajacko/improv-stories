import { createAction } from "typesafe-actions";

export const setCurrentUserName = createAction("SET_CURRENT_USER_NAME")<{
  name: string;
}>();
