import { User as SharedUser } from "../../sharedTypes";

export type User = SharedUser;

export interface UsersByIdState {
  [K: string]: User | undefined;
}
