import { createReducer } from "typesafe-actions";
import actions from "../actionsThatDefineTypes";
import { UsersByIdState } from "./types";

const defaultState: UsersByIdState = {};

const reducer = createReducer<UsersByIdState>(defaultState).handleAction(
  actions.storiesById.setStory,
  (state, { payload }) => {
    const allUsers = [
      ...payload.story.connectedUsers,
      ...payload.story.activeUsers,
      ...(payload.story.lastSession ? [payload.story.lastSession.user] : []),
      ...(payload.story.activeSession
        ? [payload.story.activeSession.user]
        : []),
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
