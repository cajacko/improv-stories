import { createReducer } from "typesafe-actions";
import { StoryPropsByStoryId } from "./types";
import actions from "../actionsThatDefineTypes";

const defaultState: StoryPropsByStoryId = {};

const reducer = createReducer<StoryPropsByStoryId>(defaultState).handleAction(
  actions.storyPropsByStoryId.setStoryProps,
  (state, { payload }) => {
    return {
      ...state,
      [payload.storyId]: payload,
    };
  }
);

export default reducer;
