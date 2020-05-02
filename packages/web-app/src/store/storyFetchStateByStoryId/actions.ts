import { createAction } from "typesafe-actions";
import { StoryFetchStatus } from "./types";

export const setStoryFetchStatus = createAction("SET_STORY_FETCH_STATUS")<{
  storyId: string;
  fetchStatus: StoryFetchStatus | "REMOVE";
}>();
