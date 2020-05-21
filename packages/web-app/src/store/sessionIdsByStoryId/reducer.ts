import { createReducer } from "typesafe-actions";
import actions from "../actionsThatDefineTypes";
import { SessionIdsByStoryIdState } from "./types";
import { insertAllSessionTypes } from "./transforms";

const defaultState: SessionIdsByStoryIdState = {};

const reducer = createReducer<SessionIdsByStoryIdState>(defaultState)
  .handleAction(
    actions.sessionIdsByStoryId.setStorySessions,
    (state, { payload }) => {
      const existingSortIds = state[payload.storyId];

      const newSortIds = insertAllSessionTypes(
        existingSortIds,
        payload.sessions,
        payload.activeSession,
        payload.lastSession
      );

      if (existingSortIds === newSortIds) return state;

      return {
        ...state,
        [payload.storyId]: newSortIds,
      };
    }
  )
  .handleAction(actions.storiesById.setStory, (state, { payload }) => {
    if (!payload.sessionSortIds) return state;

    const existingSortIds = state[payload.story.id];

    if (existingSortIds === payload.sessionSortIds) return state;

    return {
      ...state,
      [payload.story.id]: payload.sessionSortIds,
    };
  });

export default reducer;
