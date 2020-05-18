import { ClientSession } from "../../sharedTypes";

export type Session = ClientSession;

export interface SessionsByIdState {
  [K: string]: undefined | Session;
}
