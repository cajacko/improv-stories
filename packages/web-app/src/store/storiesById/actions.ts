import { createAction } from "typesafe-actions";
import { Story } from "../../sharedTypes";

export const setStory = createAction("SET_STORY")<Story>();
