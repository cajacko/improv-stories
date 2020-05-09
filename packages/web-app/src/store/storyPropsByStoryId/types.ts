import { DatabaseStoryProps } from "../../sharedTypes";

export type StoryProps = DatabaseStoryProps;

export interface StoryPropsContent<S = number> {
  secondsPerRound: S;
  canUsersEndRoundEarly?: boolean;
}

export interface StoryPropsByStoryId {
  [Key: string]: undefined | StoryProps;
}
