import ReduxTypes from "ReduxTypes";

export const selectDidCurrentUserEndSessionEarlyBySessionId = (
  state: ReduxTypes.RootState,
  { sessionId }: { sessionId: string }
) => !!state.didCurrentUserEndSessionEarlyBySessionId[sessionId];
