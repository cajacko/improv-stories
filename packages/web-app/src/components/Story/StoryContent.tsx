import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import selectors from "../../store/selectors";
import StorySession from "./StorySession";
import StoryText from "./StoryText";

export interface Props {
  storyId: string;
  tutorialText: string;
  children?: JSX.Element;
  storyType: "LIVE" | "STANDARD";
  isTextInvisible: boolean;
}

const width = 500;

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    container: {
      maxWidth: width,
      width,
      margin: 20,
      padding: "0 20px 100vh",
    },
  })
);

function StoryContent({
  children,
  storyId,
  tutorialText,
  storyType,
  isTextInvisible,
}: Props) {
  const storySessionIds =
    useSelector((state) =>
      selectors.sessionIdsByStoryId.selectStorySessionIds(state, { storyId })
    ) || [];

  const hasSessions = !!storySessionIds.length;

  const classes = useStyles();

  return (
    <div className={classes.container}>
      {hasSessions &&
        storySessionIds.map((sessionId, i) => (
          <StorySession
            key={sessionId}
            isTextInvisible={isTextInvisible}
            storyType={storyType}
            sessionId={sessionId}
            storyId={storyId}
            isLastSession={storySessionIds.length - 1 === i}
            setSessionTextType={
              storyType === "LIVE"
                ? "LIVE_STORY_SET_SESSION_TEXT"
                : "STANDARD_STORY_SET_SESSION_TEXT"
            }
          />
        ))}

      {!hasSessions && (
        <StoryText
          text={tutorialText}
          textStyle="FADED"
          isTextInvisible={isTextInvisible}
        />
      )}

      {children}
    </div>
  );
}

export default React.memo(StoryContent);
