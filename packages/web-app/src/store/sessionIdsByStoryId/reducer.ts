import { createReducer } from "typesafe-actions";
import actions from "../actionsThatDefineTypes";
import { SessionIdsByStoryIdState } from "./types";

const defaultState: SessionIdsByStoryIdState = {};

const reducer = createReducer<SessionIdsByStoryIdState>(defaultState)
  .handleAction(
    actions.sessionIdsByStoryId.setStorySessions,
    (state, { payload }) => {
      const sessionIds = payload.sessions.map(({ id }) => id);

      if (payload.lastSessionId) {
        if (!sessionIds.includes(payload.lastSessionId)) {
          sessionIds.push(payload.lastSessionId);
        }
      }

      if (payload.activeSessionId) {
        if (!sessionIds.includes(payload.activeSessionId)) {
          sessionIds.push(payload.activeSessionId);
        }
      }

      return {
        ...state,
        [payload.storyId]: sessionIds,
      };
    }
  )
  .handleAction(actions.storiesById.setStory, (state, { payload }) => {
    if (!payload.sessionIds) return state;

    return {
      ...state,
      [payload.story.id]: payload.sessionIds,
    };
  });

export default reducer;
