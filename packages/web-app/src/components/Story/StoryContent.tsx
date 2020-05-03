import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import getTutorialText from "../../utils/getTutorialText";

interface StyleProps {
  showCursor: boolean;
  isTextInvisible: boolean;
}

const animationKeyframeKey = "storycontent__flash";

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
  createStyles({
    [`@keyframes ${animationKeyframeKey}`]: {
      "0%": {
        opacity: 1,
      },
      "25%": {
        opacity: 0,
      },
      "75%": {
        opacity: 0,
      },
      "100%": {
        opacity: 1,
      },
    },
    cursor: {
      borderRight: ({ showCursor }) =>
        showCursor ? `1px solid ${theme.palette.secondary.main}` : 0,
      marginLeft: 0,
      animation: `$${animationKeyframeKey} linear 1s infinite`,
    },
    textAreaContainer: {
      position: "relative",
    },
    textArea: {
      position: "absolute",
      left: -9999999,
      width: 200,
      height: 0,
    },
    tutorialText: {
      color: "grey",
    },
    paragraph: {
      opacity: ({ isTextInvisible }) => (isTextInvisible ? 0 : 1),
    },
  })
);

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

function StoryContent({
  storyId,
  editingSessionId,
  editingSessionFinalEntry,
  canCurrentUserEdit,
  textAreaRef,
  textAreaValue,
  onTextAreaBlur,
  onTextAreaFocus,
  onTextAreaChange,
  isTextInvisible,
}: Props) {
  const fetchStatus = useSelector(
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(storyId)
  );

  const paragraphs = useSelector(
    selectors.misc.selectAllStoryParagraphs(
      storyId,
      editingSessionId,
      editingSessionFinalEntry
    )
  );

  const classes = useStyles({
    showCursor: canCurrentUserEdit || true,
    isTextInvisible: !!isTextInvisible,
  });

  let showType: "TUTORIAL" | "CONTENT" | "NONE";

  if (fetchStatus === null) {
    showType = "NONE";
  } else if (!paragraphs.length || fetchStatus !== "FETCHED_NOW_LISTENING") {
    showType = "TUTORIAL";
  } else {
    showType = "CONTENT";
  }

  const lastParagraph = paragraphs[paragraphs.length - 1] as string | undefined;

  // TODO: Need a way of identifying a new paragraph, also need this for the cursor.
  const autoCapitalize =
    !lastParagraph ||
    lastParagraph.trim() === "" ||
    lastParagraph.trim().endsWith(".");

  return (
    <>
      {showType === "TUTORIAL" &&
        getTutorialText(window.location.href).map((text, i) => (
          <p key={i} className={classes.paragraph}>
            {0 === i && <span className={classes.cursor} />}
            <span className={classes.tutorialText}>{text}</span>
          </p>
        ))}
      {showType === "CONTENT" &&
        paragraphs.map((text, i) => (
          <p key={i} className={classes.paragraph}>
            {text}
            {paragraphs.length - 1 === i && <span className={classes.cursor} />}
          </p>
        ))}
      {/* Textarea must always be statically rendered and never unmount */}
      <span className={classes.textAreaContainer}>
        <textarea
          className={classes.textArea}
          ref={textAreaRef}
          value={textAreaValue}
          onBlur={onTextAreaBlur}
          onFocus={onTextAreaFocus}
          onChange={onTextAreaChange}
          autoCorrect="off"
          autoCapitalize={autoCapitalize ? undefined : "none"}
        />
      </span>
    </>
  );
}

export default React.memo(StoryContent);
