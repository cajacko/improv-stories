import React from "react";
import * as firebase from "firebase/app";
import database from "../utils/database";

function useStoryRef(storyId: string, additionalPath: string = "") {
  const [ref, setRef] = React.useState<firebase.database.Reference | null>(
    null
  );

  React.useEffect(() => {
    setRef(database.ref(`/storiesById/${storyId}${additionalPath}`));
  }, [storyId, additionalPath]);

  return ref;
}

export const useEntriesRef = (storyId: string) =>
  useStoryRef(storyId, "/entries");

export default useStoryRef;
