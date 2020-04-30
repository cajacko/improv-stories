import ReduxTypes from "ReduxTypes";

export const selectStorySessionIds = (storyId: string) => (
  state: ReduxTypes.RootState
) => state.sessionIdsByStoryId[storyId] || null;
