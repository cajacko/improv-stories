import ReduxTypes from "ReduxTypes";
import { Session } from "../sessionsById/types";
import { User } from "../usersById/types";
import { selectCurrentUser } from "../currentUser/selectors";
import { selectStory } from "../storiesById/selectors";
import { selectSession } from "../sessionsById/selectors";
import { selectUser } from "../usersById/selectors";
import { selectStorySessionIds } from "../sessionIdsByStoryId/selectors";

export const selectActiveStorySession = (storyId: string) => (
  state: ReduxTypes.RootState
) => {
  const story = selectStory(storyId)(state);

  if (!story) return null;
  if (!story.activeSessionId) return null;

  return selectSession(story.activeSessionId)(state);
};

export const selectActiveStorySessionUser = (storyId: string) => (
  state: ReduxTypes.RootState
) => {
  const session = selectActiveStorySession(storyId)(state);

  if (!session) return null;

  return selectUser(session.userId)(state);
};

export const selectStorySessions = (storyId: string) => (
  state: ReduxTypes.RootState
) => {
  const story = selectStory(storyId)(state);

  if (!story) return null;

  const sessionIds = selectStorySessionIds(storyId)(state);

  if (!sessionIds) return null;

  const sessions: Session[] = [];

  sessionIds.forEach((sessionId) => {
    const session = selectSession(sessionId)(state);

    if (!session) return;

    sessions.push(session);
  });

  return sessions;
};

export const selectAllStoryParagraphs = (
  storyId: string,
  editingSessionId: string | null,
  editingSessionFinalEntry: string | null
) => (state: ReduxTypes.RootState): string[] => {
  const sessions = selectStorySessions(storyId)(state) || [];

  let didAddEditingSession = false;

  let combinedSessions = sessions.reduce((acc, { finalEntry, id }) => {
    if (editingSessionFinalEntry && editingSessionId === id) {
      didAddEditingSession = true;
      return `${acc}${editingSessionFinalEntry}`;
    }

    return `${acc}${finalEntry}`;
  }, "");

  if (!didAddEditingSession && editingSessionFinalEntry && editingSessionId) {
    combinedSessions = `${combinedSessions}${editingSessionFinalEntry}`;
  }

  return combinedSessions.split("\n");
};

export const selectDoesStoryHaveContent = (
  storyId: string,
  editingSessionId: string | null,
  editingSessionFinalEntry: string | null
) => (state: ReduxTypes.RootState) => {
  const paragraphs = selectAllStoryParagraphs(
    storyId,
    editingSessionId,
    editingSessionFinalEntry
  )(state);

  if (paragraphs.length > 1) return true;
  if (paragraphs.length !== 1) return false;
  if (!paragraphs[0]) return false;

  return paragraphs[0] !== "";
};

export const selectNonActiveStoryUsers = (storyId: string) => (
  state: ReduxTypes.RootState
) => {
  const story = selectStory(storyId)(state);

  if (!story) return null;

  const connectedUserIds = story.connectedUserIds;
  const activeUserIds = story.activeUserIds;

  const users: User[] = [];

  connectedUserIds.forEach((userId) => {
    if (activeUserIds.includes(userId)) return;

    const user = selectUser(userId)(state);

    if (!user) return;

    users.push(user);
  });

  return users;
};

export const selectConnectedStoryUsers = (storyId: string) => (
  state: ReduxTypes.RootState
) => {
  const story = selectStory(storyId)(state);

  if (!story) return null;

  const connectedUserIds = story.connectedUserIds;

  const users: User[] = [];

  connectedUserIds.forEach((userId) => {
    const user = selectUser(userId)(state);

    if (!user) return;

    users.push(user);
  });

  return users;
};

export const selectActiveStoryUsers = (storyId: string) => (
  state: ReduxTypes.RootState
) => {
  const story = selectStory(storyId)(state);

  if (!story) return null;

  const activeUserIds = story.activeUserIds;

  const users: User[] = [];

  activeUserIds.forEach((userId) => {
    const user = selectUser(userId)(state);

    if (!user) return;

    users.push(user);
  });

  return users;
};

export const selectIsCurrentUserActiveInStory = (storyId: string) => (
  state: ReduxTypes.RootState
) => {
  const currentUserId = selectCurrentUser(state).id;

  const users = selectActiveStoryUsers(storyId)(state);

  if (!users) return false;

  return users.some(({ id }) => id === currentUserId);
};
