import ReduxTypes from "ReduxTypes";
import { createSelector } from "reselect";
import { User } from "./types";
import { CurrentUserState } from "../currentUser/types";

export const selectUserById = createSelector<
  ReduxTypes.RootState,
  ReduxTypes.RootState,
  string,
  string,
  User | undefined,
  CurrentUserState,
  User | null
>(
  (state, userId) => state.usersById[userId],
  (state) => state.currentUser,
  (user, currentUser) => {
    if (!user) return null;

    if (user.id !== currentUser.id) return user;

    return {
      ...user,
      ...currentUser,
    };
  }
);
