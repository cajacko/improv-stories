import { createAction } from "typesafe-actions";
import { Session } from "../sessionsById/types";

export const setStorySessions = createAction("SET_STORY_SESSIONS")<{
  storyId: string;
  sessions: Session[];
  activeSessionId: string | null;
  lastSessionId: string | null;
}>();
