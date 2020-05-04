import ReduxTypes from "ReduxTypes";

export interface SelectStorySessionIdsProps {
  storyId: string;
}

export const selectStorySessionIds = (
  state: ReduxTypes.RootState,
  { storyId }: SelectStorySessionIdsProps
) => state.sessionIdsByStoryId[storyId] || null;
