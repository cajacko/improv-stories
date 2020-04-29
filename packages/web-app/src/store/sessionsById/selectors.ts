import ReduxTypes from "ReduxTypes";

export const selectSession = (sessionId: string) => (
  state: ReduxTypes.RootState
) => state.sessionsById[sessionId] || null;
