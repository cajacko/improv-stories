import ReduxTypes from "ReduxTypes";

export const selectDidCurrentUserEndSessionEarlyBySessionId = (
  state: ReduxTypes.RootState,
  { sessionId }: { sessionId: string | null }
) =>
  sessionId
    ? !!state.didCurrentUserEndSessionEarlyBySessionId[sessionId]
    : false;
