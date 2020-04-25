export interface User {
  id: string;
  name: string | null;
}

export interface UsersByIdState {
  [K: string]: User | undefined;
}
