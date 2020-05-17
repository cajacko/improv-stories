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
  (story, sessionsById) => {
    if (!story) return null;

    // TODO: Not sure we're actually setting the last session properly. May need to check the
    // sessions we get from the database
    if (!story.lastSessionId) return null;

    return sessionsById[story.lastSessionId] || null;
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
  string[]
>(
  selectStorySessions,
  (state, props) => props.editingSessionId,
  (state, props) => props.editingSessionFinalEntry,
  (sessions, editingSessionId, editingSessionFinalEntry) => {
    let didAddEditingSession = false;

    let combinedSessions = sessions
      ? sessions.reduce((acc, { finalEntry, id }) => {
          if (editingSessionFinalEntry && editingSessionId === id) {
            didAddEditingSession = true;
            return `${acc}${editingSessionFinalEntry}`;
          }

          return `${acc}${finalEntry}`;
        }, "")
      : "";

    if (!didAddEditingSession && editingSessionFinalEntry && editingSessionId) {
      combinedSessions = `${combinedSessions}${editingSessionFinalEntry}`;
    }

    return combinedSessions.split("\n");
  }
)(getSelectAllStoryParagraphsKey);

export const selectDoesStoryHaveContent = createCachedSelector(
  selectAllStoryParagraphs,
  (paragraphs) => {
    if (paragraphs.length > 1) return true;
    if (paragraphs.length !== 1) return false;
    if (!paragraphs[0]) return false;

    return paragraphs[0] !== "";
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
