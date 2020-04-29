import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { UsersByIdState } from "./types";

const defaultState: UsersByIdState = {};

const reducer = createReducer<UsersByIdState>(defaultState).handleAction(
  actions.storiesById.setStory,
  (state, { payload }) => {
    const allUsers = [
      ...payload.connectedUsers,
      ...payload.activeUsers,
      ...(payload.lastSession ? [payload.lastSession.user] : []),
      ...(payload.activeSession ? [payload.activeSession.user] : []),
    ];

    let changed = false;

    const newState = {
      ...state,
    };

    allUsers.forEach((user) => {
      const existingUser = newState[user.id];

      if (existingUser && existingUser.version >= user.version) {
        return;
      }

      changed = true;

      newState[user.id] = user;
    });

    return changed ? newState : state;
  }
);

export default reducer;
