import { createAction } from "typesafe-actions";

export const setStoryUsers = createAction("SET_STORY_USERS")<{
  storyId: string;
  userIds: string[];
}>();
