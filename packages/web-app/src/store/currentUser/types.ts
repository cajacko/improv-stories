export interface User {
  name: string;
  userId: string;
}

export interface CurrentUser extends User {}

export type CurrentUserState = null | CurrentUser;
