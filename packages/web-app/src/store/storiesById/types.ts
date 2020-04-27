export interface CurrentlyEditing {
  userId: string;
  startedDate: string;
  willFinishDate: string;
}

export interface Story {
  id: string;
  currentlyEditing: CurrentlyEditing | null;
  onlineUserIds: string[];
  entryIds: string[];
}

export interface StoriesByIdState {
  [K: string]: Story | undefined;
}
