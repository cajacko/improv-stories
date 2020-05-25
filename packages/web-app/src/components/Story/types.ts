import { Session } from "../../store/sessionsById/types";

// TODO: don't have an object for seconds left and total seconds, bad performance
export interface Generic<P = null> {
  playingSession: P;
}

export type StoryEditorProps =
  | Generic<{
      session: Session;
      currentEntryIndex: number;
      showedCurrentEntryAt: string;
      currentEntryText: string;
    } | null>
  | Generic;

export type InjectedStoryProps = StoryEditorProps;

export interface StoryOwnProps {
  storyId: string;
  type: "LIVE" | "STANDARD";
}

export type StoryProps = StoryOwnProps & InjectedStoryProps;
