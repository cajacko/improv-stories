import database from "../utils/database";

function getStoryRef(storyId: string, additionalPath: string = "") {
  return database.ref(`/storiesById/${storyId}${additionalPath}`);
}

export function getEntriesRef(storyId: string) {
  return getStoryRef(storyId, "/entries");
}

export default getStoryRef;
