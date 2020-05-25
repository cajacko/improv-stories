import ReduxTypes from "ReduxTypes";
import createCachedSelector from "re-reselect";
import { Session } from "../sessionsById/types";
import { User, UsersByIdState } from "../usersById/types";
import { Story } from "../storiesById/types";
import { selectCurrentUser } from "../currentUser/selectors";
import { selectUsersById } from "../usersById/selectors";
import { selectStory } from "../storiesById/selectors";
import { selectSessionsById } from "../sessionsById/selectors";
import { selectStorySessionIds } from "../sessionIdsByStoryId/selectors";
import { selectDidCurrentUserEndSessionEarlyBySessionId } from "../didCurrentUserEndSessionEarlyBySessionId/selectors";
import transformSessionsToParagraphs from "../../utils/transformSessionsToParagraphs";

interface SelectorWithStoryIdProp {
  storyId: string;
}

export const selectActiveStorySession = createCachedSelector(
  selectStory,
  selectSessionsById,
  (story, sessionsById) => {
    if (!story) return null;
    if (!story.activeSessionId) return null;

    return sessionsById[story.activeSessionId] || null;
  }
)((state, props) => props.storyId);

export const selectLastStorySession = createCachedSelector(
  selectStory,
  selectSessionsById,
  selectStorySessionIds,
  (story, sessionsById, storySessionsById) => {
    if (!story) return null;

    let lastSessionId: string | undefined;
    let secondLastSessionId: string | undefined;
    let actualLastSessionId: string | undefined;

    if (storySessionsById) {
      lastSessionId = storySessionsById[storySessionsById.length - 1];
      secondLastSessionId = storySessionsById[storySessionsById.length - 2];
    }

    if (story.activeSessionId && lastSessionId === story.activeSessionId) {
      actualLastSessionId = secondLastSessionId;
    } else {
      actualLastSessionId = lastSessionId;
    }

    if (!actualLastSessionId) return null;

    return sessionsById[actualLastSessionId] || null;
  }
)((state, props) => props.storyId);

export const selectIsCurrentUserLastActiveSessionUserForStory = createCachedSelector(
  selectCurrentUser,
  selectLastStorySession,
  (currentUser, lastSession) => {
    if (!lastSession) return false;

    return lastSession.userId === currentUser.id;
  }
)((state, props) => props.storyId);

export const selectCurrentlyEditingStoryUser = createCachedSelector(
  selectActiveStorySession,
  selectUsersById,
  (session, usersById) => {
    if (!session) return null;

    return usersById[session.userId] || null;
  }
)((state, props) => props.storyId);

export const selectStorySessions = createCachedSelector(
  selectStorySessionIds,
  selectSessionsById,
  (sessionIds, sessionsById) => {
    if (!sessionIds) return null;

    const sessions: Session[] = [];

    sessionIds.forEach((sessionId) => {
      const session = sessionsById[sessionId];

      if (!session) return;

      sessions.push(session);
    });

    return sessions;
  }
)((state, props) => props.storyId);

export const selectAllStoryParagraphs = createCachedSelector(
  selectStorySessions,
  (sessions) => (sessions ? transformSessionsToParagraphs(sessions) : [])
)((state, props) => props.storyId);

export const selectDoesStoryHaveContent = createCachedSelector(
  selectAllStoryParagraphs,
  (paragraphs): boolean => {
    if (paragraphs.length < 1) return false;

    return !paragraphs.every((paragraph) => paragraph === "");
  }
)((state, props) => props.storyId);

// TODO: How to select the users with selectors?

interface SelectStoryUsersProps extends SelectorWithStoryIdProp {
  storyUserType: "NON_ACTIVE" | "ACTIVE" | "CONNECTED";
}

export const selectStoryUsers = createCachedSelector<
  ReduxTypes.RootState,
  SelectStoryUsersProps,
  Story | null,
  UsersByIdState,
  SelectStoryUsersProps["storyUserType"] | undefined,
  User[] | null
>(
  selectStory,
  selectUsersById,
  (state, props) => props.storyUserType,
  (story, usersById, storyUserType) => {
    if (!story) return null;

    const connectedUserIds = story.connectedUserIds;
    const activeUserIds = story.activeUserIds;

    const users: User[] = [];

    connectedUserIds.forEach((userId) => {
      const user = usersById[userId] || null;

      if (!user) return;

      switch (storyUserType) {
        case "ACTIVE":
          if (!activeUserIds.includes(userId)) return;
          break;
        case "NON_ACTIVE":
          if (activeUserIds.includes(userId)) return;
          break;
        default:
          break;
      }

      users.push(user);
    });

    return users;
  }
)((state, props) => `${props.storyId}_${props.storyUserType}`);

export const selectIsCurrentUserActiveInStory = createCachedSelector<
  ReduxTypes.RootState,
  SelectorWithStoryIdProp,
  string,
  User[] | null,
  boolean
>(
  (state) => selectCurrentUser(state).id,
  (state, props) =>
    selectStoryUsers(state, {
      storyId: props.storyId,
      storyUserType: "ACTIVE",
    }),
  (currentUserId, activeUsers) => {
    if (!activeUsers) return false;

    return activeUsers.some(({ id }) => id === currentUserId);
  }
)((state, props) => props.storyId);

export const selectIsCurrentUserActiveSessionUser = createCachedSelector(
  selectActiveStorySession,
  selectCurrentUser,
  (activeSession, currentUser) =>
    !!activeSession && activeSession.userId === currentUser.id
)((state, props) => props.storyId);

interface SelectCanCurrentUserEditProps {
  storyId: string;
  sessionId: string | null;
  storyType: "LIVE" | "STANDARD";
  isPlayingASession: boolean;
}

export const selectCanCurrentUserEdit = createCachedSelector<
  ReduxTypes.RootState,
  SelectCanCurrentUserEditProps,
  Session | null,
  boolean,
  boolean,
  boolean,
  SelectCanCurrentUserEditProps["storyType"],
  boolean,
  boolean
>(
  selectActiveStorySession,
  selectDidCurrentUserEndSessionEarlyBySessionId,
  selectIsCurrentUserActiveInStory,
  selectIsCurrentUserActiveSessionUser,
  (state, { storyType }) => storyType,
  (state, { isPlayingASession }) => isPlayingASession,
  (
    activeSession,
    didCurrentUserEndCurrentSessionEarly,
    isCurrentUserActiveInStory,
    isCurrentUserActiveSessionUser,
    storyType,
    isPlayingASession
  ) => {
    let canCurrentUserEdit =
      !!activeSession &&
      !didCurrentUserEndCurrentSessionEarly &&
      isCurrentUserActiveSessionUser;

    if (storyType === "LIVE") {
      return canCurrentUserEdit && isCurrentUserActiveInStory;
    }

    return canCurrentUserEdit && !isPlayingASession;
  }
)((state, props) => props.storyId);
