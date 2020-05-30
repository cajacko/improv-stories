import ReduxTypes from "ReduxTypes";
import createCachedSelector from "re-reselect";
import { StoryPropsContent } from "./types";

export interface SelectStoryPropsProps {
  storyId: string;
}

export const selectStoryProps = (
  state: ReduxTypes.RootState,
  props: SelectStoryPropsProps
) => state.storyPropsByStoryId[props.storyId] || null;

// TODO: Default length should be shared between api and web-app
const defaultSecondsPerRound = 40;

export const selectStoryPropsContent = createCachedSelector(
  selectStoryProps,
  (storyProps): StoryPropsContent =>
    storyProps
      ? {
          secondsPerRound:
            storyProps.secondsPerRound === undefined
              ? defaultSecondsPerRound
              : storyProps.secondsPerRound,
          canUsersEndRoundEarly:
            storyProps.canUsersEndRoundEarly === false ? false : true,
        }
      : {
          secondsPerRound: defaultSecondsPerRound,
          canUsersEndRoundEarly: true,
        }
)((state, props) => props.storyId);
