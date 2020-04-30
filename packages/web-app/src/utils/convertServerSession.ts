import { ServerSession } from "../sharedTypes";
import { Session } from "../store/sessionsById/types";

export function convertServerSession(
  session: ServerSession | null
): Session | null {
  if (!session) return null;

  return {
    userId: session.user.id,
    id: session.id,
    dateStarted: session.dateStarted,
    dateWillFinish: session.dateWillFinish,
    finalEntry: session.finalEntry,
    entries: session.entries,
    dateModified: session.dateModified,
    version: session.version,
  };
}

export default convertServerSession;
