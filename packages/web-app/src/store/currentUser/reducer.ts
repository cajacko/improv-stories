import { createReducer } from "typesafe-actions";
import actions from "../actions";
import { CurrentUserState } from "./types";

const defaultState: CurrentUserState = {
  name: null,
};

const reducer = createReducer<CurrentUserState>(defaultState).handleAction(
  actions.currentUser.setCurrentUserName,
  (state, { payload: { name } }) => ({
    ...state,
    name,
  })
);

export default reducer;
