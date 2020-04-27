export interface UserDetails {
  name: string | null;
}

export interface User extends UserDetails {
  dateModified: string;
  dateAdded: string;
  id: string;
  version: number;
}

export interface Session {
  id: string;
  user: User;
  dateStarted: string;
  dateWillFinish: string;
  finalEntry: string;
  entries: string[];
  dateModified: string;
  version: number;
}

export interface Story {
  id: string;
  connectedUsers: User[];
  activeUsers: User[];
  lastSession: null | Session;
  activeSession: null | Session;
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
  | Message<"ADD_USER_TO_STORY", { storyId: string; isActive: boolean }>
  | Message<"REMOVE_USER_FROM_STORY", { storyId: string }>
  | Message<"SET_USER_DETAILS", { userDetails: UserDetails }>
  | Message<"ADD_ACTIVE_USER_TO_STORY", { storyId: string }>
  | Message<"REMOVE_ACTIVE_USER_FROM_STORY", { storyId: string }>
  | Message<"ADD_STORY_ENTRY", { storyId: string; entry: string }>;

export type ServerMessage = Message<"STORY_CHANGED", Story>;
