import { Session } from "../store/sessionsById/types";

function transformSessionsToParagraphs(
  sessions: Session[],
  opts: {
    editingSessionFinalEntry?: string;
    editingSessionId?: string;
    shouldRemoveLastSessionIfNotUserId?: string;
  } = {}
): string[] {
  let didAddEditingSession = false;

  let combinedSessions = sessions
    ? sessions.reduce((acc, { finalEntry, id, userId }, i, array) => {
        if (
          opts.shouldRemoveLastSessionIfNotUserId &&
          opts.shouldRemoveLastSessionIfNotUserId !== userId &&
          sessions.length - 1 === i
        ) {
          return acc;
        }

        if (opts.editingSessionFinalEntry && opts.editingSessionId === id) {
          didAddEditingSession = true;
          return `${acc}${opts.editingSessionFinalEntry}`;
        }

        return `${acc}${finalEntry}`;
      }, "")
    : "";

  if (
    !didAddEditingSession &&
    opts.editingSessionFinalEntry &&
    opts.editingSessionId
  ) {
    combinedSessions = `${combinedSessions}${opts.editingSessionFinalEntry}`;
  }

  return combinedSessions.split("\n");
}

export default transformSessionsToParagraphs;
