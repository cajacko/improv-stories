import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";

export interface Props {
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
  tutorialText: string[];
  children?: JSX.Element;
  storyType: "LIVE" | "STANDARD";
}

interface StyleProps {
  showCursor: boolean;
  isTextInvisible: boolean;
  textStyle?: "FADED" | "NORMAL";
}

const width = 500;

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
    paragraphText: {
      color: ({ textStyle }) => (textStyle === "FADED" ? "grey" : "initial"),
    },
    paragraph: {
      whiteSpace: "break-spaces",
      opacity: ({ isTextInvisible }) => (isTextInvisible ? 0 : 1),
    },
    container: {
      maxWidth: width,
      width,
      margin: 20,
      padding: "0 20px 100vh",
    },
  })
);

function StoryContent({
  textAreaRef,
  textAreaValue,
  onTextAreaBlur,
  onTextAreaFocus,
  onTextAreaChange,
  isTextInvisible,
  children,
  storyId,
  editingSessionFinalEntry,
  editingSessionId,
  tutorialText,
  storyType,
}: Props) {
  const fetchStatus = useSelector((state) =>
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(state, {
      storyId,
    })
  );

  const storyParagraphs = useSelector((state) =>
    (storyType === "LIVE"
      ? selectors.misc.selectAllStoryParagraphs
      : selectors.misc.selectAllStandardStoryParagraphs)(state, {
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

  let paragraphs: string[] = [];
  let textStyle: StyleProps["textStyle"] = "NORMAL";
  let cursorPosition: "START" | "END" | undefined;
  let showCursor: boolean = false;

  if (fetchStatus !== null) {
    showCursor = true;

    if (!doesStoryHaveContent || fetchStatus !== "FETCHED_NOW_LISTENING") {
      paragraphs = tutorialText;
      textStyle = "FADED";
      cursorPosition = "START";
    } else {
      paragraphs = storyParagraphs;
      cursorPosition = "END";
    }
  }

  const classes = useStyles({
    showCursor: !!showCursor,
    isTextInvisible: !!isTextInvisible,
    textStyle,
  });

  const lastParagraph = paragraphs[paragraphs.length - 1] as string | undefined;

  const autoCapitalize =
    !lastParagraph ||
    lastParagraph.trim() === "" ||
    lastParagraph.trim().endsWith(".");

  return (
    <div className={classes.container}>
      {paragraphs.map((text, i) => (
        <p key={i} className={classes.paragraph}>
          {cursorPosition === "START" && 0 === i && (
            <span className={classes.cursor} />
          )}
          <span className={classes.paragraphText}>{text}</span>
          {cursorPosition === "END" && paragraphs.length - 1 === i && (
            <span className={classes.cursor} />
          )}
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
          autoCapitalize={autoCapitalize ? "sentences" : "none"}
        />
      </span>
      {children}
    </div>
  );
}

export default React.memo(StoryContent);
