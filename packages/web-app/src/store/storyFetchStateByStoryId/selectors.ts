import ReduxTypes from "ReduxTypes";

export const selectStoryFetchStatus = (storyId: string) => (
  state: ReduxTypes.RootState
) => state.storyFetchStateByStoryId[storyId] || null;
