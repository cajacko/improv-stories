import { Session } from "../store/sessionsById/types";

function transformSessionsToParagraphs(sessions: Session[]): string[] {
  let combinedSessions = sessions
    ? sessions.reduce((acc, { finalEntry, id, userId }, i, array) => {
        return `${acc}${finalEntry}`;
      }, "")
    : "";

  return combinedSessions.split("\n");
}

export default transformSessionsToParagraphs;
