import { createReducer } from "typesafe-actions";
import * as actions from "./actions";
import { UsersByIdState } from "./types";

const defaultState: UsersByIdState = {};

const reducer = createReducer<UsersByIdState>(defaultState).handleAction(
  actions.setUsers,
  (state, { payload }) => ({
    ...state,
    ...payload.users.reduce<UsersByIdState>(
      (acc, user) => ({ ...acc, [user.id]: user }),
      {}
    ),
  })
);

export default reducer;
