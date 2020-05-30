import React from "react";
import {
  Context,
  SessionTextStatus,
  SessionsTextStatus,
} from "../context/StoryStatus";

function useStoryStatus(): Context {
  const sessionTextStatusById: {
    [K: string]: SessionTextStatus;
  } = React.useMemo(() => ({}), []);

  const [sessionsTextStatus, setSessionsTextStatus] = React.useState<
    SessionsTextStatus
  >("DOES_NOT_HAVE_CONTENT");

  const updateSessionsTextStatus = React.useCallback(() => {
    const areAllEmpty = Object.values(sessionTextStatusById).every(
      (status) => status === "DOES_NOT_HAVE_CONTENT"
    );
    const status: SessionsTextStatus = areAllEmpty
      ? "DOES_NOT_HAVE_CONTENT"
      : "HAS_CONTENT";

    if (status !== sessionsTextStatus) {
      setSessionsTextStatus(status);
    }
  }, [sessionTextStatusById, sessionsTextStatus]);

  const removeSessionTextStatus = React.useCallback(
    (sessionId: string) => {
      delete sessionTextStatusById[sessionId];
      updateSessionsTextStatus();
    },
    [updateSessionsTextStatus, sessionTextStatusById]
  );

  const setSessionTextStatus = React.useCallback(
    (sessionId: string, status: SessionTextStatus) => {
      sessionTextStatusById[sessionId] = status;
      updateSessionsTextStatus();
    },
    [updateSessionsTextStatus, sessionTextStatusById]
  );

  return React.useMemo(
    () => ({
      sessionsTextStatus,
      removeSessionTextStatus,
      setSessionTextStatus,
    }),
    [sessionsTextStatus, removeSessionTextStatus, setSessionTextStatus]
  );
}

export default useStoryStatus;
