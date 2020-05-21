import { createReducer } from "typesafe-actions";
import actions from "../actionsThatDefineTypes";
import { RevealedSessionsBySessionIdState } from "./types";

const defaultState: RevealedSessionsBySessionIdState = {};

const reducer = createReducer<RevealedSessionsBySessionIdState>(
  defaultState
).handleAction(
  actions.revealedSessionsBySessionId.setRevealedSessionBySessionId,
  (state, { payload }) => {
    return {
      ...state,
      [payload.sessionId]: true,
    };
  }
);

export default reducer;
