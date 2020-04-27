import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { UsersByIdState } from "./types";

const defaultState: UsersByIdState = {};

const reducer = createReducer<UsersByIdState>(defaultState)
  .handleAction(actions.storiesById.setStory, (state, { payload }) => {
    const allUsers = [
      ...payload.connectedUsers,
      ...payload.activeUsers,
      ...(payload.lastSession ? [payload.lastSession.user] : []),
      ...(payload.activeSession ? [payload.activeSession.user] : []),
    ];

    const newState = {
      ...state,
    };

    allUsers.forEach((user) => {
      const existingUser = newState[user.id];

      if (existingUser && existingUser.version >= user.version) {
        return;
      }

      newState[user.id] = user;
    });

    return newState;
  })
  .handleAction(
    actions.currentUser.setCurrentUserName,
    (state, { payload }) => {
      if (!payload.userId) return state;

      const user = state[payload.userId];

      if (!user) {
        return {
          ...state,
          [payload.userId]: {
            id: payload.userId,
            name: payload.name,
            dateAdded: payload.date,
            dateModified: payload.date,
            version: 0,
          },
        };
      }

      return {
        ...state,
        [payload.userId]: {
          ...user,
          name: payload.name,
        },
      };
    }
  );

export default reducer;
