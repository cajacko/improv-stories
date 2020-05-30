import React from "react";

type Callback = () => void;

export type SessionTextStatus = "HAS_CONTENT" | "DOES_NOT_HAVE_CONTENT";
export type SessionsTextStatus = SessionTextStatus;

export interface Context {
  setSessionTextStatus: (sessionId: string, status: SessionTextStatus) => void;
  removeSessionTextStatus: (sessionId: string) => void;
  sessionsTextStatus: SessionsTextStatus;
}

const defaultValue: Context = {
  setSessionTextStatus: () => {},
  removeSessionTextStatus: () => {},
  sessionsTextStatus: "DOES_NOT_HAVE_CONTENT",
};

const StoryStatus = React.createContext<Context>(defaultValue);

export default StoryStatus;
