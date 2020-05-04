import ReduxTypes from "ReduxTypes";

export interface SelectSessionProps {
  sessionId: string;
}

export const selectSession = (
  state: ReduxTypes.RootState,
  { sessionId }: SelectSessionProps
) => state.sessionsById[sessionId] || null;

export const selectSessionsById = (state: ReduxTypes.RootState) =>
  state.sessionsById;
