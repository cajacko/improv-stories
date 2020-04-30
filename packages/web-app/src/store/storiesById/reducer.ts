import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { StoriesByIdState, Story } from "./types";

const defaultState: StoriesByIdState = {};

const reducer = createReducer<StoriesByIdState>(defaultState).handleAction(
  actions.storiesById.setStory,
  (state, { payload }) => {
    const story = state[payload.id];

    if (story && story.version >= payload.version) return state;

    const newStory: Story = {
      connectedUserIds: payload.connectedUsers.map(({ id }) => id),
      activeUserIds: payload.activeUsers.map(({ id }) => id),
      lastSessionId: payload.lastSession ? payload.lastSession.id : null,
      activeSessionId: payload.activeSession ? payload.activeSession.id : null,
      id: payload.id,
      dateCreated: payload.dateCreated,
      dateModified: payload.dateModified,
      version: payload.version,
    };

    const newState: StoriesByIdState = {
      ...state,
      [payload.id]: newStory,
    };

    return newState;
  }
);

export default reducer;
