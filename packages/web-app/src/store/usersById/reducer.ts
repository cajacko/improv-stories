import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { UsersByIdState } from "./types";

const defaultState: UsersByIdState = {};

const reducer = createReducer<UsersByIdState>(defaultState).handleAction(
  actions.usersById.setUsers,
  (state, { payload }) => ({
    ...state,
    ...payload.users.reduce(
      (acc, user) => ({
        ...acc,
        [user.id]: {
          id: user.id,
          name: user.details.name || null,
        },
      }),
      {}
    ),
  })
);

export default reducer;
