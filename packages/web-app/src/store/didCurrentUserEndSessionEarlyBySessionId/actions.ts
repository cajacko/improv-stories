import { createAction } from "typesafe-actions";

export const setDidCurrentUserEndSessionEarly = createAction(
  "SET_DID_CURRENT_USER_END_SESSION_EARLY"
)<{ sessionId: string }>();
