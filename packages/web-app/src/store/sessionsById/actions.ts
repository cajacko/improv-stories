import { createAction } from "typesafe-actions";
import { Session } from "../sessionsById/types";

export const setSession = createAction("SET_SESSION")<Session>();
