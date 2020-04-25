import { User } from "../../sharedTypes";

export interface UsersByIdState {
  [K: string]: User | undefined;
}
