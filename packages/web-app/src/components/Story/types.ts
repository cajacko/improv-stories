import React from "react";
import { User } from "../../sharedTypes";
import { Session } from "../../store/sessionsById/types";

// TODO: don't have an object for seconds left and total seconds, bad performance
export interface Generic<S = null, T = null, U = null, C = false, A = false> {
  editingSession: S;
  secondsLeftProps: T;
  editingUser: U;
  canCurrentUserEdit: C;
  isCurrentUserEditing: A;
}

export type StoryEditorProps =
  | Generic<
      Session,
      { secondsLeft: number; totalSeconds: number },
      User | null,
      boolean,
      boolean
    >
  | Generic;

export type InjectedStoryProps = StoryEditorProps & {
  isTextAreaFocussed: boolean;
  focusOnTextArea: () => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onTextAreaFocus: () => void;
  onTextAreaBlur: () => void;
  textAreaValue: string;
  onTextAreaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  storyType: "STANDARD" | "LIVE";
};

export interface StoryOwnProps {
  storyId: string;
}

export type StoryProps = StoryOwnProps & InjectedStoryProps;
