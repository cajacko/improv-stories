import { createReducer } from "typesafe-actions";
import actions from "../actionsThatDefineTypes";
import transformServerSessionToClientSession from "../../utils/transformServerSessionToClientSession";
import { SessionsByIdState, Session } from "./types";

const defaultState: SessionsByIdState = {};

function addNewSessions(
  state: SessionsByIdState,
  sessions: Array<Session | null> | null
): SessionsByIdState {
  if (!sessions) return state;

  let hasChanged = false;

  let newState = {
    ...state,
  };

  sessions.forEach((session) => {
    if (!session) return;

    const existingSession = state[session.id];

    if (existingSession && existingSession.version >= session.version) return;

    hasChanged = true;

    newState[session.id] = session;
  });

  return hasChanged ? newState : state;
}

const reducer = createReducer<SessionsByIdState>(defaultState)
  .handleAction(
    actions.sessionIdsByStoryId.setStorySessions,
    (state, { payload }) => addNewSessions(state, payload.sessions || null)
  )
  .handleAction(actions.storiesById.setStory, (state, { payload }) =>
    addNewSessions(state, [
      transformServerSessionToClientSession(payload.story.activeSession),
      transformServerSessionToClientSession(payload.story.lastSession),
    ])
  );

export default reducer;
