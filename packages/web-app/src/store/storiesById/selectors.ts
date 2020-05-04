import ReduxTypes from "ReduxTypes";

export interface SelectStoryProps {
  storyId: string;
}

export const selectStory = (
  state: ReduxTypes.RootState,
  props: SelectStoryProps
) => state.storiesById[props.storyId] || null;
