import ReduxTypes from "ReduxTypes";
import createCachedSelector from "re-reselect";
import { createSelector } from "reselect";
import { User, UsersByIdState } from "./types";
import { selectCurrentUser } from "../currentUser/selectors";
import { CurrentUserState } from "../currentUser/types";

export interface SelectUserProps {
  userId: string;
}

export const selectUsersById = createSelector<
  ReduxTypes.RootState,
  CurrentUserState,
  UsersByIdState,
  UsersByIdState
>(
  selectCurrentUser,
  (state) => state.usersById,
  (currentUser, usersById) => {
    const existingUser = usersById[currentUser.id];

    if (!existingUser) return usersById;

    return {
      ...usersById,
      [existingUser.id]: {
        ...existingUser,
        ...currentUser,
      },
    };
  }
);

export const selectUser = createCachedSelector<
  ReduxTypes.RootState,
  SelectUserProps,
  UsersByIdState,
  string,
  User | null
>(
  selectUsersById,
  (state, props) => props.userId,
  (usersById, userId) => {
    return usersById[userId] || null;
  }
)((state, props) => props.userId);
