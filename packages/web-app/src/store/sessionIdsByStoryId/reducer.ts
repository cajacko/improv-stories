import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { SessionIdsByStoryIdState } from "./types";

const defaultState: SessionIdsByStoryIdState = {};

const reducer = createReducer<SessionIdsByStoryIdState>(
  defaultState
).handleAction(
  actions.sessionIdsByStoryId.setStorySessions,
  (state, { payload }) => {
    return {
      ...state,
      [payload.storyId]: payload.sessions.map(({ id }) => id),
    };
  }
);

export default reducer;
