import ReduxTypes from "ReduxTypes";
import createCachedSelector from "re-reselect";
import { sortIdToSessionId } from "./transforms";

export interface SelectStorySessionIdsProps {
  storyId: string;
}

export const selectStorySessionIds = createCachedSelector(
  (state: ReduxTypes.RootState, { storyId }: SelectStorySessionIdsProps) =>
    state.sessionIdsByStoryId[storyId] || null,
  (sortIds) => sortIds && sortIds.map(sortIdToSessionId)
)((state, props) => props.storyId);
