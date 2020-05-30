import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import { send, listen } from "../../utils/socket";
import selectors from "../../store/selectors";
import StoryText from "./StoryText";
import StoryEditor from "./StoryEditor";
import actions from "../../store/actions";
import PlayingStorySession from "../../context/PlayingStorySession";
import playStoryTimeout from "../../config/playStoryTimeout";
import useCanCurrentUserEditStory from "../../hooks/useCanCurrentUserEditStory";
import StoryStatus from "../../context/StoryStatus";

interface Props {
  storyId: string;
  storyType: "LIVE" | "STANDARD";
  sessionId: string;
  isLastSession: boolean;
  isTextInvisible: boolean;
  setSessionTextType:
    | "LIVE_STORY_SET_SESSION_TEXT"
    | "STANDARD_STORY_SET_SESSION_TEXT";
}

function StorySession({
  storyId,
  sessionId,
  setSessionTextType,
  storyType,
  isLastSession,
  isTextInvisible,
}: Props) {
  const dispatch = useDispatch();
  const { setSessionTextStatus, removeSessionTextStatus } = React.useContext(
    StoryStatus
  );

  const canCurrentUserEditStory = useCanCurrentUserEditStory(
    storyId,
    storyType
  );
  const { playingStorySessionId, stopPlayingStorySession } = React.useContext(
    PlayingStorySession
  );
  const isSessionRevealed = useSelector((state) =>
    selectors.revealedSessionsBySessionId.selectIsSessionRevealed(state, {
      sessionId,
    })
  );
  const session = useSelector((state) =>
    selectors.sessionsById.selectSession(state, { sessionId: sessionId })
  );
  const entries = session && session.entries;

  const activeStorySession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId: storyId })
  );

  const isPlayingSession =
    playingStorySessionId && session && playingStorySessionId === session.id;

  const isActiveSession =
    !!activeStorySession && activeStorySession.id === sessionId;

  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;
  const isSessionUser = !!session && session.userId === currentUserId;

  const isCurrentUserEditingThisSession =
    canCurrentUserEditStory && isActiveSession && isSessionUser;

  const savedText = session && session.finalEntry;

  let [editingText, setEditingText] = React.useState<string | null>(
    savedText || ""
  );

  const onChange = React.useCallback(
    (text: string) => {
      setEditingText(text);

      try {
        send({
          id: uuid(),
          createdAt: new Date().toISOString(),
          type: setSessionTextType,
          payload: {
            text: text,
            storyId: storyId,
          },
        });
      } catch {}
    },
    [storyId, setSessionTextType]
  );

  const [liveSession, setLiveSession] = React.useState<{
    text: string;
    version: number;
  } | null>(null);

  React.useEffect(() => {
    const key = uuid();

    if (storyType !== "LIVE") return;

    return listen("LIVE_STORY_SESSION_CHANGED", key, (message) => {
      if (storyType !== "LIVE") return;
      if (message.type !== "LIVE_STORY_SESSION_CHANGED") return;
      if (sessionId !== message.payload.id) return;
      if (currentUserId === message.payload.user.id) return;

      setLiveSession({
        text: message.payload.finalEntry,
        version: message.payload.version,
      });
    });
  }, [sessionId, currentUserId, storyType]);

  if (!isCurrentUserEditingThisSession) editingText = null;

  const latestSavedText =
    liveSession && session && liveSession.version > session.version
      ? liveSession.text
      : savedText;

  const [playingIndex, setPlayingIndex] = React.useState<null | number>(null);

  const getPlayingText = React.useCallback(
    (index: number | null): string | null => {
      if (!isPlayingSession) return null;
      if (index === null) return null;
      if (!entries || entries.length < 1) return null;

      return entries[index] || null;
    },
    [entries, isPlayingSession]
  );

  React.useEffect(() => {
    if (!isPlayingSession) return;
    if (playingIndex === null) return;

    const timeout = setTimeout(() => {
      if (!isPlayingSession) return;
      if (playingIndex === null) return;

      const nextIndex = playingIndex + 1;

      const nextPlayingText = getPlayingText(nextIndex);

      if (nextPlayingText) {
        setPlayingIndex(nextIndex);
      } else {
        setPlayingIndex(null);

        stopPlayingStorySession(sessionId);

        dispatch(
          actions.revealedSessionsBySessionId.setRevealedSessionBySessionId({
            sessionId,
          })
        );
      }
    }, playStoryTimeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    playingIndex,
    getPlayingText,
    sessionId,
    dispatch,
    stopPlayingStorySession,
    isPlayingSession,
  ]);

  React.useEffect(() => () => stopPlayingStorySession(sessionId), [
    stopPlayingStorySession,
    sessionId,
  ]);

  React.useEffect(() => {
    if (!isPlayingSession) return;
    if (playingIndex !== null) return;

    setPlayingIndex(0);
  }, [playingStorySessionId, sessionId, playingIndex, isPlayingSession]);

  const playingText = getPlayingText(playingIndex);

  let text = editingText || playingText || latestSavedText;

  if (
    storyType === "STANDARD" &&
    !isSessionUser &&
    isLastSession &&
    !playingText &&
    !isSessionRevealed
  ) {
    text = null;
  }

  React.useEffect(() => {
    setSessionTextStatus(
      sessionId,
      text ? "HAS_CONTENT" : "DOES_NOT_HAVE_CONTENT"
    );
  }, [text, sessionId, removeSessionTextStatus, setSessionTextStatus]);

  React.useEffect(() => () => removeSessionTextStatus(sessionId), [
    sessionId,
    removeSessionTextStatus,
  ]);

  if (text === null) return null;

  // TODO:
  // const autoCapitalize =
  //   !lastParagraph ||
  //   lastParagraph.trim() === "" ||
  //   lastParagraph.trim().endsWith(".");

  return (
    <>
      <StoryText text={text} isTextInvisible={isTextInvisible} />
      {isCurrentUserEditingThisSession && (
        <StoryEditor
          value={text || ""}
          onChange={onChange}
          autoCapitalize={false}
        />
      )}
    </>
  );
}

export default React.memo(StorySession);
