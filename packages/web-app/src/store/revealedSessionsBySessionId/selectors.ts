import ReduxTypes from "ReduxTypes";

export const selectIsSessionRevealed = (
  state: ReduxTypes.RootState,
  { sessionId }: { sessionId: string }
) => state.revealedSessionsBySessionId[sessionId] || false;
