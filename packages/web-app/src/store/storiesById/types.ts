export interface Story {
  id: string;
  onlineUserIds: string[];
  entries: string[];
}

export interface StoriesByIdState {
  [K: string]: Story | undefined;
}
