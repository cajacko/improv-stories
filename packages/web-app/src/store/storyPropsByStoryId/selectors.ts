import ReduxTypes from "ReduxTypes";

export interface SelectStoryPropsProps {
  storyId: string;
}

export const selectStoryProps = (
  state: ReduxTypes.RootState,
  props: SelectStoryPropsProps
) => state.storyPropsByStoryId[props.storyId] || null;
