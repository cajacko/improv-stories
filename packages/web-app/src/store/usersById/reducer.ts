import { createReducer } from "typesafe-actions";
import { UsersByIdState } from "./types";

const defaultState: UsersByIdState = {};

const reducer = createReducer<UsersByIdState>(defaultState);

export default reducer;
