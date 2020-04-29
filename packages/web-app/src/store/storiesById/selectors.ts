import ReduxTypes from "ReduxTypes";

export const selectStory = (storyId: string) => (state: ReduxTypes.RootState) =>
  state.storiesById[storyId] || null;
