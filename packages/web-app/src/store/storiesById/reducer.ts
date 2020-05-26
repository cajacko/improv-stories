import { createReducer } from "typesafe-actions";
import actions from "../actionsThatDefineTypes";
import { StoriesByIdState, Story } from "./types";

const defaultState: StoriesByIdState = {};

const reducer = createReducer<StoriesByIdState>(defaultState).handleAction(
  actions.storiesById.setStory,
  (state, { payload }) => {
    const story = state[payload.story.id];

    if (story && story.version >= payload.story.version) return state;

    const newStory: Story = {
      connectedUserIds: payload.story.connectedUsers.map(({ id }) => id),
      activeUserIds: payload.story.activeUsers.map(({ id }) => id),
      lastSessionId: payload.story.lastSession
        ? payload.story.lastSession.id
        : null,
      activeSessionId: payload.story.activeSession
        ? payload.story.activeSession.id
        : null,
      id: payload.story.id,
      dateCreated: payload.story.dateCreated,
      dateModified: payload.story.dateModified,
      version: payload.story.version,
    };

    const newState: StoriesByIdState = {
      ...state,
      [payload.story.id]: newStory,
    };

    return newState;
  }
);

export default reducer;
