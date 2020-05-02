export type StoryFetchStatus = "FETCHED_NOW_LISTENING" | "INVALID_DATA";

export interface StoryFetchStatusByStoryIdState {
  [K: string]: undefined | StoryFetchStatus;
}
