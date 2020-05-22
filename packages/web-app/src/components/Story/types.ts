import { User } from "../../sharedTypes";
import { Session } from "../../store/sessionsById/types";

// TODO: don't have an object for seconds left and total seconds, bad performance
export interface Generic<
  S = null,
  T = null,
  U = null,
  C = false,
  A = false,
  P = null
> {
  editingSession: S;
  secondsLeftProps: T;
  editingUser: U;
  canCurrentUserEdit: C;
  isCurrentUserActiveSessionUser: A;
  playingSession: P;
}

export type StoryEditorProps =
  | Generic<
      Session,
      { secondsLeft: number; totalSeconds: number },
      User | null,
      boolean,
      boolean,
      {
        session: Session;
        currentEntryIndex: number;
        showedCurrentEntryAt: string;
        currentEntryText: string;
      } | null
    >
  | Generic;

export type InjectedStoryProps = StoryEditorProps & {
  onRequestTakeTurn: (lastSession: Session | null) => void;
  requestTurnState: "CAN_REQUEST_TURN" | "REQUESTING" | "CANNOT_REQUEST_TURN";
};

export interface StoryOwnProps {
  storyId: string;
  type: "LIVE" | "STANDARD";
}

export type StoryProps = StoryOwnProps & InjectedStoryProps;
