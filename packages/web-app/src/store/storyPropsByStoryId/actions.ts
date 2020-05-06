import { createAction } from "typesafe-actions";
import { StoryProps } from "./types";

export const setStoryProps = createAction("SET_STORY_PROPS")<StoryProps>();
