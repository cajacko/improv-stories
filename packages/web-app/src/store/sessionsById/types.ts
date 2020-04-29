export interface Session {
  userId: string;
  id: string;
  dateStarted: string;
  dateWillFinish: string;
  finalEntry: string;
  entries: string[];
  dateModified: string;
  version: number;
}

export interface SessionsByIdState {
  [K: string]: undefined | Session;
}
