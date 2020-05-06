import React from "react";
import * as firebase from "firebase/app";
import { useDispatch } from "react-redux";
import actions from "../store/actions";
import { useStoryPropsRef } from "./useStoryRef";
import {
  isObjectOf,
  isString,
  isDateString,
  isNumber,
} from "../utils/typeGuards";
import { DatabaseStoryProps } from "../sharedTypes";
import { StoryProps } from "../store/storyPropsByStoryId/types";
import { StoryFetchStatus } from "../store/storyFetchStateByStoryId/types";

const isStoryProps = isObjectOf<StoryProps>({
  storyId: (value) => isString(value.storyId),
  storyPropsDateModified: (value) => isDateString(value.storyPropsDateModified),
  storyPropsDateCreated: (value) => isDateString(value.storyPropsDateCreated),
  secondsPerRound: (value) =>
    value === undefined || isNumber(value.secondsPerRound),
  storyPropsVersion: (value) => isNumber(value.storyPropsVersion),
});

function transformStoryPropsResponse(response: DatabaseStoryProps): StoryProps {
  return response;
}

function useStoryPropsListener(storyId: string) {
  const ref = useStoryPropsRef(storyId);
  const dispatch = useDispatch();
  const [status, setStatus] = React.useState<StoryFetchStatus | null>(null);

  React.useEffect(() => {
    if (!ref) return;

    function setStoryPropsFromSnapshot(
      snapshot: firebase.database.DataSnapshot
    ) {
      var data = snapshot.val() as unknown;

      if (data === null || data === undefined) {
        setStatus("FETCHED_NOW_LISTENING");
        return;
      }

      if (!isStoryProps(data)) {
        setStatus("INVALID_DATA");
        return;
      }

      const storyPropsResponse = data as DatabaseStoryProps;

      setStatus("FETCHED_NOW_LISTENING");

      dispatch(
        actions.storyPropsByStoryId.setStoryProps({
          storyId,
          ...transformStoryPropsResponse(storyPropsResponse),
        })
      );
    }

    const eventType = "value";

    ref.on(eventType, setStoryPropsFromSnapshot);

    return () => {
      ref.off(eventType, setStoryPropsFromSnapshot);
    };
  }, [storyId, ref, dispatch]);

  return status;
}

export default useStoryPropsListener;
