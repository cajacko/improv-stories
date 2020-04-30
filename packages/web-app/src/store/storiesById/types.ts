export interface Story {
  connectedUserIds: string[];
  activeUserIds: string[];
  lastSessionId: null | string;
  activeSessionId: null | string;
  id: string;
  dateCreated: string;
  dateModified: string;
  version: number;
}

export interface StoriesByIdState {
  [K: string]: Story | undefined;
}
