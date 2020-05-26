/**
 * Everything that is imported here should be actions created by typesafe-actions
 *
 * We have some more complex actions wrappers that inject part of the state or are async like
 * redux-thunk, they should not go here, as they don't contribute to the actions the reducers will
 * use and end up screwing the types with circular references.
 *
 * Instead import those actions into the main ./actions file so we can still use them elsewhere
 */

import * as currentUser from "./currentUser/actions";
import * as storiesById from "./storiesById/actions";
import * as sessionIdsByStoryId from "./sessionIdsByStoryId/actions";
import * as sessionsById from "./sessionsById/actions";
import * as storyFetchStateByStoryId from "./storyFetchStateByStoryId/actions";
import * as storyPropsByStoryId from "./storyPropsByStoryId/actions";
import * as revealedSessionsBySessionId from "./revealedSessionsBySessionId/actions";
import * as didCurrentUserEndSessionEarlyBySessionId from "./didCurrentUserEndSessionEarlyBySessionId/actions";

export default {
  currentUser,
  storiesById,
  sessionIdsByStoryId,
  sessionsById,
  storyFetchStateByStoryId,
  storyPropsByStoryId,
  didCurrentUserEndSessionEarlyBySessionId,
  revealedSessionsBySessionId,
};
