import ReduxTypes from "ReduxTypes";

export interface SelectStoryFetchStatusProps {
  storyId: string;
}

export const selectStoryFetchStatus = (
  state: ReduxTypes.RootState,
  props: SelectStoryFetchStatusProps
) => state.storyFetchStateByStoryId[props.storyId] || null;
