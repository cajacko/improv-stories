import React from "react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { send, listen } from "../../utils/socket";
import selectors from "../../store/selectors";
import StoryText from "./StoryText";
import StoryEditor from "./StoryEditor";

interface Props {
  storyId: string;
  sessionId: string;
  setSessionTextType:
    | "LIVE_STORY_SET_SESSION_TEXT"
    | "STANDARD_STORY_SET_SESSION_TEXT";
}

function StorySession({ storyId, sessionId, setSessionTextType }: Props) {
  const session = useSelector((state) =>
    selectors.sessionsById.selectSession(state, { sessionId: sessionId })
  );

  const activeStorySession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId: storyId })
  );

  const isActiveSession =
    !!activeStorySession && activeStorySession.id === sessionId;

  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;

  const isCurrentUserEditingSession =
    isActiveSession &&
    !!activeStorySession &&
    activeStorySession.userId === currentUserId;

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

    return listen("LIVE_STORY_SESSION_CHANGED", key, (message) => {
      if (message.type !== "LIVE_STORY_SESSION_CHANGED") return;
      if (sessionId !== message.payload.id) return;
      if (currentUserId === message.payload.user.id) return;

      setLiveSession({
        text: message.payload.finalEntry,
        version: message.payload.version,
      });
    });
  }, [sessionId, currentUserId]);

  if (!isCurrentUserEditingSession) editingText = null;

  const latestSavedText =
    liveSession && session && liveSession.version > session.version
      ? liveSession.text
      : savedText;

  const text = editingText || latestSavedText;

  if (text === null) return null;

  // TODO:
  // const autoCapitalize =
  //   !lastParagraph ||
  //   lastParagraph.trim() === "" ||
  //   lastParagraph.trim().endsWith(".");

  return (
    <>
      <StoryText text={text} />
      {editingText !== null && (
        <StoryEditor
          value={editingText}
          onChange={onChange}
          autoCapitalize={false}
        />
      )}
    </>
  );
}

export default React.memo(StorySession);
