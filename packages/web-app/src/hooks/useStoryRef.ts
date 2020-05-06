import React from "react";
import * as firebase from "firebase/app";
import getStoryRef from "../utils/getStoryRef";

function useStoryRef(storyId: string, additionalPath: string = "") {
  const [ref, setRef] = React.useState<firebase.database.Reference | null>(
    null
  );

  React.useEffect(() => {
    setRef(getStoryRef(storyId, additionalPath));
  }, [storyId, additionalPath]);

  return ref;
}

export const useEntriesRef = (storyId: string) =>
  useStoryRef(storyId, "/entries");

export const useStoryPropsRef = (storyId: string) =>
  useStoryRef(storyId, "/storyProps");

export default useStoryRef;
