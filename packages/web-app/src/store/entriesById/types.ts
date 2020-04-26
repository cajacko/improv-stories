export interface Entry {
  id: string;
  dateStarted: string;
  dateFinished: string;
  finalText: string;
  parts: string[];
}

export interface EntriesByIdState {
  [K: string]: undefined | Entry;
}
