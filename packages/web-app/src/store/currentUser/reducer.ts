import { createReducer } from "typesafe-actions";
import { v4 as uuid } from "uuid";
import actions from "../actions";
import { CurrentUserState } from "./types";

const defaultState: CurrentUserState = {
  name: null,
  id: uuid(),
};

const reducer = createReducer<CurrentUserState>(defaultState).handleAction(
  actions.currentUser.setCurrentUserName,
  (state, { payload: { name } }) => ({
    ...state,
    name,
  })
);

export default reducer;
