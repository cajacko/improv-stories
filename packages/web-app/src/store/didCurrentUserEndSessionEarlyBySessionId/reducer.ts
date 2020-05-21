import { createReducer } from "typesafe-actions";
import actions from "../actionsThatDefineTypes";
import { DidCurrentUserEndSessionEarlyBySessionIdState } from "./types";

const defaultState: DidCurrentUserEndSessionEarlyBySessionIdState = {};

const reducer = createReducer<DidCurrentUserEndSessionEarlyBySessionIdState>(
  defaultState
).handleAction(
  actions.didCurrentUserEndSessionEarlyBySessionId
    .setDidCurrentUserEndSessionEarly,
  (state, { payload }) => ({
    ...state,
    [payload.sessionId]: true,
  })
);

export default reducer;
