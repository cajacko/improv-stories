import React from "react";
import * as firebase from "firebase/app";
import { useDispatch, useSelector } from "react-redux";
import actions from "../store/actions";
import { useEntriesRef } from "./useStoryRef";
import {
  isObjectOf,
  isString,
  isArrayOfStrings,
  isDateString,
  isKeyedObjectOf,
  isNumber,
} from "../utils/typeGuards";
import { DatabaseSession } from "../sharedTypes";
import { Session } from "../store/sessionsById/types";
import selectors from "../store/selectors";

interface SessionsResponse {
  [K: string]: DatabaseSession;
}

const isSession = isObjectOf<Session>({
  id: (value) => isString(value.id),
  dateStarted: (value) => isDateString(value.id),
  dateWillFinish: (value) => isDateString(value.id),
  dateModified: (value) => isDateString(value.dateModified),
  finalEntry: (value) => isString(value.id),
  entries: (value) => isArrayOfStrings(value.parts),
  userId: (value) => isString(value.userId),
  version: (value) => isNumber(value.version),
});

const isSessionsResponse = isKeyedObjectOf<DatabaseSession>(isSession);

function transformSessionsResponse(response: SessionsResponse): Session[] {
  return Object.values(response).sort(
    (a, b) =>
      new Date(a.dateWillFinish).getTime() -
      new Date(b.dateWillFinish).getTime()
  );
}

function useStoryHistoryListener(storyId: string) {
  const story = useSelector((state) =>
    selectors.storiesById.selectStory(state, { storyId })
  );
  const activeSessionId = story && story.activeSessionId;
  const lastSessionId = story && story.lastSessionId;
  const ref = useEntriesRef(storyId);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!ref) return;

    function setSessionsFromSnapshot(snapshot: firebase.database.DataSnapshot) {
      var data = snapshot.val() as unknown;

      if (data === null || data === undefined) {
        dispatch(
          actions.storyFetchStateByStoryId.setStoryFetchStatus({
            storyId,
            fetchStatus: "FETCHED_NOW_LISTENING",
          })
        );

        return;
      }

      if (!isSessionsResponse(data)) {
        dispatch(
          actions.storyFetchStateByStoryId.setStoryFetchStatus({
            storyId,
            fetchStatus: "INVALID_DATA",
          })
        );

        return;
      }

      const sessionsResponse = data as SessionsResponse;

      dispatch(
        actions.sessionIdsByStoryId.setStorySessions({
          storyId,
          sessions: transformSessionsResponse(sessionsResponse),
          lastSessionId,
          activeSessionId,
          fetchStatus: "FETCHED_NOW_LISTENING",
        })
      );
    }

    const eventType = "value";

    ref.on(eventType, setSessionsFromSnapshot);

    return () => {
      ref.off(eventType, setSessionsFromSnapshot);
    };
  }, [storyId, ref, dispatch, lastSessionId, activeSessionId]);

  React.useEffect(() => {
    return () => {
      dispatch(
        actions.storyFetchStateByStoryId.setStoryFetchStatus({
          fetchStatus: "REMOVE",
          storyId,
        })
      );
    };
  }, [dispatch, storyId]);
}

export default useStoryHistoryListener;
