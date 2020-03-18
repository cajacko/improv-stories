import { createReducer } from "typesafe-actions";
import * as actions from "./actions";
import { CurrentUserState } from "./types";

const reducer = createReducer<CurrentUserState>(null).handleAction(
  actions.setCurrentUser,
  (state, { payload }) => payload
);

export default reducer;
