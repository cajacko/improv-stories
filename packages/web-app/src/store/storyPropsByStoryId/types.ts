import { DatabaseStoryProps } from "../../sharedTypes";

export type StoryProps = DatabaseStoryProps;

export interface StoryPropsContent<S = number, C = boolean> {
  secondsPerRound: S;
  canUsersEndRoundEarly: C;
}

export interface StoryPropsByStoryId {
  [Key: string]: undefined | StoryProps;
}
