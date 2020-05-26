import { createSelector } from "reselect";
import { Session } from "../store/sessionsById/types";

const sortSessions = createSelector(
  (sessions: Session[]) => sessions,
  (sessions: Session[]) => {
    return sessions.sort(
      (a, b) =>
        new Date(a.dateWillFinish).getTime() -
        new Date(b.dateWillFinish).getTime()
    );
  }
);

export default sortSessions;
