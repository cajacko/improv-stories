import { Session } from "../store/sessionsById/types";

function transformSessionsToParagraphs(
  sessions: Session[],
  opts: {
    editingSessionFinalEntry?: string;
    editingSessionId?: string;
    shouldRemoveLastSessionIfNotUserId?: string;
    playingSessionId?: string;
    playingSessionText?: string;
  } = {}
): string[] {
  let didAddEditingSession = false;

  console.log("transformSessionsToParagraphs", opts.playingSessionText);

  let combinedSessions = sessions
    ? sessions.reduce((acc, { finalEntry, id, userId }, i, array) => {
        if (opts.playingSessionText && opts.playingSessionId === id) {
          didAddEditingSession = true;
          return `${acc}${opts.playingSessionText}`;
        }

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
