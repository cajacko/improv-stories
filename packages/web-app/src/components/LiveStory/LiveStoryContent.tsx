import React from "react";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import { getLiveStoryTutorialText } from "../../utils/getTutorialText";
import StoryContent, {
  Props as StoryContentProps,
} from "../Story/StoryContent";

interface Props {
  storyId: string;
  editingSessionId: string | null;
  editingSessionFinalEntry: string | null;
  canCurrentUserEdit: boolean;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onTextAreaFocus: () => void;
  onTextAreaBlur: () => void;
  textAreaValue: string;
  onTextAreaChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isTextInvisible?: boolean;
}

function LiveStoryContent({
  storyId,
  editingSessionId,
  editingSessionFinalEntry,
  ...props
}: Props) {
  const fetchStatus = useSelector((state) =>
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(state, {
      storyId,
    })
  );

  const storyParagraphs = useSelector((state) =>
    selectors.misc.selectAllStoryParagraphs(state, {
      storyId,
      editingSessionId,
      editingSessionFinalEntry,
    })
  );

  const doesStoryHaveContent = useSelector((state) =>
    selectors.misc.selectDoesStoryHaveContent(state, {
      storyId,
      editingSessionId,
      editingSessionFinalEntry,
    })
  );

  let paragraphs: string[] | undefined;
  let textStyle: StoryContentProps["textStyle"] = "NORMAL";
  let cursorPosition: StoryContentProps["cursorPosition"] | undefined;
  let showCursor: boolean = false;

  if (fetchStatus !== null) {
    showCursor = true;

    if (!doesStoryHaveContent || fetchStatus !== "FETCHED_NOW_LISTENING") {
      paragraphs = getLiveStoryTutorialText(window.location.href);
      textStyle = "FADED";
      cursorPosition = "START";
    } else {
      paragraphs = storyParagraphs;
      cursorPosition = "END";
    }
  }

  return (
    <StoryContent
      paragraphs={paragraphs}
      textStyle={textStyle}
      cursorPosition={cursorPosition}
      showCursor={showCursor}
      {...props}
    />
  );
}

export default React.memo(LiveStoryContent);
