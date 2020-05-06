import React from "react";
import { useDispatch } from "react-redux";
import actions from "../store/actions";
import useStoryHistoryListener from "./useStoryHistoryListener";
import useStoryPropsListener from "./useStoryPropsListener";
import { StoryFetchStatus } from "../store/storyFetchStateByStoryId/types";

function useStoryFromDatabase(storyId: string) {
  const dispatch = useDispatch();
  const storyHistoryListenerStatus = useStoryHistoryListener(storyId);
  const storyPropsListenerStatus = useStoryPropsListener(storyId);

  React.useEffect(() => {
    // TODO: Handle this together with the story props. 1 Hook that imports the listeners. The
    // listeners return their own state, we combine and then dispatch to the store
    return () => {
      dispatch(
        actions.storyFetchStateByStoryId.setStoryFetchStatus({
          fetchStatus: "REMOVE",
          storyId,
        })
      );
    };
  }, [dispatch, storyId]);

  React.useEffect(() => {
    let fetchStatus: StoryFetchStatus | null = null;

    if (
      storyHistoryListenerStatus === "INVALID_DATA" ||
      storyPropsListenerStatus === "INVALID_DATA"
    ) {
      fetchStatus = "INVALID_DATA";
    } else if (
      storyHistoryListenerStatus === "FETCHED_NOW_LISTENING" &&
      storyPropsListenerStatus === "FETCHED_NOW_LISTENING"
    ) {
      fetchStatus = "FETCHED_NOW_LISTENING";
    }

    if (fetchStatus === null) return;

    dispatch(
      actions.storyFetchStateByStoryId.setStoryFetchStatus({
        fetchStatus,
        storyId,
      })
    );
  }, [dispatch, storyHistoryListenerStatus, storyPropsListenerStatus, storyId]);
}

export default useStoryFromDatabase;
