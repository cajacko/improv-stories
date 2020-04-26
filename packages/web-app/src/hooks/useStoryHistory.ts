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
} from "../utils/typeGuards";
import { Entry } from "../store/entriesById/types";

interface EntriesResponse {
  [K: string]: Entry;
}

const isEntry = isObjectOf<Entry>({
  id: (value) => isString(value.id),
  dateStarted: (value) => isDateString(value.id),
  dateFinished: (value) => isDateString(value.id),
  finalText: (value) => isString(value.id),
  parts: (value) => isArrayOfStrings(value.parts),
});

const isEntriesResponse = isKeyedObjectOf<Entry>(isEntry);

function transformEntriesResponse(response: EntriesResponse): Entry[] {
  return Object.values(response).sort(
    (a, b) =>
      new Date(a.dateFinished).getTime() - new Date(b.dateFinished).getTime()
  );
}

function useStoryHistory(storyId: string): Entry[] {
  const entryIds = useSelector((state) => {
    const story = state.storiesById[storyId];

    if (!story) return [];

    return story.entries;
  });

  const entries = useSelector((state) => {
    const entriesArr: Entry[] = [];

    entryIds.forEach((entryId) => {
      const entry = state.entriesById[entryId];

      if (!entry) return;

      entriesArr.push(entry);
    });

    return entriesArr;
  });

  const ref = useEntriesRef(storyId);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!ref) return;

    function setEntriesFromSnapshot(snapshot: firebase.database.DataSnapshot) {
      var data = snapshot.val() as unknown;

      if (!isEntriesResponse(data)) return;

      const entriesResponse = data as EntriesResponse;

      dispatch(
        actions.entriesById.setStoryEntries({
          storyId,
          entries: transformEntriesResponse(entriesResponse),
        })
      );
    }

    const eventType = "value";

    ref.on(eventType, setEntriesFromSnapshot);

    return () => {
      ref.off(eventType, setEntriesFromSnapshot);
    };
  }, [storyId, ref, dispatch]);

  return entries;
}

export default useStoryHistory;
