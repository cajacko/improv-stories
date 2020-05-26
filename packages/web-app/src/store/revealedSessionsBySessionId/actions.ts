import { createAction } from "typesafe-actions";

export const setRevealedSessionBySessionId = createAction(
  "SET_REVEALED_SESSION_BY_SESSION_ID"
)<{
  sessionId: string;
}>();
