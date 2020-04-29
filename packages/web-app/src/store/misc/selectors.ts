import ReduxTypes from "ReduxTypes";
import { Session } from "../sessionsById/types";
import { User } from "../usersById/types";
import { selectStory } from "../storiesById/selectors";
import { selectSession } from "../sessionsById/selectors";
import { selectUser } from "../usersById/selectors";

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

  const sessions: Session[] = [];

  story.sessionIds.forEach((sessionId) => {
    const session = selectSession(sessionId)(state);

    if (!session) return;

    sessions.push(session);
  });

  return sessions;
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
