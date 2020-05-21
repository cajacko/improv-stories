import ReduxTypes from "ReduxTypes";
import createCachedSelector from "re-reselect";
import { Session } from "../sessionsById/types";
import { User, UsersByIdState } from "../usersById/types";
import { CurrentUserState } from "../currentUser/types";
import { Story } from "../storiesById/types";
import { selectCurrentUser } from "../currentUser/selectors";
import { selectUsersById } from "../usersById/selectors";
import { selectStory } from "../storiesById/selectors";
import { selectSessionsById } from "../sessionsById/selectors";
import { selectStorySessionIds } from "../sessionIdsByStoryId/selectors";
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

interface SelectAllStoryParagraphsProps extends SelectorWithStoryIdProp {
  editingSessionId: string | null;
  editingSessionFinalEntry: string | null;
  playingSessionId: string | null;
  playingSessionText: string | null;
}

const getSelectAllStoryParagraphsKey = (
  state: ReduxTypes.RootState,
  props: SelectAllStoryParagraphsProps
) => `${props.storyId}_${props.editingSessionId}`;

export const selectAllStoryParagraphs = createCachedSelector<
  ReduxTypes.RootState,
  SelectAllStoryParagraphsProps,
  Session[] | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string[]
>(
  selectStorySessions,
  (state, props) => props.editingSessionId,
  (state, props) => props.editingSessionFinalEntry,
  (state, props) => props.playingSessionId,
  (state, props) => props.playingSessionText,
  (
    sessions,
    editingSessionId,
    editingSessionFinalEntry,
    playingSessionId,
    playingSessionText
  ) =>
    sessions
      ? transformSessionsToParagraphs(sessions, {
          editingSessionId: editingSessionId || undefined,
          editingSessionFinalEntry: editingSessionFinalEntry || undefined,
          playingSessionId: playingSessionId || undefined,
          playingSessionText: playingSessionText || undefined,
        })
      : []
)(getSelectAllStoryParagraphsKey);

export const selectAllStandardStoryParagraphs = createCachedSelector<
  ReduxTypes.RootState,
  SelectAllStoryParagraphsProps,
  Session[] | null,
  CurrentUserState,
  string | null,
  string | null,
  string | null,
  string | null,
  string[]
>(
  selectStorySessions,
  selectCurrentUser,
  (state, props) => props.editingSessionId,
  (state, props) => props.editingSessionFinalEntry,
  (state, props) => props.playingSessionId,
  (state, props) => props.playingSessionText,
  (
    sessions,
    currentUser,
    editingSessionId,
    editingSessionFinalEntry,
    playingSessionId,
    playingSessionText
  ) =>
    sessions
      ? transformSessionsToParagraphs(sessions, {
          editingSessionId: editingSessionId || undefined,
          editingSessionFinalEntry: editingSessionFinalEntry || undefined,
          shouldRemoveLastSessionIfNotUserId: currentUser.id,
          playingSessionId: playingSessionId || undefined,
          playingSessionText: playingSessionText || undefined,
        })
      : []
)(getSelectAllStoryParagraphsKey);

// TODO: This doesn't switch depending on type of story
export const selectDoesStoryHaveContent = createCachedSelector(
  selectAllStoryParagraphs,
  (paragraphs): boolean => {
    if (paragraphs.length < 1) return false;

    return !paragraphs.every((paragraph) => paragraph === "");
  }
)(getSelectAllStoryParagraphsKey);

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
