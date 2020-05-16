export interface UserDetails {
  name: string | null;
}

export interface User extends UserDetails {
  dateModified: string;
  dateAdded: string;
  id: string;
  version: number;
}

export interface BaseSession {
  id: string;
  dateStarted: string;
  dateWillFinish: string;
  finalEntry: string;
  entries: string[];
  dateModified: string;
  version: number;
  finishedEarly?: boolean;
}

export interface ServerSession extends BaseSession {
  user: User;
  dateFinished: null | string;
}

export interface DatabaseSession extends BaseSession {
  userId: string;
  dateFinished: string;
}

export interface DatabaseStoryProps {
  secondsPerRound?: number;
  canUsersEndRoundEarly?: boolean;
  storyId: string;
  storyPropsDateCreated: string;
  storyPropsDateModified: string;
  storyPropsVersion: number;
}

export interface Story {
  id: string;
  connectedUsers: User[];
  activeUsers: User[];
  lastSession: null | ServerSession;
  activeSession: null | ServerSession;
  dateCreated: string;
  dateModified: string;
  version: number;
}

export interface Message<T, P = undefined> {
  id: string;
  type: T;
  payload: P;
  createdAt: string;
}

export type ClientMessage =
  | Message<
      "LIVE_STORY_ADD_USER_TO_STORY",
      { storyId: string; isActive: boolean }
    >
  | Message<"LIVE_STORY_REMOVE_USER_FROM_STORY", { storyId: string }>
  | Message<"SET_USER_DETAILS", { userDetails: UserDetails }>
  | Message<"LIVE_STORY_ADD_ACTIVE_USER_TO_STORY", { storyId: string }>
  | Message<"LIVE_STORY_REMOVE_ACTIVE_USER_FROM_STORY", { storyId: string }>
  | Message<"LIVE_STORY_SET_SESSION_TEXT", { storyId: string; text: string }>
  | Message<
      "LIVE_STORY_SET_SESSION_DONE",
      { storyId: string; sessionId: string }
    >;
// | Message<"STANDARD_STORY_REQUEST_TAKE_TURN", { storyId: string }>;

export type ServerMessage =
  | Message<"LIVE_STORY_STORY_CHANGED", Story>
  | Message<"LIVE_STORY_SESSION_CHANGED", ServerSession>;
