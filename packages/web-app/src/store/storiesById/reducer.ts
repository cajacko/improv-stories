import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { StoriesByIdState } from "./types";

const defaultState: StoriesByIdState = {};

const reducer = createReducer<StoriesByIdState>(defaultState)
  .handleAction(actions.storiesById.setStory, (state, { payload }) => {
    const story = state[payload.id] || { id: payload.id, entryIds: [] };

    return {
      ...state,
      [payload.id]: {
        ...story,
        onlineUserIds: payload.activeUsers.map(({ id }) => id),
        currentlyEditing: payload.activeSession
          ? {
              userId: payload.activeSession.user.id,
              startedDate: payload.activeSession.dateStarted,
              willFinishDate: payload.activeSession.dateWillFinish,
            }
          : null,
      },
    };
  })
  .handleAction(actions.entriesById.setStoryEntries, (state, { payload }) => {
    const story = state[payload.storyId];

    const entryIds = payload.entries.map(({ id }) => id);

    if (!story) {
      return {
        ...state,
        [payload.storyId]: {
          id: payload.storyId,
          onlineUserIds: [],
          entryIds,
          currentlyEditing: null,
        },
      };
    }

    const newStory = {
      ...story,
      entryIds,
    };

    return {
      ...state,
      [payload.storyId]: newStory,
    };
  });

export default reducer;
