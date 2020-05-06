import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { StoryFetchStatusByStoryIdState, StoryFetchStatus } from "./types";

const defaultState: StoryFetchStatusByStoryIdState = {};

interface Action {
  payload: {
    storyId: string;
    fetchStatus: StoryFetchStatus | "REMOVE" | null;
  };
}

function updateStatus(
  state: StoryFetchStatusByStoryIdState,
  { payload }: Action
): StoryFetchStatusByStoryIdState {
  const existingStatus = state[payload.storyId];

  switch (payload.fetchStatus) {
    case null:
      return state;
    case "REMOVE": {
      if (!existingStatus) return state;

      const newState = {
        ...state,
      };

      delete newState[payload.storyId];

      return newState;
    }
    default: {
      if (existingStatus === payload.fetchStatus) return state;

      return {
        ...state,
        [payload.storyId]: payload.fetchStatus,
      };
    }
  }
}

const reducer = createReducer<StoryFetchStatusByStoryIdState>(
  defaultState
).handleAction(
  actions.storyFetchStateByStoryId.setStoryFetchStatus,
  updateStatus
);

export default reducer;
