import React from "react";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import StoryText from "./StoryText";
import StoryEditor from "./StoryEditor";

interface Props {
  storyId: string;
  sessionId: string;
}

function StorySession(props: Props) {
  const session = useSelector((state) =>
    selectors.sessionsById.selectSession(state, { sessionId: props.sessionId })
  );

  const activeStorySession = useSelector((state) =>
    selectors.misc.selectActiveStorySession(state, { storyId: props.storyId })
  );

  const isActiveSession =
    !!activeStorySession && activeStorySession.id === props.sessionId;

  const currentUserId = useSelector(selectors.currentUser.selectCurrentUser).id;

  const isCurrentUserEditingSession =
    isActiveSession &&
    !!activeStorySession &&
    activeStorySession.userId === currentUserId;

  const savedText = session && session.finalEntry;
  let [editingText, setEditingText] = React.useState<string | null>(
    savedText || ""
  );

  if (!isCurrentUserEditingSession) editingText = null;

  const text = editingText || savedText;

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
          onChange={setEditingText}
          autoCapitalize={false}
        />
      )}
    </>
  );
}

export default StorySession;
