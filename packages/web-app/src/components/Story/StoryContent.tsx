import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import StorySession from "./StorySession";
import StoryText from "./StoryText";

export interface Props {
  storyId: string;
  editingSessionId: string | null;
  editingSessionFinalEntry: string | null;
  canCurrentUserEdit: boolean;
  isTextInvisible?: boolean;
  tutorialText: string;
  children?: JSX.Element;
  storyType: "LIVE" | "STANDARD";
  playingSessionId: string | null;
  playingSessionText: string | null;
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
  isTextInvisible,
  children,
  storyId,
  editingSessionFinalEntry,
  editingSessionId,
  tutorialText,
  storyType,
  playingSessionId,
  playingSessionText,
}: Props) {
  const fetchStatus = useSelector((state) =>
    selectors.storyFetchStateByStoryId.selectStoryFetchStatus(state, {
      storyId,
    })
  );

  const storySessionIds =
    useSelector((state) =>
      selectors.sessionIdsByStoryId.selectStorySessionIds(state, { storyId })
    ) || [];

  const hasSessions = !!storySessionIds.length;

  const storyParagraphs = useSelector((state) =>
    (storyType === "LIVE"
      ? selectors.misc.selectAllStoryParagraphs
      : selectors.misc.selectAllStandardStoryParagraphs)(state, {
      storyId,
      editingSessionId,
      editingSessionFinalEntry,
      playingSessionId,
      playingSessionText,
    })
  );

  const doesStoryHaveContent =
    storyParagraphs &&
    storyParagraphs.length > 0 &&
    !storyParagraphs.every((paragraph) => paragraph === "");

  let textStyle: StyleProps["textStyle"] = "NORMAL";
  let showCursor: boolean = false;

  if (fetchStatus !== null) {
    showCursor = true;

    if (!doesStoryHaveContent || fetchStatus !== "FETCHED_NOW_LISTENING") {
      textStyle = "FADED";
    }
  }

  const classes = useStyles({
    showCursor: !!showCursor,
    isTextInvisible: !!isTextInvisible,
    textStyle,
  });

  return (
    <div className={classes.container}>
      {hasSessions &&
        storySessionIds.map((sessionId) => (
          <StorySession
            key={sessionId}
            sessionId={sessionId}
            storyId={storyId}
          />
        ))}

      {!hasSessions && <StoryText text={tutorialText} textStyle="FADED" />}

      {children}
    </div>
  );
}

export default React.memo(StoryContent);
