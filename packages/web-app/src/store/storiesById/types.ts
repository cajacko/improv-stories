export interface Story {
  id: string;
  onlineUserIds: string[];
}

export interface StoriesByIdState {
  [K: string]: Story | undefined;
}
