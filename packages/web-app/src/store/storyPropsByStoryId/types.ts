import { DatabaseStoryProps } from "../../sharedTypes";

export type StoryProps = DatabaseStoryProps;

export interface StoryPropsByStoryId {
  [Key: string]: undefined | StoryProps;
}
