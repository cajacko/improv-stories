import { Session } from "../sessionsById/types";

const separator = "/";

export function sortPropsToSortId(sessionId: string, dateStarted: string) {
  return `${dateStarted}${separator}${sessionId}`;
}

export function sortIdToSortProps(sortId: string) {
  const [dateStarted, sessionId] = sortId.split(separator);

  return {
    dateStarted,
    sessionId,
  };
}

export function sortIdToSessionId(sortId: string) {
  return sortIdToSortProps(sortId).sessionId;
}

export function sessionToSortId(session: Session) {
  return sortPropsToSortId(session.id, session.dateStarted);
}

export function insertSessions(sessions: Session[], sortIds: string[] = []) {
  const newSortIds = [...sortIds];
  let changed = false;

  sessions.forEach((session) => {
    const sortId = sessionToSortId(session);

    if (newSortIds.includes(sortId)) return;

    changed = true;

    newSortIds.push(sortId);
  });

  if (!changed) return sortIds;

  return newSortIds.sort();
}

export function insertAllSessionTypes(
  sortIds: string[] = [],
  sessions?: Session[] | null,
  activeSession?: Session | null,
  lastSession?: Session | null
) {
  const newSessions: Session[] = [];

  if (sessions) newSessions.push(...sessions);
  if (activeSession) newSessions.push(activeSession);
  if (lastSession) newSessions.push(lastSession);

  const newSortIds = insertSessions(newSessions, sortIds);

  if (sortIds === newSortIds) return sortIds;

  return newSortIds;
}
