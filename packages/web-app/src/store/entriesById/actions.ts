import { createAction } from "typesafe-actions";
import { Entry } from "./types";

export const setStoryEntries = createAction("SET_STORY_ENTRIES")<{
  storyId: string;
  entries: Entry[];
}>();
