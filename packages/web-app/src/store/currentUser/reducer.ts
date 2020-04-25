import { createReducer } from "typesafe-actions";
import * as actions from "./actions";
import { CurrentUserState } from "./types";

const defaultState: CurrentUserState = {
  name: null,
};

const reducer = createReducer<CurrentUserState>(defaultState).handleAction(
  actions.setCurrentUserName,
  (state, { payload: { name } }) => ({
    ...state,
    name,
  })
);

export default reducer;
